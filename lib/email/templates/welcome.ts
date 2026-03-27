import {
  baseTemplate,
  buttonStyle,
  headingStyle,
  paragraphStyle,
} from "./base";

export interface WelcomeEmailProps {
  userName: string;
  email: string;
  dashboardUrl?: string;
}

export function welcomeEmailTemplate(props: WelcomeEmailProps): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://univert.pro";
  const dashboardUrl = props.dashboardUrl || `${appUrl}/dashboard`;

  const content = `
    <h1 style="${headingStyle()}">Welcome to Univert, ${props.userName || "there"}!</h1>
    
    <p style="${paragraphStyle()}">
      Thank you for creating your account. We&apos;re excited to have you on board and can&apos;t wait to see what you build.
    </p>
    
    <p style="${paragraphStyle()}">
      With Univert, you can:
    </p>
    
    <ul style="margin:0 0 24px;padding-left:20px;color:#3f3f46;">
      <li style="margin-bottom:8px;">Deploy and manage websites with ease</li>
      <li style="margin-bottom:8px;">Monitor performance and uptime</li>
      <li style="margin-bottom:8px;">Set up custom domains and SSL certificates</li>
      <li style="margin-bottom:8px;">Scale your infrastructure as you grow</li>
    </ul>
    
    <p style="margin:32px 0;text-align:center;">
      <a href="${dashboardUrl}" style="${buttonStyle()}">
        Go to Dashboard
      </a>
    </p>
    
    <p style="${paragraphStyle()}">
      If you have any questions, just reply to this email or check out our
      <a href="${appUrl}/docs" style="color:#18181b;text-decoration:underline;">documentation</a>.
    </p>
    
    <p style="${paragraphStyle()}">
      Happy building!<br>
      The Univert Team
    </p>
  `;

  return baseTemplate(content, "Welcome to Univert! Get started with your dashboard.");
}

export function welcomeEmailSubject(): string {
  return "Welcome to Univert - Let's get started!";
}
