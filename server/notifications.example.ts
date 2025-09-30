// Example server-side notification handler (Node/Express / serverless-friendly)
// Save as a real server file (e.g., in a serverless function) and deploy.
// This keeps API keys off the client and is the recommended production approach.

import express from 'express';
import fetch from 'node-fetch';

const app = express();
app.use(express.json());

const RESEND_API_KEY = process.env.RESEND_API_KEY!;
const AFRICASTALKING_API_KEY = process.env.AFRICASTALKING_API_KEY!;
const AFRICASTALKING_USERNAME = process.env.AFRICASTALKING_USERNAME || 'sandbox';
const AFRICASTALKING_FROM = process.env.AFRICASTALKING_FROM || 'SolarNaija';
const FROM_EMAIL = process.env.FROM_EMAIL || 'orders@solarnaija.store';
const FROM_NAME = process.env.FROM_NAME || 'SolarNaija';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'support@solarnaija.store';

app.post('/notify', async (req, res) => {
  const { type, order, phone, message } = req.body || {};

  try {
    if (type === 'order' && order) {
      // Send email via Resend
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `${FROM_NAME} <${FROM_EMAIL}>`,
          to: [ADMIN_EMAIL, order.customer_email].filter(Boolean),
          subject: `Order #${order.id} - SolarNaija`,
          html: `<h2>New Order</h2><p>Order ID: ${order.id}</p>`
        })
      });

      // Optionally send SMS via Africa's Talking
      if (AFRICASTALKING_API_KEY && order.customer_phone) {
        await fetch('https://api.africastalking.com/version1/messaging', {
          method: 'POST',
          headers: {
            'apiKey': AFRICASTALKING_API_KEY,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            username: AFRICASTALKING_USERNAME,
            to: order.customer_phone,
            message: `Thank you for your order #${order.id}`,
            from: AFRICASTALKING_FROM,
          })
        });
      }

      return res.status(200).json({ ok: true });
    }

    if (type === 'sms' && phone && message) {
      // Send SMS only
      await fetch('https://api.africastalking.com/version1/messaging', {
        method: 'POST',
        headers: {
          'apiKey': AFRICASTALKING_API_KEY,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          username: AFRICASTALKING_USERNAME,
          to: phone,
          message,
          from: AFRICASTALKING_FROM,
        })
      });

      return res.status(200).json({ ok: true });
    }

    return res.status(400).json({ error: 'Invalid payload' });
  } catch (err: any) {
    console.error('Notification handler error', err);
    return res.status(500).json({ error: 'Notification failed' });
  }
});

export default app;
