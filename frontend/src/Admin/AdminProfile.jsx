import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Layout, Form, Input, Button, Avatar, message, Divider } from 'antd';
import {
  HomeOutlined,
  IdcardOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  ProfileOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import styles from '../Auth/Profile.module.css';

import ChangePassword from '../Auth/ChangePassword';

import { API_BASE } from "../config/api";

const { Content, Sider } = Layout;

function AdminProfile() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [profileName, setProfileName] = useState(
    localStorage.getItem('admin_username') ||
    localStorage.getItem('username') ||
    'Admin'
  );

  const [activeTab, setActiveTab] = useState('profile');

  const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
  const role = localStorage.getItem('admin_role') || localStorage.getItem('role');
  const normalizedRole = (role || '').trim().toLowerCase();
  const roleLabel = normalizedRole === 'admin' ? 'Quản trị viên' : 'Nhân viên';
  const avatarInitial = (profileName || 'A').trim().charAt(0).toUpperCase();
  const authConfig = useMemo(() => ({
    withCredentials: true,
    ...(token && token !== 'null' && token !== 'undefined'
      ? { headers: { Authorization: `Bearer ${token}` } }
      : {}),
  }), [token]);
  const emailValue = Form.useWatch('Email', form);
  const phoneValue = Form.useWatch('SDT', form);
  const addressValue = Form.useWatch('Diachi', form);

  const fetchAdminProfile = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/auth/me`, authConfig);

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

        setProfileName(fullName);

        form.setFieldsValue({
          FullName: fullName,
          Email: userData?.email || userData?.Email,
          SDT: profileData?.SDT,
          Diachi: profileData?.DiaChi || profileData?.Diachi,
        });
      }
    } catch (error) {
      console.error("Lỗi khi lấy thông tin Admin:", error);
      
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        message.error('Phiên đăng nhập đã hết hạn hoặc không có quyền. Vui lòng đăng nhập lại!');
        [
          'admin_token',
          'admin_session_active',
          'admin_role',
          'admin_username',
          'admin_token_expiry',
          'token',
          'role',
          'username',
        ].forEach((key) => localStorage.removeItem(key));
        navigate('/login');
      } else {
        message.error('Không thể tải thông tin hồ sơ: ' + (error.response?.data?.message || 'Lỗi mạng'));
      }
    }
  }, [authConfig, form, navigate]);

  useEffect(() => {
    const timeoutId = window.setTimeout(fetchAdminProfile, 0);
    return () => window.clearTimeout(timeoutId);
  }, [fetchAdminProfile]);

  const handleUpdateProfile = async (values) => {
    setLoading(true);

    try {
      const payload = {
        TenNhanVien: values.FullName,
        SDT: values.SDT,
        DiaChi: values.Diachi,
      };

      const res = await axios.patch(
        `${API_BASE}/staffs/me`,
        payload,
        authConfig
      );

      message.success('Cập nhật hồ sơ thành công!');

      const updatedData = res.data.result;
      const updatedName = updatedData?.TenNhanVien || values.FullName;

      setProfileName(updatedName);

      localStorage.setItem('admin_username', updatedName);

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
                  size={60}
                  className={styles.avatarMini}
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
                      <div className={styles.adminProfileSummary}>
                        <Avatar
                          size={104}
                          className={styles.adminSummaryAvatar}
                        >
                          {avatarInitial}
                        </Avatar>

                        <div className={styles.adminSummaryTitle}>
                          <h3>{profileName}</h3>
                          <span>{roleLabel}</span>
                        </div>

                        <div className={styles.adminSummaryList}>
                          <div className={styles.adminSummaryItem}>
                            <IdcardOutlined />
                            <div>
                              <span>Tài khoản</span>
                              <strong>{localStorage.getItem('admin_username') || localStorage.getItem('username') || profileName}</strong>
                            </div>
                          </div>
                          <div className={styles.adminSummaryItem}>
                            <MailOutlined />
                            <div>
                              <span>Email</span>
                              <strong>{emailValue || 'Chưa cập nhật'}</strong>
                            </div>
                          </div>
                          <div className={styles.adminSummaryItem}>
                            <PhoneOutlined />
                            <div>
                              <span>Số điện thoại</span>
                              <strong>{phoneValue || 'Chưa cập nhật'}</strong>
                            </div>
                          </div>
                          <div className={styles.adminSummaryItem}>
                            <HomeOutlined />
                            <div>
                              <span>Địa chỉ liên hệ</span>
                              <strong>{addressValue || 'Chưa cập nhật'}</strong>
                            </div>
                          </div>
                        </div>
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
