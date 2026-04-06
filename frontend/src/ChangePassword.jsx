import { useState, useEffect } from 'react';
import { Form, Input, Button, message, Steps, Spin } from 'antd';
import { LockOutlined, CheckCircleFilled, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
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
  const navigate = useNavigate();

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
      navigate('/login');
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
    return (
      <div className={styles.pageWrapper}>
        <header className={styles.topHeader}>
          <div className={styles.logoBox} onClick={() => navigate('/')}>
            <img 
              src="https://res.cloudinary.com/dcmwz0uis/image/upload/v1774819165/IMG_20260330_041641_qwo8lc.jpg" 
              alt="Ceramic Shop Logo" 
              className={styles.logoImg} 
            />
            <div className={styles.logoTextWrap}>
              <h1 className={styles.logoText}>CERAMIC-SHOP</h1>
              <span className={styles.logoSub}>TINH HOA GỐM SỨ VIỆT</span>
            </div>
          </div>
        </header>
        <div className={styles.centerWrapper}>
          <Spin size="large" />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      <Helmet><title>Đổi mật khẩu | Ceramic Shop</title></Helmet>

      <header className={styles.topHeader}>
        <div className={styles.logoBox} onClick={() => navigate('/')}>
          <img 
            src="https://res.cloudinary.com/dcmwz0uis/image/upload/v1774819165/IMG_20260330_041641_qwo8lc.jpg" 
            alt="Ceramic Shop Logo" 
            className={styles.logoImg} 
          />
          <div className={styles.logoTextWrap}>
            <h1 className={styles.logoText}>CERAMIC-SHOP</h1>
            <span className={styles.logoSub}>TINH HOA GỐM SỨ VIỆT</span>
          </div>
        </div>
        <Button type="link" icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/profile')} className={styles.btnBack}>
          Quay lại hồ sơ
        </Button>
      </header>

      <div className={styles.centerWrapper}>
        <div className={styles.card}>
          <div className={`${styles.corner} ${styles.tl}`} />
          <div className={`${styles.corner} ${styles.tr}`} />
          <div className={`${styles.corner} ${styles.bl}`} />
          <div className={`${styles.corner} ${styles.br}`} />

          {!success ? (
            <>
              <div className={styles.cardHeader}>
                <div className={styles.iconWrap}>
                  <LockOutlined className={styles.headerIcon} />
                </div>
                <h2 className={styles.cardTitle}>ĐỔI MẬT KHẨU</h2>
                <p className={styles.cardSub}>Nhập mật khẩu hiện tại và mật khẩu mới để cập nhật</p>
              </div>

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
                  label="Mật khẩu hiện tại"
                  name="oldPassword"
                  rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại!' }]}
                >
                  <Input.Password
                    prefix={<LockOutlined style={{ color: '#bbb' }} />}
                    className={styles.customInput}
                    placeholder="Nhập mật khẩu hiện tại"
                  />
                </Form.Item>

                <div className={styles.dividerLine} />

                <Form.Item
                  label="Mật khẩu mới"
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
                    className={styles.customInput}
                    placeholder="Tối thiểu 6 ký tự"
                  />
                </Form.Item>

                <Form.Item
                  label="Xác nhận mật khẩu mới"
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
                    className={styles.customInput}
                    placeholder="Nhập lại mật khẩu mới"
                  />
                </Form.Item>

                <div className={styles.hintBox}>
                  <span className={styles.hintTitle}>Mật khẩu mạnh cần:</span>
                  <ul className={styles.hintList}>
                    <li>Ít nhất 6 ký tự</li>
                    <li>Khác với mật khẩu cũ</li>
                    <li>Nên kết hợp chữ, số và ký tự đặc biệt</li>
                  </ul>
                </div>

                <Button type="primary" htmlType="submit" block loading={loading} className={styles.btnSubmit}>
                  CẬP NHẬT MẬT KHẨU
                </Button>
              </Form>
            </>
          ) : (
            <div className={styles.successState}>
              <CheckCircleFilled className={styles.successIcon} />
              <h2 className={styles.successTitle}>
                {isOAuthUser ? 'Tạo mật khẩu thành công!' : 'Đổi mật khẩu thành công!'}
              </h2>
              <p className={styles.successSub}>
                {isOAuthUser
                  ? 'Bạn đã tạo mật khẩu cho tài khoản. Từ nay có thể đăng nhập bằng email và mật khẩu này.'
                  : 'Mật khẩu đã được cập nhật. Vui lòng sử dụng mật khẩu mới khi đăng nhập lần sau.'}
              </p>
              <div className={styles.successActions}>
                <Button className={styles.btnGoProfile} onClick={() => navigate('/profile')}>
                  Quay lại hồ sơ
                </Button>
                <Button className={styles.btnGoHome} type="primary" onClick={() => navigate('/')}>
                  Về trang chủ
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <SetPasswordModal
        open={showSetPassword}
        onClose={handleSetPasswordClose}
        provider={oauthProvider}
      />
    </div>
  );
}