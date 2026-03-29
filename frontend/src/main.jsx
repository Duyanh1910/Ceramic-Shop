import { StrictMode} from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'

import LandingPage from './LandingPage.jsx'
import Home from './Home.jsx' 
import Login from './Login.jsx'
import Register from './Register.jsx'
import ProductDetail from './productDetail.jsx'
import Profile from './Profile.jsx'
import Cart from './Cart.jsx'
import ChatBot from './ChatBot'
import ChangePassword from './ChangePassword.jsx'
import ForgotPassword from './ForgotPassword.jsx'

import AdminLayout from './AdminLayout.jsx'
import AdminDashboard from './AdminDashboard.jsx'
import AdminProducts from './AdminProducts.jsx'
import AdminCustomers from './AdminCustomers.jsx'
import AdminStaffs from './AdminStaffs.jsx'

const PublicRoute = ({ children }) => {
  const isCustomerActive = localStorage.getItem('customer_session_active') === 'true';

  if (isCustomerActive) {
    return <Navigate to="/home" replace />;
  }
  return children;
};

const ProtectedRoute = ({ children, allowedRoles }) => {
  const isAdmin = allowedRoles.includes('Admin') || allowedRoles.includes('Staff');
  const prefix = isAdmin ? 'admin_' : 'customer_';
  
  const isActive = localStorage.getItem(prefix + 'session_active') === 'true';
  const role = localStorage.getItem(prefix + 'role');

  if (!isActive) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const ConditionalChatBot = () => {
  const location = useLocation();
  const allowedPaths = ['/home', '/profile', '/cart'];
  const isAllowed = allowedPaths.includes(location.pathname) || location.pathname.startsWith('/product/');

  return isAllowed ? <ChatBot /> : null;
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          <Route path="/register" element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } />

          <Route path="/home" element={<Home />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/profile" element={
            <ProtectedRoute allowedRoles={['Customer', 'Admin', 'Staff']}>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/change-password" element={
            <ProtectedRoute allowedRoles={['Customer', 'Admin', 'Staff']}>
              <ChangePassword />
            </ProtectedRoute>
          } />

          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['Admin', 'Staff']}>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="staffs" element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AdminStaffs />
              </ProtectedRoute>
            } />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        
        <ConditionalChatBot />
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>,
)