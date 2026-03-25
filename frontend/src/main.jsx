import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
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
          
          {/* Đã tháo <ProtectedRoute> để khách vãng lai (chưa đăng nhập) vẫn xem được giỏ hàng */}
          <Route path="/cart" element={<Cart />} />
          
          <Route path="/product/:id" element={<ProductDetail />} />
          
          {/* Đã tháo <PublicRoute> để ai cũng có thể quay về trang Landing */}
          <Route path="/landing" element={<LandingPage />} />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          
        </Routes>
        <ChatBot />
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>,
)