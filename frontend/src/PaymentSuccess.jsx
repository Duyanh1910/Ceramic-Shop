import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios'; // Nhớ cài axios hoặc dùng fetch

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  
  // Phải có State vì việc hỏi Backend tốn thời gian (Network Request)
  const [paymentData, setPaymentData] = useState({
    status: 'loading', // Bắt đầu luôn là loading
    method: '',
    orderId: '',
    amount: 0,
    message: 'Đang đồng bộ kết quả giao dịch với máy chủ...'
  });

  useEffect(() => {
    const verifyPayment = async () => {
      const isVnPay = searchParams.has('vnp_ResponseCode');
      const isMoMo = searchParams.has('resultCode');
      // Nhận diện ZaloPay qua apptransid
      const isZaloPay = searchParams.has('apptransid'); 

      if (isZaloPay) {
        // --- XỬ LÝ ZALOPAY QUA BACKEND QUERY ---
        const appTransId = searchParams.get('apptransid');
        let parsedOrderId = appTransId?.includes('_') ? appTransId.split('_')[1] : appTransId;
        const amountUrl = Number(searchParams.get('amount') || 0);

        try {
          // GỌI API BACKEND ĐỂ CHỐNG FAKE URL VÀ ĐẢM BẢO DB ĐÃ UPDATE
          const res = await axios.get(`https://ceramic-shop-u8ak.onrender.com/api/v1/payment/check-status/${appTransId}`);
          
          if (res.data.success) {
            setPaymentData({
              status: 'success',
              method: 'ZALOPAY',
              orderId: parsedOrderId,
              amount: amountUrl, // Hoặc lấy res.data.data.amount nếu API trả về
              message: 'Giao dịch ZaloPay thành công.'
            });
          } else if (res.data.isPending) {
            setPaymentData({
              status: 'pending',
              method: 'ZALOPAY',
              orderId: parsedOrderId,
              amount: amountUrl,
              message: 'Giao dịch đang chờ ZaloPay xử lý, vui lòng kiểm tra lại sau ít phút.'
            });
          } else {
            throw new Error("Thanh toán thất bại");
          }
        } catch (error) {
          setPaymentData({
            status: 'error',
            method: 'ZALOPAY',
            orderId: parsedOrderId,
            amount: amountUrl,
            message: 'Giao dịch ZaloPay thất bại hoặc đã bị hủy.'
          });
        }

      } else if (isVnPay) {
        // --- XỬ LÝ VNPAY --- (Tạm thời dùng URL, tương lai nên làm API verify tương tự ZaloPay)
        const responseCode = searchParams.get('vnp_ResponseCode');
        setPaymentData({
          status: responseCode === '00' ? 'success' : 'error',
          method: 'VNPAY',
          orderId: searchParams.get('vnp_TxnRef'),
          amount: searchParams.get('vnp_Amount') ? Number(searchParams.get('vnp_Amount')) / 100 : 0,
          message: responseCode === '24' ? 'Bạn đã hủy giao dịch.' : 'Giao dịch VNPAY thất bại.'
        });

      } else if (isMoMo) {
        // --- XỬ LÝ MOMO ---
        const resultCode = searchParams.get('resultCode');
        setPaymentData({
          status: resultCode === '0' ? 'success' : 'error',
          method: 'MOMO',
          orderId: searchParams.get('orderId'),
          amount: Number(searchParams.get('amount') || 0),
          message: searchParams.get('message') || 'Giao dịch MoMo thất bại.'
        });
      } else {
        setPaymentData({
          status: 'error',
          method: '',
          orderId: '',
          amount: 0,
          message: 'Không tìm thấy thông tin giao dịch hợp lệ.'
        });
      }
    };

    verifyPayment();
  }, [searchParams]);

  const formatCurrency = (value) => {
    if (!value) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const { status, method, orderId, amount, message } = paymentData;

  // --- UI TRẠNG THÁI LOADING ---
  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
        <div className="w-16 h-16 border-4 border-[#A6246D] border-t-transparent rounded-full animate-spin mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-700">{message}</h2>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        
        {/* ICON TRẠNG THÁI */}
        {status === 'success' ? (
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
        ) : status === 'pending' ? (
           <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
             <svg className="w-10 h-10 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
             </svg>
           </div>
        ) : (
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
        )}

        {/* TIÊU ĐỀ */}
        <h2 className={`text-2xl font-bold mb-2 ${
          status === 'success' ? 'text-gray-800' : status === 'pending' ? 'text-yellow-600' : 'text-red-600'
        }`}>
          {status === 'success' ? 'Thanh toán thành công!' : status === 'pending' ? 'Đang xử lý giao dịch!' : 'Thanh toán thất bại!'}
        </h2>
        
        <p className="text-gray-500 mb-6">
          {status === 'success' 
            ? 'Cảm ơn bạn đã mua sắm. Đơn hàng của bạn đang được chuẩn bị.' 
            : message}
        </p>

        {/* CHI TIẾT GIAO DỊCH */}
        {orderId && (
          <div className="bg-gray-50 rounded-lg p-4 text-left mb-6 space-y-3 border border-gray-100">
            {method && (
              <div className="flex justify-between">
                <span className="text-gray-500 text-sm">Cổng thanh toán:</span>
                <span className="font-semibold text-gray-800 text-sm inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-800">
                  {method}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500 text-sm">Mã đơn hàng:</span>
              <span className="font-semibold text-gray-800 text-sm break-all">{orderId}</span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-3">
              <span className="text-gray-500 text-sm">Số tiền thanh toán:</span>
              <span className="font-bold text-lg text-[#A6246D]">{formatCurrency(amount)}</span>
            </div>
          </div>
        )}

        {/* NÚT ĐIỀU HƯỚNG */}
        <div className="space-y-3">
          <Link 
            to="/orders" 
            className="block w-full py-3 px-4 bg-[#A6246D] hover:bg-[#8A1A59] text-white font-medium rounded-lg transition-colors"
          >
            Xem đơn hàng của tôi
          </Link>
          <Link 
            to="/" 
            className="block w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
          >
            Về trang chủ
          </Link>
        </div>

      </div>
    </div>
  );
};

export default PaymentSuccess;