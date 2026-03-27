import {
  baseTemplate,
  buttonStyle,
  headingStyle,
  paragraphStyle,
  smallTextStyle,
} from "./base";

export interface InvoiceEmailProps {
  userName: string;
  invoiceNumber: string;
  invoiceDate: string;
  amount: string;
  currency: string;
  planName: string;
  billingPeriod: string;
  invoiceUrl: string;
  isPaid: boolean;
}

export function invoiceEmailTemplate(props: InvoiceEmailProps): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://univert.pro";

  const statusBadge = props.isPaid
    ? `<span style="display:inline-block;background-color:#dcfce7;color:#166534;padding:4px 12px;border-radius:9999px;font-size:12px;font-weight:500;">Paid</span>`
    : `<span style="display:inline-block;background-color:#fef3c7;color:#92400e;padding:4px 12px;border-radius:9999px;font-size:12px;font-weight:500;">Payment Due</span>`;

  const content = `
    <h1 style="${headingStyle()}">
      ${props.isPaid ? "Your Invoice" : "Payment Required"}
    </h1>
    
    <p style="${paragraphStyle()}">
      Hi ${props.userName || "there"},
    </p>
    
    <p style="${paragraphStyle()}">
      ${
        props.isPaid
          ? "Thank you for your payment. Here's your invoice for your records."
          : "Please find your invoice below. Payment is due upon receipt."
      }
    </p>
    
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:24px 0;background-color:#fafafa;border-radius:8px;border:1px solid #e4e4e7;">
      <tr>
        <td style="padding:20px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
            <tr>
              <td style="padding:8px 0;border-bottom:1px solid #e4e4e7;">
                <span style="${smallTextStyle()}">Invoice Number</span>
              </td>
              <td style="padding:8px 0;border-bottom:1px solid #e4e4e7;text-align:right;">
                <strong style="color:#18181b;">${props.invoiceNumber}</strong>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 0;border-bottom:1px solid #e4e4e7;">
                <span style="${smallTextStyle()}">Date</span>
              </td>
              <td style="padding:8px 0;border-bottom:1px solid #e4e4e7;text-align:right;">
                <strong style="color:#18181b;">${props.invoiceDate}</strong>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 0;border-bottom:1px solid #e4e4e7;">
                <span style="${smallTextStyle()}">Description</span>
              </td>
              <td style="padding:8px 0;border-bottom:1px solid #e4e4e7;text-align:right;">
                <strong style="color:#18181b;">${props.planName} (${props.billingPeriod})</strong>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 0;border-bottom:1px solid #e4e4e7;">
                <span style="${smallTextStyle()}">Amount</span>
              </td>
              <td style="padding:8px 0;border-bottom:1px solid #e4e4e7;text-align:right;">
                <strong style="color:#18181b;font-size:18px;">${props.currency}${props.amount}</strong>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 0;">
                <span style="${smallTextStyle()}">Status</span>
              </td>
              <td style="padding:8px 0;text-align:right;">
                ${statusBadge}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    
    <p style="margin:32px 0;text-align:center;">
      <a href="${props.invoiceUrl}" style="${buttonStyle()}">
        ${props.isPaid ? "Download Invoice" : "Pay Now"}
      </a>
    </p>
    
    <p style="${paragraphStyle()}">
      You can view all your invoices in your
      <a href="${appUrl}/dashboard/billing" style="color:#18181b;text-decoration:underline;">billing settings</a>.
    </p>
    
    <p style="${paragraphStyle()}">
      Questions about your invoice? Just reply to this email.
    </p>
    
    <p style="${paragraphStyle()}">
      Best,<br>
      The Univert Team
    </p>
  `;

  return baseTemplate(
    content,
    props.isPaid
      ? `Invoice ${props.invoiceNumber} - ${props.currency}${props.amount}`
      : `Payment due: ${props.currency}${props.amount} for your Univert subscription`
  );
}

export function invoiceEmailSubject(
  invoiceNumber: string,
  isPaid: boolean
): string {
  return isPaid
    ? `Invoice ${invoiceNumber} - Payment Received`
    : `Invoice ${invoiceNumber} - Payment Required`;
}
