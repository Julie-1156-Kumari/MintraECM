/**
 * Format amount in Indian Rupees.
 * @param {number|string} amount
 * @returns {string}
 */
export const formatCurrency = (amount) => {
  const value = Number(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
};

/**
 * Compact INR without currency symbol (e.g. 1,299).
 * @param {number|string} amount
 * @returns {string}
 */
export const formatPrice = (amount) => {
  const value = Number(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(value);
};
