import { useState } from 'react';
import axios from 'axios';
import { Button, Input, Form, message, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import styles from './Login.module.css';
import { UserOutlined, LockOutlined, ArrowLeftOutlined } from '@ant-design/icons';

const { Text, Link } = Typography;

function App() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (values) => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:3000/api/v1/auth/login', {
        username: values.username,
        password: values.password
      });

      const token = response.data.result.token;
      
      localStorage.setItem('token', token);
      localStorage.setItem('username', values.username);

      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        const payload = JSON.parse(jsonPayload);
        
        if (payload.name || payload.HoTen) {
            localStorage.setItem('name', payload.name || payload.HoTen);
        }
        if (payload.role !== undefined) {
            localStorage.setItem('role', payload.role);
        }
      } catch (e) {}

      message.success('Đăng nhập thành công!');
      navigate('/'); 
      
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Có lỗi xảy ra!';
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.combinedCard}>
        <div className={`${styles.cornerPattern} ${styles.topLeft}`}></div>
        <div className={`${styles.cornerPattern} ${styles.topRight}`}></div>
        <div className={`${styles.cornerPattern} ${styles.bottomLeft}`}></div>
        <div className={`${styles.cornerPattern} ${styles.bottomRight}`}></div>
        <div className={styles.cardImage}></div>

        <div className={styles.cardForm}>
          <div style={{ marginBottom: '10px', textAlign: 'left' }}>
            <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => navigate('/')} style={{ color: '#1b437c', fontWeight: 600, paddingLeft: 0 }}>
              Quay về trang chủ
            </Button>
          </div>

          <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#1b437c', fontFamily: "'Arsenal', serif", fontWeight: 700, fontSize: '28px' }}>
            ĐĂNG NHẬP
          </h2>
          
          <Form layout="vertical" onFinish={handleLogin}>
            <Form.Item 
              label={<span style={{fontWeight: 500}}>Tên đăng nhập</span>} 
              name="username" 
              rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
            >
              <Input 
                prefix={<UserOutlined style={{ color: '#bfbfbf' }} />} 
                className={styles.customInput} 
                placeholder="Nhập tên đăng nhập" 
              />
            </Form.Item>

            <Form.Item 
              label={<span style={{fontWeight: 500}}>Mật khẩu</span>} 
              name="password" 
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
            >
              <Input.Password 
                prefix={<LockOutlined style={{ color: '#bfbfbf' }} />} 
                className={styles.customInput} 
                placeholder="Nhập mật khẩu" 
              />
            </Form.Item>

            <div style={{ marginBottom: '25px', textAlign: 'right' }}>
              <Text style={{color: '#666'}}>Chưa có tài khoản? </Text>
              <Link onClick={() => navigate('/register')} style={{fontWeight: 600, color: '#50a1fe'}}>Đăng ký ngay</Link>
            </div>

            <Button className={styles.customButton} type="primary" htmlType="submit" block loading={loading}>
              Đăng Nhập
            </Button>
          </Form>
        </div>
      </div>
    </div>
  );
}

export default App;