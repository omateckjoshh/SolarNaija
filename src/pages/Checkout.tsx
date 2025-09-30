import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, User, MapPin, Phone, Mail, Shield } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { supabase } from '../App';
import { sendOrderNotification, sendSMSNotification } from '../utils/notifications';

// PayStack configuration (script is loaded dynamically when needed)

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
}

const Checkout: React.FC = () => {
  const { items, getTotalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const { name, email, phone, address } = customerInfo;
    if (!name.trim() || !email.trim() || !phone.trim() || !address.trim()) {
      alert('Please fill in all required fields');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Please enter a valid email address');
      return false;
    }
    
    return true;
  };

  const createOrder = async (paymentReference: string) => {
    try {
      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          customer_name: customerInfo.name,
          customer_email: customerInfo.email,
          customer_phone: customerInfo.phone,
          customer_address: customerInfo.address,
          total_amount: getTotalPrice(),
          status: 'confirmed',
          payment_reference: paymentReference
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.id,
        product_name: item.name,
        product_price: item.price,
        quantity: item.quantity,
        subtotal: item.price * item.quantity
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      return order;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  };

  const handlePayment = async () => {
    if (!validateForm()) return;

    const paystackKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_live_fb5f8bdb1daf16b9c963451880e58f88e3e6637a';
    if (!paystackKey) {
      alert('Payment system is not configured. Please contact support.');
      return;
    }

    const amount = Number(getTotalPrice());
    if (!amount || amount <= 0) {
      alert('Invalid payment amount. Please check your cart.');
      return;
    }

    setLoading(true);

    // Ensure Paystack script is loaded
    const loadPaystackScript = () => new Promise<void>((resolve, reject) => {
      if ((window as any).PaystackPop) return resolve();
      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Paystack script'));
      document.body.appendChild(script);
    });

    try {
      await loadPaystackScript();
      const Paystack = (window as any).PaystackPop;
      if (!Paystack) throw new Error('Paystack is not available');

      // Ensure setup exists
      if (typeof Paystack.setup !== 'function') throw new Error('Paystack.setup is not a function');

      const handlePaymentSuccess = async (response: any) => {
        try {
          const apiEndpoint = import.meta.env.VITE_API_ENDPOINT;

          // If a backend endpoint is configured, call it to verify payment and create order
          if (apiEndpoint) {
            // Verify payment server-side
            const verifyResp = await fetch(`${apiEndpoint.replace(/\/$/, '')}/verify-payment`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ reference: response.reference })
            });

            if (!verifyResp.ok) {
              const txt = await verifyResp.text().catch(() => '');
              throw new Error('Payment verification failed: ' + txt);
            }

            // Create order server-side
            const createResp = await fetch(`${apiEndpoint.replace(/\/$/, '')}/create-order`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                customer: customerInfo,
                items: items,
                paymentReference: response.reference,
                verify: false // we already verified above
              })
            });

            if (!createResp.ok) {
              const txt = await createResp.text().catch(() => '');
              throw new Error('Server order creation failed: ' + txt);
            }

            await createResp.json();
            // Optionally notify client-side analytics
            clearCart();
            navigate('/', { state: { orderSuccess: true, reference: response.reference } });
            return;
          }

          // Fallback: existing client-side order creation and notifications
          const order = await createOrder(response.reference);
          await sendOrderNotification(order);
          await sendSMSNotification(
            customerInfo.phone,
            `Thank you for your order! Your payment of ₦${getTotalPrice().toLocaleString()} has been confirmed. Reference: ${response.reference}. We'll contact you soon for delivery details.`
          );
          clearCart();
          navigate('/', { state: { orderSuccess: true, reference: response.reference } });
        } catch (error) {
          console.error('Order creation failed:', error);
          alert('Payment succeeded but order creation failed. Please contact support with reference: ' + response.reference);
        } finally {
          setLoading(false);
        }
      };

      const handler = Paystack.setup({
        key: paystackKey,
        email: customerInfo.email,
        amount: Math.round(amount * 100), // kobo
        currency: 'NGN',
        firstname: customerInfo.name.split(' ')[0] || customerInfo.name,
        lastname: customerInfo.name.split(' ').slice(1).join(' ') || '',
        phone: customerInfo.phone,
        metadata: {
          custom_fields: [
            { display_name: 'Address', variable_name: 'address', value: customerInfo.address }
          ]
        },
        // Provide plain functions so Paystack sees valid function attributes
        callback: function(response: any) {
          try {
            // quick type/log check
            console.log('Paystack callback invoked, response:', response);
            if (!response || !response.reference) {
              console.warn('Paystack response missing reference', response);
            }
            // call async worker
            void handlePaymentSuccess(response);
          } catch (cbErr) {
            console.error('Error in Paystack callback wrapper:', cbErr);
            setLoading(false);
          }
        },
        onClose: function() {
          setLoading(false);
          console.info('Paystack payment window closed by user');
        }
      });

      // Open Paystack iframe
      handler.openIframe();
    } catch (err: any) {
      console.error('Payment initialization failed:', err);
      alert(err?.message || 'Failed to initialize payment. Please try again later.');
      setLoading(false);
    }
  };

  const handleWhatsAppOrder = () => {
    if (!validateForm()) return;

    const orderDetails = items.map(item => 
      `${item.name} - Qty: ${item.quantity} - ₦${(item.price * item.quantity).toLocaleString()}`
    ).join('\n');

    const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || "+2349012345678";
    const message = `Hi! I want to place an order:\n\nCustomer Details:\nName: ${customerInfo.name}\nEmail: ${customerInfo.email}\nPhone: ${customerInfo.phone}\nAddress: ${customerInfo.address}\n\nOrder Details:\n${orderDetails}\n\nTotal: ₦${getTotalPrice().toLocaleString()}\n\nPlease confirm this order and payment details.`;
    
    const url = `https://wa.me/${whatsappNumber.replace('+', '')}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No items in cart</h2>
          <p className="text-gray-600 mb-6">Add some products before checkout</p>
          <button
            onClick={() => navigate('/products')}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Customer Information Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <User className="mr-2 h-5 w-5" />
              Customer Information
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={customerInfo.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter your full name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={customerInfo.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={customerInfo.phone}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter your phone number"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Address *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <textarea
                    name="address"
                    value={customerInfo.address}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    placeholder="Enter your complete delivery address"
                    required
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              {items.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 py-3 border-b border-gray-100">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">
                    ₦{(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
            
            <div className="border-t border-gray-200 pt-4 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>₦{getTotalPrice().toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="flex justify-between text-lg font-semibold text-gray-900">
                <span>Total</span>
                <span>₦{getTotalPrice().toLocaleString()}</span>
              </div>
            </div>
            
            {/* Payment Options */}
            <div className="mt-8 space-y-4">
              <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-5 w-5" />
                    Pay with Paystack
                  </>
                )}
              </button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">or</span>
                </div>
              </div>
              
              <button
                onClick={handleWhatsAppOrder}
                className="w-full border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center"
              >
                <Shield className="mr-2 h-5 w-5" />
                Order via WhatsApp
              </button>
            </div>
            
            <div className="mt-4 text-xs text-gray-500 text-center">
              <p>🔒 Your payment information is secure and encrypted</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;