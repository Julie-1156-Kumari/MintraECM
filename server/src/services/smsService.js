import { getTwilioClient, getTwilioPhoneNumber } from '../config/twilio.js';

const MAX_SMS_LENGTH = 320;

/**
 * Normalize phone to E.164 for Twilio.
 * Assumes India (+91) when given a 10-digit local number.
 * @param {string} phone
 * @returns {string}
 */
export const normalizePhone = (phone) => {
  const raw = String(phone || '').trim();
  if (!raw) {
    throw new Error('Phone number is required');
  }

  if (raw.startsWith('+') && /^\+\d{10,15}$/.test(raw)) {
    return raw;
  }

  const digits = raw.replace(/\D/g, '');

  if (digits.startsWith('91') && digits.length === 12) {
    return `+${digits}`;
  }

  if (digits.length === 10) {
    return `+91${digits}`;
  }

  if (digits.length >= 10 && digits.length <= 15) {
    return `+${digits}`;
  }

  throw new Error(`Invalid phone number: ${phone}`);
};

/**
 * Truncate SMS body to a safe length for concatenated SMS.
 * @param {string} body
 * @returns {string}
 */
const truncateBody = (body) => {
  const text = String(body || '').trim();
  if (text.length <= MAX_SMS_LENGTH) return text;
  return `${text.slice(0, MAX_SMS_LENGTH - 3)}...`;
};

/**
 * Core SMS send helper.
 * @param {string} to
 * @param {string} body
 */
export const sendSMS = async (to, body) => {
  const client = getTwilioClient();
  const from = getTwilioPhoneNumber();

  if (!client || !from) {
    console.warn(`[smsService] Skipped SMS to ${to}: Twilio not configured`);
    return { skipped: true, reason: 'TWILIO_NOT_CONFIGURED' };
  }

  if (!to) {
    console.warn('[smsService] Skipped SMS: missing recipient');
    return { skipped: true, reason: 'MISSING_RECIPIENT' };
  }

  let destination;
  try {
    destination = normalizePhone(to);
  } catch (error) {
    console.warn(`[smsService] Skipped SMS: ${error.message}`);
    return { skipped: true, reason: 'INVALID_PHONE' };
  }

  const messageBody = truncateBody(body);

  try {
    const message = await client.messages.create({
      from,
      to: destination,
      body: messageBody,
    });

    console.log(`[smsService] SMS sent → ${destination} (${message.sid})`);

    return {
      skipped: false,
      sid: message.sid,
      status: message.status,
      to: message.to,
      from: message.from,
    };
  } catch (error) {
    console.error(`[smsService] Failed to send SMS → ${destination}: ${error.message}`);
    throw error;
  }
};

/**
 * Send order confirmation SMS after successful payment.
 * @param {Object} order
 */
export const sendOrderConfirmationSMS = async (order) => {
  const phone = order?.customerDetails?.phone;

  if (!phone) {
    console.warn('[smsService] No customer phone on order; skipping confirmation SMS');
    return { skipped: true, reason: 'MISSING_RECIPIENT' };
  }

  const tracking = order.trackingNumber || 'N/A';
  const amount = Number(order.totalAmount || 0).toLocaleString('en-IN');
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

  const body =
    `MintraECM: Order confirmed! Tracking ${tracking}. ` +
    `Amount Rs.${amount}. Track: ${clientUrl}/tracking/${tracking}`;

  return sendSMS(phone, body);
};

/**
 * Send payment failure SMS with retry guidance.
 * @param {Object} order
 * @param {string} [failureReason]
 */
export const sendPaymentFailedSMS = async (order, failureReason) => {
  const phone = order?.customerDetails?.phone;

  if (!phone) {
    console.warn('[smsService] No customer phone on order; skipping failure SMS');
    return { skipped: true, reason: 'MISSING_RECIPIENT' };
  }

  const tracking = order.trackingNumber || 'N/A';
  const amount = Number(order.totalAmount || 0).toLocaleString('en-IN');
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const reason = failureReason
    ? ` Reason: ${String(failureReason).slice(0, 80)}`
    : '';

  const body =
    `MintraECM: Payment failed for ${tracking} (Rs.${amount}).${reason} ` +
    `Retry: ${clientUrl}/failure?orderId=${order._id}&tracking=${tracking}`;

  return sendSMS(phone, body);
};
