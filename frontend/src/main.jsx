import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import Home from './Home.jsx' 
import Login from './Login.jsx'
import Register from './Register.jsx'
import ProductDetail from './productDetail.jsx'
import LandingPage from './LandingPage.jsx'
import Profile from './Profile.jsx'
import Cart from './Cart.jsx'
import ChatBot from './ChatBot';
import ChangePassword from './ChangePassword.jsx'
import ForgotPassword from './ForgotPassword.jsx'

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const PublicRoute = ({ children }) => { 
  const token = localStorage.getItem('token');
  if (token) {
    return <Navigate to="/" replace />; 
  }
  return children;
};

const ConditionalChatBot = () => {
  const location = useLocation();
  
  const allowedPaths = ['/', '/profile'];
  const isAllowed = allowedPaths.includes(location.pathname);

  return (
    <div style={{ display: isAllowed ? 'block' : 'none' }}>
      <ChatBot />
    </div>
  );
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Navigate to="/" replace />} />
          
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
          
          <Route path="/cart" element={<Cart />} />
          <Route path="/product/:id" element={<PublicRoute><ProductDetail /></PublicRoute>} />
          <Route path="/landing" element={<LandingPage />} />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/change-password" element={
            <ProtectedRoute><ChangePassword /></ProtectedRoute>
          } />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Routes>
        
        <ConditionalChatBot />

      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>,
)