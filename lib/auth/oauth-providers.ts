import { randomUUID, createHash } from "node:crypto";
import { getMySQLPool } from "@/lib/mysql/pool";
import { createPendingUser, findUserByEmail, findUserById } from "@/lib/mysql/users";
import { logger } from "@/lib/utils/errors";

export type OAuthProvider = "google" | "github";

export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  authorizationUrl: string;
  tokenUrl: string;
  userInfoUrl: string;
  scope: string;
}

export interface OAuthUserInfo {
  id: string;
  email: string;
  name?: string;
  picture?: string;
}

export interface OAuthAccount {
  id: string;
  userId: string;
  provider: OAuthProvider;
  providerUserId: string;
  providerEmail: string | null;
  createdAt: string;
}

function getProviderConfig(provider: OAuthProvider): OAuthConfig | null {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (provider === "google") {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return null;
    }

    return {
      clientId,
      clientSecret,
      redirectUri: `${appUrl}/api/auth/oauth/google/callback`,
      authorizationUrl: "https://accounts.google.com/o/oauth2/v2/auth",
      tokenUrl: "https://oauth2.googleapis.com/token",
      userInfoUrl: "https://www.googleapis.com/oauth2/v2/userinfo",
      scope: "openid email profile",
    };
  }

  if (provider === "github") {
    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return null;
    }

    return {
      clientId,
      clientSecret,
      redirectUri: `${appUrl}/api/auth/oauth/github/callback`,
      authorizationUrl: "https://github.com/login/oauth/authorize",
      tokenUrl: "https://github.com/login/oauth/access_token",
      userInfoUrl: "https://api.github.com/user",
      scope: "read:user user:email",
    };
  }

  return null;
}

export function isProviderConfigured(provider: OAuthProvider): boolean {
  return getProviderConfig(provider) !== null;
}

export function getAuthorizationUrl(provider: OAuthProvider, state: string): string | null {
  const config = getProviderConfig(provider);
  if (!config) {
    return null;
  }

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    scope: config.scope,
    state,
    response_type: "code",
  });

  // Google-specific params
  if (provider === "google") {
    params.set("access_type", "offline");
    params.set("prompt", "consent");
  }

  return `${config.authorizationUrl}?${params.toString()}`;
}

export async function exchangeCodeForTokens(
  provider: OAuthProvider,
  code: string
): Promise<{ accessToken: string; refreshToken?: string; expiresIn?: number } | null> {
  const config = getProviderConfig(provider);
  if (!config) {
    return null;
  }

  try {
    const response = await fetch(config.tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        code,
        redirect_uri: config.redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.access_token) {
      logger.error("OAuth token exchange failed", new Error(data.error_description || "Unknown error"), {
        action: "oauth_token_exchange_failed",
        provider,
      });
      return null;
    }

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
    };
  } catch (error) {
    logger.error("OAuth token exchange error", error, {
      action: "oauth_token_exchange_error",
      provider,
    });
    return null;
  }
}

export async function fetchUserInfo(
  provider: OAuthProvider,
  accessToken: string
): Promise<OAuthUserInfo | null> {
  const config = getProviderConfig(provider);
  if (!config) {
    return null;
  }

  try {
    const response = await fetch(config.userInfoUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      logger.error("OAuth user info fetch failed", new Error(data.error || "Unknown error"), {
        action: "oauth_userinfo_failed",
        provider,
      });
      return null;
    }

    // GitHub needs a separate request for email if not public
    if (provider === "github" && !data.email) {
      const emailResponse = await fetch("https://api.github.com/user/emails", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      });
      const emails = await emailResponse.json();
      const primaryEmail = emails.find((e: any) => e.primary && e.verified);
      if (primaryEmail) {
        data.email = primaryEmail.email;
      }
    }

    return {
      id: String(data.id),
      email: data.email,
      name: data.name || data.login,
      picture: data.picture || data.avatar_url,
    };
  } catch (error) {
    logger.error("OAuth user info fetch error", error, {
      action: "oauth_userinfo_error",
      provider,
    });
    return null;
  }
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function findOAuthAccount(
  provider: OAuthProvider,
  providerUserId: string
): Promise<OAuthAccount | null> {
  try {
    const pool = getMySQLPool();
    const [rows] = await pool.query<any[]>(
      `
        SELECT id, user_id, provider, provider_user_id, provider_email, created_at
        FROM oauth_accounts
        WHERE provider = ? AND provider_user_id = ?
        LIMIT 1
      `,
      [provider, providerUserId]
    );

    if (!rows[0]) {
      return null;
    }

    return {
      id: rows[0].id,
      userId: rows[0].user_id,
      provider: rows[0].provider,
      providerUserId: rows[0].provider_user_id,
      providerEmail: rows[0].provider_email,
      createdAt: rows[0].created_at,
    };
  } catch (error) {
    logger.error("Find OAuth account error", error, {
      action: "oauth_find_account_error",
      provider,
    });
    return null;
  }
}

export async function linkOAuthAccount(
  userId: string,
  provider: OAuthProvider,
  providerUserId: string,
  providerEmail: string | null,
  accessToken: string,
  refreshToken?: string,
  expiresIn?: number
): Promise<OAuthAccount | null> {
  try {
    const pool = getMySQLPool();
    const id = randomUUID();
    const tokenExpiresAt = expiresIn
      ? new Date(Date.now() + expiresIn * 1000).toISOString()
      : null;

    await pool.query(
      `
        INSERT INTO oauth_accounts (
          id, user_id, provider, provider_user_id, provider_email,
          access_token_hash, refresh_token_hash, token_expires_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          provider_email = VALUES(provider_email),
          access_token_hash = VALUES(access_token_hash),
          refresh_token_hash = VALUES(refresh_token_hash),
          token_expires_at = VALUES(token_expires_at),
          updated_at = NOW()
      `,
      [
        id,
        userId,
        provider,
        providerUserId,
        providerEmail,
        hashToken(accessToken),
        refreshToken ? hashToken(refreshToken) : null,
        tokenExpiresAt,
      ]
    );

    logger.info("OAuth account linked", {
      action: "oauth_account_linked",
      userId,
      provider,
    });

    return {
      id,
      userId,
      provider,
      providerUserId,
      providerEmail,
      createdAt: new Date().toISOString(),
    };
  } catch (error) {
    logger.error("Link OAuth account error", error, {
      action: "oauth_link_account_error",
      provider,
    });
    return null;
  }
}

export async function findOrCreateUserFromOAuth(
  provider: OAuthProvider,
  userInfo: OAuthUserInfo,
  tokens: { accessToken: string; refreshToken?: string; expiresIn?: number }
): Promise<{ userId: string; isNewUser: boolean } | null> {
  // First, check if OAuth account already exists
  const existingOAuthAccount = await findOAuthAccount(provider, userInfo.id);

  if (existingOAuthAccount) {
    // Update tokens
    await linkOAuthAccount(
      existingOAuthAccount.userId,
      provider,
      userInfo.id,
      userInfo.email,
      tokens.accessToken,
      tokens.refreshToken,
      tokens.expiresIn
    );
    return { userId: existingOAuthAccount.userId, isNewUser: false };
  }

  // Check if user with this email already exists
  if (userInfo.email) {
    const existingUser = await findUserByEmail(userInfo.email);

    if (existingUser) {
      // Link OAuth to existing user
      await linkOAuthAccount(
        existingUser.id,
        provider,
        userInfo.id,
        userInfo.email,
        tokens.accessToken,
        tokens.refreshToken,
        tokens.expiresIn
      );
      return { userId: existingUser.id, isNewUser: false };
    }
  }

  // Create new user
  if (!userInfo.email) {
    logger.error("Cannot create user without email", null, {
      action: "oauth_no_email",
      provider,
    });
    return null;
  }

  // Generate a random password for OAuth users (they won't use it)
  const randomPassword = randomUUID() + "Aa1!";

  const result = await createPendingUser({
    email: userInfo.email,
    password: randomPassword,
    fullName: userInfo.name,
  });

  if (result.error || !result.user) {
    logger.error("Failed to create user from OAuth", null, {
      action: "oauth_create_user_failed",
      provider,
      error: result.error,
    });
    return null;
  }

  // Link OAuth account to new user
  await linkOAuthAccount(
    result.user.id,
    provider,
    userInfo.id,
    userInfo.email,
    tokens.accessToken,
    tokens.refreshToken,
    tokens.expiresIn
  );

  // Activate the user (OAuth users are pre-verified)
  const pool = getMySQLPool();
  await pool.query(
    `UPDATE users SET status = 'active', email_verified = 1 WHERE id = ?`,
    [result.user.id]
  );

  logger.info("User created from OAuth", {
    action: "oauth_user_created",
    userId: result.user.id,
    provider,
  });

  return { userId: result.user.id, isNewUser: true };
}

export async function getUserOAuthAccounts(userId: string): Promise<OAuthAccount[]> {
  try {
    const pool = getMySQLPool();
    const [rows] = await pool.query<any[]>(
      `
        SELECT id, user_id, provider, provider_user_id, provider_email, created_at
        FROM oauth_accounts
        WHERE user_id = ?
        ORDER BY created_at DESC
      `,
      [userId]
    );

    return rows.map((row) => ({
      id: row.id,
      userId: row.user_id,
      provider: row.provider,
      providerUserId: row.provider_user_id,
      providerEmail: row.provider_email,
      createdAt: row.created_at,
    }));
  } catch (error) {
    logger.error("Get user OAuth accounts error", error, {
      action: "oauth_get_accounts_error",
      userId,
    });
    return [];
  }
}

export async function unlinkOAuthAccount(
  userId: string,
  provider: OAuthProvider
): Promise<boolean> {
  try {
    const pool = getMySQLPool();
    await pool.query(
      "DELETE FROM oauth_accounts WHERE user_id = ? AND provider = ?",
      [userId, provider]
    );

    logger.info("OAuth account unlinked", {
      action: "oauth_account_unlinked",
      userId,
      provider,
    });

    return true;
  } catch (error) {
    logger.error("Unlink OAuth account error", error, {
      action: "oauth_unlink_error",
      userId,
      provider,
    });
    return false;
  }
}
