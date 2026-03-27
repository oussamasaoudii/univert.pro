import { sendEmail, type EmailResult } from "./resend-client";
import {
  baseTemplate,
  buttonStyle,
  headingStyle,
  paragraphStyle,
  smallTextStyle,
} from "./templates/base";
import { logger } from "@/lib/utils/errors";

type PasswordResetEmailInput = {
  email: string;
  resetUrl: string;
  expiresInMinutes: number;
};

function buildPasswordResetHtml(input: PasswordResetEmailInput): string {
  const content = `
    <h1 style="${headingStyle()}">Reset Your Password</h1>
    
    <p style="${paragraphStyle()}">
      We received a request to reset the password for <strong>${input.email}</strong>.
    </p>
    
    <p style="${paragraphStyle()}">
      Click the button below to create a new password. This link will expire in ${input.expiresInMinutes} minutes.
    </p>
    
    <p style="margin:32px 0;text-align:center;">
      <a href="${input.resetUrl}" style="${buttonStyle()}">
        Reset Password
      </a>
    </p>
    
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:24px 0;background-color:#fef3c7;border-radius:8px;border:1px solid #fcd34d;">
      <tr>
        <td style="padding:16px;">
          <p style="margin:0;${smallTextStyle()}color:#92400e;">
            <strong>Didn&apos;t request this?</strong><br>
            If you didn&apos;t request a password reset, you can safely ignore this email. Your password will remain unchanged.
          </p>
        </td>
      </tr>
    </table>
    
    <p style="${smallTextStyle()}">
      If the button doesn&apos;t work, copy and paste this link into your browser:<br>
      <a href="${input.resetUrl}" style="color:#71717a;word-break:break-all;">${input.resetUrl}</a>
    </p>
  `;

  return baseTemplate(
    content,
    "Reset your password - This link expires in " + input.expiresInMinutes + " minutes"
  );
}

export async function sendPasswordResetEmail(
  input: PasswordResetEmailInput
): Promise<boolean> {
  logger.info("Sending password reset email", {
    action: "send_password_reset",
    email: input.email,
    expiresInMinutes: input.expiresInMinutes,
  });

  const result: EmailResult = await sendEmail({
    to: input.email,
    subject: "Reset Your Password",
    html: buildPasswordResetHtml(input),
    tags: [{ name: "type", value: "password_reset" }],
  });

  return result.success;
}
