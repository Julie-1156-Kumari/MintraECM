import express from 'express';
import {
  createOrder,
  getOrderById,
  getOrderByTracking,
  retryPayment,
} from '../controllers/orderController.js';
import { validate } from '../middleware/validateMiddleware.js';
import {
  createOrderSchema,
  retryPaymentSchema,
} from '../validators/checkoutValidator.js';

const router = express.Router();

router.post('/', validate(createOrderSchema), createOrder);
router.post('/retry-payment', validate(retryPaymentSchema), retryPayment);
router.get('/track/:trackingNumber', getOrderByTracking);
router.get('/:orderId', getOrderById);

export default router;
