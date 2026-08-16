import crypto from 'crypto';

/**
 * Generate a unique tracking number in the format MYN-TRK-XXXXXX.
 * @returns {string}
 */
export const generateTrackingNumber = () => {
  const suffix = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `MYN-TRK-${suffix}`;
};

export default generateTrackingNumber;
