import { getTransporter } from '../config/nodemailer.js';
import { getClientUrl } from '../config/clientUrl.js';
import { buildOrderConfirmationEmail } from '../templates/orderConfirmationEmail.js';
import { buildPaymentFailedEmail } from '../templates/paymentFailedEmail.js';
import { redactEmail } from '../utils/redact.js';

/**
 * Strip HTML tags for a plain-text email fallback.
 * @param {string} html
 * @returns {string}
 */
const htmlToText = (html) =>
  String(html || '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/tr>/gi, '\n')
    .replace(/<\/h[1-6]>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/₹/g, 'Rs.')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

/**
 * Core send helper used by all outbound emails.
 * @param {{ to: string, subject: string, html: string, text?: string }} options
 */
export const sendMail = async ({ to, subject, html, text }) => {
  const transporter = getTransporter();

  if (!transporter) {
    console.warn(`[emailService] Skipped email to ${redactEmail(to)}: SMTP not configured`);
    return { skipped: true, reason: 'SMTP_NOT_CONFIGURED' };
  }

  if (!to) {
    console.warn('[emailService] Skipped email: missing recipient');
    return { skipped: true, reason: 'MISSING_RECIPIENT' };
  }

  const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER;
  const fromName = process.env.SMTP_FROM_NAME || 'MintraECM';

  try {
    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromAddress}>`,
      to,
      subject,
      html,
      text: text || htmlToText(html),
      headers: {
        'X-MintraECM-App': 'MintraECM',
      },
    });

    console.log(`[emailService] Sent "${subject}" → ${redactEmail(to)} (${info.messageId})`);

    return {
      skipped: false,
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
    };
  } catch (error) {
    console.error(`[emailService] Failed to send "${subject}" → ${redactEmail(to)}: ${error.message}`);
    throw error;
  }
};

/**
 * Send order confirmation email after successful payment.
 * @param {Object} order
 */
export const sendOrderConfirmationEmail = async (order) => {
  const to = order?.customerDetails?.email;

  if (!to) {
    console.warn('[emailService] No customer email on order; skipping confirmation');
    return { skipped: true, reason: 'MISSING_RECIPIENT' };
  }

  const tracking = order.trackingNumber || 'N/A';
  const amount = Number(order.totalAmount || 0).toLocaleString('en-IN');
  const text =
    `Hi ${order.customerDetails?.name || 'Customer'},\n\n` +
    `Your MintraECM order is confirmed.\n` +
    `Tracking Number: ${tracking}\n` +
    `Amount Paid: Rs.${amount}\n\n` +
    `Track your order: ${getClientUrl()}/tracking/${tracking}\n\n` +
    `Thank you for shopping with MintraECM.`;

  return sendMail({
    to,
    subject: `Order Confirmed · ${tracking}`,
    html: buildOrderConfirmationEmail(order),
    text,
  });
};

/**
 * Send payment failure email with retry guidance.
 * @param {Object} order
 * @param {string} [failureReason]
 */
export const sendPaymentFailedEmail = async (order, failureReason) => {
  const to = order?.customerDetails?.email;

  if (!to) {
    console.warn('[emailService] No customer email on order; skipping failure email');
    return { skipped: true, reason: 'MISSING_RECIPIENT' };
  }

  const tracking = order.trackingNumber || 'N/A';
  const reason = failureReason || 'Your payment could not be processed.';
  const amount = Number(order.totalAmount || 0).toLocaleString('en-IN');
  const clientUrl = getClientUrl();
  const retryUrl = `${clientUrl}/failure?orderId=${order._id}&tracking=${tracking}`;

  const text =
    `Hi ${order.customerDetails?.name || 'Customer'},\n\n` +
    `Payment failed for order ${tracking}.\n` +
    `Reason: ${reason}\n` +
    `Amount: Rs.${amount}\n\n` +
    `Retry payment: ${retryUrl}\n\n` +
    `Your items are still reserved until you complete payment.`;

  return sendMail({
    to,
    subject: `Payment Failed · ${tracking}`,
    html: buildPaymentFailedEmail(order, reason),
    text,
  });
};
