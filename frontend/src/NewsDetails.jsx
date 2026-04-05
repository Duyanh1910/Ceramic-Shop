import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout, Spin, Breadcrumb, Typography, Row, Col, Button, Result, Tag, Tooltip } from 'antd';
import { 
  HomeOutlined, 
  CalendarOutlined, 
  EditOutlined, 
  ArrowLeftOutlined,
  FacebookOutlined,
  TwitterOutlined,
  LinkOutlined
} from '@ant-design/icons';
import { Helmet } from 'react-helmet-async';
import styles from './NewsDetails.module.css';

const { Header, Content } = Layout;
const { Title } = Typography;

function NewsDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [news, setNews] = useState(null);
  const [recentNews, setRecentNews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cuộn lên đầu trang mượt mà mỗi khi ID thay đổi
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  useEffect(() => {
    const fetchNewsData = async () => {
      setLoading(true);
      try {
        const detailRes = await axios.get(`https://ceramic-shop-u8ak.onrender.com/api/v1/news/${id}`);
        const articleData = detailRes.data?.result || detailRes.data?.data || detailRes.data;
        setNews(articleData);

        const listRes = await axios.get(`https://ceramic-shop-u8ak.onrender.com/api/v1/news`);
        const allNews = listRes.data?.result || listRes.data?.data || [];
        
        const filteredNews = allNews.filter(item => item.MaTinTuc !== parseInt(id)).slice(0, 5);
        setRecentNews(filteredNews);
      } catch (error) {
        console.error(error);
        setNews(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchNewsData();
  }, [id]);

  if (loading) {
    return (
      <div className={styles.loadingScreen}>
        <Spin size="large" tip="Đang tải ấn phẩm..." />
      </div>
    );
  }

  if (!news) {
    return (
      <div className={styles.errorScreen}>
        <Result
          status="404"
          title="Không tìm thấy bài viết"
          subTitle="Bài viết này không tồn tại hoặc đã bị gỡ bỏ."
          extra={<Button type="primary" size="large" onClick={() => navigate('/landing')}>Về Trang chủ</Button>}
        />
      </div>
    );
  }

  return (
    <Layout className={styles.wrapper}>
      <Helmet>
        <title>{news.TieuDe} - CeramicShop</title>
        <meta name="description" content={news.TieuDe} />
      </Helmet>

      {/* HEADER TỐI GIẢN CỦA TRANG ĐỌC BÁO */}
      <Header className={styles.simpleHeader}>
        <div className={styles.headerContainer}>
          <div className={styles.logoBox} onClick={() => navigate('/landing')}>
            <h1 className={styles.logoText}>CERAMIC-SHOP</h1>
          </div>
          <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} className={styles.btnBack}>
            Quay lại
          </Button>
        </div>
      </Header>

      <Content className={styles.mainContent}>
        <div className={styles.container}>
          
          <Breadcrumb className={styles.breadcrumb}>
            <Breadcrumb.Item href="" onClick={(e) => { e.preventDefault(); navigate('/landing'); }}>
              <HomeOutlined /> Trang chủ
            </Breadcrumb.Item>
            <Breadcrumb.Item href="" onClick={(e) => { e.preventDefault(); navigate('/landing#news'); }}>
              Tin tức
            </Breadcrumb.Item>
            <Breadcrumb.Item className={styles.currentCrumb}>
               {news.TieuDe.length > 35 ? news.TieuDe.substring(0, 35) + '...' : news.TieuDe}
            </Breadcrumb.Item>
          </Breadcrumb>

          <Row gutter={[40, 40]} className={styles.contentRow}>
            {/* CỘT TRÁI: BÀI VIẾT CHÍNH */}
            <Col xs={24} lg={16} className={styles.articleCol}>
              <div className={styles.articleBox}>
                
                {/* Tiêu đề & Thông tin tác giả */}
                <header className={styles.articleHeader}>
                  <Tag color="gold" className={styles.categoryTag}>Góc Nhìn Nghệ Thuật</Tag>
                  <Title level={1} className={styles.articleTitle}>{news.TieuDe}</Title>
                  
                  <div className={styles.articleMeta}>
                    <div className={styles.authorInfo}>
                      <div className={styles.authorAvatar}>
                        {news.NhanVien?.TenNhanVien ? news.NhanVien.TenNhanVien.charAt(0) : 'C'}
                      </div>
                      <div>
                        <div className={styles.authorName}>{news.NhanVien?.TenNhanVien || 'Ban Biên Tập CeramicShop'}</div>
                        <div className={styles.publishDate}>
                          <CalendarOutlined style={{marginRight: 5}}/> 
                          {new Date(news.NgayTao).toLocaleDateString('vi-VN', {
                            weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </header>

                {/* Ảnh bìa (Cover) */}
                {news.HinhAnh && (
                  <div className={styles.coverImageWrap}>
                    <img src={news.HinhAnh} alt={news.TieuDe} className={styles.coverImage} />
                  </div>
                )}

                {/* Nội dung bài viết */}
                <div 
                  className={styles.htmlContent} 
                  dangerouslySetInnerHTML={{ __html: news.NoiDung }} 
                />
                
                {/* Footer Bài viết (Share & Tags) */}
                <footer className={styles.articleFooter}>
                  <div className={styles.tagsWrap}>
                    <strong>Tags:</strong>
                    <Tag>Gốm Sứ</Tag>
                    <Tag>Bát Tràng</Tag>
                    <Tag>Phong Cách Sống</Tag>
                  </div>
                  <div className={styles.shareWrap}>
                    <span style={{marginRight: 10, color: '#666'}}>Chia sẻ:</span>
                    <Tooltip title="Chia sẻ Facebook">
                      <Button shape="circle" icon={<FacebookOutlined />} className={styles.shareBtn} />
                    </Tooltip>
                    <Tooltip title="Chia sẻ Twitter">
                      <Button shape="circle" icon={<TwitterOutlined />} className={styles.shareBtn} />
                    </Tooltip>
                    <Tooltip title="Sao chép liên kết">
                      <Button shape="circle" icon={<LinkOutlined />} className={styles.shareBtn} />
                    </Tooltip>
                  </div>
                </footer>

              </div>
            </Col>

            {/* CỘT PHẢI: TIN TỨC GẦN ĐÂY */}
            <Col xs={24} lg={8}>
              <div className={styles.sidebarWrapper}>
                <div className={styles.sidebar}>
                  <div className={styles.sidebarHeader}>
                    <h3 className={styles.sidebarTitle}>CÙNG CHỦ ĐỀ</h3>
                  </div>
                  
                  <div className={styles.recentList}>
                    {recentNews.map(item => (
                      <div 
                        key={item.MaTinTuc} 
                        className={styles.recentItem} 
                        onClick={() => navigate(`/news/${item.MaTinTuc}`)}
                      >
                        <div className={styles.recentImg}>
                          <img src={item.HinhAnh || 'https://via.placeholder.com/150'} alt={item.TieuDe} />
                        </div>
                        <div className={styles.recentInfo}>
                          <h4 className={styles.recentTitle}>{item.TieuDe}</h4>
                          <span className={styles.recentDate}>
                            {new Date(item.NgayTao).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className={styles.promoBanner}>
                    <img src="https://res.cloudinary.com/dcmwz0uis/image/upload/v1773744001/bo-do-an-30-san-pham-hoang-cung-lac-hong-30208-00_z2uoxf.png" alt="Promo" />
                    <div className={styles.promoText}>
                      <h4>Bộ Sưu Tập Mới</h4>
                      <p>Khám phá tuyệt tác gốm sứ tháng này.</p>
                      <Button type="primary" onClick={() => navigate('/landing#categories')}>Xem ngay</Button>
                    </div>
                  </div>

                </div>
              </div>
            </Col>
          </Row>

        </div>
      </Content>
    </Layout>
  );
}

export default NewsDetail;