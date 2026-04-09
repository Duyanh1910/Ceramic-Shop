import { useState, useEffect } from 'react';
import {
  Form, Input, Button, Avatar, Upload, message,
  Divider, Tag, DatePicker, Spin
} from 'antd';
import {
  UserOutlined, UploadOutlined, PhoneOutlined,
  EnvironmentOutlined, CalendarOutlined, LockOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import dayjs from 'dayjs';
import styles from './AdminProfile.module.css';
import SetPasswordModal from './SetPasswordModal.jsx';

const API_BASE = 'https://ceramic-shop-u8ak.onrender.com/api/v1';
const CLOUDINARY_CLOUD = 'dcmwz0uis';
const CLOUDINARY_PRESET = 'the_creamy_shop';

export default function AdminProfile() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [passForm] = Form.useForm();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingPass, setSavingPass] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [hasPassword, setHasPassword] = useState(true);
  const [showSetPassword, setShowSetPassword] = useState(false);
  const [oauthProvider, setOauthProvider] = useState('google');

  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };
  const isStaff = role === 'Staff';
  const isAdmin = role === 'Admin';

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/auth/me`, authHeader);
      const user = res.data.user || res.data.result;
      const profile = user?.profile || {};
      setUserData(user);
      setHasPassword(user?.hasPassword ?? true);

      const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.TenNhanVien || user.username || 'Staff')}&background=1b437c&color=fff`;
      setAvatarUrl(avatar);

      form.setFieldsValue({
        TenNhanVien: profile.TenNhanVien,
        SDT: profile.SDT,
        DiaChi: profile.DiaChi,
        NgaySinh: profile.NgaySinh ? dayjs(profile.NgaySinh) : null,
      });
    } catch {
      message.error('Không thể tải thông tin hồ sơ!');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (info) => {
    const file = info.file;
    if (file.size > 2 * 1024 * 1024) {
      message.error('Ảnh không được vượt quá 2MB!');
      return;
    }
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('upload_preset', CLOUDINARY_PRESET);
    try {
      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`,
        fd
      );
      setAvatarUrl(res.data.secure_url);
      message.success('Tải ảnh thành công!');
    } catch {
      message.error('Tải ảnh thất bại!');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async (values) => {
    setSaving(true);
    try {
      const payload = {
        TenNhanVien: values.TenNhanVien,
        SDT: values.SDT,
        DiaChi: values.DiaChi,
        NgaySinh: values.NgaySinh ? values.NgaySinh.format('YYYY-MM-DD') : undefined,
      };
      await axios.patch(`${API_BASE}/staffs/me`, payload, authHeader);
      message.success('Cập nhật hồ sơ thành công!');
      localStorage.setItem('username', values.TenNhanVien || localStorage.getItem('username'));
    } catch (err) {
      message.error(err.response?.data?.message || 'Cập nhật thất bại!');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (values) => {
    setSavingPass(true);
    try {
      await axios.post(
        `${API_BASE}/auth/change-password`,
        { oldPassword: values.oldPassword, newPassword: values.newPassword },
        authHeader
      );
      message.success('Đổi mật khẩu thành công!');
      passForm.resetFields();
    } catch (err) {
      message.error(err.response?.data?.message || 'Đổi mật khẩu thất bại!');
    } finally {
      setSavingPass(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <Helmet><title>Hồ sơ | Ceramic Shop Admin</title></Helmet>

      <header className={styles.topHeader}>
        <div className={styles.logo} onClick={() => navigate('/admin')}>CERAMIC-SHOP</div>
        <Button type="link" icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/admin')} className={styles.btnBack}>
          Về trang quản lý
        </Button>
      </header>

      {loading ? (
        <div className={styles.loadingWrap}><Spin size="large" /></div>
      ) : (
        <div className={styles.mainContent}>
          <div className={styles.container}>

            <div className={styles.pageHeader}>
              <h1 className={styles.pageTitle}>Hồ sơ cá nhân</h1>
              <Tag color={isAdmin ? 'gold' : 'blue'} className={styles.roleTag}>
                {isAdmin ? '👑 Admin' : '🛠 Staff'}
              </Tag>
            </div>

            <div className={styles.layoutGrid}>

              <div className={styles.leftCol}>
                <div className={styles.avatarCard}>
                  <div className={styles.avatarWrap}>
                    <Avatar
                      src={avatarUrl}
                      size={100}
                      className={styles.avatar}
                    >
                      {userData?.username?.[0]?.toUpperCase()}
                    </Avatar>
                    {uploading && (
                      <div className={styles.avatarOverlay}><Spin /></div>
                    )}
                  </div>

                  <div className={styles.avatarInfo}>
                    <div className={styles.avatarName}>
                      {form.getFieldValue('TenNhanVien') || userData?.username}
                    </div>
                    <div className={styles.avatarEmail}>{userData?.email}</div>
                    <div className={styles.avatarRole}>
                      <Tag color={isAdmin ? 'gold' : 'blue'}>{role}</Tag>
                    </div>
                  </div>

                  <Upload
                    showUploadList={false}
                    beforeUpload={() => false}
                    onChange={handleAvatarUpload}
                    accept=".jpg,.jpeg,.png,.webp"
                  >
                    <Button
                      icon={<UploadOutlined />}
                      loading={uploading}
                      className={styles.btnUpload}
                      block
                    >
                      Đổi ảnh đại diện
                    </Button>
                  </Upload>
                  <p className={styles.uploadNote}>JPG, PNG, WEBP • Tối đa 2MB</p>
                </div>
              </div>

              <div className={styles.rightCol}>
                <div className={styles.formCard}>
                  <div className={styles.formCardTitle}>Thông tin cá nhân</div>
                  <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSaveProfile}
                  >
                    <div className={styles.formRow}>
                      <Form.Item
                        name="TenNhanVien"
                        label="Họ tên"
                        rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
                      >
                        <Input
                          prefix={<UserOutlined style={{ color: '#bbb' }} />}
                          placeholder="Nhập họ tên"
                          className={styles.input}
                        />
                      </Form.Item>

                      <Form.Item
                        name="SDT"
                        label="Số điện thoại"
                        rules={[
                          { required: true, message: 'Vui lòng nhập SĐT!' },
                          { pattern: /^0\d{9}$/, message: 'SĐT không hợp lệ!' },
                        ]}
                      >
                        <Input
                          prefix={<PhoneOutlined style={{ color: '#bbb' }} />}
                          placeholder="0987654321"
                          maxLength={10}
                          className={styles.input}
                        />
                      </Form.Item>
                    </div>

                    <Form.Item
                      name="NgaySinh"
                      label="Ngày sinh"
                      rules={[{ required: true, message: 'Vui lòng chọn ngày sinh!' }]}
                    >
                      <DatePicker
                        className={styles.datePicker}
                        placeholder="Chọn ngày sinh"
                        format="DD/MM/YYYY"
                        disabledDate={(d) => d && d.isAfter(dayjs())}
                        style={{ width: '100%' }}
                        suffixIcon={<CalendarOutlined />}
                      />
                    </Form.Item>

                    <Form.Item
                      name="DiaChi"
                      label="Địa chỉ"
                      rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
                    >
                      <Input.TextArea
                        prefix={<EnvironmentOutlined style={{ color: '#bbb' }} />}
                        placeholder="Số nhà, đường, phường, quận, tỉnh/thành"
                        rows={2}
                        className={styles.input}
                      />
                    </Form.Item>

                    <div className={styles.formActions}>
                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={saving}
                        className={styles.btnSave}
                      >
                        Lưu thay đổi
                      </Button>
                    </div>
                  </Form>
                </div>

                <div className={styles.formCard}>
                  <div className={styles.formCardTitle}>
                    <LockOutlined /> Mật khẩu
                  </div>

                  {!hasPassword ? (
                    <div className={styles.oauthNotice}>
                      <p>Tài khoản đăng nhập qua mạng xã hội — chưa có mật khẩu.</p>
                      <Button
                        type="primary"
                        onClick={() => setShowSetPassword(true)}
                        className={styles.btnSave}
                      >
                        Tạo mật khẩu
                      </Button>
                    </div>
                  ) : (
                    <Form form={passForm} layout="vertical" onFinish={handleChangePassword}>
                      <Form.Item
                        name="oldPassword"
                        label="Mật khẩu hiện tại"
                        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại!' }]}
                      >
                        <Input.Password
                          prefix={<LockOutlined style={{ color: '#bbb' }} />}
                          placeholder="Nhập mật khẩu hiện tại"
                          className={styles.input}
                        />
                      </Form.Item>

                      <div className={styles.formRow}>
                        <Form.Item
                          name="newPassword"
                          label="Mật khẩu mới"
                          rules={[
                            { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                            { min: 6, message: 'Tối thiểu 6 ký tự!' },
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
                            placeholder="Tối thiểu 6 ký tự"
                            className={styles.input}
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
                                return Promise.reject(new Error('Mật khẩu không khớp!'));
                              },
                            }),
                          ]}
                        >
                          <Input.Password
                            prefix={<LockOutlined style={{ color: '#bbb' }} />}
                            placeholder="Nhập lại mật khẩu mới"
                            className={styles.input}
                          />
                        </Form.Item>
                      </div>

                      <div className={styles.formActions}>
                        <Button
                          type="primary"
                          htmlType="submit"
                          loading={savingPass}
                          className={styles.btnSave}
                          danger
                        >
                          Đổi mật khẩu
                        </Button>
                      </div>
                    </Form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <SetPasswordModal
        open={showSetPassword}
        onClose={(didSet) => {
          setShowSetPassword(false);
          if (didSet) setHasPassword(true);
        }}
        provider={oauthProvider}
      />
    </div>
  );
}
