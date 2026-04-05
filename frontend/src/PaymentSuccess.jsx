import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();

  // TÍNH TOÁN TRỰC TIẾP LÚC RENDER (Không dùng useState/useEffect)
  let paymentData = {
    status: 'error',
    method: '',
    orderId: '',
    amount: 0,
    message: 'Không tìm thấy thông tin giao dịch.'
  };

 const isVnPay = searchParams.has('vnp_ResponseCode');
  const isMoMo = searchParams.has('resultCode');
  const isZaloPay = searchParams.has('apptransid') || searchParams.has('appid'); // Thêm cờ nhận diện ZaloPay

  if (isVnPay) {
    // --- XỬ LÝ VNPAY ---
    const responseCode = searchParams.get('vnp_ResponseCode');
    const amountStr = searchParams.get('vnp_Amount');
    
    paymentData = {
      status: responseCode === '00' ? 'success' : 'error',
      method: 'VNPAY',
      orderId: searchParams.get('vnp_TxnRef'),
      amount: amountStr ? Number(amountStr) / 100 : 0,
      message: responseCode === '24' ? 'Bạn đã hủy giao dịch.' : 'Giao dịch VNPAY thất bại.'
    };

  } else if (isMoMo) {
    // --- XỬ LÝ MOMO ---
    const resultCode = searchParams.get('resultCode');
    
    paymentData = {
      status: resultCode === '0' ? 'success' : 'error',
      method: 'MOMO',
      orderId: searchParams.get('orderId'),
      amount: Number(searchParams.get('amount') || 0),
      message: searchParams.get('message') || 'Giao dịch MoMo thất bại.'
    };

  } else if (isZaloPay) {
    // --- XỬ LÝ ZALOPAY ---
    const statusCode = searchParams.get('status');
    const appTransId = searchParams.get('apptransid');
    
    // Tách mã đơn hàng từ apptransid (VD: "260405_180002_575699" -> lấy "180002")
    let parsedOrderId = appTransId;
    if (appTransId && appTransId.includes('_')) {
      parsedOrderId = appTransId.split('_')[1];
    }

    paymentData = {
      status: statusCode === '1' ? 'success' : 'error',
      method: 'ZALOPAY',
      orderId: parsedOrderId,
      amount: Number(searchParams.get('amount') || 0),
      message: statusCode === '1' ? 'Giao dịch ZaloPay thành công.' : 'Giao dịch ZaloPay thất bại.'
    };
  }

  // Format tiền tệ VNĐ
  const formatCurrency = (value) => {
    if (!value) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  // Rút gọn biến để dùng ở dưới UI
  const { status, method, orderId, amount, message } = paymentData;

  // LƯU Ý: Đã bỏ luôn trạng thái 'loading' vì URL tính toán ngay lập tức (0ms)
  // Không cần phải bắt người dùng chờ cái vòng xoay loading vô nghĩa nữa.

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
        ) : (
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
        )}

        {/* TIÊU ĐỀ */}
        <h2 className={`text-2xl font-bold mb-2 ${status === 'success' ? 'text-gray-800' : 'text-red-600'}`}>
          {status === 'success' ? 'Thanh toán thành công!' : 'Thanh toán thất bại!'}
        </h2>
        
        <p className="text-gray-500 mb-6">
          {status === 'success' 
            ? 'Cảm ơn bạn đã mua sắm. Đơn hàng của bạn đang được xử lý.' 
            : message}
        </p>

        {/* CHI TIẾT GIAO DỊCH */}
        {orderId && (
          <div className="bg-gray-50 rounded-lg p-4 text-left mb-6 space-y-3 border border-gray-100">
            <div className="flex justify-between">
              <span className="text-gray-500 text-sm">Cổng thanh toán:</span>
              <span className="font-semibold text-gray-800 text-sm inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-800">
                {method}
              </span>
            </div>
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