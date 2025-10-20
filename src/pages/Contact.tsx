import React from 'react';
import Meta from '../components/Meta';

const Contact: React.FC = () => {
  const title = 'Contact SolarNaija | Expert Solar Advice & Free Consultation';
  const description = 'Reach out to SolarNaija today for expert solar advice, installation support, or a free quote. Call, email, or chat via WhatsApp for fast assistance.';
  const keywords = 'solar contact Nigeria, solar consultation, solar installer Nigeria, solar company contact, renewable energy support';

  const image = '/social-contact.png';

  return (
    <div className="min-h-screen bg-gray-50 py-12">
  <Meta title={title} description={description} keywords={keywords} image={image} />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Contact SolarNaija</h1>
        <p className="text-gray-600 mb-6">{description}</p>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-3">Get in touch</h2>
          <p className="text-gray-700 mb-4">You can reach us via WhatsApp, email, or phone. We typically respond within a few hours.</p>

          <ul className="space-y-3 text-gray-700">
            <li><strong>WhatsApp:</strong> <a href={`https://wa.me/${(import.meta.env.VITE_WHATSAPP_NUMBER || '+2348169250046').replace('+','')}`} className="text-green-600">Chat with us</a></li>
            <li><strong>Email:</strong> <a href="mailto:support@solarnaija.store" className="text-green-600">support@solarnaija.store</a></li>
            <li><strong>Phone:</strong> {(import.meta.env.VITE_WHATSAPP_NUMBER || '+2348169250046')}</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Contact;
