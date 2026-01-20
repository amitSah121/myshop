import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailure from './pages/PaymentFailure';
import OrderHistory from './pages/OrderHistory';
import Wishlist from './pages/Wishlist';
import Addresses from './pages/Addresses';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminLogin from './pages/admin/AdminLogin';
import RiderDashboard from './pages/rider/RiderDashboard';
import RiderLogin from './pages/rider/RiderLogin';
import RiderRegister from './pages/rider/RiderRegister';
import Footer from './components/Footer';
import FloatingRiderButton from './components/FloatingRiderButton';
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <AuthProvider>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1A1A1A',
            color: '#fff',
          },
          success: {
            iconTheme: {
              primary: '#22C55E',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <CartProvider>
        <Router>
          <div style={{ minHeight: '100vh', background: '#FFFFFF' }}>
            <Navbar />
            
            <Routes>
              {/* ========================================
                  PUBLIC ROUTES (No authentication needed)
                  ======================================== */}
              
              {/* Home & Products */}
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              
              {/* Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Rider Public Routes */}
              <Route path="/rider/login" element={<RiderLogin />} />
              <Route path="/rider/register" element={<RiderRegister />} />
              
              {/* Admin Public Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              
              
              {/* ========================================
                  PROTECTED CUSTOMER ROUTES
                  ======================================== */}
              
              {/* Cart & Checkout - Require Customer Login */}
              <Route 
                path="/cart" 
                element={
                  <ProtectedRoute tokenKey="token" redirectTo="/login">
                    <Cart />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/checkout" 
                element={
                  <ProtectedRoute tokenKey="token" redirectTo="/login">
                    <Checkout />
                  </ProtectedRoute>
                } 
              />
              
              {/* Payment Pages - Require Customer Login */}
              <Route 
                path="/payment-success" 
                element={
                  <ProtectedRoute tokenKey="token" redirectTo="/login">
                    <PaymentSuccess />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/payment-failure" 
                element={
                  <ProtectedRoute tokenKey="token" redirectTo="/login">
                    <PaymentFailure />
                  </ProtectedRoute>
                } 
              />
              
              {/* Order History - Require Customer Login */}
              <Route 
                path="/orders" 
                element={
                  <ProtectedRoute tokenKey="token" redirectTo="/login">
                    <OrderHistory />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/my-orders" 
                element={
                  <ProtectedRoute tokenKey="token" redirectTo="/login">
                    <OrderHistory />
                  </ProtectedRoute>
                } 
              />
              
              {/* Wishlist - Require Customer Login */}
              <Route 
                path="/wishlist" 
                element={
                  <ProtectedRoute tokenKey="token" redirectTo="/login">
                    <Wishlist />
                  </ProtectedRoute>
                } 
              />
              
              {/* Addresses - Require Customer Login */}
              <Route 
                path="/addresses" 
                element={
                  <ProtectedRoute tokenKey="token" redirectTo="/login">
                    <Addresses />
                  </ProtectedRoute>
                } 
              />
              
              
              {/* ========================================
                  PROTECTED RIDER ROUTES
                  ======================================== */}
              
              <Route 
                path="/rider/dashboard" 
                element={
                  <ProtectedRoute tokenKey="riderToken" redirectTo="/rider/login">
                    <RiderDashboard />
                  </ProtectedRoute>
                } 
              />
              
              
              {/* ========================================
                  PROTECTED ADMIN ROUTES
                  ======================================== */}
              
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute tokenKey="adminToken" redirectTo="/admin/login">
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/admin/dashboard" 
                element={
                  <ProtectedRoute tokenKey="adminToken" redirectTo="/admin/login">
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              
              
              {/* ========================================
                  404 NOT FOUND
                  ======================================== */}
              <Route path="*" element={<NotFound />} />
            </Routes>

            <Footer />
            <FloatingRiderButton />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

// 404 Component
function NotFound() {
  return (
    <div style={{
      minHeight: '60vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '2rem'
    }}>
      <h1 style={{ fontSize: '4rem', margin: 0, color: '#2C3E50' }}>404</h1>
      <p style={{ fontSize: '1.5rem', color: '#8B8B8B', marginTop: '1rem' }}>
        Page not found
      </p>
      <p style={{ fontSize: '1rem', color: '#8B8B8B', marginTop: '0.5rem' }}>
        The page you're looking for doesn't exist.
      </p>
      <a href="/" style={{
        marginTop: '2rem',
        padding: '1rem 2rem',
        background: '#667eea',
        color: '#FFFFFF',
        textDecoration: 'none',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        fontSize: '0.875rem',
        fontWeight: '600',
        borderRadius: '8px',
        transition: 'all 0.3s'
      }}>
        🏠 Go Home
      </a>
    </div>
  );
}

export default App;
