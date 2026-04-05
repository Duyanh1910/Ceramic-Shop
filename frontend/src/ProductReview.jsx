import { useState, useEffect } from 'react';
import {
  Rate, Button, Input, Form, message,
  Avatar, Empty, Spin, Progress, Divider, Tag
} from 'antd';
import { UserOutlined, StarFilled, EditOutlined, CheckCircleOutlined } from '@ant-design/icons';
import axios from 'axios';
import styles from './ProductReview.module.css';

const API_BASE = 'https://ceramic-shop-u8ak.onrender.com/api/v1';

const RATING_LABELS = { 1: 'Rất tệ', 2: 'Tệ', 3: 'Bình thường', 4: 'Tốt', 5: 'Xuất sắc' };

export default function ProductReview({ productId }) {
  const token = localStorage.getItem('customer_token') || localStorage.getItem('admin_token') || localStorage.getItem('token');
  const isLoggedIn = !!token;
  
  const authHeader = { 
    headers: { Authorization: `Bearer ${token}` },
    withCredentials: true 
  };

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  const [canReview, setCanReview] = useState(null);
  const [eligibleOrderDetail, setEligibleOrderDetail] = useState(null);
  const [noReviewReason, setNoReviewReason] = useState('');

  const [form] = Form.useForm();

  const stats = (() => {
    if (!reviews.length) return { avg: 0, total: 0, dist: {} };
    const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      if (dist[r.DiemDanhGia] !== undefined) dist[r.DiemDanhGia]++;
    });
    const avg = reviews.reduce((s, r) => s + r.DiemDanhGia, 0) / reviews.length;
    return { avg: Math.round(avg * 10) / 10, total: reviews.length, dist };
  })();

  useEffect(() => {
    const init = async () => {
      if (productId) {
        const currentReviews = await fetchReview();
        if (isLoggedIn) {
          CheckCanreView(currentReviews);
        }
      }
    };
    init();
  }, [productId, isLoggedIn]);

  const fetchReview = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/reviews/${productId}/reviews`);
      const fetchedData = res.data?.result || [];
      setReviews(fetchedData);
      return fetchedData;
    }
    catch {
      setReviews([]);
      return [];
    }
    finally {
      setLoading(false);
    }
  }

  const CheckCanreView = async (currentReviews = []) => {
    try {
      const res = await axios.get(`${API_BASE}/orders?limit=50`, authHeader);
      const allOrders = res.data?.result?.data || res.data?.result?.orders || res.data?.result || [];
      
      let eligible = null;
      let hasReviewed = false;

      for (const order of allOrders) {
        if (order.TrangThaiDonHang !== 3) continue;

        const details = order.ChiTietDonHangs || [];
        const matchItem = details.find((d) => {
          const itemProductId = d.BienTheSanPham?.MaSanPham || d.BienTheSanPham?.SanPham?.MaSanPham;
          return Number(itemProductId) === Number(productId);
        });
        
        if (matchItem) {
          const alreadyReviewed = currentReviews.some(
            (r) => r.MaCTDH === matchItem.MaCTDH
          );
          if (!alreadyReviewed) {
            eligible = matchItem;
            break;
          } else {
            hasReviewed = true;
          }
        }
      }
      
      if (eligible) {
        setCanReview(true);
        setEligibleOrderDetail(eligible);
        setNoReviewReason('');
      }
      else {
        setCanReview(false);
        
        if (hasReviewed) {
          setNoReviewReason('reviewed');
        } else {
          const hasPending = await checkHasPendingOrder(allOrders);
          if (hasPending) {
            setNoReviewReason('not_delivered');
          } else {
            setNoReviewReason('not_purchased');
          }
        }
      }
    }
    catch {
      setCanReview(false);
      setNoReviewReason('error');
    }
  };

  const checkHasPendingOrder = async (allOrders) => {
    try {
      return allOrders.some((order) => {
        if (order.TrangThaiDonHang === 3 || order.TrangThaiDonHang === 4) return false;

        const details = order.ChiTietDonHangs || [];
        return details.some((d) => {
          const itemProductId = d.BienTheSanPham?.MaSanPham || d.BienTheSanPham?.SanPham?.MaSanPham;
          return Number(itemProductId) === Number(productId);
        });
      });
    }
    catch {
      return false;
    }
  };

  const handleSubmit = async (values) => {
    if (!userRating) {
      message.warning('Vui lòng chọn số sao đánh giá');
      return;
    }
    setSubmitting(true);
    try {
      await axios.post(
        `${API_BASE}/reviews`,
        {
          MaSanPham: Number(productId),
          DiemDanhGia: userRating,
          NoiDung: values.content,
        },
        authHeader
      );
      message.success('Đánh giá của bạn đã được gửi!');
      form.resetFields();
      setUserRating(0);
      setCanReview(false);
      setEligibleOrderDetail(null);
      setNoReviewReason('reviewed');
      fetchReview();
    }
    catch (err) {
      message.error(err.response?.data?.message || 'Không thể gửi đánh giá');
    }
    finally {
      setSubmitting(false);
    }
  };

  const renderReviewGate = () => {
    if (!isLoggedIn) {
      return (
        <div className={styles.noReviewNote}>
          <a href="/login" className={styles.loginLink}>Đăng nhập</a> để đánh giá sản phẩm.
        </div>
      );
    }
    if (canReview == null) return null;
    if (canReview === true) return null;

    const messages = {
      not_purchased: 'Bạn cần mua sản phẩm này để có thể đánh giá.',
      not_delivered: (
        <span>
          Đơn hàng của bạn chưa ở trạng thái <Tag color="green" style={{ margin: '0 4px' }}>Hoàn thành</Tag> - chỉ có thể đánh giá sau khi nhận hàng thành công.
        </span>
      ),
      reviewed: (
        <span>
          <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 6 }} />
          Bạn đã đánh giá sản phẩm này. Cảm ơn bạn!
        </span>
      ),
      error: 'Không thể kiểm tra quyền đánh giá. Vui lòng thử lại sau.',
    };
    return (
      <div className={`${styles.noReviewNote} ${noReviewReason === 'reviewed' ? styles.reviewedNote : ''}`}>
        {messages[noReviewReason] || messages.error}
      </div>
    );
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h2 className={styles.title}>Đánh giá sản phẩm</h2>
      </div>
      {loading ? (
        <div className={styles.loadingWrap}><Spin /></div>
      ) : (
        <>
          <div className={styles.statsRow}>
            <div className={styles.avgBox}>
              <div className={styles.avgScore}>{stats.avg || '-'}</div>
              <Rate disabled value={stats.avg} allowHalf className={styles.avgStars} />
              <div className={styles.avgTotal}>{stats.total} đánh giá</div>
            </div>
            <div className={styles.distBox}>
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className={styles.distRow}>
                  <span className={styles.distLabel}>
                    {star} <StarFilled style={{ color: '#fadb14', fontSize: 12 }} />
                  </span>
                  <Progress
                    percent={stats.total ? Math.round((stats.dist[star] / stats.total) * 100) : 0}
                    strokeColor="#fadb14"
                    trailColor="#f0f0f0"
                    showInfo={false}
                    size="small"
                    className={styles.distBar}
                  />
                  <span className={styles.distCount}>{stats.dist[star] || 0}</span>
                </div>
              ))}
            </div>
          </div>
          <Divider />
          
          {isLoggedIn && canReview === true && (
            <div className={styles.reviewForm}>
              <div className={styles.formTitle}>
                <EditOutlined /> Viết đánh giá của bạn
              </div>
              <div className={styles.ratingRow}>
                <span className={styles.ratingLabel}>Đánh giá:</span>
                <div className={styles.starPicker}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setUserRating(star)}
                      className={`${styles.starBtn} ${(hoverRating || userRating) >= star ? styles.starActive : ''}`}
                    >★</button>
                  ))}
                  {(hoverRating || userRating) > 0 && (
                    <span className={styles.ratingText}>
                      {RATING_LABELS[hoverRating || userRating]}
                    </span>
                  )}
                </div>
              </div>
              <Form form={form} layout="vertical" onFinish={handleSubmit}>
                <Form.Item
                  name="content"
                  rules={[{ required: true, message: 'Vui lòng nhập nội dung đánh giá!' }]}
                >
                  <Input.TextArea
                    placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                    rows={3}
                    className={styles.textarea}
                    maxLength={255}
                    showCount
                  />
                </Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={submitting}
                  className={styles.btnSubmit}
                >
                  Gửi đánh giá
                </Button>
              </Form>
            </div>
          )}
          
          {renderReviewGate()}
          
          <div className={styles.reviewList}>
            {reviews.length === 0 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Chưa có đánh giá nào. Hãy là người đầu tiên!"
              />
            ) : (
              reviews.map((r) => (
                <div key={r.MaDanhGia} className={styles.reviewItem}>
                  <div className={styles.reviewHeader}>
                    <Avatar className={styles.avatar} src={r.KhachHang?.Avatar}>
                      {r.KhachHang?.TenKhachHang?.[0] || <UserOutlined />}
                    </Avatar>
                    <div className={styles.reviewMeta}>
                      <div className={styles.reviewAuthor}>
                        {r.KhachHang?.TenKhachHang || 'Khách hàng'}
                      </div>
                      <div className={styles.reviewDate}>
                        {new Date(r.NgayGui).toLocaleDateString("vi-VN")}
                      </div>
                    </div>
                    <Rate disabled value={r.DiemDanhGia} className={styles.reviewStars} />
                  </div>
                  {r.NoiDung && (
                    <div className={styles.reviewContent}>{r.NoiDung}</div>
                  )}
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  )
}