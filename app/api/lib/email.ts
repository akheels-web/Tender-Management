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
    from: `"ProTender Notifications" <${smtpUser || "no-reply@protender.local"}>`,
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
