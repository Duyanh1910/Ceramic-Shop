import { useState } from 'react';
import axios from 'axios';
import { Button, Input, Form, message, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import styles from './Register.module.css';
import { Helmet } from 'react-helmet-async';
import { 
  UserOutlined, 
  MailOutlined, 
  LockOutlined
} from '@ant-design/icons';

const { Link } = Typography;

function Register() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (values) => {
    setLoading(true);
    try {
      await axios.post('http://localhost:3000/api/v1/auth/register', {
        username: values.username,
        email: values.email,
        password: values.password,
        address: values.address
      });

      message.success('Đăng ký thành công! Vui lòng đăng nhập.');
      navigate('/login'); 
      
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Đăng ký thất bại!';
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.registerContainer}>
      <div className={styles.combinedCard}>
        
        <div className={`${styles.cornerPattern} ${styles.topLeft}`}></div>
        <div className={`${styles.cornerPattern} ${styles.topRight}`}></div>
        <div className={`${styles.cornerPattern} ${styles.bottomLeft}`}></div>
        <div className={`${styles.cornerPattern} ${styles.bottomRight}`}></div>

        <div className={styles.cardImage}></div>

        <div className={styles.cardForm}>
          <Helmet>
            <title>Đăng ký</title>
          </Helmet>
          <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#333', fontFamily: 'serif' }}>
            ĐĂNG KÝ
          </h2>
          
          <Form layout="vertical" onFinish={handleRegister}>
            
            <Form.Item 
              label="Tên đăng nhập" 
              name="username" 
              rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
              style={{ marginBottom: '15px' }}
            >
              <Input 
                prefix={<UserOutlined style={{ color: '#bfbfbf' }} />} 
                className={styles.customInput} 
                placeholder="Nhập tên đăng nhập" 
              />
            </Form.Item>

            <Form.Item 
              label="Email" 
              name="email" 
              rules={[
                { required: true, message: 'Vui lòng nhập email!' },
                { type: 'email', message: 'Email không đúng định dạng!' }
              ]}
              style={{ marginBottom: '15px' }}
            >
              <Input 
                prefix={<MailOutlined style={{ color: '#bfbfbf' }} />} 
                className={styles.customInput} 
                placeholder="Nhập địa chỉ email" 
              />
            </Form.Item>

            <Form.Item 
              label="Mật khẩu" 
              name="password" 
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
              style={{ marginBottom: '15px' }}
            >
              <Input.Password 
                prefix={<LockOutlined style={{ color: '#bfbfbf' }} />} 
                className={styles.customInput} 
                placeholder="Nhập mật khẩu" 
              />
            </Form.Item>

            <Form.Item 
              label="Xác nhận mật khẩu" 
              name="confirmPassword" 
              dependencies={['password']}
              rules={[
                { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                  },
                }),
              ]}
              style={{ marginBottom: '15px' }}
            >
              <Input.Password 
                prefix={<LockOutlined style={{ color: '#bfbfbf' }} />} 
                className={styles.customInput} 
                placeholder="Nhập lại mật khẩu" 
              />
            </Form.Item>

            <div style={{ marginBottom: '15px', textAlign: 'right' }}>
              <Link onClick={() => navigate('/login')}>Đăng nhập ngay</Link>
            </div>

            <Button className={styles.customButton} type="primary" htmlType="submit" block loading={loading}>
              Tạo Tài Khoản
            </Button>
          </Form>

        </div>
      </div>
    </div>
  );
}

export default Register;