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

  return isAllowed ? <ChatBot /> : null;
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
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/landing" element={<LandingPage />} />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
        </Routes>
        <ConditionalChatBot />

      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>,
)