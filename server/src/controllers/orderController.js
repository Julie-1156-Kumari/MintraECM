import asyncHandler from 'express-async-handler';
import * as orderService from '../services/orderService.js';
import * as paymentService from '../services/paymentService.js';

/**
 * @desc    Create pending order from checkout
 * @route   POST /api/orders
 * @access  Public
 */
export const createOrder = asyncHandler(async (req, res) => {
  const order = await orderService.createOrder(req.body);

  res.status(201).json({
    success: true,
    message: 'Order created',
    order,
  });
});

/**
 * @desc    Get order by tracking number
 * @route   GET /api/orders/track/:trackingNumber
 * @access  Public
 */
export const getOrderByTracking = asyncHandler(async (req, res) => {
  const order = await orderService.getOrderByTracking(req.params.trackingNumber);

  res.status(200).json({
    success: true,
    order,
  });
});

/**
 * @desc    Get order by ID
 * @route   GET /api/orders/:orderId
 * @access  Public
 */
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await orderService.getOrderById(req.params.orderId);

  res.status(200).json({
    success: true,
    order,
  });
});

/**
 * @desc    Retry payment for a failed/pending order
 * @route   POST /api/orders/retry-payment
 * @access  Public
 */
export const retryPayment = asyncHandler(async (req, res) => {
  const result = await paymentService.retryPayment(req.body.orderId);

  res.status(200).json({
    success: true,
    message: 'Payment intent recreated',
    ...result,
  });
});
