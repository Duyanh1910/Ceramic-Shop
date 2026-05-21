import React, { useState, useEffect } from 'react';
import { Layout, Form, Input, Button, Avatar, message, Upload, Divider } from 'antd';
import { UserOutlined, ArrowLeftOutlined, UploadOutlined, ProfileOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import styles from '../Auth/Profile.module.css';

import ChangePassword from '../Auth/ChangePassword'; 

const { Header, Content, Sider } = Layout;

function AdminProfile() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  
  const [activeTab, setActiveTab] = useState('profile');

  const CLOUDINARY_CLOUD_NAME = 'dcmwz0uis';
  const CLOUDINARY_UPLOAD_PRESET = 'the_creamy_shop';
  const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
  const role = localStorage.getItem('admin_role') || localStorage.getItem('role');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchAdminProfile();
  }, [token, navigate]); 

  const fetchAdminProfile = async () => {
    try {
      const res = await axios.get('https://ceramic-shop-u8ak.onrender.com/api/v1/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });

      const userData = res.data.user || res.data.result;
      const profileData = userData?.profile || userData;

      if (userData) {
        setAvatarUrl(profileData?.Avatar || 'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773107213/default_avatar_gojcul.png');

        form.setFieldsValue({
          FullName: profileData?.TenNhanVien,
          Email: userData?.email || userData?.Email,
          SDT: profileData?.SDT,
          Diachi: profileData?.DiaChi || profileData?.Diachi, 
          Avatar: profileData?.Avatar,
        });
      }
    } catch (error) {
      console.error(error);
      message.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
      
      localStorage.clear();
      navigate('/login');
    }
  };

  const handleAvatarChange = async (info) => {
    const file = info.file;
    if (file.size > 1024 * 1024) {
      message.error('Dung lượng ảnh không được vượt quá 1MB!');
      return;
    }

    setLoading(true);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    try {
      const res = await axios.post(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, formData);
      
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
        Avatar: values.Avatar || avatarUrl,
      };

      const res = await axios.patch('https://ceramic-shop-u8ak.onrender.com/api/v1/staffs/me', payload, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });

      message.success('Cập nhật hồ sơ thành công!');
      
      const updatedData = res.data.result;
      localStorage.setItem('admin_username', updatedData?.TenNhanVien || values.FullName);
      localStorage.setItem('admin_avatar', updatedData?.Avatar || values.Avatar || avatarUrl);

      window.dispatchEvent(new Event('storage'));
      
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Cập nhật thất bại!';
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout className={styles.profileWrapper}>
      <Helmet>
        <title>Hồ Sơ | Admin Ceramic Shop</title>
      </Helmet>

      <Content className={styles.mainContent}>
        <div className={styles.container}>
          <Layout className={styles.innerLayout}>
            
            <Sider width={250} className={styles.sidebar}>
              <div className={styles.userInfoMini}>
                <Avatar src={avatarUrl} size={60} className={styles.avatarMini} />
                <div className={styles.userNameMini}>
                  <strong>{form.getFieldValue('FullName')}</strong>
                  <span><UserOutlined /> {role === 'Admin' ? 'Quản trị viên' : 'Nhân viên'}</span>
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
                    <p className={styles.formSub}>Quản lý thông tin hồ sơ và bảo mật tài khoản nội bộ</p>
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
                          <Button type="primary" htmlType="submit" className={styles.btnSave} loading={loading}>
                            LƯU THAY ĐỔI
                          </Button>
                        </Form.Item>
                      </Form>
                    </div>

                    <div className={styles.formRight}>
                      <div className={styles.avatarSection}>
                        <Avatar src={avatarUrl} size={120} className={styles.avatarBig} />
                        <Upload 
                          showUploadList={false} 
                          beforeUpload={() => false}
                          onChange={handleAvatarChange}
                          accept=".jpg,.jpeg,.png"
                        >
                          <Button icon={<UploadOutlined />} className={styles.btnUpload} loading={loading}>
                            Chọn Ảnh
                          </Button>
                        </Upload>
                        <p className={styles.avatarNote}>
                          Dung lượng file tối đa 1 MB<br/>
                          Định dạng: .JPEG, .PNG
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'password' && (
                <ChangePassword />
              )}

            </Content>
          </Layout>
        </div>
      </Content>
    </Layout>
  );
}

export default AdminProfile;