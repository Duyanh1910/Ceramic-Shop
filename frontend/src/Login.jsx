import { useState } from 'react';
import axios from 'axios';
import { Button, Input, Form, message, Typography, Divider, Checkbox } from 'antd';
import { useNavigate } from 'react-router-dom';
import styles from './Login.module.css';
import { UserOutlined, LockOutlined, ArrowLeftOutlined } from '@ant-design/icons';

const { Text, Link } = Typography;

// Lấy URL Backend từ file .env (Fallback về localhost nếu chưa có)
const BACKEND_URL = 'https://ceramic-shop-u8ak.onrender.com';

function Login() {
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (values) => {
    setLoading(true);
    try {
      // Vì đã cấu hình Cookie, nhớ thêm withCredentials: true
      const response = await axios.post(`${BACKEND_URL}/api/v1/auth/login`, {
        username: values.username,
        password: values.password,
        rememberMe: rememberMe
      }, {
        withCredentials: true 
      });

      const user = response.data.user;
      
      localStorage.setItem('username', user.username);
      if (user.role) localStorage.setItem('role', user.role);

      message.success('Đăng nhập thành công!');
      navigate('/'); 
      
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Có lỗi xảy ra kết nối đến máy chủ!';
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    
    <div className={styles.loginContainer}>
      <div className={styles.shape1}></div>
      <div className={styles.shape2}></div>
      <div className={styles.shape3}></div>
      <div className={styles.combinedCard}>
        {/* Cột trái: Hình ảnh trang trí phong cách Gốm sứ */}
        <div className={styles.cardImage}>
          <div className={styles.imageOverlay}>
            <h2>Ceramic Shop</h2>
            <p>Tinh hoa gốm sứ Việt - Mang nghệ thuật vào không gian sống của bạn.</p>
          </div>
        </div>

        {/* Cột phải: Form đăng nhập */}
        <div className={styles.cardForm}>
          <div style={{ marginBottom: '15px', textAlign: 'left' }}>
            <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => navigate('/')} className={styles.backButton}>
              Trang chủ
            </Button>
          </div>

          <h2 className={styles.formTitle}>Chào mừng trở lại</h2>
          <p className={styles.formSubtitle}>Vui lòng đăng nhập để tiếp tục</p>
          
          <Form layout="vertical" onFinish={handleLogin} initialValues={{ remember: false }}>
            <Form.Item 
              label={<span className={styles.inputLabel}>Tên đăng nhập</span>} 
              name="username" 
              rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
            >
              <Input 
                prefix={<UserOutlined style={{ color: '#bfbfbf' }} />} 
                className={styles.customInput} 
                placeholder="Nhập tên đăng nhập hoặc email" 
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
              />
            </Form.Item>

            <div className={styles.formOptions}>
              <Checkbox 
                checked={rememberMe} 
                onChange={(e) => setRememberMe(e.target.checked)}
              >
                Ghi nhớ đăng nhập
              </Checkbox>
              <Link onClick={() => navigate('/forgot-password')} className={styles.forgotPassword}>
                Quên mật khẩu?
              </Link>
            </div>

            <Button className={styles.customButton} type="primary" htmlType="submit" block loading={loading} size="large">
              Đăng Nhập
            </Button>
          </Form>

          <Divider style={{ borderColor: '#e8e8e8', color: '#888', fontSize: '14px', margin: '24px 0' }}>
            Hoặc đăng nhập bằng
          </Divider>

          {/* Cụm nút Đăng nhập OAuth */}
          <div className={styles.socialGroup}>
            <a href={`${BACKEND_URL}/api/v1/auth/google?rememberMe=${rememberMe}`} className={styles.socialBtn}>
              <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" className={styles.socialIcon} />
              Google
            </a>
            
            <a href={`${BACKEND_URL}/api/v1/auth/facebook?rememberMe=${rememberMe}`} className={styles.socialBtn}>
              <img src="https://upload.wikimedia.org/wikipedia/commons/b/b8/2021_Facebook_icon.svg" alt="Facebook" className={styles.socialIcon} />
              Facebook
            </a>
          </div>

          <div className={styles.registerPrompt}>
            <Text style={{color: '#666'}}>Chưa có tài khoản? </Text>
            <Link onClick={() => navigate('/register')} className={styles.registerLink}>Đăng ký ngay</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;