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
    message: 'Đang đồng bộ kết quả giao dịch với máy chủ...'
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

          const statusFromBE = res.data.status;

          if (statusFromBE === 'SUCCESS') {
            setPaymentData({
              status: 'success',
              method: 'ZALOPAY',
              orderId: parsedOrderId,
              amount: res.data.amount || 0,
              message: 'Giao dịch ZaloPay thành công.'
            });
          } else if (statusFromBE === 'PENDING') {
            setPaymentData({
              status: 'pending',
              method: 'ZALOPAY',
              orderId: parsedOrderId,
              amount: res.data.amount || 0,
              message: 'Đang chờ xác nhận từ ZaloPay...'
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
          message: code === '24' ? 'Bạn đã hủy giao dịch.' : 'Giao dịch thất bại.'
        });
      } else if (isMoMo) {
        const code = searchParams.get('resultCode');
        setPaymentData({
          status: code === '0' ? 'success' : 'error',
          method: 'MOMO',
          orderId: searchParams.get('orderId'),
          amount: Number(searchParams.get('amount') || 0),
          message: searchParams.get('message')
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

  // auto redirect khi success
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
      <div className="loader">
        <div className="spinner" />
        <p>{message}</p>
      </div>
    );
  }

  return (
    <div className="wrapper">
      <div className="card">
        
        <div className={`icon ${status}`}>
          {status === 'success' && <span>✓</span>}
          {status === 'pending' && <span>⏳</span>}
          {status === 'error' && <span>✕</span>}
        </div>

        <h2 className={`title ${status}`}>
          {status === 'success'
            ? 'Thanh toán thành công!'
            : status === 'pending'
            ? 'Đang xử lý...'
            : 'Thanh toán thất bại'}
        </h2>

        <p className="message">
          {status === 'success'
            ? 'Đơn hàng của bạn đang được xử lý.'
            : message}
        </p>

        {orderId && (
          <div className="box">
            <div><span>Cổng:</span> <b>{method}</b></div>
            <div><span>Mã:</span> <b>{orderId}</b></div>
            <div><span>Số tiền:</span> <b>{formatCurrency(amount)}</b></div>
          </div>
        )}

        <div className="actions">
          <Link to="/orders" className="btn primary">Đơn hàng</Link>
          <Link to="/" className="btn">Trang chủ</Link>
        </div>

      </div>
    </div>
  );
};

export default PaymentSuccess;