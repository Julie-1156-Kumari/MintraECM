import Stripe from 'stripe';

const secretKey = String(process.env.STRIPE_SECRET_KEY || '').trim();
const isPlaceholderKey = !secretKey || /placeholder/i.test(secretKey);

if (isPlaceholderKey) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('STRIPE_SECRET_KEY is not set. Refusing to start in production.');
  }
  console.warn('STRIPE_SECRET_KEY is not set. Stripe payments will fail until configured.');
} else {
  console.log('Stripe Connected:=> ');
}

const missingKeyClient = {
  get() {
    throw new Error('STRIPE_SECRET_KEY is not set. Stripe payments cannot run.');
  },
};

const stripe = !isPlaceholderKey
  ? new Stripe(secretKey)
  : new Proxy(
      {},
      {
        get() {
          return missingKeyClient.get();
        },
      }
    );

export default stripe;
