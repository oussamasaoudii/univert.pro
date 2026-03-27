import { sendEmail, type EmailResult } from "./resend-client";
import {
  welcomeEmailTemplate,
  welcomeEmailSubject,
  type WelcomeEmailProps,
} from "./templates/welcome";
import {
  subscriptionConfirmationTemplate,
  subscriptionConfirmationSubject,
  type SubscriptionConfirmationProps,
} from "./templates/subscription-confirmation";
import {
  trialEndingTemplate,
  trialEndingSubject,
  type TrialEndingProps,
} from "./templates/trial-ending";
import {
  invoiceEmailTemplate,
  invoiceEmailSubject,
  type InvoiceEmailProps,
} from "./templates/invoice";
import { logger } from "@/lib/utils/errors";

export type EmailType =
  | "welcome"
  | "subscription_confirmation"
  | "trial_ending"
  | "invoice"
  | "password_reset";

// Re-export for convenience
export { sendEmail } from "./resend-client";
export type { EmailResult } from "./resend-client";

export async function sendWelcomeEmail(
  email: string,
  props: WelcomeEmailProps
): Promise<EmailResult> {
  logger.info("Sending welcome email", { action: "send_welcome_email", email });

  return sendEmail({
    to: email,
    subject: welcomeEmailSubject(),
    html: welcomeEmailTemplate(props),
    tags: [{ name: "type", value: "welcome" }],
  });
}

export async function sendSubscriptionConfirmationEmail(
  email: string,
  props: SubscriptionConfirmationProps
): Promise<EmailResult> {
  logger.info("Sending subscription confirmation email", {
    action: "send_subscription_confirmation",
    email,
    plan: props.planName,
  });

  return sendEmail({
    to: email,
    subject: subscriptionConfirmationSubject(props.planName),
    html: subscriptionConfirmationTemplate(props),
    tags: [
      { name: "type", value: "subscription_confirmation" },
      { name: "plan", value: props.planName },
    ],
  });
}

export async function sendTrialEndingEmail(
  email: string,
  props: TrialEndingProps
): Promise<EmailResult> {
  logger.info("Sending trial ending email", {
    action: "send_trial_ending",
    email,
    daysRemaining: props.daysRemaining,
  });

  return sendEmail({
    to: email,
    subject: trialEndingSubject(props.daysRemaining),
    html: trialEndingTemplate(props),
    tags: [
      { name: "type", value: "trial_ending" },
      { name: "days_remaining", value: String(props.daysRemaining) },
    ],
  });
}

export async function sendInvoiceEmail(
  email: string,
  props: InvoiceEmailProps
): Promise<EmailResult> {
  logger.info("Sending invoice email", {
    action: "send_invoice",
    email,
    invoiceNumber: props.invoiceNumber,
    isPaid: props.isPaid,
  });

  return sendEmail({
    to: email,
    subject: invoiceEmailSubject(props.invoiceNumber, props.isPaid),
    html: invoiceEmailTemplate(props),
    tags: [
      { name: "type", value: "invoice" },
      { name: "invoice_number", value: props.invoiceNumber },
      { name: "status", value: props.isPaid ? "paid" : "pending" },
    ],
  });
}
