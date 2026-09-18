/**
 * Redact PII for operational logs. Never log full emails or phone numbers.
 */

export const redactEmail = (email) => {
  const value = String(email || '').trim();
  const at = value.indexOf('@');
  if (at < 1) {
    return '[redacted]';
  }
  return `${value[0]}***${value.slice(at)}`;
};

export const redactPhone = (phone) => {
  const digits = String(phone || '').replace(/\D/g, '');
  if (digits.length < 4) {
    return '[redacted]';
  }
  return `***${digits.slice(-4)}`;
};

export const redactSecrets = (value) =>
  String(value || '')
    .replace(/mongodb(?:\+srv)?:\/\/\S+/gi, '[redacted-mongo-uri]')
    .replace(/\bsk_(?:live|test)_[A-Za-z0-9]+/g, '[redacted-stripe-key]')
    .replace(/\bwhsec_[A-Za-z0-9]+/g, '[redacted-webhook-secret]')
    .replace(/\bAC[a-f0-9]{32}\b/gi, '[redacted-twilio-sid]')
    .replace(
      /\b(?:password|passwd|smtp_pass|auth_token|secret|api[_-]?key|mongo_uri)\s*[:=]\s*\S+/gi,
      '[redacted-credential]'
    );
