import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, X, Search } from 'lucide-react';
import { useCart } from '../context/CartContext';

const categories = [
  { name: 'Inverters', path: '/products/inverters' },
  { name: 'Batteries', path: '/products/batteries' },
  { name: 'Solar Panels', path: '/products/panels' },
  { name: 'Kits', path: '/products/kits' },
  { name: 'Combos', path: '/products/combos' },
  { name: 'Charge Controllers', path: '/products/controllers' },
  { name: 'Solar Street Lights', path: '/products/street-lights' },
  { name: 'CCTV', path: '/products/cctv' },
  { name: 'Solar Gadgets', path: '/products/gadgets' },
];

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { getItemCount } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const itemCount = getItemCount();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Close overlay when clicking outside or pressing Escape
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (!isSearchOpen) return;
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (!isSearchOpen) return;
      if (e.key === 'Escape') setIsSearchOpen(false);
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSearchOpen]);

  // Auto-focus when opening
  useEffect(() => {
    if (isSearchOpen) {
      // small timeout to wait for transition
      setTimeout(() => inputRef.current?.focus(), 120);
    }
  }, [isSearchOpen]);

  // Keyboard shortcuts: / or Ctrl+K to open search (unless focused on an input)
  useEffect(() => {
    function handleGlobalKey(e: KeyboardEvent) {
      // ignore when focused in an input/textarea
      const active = document.activeElement;
      if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || (active as HTMLElement).isContentEditable)) return;

      if (e.key === '/' && !isSearchOpen) {
        e.preventDefault();
        setIsSearchOpen(true);
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((s) => !s);
      }
    }

    document.addEventListener('keydown', handleGlobalKey);
    return () => document.removeEventListener('keydown', handleGlobalKey);
  }, [isSearchOpen]);

  // Debounce updating the URL while typing so ProductList can fetch server-side results
  useEffect(() => {
    if (!isSearchOpen) return; // only update while overlay open
    const handler = setTimeout(() => {
      const q = searchQuery.trim();
      if (q) navigate(`/products?q=${encodeURIComponent(q)}`, { replace: true });
      else navigate('/products', { replace: true });
    }, 450);

    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const isAdmin = location.pathname.startsWith('/admin');

  if (isAdmin) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src="/logo.png" 
              alt="SolarNaija Logo" 
              className="h-10 w-auto object-contain"
            />
            <span className="text-xl font-bold text-gray-800">SolarNaija</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className="text-gray-700 hover:text-green-600 font-medium transition-colors"
            >
              Home
            </Link>
            
            {/* Products Dropdown */}
            <div className="relative group">
              <button className="flex items-center text-gray-700 hover:text-green-600 font-medium transition-colors">
                Products
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <div className="absolute top-full left-0 w-48 bg-white shadow-lg rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                {categories.map((category) => (
                  <Link
                    key={category.path}
                    to={category.path}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>

            <Link 
              to="/products" 
              className="text-gray-700 hover:text-green-600 font-medium transition-colors"
            >
              All Products
            </Link>
          </div>

          {/* Cart and Mobile Menu */}
          <div className="flex items-center space-x-4">
            {/* Search button + overlay */}
            <div className="relative">
              <button
                onClick={() => {
                  // Navigate to general products/search page with a smooth transition
                  navigate('/products');
                }}
                aria-label="Open product search"
                className="p-2 text-gray-700 hover:text-green-600 transition-colors"
              >
                <Search className="h-6 w-6" />
              </button>

              {/* Search overlay/input - kept in DOM for keyboard shortcuts (e.g., / or Ctrl+K).
                  Clicking the search icon no longer opens this overlay; it just navigates to /products. */}
              <div
                ref={searchRef}
                role="dialog"
                aria-modal="false"
                className={`absolute right-0 mt-2 w-full sm:w-80 bg-white/90 backdrop-blur-sm shadow-lg rounded-md p-3 z-50 transform transition-all duration-150 origin-top-right border border-gray-100 ${
                  isSearchOpen ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'
                }`}
                style={{ transitionProperty: 'opacity, transform' }}
              >
                <div className="flex items-center gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const q = searchQuery.trim();
                        if (q) navigate(`/products?q=${encodeURIComponent(q)}`);
                        else navigate('/products');
                        setIsSearchOpen(false);
                      }
                      if (e.key === 'Escape') {
                        setIsSearchOpen(false);
                      }
                    }}
                    placeholder="Search products..."
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200 ease-in-out placeholder-gray-400 focus:placeholder-transparent"
                  />

                  {/* Clear button inside overlay */}
                  {searchQuery && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        inputRef.current?.focus();
                      }}
                      aria-label="Clear search"
                      className="text-gray-500 hover:text-gray-700 p-1"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}

                  <button
                    onClick={() => {
                      const q = searchQuery.trim();
                      if (q) navigate(`/products?q=${encodeURIComponent(q)}`);
                      else navigate('/products');
                      setIsSearchOpen(false);
                    }}
                    className="px-3 py-2 bg-green-600 text-white rounded-md"
                  >
                    Search
                  </button>
                </div>
              </div>
            </div>
            <Link 
              to="/cart" 
              className="relative p-2 text-gray-700 hover:text-green-600 transition-colors"
            >
              <ShoppingCart className="h-6 w-6" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-700 hover:text-green-600"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                to="/"
                className="block px-3 py-2 text-gray-700 hover:text-green-600"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/products"
                className="block px-3 py-2 text-gray-700 hover:text-green-600"
                onClick={() => setIsMenuOpen(false)}
              >
                All Products
              </Link>
              {categories.map((category) => (
                <Link
                  key={category.path}
                  to={category.path}
                  className="block px-3 py-2 text-gray-700 hover:text-green-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;