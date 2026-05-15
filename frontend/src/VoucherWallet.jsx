import { Button, Layout } from 'antd';
import { ArrowLeftOutlined, WalletOutlined } from '@ant-design/icons';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import VoucherWalletContent from './VoucherWalletContent';
import styles from './VoucherWallet.module.css';

const { Header, Content } = Layout;

export default function VoucherWallet() {
  const navigate = useNavigate();

  return (
    <Layout className={styles.walletWrapper}>
      <Helmet>
        <title>Ví Của Tôi | Ceramic Shop</title>
      </Helmet>

      <Header className={styles.topHeader}>
        <div className={styles.logoBox} onClick={() => navigate('/home')}>
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
          onClick={() => navigate('/home')}
          className={styles.btnBack}
        >
          Quay về trang chủ
        </Button>
      </Header>

      <Content className={styles.mainContent}>
        <div className={styles.container}>
          <div className={styles.pageHero}>
            <div>
              <div className={styles.heroLabel}>
                <WalletOutlined /> Ví của tôi
              </div>
              <h1>Quản lý khuyến mại của bạn</h1>
              <p>
                Xem voucher đang có, voucher đã dùng, voucher hết hạn và chọn mã để dùng khi thanh toán.
              </p>
            </div>
          </div>

          <div className={styles.contentCard}>
            <VoucherWalletContent />
          </div>
        </div>
      </Content>
    </Layout>
  );
}