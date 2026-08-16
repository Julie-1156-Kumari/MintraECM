import express from 'express';
import {
  createCart,
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearCart,
} from '../controllers/cartController.js';
import { validate } from '../middleware/validateMiddleware.js';
import {
  addCartItemSchema,
  updateCartItemSchema,
  removeCartItemSchema,
} from '../validators/cartValidator.js';

const router = express.Router();

router.post('/', createCart);
router.get('/:cartId', getCart);
router.post('/:cartId/items', validate(addCartItemSchema), addCartItem);
router.put('/:cartId/items', validate(updateCartItemSchema), updateCartItem);
router.delete('/:cartId/items', (req, res, next) => {
  // Prefer body; fall back to query for clients that omit DELETE bodies
  if (!req.body?.productId || !req.body?.size) {
    req.body = {
      productId: req.body?.productId || req.query.productId,
      size: req.body?.size || req.query.size,
    };
  }
  return validate(removeCartItemSchema)(req, res, next);
}, removeCartItem);
router.delete('/:cartId', clearCart);

export default router;
