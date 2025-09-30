// Notifications utility
// Notes:
// - For security, prefer configuring a server-side notification endpoint and set
//   VITE_NOTIFICATION_ENDPOINT to that URL. That keeps API keys off the client bundle.
// - If VITE_NOTIFICATION_ENDPOINT is not set, this file will attempt to call
//   external provider APIs directly (which requires API keys in the client and
//   is NOT recommended for production).
export const sendOrderNotification = async (orderData: any) => {
  const serverEndpoint = import.meta.env.VITE_NOTIFICATION_ENDPOINT;
  const resendApiKey = import.meta.env.VITE_RESEND_API_KEY;
  const fromEmail = import.meta.env.VITE_EMAIL_FROM_ADDRESS || 'orders@solarnaija.store';
  const fromName = import.meta.env.VITE_EMAIL_FROM_NAME || 'SolarNaija';
  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'support@solarnaija.store';

  // If a server endpoint is configured, delegate notifications to the server.
  if (serverEndpoint) {
    try {
      const resp = await fetch(serverEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'order', order: orderData }),
      });
      if (!resp.ok) throw new Error(`Server notification endpoint returned ${resp.status}`);
      console.log('Notification request sent to server endpoint');
      return;
    } catch (err) {
      console.error('Failed to call server notification endpoint:', err);
      // fallthrough to client-side attempt if keys are provided (not ideal)
    }
  }

  if (!resendApiKey) {
    console.warn('Resend API key not configured and no server endpoint provided - skipping email notification');
    return;
  }

  // Build recipients: admin + customer if available
  const recipients = [adminEmail];
  if (orderData?.customer_email) recipients.push(orderData.customer_email);

  const html = `
    <h2>Order ${orderData?.id ? `#${orderData.id}` : ''} - SolarNaija</h2>
    <p><strong>Customer:</strong> ${orderData?.customer_name || '—'}</p>
    <p><strong>Email:</strong> ${orderData?.customer_email || '—'}</p>
    <p><strong>Phone:</strong> ${orderData?.customer_phone || '—'}</p>
    <p><strong>Address:</strong> ${orderData?.customer_address || '—'}</p>
    <p><strong>Total Amount:</strong> ₦${Number(orderData?.total_amount || 0).toLocaleString()}</p>
    <p><strong>Payment Reference:</strong> ${orderData?.payment_reference || '—'}</p>
    <p><strong>Status:</strong> ${orderData?.status || '—'}</p>
  `;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${fromName} <${fromEmail}>`,
        to: recipients,
        subject: `Order ${orderData?.id ? `#${orderData.id}` : ''} - SolarNaija`,
        html,
      }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`Resend API error: ${response.status} ${text}`);
    }

    console.log('Order email notification sent (client-side Resend)');
  } catch (error) {
    console.error('Error sending order email notification:', error);
  }
};

// SMS notification utility using Africa's Talking
export const sendSMSNotification = async (phoneNumber: string, message: string) => {
  const serverEndpoint = import.meta.env.VITE_NOTIFICATION_ENDPOINT;
  const apiKey = import.meta.env.VITE_AFRICASTALKING_API_KEY;
  const username = import.meta.env.VITE_AFRICASTALKING_USERNAME || 'sandbox';
  const senderId = import.meta.env.VITE_AFRICASTALKING_SENDER_ID || 'SolarNaija';

  const normalizePhone = (p: string) => {
    if (!p) return p;
    let v = p.trim();
    // convert leading 0 to +234 (common Nigerian pattern)
    if (/^0\d{10}$/.test(v)) v = '+234' + v.slice(1);
    if (/^\d{10}$/.test(v)) v = '+234' + v;
    if (!v.startsWith('+')) v = '+' + v;
    return v;
  };

  const to = normalizePhone(phoneNumber) || phoneNumber;

  // Prefer server-side delivery if available
  if (serverEndpoint) {
    try {
      const resp = await fetch(serverEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'sms', phone: to, message }),
      });
      if (!resp.ok) throw new Error(`Server notification endpoint returned ${resp.status}`);
      console.log('SMS request sent to server endpoint');
      return;
    } catch (err) {
      console.error('Failed to call server notification endpoint for SMS:', err);
      // continue to client attempt if keys are present
    }
  }

  if (!apiKey) {
    console.warn("Africa's Talking API key not configured and no server endpoint provided - skipping SMS");
    return;
  }

  try {
    const response = await fetch('https://api.africastalking.com/version1/messaging', {
      method: 'POST',
      headers: {
        'apiKey': apiKey,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: new URLSearchParams({
        username: username,
        to,
        message,
        from: senderId,
      }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`Africa's Talking API error: ${response.status} ${text}`);
    }

    console.log('SMS notification sent successfully (client-side)');
  } catch (error) {
    console.error('Error sending SMS notification:', error);
  }
};