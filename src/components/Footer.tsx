import React from 'react';
import { Sun, Phone, Mail, MapPin, MessageCircle } from 'lucide-react';

const Footer: React.FC = () => {
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || "+2349012345678";
  const whatsappMessage = "Hi, I'm interested in your solar products!";
  
  const handleWhatsAppClick = () => {
    const url = `https://wa.me/${whatsappNumber.replace('+', '')}?text=${encodeURIComponent(whatsappMessage)}`;
    window.open(url, '_blank');
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <img 
                src="/logo.png" 
                alt="SolarNaija Logo" 
                className="h-10 w-auto object-contain"
              />
              <span className="text-xl font-bold">SolarNaija</span>
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              Nigeria's leading provider of high-quality solar energy solutions. 
              Powering homes and businesses with clean, renewable energy.
            </p>
            
            {/* WhatsApp Contact */}
            <button
              onClick={handleWhatsAppClick}
              className="inline-flex items-center space-x-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition-colors"
            >
              <MessageCircle className="h-5 w-5" />
              <span>Chat on WhatsApp</span>
            </button>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="/" className="text-gray-300 hover:text-white transition-colors">Home</a></li>
              <li><a href="/products" className="text-gray-300 hover:text-white transition-colors">All Products</a></li>
              <li><a href="/products/inverters" className="text-gray-300 hover:text-white transition-colors">Inverters</a></li>
              <li><a href="/products/batteries" className="text-gray-300 hover:text-white transition-colors">Batteries</a></li>
              <li><a href="/products/panels" className="text-gray-300 hover:text-white transition-colors">Solar Panels</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-green-500" />
                <span className="text-gray-300">{whatsappNumber}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-green-500" />
                <span className="text-gray-300">info@solarnaija.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-green-500" />
                <span className="text-gray-300">Lagos, Nigeria</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-300">
          <p>&copy; 2025 SolarNaija. All rights reserved. Powering Nigeria with clean energy.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;