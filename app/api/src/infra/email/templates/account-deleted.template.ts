export interface AccountDeletedEmailTemplateResult {
  subject: string;
  html: string;
  text: string;
}

export function getAccountDeletedEmailTemplate(): AccountDeletedEmailTemplateResult {
  const subject = 'Your DevStack account has been deleted';
  const text =
    'Your DevStack account and associated account records have been permanently deleted. If you did not request this, please contact DevStack support.';
  const html = `<!doctype html>
<html lang="en">
  <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${subject}</title></head>
  <body style="margin:0;padding:32px;background:#0e111a;color:#f8fafc;font-family:Arial,sans-serif">
    <main style="max-width:560px;margin:0 auto;padding:32px;background:#161a24;border:1px solid #1e293b;border-radius:12px">
      <p style="color:#38bdf8;font-size:12px;font-weight:bold;letter-spacing:1px">DEVSTACK ACCOUNT NOTICE</p>
      <h1 style="font-size:24px">Your account has been deleted</h1>
      <p style="color:#cbd5e1;line-height:1.6">Your DevStack account and associated account records have been permanently deleted.</p>
      <p style="color:#94a3b8;line-height:1.6">If you did not request this change, please contact DevStack support.</p>
      <p style="margin-top:32px;color:#64748b;font-size:12px">This is an automated notification. Please do not reply directly.</p>
    </main>
  </body>
</html>`;

  return { subject, html, text };
}
