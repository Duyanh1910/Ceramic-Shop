import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Footer.module.css";

function Footer() {
  const navigate = useNavigate();

  return (
    <footer id="contact" className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.footerGrid}>
          {/* Cột 1: Hỗ trợ khách hàng */}
          <div className={styles.footerCol}>
            <h3>HỖ TRỢ KHÁCH HÀNG</h3>
            <ul>
              <li>
                <span
                  className={styles.footerLink}
                  onClick={() => navigate("/support/huong-dan-mua-hang")}
                >
                  Hướng dẫn mua hàng
                </span>
              </li>
              <li>
                <span
                  className={styles.footerLink}
                  onClick={() => navigate("/support/chinh-sach-thanh-toan")}
                >
                  Chính sách thanh toán
                </span>
              </li>
              <li>
                <span
                  className={styles.footerLink}
                  onClick={() => navigate("/support/chinh-sach-giao-hang")}
                >
                  Chính sách giao hàng
                </span>
              </li>
              <li>
                <span
                  className={styles.footerLink}
                  onClick={() => navigate("/support/chinh-sach-doi-tra")}
                >
                  Chính sách đổi trả
                </span>
              </li>
              <li>
                <span
                  className={styles.footerLink}
                  onClick={() => navigate("/support/chinh-sach-bao-hanh")}
                >
                  Chính sách bảo hành
                </span>
              </li>
            </ul>
          </div>

          {/* Cột 2: Phương thức thanh toán */}
          <div className={styles.footerCol}>
            <h3>PHƯƠNG THỨC THANH TOÁN</h3>
            <ul>
              <li>💵 Thanh toán COD (Tiền mặt)</li>
              <li>📱 Ví điện tử Momo</li>
              <li>📱 Ví điện tử ZaloPay</li>
            </ul>
          </div>

          {/* Cột 3: Thông tin liên hệ */}
          <div className={styles.footerCol}>
            <h3>THÔNG TIN LIÊN HỆ</h3>
            <ul>
              <li>
                📍 Địa chỉ:{" "}
                <a
                  href="https://maps.google.com/?q=484+Lạch+Tray,+Lê+Chân,+Hải+Phòng"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "inherit", textDecoration: "none" }}
                  className={styles.footerLink}
                >
                  484 Lạch Tray, Lê Chân, Hải Phòng
                </a>
              </li>
              <li>
                📞 Hotline:{" "}
                <a
                  href="tel:0329835725"
                  style={{ color: "inherit", textDecoration: "none" }}
                  className={styles.footerLink}
                >
                  0329.835.725
                </a>
              </li>
              <li>
                ✉️ Email:{" "}
                <a
                  href="mailto:theceramicshop24@gmail.com"
                  style={{ color: "inherit", textDecoration: "none" }}
                  className={styles.footerLink}
                >
                  theceramicshop24@gmail.com
                </a>
              </li>
              <li>🕐 Giờ làm việc: 8:00 - 22:00 (Thứ 2 - Thứ 7)</li>
            </ul>
          </div>
        </div>
      </div>
      <div className={styles.copyright}>
        <p>© 2026 Bản quyền thuộc về CeramicShop. Bảo lưu mọi quyền.</p>
      </div>
    </footer>
  );
}

export default Footer;
