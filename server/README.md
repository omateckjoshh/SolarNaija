# SolarNaija Server

This small Express server provides secure endpoints for:

- Verifying Paystack payments (`POST /verify-payment`)
- Creating orders server-side and inserting into Supabase (`POST /create-order`)
- Sending notifications (email via Resend, SMS via Africa's Talking) (`POST /notify`)

Why use it?
- Keeps API keys (Resend, Paystack secret, Africa's Talking, Supabase service role key) off the client
- Performs server-side payment verification to avoid spoofing
- Sends notifications reliably from backend

Quick start (local):

1. Install dependencies inside `server/`:

```powershell
cd server
npm install
```

2. Create a `.env` file in `server/` with the following env vars (example values in `.env.example` in repo root):

- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- PAYSTACK_SECRET
- RESEND_API_KEY (optional)
- AFRICASTALKING_API_KEY (optional)
- AFRICASTALKING_USERNAME (optional)
- AFRICASTALKING_FROM (optional)
- FROM_EMAIL (optional)
- FROM_NAME (optional)
- ADMIN_EMAIL (optional)

3. Start the server:

```powershell
npm start
```

4. Set `VITE_API_ENDPOINT` in your frontend `.env` to point to this server (e.g., `http://localhost:3001`).

Notes:
- This is a minimal example. In production you should deploy to a serverless function or managed Node host and secure the endpoints (rate limit, auth, logging, monitoring).
- The Supabase service role key has broad permissions — keep it secret and never publish it in the client.

## Deployment

Recommended: build a small Docker image and deploy to your hosting provider (AWS ECS, Fly, Render, DigitalOcean App Platform, etc.).

Docker (build & run locally):

```powershell
# from project root
cd server
# build image (replace tag)
docker build -t solarnaija-server:latest .

# run container (map port and pass envs)
docker run --env-file .env -p 3001:3001 solarnaija-server:latest
```

Deploying to Vercel / Netlify Functions:
- You can convert `index.js` into a serverless function handler. Vercel requires exports in `/api` implementations. For small teams, deploying the server as a Docker container to Render or Fly is simpler and supports env vars out of the box.

Environment variables:
- Add all server secrets (Supabase service key, Paystack secret, Resend key, Africa's Talking key) into your host's environment variables manager — never commit them.

Health & monitoring:
- Add a process manager or use the platform's health checks. The server listens on $PORT and responds to requests; configure your host to restart on failures.

Rollback and migrations:
- If you add DB migrations (e.g., unique index for payment_reference), apply them through Supabase migrations or directly in the Supabase SQL editor before switching traffic.

If you want, I can prepare a ready-to-deploy Vercel serverless function or a GitHub Actions workflow that builds and pushes the Docker image to Docker Hub / GitHub Container Registry.
