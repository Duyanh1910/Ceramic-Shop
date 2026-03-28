import { useState } from 'react';
import { Form, Input, Button, message, Steps } from 'antd';
import { LockOutlined, CheckCircleFilled, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import styles from './ChangePassword.module.css';

const API_BASE = 'https://ceramic-shop-u8ak.onrender.com/api/v1';

function ChangePassword() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChangePassword = async (values) => {
    setLoading(true);
    try {
      await axios.post(
        `${API_BASE}/auth/change-password`,
        { oldPassword: values.oldPassword, newPassword: values.newPassword },
        { withCredentials:true}
      );
      setSuccess(true);
    } catch (err) {
      const msg = err.response?.data?.message || 'Có lỗi xảy ra!';
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <Helmet><title>Đổi mật khẩu | Ceramic Shop</title></Helmet>

      <header className={styles.topHeader}>
        <div className={styles.logo} onClick={() => navigate('/')}>CERAMIC-SHOP</div>
        <Button
          type="link"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/profile')}
          className={styles.btnBack}
        >
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
                  { title: 'Mật khẩu mới' },
                  { title: 'Xác minh' },
                  { title: 'Hoàn tất' },
                ]}
              />

              <Form
                form={form}
                layout="vertical"
                onFinish={handleChangePassword}
                className={styles.form}
              >
                <Form.Item
                  label="Mật khẩu hiện tại"
                  name="oldPassword"
                  rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại!' }]}
                >
                  <Input.Password
                    prefix={<LockOutlined className={styles.inputIcon} />}
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
                    prefix={<LockOutlined className={styles.inputIcon} />}
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
                    prefix={<LockOutlined className={styles.inputIcon} />}
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

                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  loading={loading}
                  className={styles.btnSubmit}
                >
                  CẬP NHẬT MẬT KHẨU
                </Button>
              </Form>
            </>
          ) : (
            <div className={styles.successState}>
              <CheckCircleFilled className={styles.successIcon} />
              <h2 className={styles.successTitle}>Đổi mật khẩu thành công!</h2>
              <p className={styles.successSub}>
                Mật khẩu của bạn đã được cập nhật. Vui lòng sử dụng mật khẩu mới khi đăng nhập lần sau.
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
    </div>
  );
}

export default ChangePassword;
