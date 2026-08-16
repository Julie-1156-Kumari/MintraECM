import express from 'express';
import {
  createPaymentIntent,
  handleStripeWebhook,
  confirmPaymentStatus,
} from '../controllers/paymentController.js';
import { validate } from '../middleware/validateMiddleware.js';
import { createPaymentIntentSchema } from '../validators/checkoutValidator.js';

const router = express.Router();

router.post('/create-intent', validate(createPaymentIntentSchema), createPaymentIntent);
router.get('/confirm/:paymentIntentId', confirmPaymentStatus);

// Webhook is mounted separately in server.js with express.raw()

export { handleStripeWebhook };
export default router;
