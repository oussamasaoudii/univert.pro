import {
  baseTemplate,
  buttonStyle,
  headingStyle,
  paragraphStyle,
  smallTextStyle,
} from "./base";

export interface SubscriptionConfirmationProps {
  userName: string;
  planName: string;
  amount: string;
  currency: string;
  billingPeriod: "monthly" | "yearly";
  nextBillingDate: string;
  invoiceUrl?: string;
}

export function subscriptionConfirmationTemplate(
  props: SubscriptionConfirmationProps
): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://univert.pro";

  const content = `
    <h1 style="${headingStyle()}">Subscription Confirmed!</h1>
    
    <p style="${paragraphStyle()}">
      Hi ${props.userName || "there"},
    </p>
    
    <p style="${paragraphStyle()}">
      Thank you for subscribing to Univert <strong>${props.planName}</strong>. Your payment has been processed successfully.
    </p>
    
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:24px 0;background-color:#fafafa;border-radius:8px;border:1px solid #e4e4e7;">
      <tr>
        <td style="padding:20px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
            <tr>
              <td style="padding:8px 0;border-bottom:1px solid #e4e4e7;">
                <span style="${smallTextStyle()}">Plan</span>
              </td>
              <td style="padding:8px 0;border-bottom:1px solid #e4e4e7;text-align:right;">
                <strong style="color:#18181b;">${props.planName}</strong>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 0;border-bottom:1px solid #e4e4e7;">
                <span style="${smallTextStyle()}">Amount</span>
              </td>
              <td style="padding:8px 0;border-bottom:1px solid #e4e4e7;text-align:right;">
                <strong style="color:#18181b;">${props.currency}${props.amount}/${props.billingPeriod === "monthly" ? "mo" : "yr"}</strong>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 0;">
                <span style="${smallTextStyle()}">Next Billing</span>
              </td>
              <td style="padding:8px 0;text-align:right;">
                <strong style="color:#18181b;">${props.nextBillingDate}</strong>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    
    ${
      props.invoiceUrl
        ? `
    <p style="margin:24px 0;text-align:center;">
      <a href="${props.invoiceUrl}" style="${buttonStyle()}">
        View Invoice
      </a>
    </p>
    `
        : ""
    }
    
    <p style="${paragraphStyle()}">
      You can manage your subscription anytime from your
      <a href="${appUrl}/dashboard/billing" style="color:#18181b;text-decoration:underline;">billing settings</a>.
    </p>
    
    <p style="${paragraphStyle()}">
      Thank you for choosing Univert!<br>
      The Univert Team
    </p>
  `;

  return baseTemplate(
    content,
    `Your ${props.planName} subscription is now active.`
  );
}

export function subscriptionConfirmationSubject(planName: string): string {
  return `Your ${planName} subscription is now active`;
}
