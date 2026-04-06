import { useState, useRef, useEffect } from 'react';
import { Form, Input, Button, message } from 'antd';
import {
  MailOutlined,
  LockOutlined,
  ArrowLeftOutlined,
  CheckCircleFilled,
  SafetyOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import styles from './ForgotPassword.module.css';

const API_BASE = 'https://ceramic-shop-u8ak.onrender.com/api/v1';
const OTP_LENGTH = 6;
const COOLDOWN_SEC = 60;

function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [cooldown, setCooldown] = useState(0);
  const [remainingAttempts, setRemainingAttempts] = useState(5);
  const inputRefs = useRef([]);
  const [formPass] = Form.useForm();
  const timerRef = useRef(null);

  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

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
    try {
      await axios.post(`${API_BASE}/auth/forgot-password`, { email: values.email });
      setEmail(values.email);
      setStep(2);
      startCooldown();
      message.success('OTP đã được gửi đến email của bạn!');
    } catch (err) {
      message.error(err.response?.data?.message || 'Không thể gửi OTP!');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpInput = (val, idx) => {
    if (!/^\d*$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[idx] = val.slice(-1);
    setOtp(newOtp);
    if (val && idx < OTP_LENGTH - 1) inputRefs.current[idx + 1]?.focus();
  };

  const handleOtpKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0)
      inputRefs.current[idx - 1]?.focus();
    if (e.key === 'ArrowLeft' && idx > 0) inputRefs.current[idx - 1]?.focus();
    if (e.key === 'ArrowRight' && idx < OTP_LENGTH - 1) inputRefs.current[idx + 1]?.focus();
  };

  const handleOtpPaste = (e) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!text) return;
    const newOtp = [...otp];
    [...text].forEach((c, i) => { newOtp[i] = c; });
    setOtp(newOtp);
    inputRefs.current[Math.min(text.length, OTP_LENGTH - 1)]?.focus();
    e.preventDefault();
  };

  const handleVerifyOTP = async () => {
    const code = otp.join('');
    if (code.length < OTP_LENGTH) {
      message.warning('Vui lòng nhập đủ 6 chữ số OTP!');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/auth/verify-reset-otp`, { email, otp: code });
      setResetToken(res.data.resetToken);
      setStep(3);
    } catch (err) {
      const data = err.response?.data;
      if (data?.remainingAttempts !== undefined) setRemainingAttempts(data.remainingAttempts);
      message.error(data?.message || 'OTP không hợp lệ!');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (cooldown > 0) return;
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/auth/forgot-password`, { email });
      setOtp(Array(OTP_LENGTH).fill(''));
      setRemainingAttempts(5);
      startCooldown();
      message.success('OTP mới đã được gửi!');
    } catch (err) {
      message.error(err.response?.data?.message || 'Không thể gửi lại OTP!');
    } finally {
      setLoading(false);
    }
  };


  const handleResetPassword = async (values) => {
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/auth/reset-password`, {
        email,
        resetToken,
        newPassword: values.newPassword,
      });
      setStep(4);
    } catch (err) {
      message.error(err.response?.data?.message || 'Không thể đặt lại mật khẩu!');
    } finally {
      setLoading(false);
    }
  };

  const stepLabels = ['Nhập email', 'Xác minh OTP', 'Mật khẩu mới'];

  return (
    <div className={styles.pageWrapper}>
      <Helmet><title>Quên mật khẩu | Ceramic Shop</title></Helmet>

      {/* Shapes Background */}
      <div className={styles.shape1} />
      <div className={styles.shape2} />
      <div className={styles.shape3} />

      <header className={styles.topHeader}>
        {/* Khối Logo mới từ Landing Page */}
        <div className={styles.logoBox} onClick={() => navigate('/landing')}>
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

        <Button
          type="link"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/login')}
          className={styles.btnBack}
        >
          Quay lại đăng nhập
        </Button>
      </header>

      <div className={styles.centerWrapper}>
        <div className={styles.card}>
          {step <= 3 && (
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
              <div className={styles.cardHeader}>
                <div className={styles.iconWrap} style={{ background: 'linear-gradient(135deg,#1b437c,#2d6abf)' }}>
                  <MailOutlined className={styles.headerIcon} />
                </div>
                <h2 className={styles.cardTitle}>QUÊN MẬT KHẨU</h2>
                <p className={styles.cardSub}>Nhập email đã đăng ký để nhận mã OTP khôi phục mật khẩu</p>
              </div>
              <Form layout="vertical" onFinish={handleSendOTP}>
                <Form.Item
                  label="Địa chỉ email"
                  name="email"
                  rules={[
                    { required: true, message: 'Vui lòng nhập email!' },
                    { type: 'email', message: 'Email không đúng định dạng!' },
                  ]}
                >
                  <Input
                    prefix={<MailOutlined className={styles.inputIcon} />}
                    className={styles.customInput}
                    placeholder="example@email.com"
                    size="large"
                  />
                </Form.Item>
                <Button type="primary" htmlType="submit" block loading={loading} className={styles.btnPrimary}>
                  GỬI MÃ OTP
                </Button>
              </Form>
            </div>
          )}

          {step === 2 && (
            <div className={styles.stepContent}>
              <div className={styles.cardHeader}>
                <div className={styles.iconWrap} style={{ background: 'linear-gradient(135deg,#c48c46,#e6aa6e)' }}>
                  <SafetyOutlined className={styles.headerIcon} />
                </div>
                <h2 className={styles.cardTitle}>NHẬP MÃ OTP</h2>
                <p className={styles.cardSub}>
                  Mã OTP đã được gửi đến <strong>{email}</strong>.<br />
                  Có hiệu lực trong 5 phút.
                </p>
              </div>

              <div className={styles.otpRow} onPaste={handleOtpPaste}>
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (inputRefs.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpInput(e.target.value, idx)}
                    onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                    className={`${styles.otpCell} ${digit ? styles.otpFilled : ''}`}
                  />
                ))}
              </div>

              {remainingAttempts < 5 && (
                <p className={styles.attemptsWarn}>
                  ⚠️ Còn {remainingAttempts} lần thử
                </p>
              )}

              <Button
                type="primary"
                block
                loading={loading}
                onClick={handleVerifyOTP}
                className={styles.btnPrimary}
                style={{ marginTop: 8 }}
              >
                XÁC NHẬN OTP
              </Button>

              <div className={styles.resendRow}>
                <span className={styles.resendText}>Không nhận được mã? </span>
                <button
                  className={`${styles.resendBtn} ${cooldown > 0 ? styles.resendDisabled : ''}`}
                  onClick={handleResendOTP}
                  disabled={cooldown > 0 || loading}
                >
                  {cooldown > 0 ? `Gửi lại (${cooldown}s)` : 'Gửi lại OTP'}
                </button>
              </div>

              <button className={styles.backStep} onClick={() => setStep(1)}>
                ← Đổi email khác
              </button>
            </div>
          )}

          {step === 3 && (
            <div className={styles.stepContent}>
              <div className={styles.cardHeader}>
                <div className={styles.iconWrap} style={{ background: 'linear-gradient(135deg,#1b437c,#2d6abf)' }}>
                  <LockOutlined className={styles.headerIcon} />
                </div>
                <h2 className={styles.cardTitle}>MẬT KHẨU MỚI</h2>
                <p className={styles.cardSub}>Tạo mật khẩu mới cho tài khoản của bạn</p>
              </div>
              <Form form={formPass} layout="vertical" onFinish={handleResetPassword}>
                <Form.Item
                  label="Mật khẩu mới"
                  name="newPassword"
                  rules={[
                    { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                    { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' },
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined className={styles.inputIcon} />}
                    className={styles.customInput}
                    placeholder="Tối thiểu 6 ký tự"
                    size="large"
                  />
                </Form.Item>
                <Form.Item
                  label="Xác nhận mật khẩu"
                  name="confirmPassword"
                  dependencies={['newPassword']}
                  rules={[
                    { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('newPassword') === value) return Promise.resolve();
                        return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                      },
                    }),
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined className={styles.inputIcon} />}
                    className={styles.customInput}
                    placeholder="Nhập lại mật khẩu mới"
                    size="large"
                  />
                </Form.Item>
                <Button type="primary" htmlType="submit" block loading={loading} className={styles.btnPrimary}>
                  ĐẶT LẠI MẬT KHẨU
                </Button>
              </Form>
            </div>
          )}

          {step === 4 && (
            <div className={styles.successState}>
              <CheckCircleFilled className={styles.successIcon} />
              <h2 className={styles.successTitle}>Khôi phục thành công!</h2>
              <p className={styles.successSub}>
                Mật khẩu của bạn đã được đặt lại.<br />
                Hãy đăng nhập bằng mật khẩu mới.
              </p>
              <Button
                type="primary"
                block
                className={styles.btnPrimary}
                onClick={() => navigate('/login')}
              >
                ĐI ĐẾN ĐĂNG NHẬP
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;