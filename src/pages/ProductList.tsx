import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { Star, Search, ShoppingCart } from 'lucide-react';
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
}

const ProductList: React.FC = () => {
  const { category } = useParams();
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [total, setTotal] = useState(0);
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const initialQuery = params.get('q') || '';
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    fetchProducts();
  }, [category]);

  // Re-fetch when the query param changes (server-side search)
  useEffect(() => {
    // when the query param changes, reset to first page
    setPage(1);
  }, [location.search, category]);

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search, category, page]);

  // Keep search term in sync when the query param changes (e.g., from navbar search)
  useEffect(() => {
    const p = new URLSearchParams(location.search);
    const q = p.get('q') || '';
    setSearchTerm(q);
  }, [location.search]);

  const fetchProducts = async () => {
    try {
      const p = new URLSearchParams(location.search);
      const q = p.get('q') || '';

      const start = (page - 1) * pageSize;
      const end = start + pageSize - 1;

      // request exact count for pagination
      let query = supabase.from('products').select('*', { count: 'exact' });

      if (category) {
        query = query.eq('category', category);
      }

      if (q) {
        query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%`);
      }

      const { data, error, count } = await query.range(start, end);
      
      if (error) throw error;
      setProducts(data || []);
      setTotal(count ?? 0);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPrice = (!priceRange.min || product.price >= parseInt(priceRange.min)) &&
                          (!priceRange.max || product.price <= parseInt(priceRange.max));
      return matchesSearch && matchesPrice;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        default:
          return a.name.localeCompare(b.name);
      }
    });

  const categoryNames: Record<string, string> = {
    inverters: 'Solar Inverters',
    batteries: 'Solar Batteries',
    panels: 'Solar Panels',
    kits: 'Solar Kits',
    combos: 'Solar Combos',
    controllers: 'Charge Controllers'
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1);
    // You could add a toast notification here
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {category ? categoryNames[category] || 'Products' : 'All Products'}
          </h1>
          <p className="text-gray-600">
            Discover our range of high-quality solar products for your energy needs
          </p>
        </div>

  {/* Filters */}
  <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Price Range */}
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min Price"
                value={priceRange.min}
                onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <input
                type="number"
                placeholder="Max Price"
                value={priceRange.max}
                onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="name">Sort by Name</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          </div>
        ) : (
          <>
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
              {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                  <Link to={`/product/${product.id}`}>
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-40 sm:h-48 object-cover rounded-t-lg"
                    />
                  </Link>
                  
                  <div className="p-3 sm:p-4">
                    <Link to={`/product/${product.id}`}>
                      <h3 className="text-md sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2 hover:text-green-600 transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {product.description}
                    </p>
                    
                    <div className="flex items-center mb-2">
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
                      <span className="text-lg font-bold text-green-600">
                        ₦{product.price.toLocaleString()}
                      </span>

                      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <Link
                          to={`/product/${product.id}`}
                          className="w-full sm:w-auto bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg text-sm transition-colors text-center"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => handleAddToCart(product)}
                          disabled={!product.in_stock}
                          className="w-full sm:w-auto bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                        >
                          <ShoppingCart className="h-4 w-4" />
                          <span>{product.in_stock ? 'Add' : 'Out of Stock'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-600 text-lg">No products found matching your criteria.</p>
              </div>
            )}
          </div>
          {/* Pagination */}
          {total > pageSize && (
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 bg-white border rounded-md disabled:opacity-50"
              >
                Prev
              </button>

              {/* simple page indicators */}
              <div className="flex items-center gap-2">
                {Array.from({ length: Math.ceil(total / pageSize) }).map((_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`px-3 py-1 rounded-md ${pageNum === page ? 'bg-green-600 text-white' : 'bg-white border'}`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setPage((p) => Math.min(Math.ceil(total / pageSize), p + 1))}
                disabled={page === Math.ceil(total / pageSize)}
                className="px-3 py-1 bg-white border rounded-md disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProductList;