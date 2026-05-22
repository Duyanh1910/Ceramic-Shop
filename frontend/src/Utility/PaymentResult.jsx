import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from 'antd';
import { Helmet } from 'react-helmet-async';
import styles from './PaymentResult.module.css';

const fmt = (v) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v ?? 0);

function parsePaymentParams(searchParams) {
  const isMoMo    = searchParams.has('resultCode');
  const isZaloPay = searchParams.has('status') && searchParams.has('apptransid');

  if (isMoMo) {
    const resultCode = searchParams.get('resultCode');
    const success = resultCode === '0';
    return {
      success,
      method: 'MoMo',
      methodLogo: 'https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png',
      orderId: searchParams.get('orderId'),
      amount: Number(searchParams.get('amount') || 0),
      errorMessage: success ? '' : (searchParams.get('message') || 'Giao dịch MoMo thất bại.'),
    };
  }

  if (isZaloPay) {
    const status = searchParams.get('status');
    const success = status === '1';
    return {
      success,
      method: 'ZaloPay',
      methodLogo: 'https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-ZaloPay-Square.png',
      orderId: searchParams.get('apptransid'),
      amount: Number(searchParams.get('amount') || 0),
      errorMessage: success ? '' : 'Giao dịch ZaloPay thất bại hoặc bị huỷ.',
    };
  }

  return {
    success: false,
    method: '',
    methodLogo: '',
    orderId: '',
    amount: 0,
    errorMessage: 'Không tìm thấy thông tin giao dịch.',
  };
}

export default function PaymentResult() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { success, method, methodLogo, orderId, amount, errorMessage } = parsePaymentParams(searchParams);

  const token = localStorage.getItem('customer_token')
           || localStorage.getItem('admin_token');

  return (
    <div className={styles.pageWrapper}>
      <Helmet>
        <title>{success ? 'Thanh toán thành công' : 'Thanh toán thất bại'} | Ceramic Shop</title>
      </Helmet>

      <header className={styles.topHeader}>
        <div className={styles.logo} onClick={() => navigate('/')}>CERAMIC-SHOP</div>
      </header>

      <div className={styles.centerWrapper}>
        <div className={styles.card}>

          <div className={`${styles.iconCircle} ${success ? styles.successCircle : styles.failCircle}`}>
            {success ? (
              <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            )}
          </div>

          <h2 className={`${styles.title} ${success ? styles.successTitle : styles.failTitle}`}>
            {success ? 'Thanh toán thành công!' : 'Thanh toán thất bại!'}
          </h2>

          <p className={styles.subtitle}>
            {success
              ? 'Cảm ơn bạn đã tin tưởng Ceramic Shop. Đơn hàng của bạn đang được xử lý.'
              : errorMessage}
          </p>

          {(orderId || amount > 0) && (
            <div className={styles.detailBox}>
              {method && (
                <div className={styles.detailRow}>
                  <span>Cổng thanh toán</span>
                  <div className={styles.methodBadge}>
                    {methodLogo && <img src={methodLogo} alt={method} className={styles.methodLogo} />}
                    <strong>{method}</strong>
                  </div>
                </div>
              )}
              {orderId && (
                <div className={styles.detailRow}>
                  <span>Mã giao dịch</span>
                  <strong className={styles.orderId}>{orderId}</strong>
                </div>
              )}
              {amount > 0 && (
                <div className={`${styles.detailRow} ${styles.amountRow}`}>
                  <span>Số tiền</span>
                  <strong className={success ? styles.amountSuccess : styles.amountFail}>
                    {fmt(amount)}
                  </strong>
                </div>
              )}
            </div>
          )}

          {!success && (
            <div className={styles.failGuide}>
              <p>Giao dịch không thành công. Bạn có thể:</p>
              <ul>
                <li>Kiểm tra số dư ví và thử lại</li>
                <li>Chọn phương thức thanh toán khác</li>
                <li>Liên hệ hotline <strong>0329 835 725</strong> để được hỗ trợ</li>
              </ul>
            </div>
          )}

          <div className={styles.actions}>
            {token && (
              <Button
                type="primary"
                block
                size="large"
                className={styles.btnOrders}
                onClick={() => navigate('/orders')}
              >
                Xem đơn hàng của tôi
              </Button>
            )}

            {!success && (
              <Button
                block
                size="large"
                className={styles.btnRetry}
                onClick={() => navigate('/cart')}
              >
                Quay lại giỏ hàng
              </Button>
            )}

            <Button
              block
              size="large"
              className={styles.btnHome}
              onClick={() => navigate('/')}
            >
              Về trang chủ
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}
