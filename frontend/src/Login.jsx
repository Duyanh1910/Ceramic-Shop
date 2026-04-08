import { useState } from 'react';
import axios from 'axios';
import { Button, Input, Form, message, Typography, Divider, Checkbox } from 'antd';
import { useNavigate } from 'react-router-dom';
import styles from './Login.module.css';
import { UserOutlined, LockOutlined, HomeFilled, ShopFilled } from '@ant-design/icons';
import { Helmet } from 'react-helmet-async';
import { saveSession } from './useAuth.js';

const { Text, Link } = Typography;

const BACKEND_URL = 'https://ceramic-shop-u8ak.onrender.com';
const API_BASE = `${BACKEND_URL}/api/v1`;

function Login() {
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (values) => {
    setLoading(true);
    try {
      const keysToRemove = [
        'customer_token', 'admin_token', 'token',
        'customer_session_active', 'admin_session_active',
        'role', 'username', 'customer_maKhachHang',
      ];
      keysToRemove.forEach((k) => localStorage.removeItem(k));

      const response = await axios.post(
        `${API_BASE}/auth/login`,
        { username: values.username, password: values.password, rememberMe },
        { withCredentials: true }
      );

      const user = response.data.user || response.data.result || response.data;
      const currentUsername = user.username || values.username;
      const currentRole = user.role || user.Role || 'Customer';
      const token = response.data.token || null;

      if (currentRole === 'Admin' || currentRole === 'Staff') {
        if (typeof saveSession === 'function') saveSession(currentUsername, currentRole, true, token);
        localStorage.setItem('admin_token', token);
        localStorage.setItem('admin_session_active', 'true');
        localStorage.setItem('role', currentRole);
        localStorage.setItem('username', currentUsername);
        setTimeout(() => { message.success(`Đăng nhập ${currentRole} thành công!`); navigate('/admin'); }, 800);
      } else {
        if (typeof saveSession === 'function') saveSession(currentUsername, 'Customer', true, token);
        localStorage.setItem('customer_token', token);
        localStorage.setItem('customer_session_active', 'true');
        localStorage.setItem('role', 'Customer');
        localStorage.setItem('username', currentUsername);
        setTimeout(() => { message.success('Đăng nhập thành công!'); navigate('/home'); }, 800);
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Đăng nhập thất bại!');
    } finally {
      setLoading(false);
    }
  };

  const modelSrc = passwordVisible ? '/Neko_glass.glb' : '/Neko_smile_1.glb';
  const modelAnimation = passwordVisible 
    ? 'PetChibiNeeko_KDASuperFan_Joke02cycle.Chibi_Neeko_KDASuperFan' 
    : 'Idle_Base';
  
  const messageText = passwordVisible ? 'Hihi tôi không nhìn trộm mật khẩu của bạn đâu' : 'Xin chào đây là trang đăng nhập của Ceramic-Shop';

  return (
    <div className={styles.loginContainer}>
      <Helmet><title>Đăng nhập | Ceramic Shop</title></Helmet>

      <style>{`
        .speech-bubble {
          position: absolute;
          top: 30px;
          right: 15px;
          background: #ffffff;
          border-radius: 16px;
          padding: 12px 18px;
          color: #173354;
          font-weight: 700;
          font-size: 13px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.12);
          z-index: 10;
          animation: floatBubble 2.5s ease-in-out infinite;
          border: 1px solid rgba(23, 51, 84, 0.1);
        }
        .speech-bubble::after {
          content: '';
          position: absolute;
          bottom: -10px;
          left: 24px;
          border-width: 10px 10px 0;
          border-style: solid;
          border-color: #ffffff transparent transparent transparent;
          display: block;
          width: 0;
        }
        @keyframes floatBubble {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        model-viewer {
          outline: none;
        }
        model-viewer::part(default-progress-bar) {
          display: none;
        }
      `}</style>

      <div className={styles.shape1} />
      <div className={styles.shape2} />
      <div className={styles.shape3} />

      <div className={styles.combinedCard}>
        <div className={styles.cardImage}>
          <div className={styles.phoenixWrap} style={{ position: 'relative', flexDirection: 'column' }}>
            
            <div className="speech-bubble">
              {messageText}
            </div>

            <model-viewer 
              src={modelSrc}
              alt="Trợ lý Irelia 3D" 
              autoplay 
              animation-name={modelAnimation}
              camera-orbit="0deg 75deg 70%" 
              field-of-view="25deg" 
              
              /* Nếu chibi VẪN CHƯA XUỐNG ĐỦ sâu, hãy tăng '1.2m' lên '1.5m' hoặc '2.0m' */
              camera-target="0m 2m 0m" 
              
              max-camera-orbit="auto auto 600%" 
              shadow-intensity="0" 
              interaction-prompt="none"
              disable-zoom
              disable-pan
              disable-tap
              style={{ 
                width: '100%', 
                height: '340px', 
                backgroundColor: 'transparent',
                /* Nếu đụng bong bóng chat, hãy tăng '40px' lên '50px' hoặc '60px' để đẩy toàn bộ khung xuống */
                marginTop: '60px' 
              }}
            ></model-viewer>
          </div>

          <div className={styles.brandFooter}>
            <span className={styles.brandName}>CERAMIC-SHOP</span>
            <span className={styles.brandSub}>TINH HOA GỐM SỨ VIỆT</span>
          </div>
        </div>

        <div className={styles.cardForm}>
          <div style={{ marginBottom: 15, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button 
              type="link" 
              onClick={() => navigate('/')} 
              className={styles.backButton}
            >
              <HomeFilled/> Trang chủ
            </Button>

            <Button 
              type="link" 
              onClick={() => navigate('/home')} 
              className={styles.backButton}
            >
               <ShopFilled/> Cửa hàng
            </Button>
          </div>

          <h2 className={styles.formTitle}>Chào mừng trở lại</h2>
          <p className={styles.formSubtitle}>Vui lòng đăng nhập để tiếp tục</p>

          <Form layout="vertical" onFinish={handleLogin}>
            <Form.Item
              label={<span className={styles.inputLabel}>Tên đăng nhập</span>}
              name="username"
              rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
            >
              <Input
                prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
                className={styles.customInput}
                placeholder="Nhập tên đăng nhập"
                size="large"
              />
            </Form.Item>

            <Form.Item
              label={<span className={styles.inputLabel}>Mật khẩu</span>}
              name="password"
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
                className={styles.customInput}
                placeholder="Nhập mật khẩu"
                size="large"
                visibilityToggle={{
                  visible: passwordVisible,
                  onVisibleChange: (v) => setPasswordVisible(v),
                }}
              />
            </Form.Item>

            <div className={styles.formOptions}>
              <Checkbox
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className={styles.customCheckbox}
              >
                Ghi nhớ đăng nhập
              </Checkbox>
              <Link onClick={() => navigate('/forgot-password')} className={styles.forgotPassword}>
                Quên mật khẩu?
              </Link>
            </div>

            <Button
              className={styles.customButton}
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              size="large"
            >
              ĐĂNG NHẬP
            </Button>
          </Form>

          <div className={styles.registerPrompt}>
            <Text style={{ color: '#666' }}>Chưa có tài khoản? </Text>
            <Link onClick={() => navigate('/register')} className={styles.registerLink}>
              Đăng ký ngay
            </Link>
          </div>

          <Divider className={styles.divider}>
            <span className={styles.dividerText}>Hoặc đăng nhập với</span>
          </Divider>

          <div className={styles.socialGroup}>
            <a
              href={`${BACKEND_URL}/api/v1/auth/google?rememberMe=${rememberMe}`}
              className={`${styles.socialCircle} ${styles.ggCircle}`}
            >
              <GoogleIcon />
              <span className={styles.socialTextGg}>Google</span>
            </a>
            <a
              href={`${BACKEND_URL}/api/v1/auth/facebook?rememberMe=${rememberMe}`}
              className={`${styles.socialCircle} ${styles.fbCircle}`}
            >
              <FacebookIcon />
              <span className={styles.socialTextFb}>Facebook</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24">
      <path fill="#fff" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

export default Login;