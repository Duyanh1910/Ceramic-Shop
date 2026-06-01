import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import {
  Layout,
  Spin,
  Breadcrumb,
  Typography,
  Button,
  Result,
  Tag,
  Tooltip,
  message,
} from "antd";
import {
  HomeOutlined,
  CalendarOutlined,
  ArrowLeftOutlined,
  LeftOutlined,
  RightOutlined,
  FacebookOutlined,
  TwitterOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import { Helmet } from "react-helmet-async";
import styles from "./NewsDetails.module.css";

import { API_BASE } from "../config/api";

const { Header, Content } = Layout;
const { Title } = Typography;

function NewsDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [news, setNews] = useState(null);
  const [recentNews, setRecentNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const relatedTrackRef = useRef(null);

  const handleShareFacebook = () => {
    const currentUrl = encodeURIComponent(window.location.href);
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${currentUrl}`,
      "_blank",
      "width=600,height=400",
    );
  };

  const handleShareTwitter = () => {
    const currentUrl = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`Đọc bài viết tuyệt hay: ${news?.TieuDe}`);
    window.open(
      `https://twitter.com/intent/tweet?url=${currentUrl}&text=${text}`,
      "_blank",
      "width=600,height=400",
    );
  };

  const handleCopyLink = () => {
    const currentUrl = window.location.href;
    navigator.clipboard
      .writeText(currentUrl)
      .then(() => {
        message.success("Đã sao chép liên kết bài viết!");
      })
      .catch(() => {
        message.error("Không thể sao chép liên kết. Vui lòng thử lại!");
      });
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  useEffect(() => {
    const fetchNewsData = async () => {
      setLoading(true);
      try {
        const detailRes = await axios.get(`${API_BASE}/news/${id}`);
        const articleData =
          detailRes.data?.result || detailRes.data?.data || detailRes.data;
        setNews(articleData);

        const listRes = await axios.get(`${API_BASE}/news`);
        const allNews = listRes.data?.result || listRes.data?.data || [];

        const filteredNews = allNews.filter(
          (item) => item.MaTinTuc !== parseInt(id),
        );
        setRecentNews(filteredNews);
      } catch {
        setNews(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchNewsData();
  }, [id]);

  const scrollRelatedNews = (direction) => {
    const track = relatedTrackRef.current;
    if (!track) return;

    const firstCard = track.querySelector(`.${styles.relatedCard}`);
    const cardWidth = firstCard?.offsetWidth || 280;
    track.scrollBy({
      left: direction * (cardWidth + 25),
      behavior: "smooth",
    });
  };

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
          extra={
            <Button
              type="primary"
              size="large"
              onClick={() => navigate("/landing")}
            >
              Về Trang chủ
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <Layout className={styles.wrapper}>
      <Helmet>
        <title>{news.TieuDe} | Ceramic Shop</title>
        <meta name="description" content={news.TieuDe} />
        <meta property="og:title" content={news.TieuDe} />
        <meta
          property="og:description"
          content="Khám phá góc nhìn nghệ thuật và tinh hoa gốm sứ Bát Tràng cùng CeramicShop."
        />
        {news.HinhAnh && <meta property="og:image" content={news.HinhAnh} />}
        <meta property="og:url" content={window.location.href} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <Header className={styles.simpleHeader}>
        <div className={styles.headerContainer}>
          <div className={styles.logoBox} onClick={() => navigate("/landing")}>
            <img
              src="https://res.cloudinary.com/dcmwz0uis/image/upload/v1774819165/IMG_20260330_041641_qwo8lc.jpg"
              alt="Ceramic Shop Logo"
              className={styles.logoImg}
            />
            <div className={styles.logoTextWrap}>
              <h1 className={styles.logoText}>CERAMIC-SHOP</h1>
              <span className={styles.logoSub}>TINH HOA GỐM SỨ VIỆT</span>
            </div>
          </div>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            className={styles.btnBack}
          >
            Quay lại
          </Button>
        </div>
      </Header>

      <Content className={styles.mainContent}>
        <div className={styles.container}>
          <Breadcrumb className={styles.breadcrumb}>
            <Breadcrumb.Item
              href=""
              onClick={(e) => {
                e.preventDefault();
                navigate("/landing");
              }}
            >
              <HomeOutlined /> Trang chủ
            </Breadcrumb.Item>
            <Breadcrumb.Item
              href=""
              onClick={(e) => {
                e.preventDefault();
                navigate("/landing#news");
              }}
            >
              Tin tức
            </Breadcrumb.Item>
            <Breadcrumb.Item className={styles.currentCrumb}>
              {news.TieuDe.length > 35
                ? news.TieuDe.substring(0, 35) + "..."
                : news.TieuDe}
            </Breadcrumb.Item>
          </Breadcrumb>

          <div className={styles.articleWrapper}>
            <div className={styles.articleBox}>
              <header className={styles.articleHeader}>
                <Tag color="gold" className={styles.categoryTag}>
                  Góc Nhìn Nghệ Thuật
                </Tag>
                <Title level={1} className={styles.articleTitle}>
                  {news.TieuDe}
                </Title>

                <div className={styles.articleMeta}>
                  <div className={styles.authorInfo}>
                    <div className={styles.authorAvatar}>
                      {news.NhanVien?.TenNhanVien
                        ? news.NhanVien.TenNhanVien.charAt(0)
                        : "C"}
                    </div>
                    <div>
                      <div className={styles.authorName}>
                        {news.NhanVien?.TenNhanVien ||
                          "Ban Biên Tập CeramicShop"}
                      </div>
                      <div className={styles.publishDate}>
                        <CalendarOutlined style={{ marginRight: 5 }} />
                        {new Date(news.NgayTao).toLocaleDateString("vi-VN", {
                          weekday: "long",
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </header>

              {news.HinhAnh && (
                <div className={styles.coverImageWrap}>
                  <img
                    src={news.HinhAnh}
                    alt={news.TieuDe}
                    className={styles.coverImage}
                  />
                </div>
              )}

              <div
                className={styles.htmlContent}
                dangerouslySetInnerHTML={{ __html: news.NoiDung }}
              />

              <footer className={styles.articleFooter}>
                <div className={styles.tagsWrap}>
                  <strong>Tags:</strong>
                  <Tag>Gốm Sứ</Tag>
                  <Tag>Bát Tràng</Tag>
                  <Tag>Phong Cách Sống</Tag>
                </div>
                <div className={styles.shareWrap}>
                  <span style={{ marginRight: 10, color: "#666" }}>
                    Chia sẻ:
                  </span>

                  <Tooltip title="Chia sẻ Facebook">
                    <Button
                      shape="circle"
                      icon={<FacebookOutlined />}
                      className={styles.shareBtn}
                      onClick={handleShareFacebook}
                    />
                  </Tooltip>

                  <Tooltip title="Chia sẻ Twitter">
                    <Button
                      shape="circle"
                      icon={<TwitterOutlined />}
                      className={styles.shareBtn}
                      onClick={handleShareTwitter}
                    />
                  </Tooltip>

                  <Tooltip title="Sao chép liên kết">
                    <Button
                      shape="circle"
                      icon={<LinkOutlined />}
                      className={styles.shareBtn}
                      onClick={handleCopyLink}
                    />
                  </Tooltip>
                </div>
              </footer>
            </div>

            {recentNews.length > 0 && (
              <div className={styles.relatedSection}>
                <h3 className={styles.relatedTitle}>CÁC BÀI VIẾT TƯƠNG TỰ</h3>
                {recentNews.length > 3 && (
                  <div className={styles.relatedNav}>
                    <span className={styles.relatedNavLabel}>
                      Khám phá thêm bài viết
                    </span>

                    <div className={styles.relatedNavActions}>
                      <button
                        type="button"
                        className={styles.relatedNavBtn}
                        onClick={() => scrollRelatedNews(-1)}
                        aria-label="Xem bài viết trước"
                      >
                        <LeftOutlined />
                      </button>

                      <button
                        type="button"
                        className={styles.relatedNavBtn}
                        onClick={() => scrollRelatedNews(1)}
                        aria-label="Xem bài viết tiếp theo"
                      >
                        <RightOutlined />
                      </button>
                    </div>
                  </div>
                )}
                <div className={styles.relatedGrid} ref={relatedTrackRef}>
                  {recentNews.map((item) => (
                    <div
                      key={item.MaTinTuc}
                      className={styles.relatedCard}
                      onClick={() => navigate(`/news/${item.MaTinTuc}`)}
                    >
                      <div className={styles.relatedImg}>
                        <img
                          src={
                            item.HinhAnh ||
                            "https://via.placeholder.com/300x200"
                          }
                          alt={item.TieuDe}
                        />
                      </div>
                      <div className={styles.relatedInfo}>
                        <h4 className={styles.relatedItemTitle}>
                          {item.TieuDe}
                        </h4>
                        <span className={styles.relatedDate}>
                          {new Date(item.NgayTao).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </Content>
    </Layout>
  );
}

export default NewsDetail;
