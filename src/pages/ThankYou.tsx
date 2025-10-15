import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { trackFacebookPurchase } from '../utils/analytics';

type NavState = {
  reference?: string;
  orderId?: number | string;
  items?: Array<{ id: number; name: string; price: number; image?: string; quantity: number }>;
  total?: number;
};

const ThankYou: React.FC = () => {
  const location = useLocation();
  const state = (location.state as NavState) || {};
  const reference = state.reference || '';
  const items = state.items || [];
  const total = typeof state.total === 'number' ? state.total : items.reduce((s, it) => s + (it.price * it.quantity), 0);

  useEffect(() => {
    // Fire an explicit FB Pixel Purchase event for conversion matching.
    try {
      const event_id = (typeof crypto !== 'undefined' && typeof (crypto as any).randomUUID === 'function') ? (crypto as any).randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const content_ids = items.map(i => String(i.id));
      const value = Number(total) || 0;
      trackFacebookPurchase({ value, currency: 'NGN', content_ids, event_id, reference });
    } catch (err) {
      console.debug('FB pixel fire failed on ThankYou page', err);
    }
  }, [reference, total, items]);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Thank you for your order!</h1>
          <p className="text-gray-600 mb-4">We received your payment and are processing your order.</p>

          <div className="mb-6 text-sm text-gray-600">
            <div>Payment reference: <span className="font-medium">{reference || '—'}</span></div>
            {state.orderId && <div>Order ID: <span className="font-medium">{state.orderId}</span></div>}
          </div>

          <div className="border rounded-md overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 font-semibold">Order summary</div>
            <div className="px-6 py-4">
              {items.length === 0 ? (
                <p className="text-sm text-gray-500">No item details available.</p>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {items.map((item) => (
                    <li key={item.id} className="flex items-center justify-between py-4">
                      <div className="flex items-center space-x-4">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded" />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-gray-400">#</div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.name}</div>
                          <div className="text-xs text-gray-500">Qty: {item.quantity}</div>
                        </div>
                      </div>
                      <div className="text-sm font-semibold text-gray-900">₦{(item.price * item.quantity).toLocaleString()}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="px-6 py-4 bg-gray-50 flex items-center justify-between font-semibold">
              <div>Total</div>
              <div>₦{(total || 0).toLocaleString()}</div>
            </div>
          </div>

          <div className="mt-6 flex space-x-3">
            <Link to="/products" className="inline-block bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg">
              Continue Shopping
            </Link>
            <Link to="/" className="inline-block border border-gray-300 px-5 py-2 rounded-lg text-gray-700 hover:bg-gray-50">
              Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThankYou;
