import { useState, useEffect } from 'react';
import { Form, Input, Button, message, Steps, Spin, Divider } from 'antd';
import { LockOutlined, CheckCircleFilled } from '@ant-design/icons';
import axios from 'axios';
import styles from './ChangePassword.module.css';
import SetPasswordModal from './SetPasswordModal.jsx';

const API_BASE = 'https://ceramic-shop-u8ak.onrender.com/api/v1';

export default function ChangePassword() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [checkingUser, setCheckingUser] = useState(true);
  const [isOAuthUser, setIsOAuthUser] = useState(false);
  const [oauthProvider, setOauthProvider] = useState('google');
  const [showSetPassword, setShowSetPassword] = useState(false);

  useEffect(() => {
    checkUserType();
  }, []);

  const checkUserType = async () => {
    setCheckingUser(true);
    try {
      const res = await axios.get(`${API_BASE}/auth/me`, {
        withCredentials: true 
      });
      const hasPassword = res.data.user?.hasPassword ?? true;
      if (!hasPassword) {
        setIsOAuthUser(true);
        setShowSetPassword(true);
      }
    } catch {
      message.error("Vui lòng đăng nhập để đổi mật khẩu!");
    } finally {
      setCheckingUser(false);
    }
  };

  const handleChangePassword = async (values) => {
    setLoading(true);
    try {
      await axios.post(
        `${API_BASE}/auth/change-password`,
        { oldPassword: values.oldPassword, newPassword: values.newPassword },
        { withCredentials: true }
      );
      setSuccess(true);
      form.resetFields();
    } catch (err) {
      message.error(err.response?.data?.message || 'Có lỗi xảy ra!');
    } finally {
      setLoading(false);
    }
  };

  const handleSetPasswordClose = (didSet) => {
    setShowSetPassword(false);
    if (didSet) setSuccess(true);
  };

  if (checkingUser) {
    return <div style={{ textAlign: 'center', padding: '50px 0' }}><Spin size="large" /></div>;
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', width: '100%' }}>
      {!success ? (
        <>
          <div style={{ marginBottom: 10 }}>
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#1b437c', textTransform: 'uppercase', margin: '0 0 5px 0' }}>
              Đổi Mật Khẩu
            </h2>
            <p style={{ color: '#666', margin: 0, fontSize: '14px' }}>
              Nhập mật khẩu hiện tại và mật khẩu mới để cập nhật
            </p>
          </div>
          <Divider style={{ margin: '15px 0 30px 0', borderColor: '#f0f0f0' }} />

          <Steps
            className={styles.steps}
            size="small"
            current={0}
            items={[
              { title: 'Xác minh' },
              { title: 'Mật khẩu mới' },
              { title: 'Hoàn tất' },
            ]}
          />

          <Form form={form} layout="vertical" onFinish={handleChangePassword} className={styles.form}>
            <Form.Item
              label={<span style={{fontWeight: 500, color: '#555'}}>Mật khẩu hiện tại</span>}
              name="oldPassword"
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại!' }]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#bbb' }} />}
                style={{ borderRadius: 6, padding: '10px 15px' }}
                placeholder="Nhập mật khẩu hiện tại"
              />
            </Form.Item>

            <div className={styles.dividerLine} />

            <Form.Item
              label={<span style={{fontWeight: 500, color: '#555'}}>Mật khẩu mới</span>}
              name="newPassword"
              rules={[
                { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('oldPassword') !== value)
                      return Promise.resolve();
                    return Promise.reject(new Error('Mật khẩu mới phải khác mật khẩu cũ!'));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#bbb' }} />}
                style={{ borderRadius: 6, padding: '10px 15px' }}
                placeholder="Tối thiểu 6 ký tự"
              />
            </Form.Item>

            <Form.Item
              label={<span style={{fontWeight: 500, color: '#555'}}>Xác nhận mật khẩu mới</span>}
              name="confirmPassword"
              dependencies={['newPassword']}
              rules={[
                { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value)
                      return Promise.resolve();
                    return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#bbb' }} />}
                style={{ borderRadius: 6, padding: '10px 15px' }}
                placeholder="Nhập lại mật khẩu mới"
              />
            </Form.Item>

            <Button type="primary" htmlType="submit" block loading={loading} style={{ height: 45, borderRadius: 6, fontWeight: 600, background: '#1b437c', marginTop: 10 }}>
              CẬP NHẬT MẬT KHẨU
            </Button>
          </Form>
        </>
      ) : (
        <div className={styles.successState}>
          <CheckCircleFilled className={styles.successIcon} />
          <h2 style={{ fontSize: '24px', color: '#1b437c', fontWeight: 700, margin: '0 0 10px 0' }}>
            {isOAuthUser ? 'Tạo mật khẩu thành công!' : 'Đổi mật khẩu thành công!'}
          </h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            {isOAuthUser
              ? 'Bạn đã tạo mật khẩu cho tài khoản. Từ nay có thể đăng nhập bằng email và mật khẩu này.'
              : 'Mật khẩu đã được cập nhật. Lần sau đăng nhập hãy sử dụng mật khẩu mới nhé.'}
          </p>
          <Button type="primary" onClick={() => setSuccess(false)} style={{ background: '#1b437c', borderRadius: 6 }}>
            Quay lại
          </Button>
        </div>
      )}

      <SetPasswordModal
        open={showSetPassword}
        onClose={handleSetPasswordClose}
        provider={oauthProvider}
      />
    </div>
  );
}