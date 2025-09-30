import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Star, ShoppingCart, MessageCircle, Minus, Plus, Check, Facebook, Twitter, Linkedin, Share2, Copy, Instagram } from 'lucide-react';
import { trackEvent } from '../utils/analytics';
import { supabase } from '../App';
import { useCart } from '../context/CartContext';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
  specifications: Record<string, any>;
  rating: number;
  in_stock: boolean;
  features: string[];
}

const ProductDetail: React.FC = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (id) {
      fetchProduct(parseInt(id));
    }
  }, [id]);

  const fetchProduct = async (productId: number) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (error) throw error;
      setProduct(data);
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      // You could add a toast notification here
    }
  };

  const handleWhatsAppInquiry = () => {
    if (product) {
      const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || "+2349012345678";
      const message = `Hi! I'm interested in ${product.name}. Can you provide more information?`;
      const url = `https://wa.me/${whatsappNumber.replace('+', '')}?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
    }
  };

  // Sharing helpers
  const [copied, setCopied] = useState(false);

  const getProductUrl = () => {
    try {
      // If the page is already the canonical product URL, use it; otherwise construct
      return `${window.location.origin}/product/${product?.id}`;
    } catch (e) {
      return `https://your-site.example/product/${product?.id}`;
    }
  };

  const handleShareWeb = async () => {
    if (!product) return;
    const url = getProductUrl();
    const title = product.name;
    const text = `${product.name} - ₦${product.price.toLocaleString()}\n${product.description}`;
    if ((navigator as any).share) {
      try {
        await (navigator as any).share({ title, text, url });
        trackEvent('share', { method: 'web', productId: product.id });
      } catch (err) {
        // user probably cancelled
        console.debug('Web share canceled or failed', err);
      }
    } else {
      // fallback: open a simple share dialog (Twitter)
      const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
      window.open(shareUrl, '_blank', 'noopener');
      trackEvent('share', { method: 'twitter_intent', productId: product.id });
    }
  };

  const handleShareFacebook = () => {
    const url = getProductUrl();
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(shareUrl, '_blank', 'noopener');
    if (product) trackEvent('share', { method: 'facebook', productId: product.id });
  };

  const handleShareTwitter = () => {
    if (!product) return;
    const url = getProductUrl();
    const text = `${product.name} - ₦${product.price.toLocaleString()}`;
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(shareUrl, '_blank', 'noopener');
    trackEvent('share', { method: 'twitter', productId: product.id });
  };

  const handleShareLinkedin = () => {
    const url = getProductUrl();
    const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    window.open(shareUrl, '_blank', 'noopener');
    if (product) trackEvent('share', { method: 'linkedin', productId: product.id });
  };

  const handleCopyLink = async () => {
    const url = getProductUrl();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      if (product) trackEvent('share', { method: 'copy', productId: product.id });
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleShareInstagram = async () => {
    if (!product) return;
    const url = getProductUrl();
    const text = `${product.name} - ₦${product.price.toLocaleString()}\n${url}`;

    // Prefer Web Share API when available (it will surface Instagram if installed)
    if ((navigator as any).share) {
      try {
        await (navigator as any).share({ title: product.name, text, url });
        if (product) trackEvent('share', { method: 'web', productId: product.id });
        return;
      } catch (err) {
        console.debug('Web share failed', err);
      }
    }

    // Try Instagram deep link (mobile)
    try {
      const deep = `instagram://share?text=${encodeURIComponent(text)}`;
  // open in new window/tab; on mobile this may trigger the app
  window.open(deep, '_blank');
      // give it a moment; if nothing happens, we'll copy the link as a fallback
      setTimeout(async () => {
        try {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
          // also open Instagram web as a gentle fallback
          window.open('https://www.instagram.com', '_blank', 'noopener');
          if (product) trackEvent('share', { method: 'instagram_fallback', productId: product.id });
        } catch (err) {
          console.debug('Instagram fallback failed', err);
        }
      }, 600);
    } catch (err) {
      // final fallback: copy link and open Instagram web
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        window.open('https://www.instagram.com', '_blank', 'noopener');
        if (product) trackEvent('share', { method: 'instagram_fallback', productId: product.id });
      } catch (e) {
        console.error('Instagram share fallback failed', e);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
          <p className="text-gray-600">The product you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Product Image */}
            <div className="p-8">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-96 object-cover rounded-lg"
              />
            </div>

            {/* Product Info */}
            <div className="p-8">
              <div className="mb-4">
                <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
                  {product.category}
                </span>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>

              <div className="flex items-center mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < product.rating
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
                <span className="text-gray-600 ml-2">({product.rating} stars)</span>
              </div>

              <p className="text-gray-700 mb-6 leading-relaxed">{product.description}</p>

              {/* Features */}
              {product.features && product.features.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Features:</h3>
                  <ul className="space-y-2">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <Check className="h-5 w-5 text-green-600 mr-2" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Price */}
              <div className="mb-6">
                <span className="text-4xl font-bold text-green-600">
                  ₦{product.price.toLocaleString()}
                </span>
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center mb-6">
                <span className="text-gray-700 mr-4">Quantity:</span>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-gray-100"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-4 py-2 border-l border-r border-gray-300">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 hover:bg-gray-100"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <button
                  onClick={handleAddToCart}
                  disabled={!product.in_stock}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center"
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  {product.in_stock ? 'Add to Cart' : 'Out of Stock'}
                </button>
                <button
                  onClick={handleWhatsAppInquiry}
                  className="flex-1 border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center"
                >
                  <MessageCircle className="mr-2 h-5 w-5" />
                  WhatsApp Inquiry
                </button>
              </div>

              {/* Social Share Buttons */}
              <div className="flex items-center gap-3 mb-6">
                <button
                  onClick={handleShareWeb}
                  className="flex items-center gap-2 px-3 py-2 border rounded-md hover:bg-gray-50"
                  aria-label="Share product"
                  title="Share product (native share on mobile)"
                >
                  <Share2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Share</span>
                </button>

                <button onClick={handleShareFacebook} className="px-3 py-2 border rounded-md hover:bg-gray-50" aria-label="Share on Facebook" title="Share on Facebook">
                  <Facebook className="h-4 w-4 text-blue-600" />
                </button>

                <button onClick={handleShareTwitter} className="px-3 py-2 border rounded-md hover:bg-gray-50" aria-label="Share on Twitter" title="Share on Twitter">
                  <Twitter className="h-4 w-4 text-blue-400" />
                </button>

                <button onClick={handleShareLinkedin} className="px-3 py-2 border rounded-md hover:bg-gray-50" aria-label="Share on LinkedIn" title="Share on LinkedIn">
                  <Linkedin className="h-4 w-4 text-blue-700" />
                </button>

                <button onClick={handleShareInstagram} className="px-3 py-2 border rounded-md hover:bg-gray-50" aria-label="Share on Instagram" title="Share on Instagram">
                  <Instagram className="h-4 w-4 text-pink-600" />
                </button>

                <button onClick={handleWhatsAppInquiry} className="px-3 py-2 border rounded-md hover:bg-gray-50" aria-label="Share on WhatsApp" title="Contact on WhatsApp">
                  <MessageCircle className="h-4 w-4 text-green-600" />
                </button>

                <button onClick={handleCopyLink} className="px-3 py-2 border rounded-md hover:bg-gray-50" aria-label="Copy link" title="Copy product link">
                  <Copy className="h-4 w-4" />
                </button>

                {copied && <span className="text-sm text-green-600 ml-2">Link copied!</span>}
              </div>

              {/* Stock Status */}
              <div className="mb-4">
                {product.in_stock ? (
                  <span className="text-green-600 font-medium">✓ In Stock</span>
                ) : (
                  <span className="text-red-600 font-medium">✗ Out of Stock</span>
                )}
              </div>
            </div>
          </div>

          {/* Specifications */}
          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div className="border-t border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Specifications</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="border-b border-gray-100 pb-2">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}:
                      </span>
                      <span className="text-gray-600">{value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;