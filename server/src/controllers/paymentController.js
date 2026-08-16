import asyncHandler from 'express-async-handler';
import * as paymentService from '../services/paymentService.js';

/**
 * @desc    Create Stripe PaymentIntent for an order
 * @route   POST /api/payments/create-intent
 * @access  Public
 */
export const createPaymentIntent = asyncHandler(async (req, res) => {
  const result = await paymentService.createPaymentIntent(req.body.orderId);

  res.status(200).json({
    success: true,
    message: 'PaymentIntent created',
    ...result,
  });
});

/**
 * @desc    Stripe webhook handler
 * @route   POST /api/payments/webhook
 * @access  Public (Stripe-signed)
 */
export const handleStripeWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers['stripe-signature'];

  if (!signature) {
    res.status(400).json({ success: false, message: 'Missing Stripe-Signature header' });
    return;
  }

  const result = await paymentService.handleStripeWebhook(req.body, signature);

  res.status(200).json(result);
});

/**
 * @desc    Confirm payment status (client-side fallback)
 * @route   GET /api/payments/confirm/:paymentIntentId
 * @access  Public
 */
export const confirmPaymentStatus = asyncHandler(async (req, res) => {
  const result = await paymentService.confirmPaymentStatus(req.params.paymentIntentId);

  res.status(200).json({
    success: true,
    ...result,
  });
});
