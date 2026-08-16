import asyncHandler from 'express-async-handler';
import * as cartService from '../services/cartService.js';
import { date } from 'zod';

/**
 * @desc    Create a new guest cart
 * @route   POST /api/cart
 * @access  Public
 */
export const createCart = asyncHandler(async (req, res) => {
  const cart = await cartService.createCart();

  res.status(201).json({
    success: true,
    message: 'Cart created',
    cart,
  });
});

/**
 * @desc    Get cart by ID
 * @route   GET /api/cart/:cartId
 * @access  Public
 */
export const getCart = asyncHandler(async (req, res) => {
  const cart = await cartService.getCartById(req.params.cartId);
  // console.log("cardId:-> " + req.params.cartId, new Date());
  res.status(200).json({
    success: true,
    cart,
  });
});

/**
 * @desc    Add item to cart
 * @route   POST /api/cart/:cartId/items
 * @access  Public
 */
export const addCartItem = asyncHandler(async (req, res) => {
  const cart = await cartService.addItemToCart(req.params.cartId, req.body);

  res.status(200).json({
    success: true,
    message: 'Item added to cart',
    cart,
  });
});

/**
 * @desc    Update cart item quantity
 * @route   PUT /api/cart/:cartId/items
 * @access  Public
 */
export const updateCartItem = asyncHandler(async (req, res) => {
  const cart = await cartService.updateCartItem(req.params.cartId, req.body);

  res.status(200).json({
    success: true,
    message: 'Cart item updated',
    cart,
  });
});

/**
 * @desc    Remove item from cart
 * @route   DELETE /api/cart/:cartId/items
 * @access  Public
 */
export const removeCartItem = asyncHandler(async (req, res) => {
  const payload = {
    productId: req.body.productId || req.query.productId,
    size: req.body.size || req.query.size,
  };
  const cart = await cartService.removeCartItem(req.params.cartId, payload);

  res.status(200).json({
    success: true,
    message: 'Item removed from cart',
    cart,
  });
});

/**
 * @desc    Clear all items from cart
 * @route   DELETE /api/cart/:cartId
 * @access  Public
 */
export const clearCart = asyncHandler(async (req, res) => {
  const cart = await cartService.clearCart(req.params.cartId);

  res.status(200).json({
    success: true,
    message: 'Cart cleared',
    cart,
  });
});
