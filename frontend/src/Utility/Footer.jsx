import React from "react";
import {
  CarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CreditCardOutlined,
  EnvironmentOutlined,
  FacebookOutlined,
  GiftOutlined,
  InstagramOutlined,
  MailOutlined,
  PhoneOutlined,
  SafetyCertificateOutlined,
  ShoppingOutlined,
  YoutubeOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import styles from "./Footer.module.css";

function Footer() {
  const navigate = useNavigate();

  const supportLinks = [
    {
      label: "Hướng dẫn mua hàng",
      path: "/support/huong-dan-mua-hang",
    },
    {
      label: "Chính sách thanh toán",
      path: "/support/chinh-sach-thanh-toan",
    },
    {
      label: "Chính sách giao hàng",
      path: "/support/chinh-sach-giao-hang",
    },
    {
      label: "Chính sách đổi trả",
      path: "/support/chinh-sach-doi-tra",
    },
    {
      label: "Chính sách bảo hành",
      path: "/support/chinh-sach-bao-hanh",
    },
  ];

  const publicLinks = [
    {
      label: "Trang chủ mua hàng",
      path: "/home",
    },
    {
      label: "Giới thiệu CeramicShop",
      path: "/landing#about",
    },
    {
      label: "Danh mục sản phẩm",
      path: "/landing#categories",
    },
    {
      label: "Sản phẩm nổi bật",
      path: "/landing#products",
    },
    {
      label: "Tin tức & sự kiện",
      path: "/landing#news",
    },
  ];

  const categoryLinks = [
    "Bình hoa",
    "Bộ ấm trà",
    "Bộ đồ ăn",
    "Bát hương",
    "Mâm bồng",
    "Đồ phòng bếp",
    "Đồ phòng khách",
    "Đồ thờ",
  ];

  const commitments = [
    {
      icon: <CarOutlined />,
      title: "Giao hàng toàn quốc",
      desc: "Đóng gói kỹ, hỗ trợ theo dõi đơn hàng",
    },
    {
      icon: <CreditCardOutlined />,
      title: "Thanh toán linh hoạt",
      desc: "COD, Momo, ZaloPay và thanh toán điện tử",
    },
    {
      icon: <SafetyCertificateOutlined />,
      title: "Bảo hành minh bạch",
      desc: "Chính sách rõ ràng sau khi nhận hàng",
    },
    {
      icon: <GiftOutlined />,
      title: "Ưu đãi định kỳ",
      desc: "Khuyến mãi, voucher và quà tặng theo chương trình",
    },
  ];

  const paymentMethods = ["COD", "Momo", "ZaloPay"];

  const socialLinks = [
    {
      label: "Facebook",
      href: "https://www.facebook.com/profile.php?id=61579940656759",
      icon: <FacebookOutlined />,
    },
    {
      label: "YouTube",
      href: "https://www.youtube.com/@LaptopProCenter",
      icon: <YoutubeOutlined />,
    },
    {
      label: "Instagram",
      href: "https://www.instagram.com/laptopprocenter123/",
      icon: <InstagramOutlined />,
    },
  ];

  const navigateToCategory = (keyword) => {
    navigate(`/home?search=${encodeURIComponent(keyword)}`);
  };

  return (
    <footer id="contact" className={styles.footer}>
      <div className={styles.footerPattern} />

      <div className={styles.container}>
        <div className={styles.serviceBar}>
          {commitments.map((item) => (
            <div className={styles.serviceItem} key={item.title}>
              <span className={styles.serviceIcon}>{item.icon}</span>
              <div>
                <h4>{item.title}</h4>
                <p>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.footerMain}>
          <div className={`${styles.footerCol} ${styles.brandCol}`}>
            <button
              type="button"
              className={styles.logoBox}
              onClick={() => navigate("/landing")}
              aria-label="Về trang giới thiệu Ceramic Shop"
            >
              <img
                src="/logo.png"
                alt="Ceramic Shop Logo"
                className={styles.logoImg}
              />
              <span className={styles.logoTextWrap}>
                <span className={styles.logoText}>CERAMIC-SHOP</span>
                <span className={styles.logoSub}>TINH HOA GỐM SỨ VIỆT</span>
              </span>
            </button>

            <p className={styles.brandDesc}>
              Ceramic-Shop chuyên các sản phẩm gốm sứ gia dụng, trang trí và
              thờ cúng, mang vẻ đẹp tinh tế của gốm Việt vào từng không gian
              sống.
            </p>

            <div className={styles.brandHighlight}>
              <span className={styles.highlightIcon}>
                <CheckCircleOutlined />
              </span>
              <span>
                Tư vấn chọn gốm theo nhu cầu sử dụng, màu sắc, không gian và
                phong thủy.
              </span>
            </div>

            <div className={styles.brandActions}>
              <button
                type="button"
                className={styles.primaryAction}
                onClick={() => navigate("/home")}
              >
                Mua sắm ngay
              </button>
              <a className={styles.secondaryAction} href="tel:0329835725">
                Gọi tư vấn
              </a>
            </div>

            <div className={styles.socialBox}>
              <p>Kết nối với chúng tôi</p>
              <div className={styles.socialList}>
                {socialLinks.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialLink}
                    aria-label={item.label}
                    title={item.label}
                  >
                    {item.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.footerCol}>
            <h3>Hỗ trợ khách hàng</h3>
            <ul className={styles.linkList}>
              {supportLinks.map((item) => (
                <li key={item.path}>
                  <button
                    type="button"
                    className={styles.footerLink}
                    onClick={() => navigate(item.path)}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.footerCol}>
            <h3>Danh mục nổi bật</h3>
            <ul className={styles.linkList}>
              {categoryLinks.map((item) => (
                <li key={item}>
                  <button
                    type="button"
                    className={styles.footerLink}
                    onClick={() => navigateToCategory(item)}
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.footerCol}>
            <h3>Về CeramicShop</h3>
            <ul className={styles.linkList}>
              {publicLinks.map((item) => (
                <li key={item.path}>
                  <button
                    type="button"
                    className={styles.footerLink}
                    onClick={() => navigate(item.path)}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className={`${styles.footerCol} ${styles.contactCol}`}>
            <h3>Thông tin liên hệ</h3>

            <div className={styles.contactCard}>
              <div className={styles.contactItem}>
                <span className={styles.contactIcon}>
                  <EnvironmentOutlined />
                </span>
                <div>
                  <strong>Địa chỉ cửa hàng</strong>
                  <a
                    href="https://maps.google.com/?q=484+Lạch+Tray,+Lê+Chân,+Hải+Phòng"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.contactLink}
                  >
                    484 Lạch Tray, Lê Chân, Hải Phòng
                  </a>
                </div>
              </div>

              <div className={styles.contactItem}>
                <span className={styles.contactIcon}>
                  <PhoneOutlined />
                </span>
                <div>
                  <strong>Hotline tư vấn</strong>
                  <a href="tel:0329835725" className={styles.contactLink}>
                    0329.835.725
                  </a>
                </div>
              </div>

              <div className={styles.contactItem}>
                <span className={styles.contactIcon}>
                  <MailOutlined />
                </span>
                <div>
                  <strong>Email hỗ trợ</strong>
                  <a
                    href="mailto:theceramicshop24@gmail.com"
                    className={styles.contactLink}
                  >
                    theceramicshop24@gmail.com
                  </a>
                </div>
              </div>

              <div className={styles.contactItem}>
                <span className={styles.contactIcon}>
                  <ClockCircleOutlined />
                </span>
                <div>
                  <strong>Giờ làm việc</strong>
                  <p>8:00 - 22:00, Thứ 2 - Thứ 7</p>
                </div>
              </div>

              <a
                href="https://maps.google.com/?q=484+Lạch+Tray,+Lê+Chân,+Hải+Phòng"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.mapButton}
              >
                Xem bản đồ
              </a>
            </div>
          </div>
        </div>

        <div className={styles.paymentSection}>
          <div className={styles.paymentIntro}>
            <span className={styles.paymentIcon}>
              <ShoppingOutlined />
            </span>
            <div>
              <h3>Phương thức thanh toán</h3>
              <p>Hỗ trợ thanh toán khi nhận hàng và các ví điện tử phổ biến.</p>
            </div>
          </div>

          <div className={styles.paymentList}>
            {paymentMethods.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>

        <div className={styles.footerBottom}>
          <p>© 2026 Ceramic-Shop. Bảo lưu mọi quyền.</p>

          <div className={styles.bottomLinks}>
            <button
              type="button"
              onClick={() => navigate("/support/chinh-sach-thanh-toan")}
            >
              Thanh toán
            </button>
            <button
              type="button"
              onClick={() => navigate("/support/chinh-sach-giao-hang")}
            >
              Giao hàng
            </button>
            <button
              type="button"
              onClick={() => navigate("/support/chinh-sach-doi-tra")}
            >
              Đổi trả
            </button>
            <button
              type="button"
              onClick={() => navigate("/support/chinh-sach-bao-hanh")}
            >
              Bảo hành
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;