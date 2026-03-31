import React, { useState } from 'react';
import { Rate, Input, Button, Avatar, message } from 'antd';
import styles from './ReviewForm.module.css';
import axios from 'axios';
import { UserOutlined } from '@ant-design/icons';

const { TextArea } = Input;

const ReviewForm = ({ productId, onReviewSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const customerName = localStorage.getItem('customer_name') || 'Khách hàng';
  const customerAvatar = localStorage.getItem('customer_avatar');

  const handleSubmit = async () => {
    if (rating === 0) {
      message.error('Vui lòng chọn số sao đánh giá!');
      return;
    }
    if (!content.trim()) {
      message.error('Vui lòng nhập nội dung đánh giá!');
      return;
    }

    setLoading(true);
    try {
      await axios.post('https://ceramic-shop-u8ak.onrender.com/api/v1/reviews', {
        MaSanPham: productId,
        DiemDanhGia: rating,
        NoiDung: content,
       
      }, {
        withCredentials: true 
      });

      message.success('Cảm ơn bạn đã gửi đánh giá!');
      setRating(0);
      setContent('');
      
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    } catch (error) {
      console.error("Lỗi khi gửi đánh giá:", error);
      message.error(error.response?.data?.message || 'Gửi đánh giá thất bại. Vui lòng kiểm tra lại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.reviewFormContainer}>
      <h4 className={styles.formTitle}>Viết đánh giá của bạn</h4>
      
      <div className={styles.formHeader}>
        <Avatar 
          src={customerAvatar} 
          icon={!customerAvatar && <UserOutlined />} 
          size={45} 
          className={styles.userAvatar}
        />
        <div className={styles.ratingSection}>
          <span className={styles.userName}>{customerName}</span>
          <Rate 
            value={rating} 
            onChange={setRating} 
            className={styles.rateStars} 
            tooltips={['Tệ', 'Không hài lòng', 'Bình thường', 'Hài lòng', 'Tuyệt vời']}
          />
        </div>
      </div>

      <div className={styles.formBody}>
        <TextArea
          rows={4}
          placeholder="Chia sẻ cảm nhận của bạn về sản phẩm này (chất lượng, màu sắc, đóng gói...)"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className={styles.contentTextArea}
          maxLength={500}
          showCount
        />
        <div className={styles.formActions}>
          <Button
            type="primary"
            onClick={handleSubmit}
            loading={loading}
            className={styles.submitButton}
          >
            GỬI ĐÁNH GIÁ
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReviewForm;