import { useState, useEffect } from 'react';
import {
  Tabs, Tag, Table, Button, Empty, Spin, Modal,
  Steps, Descriptions, message, Badge
} from 'antd';
import {
  ShoppingOutlined, ArrowLeftOutlined, EyeOutlined,
  CloseCircleOutlined, FileTextOutlined, CarOutlined,
  CheckCircleOutlined, ClockCircleOutlined, StopOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import styles from './OrderTracking.module.css';

const API_BASE = 'https://ceramic-shop-u8ak.onrender.com/api/v1';

const fmt = (p) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p ?? 0);

const ORDER_STATUS = [
  { value: undefined, label: 'Tất cả' },
  { value: 0, label: 'Chờ xác nhận' },
  { value: 1, label: 'Đang chuẩn bị' },
  { value: 2, label: 'Đang giao' },
  { value: 3, label: 'Hoàn thành' },
  { value: 4, label: 'Đã huỷ' },
];

const STATUS_CONFIG = {
  0: { color: 'gold',    label: 'Chờ xác nhận', icon: <ClockCircleOutlined /> },
  1: { color: 'blue',    label: 'Đang chuẩn bị', icon: <FileTextOutlined /> },
  2: { color: 'cyan',    label: 'Đang giao',      icon: <CarOutlined /> },
  3: { color: 'green',   label: 'Hoàn thành',     icon: <CheckCircleOutlined /> },
  4: { color: 'red',     label: 'Đã huỷ',         icon: <StopOutlined /> },
};

const TIMELINE_STEPS = [
  { title: 'Đặt hàng', description: 'Đơn hàng đã được tạo' },
  { title: 'Xác nhận', description: 'Đang chuẩn bị hàng' },
  { title: 'Đang giao', description: 'Đơn hàng đang trên đường' },
  { title: 'Hoàn thành', description: 'Đã giao thành công' },
];

export default function OrderTracking() {
  const navigate = useNavigate();
  const token = localStorage.getItem('customer_token') || localStorage.getItem('token');
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  const [allOrders, setAllOrders] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  
  const [detailModal, setDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  const statusFilter = activeTab === 'all' ? undefined : Number(activeTab);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterAndPaginate(allOrders, statusFilter, page);
  }, [allOrders, statusFilter, page]);

  const filterAndPaginate = (list, status, currentPage) => {
    const filtered = status !== undefined ? list.filter(o => o.TrangThaiDonHang === status) : list;
    setTotal(filtered.length);
    const start = (currentPage - 1) * 8;
    setOrders(filtered.slice(start, start + 8));
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/orders`, authHeader);
      setAllOrders(res.data?.result || []);
      setPage(1);
    } catch {
      message.error('Không thể tải danh sách đơn hàng!');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetail = async (orderCode) => {
    setDetailLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/orders/${orderCode}`, authHeader);
      setSelectedOrder(res.data?.result);
      setDetailModal(true);
    } catch {
      message.error('Không thể tải chi tiết đơn hàng!');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCancelOrder = async (orderCode) => {
    Modal.confirm({
      title: 'Xác nhận huỷ đơn hàng',
      content: 'Bạn có chắc chắn muốn huỷ đơn hàng này không?',
      okText: 'Huỷ đơn',
      okType: 'danger',
      cancelText: 'Quay lại',
      onOk: async () => {
        setCancelLoading(true);
        try {
          await axios.put(
            `${API_BASE}/orders/${orderCode}/cancel`, 
            { reason: 'Khách hàng thay đổi ý định' }, 
            authHeader
          );
          message.success('Huỷ đơn hàng thành công!');
          fetchOrders(); // Tải lại danh sách
          if (selectedOrder?.MaHienThi === orderCode) {
            setDetailModal(false);
          }
        } catch (err) {
          message.error(err.response?.data?.message || 'Không thể huỷ đơn hàng!');
        } finally {
          setCancelLoading(false);
        }
      },
    });
  };

  const getTimelineStep = (status) => {
    if (status === 4) return -1;
    return status;
  };

  const tabItems = ORDER_STATUS.map((s) => {
    const count = s.value === undefined 
      ? allOrders.length 
      : allOrders.filter(o => o.TrangThaiDonHang === s.value).length;
      
    return {
      key: s.value === undefined ? 'all' : String(s.value),
      label: (
        <span>
          {s.label}
          <Badge
            count={count}
            size="small"
            style={{ marginLeft: 6, background: '#1b437c' }}
          />
        </span>
      ),
    };
  });

  const columns = [
    {
      title: 'Mã đơn',
      dataIndex: 'MaHienThi',
      width: 120,
      render: (v) => <span className={styles.orderId}>#{v}</span>,
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'NgayDat',
      render: (v) => new Date(v).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Sản phẩm',
      dataIndex: 'ChiTietDonHangs',
      render: (items) => (
        <span className={styles.productCount}>
          {items?.length ?? 0} sản phẩm
        </span>
      ),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'TongThanhToan',
      render: (v) => <span className={styles.amount}>{fmt(v)}</span>,
    },
    {
      title: 'Thanh toán',
      dataIndex: 'TrangThaiThanhToan',
      render: (v) => (
        <Tag color={v === 1 ? 'green' : 'orange'}>
          {v === 1 ? 'Đã thanh toán' : 'Chưa thanh toán'}
        </Tag>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'TrangThaiDonHang',
      render: (v) => {
        const cfg = STATUS_CONFIG[v];
        return <Tag color={cfg?.color} icon={cfg?.icon}>{cfg?.label}</Tag>;
      },
    },
    {
      title: 'Thao tác',
      width: 140,
      render: (_, row) => (
        <div className={styles.actionCell}>
          <Button size="small" icon={<EyeOutlined />}
            onClick={() => fetchOrderDetail(row.MaHienThi)}
            loading={detailLoading}
            className={styles.btnView}>
            Chi tiết
          </Button>
          {row.TrangThaiDonHang === 0 && (
            <Button size="small" danger icon={<CloseCircleOutlined />}
              onClick={() => handleCancelOrder(row.MaHienThi)}>
              Huỷ
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className={styles.pageWrapper}>
      <Helmet><title>Đơn hàng của tôi | Ceramic Shop</title></Helmet>

      <header className={styles.topHeader}>
        <div className={styles.logo} onClick={() => navigate('/')}>CERAMIC-SHOP</div>
        <Button type="link" icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/')} className={styles.btnBack}>
          Về trang chủ
        </Button>
      </header>

      <div className={styles.mainContent}>
        <div className={styles.container}>
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>
              <ShoppingOutlined /> Đơn hàng của tôi
            </h1>
            <p className={styles.pageSub}>Theo dõi và quản lý tất cả đơn hàng của bạn</p>
          </div>

          <div className={styles.card}>
            <Tabs
              activeKey={activeTab}
              onChange={(key) => { setActiveTab(key); setPage(1); }}
              items={tabItems}
              className={styles.tabs}
            />

            {loading ? (
              <div className={styles.loadingWrap}><Spin size="large" /></div>
            ) : orders.length === 0 ? (
              <div className={styles.emptyWrap}>
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Bạn chưa có đơn hàng nào"
                >
                  <Button type="primary" className={styles.btnShop}
                    onClick={() => navigate('/')}>
                    Mua sắm ngay
                  </Button>
                </Empty>
              </div>
            ) : (
              <Table
                dataSource={orders}
                columns={columns}
                rowKey="MaHienThi"
                pagination={{
                  current: page,
                  pageSize: 8,
                  total,
                  onChange: setPage,
                  showTotal: (t) => `Tổng ${t} đơn hàng`,
                  showSizeChanger: false,
                }}
                className={styles.table}
                size="middle"
                scroll={{ x: 700 }}
              />
            )}
          </div>
        </div>
      </div>

      <Modal
        open={detailModal}
        onCancel={() => setDetailModal(false)}
        footer={null}
        width={720}
        centered
        title={
          <div className={styles.modalTitle}>
            <span>Chi tiết đơn hàng</span>
            {selectedOrder && (
              <span className={styles.modalOrderId}>#{selectedOrder.MaHienThi}</span>
            )}
          </div>
        }
      >
        {selectedOrder && (
          <div className={styles.detailBody}>

            {selectedOrder.TrangThaiDonHang !== 4 ? (
              <div className={styles.timelineWrap}>
                <Steps
                  current={getTimelineStep(selectedOrder.TrangThaiDonHang)}
                  size="small"
                  items={TIMELINE_STEPS.map((s, i) => ({
                    title: s.title,
                    description: i === getTimelineStep(selectedOrder.TrangThaiDonHang) ? s.description : '',
                  }))}
                  className={styles.timeline}
                />
              </div>
            ) : (
              <div className={styles.canceledBanner}>
                <StopOutlined /> Đơn hàng này đã bị huỷ
              </div>
            )}

            <div className={styles.detailSection}>
              <div className={styles.sectionTitle}>Thông tin giao hàng</div>
              <Descriptions column={1} size="small" className={styles.desc}>
                <Descriptions.Item label="Người nhận">
                  {selectedOrder.TenNguoiNhan}
                </Descriptions.Item>
                <Descriptions.Item label="Số điện thoại">
                  {selectedOrder.SDT}
                </Descriptions.Item>
                <Descriptions.Item label="Địa chỉ">
                  {selectedOrder.DiaChiGiaoHang}
                </Descriptions.Item>
                <Descriptions.Item label="Thanh toán">
                  {selectedOrder.MaPhuongThuc === 1 ? 'Thanh toán COD' : 
                   selectedOrder.MaPhuongThuc === 2 ? 'Chuyển khoản' : 'Ví điện tử'}
                </Descriptions.Item>
                {selectedOrder.GhiChu && (
                  <Descriptions.Item label="Ghi chú">
                    {selectedOrder.GhiChu}
                  </Descriptions.Item>
                )}
              </Descriptions>
            </div>

            <div className={styles.detailSection}>
              <div className={styles.sectionTitle}>Sản phẩm đã đặt</div>
              <div className={styles.productList}>
                {(selectedOrder.ChiTietDonHangs || []).map((item) => (
                  <div key={item.MaCTDH} className={styles.productItem}>
                    <img
                      src={item.BienTheSanPham?.SanPham?.Thumbnail || 'https://via.placeholder.com/60'}
                      alt={item.BienTheSanPham?.TenBienThe}
                      className={styles.productImg}
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/60'; }}
                    />
                    <div className={styles.productInfo}>
                      <div className={styles.productName}>
                        {item.BienTheSanPham?.SanPham?.TenSanPham}
                      </div>
                      <div className={styles.productVariant}>
                        Phân loại: {item.BienTheSanPham?.TenBienThe}
                      </div>
                      <div className={styles.productMeta}>
                        <span>{fmt(item.GiaBan)} × {item.SoLuong}</span>
                        <span className={styles.productTotal}>{fmt(item.ThanhTien)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.summaryBox}>
              <div className={styles.summaryRow}>
                <span>Tiền hàng</span>
                <span>{fmt(selectedOrder.TongTienHang)}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Phí vận chuyển</span>
                <span>{fmt(selectedOrder.TongPhiVanChuyen)}</span>
              </div>
              {selectedOrder.TongGiamGia > 0 && (
                <div className={styles.summaryRow} style={{ color: '#52c41a' }}>
                  <span>Giảm giá</span>
                  <span>-{fmt(selectedOrder.TongGiamGia)}</span>
                </div>
              )}
              <div className={styles.summaryTotal}>
                <span>Tổng thanh toán</span>
                <span className={styles.totalAmount}>{fmt(selectedOrder.TongThanhToan)}</span>
              </div>
            </div>

            {selectedOrder.TrangThaiDonHang === 0 && (
              <Button
                danger
                block
                icon={<CloseCircleOutlined />}
                loading={cancelLoading}
                onClick={() => handleCancelOrder(selectedOrder.MaHienThi)}
                className={styles.btnCancel}
              >
                Huỷ đơn hàng
              </Button>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}