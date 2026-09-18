# MintraECM production deploy

Frontend is a Vite React app on **Vercel**. Backend is Express on **Render**. Database is **MongoDB Atlas**.

## Vercel (frontend)

- Root Directory: `client`
- Framework: Vite
- Build Command: `npm run build`
- Output Directory: `dist`
- Node.js: `20.x`

Environment variables (set at **build** time; then redeploy):

- `VITE_API_URL` — Render API origin including `/api`, for example `https://your-service.onrender.com/api`
- `VITE_STRIPE_PUBLISHABLE_KEY` — Stripe publishable key (`pk_...`)

`client/vercel.json` rewrites unknown paths to `index.html` so React Router deep links (`/payment/success`, `/tracking/:id`) work. The API is not hosted on Vercel.

## Render (backend)

- Root Directory: `server`
- Build Command: `npm install`
- Start Command: `npm start`
- Health Check Path: `/api/health`
- Node.js: `20.x`

Environment variables:

- `NODE_ENV` — `production`
- `PORT` — leave unset; Render injects this
- `MONGO_URI`
- `CLIENT_URL` — Vercel origin with no trailing slash, for example `https://your-app.vercel.app`
- `CORS_ORIGINS` — optional comma-separated extra origins (preview URLs)
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`
- `SMTP_FROM_NAME`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_PHONE_NUMBER`
- `SEED_ON_BOOT` — set to `true` only when you want an empty catalog seeded on boot

Stripe webhook URL: `https://your-service.onrender.com/api/payments/webhook`

Allow Render egress in MongoDB Atlas Network Access (or `0.0.0.0/0` with a strong database user).
