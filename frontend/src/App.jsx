import { useState } from 'react';
import axios from 'axios';
import { Button, Input, Form, message, Card, Typography } from 'antd';

const { Text, Link } = Typography;

function App() {
  const [loading, setLoading] = useState(false);

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
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '100px' }}>
      <Card title="ĐĂNG NHẬP CERAMIC-SHOP" style={{ width: 400, boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
        
        <Form layout="vertical" onFinish={handleLogin}>
          <Form.Item 
            label="Tên đăng nhập" 
            name="username" 
            rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
          >
            <Input placeholder="Ví dụ: khachhang1" />
          </Form.Item>

          <Form.Item 
            label="Mật khẩu" 
            name="password" 
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
          >
            <Input.Password placeholder="Nhập mật khẩu" />
          </Form.Item>

          <div style={{ marginBottom: '20px', textAlign: 'right' }}>
            <Text>Chưa có tài khoản? </Text>
            {/*Register*/}
            <Link href="#">Đăng ký ngay</Link>
          </div>

          <Button type="primary" htmlType="submit" block loading={loading}>
            Đăng Nhập
          </Button>
        </Form>

      </Card>
    </div>
  );
}

export default App;