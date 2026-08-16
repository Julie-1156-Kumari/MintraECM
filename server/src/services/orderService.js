import mongoose from 'mongoose';
import Order from '../models/orderModel.js';
import Product from '../models/productModel.js';
import Cart from '../models/cartModel.js';
import ApiError from '../utils/apiError.js';
import { generateTrackingNumber } from '../utils/generateTrackingNumber.js';

const CONVENIENCE_FEE = 99;
const FREE_SHIPPING_THRESHOLD = 1499;

/**
 * Resolve cart/order line items against live product data.
 * @param {Array<{ productId: string, quantity: number, size: string }>} items
 */
const buildOrderItems = async (items) => {
  const orderItems = [];
  let discountedSubtotal = 0;

  for (const item of items) {
    if (!mongoose.Types.ObjectId.isValid(item.productId)) {
      throw ApiError.badRequest(`Invalid product ID: ${item.productId}`);
    }

    const product = await Product.findById(item.productId);
    if (!product) {
      throw ApiError.notFound(`Product not found: ${item.productId}`);
    }
    if (!product.inStock) {
      throw ApiError.badRequest(`${product.name} is out of stock`);
    }

    const sizeMatch = product.sizes.find(
      (s) => s.toLowerCase() === String(item.size).trim().toLowerCase()
    );
    if (!sizeMatch) {
      throw ApiError.badRequest(
        `Size "${item.size}" unavailable for ${product.name}`
      );
    }

    const lineTotal = product.price * item.quantity;
    discountedSubtotal += lineTotal;

    orderItems.push({
      product: product._id,
      name: product.name,
      brand: product.brand,
      image: product.images[0],
      quantity: item.quantity,
      size: sizeMatch,
      price: product.price,
    });
  }

  const convenienceFee =
    discountedSubtotal >= FREE_SHIPPING_THRESHOLD || discountedSubtotal === 0
      ? 0
      : CONVENIENCE_FEE;

  return {
    orderItems,
    totalAmount: discountedSubtotal + convenienceFee,
  };
};

/**
 * Create a PENDING order from checkout payload.
 * @param {Object} payload
 */
export const createOrder = async (payload) => {
  const { customerDetails, shippingAddress, items, cartId } = payload;
  const { orderItems, totalAmount } = await buildOrderItems(items);

  let trackingNumber = generateTrackingNumber();
  let attempts = 0;

  while (attempts < 5) {
    const exists = await Order.exists({ trackingNumber });
    if (!exists) break;
    trackingNumber = generateTrackingNumber();
    attempts += 1;
  }

  // Keep MongoDB cart until payment succeeds — only store cartId reference
  const orderPayload = {
    customerDetails,
    shippingAddress,
    items: orderItems,
    totalAmount,
    paymentStatus: 'PENDING',
    orderStatus: 'ORDERED',
    trackingNumber,
  };

  if (cartId && mongoose.Types.ObjectId.isValid(cartId)) {
    orderPayload.cartId = cartId;
  }

  const order = await Order.create(orderPayload);
  return order;
};

/**
 * @param {string} trackingNumber
 */
export const getOrderByTracking = async (trackingNumber) => {
  if (!trackingNumber || !String(trackingNumber).trim()) {
    throw ApiError.badRequest('Tracking number is required');
  }

  const order = await Order.findOne({
    trackingNumber: String(trackingNumber).trim().toUpperCase(),
  }).populate('items.product', 'name brand images category');

  if (!order) {
    throw ApiError.notFound('Order not found for this tracking number');
  }

  return order;
};

/**
 * @param {string} orderId
 */
export const getOrderById = async (orderId) => {
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw ApiError.badRequest('Invalid order ID');
  }

  const order = await Order.findById(orderId);
  if (!order) {
    throw ApiError.notFound('Order not found');
  }

  return order;
};

/**
 * Mark order paid after successful Stripe payment.
 * @param {string} paymentIntentId
 */
export const markOrderPaid = async (paymentIntentId) => {
  const order = await Order.findOne({ stripePaymentIntentId: paymentIntentId });
  if (!order) {
    console.warn(`[orderService] No order for PaymentIntent ${paymentIntentId}`);
    return null;
  }

  if (order.paymentStatus === 'PAID') {
    return order;
  }

  order.paymentStatus = 'PAID';
  order.paymentFailureReason = null;
  order.orderStatus = 'ORDERED';
  await order.save();

  // Clear MongoDB cart after successful payment (source-of-truth cleanup)
  if (order.cartId && mongoose.Types.ObjectId.isValid(order.cartId)) {
    try {
      await Cart.findByIdAndUpdate(order.cartId, { items: [] });
    } catch (err) {
      console.warn('[orderService] Failed to clear cart after payment:', err.message);
    }
  }

  return order;
};

/**
 * Mark order payment failed.
 * @param {string} paymentIntentId
 * @param {string} [reason]
 */
export const markOrderPaymentFailed = async (paymentIntentId, reason) => {
  const order = await Order.findOne({ stripePaymentIntentId: paymentIntentId });
  if (!order) {
    console.warn(`[orderService] No order for PaymentIntent ${paymentIntentId}`);
    return null;
  }

  if (order.paymentStatus === 'PAID') {
    return order;
  }

  order.paymentStatus = 'FAILED';
  order.paymentFailureReason = reason || 'Payment failed';
  await order.save();
  return order;
};
