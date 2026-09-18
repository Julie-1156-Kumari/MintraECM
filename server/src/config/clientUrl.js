/**
 * Public storefront origin used in emails, SMS, and CORS.
 * Trailing slashes are stripped so links and Origin checks stay consistent.
 */
export const getClientUrl = () => {
  const configured = String(process.env.CLIENT_URL || '').trim().replace(/\/+$/, '');

  if (configured) {
    return configured;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('CLIENT_URL is required in production');
  }

  return 'http://localhost:5173';
};

export default getClientUrl;
