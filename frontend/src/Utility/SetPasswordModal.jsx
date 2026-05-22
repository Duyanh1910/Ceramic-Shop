import { useState } from 'react';
import { Modal, Form, Input, Button, message } from 'antd';
import { LockOutlined, GoogleOutlined, FacebookOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from './SetPasswordModal.module.css';

const API_BASE = 'https://ceramic-shop-u8ak.onrender.com/api/v1';

export default function SetPasswordModal({ open, onClose, provider }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await axios.post(
        `${API_BASE}/auth/change-password`,
        { oldPassword: null, newPassword: values.newPassword },
        { withCredentials: true }
      );
      message.success('Tạo mật khẩu thành công!');
      form.resetFields();
      onClose(true);
    } catch (err) {
      message.error(err.response?.data?.message || 'Không thể tạo mật khẩu!');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseAndRedirect = () => {
    onClose(false);
    navigate('/profile');
  };

  const providerName = provider === 'google' ? 'Google' : 'Facebook';
  const ProviderIcon = provider === 'google' ? <GoogleOutlined /> : <FacebookOutlined />;
  const providerColor = provider === 'google' ? '#EA4335' : '#1877F2';

  return (
    <Modal
      open={open}
      onCancel={handleCloseAndRedirect}
      footer={null}
      centered
      width={420}
      closable
      mask={{ closable: false }}
    >
      <div className={styles.modalBody}>
        <div className={styles.iconWrap} style={{ background: providerColor }}>
          <LockOutlined className={styles.lockIcon} />
        </div>

        <h3 className={styles.title}>Tạo mật khẩu mới</h3>

        <div className={styles.notice}>
          <span className={styles.providerBadge} style={{ color: providerColor }}>
            {ProviderIcon} {providerName}
          </span>
          <p className={styles.noticeText}>
            Do bạn đăng nhập qua <strong>{providerName}</strong> nên tài khoản chưa có mật khẩu.
            Vui lòng tạo mật khẩu để sử dụng thêm tính năng này.
          </p>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className={styles.form}
        >
          <Form.Item
            name="newPassword"
            label="Mật khẩu mới"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
              { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#bbb' }} />}
              className={styles.input}
              placeholder="Tối thiểu 6 ký tự"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Xác nhận mật khẩu"
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
              className={styles.input}
              placeholder="Nhập lại mật khẩu mới"
            />
          </Form.Item>

          <div className={styles.actions}>
            <Button onClick={handleCloseAndRedirect} className={styles.btnCancel}>
              Bỏ qua
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className={styles.btnSubmit}
            >
              Tạo mật khẩu
            </Button>
          </div>
        </Form>
      </div>
    </Modal>
  );
}