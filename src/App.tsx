import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import GoogleAnalytics from './components/GoogleAnalytics';
import WhatsAppFloat from './components/WhatsAppFloat';
import { initFacebookPixel } from './utils/analytics';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import ProductManagement from './pages/admin/ProductManagement';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import ThankYou from './pages/ThankYou';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Profile from './pages/Profile';
import ResetPassword from './pages/ResetPassword';
import Contact from './pages/Contact';
import About from './pages/About';

// Context
import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';

// Initialize Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }
  
  return user ? <>{children}</> : <Navigate to="/admin/login" />;
};

function App() {
  React.useEffect(() => {
    const pixelId = import.meta.env.VITE_FACEBOOK_PIXEL_ID;
    if (pixelId) {
      try {
        initFacebookPixel(pixelId as string);
      } catch (err) {
        console.debug('Failed to init FB pixel', err);
      }
    }
  }, []);
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <GoogleAnalytics />
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="pt-16">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<ProductList />} />
                <Route path="/products/:category" element={<ProductList />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/thank-you" element={<ThankYou />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/login" element={<Login />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/about" element={<About />} />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                
                {/* Admin Routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={
                  <AdminProtectedRoute>
                    <AdminDashboard />
                  </AdminProtectedRoute>
                } />
                <Route path="/admin/products" element={
                  <AdminProtectedRoute>
                    <ProductManagement />
                  </AdminProtectedRoute>
                } />
              </Routes>
            </main>
            <Footer />
            <WhatsAppFloat />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;