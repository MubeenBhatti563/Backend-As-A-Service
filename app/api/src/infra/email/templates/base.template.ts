export interface BaseTemplateOptions {
  title: string;
  badgeText: string;
  badgeBg: string;
  badgeColor: string;
  badgeBorder: string;
  heading: string;
  subtitle: string;
  description: string;
  actionText: string;
  actionUrl: string;
  expiryText: string;
  securityNotice: string;
}

/**
 * Modern email layout matching DevStack's dark UI design system:
 * - Deep obsidian background (#0e111a)
 * - Elevated card canvas (#161a24) with slate border (#1E293B)
 * - DevStack brand blue (#2563EB) & cyan (#06B6D4) accents
 * - Fully compatible cross-client HTML table layout
 */
export function renderBaseEmailTemplate(options: BaseTemplateOptions): string {
  const {
    title,
    badgeText,
    badgeBg,
    badgeColor,
    badgeBorder,
    heading,
    subtitle,
    description,
    actionText,
    actionUrl,
    expiryText,
    securityNotice,
  } = options;

  const currentYear = new Date().getFullYear();

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="dark" />
  <meta name="supported-color-schemes" content="dark" />
  <title>${title}</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td, p, a, span { font-family: Arial, sans-serif !important; }
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #0e111a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; color: #F8FAFC;">
  <!-- Outer Wrapper Table -->
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0e111a; width: 100%; min-height: 100%; padding: 40px 16px;">
    <tr>
      <td align="center" style="vertical-align: top;">
        
        <!-- Main Card Container (Max Width 580px) -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; width: 100%; background-color: #161a24; border: 1px solid #1E293B; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 45px -10px rgba(0, 0, 0, 0.65);">
          
          <!-- Top Accent Glow Line -->
          <tr>
            <td height="3" style="background: linear-gradient(90deg, #2563EB 0%, #06B6D4 100%); line-height: 3px; font-size: 1px;">&nbsp;</td>
          </tr>

          <!-- Header / Brand Section -->
          <tr>
            <td style="padding: 32px 36px 24px 36px; border-bottom: 1px solid #1E293B;">
              <table role="presentation" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <!-- Brand Icon -->
                  <td style="vertical-align: middle; padding-right: 14px;">
                    <table role="presentation" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td align="center" style="width: 36px; height: 36px; background-color: #2563EB; border-radius: 8px;">
                          <!-- Tabler/Database icon SVG -->
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display: block; margin: auto;">
                            <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
                            <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
                            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
                          </svg>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <!-- Brand Name -->
                  <td style="vertical-align: middle;">
                    <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 22px; font-weight: 800; color: #FFFFFF; letter-spacing: -0.6px; line-height: 1;">
                      Dev<span style="color: #38BDF8;">Stack</span>
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content Section -->
          <tr>
            <td style="padding: 36px 36px 28px 36px;">

              <!-- Status Badge -->
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 20px;">
                <tr>
                  <td style="background-color: ${badgeBg}; border: 1px solid ${badgeBorder}; border-radius: 9999px; padding: 5px 14px; font-size: 11px; font-weight: 700; color: ${badgeColor}; letter-spacing: 0.8px; text-transform: uppercase;">
                    ${badgeText}
                  </td>
                </tr>
              </table>

              <!-- Headline -->
              <h1 style="margin: 0 0 10px 0; font-size: 26px; font-weight: 700; color: #F8FAFC; letter-spacing: -0.5px; line-height: 1.3;">
                ${heading}
              </h1>

              <!-- Subtitle -->
              <p style="margin: 0 0 20px 0; font-size: 15px; font-weight: 500; color: #CBD5E1; line-height: 1.5;">
                ${subtitle}
              </p>

              <!-- Description -->
              <p style="margin: 0 0 32px 0; font-size: 14px; color: #94A3B8; line-height: 1.65;">
                ${description}
              </p>

              <!-- Primary Action CTA Button -->
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin: 0 0 32px 0;">
                <tr>
                  <td align="center" style="border-radius: 8px; background-color: #2563EB;">
                    <a href="${actionUrl}" target="_blank" style="display: inline-block; padding: 14px 34px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; font-weight: 600; color: #FFFFFF; text-decoration: none; border-radius: 8px; line-height: 1; text-align: center; box-shadow: 0 4px 16px rgba(37, 99, 235, 0.4);">
                      ${actionText} &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Expiry Alert Card -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #111622; border: 1px solid #1E293B; border-radius: 10px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 16px 18px;">
                    <table role="presentation" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="vertical-align: top; padding-right: 12px; font-size: 18px; line-height: 1;">
                          ⏱️
                        </td>
                        <td style="vertical-align: top;">
                          <p style="margin: 0; font-size: 13px; color: #CBD5E1; line-height: 1.5;">
                            ${expiryText}
                          </p>
                          <p style="margin: 6px 0 0 0; font-size: 12px; color: #64748B; line-height: 1.45;">
                            ${securityNotice}
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Fallback Direct Link Section -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding-top: 10px;">
                    <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 600; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px;">
                      Button not working? Paste this link into your browser:
                    </p>
                    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #070B16; border: 1px solid #1E293B; border-radius: 8px;">
                      <tr>
                        <td style="padding: 12px 14px; word-break: break-all; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 12px; color: #38BDF8; line-height: 1.5;">
                          <a href="${actionUrl}" target="_blank" style="color: #38BDF8; text-decoration: none;">${actionUrl}</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer Section -->
          <tr>
            <td style="padding: 24px 36px 32px 36px; border-top: 1px solid #1E293B; background-color: #0e111a;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="text-align: center;">
                    <p style="margin: 0 0 6px 0; font-size: 13px; font-weight: 600; color: #94A3B8;">
                      DevStack — Build Your Backend Without the Busywork
                    </p>
                    <p style="margin: 0 0 12px 0; font-size: 12px; color: #475569;">
                      &copy; ${currentYear} DevStack. All rights reserved.
                    </p>
                    <p style="margin: 0; font-size: 11px; color: #334155; line-height: 1.4;">
                      This is an automated administrative notification sent to you by DevStack. Please do not reply directly to this email.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
        <!-- End Main Card Container -->

      </td>
    </tr>
  </table>
  <!-- End Outer Wrapper Table -->
</body>
</html>`;
}
