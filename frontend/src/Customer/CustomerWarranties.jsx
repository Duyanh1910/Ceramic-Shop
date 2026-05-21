import { Button, Layout } from 'antd';
import { ArrowLeftOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import WarrantyContent from '../WarrantyContent';
import styles from './CustomerWarranties.module.css';

const { Header, Content } = Layout;

export default function CustomerWarranties() {
  const navigate = useNavigate();

  return (
    <Layout className={styles.warrantyWrapper}>
      <Helmet>
        <title>Bảo Hành Của Tôi | Ceramic Shop</title>
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
                <SafetyCertificateOutlined /> Bảo hành của tôi
              </div>
              <h1>Theo dõi bảo hành sản phẩm</h1>
              <p>
                Xem các phiếu bảo hành phát sinh sau khi đơn hàng hoàn thành,
                gửi yêu cầu xử lý và theo dõi tiến trình bảo hành.
              </p>
            </div>
          </div>

          <div className={styles.contentCard}>
            <WarrantyContent />
          </div>
        </div>
      </Content>
    </Layout>
  );
}