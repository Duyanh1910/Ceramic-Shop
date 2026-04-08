import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Button, Input, Form, message, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import styles from './Register.module.css';
import { Helmet } from 'react-helmet-async';
import {
  UserOutlined, MailOutlined, LockOutlined,
  ArrowLeftOutlined, SafetyOutlined, ArrowRightOutlined,
  HomeFilled, ShopFilled
} from '@ant-design/icons';
import Chibi from './Chibi.jsx';

const { Text, Link } = Typography;
const API_BASE = 'https://ceramic-shop-u8ak.onrender.com/api/v1';
const OTP_LENGTH = 6;
const COOLDOWN_SEC = 60;

function Register() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({});
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [cooldown, setCooldown] = useState(0);
  const [remainingAttempts, setRemainingAttempts] = useState(5);
  const [form] = Form.useForm();
  const inputRefs = useRef([]);
  const timerRef = useRef(null);
  const navigate = useNavigate();

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(false);
  const [actionFailed, setActionFailed] = useState(false);

  useEffect(() => () => clearInterval(timerRef.current), []);

  const startCooldown = () => {
    setCooldown(COOLDOWN_SEC);
    timerRef.current = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) { clearInterval(timerRef.current); return 0; }
        return c - 1;
      });
    }, 1000);
  };

  const handleSendOTP = async (values) => {
    setLoading(true);
    setActionFailed(false);
    try {
      await axios.post(`${API_BASE}/auth/sendVerifyEmail`, {
        username: values.username,
        email: values.email,
      });

      setFormData(values);
      setStep(2);
      startCooldown();
      message.success('OTP đã được gửi đến email của bạn!');
    } catch (err) {
      setActionFailed(true);
      message.error(err.response?.data?.message || 'Tên đăng nhập hoặc email đã được sử dụng!');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpInput = (val, idx) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[idx] = val.slice(-1);
    setOtp(next);
    setActionFailed(false); 
    if (val && idx < OTP_LENGTH - 1) inputRefs.current[idx + 1]?.focus();
  };

  const handleOtpKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) inputRefs.current[idx - 1]?.focus();
    if (e.key === 'ArrowLeft' && idx > 0) inputRefs.current[idx - 1]?.focus();
    if (e.key === 'ArrowRight' && idx < OTP_LENGTH - 1) inputRefs.current[idx + 1]?.focus();
  };

  const handleOtpPaste = (e) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!text) return;
    const next = [...otp];
    [...text].forEach((c, i) => { next[i] = c; });
    setOtp(next);
    setActionFailed(false);
    inputRefs.current[Math.min(text.length, OTP_LENGTH - 1)]?.focus();
    e.preventDefault();
  };

  const handleVerifyOTP = async () => {
    const code = otp.join('');
    if (code.length < OTP_LENGTH) { message.warning('Vui lòng nhập đủ 6 chữ số!'); return; }
    setLoading(true);
    setActionFailed(false);
    try {
      await axios.post(`${API_BASE}/auth/VerifyEmail`, { email: formData.email, otp: code });
      await handleRegister();
    } catch (err) {
      setActionFailed(true);
      const data = err.response?.data;
      if (data?.remainingAttempts !== undefined) setRemainingAttempts(data.remainingAttempts);
      message.error(data?.message || 'OTP không hợp lệ!');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    try {
      await axios.post(`${API_BASE}/auth/register`, {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });
      setActionSuccess(true);
      setStep(3);
    } catch (err) {
      setActionFailed(true);
      message.error(err.response?.data?.message || 'Đăng ký thất bại!');
    }
  };

  const handleResendOTP = async () => {
    if (cooldown > 0) return;
    setLoading(true);
    setActionFailed(false);
    try {
      await axios.post(`${API_BASE}/auth/sendVerifyEmail`, { email: formData.email });
      setOtp(Array(OTP_LENGTH).fill(''));
      setRemainingAttempts(5);
      startCooldown();
      message.success('OTP mới đã được gửi!');
    } catch (err) {
      setActionFailed(true);
      message.error(err.response?.data?.message || 'Không thể gửi lại OTP!');
    } finally {
      setLoading(false);
    }
  };

  const stepLabels = ['Thông tin', 'Xác minh email', 'Hoàn tất'];

  return (
    <div className={styles.registerContainer}>
      <Helmet><title>Đăng ký | Ceramic Shop</title></Helmet>

      <div className={styles.shape1} />
      <div className={styles.shape2} />
      <div className={styles.shape3} />

      <div className={styles.combinedCard}>
        <div className={styles.cardImage}>
          <div className={styles.glowEffect} />
          <div style={{ position: 'relative', flexDirection: 'column', width: '100%', display: 'flex', alignItems: 'center', zIndex: 1 }}>
            <Chibi 
              passwordVisible={passwordVisible || confirmPasswordVisible} 
              loginSuccess={actionSuccess} 
              loginFailed={actionFailed}
              defaultMsg="Xin chào đây là trang đăng ký của Ceramic-Shop"
              successMsg="Đăng ký thành công! Hãy đăng nhập để tiếp tục."
              failMsg="Thông tin chưa chính xác hoặc OTP sai, hãy thử lại nhé!"
            />
          </div>

          <div style={{ marginTop: '10px', zIndex: 1, position: 'relative' }}>
            <h2 className={styles.logoDisplayTitle}>CERAMIC-SHOP</h2>
            <p className={styles.logoDisplaySub}>TINH HOA GỐM SỨ VIỆT</p>
          </div>
        </div>

        <div className={styles.cardForm}>
          <div style={{ marginBottom: 15, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => navigate('/')}
              style={{ color: '#1b437c', fontWeight: 600, paddingLeft: 0 }} className={styles.backButton}>
              <HomeFilled/> Trang chủ
            </Button>
            <Button type="link" onClick={() => navigate('/home')}
              style={{ color: '#1b437c', fontWeight: 600, paddingLeft: 0 }} className={styles.backButton}>
              <ShopFilled/> Cửa hàng <ArrowRightOutlined />
            </Button>
          </div>

          {step <= 2 && (
            <div className={styles.stepTracker}>
              {stepLabels.map((label, i) => (
                <div key={i} className={styles.stepItem}>
                  <div className={`${styles.stepDot} ${step > i + 1 ? styles.done : step === i + 1 ? styles.active : ''}`}>
                    {step > i + 1 ? '✓' : i + 1}
                  </div>
                  <span className={`${styles.stepLabel} ${step === i + 1 ? styles.activeLabel : ''}`}>{label}</span>
                  {i < stepLabels.length - 1 && (
                    <div className={`${styles.stepLine} ${step > i + 1 ? styles.doneLine : ''}`} />
                  )}
                </div>
              ))}
            </div>
          )}

          {step === 1 && (
            <div className={styles.stepContent}>
              <h2 className={styles.formTitle}>ĐĂNG KÝ</h2>
              <Form 
                form={form} 
                layout="vertical" 
                onFinish={handleSendOTP}
                onValuesChange={() => setActionFailed(false)} 
              >
                <Form.Item
                  label={<span style={{ fontWeight: 500 }}>Tên đăng nhập</span>}
                  name="username"
                  rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
                  style={{ marginBottom: 14 }}
                >
                  <Input prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
                    className={styles.customInput} placeholder="Nhập tên đăng nhập" />
                </Form.Item>

                <Form.Item
                  label={<span style={{ fontWeight: 500 }}>Email</span>}
                  name="email"
                  rules={[
                    { required: true, message: 'Vui lòng nhập email!' },
                    { type: 'email', message: 'Email không đúng định dạng!' },
                  ]}
                  style={{ marginBottom: 14 }}
                >
                  <Input prefix={<MailOutlined style={{ color: '#bfbfbf' }} />}
                    className={styles.customInput} placeholder="Nhập địa chỉ email" />
                </Form.Item>

                <Form.Item
                  label={<span style={{ fontWeight: 500 }}>Mật khẩu</span>}
                  name="password"
                  rules={[
                    { required: true, message: 'Vui lòng nhập mật khẩu!' },
                    { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' },
                  ]}
                  style={{ marginBottom: 14 }}
                >
                  <Input.Password prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
                    className={styles.customInput} placeholder="Tối thiểu 6 ký tự" 
                    visibilityToggle={{
                      visible: passwordVisible,
                      onVisibleChange: setPasswordVisible,
                    }}
                  />
                </Form.Item>

                <Form.Item
                  label={<span style={{ fontWeight: 500 }}>Xác nhận mật khẩu</span>}
                  name="confirmPassword"
                  dependencies={['password']}
                  rules={[
                    { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('password') === value) return Promise.resolve();
                        return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                      },
                    }),
                  ]}
                  style={{ marginBottom: 14 }}
                >
                  <Input.Password prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
                    className={styles.customInput} placeholder="Nhập lại mật khẩu" 
                    visibilityToggle={{
                      visible: confirmPasswordVisible,
                      onVisibleChange: setConfirmPasswordVisible,
                    }}
                  />
                </Form.Item>

                <div style={{ marginBottom: 20, textAlign: 'right' }}>
                  <Text style={{ color: '#666' }}>Đã có tài khoản? </Text>
                  <Link onClick={() => navigate('/login')} style={{ fontWeight: 600, color: '#50a1fe' }}>
                    Đăng nhập ngay
                  </Link>
                </div>

                <Button className={styles.customButton} type="primary" htmlType="submit"
                  block loading={loading}>
                  Tiếp tục
                </Button>
              </Form>
            </div>
          )}

          {step === 2 && (
            <div className={styles.stepContent}>
              <div className={styles.otpHeader}>
                <div className={styles.otpIconWrap}>
                  <SafetyOutlined className={styles.otpIcon} />
                </div>
                <h2 className={styles.formTitle} style={{ marginBottom: 6 }}>XÁC MINH EMAIL</h2>
                <p className={styles.otpSub}>
                  Mã OTP đã được gửi đến<br />
                  <strong>{formData.email}</strong>
                </p>
              </div>

              <div className={styles.otpRow} onPaste={handleOtpPaste}>
                {otp.map((digit, idx) => (
                  <input key={idx} ref={(el) => (inputRefs.current[idx] = el)}
                    type="text" inputMode="numeric" maxLength={1} value={digit}
                    onChange={(e) => handleOtpInput(e.target.value, idx)}
                    onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                    className={`${styles.otpCell} ${digit ? styles.otpFilled : ''}`} />
                ))}
              </div>

              {remainingAttempts < 5 && (
                <p className={styles.attemptsWarn}>⚠️ Còn {remainingAttempts} lần thử</p>
              )}

              <Button type="primary" block loading={loading} onClick={handleVerifyOTP}
                className={styles.customButton} style={{ marginTop: 8 }}>
                XÁC NHẬN & ĐĂNG KÝ
              </Button>

              <div className={styles.resendRow}>
                <span className={styles.resendText}>Không nhận được mã? </span>
                <button
                  className={`${styles.resendBtn} ${cooldown > 0 ? styles.resendDisabled : ''}`}
                  onClick={handleResendOTP} disabled={cooldown > 0 || loading}>
                  {cooldown > 0 ? `Gửi lại (${cooldown}s)` : 'Gửi lại OTP'}
                </button>
              </div>

              <button className={styles.backStep} onClick={() => { setStep(1); setActionFailed(false); }}>
                ← Sửa thông tin
              </button>
            </div>
          )}

          {step === 3 && (
            <div className={styles.successState}>
              <div className={styles.successCheckWrap}>
                <svg viewBox="0 0 52 52" className={styles.successCheck}>
                  <circle cx="26" cy="26" r="25" fill="none" stroke="#52c41a" strokeWidth="2" />
                  <path fill="none" stroke="#52c41a" strokeWidth="3" strokeLinecap="round"
                    strokeLinejoin="round" d="M14 27l8 8 16-16" />
                </svg>
              </div>
              <h2 className={styles.successTitle}>Đăng ký thành công!</h2>
              <p className={styles.successSub}>
                Tài khoản <strong>{formData.username}</strong> đã được tạo.<br />
                Hãy đăng nhập để tiếp tục mua sắm.
              </p>
              <Button type="primary" block className={styles.customButton}
                onClick={() => navigate('/login')}>
                ĐI ĐẾN ĐĂNG NHẬP
              </Button>
              <button className={styles.backStep} style={{ marginTop: 14 }}
                onClick={() => navigate('/')}>
                Về trang chủ
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Register;