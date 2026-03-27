import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  exchangeCodeForTokens,
  fetchUserInfo,
  findOrCreateUserFromOAuth,
  isProviderConfigured,
  type OAuthProvider,
} from "@/lib/auth/oauth-providers";
import { createSessionForUser } from "@/lib/security/session-cookies";
import { sendWelcomeEmail } from "@/lib/email/send";
import { findUserById } from "@/lib/mysql/users";

const VALID_PROVIDERS = ["google", "github"] as const;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Validate provider
  if (!VALID_PROVIDERS.includes(provider as any)) {
    return NextResponse.redirect(
      `${appUrl}/auth/login?error=invalid_provider`
    );
  }

  const oauthProvider = provider as OAuthProvider;

  // Check if provider is configured
  if (!isProviderConfigured(oauthProvider)) {
    return NextResponse.redirect(
      `${appUrl}/auth/login?error=provider_not_configured`
    );
  }

  // Get code and state from query params
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const error = request.nextUrl.searchParams.get("error");

  if (error) {
    console.error("OAuth error:", error);
    return NextResponse.redirect(
      `${appUrl}/auth/login?error=oauth_denied`
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      `${appUrl}/auth/login?error=missing_code`
    );
  }

  // Verify state for CSRF protection
  const cookieStore = await cookies();
  const storedState = cookieStore.get("oauth_state")?.value;
  const returnUrl = cookieStore.get("oauth_return_url")?.value || "/dashboard";

  // Clean up cookies
  cookieStore.delete("oauth_state");
  cookieStore.delete("oauth_return_url");

  if (!storedState || state !== storedState) {
    return NextResponse.redirect(
      `${appUrl}/auth/login?error=invalid_state`
    );
  }

  // Exchange code for tokens
  const tokens = await exchangeCodeForTokens(oauthProvider, code);

  if (!tokens) {
    return NextResponse.redirect(
      `${appUrl}/auth/login?error=token_exchange_failed`
    );
  }

  // Fetch user info
  const userInfo = await fetchUserInfo(oauthProvider, tokens.accessToken);

  if (!userInfo || !userInfo.email) {
    return NextResponse.redirect(
      `${appUrl}/auth/login?error=userinfo_failed`
    );
  }

  // Find or create user
  const result = await findOrCreateUserFromOAuth(oauthProvider, userInfo, tokens);

  if (!result) {
    return NextResponse.redirect(
      `${appUrl}/auth/login?error=user_creation_failed`
    );
  }

  // Create session
  const user = await findUserById(result.userId);
  if (!user) {
    return NextResponse.redirect(
      `${appUrl}/auth/login?error=user_not_found`
    );
  }

  await createSessionForUser({
    id: user.id,
    email: user.email,
    role: user.role,
    status: user.status,
    sessionVersion: user.sessionVersion,
  });

  // Send welcome email for new users
  if (result.isNewUser) {
    await sendWelcomeEmail(user.email, {
      userName: user.fullName || userInfo.name || "there",
      email: user.email,
    });
  }

  // Redirect to return URL
  return NextResponse.redirect(`${appUrl}${returnUrl}`);
}
