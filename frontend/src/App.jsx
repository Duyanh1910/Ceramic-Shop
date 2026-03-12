import { useState } from 'react';
import axios from 'axios';
import { Button, Input, Form, message, Card } from 'antd';

function App() {
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');

  // Hàm này sẽ chạy khi bạn bấm nút Đăng nhập
  const handleLogin = async (values) => {
    setLoading(true);
    try {
      // Dùng axios bắn dữ liệu sang Backend cổng 3000 của bạn
      const response = await axios.post('http://localhost:3000/api/v1/auth/login', {
        username: values.username,
        password: values.password
      });

      // Nếu thành công, Backend sẽ trả về token
      message.success('Đăng nhập thành công!');
      setToken(response.data.result.token); // Lưu token lại để hiện lên màn hình
      
    } catch (error) {
      // Nếu Backend báo lỗi (sai pass, không thấy user...)
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

          <Button type="primary" htmlType="submit" block loading={loading}>
            Đăng Nhập
          </Button>
        </Form>

        {/* Chỗ này để khoe cái Token lấy được từ Backend */}
        {token && (
          <div style={{ marginTop: 20, padding: 10, background: '#f6ffed', border: '1px solid #b7eb8f', wordWrap: 'break-word' }}>
            <strong>Lấy được Vòng Tay VIP (Token):</strong> <br/>
            <span style={{ fontSize: '12px', color: '#52c41a' }}>{token}</span>
          </div>
        )}

      </Card>
    </div>
  );
}

export default App;