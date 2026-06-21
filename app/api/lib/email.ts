import nodemailer from "nodemailer";

// Simple configure logic using environment variables
const smtpHost = process.env.SMTP_HOST || "";
const smtpPort = parseInt(process.env.SMTP_PORT || "587");
const smtpUser = process.env.SMTP_USER || "";
const smtpPass = process.env.SMTP_PASS || "";

let transporter: nodemailer.Transporter | null = null;

if (smtpHost && smtpUser && smtpPass) {
  transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465, // true for 465, false for other ports
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });
}

export function buildHtmlEmail(title: string, contentHtml: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6; color: #333333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%); color: #ffffff; padding: 24px 32px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 600; letter-spacing: 0.5px; }
    .content { padding: 32px; line-height: 1.6; font-size: 15px; color: #475569; }
    .content h2 { color: #1e293b; font-size: 20px; margin-top: 0; margin-bottom: 16px; }
    .footer { background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 32px; text-align: center; font-size: 13px; color: #64748b; }
    .button { display: inline-block; padding: 12px 24px; background-color: #06b6d4; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 500; margin-top: 24px; }
    .highlight-box { background-color: #f1f5f9; border-left: 4px solid #06b6d4; padding: 16px; margin: 20px 0; border-radius: 0 6px 6px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>TCT OptiBid</h1>
    </div>
    <div class="content">
      ${contentHtml}
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} TCT Enterprise. All rights reserved.</p>
      <p>This is an automated notification from the TCT OptiBid platform. Please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Sends an email or logs it to the console if SMTP is not configured.
 */
export async function sendEmail({
  to,
  subject,
  text,
  html,
}: {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
}) {
  const mailOptions = {
    from: `"TCT OptiBid Notifications" <${smtpUser || "no-reply@tctoptibid.local"}>`,
    to: Array.isArray(to) ? to.join(", ") : to,
    subject,
    text,
    html,
  };

  if (transporter) {
    try {
      await transporter.sendMail(mailOptions);
      console.log(`[Email] Sent email to ${mailOptions.to}: ${subject}`);
    } catch (err) {
      console.error(`[Email Error] Failed to send email to ${mailOptions.to}:`, err);
    }
  } else {
    // Development fallback
    console.log(`\n==============================================`);
    console.log(`[SIMULATED EMAIL] To: ${mailOptions.to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body:\n${text}`);
    console.log(`==============================================\n`);
  }
}
