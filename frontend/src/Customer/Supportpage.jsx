import { useNavigate, useParams, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import styles from './Supportpage.module.css';
import { useEffect } from 'react';

const PAGES = {
  'huong-dan-mua-hang': {
    title: 'Hướng dẫn mua hàng',
    icon: '🛒',
    content: (
      <>
        <h2>Hướng dẫn mua hàng tại Ceramic Shop</h2>
        <p>Chúng tôi cung cấp quy trình mua hàng đơn giản, nhanh chóng và tiện lợi.</p>

        <h3>Bước 1: Tìm kiếm sản phẩm</h3>
        <p>Bạn có thể tìm kiếm sản phẩm theo tên, danh mục hoặc duyệt qua các bộ sưu tập của chúng tôi. Sử dụng bộ lọc để tìm sản phẩm phù hợp với nhu cầu.</p>

        <h3>Bước 2: Chọn sản phẩm</h3>
        <p>Nhấn vào sản phẩm để xem chi tiết. Chọn biến thể (kích thước, màu sắc) phù hợp, sau đó thêm vào giỏ hàng hoặc mua ngay.</p>

        <h3>Bước 3: Đặt hàng</h3>
        <ul>
          <li>Vào giỏ hàng, chọn các sản phẩm muốn đặt</li>
          <li>Nhấn <strong>Đặt hàng</strong> để vào trang thanh toán</li>
          <li>Điền thông tin người nhận và địa chỉ giao hàng</li>
          <li>Chọn phương thức thanh toán phù hợp</li>
          <li>Nhấn xác nhận đặt hàng</li>
        </ul>

        <h3>Bước 4: Theo dõi đơn hàng</h3>
        <p>Sau khi đặt hàng thành công, bạn có thể theo dõi trạng thái đơn hàng trong mục <strong>Đơn hàng của tôi</strong> (cần đăng nhập).</p>

        <div className={styles.noteBox}>
          <strong>Lưu ý:</strong> Để nhận được hỗ trợ tốt nhất, vui lòng đăng nhập trước khi đặt hàng. Bạn cũng có thể đặt hàng không cần tài khoản nhưng sẽ không theo dõi được đơn hàng online.
        </div>

        <h3>Cần hỗ trợ?</h3>
        <p>Liên hệ hotline <strong>0329 835 725</strong> hoặc email <strong>theceramicshop24@gmail.com</strong> để được tư vấn.</p>
      </>
    ),
  },

  'chinh-sach-thanh-toan': {
    title: 'Chính sách thanh toán',
    icon: '💳',
    content: (
      <>
        <h2>Chính sách thanh toán</h2>
        <p>Ceramic Shop chấp nhận nhiều hình thức thanh toán để phù hợp với nhu cầu của mọi khách hàng.</p>

        <h3>1. Thanh toán khi nhận hàng (COD)</h3>
        <p>Bạn thanh toán bằng tiền mặt trực tiếp cho nhân viên giao hàng khi nhận được sản phẩm. Áp dụng cho tất cả đơn hàng trong nước.</p>

        <h3>2. Chuyển khoản ngân hàng</h3>
        <p>Chuyển khoản trước vào tài khoản của Ceramic Shop. Đơn hàng sẽ được xử lý sau khi xác nhận thanh toán (thường trong 1-2 giờ làm việc).</p>
        <div className={styles.bankBox}>
          <div><strong>Ngân hàng:</strong> Vietcombank</div>
          <div><strong>Số tài khoản:</strong> 1234567890</div>
          <div><strong>Chủ tài khoản:</strong> CERAMIC SHOP</div>
          <div><strong>Nội dung:</strong> [Mã đơn hàng]</div>
        </div>

        <h3>3. Ví điện tử (MoMo / ZaloPay)</h3>
        <p>Chuyển khoản qua ví điện tử MoMo hoặc ZaloPay đến số <strong>0329 835 725</strong>. Ghi rõ mã đơn hàng trong nội dung chuyển tiền.</p>

        <h3>Lưu ý quan trọng</h3>
        <ul>
          <li>Giá niêm yết đã bao gồm VAT</li>
          <li>Phí vận chuyển được tính riêng dựa trên địa chỉ giao hàng và trọng lượng đơn</li>
          <li>Ceramic Shop không thu thêm bất kỳ phí ẩn nào</li>
          <li>Hóa đơn VAT được xuất theo yêu cầu</li>
        </ul>
      </>
    ),
  },

  'chinh-sach-giao-hang': {
    title: 'Chính sách giao hàng',
    icon: '🚚',
    content: (
      <>
        <h2>Chính sách giao hàng</h2>
        <p>Ceramic Shop giao hàng trên toàn quốc và quốc tế thông qua đối tác vận chuyển uy tín.</p>

        <h3>Khu vực giao hàng & Thời gian</h3>
        <div className={styles.tableWrap}>
          <table className={styles.policyTable}>
            <thead>
              <tr><th>Khu vực</th><th>Thời gian</th><th>Phí ship cơ bản</th></tr>
            </thead>
            <tbody>
              <tr><td>Nội thành Hải Phòng</td><td>1 - 2 ngày</td><td>Theo trọng lượng</td></tr>
              <tr><td>Ngoại thành Hải Phòng</td><td>2 - 3 ngày</td><td>Theo trọng lượng</td></tr>
              <tr><td>Miền Bắc</td><td>2 - 4 ngày</td><td>Theo trọng lượng</td></tr>
              <tr><td>Miền Trung</td><td>3 - 5 ngày</td><td>Theo trọng lượng</td></tr>
              <tr><td>Miền Nam</td><td>4 - 6 ngày</td><td>Theo trọng lượng</td></tr>
              <tr><td>Quốc tế</td><td>7 - 15 ngày</td><td>Theo trọng lượng</td></tr>
            </tbody>
          </table>
        </div>

        <h3>Phụ phí đặc biệt</h3>
        <ul>
          <li><strong>Hàng cồng kềnh (≥1kg/món):</strong> Phụ phí thêm theo quy định</li>
          <li><strong>Hàng siêu cồng kềnh (≥20kg/món):</strong> Phụ phí cao hơn, liên hệ báo giá</li>
          <li><strong>Giao nhanh / Hoả tốc:</strong> Áp dụng trong nội thành, phụ phí thêm</li>
        </ul>

        <h3>Đóng gói hàng</h3>
        <p>Tất cả sản phẩm gốm sứ được đóng gói cẩn thận bằng xốp chống sốc và hộp carton chắc chắn để đảm bảo an toàn trong quá trình vận chuyển.</p>

        <h3>Theo dõi đơn hàng</h3>
        <p>Sau khi đơn hàng được giao cho đơn vị vận chuyển, bạn sẽ nhận được mã vận đơn qua email hoặc SMS để theo dõi.</p>

        <div className={styles.noteBox}>
          <strong>Lưu ý:</strong> Thời gian giao hàng có thể thay đổi vào các ngày lễ, Tết hoặc khi có sự cố thiên tai.
        </div>
      </>
    ),
  },

  'chinh-sach-doi-tra': {
    title: 'Chính sách đổi trả',
    icon: '🔄',
    content: (
      <>
        <h2>Chính sách đổi trả hàng</h2>
        <p>Ceramic Shop cam kết hỗ trợ đổi trả hàng trong các trường hợp hợp lý nhằm bảo vệ quyền lợi khách hàng.</p>

        <h3>Điều kiện đổi trả</h3>
        <ul>
          <li>Sản phẩm bị lỗi, vỡ, sứt mẻ do lỗi sản xuất hoặc vận chuyển</li>
          <li>Giao sai sản phẩm so với đơn hàng</li>
          <li>Sản phẩm không đúng mô tả trên website</li>
        </ul>

        <h3>Thời hạn đổi trả</h3>
        <p>Khách hàng có <strong>48 giờ</strong> kể từ khi nhận hàng để thông báo yêu cầu đổi trả. Sau thời gian này, chúng tôi không thể giải quyết khiếu nại.</p>

        <h3>Quy trình đổi trả</h3>
        <ol>
          <li>Chụp ảnh/video sản phẩm lỗi và gửi kèm mã đơn hàng</li>
          <li>Liên hệ hotline <strong>0329 835 725</strong> hoặc email để thông báo</li>
          <li>Nhân viên xác nhận và hướng dẫn gửi hàng về</li>
          <li>Sau khi nhận và kiểm tra, chúng tôi gửi hàng thay thế hoặc hoàn tiền</li>
        </ol>

        <h3>Trường hợp không áp dụng đổi trả</h3>
        <ul>
          <li>Sản phẩm đã qua sử dụng, bị trầy xước do người dùng</li>
          <li>Sản phẩm bị vỡ do người dùng làm rơi sau khi nhận hàng</li>
          <li>Đổi trả do không thích / thay đổi ý (trừ trường hợp có thỏa thuận)</li>
        </ul>

        <h3>Hoàn tiền</h3>
        <p>Thời gian hoàn tiền: <strong>3 - 7 ngày làm việc</strong> sau khi xác nhận đổi trả. Tiền được hoàn qua phương thức thanh toán ban đầu.</p>
      </>
    ),
  },

  'chinh-sach-bao-hanh': {
    title: 'Chính sách bảo hành',
    icon: '🛡️',
    content: (
      <>
        <h2>Chính sách bảo hành</h2>
        <p>Ceramic Shop cung cấp chính sách bảo hành rõ ràng, minh bạch để bảo vệ quyền lợi khách hàng lâu dài.</p>

        <h3>Thời gian bảo hành</h3>
        <div className={styles.tableWrap}>
          <table className={styles.policyTable}>
            <thead>
              <tr><th>Loại sản phẩm</th><th>Thời gian bảo hành</th></tr>
            </thead>
            <tbody>
              <tr><td>Đồ thờ, tượng gốm cao cấp</td><td>12 tháng</td></tr>
              <tr><td>Bộ ấm trà, đồ uống</td><td>6 tháng</td></tr>
              <tr><td>Đồ trang trí, lục bình</td><td>6 tháng</td></tr>
              <tr><td>Đồ phòng bếp</td><td>3 tháng</td></tr>
              <tr><td>Phụ kiện, đồ nhỏ</td><td>1 tháng</td></tr>
            </tbody>
          </table>
        </div>

        <h3>Phạm vi bảo hành</h3>
        <ul>
          <li>Lỗi kỹ thuật từ nhà sản xuất (nứt men, bong tróc, lỗi hoa văn)</li>
          <li>Biến dạng trong điều kiện sử dụng bình thường</li>
          <li>Phai màu bất thường không do tác động bên ngoài</li>
        </ul>

        <h3>Không thuộc phạm vi bảo hành</h3>
        <ul>
          <li>Hư hỏng do va đập, rơi vỡ, sử dụng sai cách</li>
          <li>Hư hỏng do tiếp xúc hóa chất mạnh</li>
          <li>Trầy xước thông thường trong quá trình sử dụng</li>
        </ul>

        <h3>Cách thực hiện bảo hành</h3>
        <ol>
          <li>Liên hệ Ceramic Shop qua hotline hoặc email</li>
          <li>Cung cấp mã đơn hàng và mô tả lỗi</li>
          <li>Gửi sản phẩm về địa chỉ của chúng tôi (chi phí gửi về do khách hàng chịu)</li>
          <li>Sau kiểm tra, chúng tôi sửa chữa hoặc thay thế và giao lại miễn phí</li>
        </ol>

        <div className={styles.noteBox}>
          <strong>Lưu ý:</strong> Vui lòng giữ hóa đơn mua hàng hoặc mã đơn hàng để thuận tiện trong quá trình bảo hành.
        </div>
      </>
    ),
  },
};

const MENU = [
  { slug: 'huong-dan-mua-hang',     icon: '🛒', label: 'Hướng dẫn mua hàng' },
  { slug: 'chinh-sach-thanh-toan',  icon: '💳', label: 'Chính sách thanh toán' },
  { slug: 'chinh-sach-giao-hang',   icon: '🚚', label: 'Chính sách giao hàng' },
  { slug: 'chinh-sach-doi-tra',     icon: '🔄', label: 'Chính sách đổi trả' },
  { slug: 'chinh-sach-bao-hanh',    icon: '🛡️', label: 'Chính sách bảo hành' },
];

export default function SupportPage() {
  const navigate = useNavigate();
  const { slug } = useParams();
  
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [slug]);

  if (slug && !PAGES[slug]) {
    return <Navigate to="/" replace />;
  }

  const current = PAGES[slug] || PAGES['huong-dan-mua-hang'];
  const currentSlug = slug || 'huong-dan-mua-hang';

  return (
    <div className={styles.pageWrapper}>
      <Helmet><title>{current.title} | Ceramic Shop</title></Helmet>

      <header className={styles.topHeader}>
        <div className={styles.logoBox} onClick={() => navigate('/')}>
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
          type="link"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/')}
          className={styles.btnBack}
        >
          Quay lại
        </Button>
      </header>

      <div className={styles.mainContent}>
        <div className={styles.container}>
          <div className={styles.layout}>

            <aside className={styles.sidebar}>
              <div className={styles.sidebarTitle}>Hỗ trợ khách hàng</div>
              <nav>
                {MENU.map((item) => (
                  <div
                    key={item.slug}
                    className={`${styles.menuItem} ${currentSlug === item.slug ? styles.menuActive : ''}`}
                    onClick={() => navigate(`/support/${item.slug}`)}
                  >
                    <span className={styles.menuIcon}>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                ))}
              </nav>

              <div className={styles.contactBox}>
                <div className={styles.contactTitle}>Cần hỗ trợ thêm?</div>
                <a href="tel:0329835725" className={styles.contactItem}>
                  📞 0329 835 725
                </a>
                <a href="mailto:theceramicshop24@gmail.com" className={styles.contactItem}>
                  ✉️ theceramicshop24@gmail.com
                </a>
                <a href="https://zalo.me/0329835725" target="_blank" rel="noreferrer" className={styles.contactItem}>
                  💬 Chat Zalo
                </a>
              </div>
            </aside>

            <main className={styles.contentArea}>
              <div className={styles.breadcrumbNav}>
                <span onClick={() => navigate('/')} className={styles.breadcrumbLink}>Trang chủ</span>
                <span className={styles.breadcrumbSep}>›</span>
                <span onClick={() => navigate('/support/huong-dan-mua-hang')} className={styles.breadcrumbLink}>Hỗ trợ</span>
                <span className={styles.breadcrumbSep}>›</span>
                <span className={styles.breadcrumbCurrent}>{current.title}</span>
              </div>

              <div className={styles.article}>
                <div className={styles.articleHeader}>
                  <span className={styles.articleIcon}>{current.icon}</span>
                  <div className={styles.articleMeta}>
                    <div className={styles.articleCategory}>Hỗ trợ khách hàng</div>
                    <h1 className={styles.articleTitle}>{current.title}</h1>
                  </div>
                </div>

                <div className={styles.articleBody}>
                  {current.content}
                </div>
              </div>

              <div className={styles.otherPages}>
                <div className={styles.otherTitle}>Xem thêm</div>
                <div className={styles.otherGrid}>
                  {MENU.filter((m) => m.slug !== currentSlug).map((item) => (
                    <div
                      key={item.slug}
                      className={styles.otherCard}
                      onClick={() => navigate(`/support/${item.slug}`)}
                    >
                      <span className={styles.otherIcon}>{item.icon}</span>
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </main>

          </div>
        </div>
      </div>
    </div>
  );
}