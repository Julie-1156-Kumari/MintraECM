import stripe from '../config/stripe.js';
import Order from '../models/orderModel.js';
import ApiError from '../utils/apiError.js';
import * as orderService from './orderService.js';
import {
  sendOrderConfirmationEmail,
  sendPaymentFailedEmail,
} from './emailService.js';
import {
  sendOrderConfirmationSMS,
  sendPaymentFailedSMS,
} from './smsService.js';

const CURRENCY = 'inr';

/**
 * Convert rupees to paise for Stripe.
 * @param {number} amountInRupees
 */
const toStripeAmount = (amountInRupees) => Math.round(Number(amountInRupees) * 100);

/**
 * Fire email + SMS without blocking the webhook response.
 * @param {Function} fn
 */
const notifyAsync = (fn) => {
  (async () => {
    try {
      await fn();
    } catch (err) {
      console.error('[paymentService] Notification error:', err.message);
    }
  })();
};

/**
 * Create a Stripe PaymentIntent for a PENDING/FAILED order.
 * @param {string} orderId
 */
export const createPaymentIntent = async (orderId) => {
  const order = await orderService.getOrderById(orderId);

  if (order.paymentStatus === 'PAID') {
    throw ApiError.badRequest('Order is already paid');
  }

  if (!order.totalAmount || order.totalAmount <= 0) {
    throw ApiError.badRequest('Invalid order amount');
  }

  // Reuse an incomplete PaymentIntent when possible
  if (order.stripePaymentIntentId) {
    try {
      const existing = await stripe.paymentIntents.retrieve(order.stripePaymentIntentId);
      if (['requires_payment_method', 'requires_confirmation', 'requires_action'].includes(existing.status)) {
        return {
          clientSecret: existing.client_secret,
          paymentIntentId: existing.id,
          amount: order.totalAmount,
          currency: CURRENCY,
          orderId: order._id,
          trackingNumber: order.trackingNumber,
        };
      }
    } catch (err) {
      console.warn(
        '[paymentService] Could not reuse PaymentIntent, creating a new one:',
        err.message
      );
    }
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: toStripeAmount(order.totalAmount),
    currency: CURRENCY,
    automatic_payment_methods: { enabled: true },
    metadata: {
      orderId: order._id.toString(),
      trackingNumber: order.trackingNumber,
      customerEmail: order.customerDetails.email,
      customerPhone: order.customerDetails.phone,
    },
    receipt_email: order.customerDetails.email,
    description: `MintraECM order ${order.trackingNumber}`,
  });

  order.stripePaymentIntentId = paymentIntent.id;
  order.paymentStatus = 'PENDING';
  order.paymentFailureReason = null;
  await order.save();

  return {
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
    amount: order.totalAmount,
    currency: CURRENCY,
    orderId: order._id,
    trackingNumber: order.trackingNumber,
  };
};

/**
 * Re-initiate payment for a FAILED order.
 * @param {string} orderId
 */
export const retryPayment = async (orderId) => {
  const order = await orderService.getOrderById(orderId);

  if (order.paymentStatus === 'PAID') {
    throw ApiError.badRequest('Order is already paid');
  }

  if (order.paymentStatus !== 'FAILED' && order.paymentStatus !== 'PENDING') {
    throw ApiError.badRequest('Order is not eligible for payment retry');
  }

  // Cancel previous open intent if present
  if (order.stripePaymentIntentId) {
    try {
      const existing = await stripe.paymentIntents.retrieve(order.stripePaymentIntentId);
      if (!['succeeded', 'canceled'].includes(existing.status)) {
        await stripe.paymentIntents.cancel(existing.id);
      }
    } catch (err) {
      console.warn('[paymentService] Could not cancel previous PaymentIntent:', err.message);
    }
    order.stripePaymentIntentId = null;
    await order.save();
  }

  return createPaymentIntent(orderId);
};

/**
 * Handle Stripe webhook events (raw body + signature).
 * @param {Buffer|string} rawBody
 * @param {string} signature
 */
export const handleStripeWebhook = async (rawBody, signature) => {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw ApiError.internal('STRIPE_WEBHOOK_SECRET is not configured');
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    throw ApiError.badRequest(`Webhook signature verification failed: ${err.message}`);
  }

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object;
      const order = await orderService.markOrderPaid(paymentIntent.id);

      if (order) {
        notifyAsync(() => sendOrderConfirmationEmail(order));
        notifyAsync(() => sendOrderConfirmationSMS(order));
      }
      break;
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object;
      const reason =
        paymentIntent.last_payment_error?.message ||
        'Your card was declined or the payment could not be completed.';

      const order = await orderService.markOrderPaymentFailed(paymentIntent.id, reason);

      if (order) {
        notifyAsync(() => sendPaymentFailedEmail(order, reason));
        notifyAsync(() => sendPaymentFailedSMS(order, reason));
      }
      break;
    }

    default:
      console.log(`[paymentService] Unhandled Stripe event: ${event.type}`);
  }

  return { received: true, type: event.type };
};

/**
 * Confirm payment status from Stripe (client fallback when webhook is delayed).
 * @param {string} paymentIntentId
 */
export const confirmPaymentStatus = async (paymentIntentId) => {
  if (!paymentIntentId) {
    throw ApiError.badRequest('paymentIntentId is required');
  }

  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
  let order = await Order.findOne({ stripePaymentIntentId: paymentIntentId });

  if (!order && paymentIntent.metadata?.orderId) {
    order = await Order.findById(paymentIntent.metadata.orderId);
  }

  if (paymentIntent.status === 'succeeded' && order && order.paymentStatus !== 'PAID') {
    order = await orderService.markOrderPaid(paymentIntent.id);
    if (order) {
      notifyAsync(() => sendOrderConfirmationEmail(order));
      notifyAsync(() => sendOrderConfirmationSMS(order));
    }
  }

  // Only mark FAILED when Stripe reports a payment error — not for the
  // initial requires_payment_method status before the customer enters a card.
  if (
    paymentIntent.last_payment_error &&
    ['requires_payment_method', 'canceled'].includes(paymentIntent.status) &&
    order &&
    order.paymentStatus !== 'PAID'
  ) {
    const reason =
      paymentIntent.last_payment_error.message ||
      'Payment requires a new payment method';
    order = await orderService.markOrderPaymentFailed(paymentIntent.id, reason);
  }

  return {
    paymentIntentStatus: paymentIntent.status,
    order,
  };
};
