import { Link, useLocation, useParams } from 'react-router-dom';
import { HomeOutlined, RightOutlined } from '@ant-design/icons';
import styles from './Breadcrumb.module.css';

const ROUTE_LABELS = {
  '':           { label: 'Trang chủ', icon: <HomeOutlined /> },
  'home':       { label: 'Trang chủ', icon: <HomeOutlined /> },
  'landing':    { label: 'Giới thiệu' },
  'login':      { label: 'Đăng nhập' },
  'register':   { label: 'Đăng ký' },
  'forgot-password': { label: 'Quên mật khẩu' },
  'cart':       { label: 'Giỏ hàng' },
  'checkout':   { label: 'Thanh toán' },
  'orders':     { label: 'Đơn hàng của tôi' },
  'profile':    { label: 'Hồ sơ' },
  'change-password': { label: 'Đổi mật khẩu' },
  'home':       { label: 'Cửa hàng' },
  'admin':      { label: 'Quản lý' },
  'products':   { label: 'Sản phẩm' },
  'customers':  { label: 'Khách hàng' },
  'staffs':     { label: 'Nhân viên' },
  'reports':    { label: 'Báo cáo' },
  'promotions': { label: 'Khuyến mãi' },
};

export default function Breadcrumb({ customLabels = {}, className = '' }) {
  const location = useLocation();
  const params = useParams();

  const segments = location.pathname.split('/').filter(Boolean);

  const crumbs = [
    { label: 'Trang chủ', icon: <HomeOutlined />, path: '/' },
  ];

  let accPath = '';
  segments.forEach((seg, i) => {
    accPath += `/${seg}`;

    const isId = /^\d+$/.test(seg);
    const prevSeg = segments[i - 1];
    const customKey = `${prevSeg}/${seg}`;

    let label = '';
    let icon = null;

    if (customLabels[customKey]) {
      label = customLabels[customKey];
    } else if (customLabels[seg]) {
      label = customLabels[seg];
    } else if (isId) {
      const parentConfig = ROUTE_LABELS[prevSeg];
      label = parentConfig ? `Chi tiết ${parentConfig.label?.toLowerCase()}` : `#${seg}`;
    } else {
      const config = ROUTE_LABELS[seg];
      label = config?.label || seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' ');
      icon = config?.icon || null;
    }

    crumbs.push({ label, icon, path: accPath });
  });

  if (crumbs.length <= 1) return null;

  return (
    <nav className={`${styles.breadcrumb} ${className}`} aria-label="Breadcrumb">
      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1;
        return (
          <span key={crumb.path} className={styles.item}>
            {i > 0 && <RightOutlined className={styles.sep} />}
            {isLast ? (
              <span className={styles.current}>
                {crumb.icon && <span className={styles.icon}>{crumb.icon}</span>}
                {crumb.label}
              </span>
            ) : (
              <Link to={crumb.path} className={styles.link}>
                {crumb.icon && <span className={styles.icon}>{crumb.icon}</span>}
                {crumb.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
