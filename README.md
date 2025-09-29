# SolarNaija

This repo is a Vite + React + TypeScript storefront for SolarNaija.

## Production checklist

1. Environment variables
   - Create a `.env` file from `.env.example` and set values for:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
     - `VITE_PAYSTACK_PUBLIC_KEY`
     - `VITE_WHATSAPP_NUMBER`
     - (Optional) `VITE_GA_ID`, `VITE_RESEND_API_KEY`, etc.

2. Supabase
   - Ensure you have a `products` storage bucket (if using image uploads) and proper policies:
     - Allow public SELECT for viewing images or use signed URLs.
     - Allow authenticated users to INSERT into the bucket for uploads.
   - Ensure `products` table has the columns used by the app: `id`, `name`, `price`, `image`, `category`, `description`, `specifications`, `rating`, `in_stock`.

3. Payment
   - Use Paystack test keys during staging and production keys in production (set `VITE_PAYSTACK_PUBLIC_KEY`).
   - For production payments, consider moving order creation and payment verification to server-side endpoints.

4. Build and deploy
   - Build: `npm run build`
   - Serve preview locally: `npm run start` (uses `vite preview`)
   - Deploy on platforms that support static sites (Vercel, Netlify, Cloudflare Pages) or any host that serves static files.

5. Security & monitoring
   - Rotate any leaked keys and do not commit `.env` to source control.
   - Add error monitoring (Sentry, LogRocket) and server-side verification for payments.

## CI
A simple GitHub Actions workflow is included to run build and typecheck on push and pull request.

## Development
- Start dev server: `npm run dev`
- Lint: `npm run lint`
- Type check: `npm run typecheck`

If you want, I can add serverless endpoints for order verification, or prepare a Dockerfile for consistent production builds.
