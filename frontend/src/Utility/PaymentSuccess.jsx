import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import './PaymentSuccess.css';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();

  const [paymentData, setPaymentData] = useState({
    status: 'loading',
    method: '',
    orderId: '',
    amount: 0,
    message: 'Đang đồng bộ dữ liệu giao dịch...'
  });

  const { status, method, orderId, amount, message } = paymentData;

  useEffect(() => {
    const verifyPayment = async () => {
      const appTransId = searchParams.get('apptransid');
      const isZaloPay = !!appTransId;
      const isVnPay = searchParams.has('vnp_ResponseCode');
      const isMoMo = searchParams.has('resultCode');

      if (isZaloPay) {
        let parsedOrderId = appTransId?.split('_')[1] || appTransId;

        try {
          const res = await axios.get(
            `https://ceramic-shop-u8ak.onrender.com/api/v1/payment/check-status/${appTransId}`
          );

          if (res.data.success === true) {
            setPaymentData({
              status: 'success',
              method: 'ZALOPAY',
              orderId: parsedOrderId,
              amount: res.data.data?.amount || 0,
              message: 'Giao dịch ZaloPay đã hoàn tất.'
            });
          } else if (res.data.isPending === true) {
            setPaymentData({
              status: 'pending',
              method: 'ZALOPAY',
              orderId: parsedOrderId,
              amount: res.data.data?.amount || 0,
              message: 'Đang chờ xác nhận từ hệ thống ZaloPay...'
            });
          } else {
            throw new Error();
          }
        } catch {
          setPaymentData({
            status: 'error',
            method: 'ZALOPAY',
            orderId: parsedOrderId,
            amount: 0,
            message: 'Giao dịch ZaloPay thất bại hoặc đã bị hủy.'
          });
        }
      } else if (isVnPay) {
        const code = searchParams.get('vnp_ResponseCode');
        setPaymentData({
          status: code === '00' ? 'success' : 'error',
          method: 'VNPAY',
          orderId: searchParams.get('vnp_TxnRef'),
          amount: Number(searchParams.get('vnp_Amount') || 0) / 100,
          message: code === '24' ? 'Bạn đã hủy giao dịch.' : 'Giao dịch VNPAY thất bại.'
        });
      } else if (isMoMo) {
        const code = searchParams.get('resultCode');
        setPaymentData({
          status: code === '0' ? 'success' : 'error',
          method: 'MOMO',
          orderId: searchParams.get('orderId'),
          amount: Number(searchParams.get('amount') || 0),
          message: searchParams.get('message') || 'Lỗi xử lý giao dịch MoMo.'
        });
      } else {
        setPaymentData({
          status: 'error',
          message: 'Không tìm thấy thông tin giao dịch.'
        });
      }
    };

    verifyPayment();
  }, [searchParams]);

  useEffect(() => {
    if (status === 'success') {
      const t = setTimeout(() => {
        window.location.href = '/orders';
      }, 5000);
      return () => clearTimeout(t);
    }
  }, [status]);

  const formatCurrency = (v) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v || 0);
  if (status === 'loading') {
    return (
      <div className="loader-wrapper">
        <div className="spinner" />
        <h3 style={{ color: 'var(--text-main)', fontWeight: '600' }}>{message}</h3>
      </div>
    );
  }

  return (
    <div className="wrapper">
      <div className="card">
        
        <div className={`icon-container ${status}`}>
          {status === 'success' && (
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path className="animate-draw" d="M5 13l4 4L19 7" />
            </svg>
          )}
          {status === 'pending' && (
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path className="animate-draw" d="M12 6v6l4 2" />
            </svg>
          )}
          {status === 'error' && (
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path className="animate-draw" d="M18 6L6 18M6 6l12 12" />
            </svg>
          )}
        </div>

        <h2 className={`title ${status}`}>
          {status === 'success' ? 'Thanh toán thành công!'
            : status === 'pending' ? 'Giao dịch đang xử lý'
            : 'Thanh toán thất bại'}
        </h2>
        
        <p className="message">
          {status === 'success' 
            ? 'Cảm ơn bạn đã mua sắm. Hệ thống sẽ tự động chuyển hướng sau 5 giây.' 
            : message}
        </p>

        {orderId && (
          <div className="receipt">
            {method && (
              <div className="receipt-row">
                <span className="receipt-label">Cổng thanh toán</span>
                <span className="receipt-value tag">{method}</span>
              </div>
            )}
            <div className="receipt-row">
              <span className="receipt-label">Mã đơn hàng</span>
              <span className="receipt-value">{orderId}</span>
            </div>
            <div className="receipt-row">
              <span className="receipt-label">Tổng thanh toán</span>
              <span className="receipt-value highlight-amount">{formatCurrency(amount)}</span>
            </div>
          </div>
        )}

        <div className="actions">
          <Link to="/orders" className="btn primary">
            Xem đơn hàng của tôi
          </Link>
          <Link to="/" className="btn secondary">
            Về trang chủ
          </Link>
        </div>

      </div>
    </div>
  );
};

export default PaymentSuccess;