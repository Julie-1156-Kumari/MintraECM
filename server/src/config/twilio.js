import twilio from 'twilio';
import dotenv from 'dotenv';

let twilioClient = null;
let verified = false;

/**
 * Lazily create the Twilio REST client from env vars.
 * Safe to call after dotenv.config().
 * @returns {import('twilio').Twilio|null}
 */
export const getTwilioClient = () => {
  if (twilioClient) return twilioClient;

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    console.warn(
      '[twilio] TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN is not set. SMS will be skipped.'
    );
    return null;
  }

  if (!accountSid.startsWith('AC')) {
    console.warn(
      '[twilio] TWILIO_ACCOUNT_SID should start with "AC". Check your credentials.'
    );
  }

  twilioClient = twilio(accountSid, authToken);
  return twilioClient;
};

/**
 * Twilio sender number (E.164), e.g. +14155552671
 * @returns {string}
 */
export const getTwilioPhoneNumber = () =>
  String(process.env.TWILIO_PHONE_NUMBER || '').trim();

/**
 * Verify Twilio credentials by fetching the account (non-blocking for callers).
 * @returns {Promise<boolean>}
 */
export const verifyTwilio = async () => {
  const client = getTwilioClient();
  const from = getTwilioPhoneNumber();

  if (!client) return false;

  if (!from) {
    console.warn('[twilio] TWILIO_PHONE_NUMBER is not set. SMS will be skipped.');
    return false;
  }

  if (verified) return true;

  try {
    const account = await client.api.accounts(process.env.TWILIO_ACCOUNT_SID).fetch();
    verified = true;
    console.log(`[twilio] Ready (account: ${account.friendlyName}, from: ${from})`);
    return true;
  } catch (error) {
    console.error(`[twilio] Credential verification failed: ${error.message}`);
    return false;
  }
};

/**
 * Reset cached client (useful in tests / credential rotation).
 */
export const resetTwilioClient = () => {
  twilioClient = null;
  verified = false;
};

/** @deprecated Prefer getTwilioPhoneNumber() for lazy env reads */
export const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER || '';

export default getTwilioClient;
