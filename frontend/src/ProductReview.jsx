import {useState, useEffect} from 'react';
import {
  Rate, Button, Input, Form, message,
  Avatar, Empty, Spin, Progress, Divider, Tag
} from 'antd';
import {UserOutlined, StarFilled, EditOutlined, CheckCircleOutlined} from '@ant-design/icons';
import axios from 'axios';
import styles from './ProductReview.module.css';

const API_BASE = 'https://ceramic-shop-u8ak.onrender.com/api/v1';

const RATING_LABELS = {1: 'Rất tệ', 2:'Tệ', 3:'Bình thường', 4:'Tốt', 5:'Xuất sắc'};

export default function ProductReview({productId}){
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

  const stats=(()=>{
    if(!reviews.length) return {avg: 0, total: 0, dist: {}};
    const dist={5:0,4:0,3:0,2:0,1:0};
    reviews.forEach((r)=>{
      if (dist[r.DiemDanhGia] !== undefined) dist[r.DiemDanhGia]++;
    });
    const avg = reviews.reduce((s,r)=>s+r.DiemDanhGia,0)/reviews.length;
    return {avg: Math.round(avg*10)/10, total: reviews.length,dist};
  })();

  useEffect(()=>{
    if(productId){
      fetchReview();
      if(isLoggedIn) CheckCanreView();
    }
  }, [productId]);

  const fetchReview = async()=>{
    setLoading(true);
    try{
      const res = await axios.get(`${API_BASE}/reviews/${productId}/reviews`);
      setReviews(res.data?.result || []);
    }
    catch{
      setReviews([]);
    }
    finally{
      setLoading(false);
    }
  }
  const CheckCanreView = async()=>{
    try{
      const res = await axios.get(`${API_BASE}/orders/me?status=3&limit=50`,authHeader);
      const completedOrders = res.data?.result?.data || [];
      let eligible = null;

      for(const order of completedOrders){
        const details = order.ChiTietDonHangs || [];
        const matchItem = details.find((d) => {
          const itemProductId = d.BienTheSanPham?.MaSanPham || d.BienTheSanPham?.SanPham?.MaSanPham;
          return Number(itemProductId) == Number(productId);
        });
        if(matchItem){
          const alreadyReviewed = reviews.some(
            (r) => r.MaCTDH == matchItem.MaCTDH
          );
          if(!alreadyReviewed){
            eligible = matchItem;
            break;
          }
        }
      }
      if(eligible){
        setCanReview(true);
        setEligibleOrderDetail(eligible);
        setNoReviewReason('');
      }
      else{
        setCanReview(false);
        const hasPending = await checkHasPendingOrder();
        if(!hasPending){
          setNoReviewReason('not_purchased');
        }
        else{
          setNoReviewReason('not_delivered');
        }
      }
    }
    catch{
      setCanReview(false);
      setNoReviewReason('error');
    }
  };
  const checkHasPendingOrder = async()=>{
    try{
      const res = await axios.get(`${API_BASE}/orders/me?limit=50`,authHeader);
      const allOders = res.data?.result?.data || [];
      return allOders.some((order)=>{
        const details = order.ChiTietDonHangs || [];
        return details.some((d)=>{
          const itemProductId = d.BienTheSanPham?.MaSanPham || d.BienTheSanPham?.SanPham?.MaSanPham;
          return Number(itemProductId) == Number(productId);
        });
      });
    }
    catch{
      return false;
    }
  };
  const handleSubmit = async(values)=>{
    if(!userRating){
      message.warning('Vui lòng chọn số sao đánh giá');
      return;
    }
    if(eligibleOrderDetail){
      message.error('Không tìm thấy đơn hàng hợp lệ để đánh giá');
      return;
    }
    setSubmitting(true);
    try{
      await axios.post(
        `${API_BASE}/reviews/${productId}/reviews`,
        {
          DiemDanhGia: userRating,
          NoiDung:values.content,
          MaCTDH: eligibleOrderDetail.MaCTDH,
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
    catch(err){
      message.error(err.response?.data?.message || 'Không thể gửi đánh giá');
    }
    finally{
      setSubmitting(false);
    }
  };

  const renderReviewGate = () =>{
    if(!isLoggedIn){
      return(
        <div className={styles.noReviewNote}>
          <a href="/login" className={styles.loginLink}>Đăng nhập</a> để đánh giá sản phẩm.
        </div>
      );
    }
    if(canReview == null) return null;
    if(canReview == true ) return null;

    const messages = {
      not_purchased: 'Bạn cần mua sản phẩm này để có thể đánh giá',
      not_delivered: (
        <span>
          Đơn hàng của bạn chưa ở trạng thái <Tag color="green" style={{margin: '0 4px'}}>Đã nhận hàng</Tag> - chỉ có thể đánh giá sau khi nhận hàng thành công.
        </span>
      ),
      reviewed: (
        <span>
          <CheckCircleOutlined style={{color: '#52c41a', marginRight: 6}}/>
          Bạn đã đánh giấ sản phẩm này. Cảm ơn bạn!
        </span>
      ),
      error:'Không thể kiểm tra quyền đánh giá. Vui lòng thử lại sau.',
    };
    return (
      <div className={`${styles.noReviewNote} ${noReviewReason == 'reviewed' ? styles.reviewedNote: ''}`}>
        {messages[noReviewReason]|| messages.error}
      </div>
    );
  };
  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h2 className={styles.title}>Đánh giá sản phẩm</h2>
      </div>
      {loading ? (
        <div className={styles.loadingWrap}><Spin/></div>
      ):(
        <>
        <div className={styles.statsRow}>
          <div className={styles.avgBox}>
            <div className={styles.avgScore}>{stats.avg || '-'}</div>
            <Rate disabled value={stats.avg} allowHalf className={styles.avgStars} />
            <div className={styles.avgTotal}>{stats.total} đánh giá</div>
          </div>
          <div className={styles.distBox}>
            {[5,4,3,2,1].map((star)=>(
              <div key={star} className={styles.distRow}>
                <span className={styles.distLabel}>
                  {star} <StarFilled style={{color: '#fadb14', fontSize: 12}}/>
                </span>
                <Progress
                  percent={stats.total? Math.round((stats.dist[star]/stats.total)*100):0}
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
        <Divider/>
        {isLoggedIn && canReview==true &&(
          <div className={styles.reviewForm}>
            <div className={styles.formTitle}>
              <EditOutlined/> Viết đánh giá của bạn
            </div>
            <div className={styles.ratingRow}>
              <span className={styles.ratingLabel}>Đánh giá:</span>
              <div className={styles.starPicker}>
                {[1,2,3,4,5].map((star)=>(
                  <button
                    key={star}
                    type="button"
                    className={`${styles.starBtn} ${(hoverRating || userRating) >= star ? styles.starActive: ''}`}
                  >★</button>
                ))}
                {(hoverRating || userRating) >0 && (
                  <span className={styles.ratingText}>
                    {RATING_LABELS[hoverRating || userRating]}
                  </span>
                )}
              </div>
            </div>
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
              <Form.Item
                name="content"
                rules={[{required: true, message:'Vui lòng nhập nội dung đánh giá!'}]}
              >
                <Input.TextArea
                  placeholder="Chia sẻ trải nghiện của bạn về sản phẩm này..."
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
          {reviews.length==0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Chưa có đánh giá nào. Hãy là người đầu tiền!"
            />
          ):(
            reviews.map((r)=>(
              <div key={r.MaDanhGia} className={styles.reviewItem}>
                <div className={styles.reviewHeader}>
                  <Avatar className={styles.avatar} src={r.KhachHang?.Avatar}>
                    {r.KhachHang?.TenKhachHang?.[0] || <UserOutlined/>}
                  </Avatar>
                  <div className={styles.reviewMeta}>
                    <div className={styles.reviewAuthor}>
                      {r.KhachHang?.TenKhachHang || 'Khách hàng'}
                    </div>
                    <div className={styles.reviewDate}>
                      {new Date(r.NgayGui).toLocaleDateString("vi-VN")}
                    </div>
                  </div>
                  <Rate disabled value={r.DiemDanhGia} className={styles.reviewStars}/>
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