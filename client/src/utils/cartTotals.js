/**
 * Price helpers shared by Cart, Checkout, and PaymentSummary.
 */

export const CONVENIENCE_FEE = 99;
export const FREE_SHIPPING_THRESHOLD = 1499;

/**
 * @param {Array} items - cart line items
 */
export const getCartTotals = (items = []) => {
  const totalMRP = items.reduce(
    (sum, item) => sum + Number(item.originalPrice || item.price || 0) * item.quantity,
    0
  );
  const discountedSubtotal = items.reduce(
    (sum, item) => sum + Number(item.price || 0) * item.quantity,
    0
  );
  const discountOnMRP = Math.max(0, totalMRP - discountedSubtotal);
  const convenienceFee =
    discountedSubtotal >= FREE_SHIPPING_THRESHOLD || discountedSubtotal === 0
      ? 0
      : CONVENIENCE_FEE;
  const totalAmount = discountedSubtotal + convenienceFee;
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    totalMRP,
    discountOnMRP,
    discountedSubtotal,
    convenienceFee,
    totalAmount,
    itemCount,
  };
};
