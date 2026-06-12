import React, { useState, useEffect } from 'react';
import { Layout, Form, Input, Button, Avatar, message, Upload, Divider, Modal } from 'antd';
import { UserOutlined, ArrowLeftOutlined, UploadOutlined, ProfileOutlined, ShoppingOutlined, LockOutlined, WalletOutlined, SafetyCertificateOutlined, SwapOutlined, MailOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import styles from './Profile.module.css';

import ChangePassword from './ChangePassword'; 
import OrderTrackingMini from '../Utility/OrderTrackingMini';
import VoucherWalletContent from '../Customer/VoucherWalletContent';
import WarrantyContent from '../Customer/WarrantyContent';
import CustomerReturns from '../Customer/CustomerReturns';

import { API_BASE } from "../config/api";

const { Header, Content, Sider } = Layout;

function Profile() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [emailForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  
  const [activeTab, setActiveTab] = useState('profile');
  const isCustomer = localStorage.getItem('customer_session_active') === 'true';
  const CLOUDINARY_CLOUD_NAME = 'dcmwz0uis';
  const CLOUDINARY_UPLOAD_PRESET = 'the_creamy_shop';

  useEffect(() => {
    fetchUserProfile();
  }, []); 

  const fetchUserProfile = async () => {
    try {
      const res = await axios.get(`${API_BASE}/auth/me`, {
       withCredentials: true
      });

      const userData = res.data.user || res.data.result;
      const profileData = userData?.profile || userData;

      if (userData) {
        setAvatarUrl(profileData?.Avatar || 'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773107213/default_avatar_gojcul.png');

        form.setFieldsValue({
          FullName: profileData?.TenKhachHang,
          Email: userData?.email || userData?.Email,
          SDT: profileData?.SDT,
          Diachi: profileData?.DiaChi || profileData?.Diachi, 
          Avatar: profileData?.Avatar,
        });
      }
    } catch (error) {
      console.error(error);
      message.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
      
      localStorage.removeItem('username');
      localStorage.removeItem('name');
      localStorage.removeItem('role');
      localStorage.removeItem('avatar');
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
        TenKhachHang: values.FullName,
        SDT: values.SDT,
        DiaChi: values.Diachi,
        Avatar: values.Avatar || avatarUrl,
      };

      const res = await axios.patch(`${API_BASE}/customers/me`, payload, {
        withCredentials:true
      });

      message.success('Cập nhật hồ sơ thành công!');
      
      const updatedData = res.data.result;
      localStorage.setItem('name', updatedData?.TenKhachHang || values.FullName);
      localStorage.setItem('avatar', updatedData?.Avatar || values.Avatar || avatarUrl);
      
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Cập nhật thất bại!';
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const openChangeEmailModal = () => {
    emailForm.setFieldsValue({
      Email: '',
      OTP: '',
    });
    setEmailOtpSent(false);
    setEmailModalOpen(true);
  };

  const closeChangeEmailModal = () => {
    setEmailModalOpen(false);
    setEmailOtpSent(false);
    emailForm.resetFields();
  };

  const handleSendEmailOtp = async () => {
    try {
      const values = await emailForm.validateFields(['Email']);
      setEmailLoading(true);
      await axios.post(
        `${API_BASE}/customers/me/email/send-otp`,
        { email: values.Email },
        { withCredentials: true },
      );
      setEmailOtpSent(true);
      message.success('OTP đã được gửi tới email mới!');
    } catch (error) {
      if (!error.errorFields) {
        message.error(
          error.response?.data?.message || 'Không thể gửi OTP đổi email!',
        );
      }
    } finally {
      setEmailLoading(false);
    }
  };

  const handleVerifyChangeEmail = async () => {
    try {
      const values = await emailForm.validateFields();
      setEmailLoading(true);
      const res = await axios.patch(
        `${API_BASE}/customers/me/email`,
        {
          email: values.Email,
          otp: values.OTP,
        },
        { withCredentials: true },
      );

      const newEmail = res.data?.result?.Email || values.Email;
      form.setFieldsValue({ Email: newEmail });
      message.success('Cập nhật email thành công!');
      closeChangeEmailModal();
    } catch (error) {
      if (!error.errorFields) {
        message.error(
          error.response?.data?.message || 'Không thể cập nhật email!',
        );
      }
    } finally {
      setEmailLoading(false);
    }
  };

  return (
    <Layout className={styles.profileWrapper}>
      <Helmet>
        <title>Hồ Sơ Của Tôi | Ceramic Shop</title>
      </Helmet>

      <Header className={styles.topHeader}>
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
        <div className={styles.headerActions}>
          <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => navigate('/home')} className={styles.btnBack}>
            Quay về trang chủ
          </Button>
        </div>
      </Header>

      <Content className={styles.mainContent}>
        <div className={styles.container}>
          <Layout className={styles.innerLayout}>
            
            <Sider
              width={250}
              breakpoint={null}
              className={styles.sidebar}
            >
              <div className={styles.userInfoMini}>
                <Avatar src={avatarUrl} size={60} className={styles.avatarMini} />
                <div className={styles.userNameMini}>
                  <strong>{form.getFieldValue('FullName')}</strong>
                  <span><UserOutlined /> Thành viên</span>
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
                <li 
                  className={activeTab === 'vouchers' ? styles.active : ''} 
                  onClick={() => setActiveTab('vouchers')}
                >
                  <WalletOutlined /> Ví khuyến mại
                </li>
              {isCustomer && (
                <li 
                  className={activeTab === 'warranties' ? styles.active : ''} 
                  onClick={() => setActiveTab('warranties')}
                >
                  <SafetyCertificateOutlined /> Bảo hành của tôi
                </li>
                )}
              {isCustomer && (
            <li
              className={activeTab === 'returns' ? styles.active : ''}
              onClick={() => setActiveTab('returns')}
            >
              <SwapOutlined /> Đổi trả của tôi
            </li>
                )}
                <li 
                  className={activeTab === 'orders' ? styles.active : ''} 
                  onClick={() => setActiveTab('orders')}
                >
                  <ShoppingOutlined /> Đơn hàng của tôi
                </li>
              </ul>
            </Sider>

            <Content className={styles.formContent}>
              
              {activeTab === 'profile' && (
                <>
                  <div className={styles.formHeader}>
                    <h2 className={styles.formTitle}>Hồ Sơ Của Tôi</h2>
                    <p className={styles.formSub}>Quản lý thông tin hồ sơ để bảo mật tài khoản</p>
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

                        <Form.Item>
                          <Button
                            icon={<MailOutlined />}
                            onClick={openChangeEmailModal}
                          >
                            Đổi email
                          </Button>
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

              {activeTab === 'orders' && (
                <OrderTrackingMini />
              )}

              {activeTab === 'vouchers' && (
                <VoucherWalletContent compact />
              )}

              {activeTab === 'warranties' && (
                <WarrantyContent compact />
              )}

              {activeTab === 'returns' && (
                <CustomerReturns compact />
              )}
            </Content>
          </Layout>
        </div>
      </Content>

      <Modal
        title="Đổi email tài khoản"
        open={emailModalOpen}
        onCancel={closeChangeEmailModal}
        onOk={handleVerifyChangeEmail}
        confirmLoading={emailLoading}
        okText="Xác nhận"
        cancelText="Hủy"
        destroyOnHidden
      >
        <Form form={emailForm} layout="vertical">
          <Form.Item
            label="Email mới"
            name="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email mới!' },
              { type: 'email', message: 'Email không hợp lệ!' },
            ]}
          >
            <Input disabled={emailOtpSent} />
          </Form.Item>
          <Button
            icon={<MailOutlined />}
            onClick={handleSendEmailOtp}
            loading={emailLoading}
            disabled={emailOtpSent}
            style={{ marginBottom: 16 }}
          >
            Gửi OTP
          </Button>
          <Form.Item
            label="OTP"
            name="OTP"
            rules={[{ required: true, message: 'Vui lòng nhập OTP!' }]}
          >
            <Input maxLength={6} placeholder="Nhập mã OTP 6 số" />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
}

export default Profile;
