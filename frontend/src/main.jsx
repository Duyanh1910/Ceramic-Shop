import { StrictMode } from 'react'
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
import LoginSuccess from './LoginSuccess.jsx'
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
  const isCustomer = localStorage.getItem('customer_session_active') === 'true';
  const isAdmin = localStorage.getItem('admin_session_active') === 'true';

  let currentRole = null;
  if (isAdmin) currentRole = localStorage.getItem('admin_role');
  else if (isCustomer) currentRole = localStorage.getItem('customer_role');

  if (!isCustomer && !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentRole)) {
    if (currentRole === 'Admin' || currentRole === 'Staff') {
        return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/home" replace />;
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
          <Route path="/login-success" element={<LoginSuccess />} />
        </Routes>
        
        <ConditionalChatBot />
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>,
)