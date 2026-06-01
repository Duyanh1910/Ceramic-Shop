import {useEffect, useMemo, useState} from 'react';
import {useNavigate, useSearchParams} from 'react-router-dom';
import {Helmet} from 'react-helmet-async';
import axios from 'axios';
import styles from './PaymentResult.module.css';
import { API_BASE } from "../config/api";


const PAYMENT_STATUS = {
    LOADING: 'loading',
    SUCCESS: 'success',
    PENDING: 'pending',
    FAILED: 'failed',
};

const PAYMENT_METHOD = {
    MOMO: 'MoMo',
    ZALOPAY: 'ZaloPay',
    VNPAY: 'VNPay',
    UNKNOWN: 'Không xác định',
};

const methodLogos = {
    [PAYMENT_METHOD.MOMO]: 'https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png',
    [PAYMENT_METHOD.ZALOPAY]: 'https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-ZaloPay-Square.png',
    [PAYMENT_METHOD.VNPAY]:
        'https://vinadesign.vn/uploads/images/2023/05/vnpay-logo-vinadesign-25-12-59-16.jpg',
};

const initialPayment = {
    status: PAYMENT_STATUS.LOADING,
    method: PAYMENT_METHOD.UNKNOWN,
    orderId: '',
    transactionId: '',
    amount: 0,
    message: 'Đang đồng bộ dữ liệu giao dịch...',
};

const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(Number(value || 0));
};

const getCustomerToken = () => {
    return (
        localStorage.getItem('customer_token') ||
        localStorage.getItem('admin_token') ||
        ''
    );
};

const getOrderIdFromAppTransId = (appTransId) => {
    if (!appTransId) return '';
    const parts = appTransId.split('_');

    if (parts.length >= 3) {
        return parts[1];
    }

    return appTransId;
};

function detectPaymentGateway(searchParams) {
    if (searchParams.has('resultCode')) return PAYMENT_METHOD.MOMO;
    if (searchParams.has('vnp_ResponseCode')) return PAYMENT_METHOD.VNPAY;
    if (searchParams.has('apptransid')) return PAYMENT_METHOD.ZALOPAY;

    return PAYMENT_METHOD.UNKNOWN;
}

async function parsePaymentResult(searchParams) {
    const gateway = detectPaymentGateway(searchParams);

    if (gateway === PAYMENT_METHOD.MOMO) {
        const resultCode = searchParams.get('resultCode');
        const isSuccess = resultCode === '0';

        return {
            status: isSuccess ? PAYMENT_STATUS.SUCCESS : PAYMENT_STATUS.FAILED,
            method: PAYMENT_METHOD.MOMO,
            orderId: searchParams.get('orderId') || '',
            transactionId:
                searchParams.get('transId') || searchParams.get('requestId') || '',
            amount: Number(searchParams.get('amount') || 0),
            message: isSuccess
                ? 'Giao dịch MoMo đã hoàn tất. Đơn hàng của bạn đang được xử lý.'
                : searchParams.get('message') || 'Giao dịch MoMo thất bại hoặc đã bị hủy.',
        };
    }

    if (gateway === PAYMENT_METHOD.VNPAY) {
        const responseCode = searchParams.get('vnp_ResponseCode');
        const isSuccess = responseCode === '00';

        return {
            status: isSuccess ? PAYMENT_STATUS.SUCCESS : PAYMENT_STATUS.FAILED,
            method: PAYMENT_METHOD.VNPAY,
            orderId: searchParams.get('vnp_TxnRef') || '',
            transactionId: searchParams.get('vnp_TransactionNo') || '',
            amount: Number(searchParams.get('vnp_Amount') || 0) / 100,
            message: isSuccess
                ? 'Giao dịch VNPay đã hoàn tất. Đơn hàng của bạn đang được xử lý.'
                : responseCode === '24'
                    ? 'Bạn đã hủy giao dịch VNPay.'
                    : 'Giao dịch VNPay thất bại hoặc không được xác nhận.',
        };
    }

    if (gateway === PAYMENT_METHOD.ZALOPAY) {
        const appTransId = searchParams.get('apptransid');
        const fallbackAmount = Number(searchParams.get('amount') || 0);
        const orderId = getOrderIdFromAppTransId(appTransId);

        try {
            const response = await axios.get(
                `${API_BASE}/payment/check-status/${appTransId}`
            );

            const result = response.data;

            if (result?.success === true) {
                return {
                    status: PAYMENT_STATUS.SUCCESS,
                    method: PAYMENT_METHOD.ZALOPAY,
                    orderId,
                    transactionId: appTransId || '',
                    amount: Number(result?.data?.amount || fallbackAmount || 0),
                    message:
                        'Giao dịch ZaloPay đã hoàn tất. Đơn hàng của bạn đang được xử lý.',
                };
            }

            if (result?.isPending === true) {
                return {
                    status: PAYMENT_STATUS.PENDING,
                    method: PAYMENT_METHOD.ZALOPAY,
                    orderId,
                    transactionId: appTransId || '',
                    amount: Number(result?.data?.amount || fallbackAmount || 0),
                    message:
                        'Giao dịch đang chờ ZaloPay xác nhận. Vui lòng kiểm tra lại đơn hàng sau ít phút.',
                };
            }

            return {
                status: PAYMENT_STATUS.FAILED,
                method: PAYMENT_METHOD.ZALOPAY,
                orderId,
                transactionId: appTransId || '',
                amount: fallbackAmount,
                message: 'Giao dịch ZaloPay thất bại hoặc đã bị hủy.',
            };
        } catch {
            return {
                status: PAYMENT_STATUS.FAILED,
                method: PAYMENT_METHOD.ZALOPAY,
                orderId,
                transactionId: appTransId || '',
                amount: fallbackAmount,
                message:
                    'Không thể xác minh giao dịch ZaloPay. Vui lòng kiểm tra lại đơn hàng.',
            };
        }
    }

    return {
        status: PAYMENT_STATUS.FAILED,
        method: PAYMENT_METHOD.UNKNOWN,
        orderId: '',
        transactionId: '',
        amount: 0,
        message: 'Không tìm thấy thông tin giao dịch.',
    };
}

function ResultIcon({status}) {
    if (status === PAYMENT_STATUS.SUCCESS) {
        return (
            <svg viewBox="0 0 24 24" className={styles.iconSvg}>
                <path d="M20 6 9 17l-5-5"/>
            </svg>
        );
    }

    if (status === PAYMENT_STATUS.PENDING) {
        return (
            <svg viewBox="0 0 24 24" className={styles.iconSvg}>
                <circle cx="12" cy="12" r="9"/>
                <path d="M12 7v5l3.5 2"/>
            </svg>
        );
    }

    return (
        <svg viewBox="0 0 24 24" className={styles.iconSvg}>
            <path d="M18 6 6 18"/>
            <path d="M6 6l12 12"/>
        </svg>
    );
}

function getResultContent(status) {
    if (status === PAYMENT_STATUS.SUCCESS) {
        return {
            label: 'Thành công',
            title: 'Thanh toán thành công',
            description: 'Cảm ơn bạn đã mua sắm tại Ceramic Shop.',
            toneClass: styles.success,
        };
    }

    if (status === PAYMENT_STATUS.PENDING) {
        return {
            label: 'Đang xử lý',
            title: 'Giao dịch đang xử lý',
            description: 'Hệ thống đang chờ cổng thanh toán xác nhận giao dịch.',
            toneClass: styles.pending,
        };
    }

    if (status === PAYMENT_STATUS.LOADING) {
        return {
            label: 'Đang kiểm tra',
            title: 'Đang kiểm tra thanh toán',
            description: 'Vui lòng chờ trong giây lát.',
            toneClass: styles.loadingTone,
        };
    }

    return {
        label: 'Thất bại',
        title: 'Thanh toán thất bại',
        description: 'Giao dịch chưa được hoàn tất.',
        toneClass: styles.failed,
    };
}

export default function PaymentResult() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [payment, setPayment] = useState(initialPayment);
    const [countdown, setCountdown] = useState(5);

    const token = useMemo(() => getCustomerToken(), []);

    const content = getResultContent(payment.status);
    const methodLogo = methodLogos[payment.method];

    const isSuccess = payment.status === PAYMENT_STATUS.SUCCESS;
    const isFailed = payment.status === PAYMENT_STATUS.FAILED;
    const isPending = payment.status === PAYMENT_STATUS.PENDING;
    const isLoading = payment.status === PAYMENT_STATUS.LOADING;

    useEffect(() => {
        let mounted = true;

        async function verifyPayment() {
            setPayment(initialPayment);
            setCountdown(5);

            const result = await parsePaymentResult(searchParams);

            if (mounted) {
                setPayment(result);
            }
        }

        verifyPayment();

        return () => {
            mounted = false;
        };
    }, [searchParams]);

    useEffect(() => {
        if (!isSuccess) return;

        setCountdown(5);

        const interval = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    navigate('/orders');
                    return 0;
                }

                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isSuccess, navigate]);

    return (
        <main className={styles.page}>
            <Helmet>
                <title>
                    {isSuccess
                        ? 'Thanh toán thành công'
                        : isPending
                            ? 'Thanh toán đang xử lý'
                            : 'Thanh toán thất bại'}{' '}
                    | Ceramic Shop
                </title>
            </Helmet>

            <div className={styles.backgroundDecor}>
                <span className={styles.blobOne}/>
                <span className={styles.blobTwo}/>
                <span className={styles.blobThree}/>
            </div>

            <header className={styles.header}>
                <button className={styles.logoButton} onClick={() => navigate('/')}>
                    <span className={styles.logoMark}>C</span>
                    <span>Ceramic Shop</span>
                </button>
            </header>

            <section className={styles.shell}>
                <div className={`${styles.card} ${content.toneClass}`}>
                    <div className={styles.cardTop}>
                        <div className={styles.statusPill}>
                            <span className={styles.pillDot}/>
                            {content.label}
                        </div>

                        <div className={styles.iconWrap}>
                            {isLoading ? (
                                <span className={styles.spinner}/>
                            ) : (
                                <ResultIcon status={payment.status}/>
                            )}
                        </div>

                        <h1>{content.title}</h1>

                        <p>
                            {isLoading
                                ? payment.message
                                : payment.message || content.description}
                        </p>
                    </div>

                    {!isLoading && (
                        <>
                            <div className={styles.receipt}>
                                <div className={styles.receiptHeader}>
                                    <div>
                                        <span>Thông tin giao dịch</span>
                                        <strong>Payment Receipt</strong>
                                    </div>

                                    <span className={styles.receiptCode}>
                    {payment.orderId || 'N/A'}
                  </span>
                                </div>

                                <div className={styles.divider}>
                                    <span/>
                                    <span/>
                                </div>

                                <div className={styles.detailList}>
                                    <div className={styles.detailItem}>
                                        <span>Cổng thanh toán</span>
                                        <strong className={styles.method}>
                                            {methodLogo && <img src={methodLogo} alt={payment.method}/>}
                                            {payment.method}
                                        </strong>
                                    </div>

                                    {payment.orderId && (
                                        <div className={styles.detailItem}>
                                            <span>Mã đơn hàng</span>
                                            <strong>{payment.orderId}</strong>
                                        </div>
                                    )}

                                    {payment.transactionId && (
                                        <div className={styles.detailItem}>
                                            <span>Mã giao dịch</span>
                                            <strong>{payment.transactionId}</strong>
                                        </div>
                                    )}

                                    <div className={`${styles.detailItem} ${styles.amountItem}`}>
                                        <span>Số tiền</span>
                                        <strong>{formatCurrency(payment.amount)}</strong>
                                    </div>
                                </div>
                            </div>

                            {isFailed && (
                                <div className={styles.notice}>
                                    <strong>Gợi ý xử lý</strong>
                                    <p>
                                        Bạn có thể kiểm tra lại số dư, thử thanh toán lại trong đơn hàng
                                        hoặc chọn phương thức thanh toán khác.
                                    </p>
                                </div>
                            )}

                            {isPending && (
                                <div className={styles.notice}>
                                    <strong>Giao dịch chưa hoàn tất?</strong>
                                    <p>
                                        Một số cổng thanh toán cần thêm thời gian để xác nhận. Bạn có thể
                                        vào trang đơn hàng để kiểm tra trạng thái mới nhất.
                                    </p>
                                </div>
                            )}
                        </>
                    )}

                    <div className={styles.actions}>
                        {token && !isLoading && (
                            <button
                                type="button"
                                className={styles.primaryButton}
                                onClick={() => navigate('/orders')}
                            >
                                Xem đơn hàng của tôi
                            </button>
                        )}

                        {isFailed && (
                            <button
                                type="button"
                                className={styles.retryButton}
                                onClick={() => navigate('/orders')}
                            >
                                Thanh toán lại
                            </button>
                        )}

                        <button
                            type="button"
                            className={styles.secondaryButton}
                            onClick={() => navigate('/')}
                        >
                            Về trang chủ
                        </button>
                    </div>

                    {isSuccess && (
                        <p className={styles.redirectText}>
                            Tự động chuyển đến trang đơn hàng sau {countdown} giây...
                        </p>
                    )}
                </div>
            </section>
        </main>
    );
}
