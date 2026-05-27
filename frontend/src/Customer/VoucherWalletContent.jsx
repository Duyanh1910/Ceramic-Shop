import { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Empty,
  Input,
  message,
  Popconfirm,
  Segmented,
  Spin,
  Tag,
  Tooltip,
} from 'antd';
import {
  CheckCircleOutlined,
  CopyOutlined,
  DeleteOutlined,
  GiftOutlined,
  ReloadOutlined,
  SearchOutlined,
  ShoppingCartOutlined,
  TruckOutlined,
  WalletOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import dayjs from 'dayjs';
import styles from './VoucherWalletContent.module.css';

const API_BASE = 'https://ceramic-shop-u8ak.onrender.com/api/v1';

const getToken = () =>
  localStorage.getItem('customer_token') || localStorage.getItem('admin_token');

const authHeader = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
  },
  withCredentials: true,
});

const fmt = (value) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(Number(value || 0));

const getPromo = (item) => item?.KhuyenMai || item;

const getPromoCategory = (promo) =>
  promo?.DanhMucSanPham || promo?.category || promo?.Category || null;

const getCategoryName = (promo) => {
  const category = getPromoCategory(promo);

  if (category?.TenDanhMuc) {
    return category.TenDanhMuc;
  }

  if (promo?.MaDanhMuc) {
    return `Danh mục #${promo.MaDanhMuc}`;
  }

  return 'Toàn shop';
};

const getVoucherType = (promo) => {
  if (Number(promo?.LoaiVoucher) === 2) {
    return {
      label: 'Freeship',
      color: 'cyan',
      icon: <TruckOutlined />,
    };
  }

  return {
    label: 'Giảm đơn hàng',
    color: 'gold',
    icon: <GiftOutlined />,
  };
};

const getVoucherValue = (promo) => {
  if (Number(promo?.MaLoaiKM) === 1) {
    return `Giảm ${Number(promo?.GiaTri || 0)}%`;
  }

  return `Giảm ${fmt(promo?.GiaTri)}`;
};

const getExpireText = (promo) => {
  if (!promo?.NgayKetThuc) return 'Không rõ hạn';

  const end = dayjs(promo.NgayKetThuc);
  const diffDay = end.diff(dayjs(), 'day');

  if (diffDay < 0) return 'Đã hết hạn';
  if (diffDay === 0) return 'Hết hạn hôm nay';
  if (diffDay <= 3) return `Còn ${diffDay} ngày`;

  return `HSD: ${end.format('DD/MM/YYYY')}`;
};

export default function VoucherWalletContent({ compact = false }) {
  const navigate = useNavigate();

  const [tab, setTab] = useState('usable');
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [availablePromos, setAvailablePromos] = useState([]);
  const [walletItems, setWalletItems] = useState([]);

  const [usableItems, setUsableItems] = useState([]);
  const [usedItems, setUsedItems] = useState([]);
  const [expiredItems, setExpiredItems] = useState([]);

  const savedIds = useMemo(() => {
    const all = [...usableItems, ...usedItems, ...expiredItems];

    return new Set(
      all
        .map((item) => item?.MaKhuyenMai || item?.KhuyenMai?.MaKhuyenMai)
        .filter(Boolean),
    );
  }, [usableItems, usedItems, expiredItems]);

  const fetchCounters = async () => {
    const [usableRes, usedRes, expiredRes] = await Promise.allSettled([
      axios.get(`${API_BASE}/vouchers/me?tab=usable`, authHeader()),
      axios.get(`${API_BASE}/vouchers/me?tab=used`, authHeader()),
      axios.get(`${API_BASE}/vouchers/me?tab=expired`, authHeader()),
    ]);

    if (usableRes.status === 'fulfilled') {
      setUsableItems(usableRes.value.data?.vouchers || []);
    }

    if (usedRes.status === 'fulfilled') {
      setUsedItems(usedRes.value.data?.vouchers || []);
    }

    if (expiredRes.status === 'fulfilled') {
      setExpiredItems(expiredRes.value.data?.vouchers || []);
    }
  };

  const fetchData = async (nextTab = tab) => {
    setLoading(true);

    try {
      await fetchCounters();

      if (nextTab === 'available') {
        const res = await axios.get(`${API_BASE}/promotions`);
        setAvailablePromos(res.data?.vouchers || []);
      } else {
        const res = await axios.get(
          `${API_BASE}/vouchers/me?tab=${nextTab}`,
          authHeader(),
        );
        setWalletItems(res.data?.vouchers || []);
      }
    } catch (err) {
      message.error(err.response?.data?.message || 'Không thể tải ví khuyến mại!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(tab);
  }, [tab]);

  const source =
    tab === 'available'
      ? availablePromos.map((promo) => ({ promo, wallet: null }))
      : walletItems.map((item) => ({ promo: getPromo(item), wallet: item }));

  const visibleVouchers = source.filter(({ promo }) => {
    const q = keyword.trim().toLowerCase();

    if (!q) return true;

    return (
      promo?.TenKhuyenMai?.toLowerCase().includes(q) ||
      promo?.MaCode?.toLowerCase().includes(q) ||
      getCategoryName(promo).toLowerCase().includes(q)
    );
  });

  const handleSaveVoucher = async (promo) => {
    setSavingId(promo.MaKhuyenMai);

    try {
      await axios.post(
        `${API_BASE}/vouchers/save-voucher`,
        {
          idPromotion: promo.MaKhuyenMai,
        },
        authHeader(),
      );

      message.success('Đã lưu voucher vào ví!');
      await fetchData(tab);
    } catch (err) {
      message.error(err.response?.data?.message || 'Không thể lưu voucher!');
    } finally {
      setSavingId(null);
    }
  };

  const handleDeleteVoucher = async (walletItem) => {
    setDeletingId(walletItem.MaVi);

    try {
      await axios.delete(`${API_BASE}/vouchers/${walletItem.MaVi}`, authHeader());
      message.success('Đã xoá voucher khỏi ví!');
      await fetchData(tab);
    } catch (err) {
      message.error(err.response?.data?.message || 'Không thể xoá voucher!');
    } finally {
      setDeletingId(null);
    }
  };

  const handleCopyCode = async (code) => {
    if (!code) {
      message.warning('Voucher này chưa có mã code!');
      return;
    }

    await navigator.clipboard.writeText(code);
    message.success(`Đã sao chép mã ${code}`);
  };

  const handleUseVoucher = (promo) => {
    localStorage.setItem('pending_apply_voucher', JSON.stringify(promo));
    message.success('Đã chọn voucher, hãy chọn sản phẩm trong giỏ hàng để thanh toán!');
    navigate('/cart');
  };

  return (
    <div className={`${styles.walletBox} ${compact ? styles.compact : ''}`}>
      <div className={styles.walletHeader}>
        <div>
          <h2 className={styles.title}>
            <WalletOutlined /> Ví khuyến mại
          </h2>
          <p className={styles.subTitle}>
            Quản lý voucher đang có, đã dùng và hết hạn.
          </p>
        </div>

        <Tooltip title="Tải lại">
          <Button icon={<ReloadOutlined />} onClick={() => fetchData(tab)} />
        </Tooltip>
      </div>

      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <span>Đang có</span>
          <strong>{usableItems.length}</strong>
        </div>

        <div className={styles.statCard}>
          <span>Đã dùng</span>
          <strong>{usedItems.length}</strong>
        </div>

        <div className={styles.statCard}>
          <span>Hết hạn</span>
          <strong>{expiredItems.length}</strong>
        </div>
      </div>

      <div className={styles.toolbar}>
        <Segmented
          value={tab}
          onChange={setTab}
          options={[
            {
              label: 'Ưu đãi mới',
              value: 'available',
            },
            {
              label: 'Đang có',
              value: 'usable',
            },
            {
              label: 'Đã dùng',
              value: 'used',
            },
            {
              label: 'Hết hạn',
              value: 'expired',
            },
          ]}
        />

        <Input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          prefix={<SearchOutlined />}
          allowClear
          placeholder="Tìm tên hoặc mã voucher..."
          className={styles.searchInput}
        />
      </div>

      {loading ? (
        <div className={styles.loadingWrap}>
          <Spin />
          <span>Đang tải ví khuyến mại...</span>
        </div>
      ) : visibleVouchers.length === 0 ? (
        <div className={styles.emptyWrap}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Không có voucher phù hợp"
          />
        </div>
      ) : (
        <div className={styles.voucherList}>
          {visibleVouchers.map(({ promo, wallet }) => {
            const type = getVoucherType(promo);
            const saved = savedIds.has(promo.MaKhuyenMai);
            const outOfStock = Number(promo.SoLuong || 0) <= 0;

            return (
              <div
                key={`${promo.MaKhuyenMai}-${wallet?.MaVi || tab}`}
                className={styles.voucherCard}
              >
                <div className={styles.voucherLeft}>
                  <div className={styles.iconCircle}>{type.icon}</div>
                  <span>{type.label}</span>
                </div>

                <div className={styles.voucherBody}>
                  <div className={styles.cardTop}>
                    <Tag color={type.color} icon={type.icon}>
                      {type.label}
                    </Tag>

                    {tab === 'usable' && <Tag color="green">Đang có</Tag>}
                    {tab === 'used' && <Tag color="default">Đã dùng</Tag>}
                    {tab === 'expired' && <Tag color="red">Hết hạn</Tag>}

                    {tab === 'available' && saved && (
                      <Tag color="green" icon={<CheckCircleOutlined />}>
                        Đã lưu
                      </Tag>
                    )}
                  </div>

                  <h3>{promo.TenKhuyenMai}</h3>

                  <div className={styles.value}>{getVoucherValue(promo)}</div>

                  <div className={styles.conditionList}>
                    {Number(promo.GiaTriToiThieu || 0) > 0 && (
                      <span>Đơn tối thiểu {fmt(promo.GiaTriToiThieu)}</span>
                    )}

                    {Number(promo.GiamToiDa || 0) > 0 && (
                      <span>Giảm tối đa {fmt(promo.GiamToiDa)}</span>
                    )}
                    <span>Áp dụng: {getCategoryName(promo)}</span>
                    <span>{getExpireText(promo)}</span>
                  </div>

                  <div className={styles.codeRow}>
                    <code>{promo.MaCode || 'Không có mã'}</code>

                    <Button
                      size="small"
                      type="text"
                      icon={<CopyOutlined />}
                      onClick={() => handleCopyCode(promo.MaCode)}
                    >
                      Sao chép
                    </Button>
                  </div>
                </div>

                <div className={styles.actions}>
                  {tab === 'available' && (
                    <Button
                      type="primary"
                      disabled={saved || outOfStock}
                      loading={savingId === promo.MaKhuyenMai}
                      onClick={() => handleSaveVoucher(promo)}
                      icon={saved ? <CheckCircleOutlined /> : null}
                      className={
                        saved
                          ? styles.savedBtn
                          : outOfStock
                            ? styles.outOfStockBtn
                            : styles.primaryBtn
                      }
                    >
                      {saved ? 'Đã lưu' : outOfStock ? 'Hết lượt' : 'Lưu mã'}
                    </Button>
                  )}

                  {tab === 'usable' && (
                    <Button
                      type="primary"
                      icon={<ShoppingCartOutlined />}
                      onClick={() => handleUseVoucher(promo)}
                      className={styles.primaryBtn}
                    >
                      Dùng ngay
                    </Button>
                  )}

                  {wallet?.MaVi && (
                    <Popconfirm
                      title="Xoá voucher khỏi ví?"
                      description="Voucher này sẽ không còn hiển thị trong ví của bạn."
                      okText="Xoá"
                      cancelText="Huỷ"
                      okButtonProps={{ danger: true }}
                      onConfirm={() => handleDeleteVoucher(wallet)}
                    >
                      <Button
                        danger
                        icon={<DeleteOutlined />}
                        loading={deletingId === wallet.MaVi}
                      >
                        Xoá
                      </Button>
                    </Popconfirm>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}