import { logger } from "@/lib/utils/errors";

type PasswordResetEmailInput = {
  email: string;
  resetUrl: string;
  expiresInMinutes: number;
};

function buildHtml(input: PasswordResetEmailInput) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#111827">
      <h1 style="font-size:24px;margin-bottom:16px">Reset your password</h1>
      <p style="font-size:16px;line-height:1.6">
        We received a request to reset the password for ${input.email}.
      </p>
      <p style="font-size:16px;line-height:1.6">
        This link expires in ${input.expiresInMinutes} minutes and can only be used once.
      </p>
      <p style="margin:24px 0">
        <a href="${input.resetUrl}" style="background:#111827;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none;display:inline-block">
          Reset password
        </a>
      </p>
      <p style="font-size:14px;line-height:1.6;color:#6b7280">
        If you did not request this, you can ignore this email.
      </p>
    </div>
  `;
}

export async function sendPasswordResetEmail(input: PasswordResetEmailInput): Promise<boolean> {
  const provider = process.env.EMAIL_PROVIDER;

  try {
    if (provider === "resend" && process.env.RESEND_API_KEY) {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.SENDGRID_FROM_EMAIL || "security@univert.pro",
          to: [input.email],
          subject: "Reset your password",
          html: buildHtml(input),
        }),
      });

      return response.ok;
    }

    if (
      provider === "sendgrid" &&
      process.env.SENDGRID_API_KEY &&
      process.env.SENDGRID_FROM_EMAIL
    ) {
      const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: input.email }] }],
          from: { email: process.env.SENDGRID_FROM_EMAIL },
          subject: "Reset your password",
          content: [{ type: "text/html", value: buildHtml(input) }],
        }),
      });

      return response.ok;
    }

    logger.warn("Password reset email provider is not configured", {
      action: "password_reset_email_skipped",
    });
    return false;
  } catch (error) {
    logger.error("Failed to send password reset email", error, {
      action: "password_reset_email_failed",
    });
    return false;
  }
}
