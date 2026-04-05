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

  useEffect(() => {
    const verifyPayment = async () => {
      const isVnPay = searchParams.has('vnp_ResponseCode');
      const isMoMo = searchParams.has('resultCode');
      const isZaloPay = searchParams.has('apptransid'); 

      if (isZaloPay) {
        const appTransId = searchParams.get('apptransid');
        let parsedOrderId = appTransId?.includes('_') ? appTransId.split('_')[1] : appTransId;
        const amountUrl = Number(searchParams.get('amount') || 0);

        try {
          const res = await axios.get(`https://ceramic-shop-u8ak.onrender.com/api/v1/payment/check-status/${appTransId}`);
          
          if (res.data.success) {
            setPaymentData({ status: 'success', method: 'ZALOPAY', orderId: parsedOrderId, amount: amountUrl, message: 'Giao dịch ZaloPay thành công.' });
          } else if (res.data.isPending) {
            setPaymentData({ status: 'pending', method: 'ZALOPAY', orderId: parsedOrderId, amount: amountUrl, message: 'Giao dịch đang chờ ZaloPay xử lý, vui lòng kiểm tra lại sau ít phút.' });
          } else {
            throw new Error("Thanh toán thất bại");
          }
        } catch (error) {
          console.error(error);
          setPaymentData({ status: 'error', method: 'ZALOPAY', orderId: parsedOrderId, amount: amountUrl, message: 'Giao dịch ZaloPay thất bại hoặc đã bị hủy.' });
        }
      } else if (isVnPay) {
        const responseCode = searchParams.get('vnp_ResponseCode');
        setPaymentData({
          status: responseCode === '00' ? 'success' : 'error',
          method: 'VNPAY',
          orderId: searchParams.get('vnp_TxnRef'),
          amount: searchParams.get('vnp_Amount') ? Number(searchParams.get('vnp_Amount')) / 100 : 0,
          message: responseCode === '24' ? 'Bạn đã hủy giao dịch.' : 'Giao dịch VNPAY thất bại.'
        });
      } else if (isMoMo) {
        const resultCode = searchParams.get('resultCode');
        setPaymentData({
          status: resultCode === '0' ? 'success' : 'error',
          method: 'MOMO',
          orderId: searchParams.get('orderId'),
          amount: Number(searchParams.get('amount') || 0),
          message: searchParams.get('message') || 'Giao dịch MoMo thất bại.'
        });
      } else {
        setPaymentData({ status: 'error', method: '', orderId: '', amount: 0, message: 'Không tìm thấy thông tin giao dịch hợp lệ.' });
      }
    };

    verifyPayment();
  }, [searchParams]);

  const formatCurrency = (value) => {
    if (!value) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const { status, method, orderId, amount, message } = paymentData;

  if (status === 'loading') {
    return (
      <div className="loader-container">
        <div className="spinner"></div>
        <h2 className="loader-text">{message}</h2>
      </div>
    );
  }

  return (
    <div className="payment-wrapper">
      <div className="payment-card">
        
        <div className={`status-icon-wrapper icon-${status}`}>
          {status === 'success' && (
            <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
          )}
          {status === 'pending' && (
            <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          )}
          {status === 'error' && (
            <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
          )}
        </div>

        <h2 className={`payment-title ${status}`}>
          {status === 'success' ? 'Thanh toán thành công!' : status === 'pending' ? 'Đang xử lý giao dịch!' : 'Thanh toán thất bại!'}
        </h2>
        
        <p className="payment-message">
          {status === 'success' ? 'Cảm ơn bạn đã mua sắm. Đơn hàng của bạn đang được chuẩn bị.' : message}
        </p>

        {orderId && (
          <div className="receipt-box">
            {method && (
              <div className="receipt-row">
                <span className="receipt-label">Cổng thanh toán</span>
                <span className="receipt-value tag-method">{method}</span>
              </div>
            )}
            <div className="receipt-row">
              <span className="receipt-label">Mã đơn hàng</span>
              <span className="receipt-value">{orderId}</span>
            </div>
            <div className="receipt-row">
              <span className="receipt-label">Tổng thanh toán</span>
              <span className="receipt-value amount-highlight">{formatCurrency(amount)}</span>
            </div>
          </div>
        )}

        <div className="btn-group">
          <Link to="/orders" className="btn btn-primary">
            Xem đơn hàng của tôi
          </Link>
          <Link to="/" className="btn btn-secondary">
            Tiếp tục mua sắm
          </Link>
        </div>

      </div>
    </div>
  );
};

export default PaymentSuccess;