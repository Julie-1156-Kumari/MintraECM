import './config/loadEnv.js';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import { verifyTransporter } from './config/nodemailer.js';
import { verifyTwilio } from './config/twilio.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import { seedProductsIfEmpty } from './utils/seedProducts.js';
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import paymentRoutes, { handleStripeWebhook } from './routes/paymentRoutes.js';

const PORT = process.env.PORT || 5001;
const isProduction = process.env.NODE_ENV === 'production';

const normalizeOrigin = (value) => String(value || '').trim().replace(/\/+$/, '');
const isLocalDevOrigin = (origin) =>
  /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin);

const allowedOrigins = new Set();
const addOrigin = (value) => {
  const origin = normalizeOrigin(value);
  if (!origin) {
    return;
  }
  if (isProduction && isLocalDevOrigin(origin)) {
    return;
  }
  allowedOrigins.add(origin);
};

addOrigin(process.env.CLIENT_URL);
String(process.env.CORS_ORIGINS || '')
  .split(',')
  .forEach(addOrigin);

if (!isProduction) {
  addOrigin('http://localhost:5173');
  addOrigin('http://127.0.0.1:5173');
}

const app = express();

app.set('trust proxy', 1);
app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      // No Origin: Stripe webhooks, server-to-server, and non-browser clients
      if (!origin) {
        callback(null, true);
        return;
      }
      if (allowedOrigins.has(normalizeOrigin(origin))) {
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
  express.raw({ type: 'application/json', limit: '1mb' }),
  handleStripeWebhook
);

app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

app.get('/api/health', (req, res) => {
  const databaseConnected = mongoose.connection.readyState === 1;
  const payload = {
    success: databaseConnected,
    status: databaseConnected ? 'ok' : 'degraded',
    database: databaseConnected ? 'connected' : 'disconnected',
    message: 'MintraECM API is running',
    timestamp: new Date().toISOString(),
  };

  res.status(databaseConnected ? 200 : 503).json(payload);
});

const skipUnmetered = (req) => {
  const path = String(req.originalUrl || '').split('?')[0];
  return path === '/api/health' || path === '/api/payments/webhook';
};

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 400,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipUnmetered,
  message: { success: false, message: 'Too many requests, please try again later' },
});

const checkoutLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipUnmetered,
  message: { success: false, message: 'Too many checkout requests, please try again later' },
});

app.use('/api', generalLimiter);
app.post('/api/orders', checkoutLimiter);
app.post('/api/orders/retry-payment', checkoutLimiter);
app.post('/api/payments/create-intent', checkoutLimiter);

app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);

app.use(notFound);
app.use(errorHandler);

const shouldSeedOnBoot = isProduction
  ? process.env.SEED_ON_BOOT === 'true'
  : true;

const startServer = async () => {
  if (isProduction && !normalizeOrigin(process.env.CLIENT_URL)) {
    throw new Error('CLIENT_URL is required in production');
  }

  await connectDB();

  if (shouldSeedOnBoot) {
    const seedResult = await seedProductsIfEmpty();
    if (seedResult.seeded) {
      console.log(`Seeded ${seedResult.count} products (MongoDB ObjectIds assigned)`);
    }
  }

  await Promise.all([verifyTransporter(), verifyTwilio()]);

  const httpServer = await new Promise((resolve, reject) => {
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(
        `Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`
      );
      resolve(server);
    });
    server.once('error', reject);
  });

  const shutdown = (signal) => {
    console.log(`[server] ${signal} received. Shutting down...`);
    httpServer.close(async () => {
      try {
        if (mongoose.connection.readyState !== 0) {
          await mongoose.connection.close();
        }
        console.log('[server] HTTP server and MongoDB connection closed');
        process.exit(0);
      } catch (err) {
        console.error('[server] Error during shutdown:', err.message);
        process.exit(1);
      }
    });

    setTimeout(() => {
      console.error('[server] Forced shutdown after timeout');
      process.exit(1);
    }, 10000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

startServer().catch((err) => {
  console.error('[server] Startup failed:', err?.stack || err?.message || err);
  process.exit(1);
});

export default app;
