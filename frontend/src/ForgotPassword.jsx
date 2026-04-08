import { useState, useRef, useEffect } from 'react';
import { Form, Input, Button, message } from 'antd';
import { MailOutlined, LockOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import styles from './ForgotPassword.module.css';
import Chibi from './Chibi.jsx';

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

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(false);
  const [actionFailed, setActionFailed] = useState(false);

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
    setActionFailed(false);
    try {
      await axios.post(`${API_BASE}/auth/forgot-password`, { email: values.email });
      setEmail(values.email);
      setStep(2);
      startCooldown();
      message.success('OTP đã được gửi đến email của bạn!');
    } catch (err) {
      setActionFailed(true);
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
    setActionFailed(false); 
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
    setActionFailed(false); 
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
    setActionFailed(false);
    try {
      const res = await axios.post(`${API_BASE}/auth/verify-reset-otp`, { email, otp: code });
      setResetToken(res.data.resetToken);
      setStep(3);
    } catch (err) {
      setActionFailed(true);
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
    setActionFailed(false);
    try {
      await axios.post(`${API_BASE}/auth/forgot-password`, { email });
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

  const handleResetPassword = async (values) => {
    setLoading(true);
    setActionFailed(false);
    try {
      await axios.post(`${API_BASE}/auth/reset-password`, {
        email,
        resetToken,
        newPassword: values.newPassword,
      });
      setActionSuccess(true);
      setStep(4);
    } catch (err) {
      setActionFailed(true);
      message.error(err.response?.data?.message || 'Không thể đặt lại mật khẩu!');
    } finally {
      setLoading(false);
    }
  };

  const stepLabels = ['Nhập email', 'Xác minh OTP', 'Mật khẩu mới'];

  return (
    <div className={styles.forgotContainer}>
      <Helmet><title>Quên mật khẩu | Ceramic Shop</title></Helmet>

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
              defaultMsg={
                step === 1 ? "Nhập email của bạn để tôi gửi mã khôi phục nhé!" : 
                step === 2 ? "Hãy kiểm tra email và nhập mã OTP vào đây nha!" : 
                step === 3 ? "Tạo mật khẩu mới nào. Nhớ lưu lại cẩn thận nhé!" : ""
              }
              successMsg="Tuyệt vời! Mật khẩu của bạn đã được đặt lại."
              failMsg="Thông tin chưa chính xác hoặc mã OTP sai, bạn thử lại nhé!"
            />
          </div>

          <div style={{ marginTop: '10px', zIndex: 1, position: 'relative' }}>
            <h2 className={styles.logoDisplayTitle}>CERAMIC-SHOP</h2>
            <p className={styles.logoDisplaySub}>TINH HOA GỐM SỨ VIỆT</p>
          </div>
        </div>

        <div className={styles.cardForm}>
          <div style={{ marginBottom: 15, display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
            <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => navigate('/login')}
              style={{ color: '#1b437c', fontWeight: 600, paddingLeft: 0 }} className={styles.backButton}>
              Quay lại đăng nhập
            </Button>
          </div>

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
              <h2 className={styles.formTitle}>QUÊN MẬT KHẨU</h2>
              <Form layout="vertical" onFinish={handleSendOTP} onValuesChange={() => setActionFailed(false)}>
                <Form.Item
                  label={<span style={{ fontWeight: 500 }}>Địa chỉ email</span>}
                  name="email"
                  rules={[
                    { required: true, message: 'Vui lòng nhập email!' },
                    { type: 'email', message: 'Email không đúng định dạng!' },
                  ]}
                  style={{ marginBottom: 14 }}
                >
                  <Input
                    prefix={<MailOutlined style={{ color: '#bfbfbf' }} />}
                    className={styles.customInput}
                    placeholder="example@email.com"
                  />
                </Form.Item>
                <Button type="primary" htmlType="submit" block loading={loading} className={styles.customButton} style={{ marginTop: '10px' }}>
                  GỬI MÃ OTP
                </Button>
              </Form>
            </div>
          )}

          {step === 2 && (
            <div className={styles.stepContent}>
              <div className={styles.otpHeader}>
                <h2 className={styles.formTitle} style={{ marginBottom: 6 }}>NHẬP MÃ OTP</h2>
                <p className={styles.otpSub}>
                  Mã OTP đã được gửi đến<br />
                  <strong>{email}</strong>
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
                className={styles.customButton}
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

              <button className={styles.backStep} onClick={() => { setStep(1); setActionFailed(false); }}>
                ← Đổi email khác
              </button>
            </div>
          )}

          {step === 3 && (
            <div className={styles.stepContent}>
              <h2 className={styles.formTitle}>MẬT KHẨU MỚI</h2>
              <Form form={formPass} layout="vertical" onFinish={handleResetPassword} onValuesChange={() => setActionFailed(false)}>
                <Form.Item
                  label={<span style={{ fontWeight: 500 }}>Mật khẩu mới</span>}
                  name="newPassword"
                  rules={[
                    { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                    { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' },
                  ]}
                  style={{ marginBottom: 14 }}
                >
                  <Input.Password
                    prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
                    className={styles.customInput}
                    placeholder="Tối thiểu 6 ký tự"
                    visibilityToggle={{
                      visible: passwordVisible,
                      onVisibleChange: setPasswordVisible,
                    }}
                  />
                </Form.Item>
                <Form.Item
                  label={<span style={{ fontWeight: 500 }}>Xác nhận mật khẩu</span>}
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
                  style={{ marginBottom: 14 }}
                >
                  <Input.Password
                    prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
                    className={styles.customInput}
                    placeholder="Nhập lại mật khẩu mới"
                    visibilityToggle={{
                      visible: confirmPasswordVisible,
                      onVisibleChange: setConfirmPasswordVisible,
                    }}
                  />
                </Form.Item>
                <Button type="primary" htmlType="submit" block loading={loading} className={styles.customButton} style={{ marginTop: '10px' }}>
                  ĐẶT LẠI MẬT KHẨU
                </Button>
              </Form>
            </div>
          )}

          {step === 4 && (
            <div className={styles.successState}>
              <div className={styles.successCheckWrap}>
                <svg viewBox="0 0 52 52" className={styles.successCheck}>
                  <circle cx="26" cy="26" r="25" fill="none" stroke="#52c41a" strokeWidth="2" />
                  <path fill="none" stroke="#52c41a" strokeWidth="3" strokeLinecap="round"
                    strokeLinejoin="round" d="M14 27l8 8 16-16" />
                </svg>
              </div>
              <h2 className={styles.successTitle}>Khôi phục thành công!</h2>
              <p className={styles.successSub}>
                Mật khẩu của bạn đã được đặt lại.<br />
                Hãy đăng nhập bằng mật khẩu mới.
              </p>
              <Button
                type="primary"
                block
                className={styles.customButton}
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