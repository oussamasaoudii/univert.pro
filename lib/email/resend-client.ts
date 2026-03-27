import { logger } from "@/lib/utils/errors";

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  tags?: { name: string; value: string }[];
}

export interface EmailResult {
  success: boolean;
  id?: string;
  error?: string;
}

const RESEND_API_URL = "https://api.resend.com/emails";

function getFromAddress(): string {
  const fromName = process.env.EMAIL_FROM_NAME || "Univert";
  const fromEmail = process.env.EMAIL_FROM_ADDRESS || process.env.SENDGRID_FROM_EMAIL || "notifications@univert.pro";
  return `${fromName} <${fromEmail}>`;
}

export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    logger.warn("Resend API key not configured", {
      action: "email_skipped",
      subject: options.subject,
    });
    return { success: false, error: "Email service not configured" };
  }

  try {
    const toAddresses = Array.isArray(options.to) ? options.to : [options.to];

    const response = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: getFromAddress(),
        to: toAddresses,
        subject: options.subject,
        html: options.html,
        text: options.text,
        reply_to: options.replyTo,
        tags: options.tags,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      logger.error("Resend API error", new Error(result.message || "Unknown error"), {
        action: "email_failed",
        status: response.status,
        subject: options.subject,
      });
      return { success: false, error: result.message || "Failed to send email" };
    }

    logger.info("Email sent successfully", {
      action: "email_sent",
      emailId: result.id,
      subject: options.subject,
      recipients: toAddresses.length,
    });

    return { success: true, id: result.id };
  } catch (error) {
    logger.error("Failed to send email", error, {
      action: "email_exception",
      subject: options.subject,
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send email",
    };
  }
}

export async function sendBatchEmails(
  emails: EmailOptions[]
): Promise<EmailResult[]> {
  const results = await Promise.all(emails.map(sendEmail));
  return results;
}
