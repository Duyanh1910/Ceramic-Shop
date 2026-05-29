import React, { useEffect, useState } from 'react';
import { Layout, Form, Input, Button, Avatar, message, Upload, Divider } from 'antd';
import { UserOutlined, UploadOutlined, ProfileOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import styles from '../Auth/Profile.module.css';

import ChangePassword from '../Auth/ChangePassword';

const { Content, Sider } = Layout;

function AdminProfile() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [profileName, setProfileName] = useState(
    localStorage.getItem('admin_username') ||
    localStorage.getItem('username') ||
    'Admin'
  );

  const [activeTab, setActiveTab] = useState('profile');

  const CLOUDINARY_CLOUD_NAME = 'dcmwz0uis';
  const CLOUDINARY_UPLOAD_PRESET = 'the_creamy_shop';
  const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
  const role = localStorage.getItem('admin_role') || localStorage.getItem('role');
  const normalizedRole = (role || '').trim().toLowerCase();
  const roleLabel = normalizedRole === 'admin' ? 'Quản trị viên' : 'Nhân viên';
  const avatarInitial = (profileName || 'A').trim().charAt(0).toUpperCase();

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    fetchAdminProfile();
  }, [token, navigate]);

  const handleAvatarError = () => {
    setAvatarUrl('');
    return false;
  };

  const fetchAdminProfile = async () => {
    try {
      // 1. Thử đổi endpoint từ /auth/me sang /staffs/me cho đồng bộ với hàm Update ở dưới
      const res = await axios.get('https://ceramic-shop-u8ak.onrender.com/api/v1/staffs/me', {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });

      const userData = res.data.user || res.data.result || res.data;
      const profileData = userData?.profile || userData;

      if (userData) {
        const fullName =
          profileData?.TenNhanVien ||
          userData?.TenNhanVien ||
          userData?.name ||
          userData?.username ||
          localStorage.getItem('admin_username') ||
          'Admin';

        const avatar = profileData?.Avatar || '';

        setProfileName(fullName);
        setAvatarUrl(avatar);

        form.setFieldsValue({
          FullName: fullName,
          Email: userData?.email || userData?.Email,
          SDT: profileData?.SDT,
          Diachi: profileData?.DiaChi || profileData?.Diachi,
          Avatar: avatar,
        });
      }
    } catch (error) {
      console.error("Lỗi khi lấy thông tin Admin:", error);
      
      // 2. Chỉ đá văng ra Login nếu lỗi là 401 (Hết hạn Token) hoặc 403 (Sai quyền)
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        message.error('Phiên đăng nhập đã hết hạn hoặc không có quyền. Vui lòng đăng nhập lại!');
        localStorage.clear();
        navigate('/login');
      } else {
        // Nếu lỗi 404 (sai URL) hoặc 500 (sập server) thì báo lỗi chứ không văng ra ngoài
        message.error('Không thể tải thông tin hồ sơ: ' + (error.response?.data?.message || 'Lỗi mạng'));
      }
    }
  };

  const handleAvatarChange = async (info) => {
    const file = info.file?.originFileObj || info.file;

    if (!file) return;

    if (file.size > 1024 * 1024) {
      message.error('Dung lượng ảnh không được vượt quá 1MB!');
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    try {
      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        formData
      );

      const secureUrl = res.data.secure_url;
      setAvatarUrl(secureUrl);
      form.setFieldsValue({ Avatar: secureUrl });
      message.success('Upload ảnh thành công!');
    } catch (error) {
      console.error(error);
      message.error('Upload ảnh thất bại!');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (values) => {
    setLoading(true);

    try {
      const payload = {
        TenNhanVien: values.FullName,
        SDT: values.SDT,
        DiaChi: values.Diachi,
        Avatar: values.Avatar || avatarUrl || undefined,
      };

      const res = await axios.patch(
        'https://ceramic-shop-u8ak.onrender.com/api/v1/staffs/me',
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        }
      );

      message.success('Cập nhật hồ sơ thành công!');

      const updatedData = res.data.result;
      const updatedName = updatedData?.TenNhanVien || values.FullName;
      const updatedAvatar = updatedData?.Avatar || values.Avatar || avatarUrl || '';

      setProfileName(updatedName);
      setAvatarUrl(updatedAvatar);

      localStorage.setItem('admin_username', updatedName);
      localStorage.setItem('admin_avatar', updatedAvatar);

      window.dispatchEvent(new Event('storage'));
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Cập nhật thất bại!';
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout className={`${styles.profileWrapper} ${styles.adminProfileWrapper}`}>
      <Helmet>
        <title>Hồ sơ quản trị | Ceramic Shop</title>
      </Helmet>

      <Content className={styles.mainContent}>
        <div className={styles.container}>
          <Layout className={styles.innerLayout}>
            <Sider width={250} className={styles.sidebar}>
              <div className={styles.userInfoMini}>
                <Avatar
                  src={avatarUrl || undefined}
                  size={60}
                  className={styles.avatarMini}
                  onError={handleAvatarError}
                >
                  {avatarInitial}
                </Avatar>

                <div className={styles.userNameMini}>
                  <strong>{profileName}</strong>
                  <span>
                    <UserOutlined /> {roleLabel}
                  </span>
                </div>
              </div>

              <ul className={styles.sidebarMenu}>
                <li
                  className={activeTab === 'profile' ? styles.active : ''}
                  onClick={() => setActiveTab('profile')}
                >
                  <ProfileOutlined /> Thông tin tài khoản
                </li>
                <li
                  className={activeTab === 'password' ? styles.active : ''}
                  onClick={() => setActiveTab('password')}
                >
                  <LockOutlined /> Đổi mật khẩu
                </li>
              </ul>
            </Sider>

            <Content className={styles.formContent}>
              {activeTab === 'profile' && (
                <>
                  <div className={styles.formHeader}>
                    <h2 className={styles.formTitle}>Hồ Sơ Nhân Sự</h2>
                    <p className={styles.formSub}>
                      Quản lý thông tin hồ sơ và bảo mật tài khoản nội bộ
                    </p>
                  </div>
                  <Divider className={styles.divider} />

                  <div className={styles.formBody}>
                    <div className={styles.formLeft}>
                      <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleUpdateProfile}
                        className={styles.profileForm}
                      >
                        <Form.Item
                          label="Họ và Tên"
                          name="FullName"
                          rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
                        >
                          <Input className={styles.customInput} />
                        </Form.Item>

                        <Form.Item label="Email" name="Email">
                          <Input className={styles.customInput} disabled />
                        </Form.Item>

                        <Form.Item
                          label="Số điện thoại"
                          name="SDT"
                          rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
                        >
                          <Input className={styles.customInput} />
                        </Form.Item>

                        <Form.Item label="Địa chỉ liên hệ" name="Diachi">
                          <Input className={styles.customInput} />
                        </Form.Item>

                        <Form.Item name="Avatar" hidden>
                          <Input />
                        </Form.Item>

                        <Form.Item>
                          <Button
                            type="primary"
                            htmlType="submit"
                            className={styles.btnSave}
                            loading={loading}
                          >
                            LƯU THAY ĐỔI
                          </Button>
                        </Form.Item>
                      </Form>
                    </div>

                    <div className={styles.formRight}>
                      <div className={styles.avatarSection}>
                        <Avatar
                          src={avatarUrl || undefined}
                          size={120}
                          className={styles.avatarBig}
                          onError={handleAvatarError}
                        >
                          {avatarInitial}
                        </Avatar>

                        <Upload
                          showUploadList={false}
                          beforeUpload={() => false}
                          onChange={handleAvatarChange}
                          accept=".jpg,.jpeg,.png"
                        >
                          <Button
                            icon={<UploadOutlined />}
                            className={styles.btnUpload}
                            loading={loading}
                          >
                            Chọn Ảnh
                          </Button>
                        </Upload>

                        <p className={styles.avatarNote}>
                          Dung lượng file tối đa 1 MB<br />
                          Định dạng: .JPEG, .PNG
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'password' && <ChangePassword />}
            </Content>
          </Layout>
        </div>
      </Content>
    </Layout>
  );
}

export default AdminProfile;