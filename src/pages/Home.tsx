import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sun, Zap, Battery, Shield, MessageCircle, Star, ArrowRight } from 'lucide-react';
import { supabase } from '../App';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  rating: number;
}

const Home: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('featured', true)
        .limit(6);

      if (error) throw error;
      setFeaturedProducts(data || []);
    } catch (error) {
      console.error('Error fetching featured products:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    {
      name: 'Solar Inverters',
      description: 'High-efficiency inverters for your solar system',
      image: 'https://tse4.mm.bing.net/th/id/OIP.u5EX9fR_QBJ1O9c7508_YQAAAA?w=469&h=687&rs=1&pid=ImgDetMain&o=7&rm=3',
      path: '/products/inverters',
      icon: <Zap className="h-8 w-8" />
    },
    {
      name: 'Solar Batteries',
      description: 'Long-lasting batteries for energy storage',
      image: 'https://tse4.mm.bing.net/th/id/OIP.r2eVi912yQwkz4cdc8jP0wHaJE?rs=1&pid=ImgDetMain&o=7&rm=3',
      path: '/products/batteries',
      icon: <Battery className="h-8 w-8" />
    },
    {
      name: 'Solar Panels',
      description: 'Premium solar panels with excellent efficiency',
      image: 'https://inrorwxhikoolp5p-static.micyjz.com/cloud/lrBpjKlolrSRlkkrqiljio/weixinjietu_20240319152842.png',
      path: '/products/panels',
      icon: <Sun className="h-8 w-8" />
    },
    {
      name: 'Solar Kits',
      description: 'Complete solar solutions ready to install',
      image: 'https://tse3.mm.bing.net/th/id/OIP.YaNvto4aZnH1ej0VNLJ8_QAAAA?rs=1&pid=ImgDetMain&o=7&rm=3',
      path: '/products/kits',
      icon: <Shield className="h-8 w-8" />
    }
  ];

  const handleWhatsAppClick = () => {
    const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || "+2349012345678";
    const message = "Hi! I'm interested in your solar products. Can you help me?";
    const url = `https://wa.me/${whatsappNumber.replace('+', '')}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen">
  {/* Hero Section */}
  <section className="relative bg-gradient-to-br from-green-600 via-blue-600 to-green-700 text-white py-6 sm:py-20 min-h-[220px] sm:min-h-[420px]">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 sm:mb-6">
              Power Your Future with
              <span className="block text-yellow-400">Solar Energy</span>
            </h1>
            <p className="text-base sm:text-xl md:text-2xl mb-6 sm:mb-8 max-w-3xl mx-auto">
              Nigeria's premier destination for high-quality solar inverters, batteries, 
              panels and complete energy solutions. Clean energy, reliable power.
            </p>
            <div className="flex flex-row gap-3 justify-center items-center flex-wrap">
              <Link
                to="/products"
                className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-6 py-3 sm:px-8 sm:py-4 rounded-lg font-semibold sm:text-lg transition-colors inline-flex items-center justify-center"
              >
                Shop Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <button
                onClick={handleWhatsAppClick}
                className="border-2 border-white hover:bg-white hover:text-green-600 px-6 py-3 sm:px-8 sm:py-4 rounded-lg font-semibold sm:text-lg transition-colors inline-flex items-center justify-center"
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                Chat on WhatsApp
              </button>
            </div>
          </div>
        </div>
      </section>

  {/* Featured Products Section (moved up) */}
  <section className="py-8 sm:py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              Featured Products
            </h2>
            <p className="text-base text-gray-600">
              Discover our most popular and highly-rated solar products
            </p>
          </div>

          {loading ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 mx-auto"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              {featuredProducts.length > 0 ? (
                featuredProducts.map((product) => (
                  <div key={product.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-36 sm:h-44 object-cover rounded-t-xl"
                    />
                    <div className="p-3 sm:p-4">
                      <h3 className="text-md sm:text-lg font-semibold text-gray-900 mb-1 line-clamp-2">{product.name}</h3>
                      <div className="flex items-center mb-3">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < product.rating
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="text-sm text-gray-600 ml-2">({product.rating})</span>
                      </div>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                        <span className="text-lg font-bold text-green-600">₦{product.price.toLocaleString()}</span>

                        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                          <Link
                            to={`/product/${product.id}`}
                            className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm transition-colors text-center"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-600">No featured products available at the moment.</p>
                  <Link
                    to="/products"
                    className="inline-block mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    View All Products
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

  {/* Categories Section */}
  <section className="py-10 sm:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Shop by Category
            </h2>
            <p className="text-xl text-gray-600">
              Explore our comprehensive range of solar products
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <Link
                key={index}
                to={category.path}
                className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <div className="aspect-w-16 aspect-h-9">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center mb-3">
                    <div className="text-green-600 mr-3">
                      {category.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">{category.name}</h3>
                  </div>
                  <p className="text-gray-600 mb-4">{category.description}</p>
                  <div className="flex items-center text-green-600 font-medium">
                    Shop Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

  {/* 'Why Choose SolarNaija?' moved down below categories */}
  <section className="py-8 sm:py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Why Choose SolarNaija?</h2>
            <p className="text-base text-gray-600">We provide the best solar solutions with unmatched quality and service</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="mx-auto mb-4 p-3 bg-green-50 rounded-full w-fit">
                <Shield className="h-12 w-12 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Quality Guaranteed</h3>
              <p className="text-gray-600">All products come with comprehensive warranties and quality assurance</p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 p-3 bg-green-50 rounded-full w-fit">
                <MessageCircle className="h-12 w-12 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Expert Support</h3>
              <p className="text-gray-600">24/7 customer support via WhatsApp and dedicated helpline</p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 p-3 bg-green-50 rounded-full w-fit">
                <Star className="h-12 w-12 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Best Prices</h3>
              <p className="text-gray-600">Competitive pricing with flexible payment options including Paystack</p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 p-3 bg-green-50 rounded-full w-fit">
                <Zap className="h-12 w-12 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Fast Delivery</h3>
              <p className="text-gray-600">Quick and reliable delivery across Nigeria with real-time tracking</p>
            </div>
          </div>
        </div>
      </section>

  {/* CTA Section */}
  <section className="py-12 sm:py-16 bg-gradient-to-r from-green-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Go Solar?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Contact us today for expert advice on the best solar solution for your needs. 
            Our team is ready to help you make the switch to clean energy.
          </p>
          <button
            onClick={handleWhatsAppClick}
            className="bg-white hover:bg-gray-100 text-green-600 px-8 py-4 rounded-lg font-semibold text-lg transition-colors inline-flex items-center"
          >
            <MessageCircle className="mr-2 h-5 w-5" />
            Get Free Consultation
          </button>
        </div>
      </section>
    </div>
  );
};

export default Home;