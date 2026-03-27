export interface BaseTemplateProps {
  previewText?: string;
}

export function baseTemplate(content: string, previewText?: string): string {
  const year = new Date().getFullYear();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://univert.pro";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Univert</title>
  ${previewText ? `<!--[if !mso]><!--><span style="display:none;font-size:1px;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;mso-hide:all;">${previewText}</span><!--<![endif]-->` : ""}
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background-color:#f4f4f5;color:#18181b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f4f4f5;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:560px;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px 0 rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding:32px 32px 24px;text-align:center;border-bottom:1px solid #e4e4e7;">
              <a href="${appUrl}" style="text-decoration:none;">
                <span style="font-size:24px;font-weight:700;color:#18181b;">Univert</span>
              </a>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:32px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 32px;background-color:#fafafa;border-top:1px solid #e4e4e7;">
              <p style="margin:0 0 8px;font-size:13px;color:#71717a;text-align:center;">
                &copy; ${year} Univert. All rights reserved.
              </p>
              <p style="margin:0;font-size:13px;color:#a1a1aa;text-align:center;">
                <a href="${appUrl}/legal/privacy" style="color:#71717a;text-decoration:underline;">Privacy Policy</a>
                &nbsp;&bull;&nbsp;
                <a href="${appUrl}/legal/terms" style="color:#71717a;text-decoration:underline;">Terms of Service</a>
                &nbsp;&bull;&nbsp;
                <a href="${appUrl}/dashboard/settings" style="color:#71717a;text-decoration:underline;">Email Preferences</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export function buttonStyle(): string {
  return "display:inline-block;background-color:#18181b;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:500;font-size:14px;";
}

export function headingStyle(): string {
  return "margin:0 0 16px;font-size:24px;font-weight:600;color:#18181b;line-height:1.3;";
}

export function paragraphStyle(): string {
  return "margin:0 0 16px;font-size:16px;line-height:1.6;color:#3f3f46;";
}

export function smallTextStyle(): string {
  return "font-size:14px;line-height:1.5;color:#71717a;";
}
