import {
  baseTemplate,
  buttonStyle,
  headingStyle,
  paragraphStyle,
  smallTextStyle,
} from "./base";

export interface TrialEndingProps {
  userName: string;
  daysRemaining: number;
  trialEndDate: string;
  planName: string;
}

export function trialEndingTemplate(props: TrialEndingProps): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://univert.pro";

  const urgencyColor =
    props.daysRemaining <= 1
      ? "#dc2626"
      : props.daysRemaining <= 3
        ? "#ea580c"
        : "#ca8a04";

  const content = `
    <h1 style="${headingStyle()}">Your Trial is Ending Soon</h1>
    
    <p style="${paragraphStyle()}">
      Hi ${props.userName || "there"},
    </p>
    
    <p style="${paragraphStyle()}">
      Your Univert trial ends in <strong style="color:${urgencyColor};">${props.daysRemaining} day${props.daysRemaining === 1 ? "" : "s"}</strong> on ${props.trialEndDate}.
    </p>
    
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:24px 0;background-color:#fef3c7;border-radius:8px;border:1px solid #fcd34d;">
      <tr>
        <td style="padding:20px;">
          <p style="margin:0;${smallTextStyle()}color:#92400e;">
            <strong>What happens when your trial ends?</strong><br>
            Your websites will continue to run, but you won&apos;t be able to make changes or deploy new sites until you upgrade to a paid plan.
          </p>
        </td>
      </tr>
    </table>
    
    <p style="${paragraphStyle()}">
      Upgrade now to keep all your features and continue building amazing websites:
    </p>
    
    <p style="margin:32px 0;text-align:center;">
      <a href="${appUrl}/dashboard/billing/upgrade" style="${buttonStyle()}">
        Upgrade Now
      </a>
    </p>
    
    <p style="${paragraphStyle()}">
      Not ready to upgrade? No worries! You can always come back when you&apos;re ready. Your data will be preserved for 30 days after your trial ends.
    </p>
    
    <p style="${paragraphStyle()}">
      Have questions? Just reply to this email - we&apos;re here to help!
    </p>
    
    <p style="${paragraphStyle()}">
      Best,<br>
      The Univert Team
    </p>
  `;

  return baseTemplate(
    content,
    `Your trial ends in ${props.daysRemaining} days. Upgrade now to keep your features.`
  );
}

export function trialEndingSubject(daysRemaining: number): string {
  if (daysRemaining <= 1) {
    return "Your trial ends tomorrow - Upgrade now";
  }
  return `Your trial ends in ${daysRemaining} days`;
}
