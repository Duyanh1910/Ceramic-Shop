import { useState } from 'react';
import axios from 'axios';
import { Button, Input, Form, message, Card, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import styles from './Login.module.css';

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

      localStorage.setItem('token', response.data.result.token);

      message.success('Đăng nhập thành công!');
      
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
        
        <div className={styles.cardImage}></div>

        <div className={styles.cardForm}>
          
          <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>
            ĐĂNG NHẬP
          </h2>
          
          <Form layout="vertical" onFinish={handleLogin}>
            <Form.Item 
              label="Tên đăng nhập" 
              name="username" 
              rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
            >
              <Input className={styles.customInput} placeholder="Nhập tên đăng nhập" />
            </Form.Item>

            <Form.Item 
              label="Mật khẩu" 
              name="password" 
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
            >
              <Input.Password className={styles.customInput} placeholder="Nhập mật khẩu" />
            </Form.Item>

            <div style={{ marginBottom: '20px', textAlign: 'right' }}>
              <Text>Chưa có tài khoản? </Text>
              <Link onClick={() => navigate('/register')}>Đăng ký ngay</Link>
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