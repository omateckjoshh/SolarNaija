4
require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const AFRICASTALKING_API_KEY = process.env.AFRICASTALKING_API_KEY;
const AFRICASTALKING_USERNAME = process.env.AFRICASTALKING_USERNAME || 'sandbox';
const AFRICASTALKING_FROM = process.env.AFRICASTALKING_FROM || 'SolarNaija';
const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET;
const FROM_EMAIL = process.env.FROM_EMAIL || 'orders@solarnaija.store';
const FROM_NAME = process.env.FROM_NAME || 'SolarNaija';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'support@solarnaija.store';
const FB_PIXEL_ID = process.env.FB_PIXEL_ID || process.env.VITE_FB_PIXEL_ID;
const FB_CAPI_ACCESS_TOKEN = process.env.FB_CAPI_ACCESS_TOKEN;
const crypto = require('crypto');

function sha256Lower(input = '') {
  return crypto.createHash('sha256').update(String(input || '').trim().toLowerCase()).digest('hex');
}

async function sendFacebookCAPI({ pixelId, accessToken, eventName = 'Purchase', eventId, value = 0, currency = 'NGN', email, phone, content_ids = [], order_id, event_source_url = '' }) {
  if (!pixelId || !accessToken) return null;
  try {
    const body = {
      data: [
        {
          event_name: eventName,
          event_time: Math.floor(Date.now() / 1000),
          event_id: eventId,
          event_source_url,
          user_data: {
            em: email ? sha256Lower(email) : undefined,
            ph: phone ? sha256Lower(String(phone).replace(/\D/g, '')) : undefined
          },
          custom_data: {
            value,
            currency,
            content_ids: content_ids || [],
            order_id
          }
        }
      ]
    };

    const resp = await fetch(`https://graph.facebook.com/v16.0/${pixelId}/events?access_token=${accessToken}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const json = await resp.json();
    console.log('FB CAPI response', json);
    return json;
  } catch (err) {
    console.error('sendFacebookCAPI error', err);
    return null;
  }
}

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Supabase server keys are required. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  // we continue so developer can still run non-signed modes locally, but endpoints will fail.
}

let supabase = null;
if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
} else {
  console.warn('Warning: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set. Supabase operations will be disabled.');
}

// Health check
app.get('/health', (req, res) => {
  return res.json({ ok: true, supabase: !!supabase });
});

// Helper: verify Paystack payment (server-side) with secret key
app.post('/verify-payment', async (req, res) => {
  try {
    const { reference } = req.body;
    if (!reference) return res.status(400).json({ error: 'Missing reference' });

    if (!PAYSTACK_SECRET) return res.status(500).json({ error: 'Paystack secret not configured' });

    const resp = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` }
    });

    const data = await resp.json();
    if (!data.status) return res.status(502).json({ error: 'Paystack verification failed', details: data });

    if (data.data.status !== 'success') {
      return res.status(400).json({ error: 'Payment not successful', status: data.data.status });
    }

    return res.json({ ok: true, data: data.data });
  } catch (err) {
    console.error('verify-payment error', err);
    return res.status(500).json({ error: 'Verification failed' });
  }
});

// Create order server-side (secure) - expects verified paymentReference or will verify it
app.post('/create-order', async (req, res) => {
  try {
    const { customer, items, paymentReference, verify = true } = req.body;
    if (!customer || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Missing payload' });
    }

    // Optionally verify payment via Paystack
    if (verify) {
      if (!PAYSTACK_SECRET) return res.status(500).json({ error: 'Paystack secret not configured' });
      const vr = await fetch(`https://api.paystack.co/transaction/verify/${paymentReference}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` }
      });
      const vdata = await vr.json();
      if (!vdata.status || vdata.data.status !== 'success') {
        return res.status(400).json({ error: 'Payment verification failed', details: vdata });
      }
    }

    const total = items.reduce((s, it) => s + (it.price * (it.quantity || 1)), 0);

    if (!supabase) return res.status(500).json({ error: 'Supabase not configured on server' });

    // Idempotency: if an order already exists with this payment reference, return it
    if (paymentReference) {
      const { data: existing } = await supabase
        .from('orders')
        .select('*')
        .eq('payment_reference', paymentReference)
        .maybeSingle();
      if (existing) {
        console.log('Order already exists for reference', paymentReference);
        return res.json({ ok: true, order: existing, message: 'existing' });
      }
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{
        customer_name: customer.name,
        customer_email: customer.email,
        customer_phone: customer.phone,
        customer_address: customer.address,
        total_amount: total,
        status: 'confirmed',
        payment_reference: paymentReference
      }])
      .select()
      .single();

    if (orderError) throw orderError;

    const orderItems = items.map(i => ({
      order_id: order.id,
      product_id: i.id,
      product_name: i.name,
      product_price: i.price,
      quantity: i.quantity,
      subtotal: i.price * i.quantity
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
    if (itemsError) throw itemsError;

    // fire off notifications (non-blocking)
    try {
      // email via Resend
      if (RESEND_API_KEY) {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: `${FROM_NAME} <${FROM_EMAIL}>`,
            to: [ADMIN_EMAIL, customer.email].filter(Boolean),
            subject: `Order #${order.id} - SolarNaija`,
            html: `<h2>Order Received</h2><p>Order ID: ${order.id}</p><p>Total: ₦${total.toLocaleString()}</p>`
          })
        });
      }

      // SMS via Africa's Talking
      if (AFRICASTALKING_API_KEY && customer.phone) {
        await fetch('https://api.africastalking.com/version1/messaging', {
          method: 'POST',
          headers: {
            'apiKey': AFRICASTALKING_API_KEY,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            username: AFRICASTALKING_USERNAME,
            to: customer.phone,
            message: `Thank you for your order #${order.id}. Total: ₦${total.toLocaleString()}`,
            from: AFRICASTALKING_FROM
          })
        });
      }
    } catch (notifErr) {
      console.error('Notification sending failed (non-fatal):', notifErr);
    }

    // Server-side Facebook Conversions API (non-blocking)
    try {
      const { event_id } = req.body || {};
      if (FB_PIXEL_ID && FB_CAPI_ACCESS_TOKEN) {
        // send CAPI event asynchronously
        void sendFacebookCAPI({
          pixelId: FB_PIXEL_ID,
          accessToken: FB_CAPI_ACCESS_TOKEN,
          eventName: 'Purchase',
          eventId: event_id || undefined,
          value: total,
          currency: 'NGN',
          email: customer.email,
          phone: customer.phone,
          content_ids: orderItems.map(i => String(i.product_id)),
          order_id: order.id,
          event_source_url: req.get('origin') || ''
        });
      }
    } catch (capiErr) {
      console.error('Facebook CAPI send failed (non-fatal):', capiErr);
    }

    return res.json({ ok: true, order });
  } catch (err) {
    console.error('create-order error', err);
    return res.status(500).json({ error: 'Order creation failed', details: err.message || err });
  }
});

// Generic notify endpoint
app.post('/notify', async (req, res) => {
  try {
    const { type, order, phone, message } = req.body || {};

    if (type === 'order' && order) {
      // Send email via Resend
      if (RESEND_API_KEY) {
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
            html: `<h2>Order</h2><p>Order ID ${order.id}</p>`
          })
        });
      }

      // Send SMS
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
            from: AFRICASTALKING_FROM
          })
        });
      }

      return res.json({ ok: true });
    }

    if (type === 'sms' && phone && message) {
      if (!AFRICASTALKING_API_KEY) return res.status(500).json({ error: 'SMS provider not configured' });
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
          from: AFRICASTALKING_FROM
        })
      });
      return res.json({ ok: true });
    }

    return res.status(400).json({ error: 'Invalid payload' });
  } catch (err) {
    console.error('notify error', err);
    return res.status(500).json({ error: 'Notification failed' });
  }
});

// Lightweight endpoint to accept FB Conversions API events from the client (useful for fallbacks)
app.post('/fb-capi', async (req, res) => {
  try {
    const { event_id, value = 0, currency = 'NGN', email, phone, content_ids = [], order_id, event_name = 'Purchase', event_source_url } = req.body || {};

    if (!FB_PIXEL_ID || !FB_CAPI_ACCESS_TOKEN) {
      return res.status(500).json({ error: 'Facebook CAPI not configured on server' });
    }

    const result = await sendFacebookCAPI({
      pixelId: FB_PIXEL_ID,
      accessToken: FB_CAPI_ACCESS_TOKEN,
      eventName: event_name,
      eventId: event_id,
      value,
      currency,
      email,
      phone,
      content_ids,
      order_id,
      event_source_url: event_source_url || req.get('origin') || ''
    });

    return res.json({ ok: true, result });
  } catch (err) {
    console.error('/fb-capi error', err);
    return res.status(500).json({ error: 'FB CAPI failed', details: err.message || err });
  }
});

// Prerendered product page for social crawlers
app.get('/product/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).send('Invalid product id');

    if (!supabase) return res.status(500).send('Supabase not configured on server');

    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Supabase product fetch error', error);
      return res.status(500).send('Product fetch failed');
    }

    if (!product) return res.status(404).send('Product not found');

    // Build absolute image URL: prefer product.image if absolute, otherwise try SITE_URL or SUPABASE_URL
    const SITE_URL = process.env.SITE_URL || process.env.VITE_SITE_URL || '';
    let imageUrl = product.image || '';
    if (imageUrl && !/^https?:\/\//i.test(imageUrl)) {
      if (SITE_URL) imageUrl = SITE_URL.replace(/\/$/, '') + '/' + imageUrl.replace(/^\//, '');
      else if (process.env.SUPABASE_URL) imageUrl = process.env.SUPABASE_URL.replace(/\/$/, '') + '/' + imageUrl.replace(/^\//, '');
    }

    const title = String(product.name || 'SolarNaija Product');
    const description = String((product.description || '').replace(/\n/g, ' ')).slice(0, 300);
    const url = (SITE_URL || '') + `/product/${id}`;

    const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

    const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}" />

    <!-- Open Graph -->
    <meta property="og:type" content="product" />
    <meta property="og:title" content="${esc(title)}" />
    <meta property="og:description" content="${esc(description)}" />
    <meta property="og:url" content="${esc(url)}" />
    <meta property="og:image" content="${esc(imageUrl)}" />

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(title)}" />
    <meta name="twitter:description" content="${esc(description)}" />
    <meta name="twitter:image" content="${esc(imageUrl)}" />

    <link rel="canonical" href="${esc(url)}" />
    <script>/* redirect human users to SPA product page after meta tags */
      (function(){
        try { if (!/facebookexternalhit|Twitterbot|Slackbot|Discordbot|WhatsApp|Facebot|LinkedInBot|Pinterest/i.test(navigator.userAgent)) {
          window.location.replace('${esc(url)}');
        }}catch(e){}
      })();
    </script>
  </head>
  <body>
    <p>Redirecting to product page…</p>
    <script>
      // fallback redirect
      setTimeout(function(){ window.location.href = '${esc(url)}'; }, 700);
    </script>
  </body>
</html>`;

    res.set('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(html);
  } catch (err) {
    console.error('/product/:id prerender error', err);
    return res.status(500).send('Server error');
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Server listening on ${port}`));
