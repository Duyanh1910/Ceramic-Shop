import React from "react";
import {
  ClockCircleOutlined,
  EnvironmentOutlined,
  FacebookOutlined,
  InstagramOutlined,
  MailOutlined,
  PhoneOutlined,
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

  return (
    <footer id="contact" className={styles.footer}>
      <div className={styles.footerPattern} />

      <div className={styles.container}>
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

          <div className={`${styles.footerCol} ${styles.supportCol}`}>
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

        <div className={styles.footerBottom}>
          <p>© 2026 Ceramic-Shop. Bảo lưu mọi quyền.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;