import axiosInstance from './axiosInstance';

/**
 * Create a PENDING order from checkout payload.
 * @param {{ customerDetails: object, shippingAddress: object, items: Array }} payload
 */
export const createOrder = async (payload) => {
  const { data } = await axiosInstance.post('/orders', payload);
  return data.order;
};

/**
 * Create Stripe PaymentIntent for an order.
 * @param {string} orderId
 */
export const createPaymentIntent = async (orderId) => {
  const { data } = await axiosInstance.post('/payments/create-intent', {
    orderId,
  });
  return data;
};

/**
 * Confirm payment status after Stripe.js confirmation.
 * @param {string} paymentIntentId
 */
export const confirmPaymentStatus = async (paymentIntentId) => {
  const { data } = await axiosInstance.get(
    `/payments/confirm/${encodeURIComponent(paymentIntentId)}`
  );
  return data;
};

/**
 * Retry payment for a failed/pending order.
 * @param {string} orderId
 */
export const retryPayment = async (orderId) => {
  const { data } = await axiosInstance.post('/orders/retry-payment', {
    orderId,
  });
  return data;
};
