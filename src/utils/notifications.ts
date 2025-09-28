// Email notification utility using Resend API
export const sendOrderNotification = async (orderData: any) => {
  const resendApiKey = import.meta.env.VITE_RESEND_API_KEY;
  const fromEmail = import.meta.env.VITE_EMAIL_FROM_ADDRESS || 'orders@solarnaija.store';
  const fromName = import.meta.env.VITE_EMAIL_FROM_NAME || 'SolarNaija';
  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'support@solarnaija.store';

  if (!resendApiKey) {
    console.warn('Resend API key not configured');
    return;
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${fromName} <${fromEmail}>`,
        to: [adminEmail],
        subject: `New Order #${orderData.id} - SolarNaija`,
        html: `
          <h2>New Order Received</h2>
          <p><strong>Order ID:</strong> ${orderData.id}</p>
          <p><strong>Customer:</strong> ${orderData.customer_name}</p>
          <p><strong>Email:</strong> ${orderData.customer_email}</p>
          <p><strong>Phone:</strong> ${orderData.customer_phone}</p>
          <p><strong>Address:</strong> ${orderData.customer_address}</p>
          <p><strong>Total Amount:</strong> ₦${orderData.total_amount.toLocaleString()}</p>
          <p><strong>Payment Reference:</strong> ${orderData.payment_reference}</p>
          <p><strong>Status:</strong> ${orderData.status}</p>
        `,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send email notification');
    }

    console.log('Order notification sent successfully');
  } catch (error) {
    console.error('Error sending order notification:', error);
  }
};

// SMS notification utility using Africa's Talking
export const sendSMSNotification = async (phoneNumber: string, message: string) => {
  const apiKey = import.meta.env.VITE_AFRICASTALKING_API_KEY;
  const username = import.meta.env.VITE_AFRICASTALKING_USERNAME || 'sandbox';
  const senderId = import.meta.env.VITE_AFRICASTALKING_SENDER_ID || 'SolarNaija';

  if (!apiKey) {
    console.warn('Africa\'s Talking API key not configured');
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
        to: phoneNumber,
        message: message,
        from: senderId,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send SMS notification');
    }

    console.log('SMS notification sent successfully');
  } catch (error) {
    console.error('Error sending SMS notification:', error);
  }
};