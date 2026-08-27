import nodemailer from 'nodemailer';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
  attachments?: Array<{
    filename: string;
    path?: string;
    content?: Buffer | string;
    cid?: string;
    contentType?: string;
  }>;
}

export interface SendEmailResult {
  ok: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Creates a reusable Nodemailer transporter using environment variables.
 * Compatible with Gmail, Outlook, Amazon SES, Brevo, Mailgun, custom SMTP, etc.
 */
export function getEmailTransporter() {
  const host = process.env.SMTP_HOST || process.env.EMAIL_HOST;
  const portStr = process.env.SMTP_PORT || process.env.EMAIL_PORT || '465';
  const port = parseInt(portStr, 10) || 465;
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass =
    process.env.SMTP_PASS ||
    process.env.SMTP_PASSWORD ||
    process.env.EMAIL_PASS ||
    process.env.EMAIL_PASSWORD;
  const secureEnv = process.env.SMTP_SECURE || process.env.EMAIL_SECURE;
  const secure = secureEnv !== undefined ? secureEnv === 'true' : port === 465;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });
}

/**
 * Sends an email using Nodemailer.
 * If SMTP credentials are not configured in .env, it logs a clear diagnostic message
 * without crashing or throwing errors so checkout flows complete smoothly.
 */
export async function sendEmail(
  options: EmailOptions
): Promise<SendEmailResult> {
  const { to, subject, html, text, from, attachments } = options;

  if (!to || !to.includes('@')) {
    return { ok: false, error: 'Invalid recipient email address' };
  }

  const transporter = getEmailTransporter();
  const defaultSender =
    process.env.SMTP_FROM ||
    process.env.EMAIL_FROM ||
    (process.env.SMTP_USER
      ? `"Thriftonia" <${process.env.SMTP_USER}>`
      : '"Thriftonia" <orders@thriftonia.pk>');

  if (!transporter) {
    console.warn(
      `[Nodemailer] SMTP is not configured in environment variables (SMTP_HOST, SMTP_USER, SMTP_PASS). ` +
        `Skipping actual email dispatch to: ${to}. Subject: "${subject}".`
    );
    return {
      ok: false,
      error: 'SMTP credentials not configured in environment variables',
    };
  }

  try {
    const info = await transporter.sendMail({
      from: from || defaultSender,
      to,
      subject,
      text: text || html.replace(/<[^>]*>?/gm, ''),
      html,
      attachments,
    });

    console.log(`[Nodemailer] Email sent successfully to ${to}. MessageId: ${info.messageId}`);
    return { ok: true, messageId: info.messageId };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error sending email';
    console.error(`[Nodemailer] Failed to send email to ${to}:`, err);
    return { ok: false, error: errorMsg };
  }
}
