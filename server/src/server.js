import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import connectDB from './config/db.js';
import { verifyTransporter } from './config/nodemailer.js';
import { verifyTwilio } from './config/twilio.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import { seedProductsIfEmpty } from './utils/seedProducts.js';
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import paymentRoutes, { handleStripeWebhook } from './routes/paymentRoutes.js';

dotenv.config();

const PORT = process.env.PORT || 5001;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

const allowedOrigins = new Set(
  [CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'].filter(Boolean)
);

const app = express();

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      // Allow non-browser clients (no Origin) and local Vite hosts
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);

// Stripe webhook must receive the raw body for signature verification
app.post(
  '/api/payments/webhook',
  express.raw({ type: 'application/json' }),
  handleStripeWebhook
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'MintraECM API is running',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);

app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
  await connectDB();

  const seedResult = await seedProductsIfEmpty();
  if (seedResult.seeded) {
    console.log(`Seeded ${seedResult.count} products (MongoDB ObjectIds assigned)`);
  }

  await Promise.all([verifyTransporter(), verifyTwilio()]);

  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
};

startServer();

export default app;
