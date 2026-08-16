import Stripe from 'stripe';
import dotenv from 'dotenv';

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY is not set. Stripe payments will fail until configured.');
}else{
  console.log("Stripe Connected:=> ");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

export default stripe;
