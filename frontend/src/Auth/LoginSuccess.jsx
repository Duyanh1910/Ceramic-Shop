import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { message, Spin } from 'antd';
import axios from 'axios';
import { saveSession } from '../useAuth.js';
import { Helmet } from 'react-helmet-async';

const BACKEND_URL = 'https://ceramic-shop-u8ak.onrender.com';

function LoginSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserAndLogin = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/v1/auth/me`, {
          withCredentials: true 
        });
        
        const user = response.data.user || response.data.result || response.data;
        const currentUsername = user.profile?.TenKhachHang || user.username || 'Khách hàng';
        const currentRole = user.role || 'Customer';
        
        const token = response.data.token || response.data.result?.token || user.token;

        saveSession(currentUsername, currentRole, true, token);

        message.success('Đăng nhập mạng xã hội thành công!');
        
        if (currentRole === 'Admin' || currentRole === 'Staff') {
            navigate('/admin', { replace: true });
        } else {
            navigate('/home', { replace: true });
        }
        
      } catch (error) {
        console.error('Lỗi xác thực OAuth:', error);
        message.error('Phiên đăng nhập không hợp lệ, vui lòng thử lại!');
        navigate('/login', { replace: true });
      }
    };

    fetchUserAndLogin();
  }, [navigate]);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9f9f9' }}>
      <Helmet><title>Đang xác thực... | Ceramic Shop</title></Helmet>
      <Spin size="large" />
      <h2 style={{ marginTop: '20px', color: '#1b437c', fontFamily: "'Arsenal', sans-serif" }}>
        Đang đồng bộ tài khoản...
      </h2>
      <p style={{ color: '#666' }}>Vui lòng đợi trong giây lát.</p>
    </div>
  );
}

export default LoginSuccess;