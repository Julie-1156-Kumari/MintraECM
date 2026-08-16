import mongoose from 'mongoose';
import Cart from '../models/cartModel.js';
import Product from '../models/productModel.js';
import ApiError from '../utils/apiError.js';

/**
 * Serialize cart with computed totals for API responses.
 * @param {import('mongoose').Document} cart
 */
const formatCart = (cart) => {
  const doc = cart.toObject({ virtuals: true });
  const totalMRP = doc.totalMRP || 0;
  const totalAmount = doc.totalAmount || 0;
  const totalQuantity = doc.totalQuantity || doc.itemCount || 0;

  return {
    _id: doc._id,
    sessionId: doc.sessionId || doc._id?.toString(),
    items: doc.items,
    itemCount: totalQuantity,
    totalQuantity,
    totalMRP,
    discountOnMRP: Math.max(0, totalMRP - totalAmount),
    totalAmount,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
};

/**
 * @param {string} cartId
 */
const assertValidCartId = (cartId) => {
  if (!mongoose.Types.ObjectId.isValid(cartId)) {
    throw ApiError.badRequest('Invalid cart ID');
  }
};

/**
 * @param {string} cartId
 */
const findCartOrThrow = async (cartId) => {
  assertValidCartId(cartId);
  const cart = await Cart.findById(cartId);
  if (!cart) {
    throw ApiError.notFound('Cart not found');
  }
  return cart;
};

/**
 * Validate product exists, is in stock, and size is available.
 * @param {string} productId
 * @param {string} size
 */
const resolveProductForCart = async (productId, size) => {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw ApiError.badRequest('Invalid product ID');
  }

  const product = await Product.findById(productId);
  if (!product) {
    throw ApiError.notFound('Product not found');
  }

  if (!product.inStock) {
    throw ApiError.badRequest('Product is out of stock');
  }

  const normalizedSize = String(size).trim();
  const sizeMatch = product.sizes.some(
    (s) => s.toLowerCase() === normalizedSize.toLowerCase()
  );

  if (!sizeMatch) {
    throw ApiError.badRequest(
      `Size "${normalizedSize}" is not available. Available: ${product.sizes.join(', ')}`
    );
  }

  const matchedSize =
    product.sizes.find((s) => s.toLowerCase() === normalizedSize.toLowerCase()) ||
    normalizedSize;

  return { product, size: matchedSize };
};

/**
 * Create an empty guest cart.
 */
export const createCart = async () => {
  const cart = await Cart.create({ items: [] });
  // sessionId mirrors guest cart identity (no JWT)
  if (!cart.sessionId) {
    cart.sessionId = cart._id.toString();
    await cart.save();
  }
  return formatCart(cart);
};

/**
 * Get cart by ID.
 * @param {string} cartId
 */
export const getCartById = async (cartId) => {
  const cart = await findCartOrThrow(cartId);
  return formatCart(cart);
};

/**
 * Add item to cart (increments quantity if same product + size exists).
 * @param {string} cartId
 * @param {{ productId: string, size: string, quantity: number }} payload
 */
export const addItemToCart = async (cartId, payload) => {
  const { productId, size, quantity } = payload;
  const cart = await findCartOrThrow(cartId);
  const { product, size: resolvedSize } = await resolveProductForCart(productId, size);

  const existingIndex = cart.findItemIndex(product._id, resolvedSize);

  if (existingIndex > -1) {
    const nextQty = cart.items[existingIndex].quantity + quantity;
    if (nextQty > 10) {
      throw ApiError.badRequest('Quantity cannot exceed 10 for a single item');
    }
    cart.items[existingIndex].quantity = nextQty;
    cart.items[existingIndex].price = product.price;
    cart.items[existingIndex].originalPrice = product.originalPrice;
  } else {
    cart.items.push({
      product: product._id,
      name: product.name,
      brand: product.brand,
      image: product.images[0],
      size: resolvedSize,
      quantity,
      price: product.price,
      originalPrice: product.originalPrice,
    });
  }

  await cart.save();
  return formatCart(cart);
};

/**
 * Update quantity for an existing cart line (product + size).
 * @param {string} cartId
 * @param {{ productId: string, size: string, quantity: number }} payload
 */
export const updateCartItem = async (cartId, payload) => {
  const { productId, size, quantity } = payload;
  const cart = await findCartOrThrow(cartId);
  const { product, size: resolvedSize } = await resolveProductForCart(productId, size);

  const existingIndex = cart.findItemIndex(product._id, resolvedSize);
  if (existingIndex === -1) {
    throw ApiError.notFound('Item not found in cart');
  }

  cart.items[existingIndex].quantity = quantity;
  cart.items[existingIndex].price = product.price;
  cart.items[existingIndex].originalPrice = product.originalPrice;

  await cart.save();
  return formatCart(cart);
};

/**
 * Remove a cart line by product + size.
 * @param {string} cartId
 * @param {{ productId: string, size: string }} payload
 */
export const removeCartItem = async (cartId, payload) => {
  const { productId, size } = payload;
  const cart = await findCartOrThrow(cartId);

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw ApiError.badRequest('Invalid product ID');
  }

  const normalizedSize = String(size).trim();
  const existingIndex = cart.items.findIndex(
    (item) =>
      item.product.toString() === productId &&
      item.size.toLowerCase() === normalizedSize.toLowerCase()
  );

  if (existingIndex === -1) {
    throw ApiError.notFound('Item not found in cart');
  }

  cart.items.splice(existingIndex, 1);
  await cart.save();
  return formatCart(cart);
};

/**
 * Clear all items from a cart (keeps the cart document).
 * @param {string} cartId
 */
export const clearCart = async (cartId) => {
  const cart = await findCartOrThrow(cartId);
  cart.items = [];
  await cart.save();
  return formatCart(cart);
};
