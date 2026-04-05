import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout, Spin, Breadcrumb, Divider, Typography, Row, Col, Button, Result } from 'antd';
import { HomeOutlined, CalendarOutlined, EditOutlined, ArrowLeftOutlined } from '@ant-design/icons';
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

  // Cuộn lên đầu trang mỗi khi chuyển sang bài viết khác
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  useEffect(() => {
    const fetchNewsData = async () => {
      setLoading(true);
      try {
        // Lấy chi tiết bài viết
        const detailRes = await axios.get(`https://ceramic-shop-u8ak.onrender.com/api/v1/news/${id}`);
        const articleData = detailRes.data?.result || detailRes.data?.data || detailRes.data;
        setNews(articleData);

        // Lấy danh sách tin tức (cho cột Sidebar)
        const listRes = await axios.get(`https://ceramic-shop-u8ak.onrender.com/api/v1/news`);
        const allNews = listRes.data?.result || listRes.data?.data || [];
        
        // Lọc bỏ bài hiện tại và lấy 5 bài mới nhất
        const filteredNews = allNews.filter(item => item.MaTinTuc !== parseInt(id)).slice(0, 5);
        setRecentNews(filteredNews);
      } catch (error) {
        console.error("Lỗi khi tải tin tức:", error);
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
        <Spin size="large" tip="Đang tải nội dung bài viết..." />
      </div>
    );
  }

  if (!news) {
    return (
      <div className={styles.errorScreen}>
        <Result
          status="404"
          title="Không tìm thấy bài viết"
          subTitle="Bài viết này không tồn tại hoặc đã bị xóa khỏi hệ thống."
          extra={<Button type="primary" onClick={() => navigate('/landing')}>Về Trang chủ</Button>}
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

      {/* Header tối giản (Bạn có thể thay bằng Component Header chung của project) */}
      <Header className={styles.simpleHeader} onClick={() => navigate('/landing')}>
        <div className={styles.logoBox}>
            <h1 className={styles.logoText}>CERAMIC-SHOP</h1>
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
               {news.TieuDe.length > 40 ? news.TieuDe.substring(0, 40) + '...' : news.TieuDe}
            </Breadcrumb.Item>
          </Breadcrumb>

          <Button 
            type="link" 
            icon={<ArrowLeftOutlined />} 
            className={styles.btnBack}
            onClick={() => navigate(-1)}
          >
            Quay lại
          </Button>

          <Row gutter={[40, 30]}>
            {/* CỘT TRÁI: NỘI DUNG CHÍNH */}
            <Col xs={24} lg={16}>
              <div className={styles.articleBox}>
                <Title level={1} className={styles.articleTitle}>{news.TieuDe}</Title>
                
                <div className={styles.articleMeta}>
                  <div className={styles.metaItem}>
                    <CalendarOutlined className={styles.metaIcon} /> 
                    {new Date(news.NgayTao).toLocaleDateString('vi-VN', {
                      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </div>
                  <div className={styles.metaDivider}></div>
                  <div className={styles.metaItem}>
                    <EditOutlined className={styles.metaIcon} /> 
                    Tác giả: <strong>{news.NhanVien?.TenNhanVien || 'CeramicShop'}</strong>
                  </div>
                </div>

                {/* Ảnh bìa bài viết */}
                {news.HinhAnh && (
                  <div className={styles.coverImageWrap}>
                    <img src={news.HinhAnh} alt={news.TieuDe} className={styles.coverImage} />
                  </div>
                )}

                {/* Khối Render HTML an toàn */}
                <div 
                  className={styles.htmlContent} 
                  dangerouslySetInnerHTML={{ __html: news.NoiDung }} 
                />
                
                <Divider className={styles.endDivider}>Hết</Divider>
              </div>
            </Col>

            {/* CỘT PHẢI: TIN TỨC GẦN ĐÂY */}
            <Col xs={24} lg={8}>
              <div className={styles.sidebar}>
                <div className={styles.sidebarHeader}>
                  <h3 className={styles.sidebarTitle}>TIN TỨC MỚI NHẤT</h3>
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
              </div>
            </Col>
          </Row>

        </div>
      </Content>
    </Layout>
  );
}

export default NewsDetail;