import { type NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import {
  getAuthorizationUrl,
  isProviderConfigured,
  type OAuthProvider,
} from "@/lib/auth/oauth-providers";

const VALID_PROVIDERS = ["google", "github"] as const;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;

  // Validate provider
  if (!VALID_PROVIDERS.includes(provider as any)) {
    return NextResponse.json(
      { error: "Invalid OAuth provider" },
      { status: 400 }
    );
  }

  const oauthProvider = provider as OAuthProvider;

  // Check if provider is configured
  if (!isProviderConfigured(oauthProvider)) {
    return NextResponse.json(
      { error: `${provider} OAuth is not configured` },
      { status: 400 }
    );
  }

  // Generate state for CSRF protection
  const state = randomUUID();

  // Store state in cookie for verification
  const cookieStore = await cookies();
  cookieStore.set("oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10, // 10 minutes
  });

  // Get the return URL from query params
  const returnUrl = request.nextUrl.searchParams.get("returnUrl") || "/dashboard";
  cookieStore.set("oauth_return_url", returnUrl, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10,
  });

  // Generate authorization URL
  const authUrl = getAuthorizationUrl(oauthProvider, state);

  if (!authUrl) {
    return NextResponse.json(
      { error: "Failed to generate authorization URL" },
      { status: 500 }
    );
  }

  return NextResponse.redirect(authUrl);
}
