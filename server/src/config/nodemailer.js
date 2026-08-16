import nodemailer from 'nodemailer';

let transporter = null;
let verified = false;

/**
 * Lazily create the Nodemailer transporter from env vars.
 * Safe to call after dotenv.config().
 * @returns {import('nodemailer').Transporter|null}
 */
export const getTransporter = () => {
  if (transporter) return transporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.warn(
      '[nodemailer] SMTP credentials incomplete (SMTP_HOST, SMTP_USER, SMTP_PASS). Emails will be skipped.'
    );
    return null;
  }

  const port = Number(SMTP_PORT) || 587;

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === 'production',
    },
  });

  return transporter;
};

/**
 * Verify SMTP connectivity once (non-blocking for callers that await it).
 * @returns {Promise<boolean>}
 */
export const verifyTransporter = async () => {
  const transport = getTransporter();
  if (!transport) return false;
  if (verified) return true;

  try {
    await transport.verify();
    verified = true;
    console.log(`[nodemailer] SMTP ready (${process.env.SMTP_HOST}:${process.env.SMTP_PORT || 587})`);
    return true;
  } catch (error) {
    console.error(`[nodemailer] SMTP verification failed: ${error.message}`);
    return false;
  }
};

/**
 * Reset cached transporter (useful in tests / credential rotation).
 */
export const resetTransporter = () => {
  if (transporter) {
    transporter.close();
  }
  transporter = null;
  verified = false;
};

export default getTransporter;
