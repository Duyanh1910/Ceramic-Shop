import { useState, useEffect } from 'react';
import {
  Tabs, Tag, Table, Button, Empty, Spin, Modal,
  Descriptions, message, Select, Input, Space, DatePicker, Card, Row, Col
} from 'antd';
import {
  ShoppingOutlined, ArrowLeftOutlined, EyeOutlined,
  CloseCircleOutlined, FileTextOutlined, CarOutlined,
  CheckCircleOutlined, ClockCircleOutlined, StopOutlined,
  EditOutlined, SearchOutlined, TeamOutlined, DollarOutlined, RiseOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import styles from './AdminDashboard.module.css';

const { Option } = Select;
const { RangePicker } = DatePicker;

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

export default function AdminOrder() {
  const navigate = useNavigate();
  const token = localStorage.getItem('customer_token') || localStorage.getItem('token');
  
  const authHeader = { 
    headers: { Authorization: `Bearer ${token}` },
    withCredentials: true 
  };

  // --- STATE CHO THỐNG KÊ (STAT CARDS) ---
  const [stats, setStats] = useState({});

  // --- STATE CHO BẢNG ĐƠN HÀNG ---
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState('all');
  const [dateRange, setDateRange] = useState(['', '']);
  
  const [searchInput, setSearchInput] = useState(''); 
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [detailModal, setDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  const [updateModal, setUpdateModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [newStatus, setNewStatus] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);

  // --- HÀM LOAD THỐNG KÊ (Chạy 1 lần khi mở trang) ---
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [ordersRes, customersRes, productsRes] = await Promise.allSettled([
          axios.get(`${API_BASE}/admin/orders?page=1&limit=1`, authHeader), // Lấy tổng đơn hàng
          axios.get(`${API_BASE}/admin/customers?page=1&limit=1`, authHeader), // Lấy tổng khách
          axios.get(`${API_BASE}/products?page=1&limit=1`, authHeader), // Lấy tổng sản phẩm
        ]);

        let newStats = {};
        if (ordersRes.status === 'fulfilled') {
          newStats.totalOrders = ordersRes.value.data?.result?.totalItems || 0;
        }
        if (customersRes.status === 'fulfilled') {
          newStats.totalCustomers = customersRes.value.data?.result?.total || 0;
        }
        if (productsRes.status === 'fulfilled') {
          newStats.totalProducts = productsRes.value.data?.result?.total || 0;
        }
        setStats(newStats);
      } catch (error) {
        console.error('Lỗi load thống kê:', error);
      }
    };
    fetchStats();
  }, []);

  // --- CÁC HÀM XỬ LÝ ĐƠN HÀNG (Giữ nguyên) ---
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1); 
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    fetchOrders();
  }, [page, activeTab, debouncedSearch, dateRange]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = { page: page, limit: 10 };
      
      if (debouncedSearch) params.search = debouncedSearch;
      if (activeTab !== 'all') params.status = activeTab;
      if (dateRange && dateRange[0]) params.startDate = dateRange[0];
      if (dateRange && dateRange[1]) params.endDate = dateRange[1];

      const res = await axios.get(`${API_BASE}/admin/orders`, { 
        ...authHeader, 
        params: params 
      });

      setOrders(res.data?.result?.orders || []);
      setTotal(res.data?.result?.totalItems || 0);

    } catch (error) {
      console.error(error);
      message.error('Không thể tải danh sách đơn hàng!');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
    setPage(1);
  };

  const handleDateChange = (dates, dateStrings) => {
    if (dates) {
      setDateRange(dateStrings);
    } else {
      setDateRange(['', '']);
    }
    setPage(1);
  };

  const fetchOrderDetail = async (orderCode) => {
    try {
      const res = await axios.get(`${API_BASE}/orders/${orderCode}`, authHeader);
      setSelectedOrder(res.data?.result);
      setDetailModal(true);
    } catch {
      message.error('Không thể tải chi tiết đơn hàng!');
    }
  };

  const openUpdateModal = (order) => {
    setEditingOrder(order);
    setNewStatus(order.TrangThaiDonHang);
    setUpdateModal(true);
  };

  const handleUpdateStatus = async () => {
    if (!editingOrder) return;
    setUpdateLoading(true);
    try {
      await axios.put(
        `${API_BASE}/admin/orders/${editingOrder.MaHienThi}/status`, 
        { TrangThaiDonHang: newStatus }, 
        authHeader
      );
      message.success('Cập nhật trạng thái thành công!');
      setUpdateModal(false);
      fetchOrders(); 
    } catch (err) {
      message.error(err.response?.data?.message || 'Không thể cập nhật trạng thái!');
    } finally {
      setUpdateLoading(false);
    }
  };

  const tabItems = ORDER_STATUS.map((s) => ({
    key: s.value === undefined ? 'all' : String(s.value),
    label: s.label,
  }));

  // Cấu hình mảng dữ liệu cho 4 thẻ thống kê
  const statCards = [
    { title: 'Tổng đơn hàng', value: stats?.totalOrders ?? '—', icon: <FileTextOutlined />, color: '#1b437c', bg: '#e8f0fe' },
    { title: 'Khách hàng', value: stats?.totalCustomers ?? '—', icon: <TeamOutlined />, color: '#52c41a', bg: '#f6ffed' },
    { title: 'Sản phẩm', value: stats?.totalProducts ?? '—', icon: <ShoppingOutlined />, color: '#c48c46', bg: '#fff8e6' },
    { title: 'Doanh thu tháng', value: '—', icon: <DollarOutlined />, color: '#e74c3c', bg: '#fff1f0' },
  ];

  const columns = [
    {
      title: 'Mã đơn',
      dataIndex: 'MaHienThi',
      width: 140,
      render: (v) => <span className={styles.orderId}>#{v}</span>,
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'NgayDat',
      width: 110,
      render: (v) => new Date(v).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Khách hàng',
      dataIndex: 'TenNguoiNhan',
      render: (text, record) => (
        <div>
          <div className={styles.customerName}>{text}</div>
          <div className={styles.customerPhone}>{record.SDT}</div>
        </div>
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
        <Tag color={v === 1 ? 'green' : 'default'} bordered={false}>
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
      width: 220,
      align: 'center',
      render: (_, row) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />} onClick={() => fetchOrderDetail(row.MaHienThi)}>
            Chi tiết
          </Button>
          <Button size="small" type="primary" ghost icon={<EditOutlined />} onClick={() => openUpdateModal(row)}>
            Cập nhật
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className={styles.pageWrapper}>
      <Helmet><title>Quản lý Đơn hàng | Ceramic Shop</title></Helmet>

      {/* --- PHẦN HEADER --- */}
      <div className={styles.topHeader}>
        <div>
          <h1 className={styles.pageTitle}>
            <ShoppingOutlined /> Quản lý Đơn hàng
          </h1>
          <p className={styles.pageSub}>Theo dõi và quản lý tất cả đơn hàng hệ thống</p>
        </div>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/')}>
          Trang chủ
        </Button>
      </div>

      {/* --- THÊM PHẦN THẺ THỐNG KÊ Ở ĐÂY --- */}
      <Row gutter={[20, 20]} className={styles.statsRow}>
        {statCards.map((card, i) => (
          <Col xs={24} sm={12} xl={6} key={i}>
            <div className={styles.statCard}>
              <div className={styles.statIcon} style={{ background: card.bg, color: card.color }}>
                {card.icon}
              </div>
              <div className={styles.statInfo}>
                <div className={styles.statLabel}>{card.title}</div>
                <div className={styles.statValue} style={{ color: card.color }}>
                  {card.value}
                </div>
              </div>
              <RiseOutlined className={styles.trendIcon} />
            </div>
          </Col>
        ))}
      </Row>

      {/* --- PHẦN QUẢN LÝ ĐƠN HÀNG (GIỮ NGUYÊN) --- */}
      <Card bordered={false} className={styles.mainCard}>
        <Row gutter={[16, 16]} align="middle" className={styles.filterRow}>
          <Col xs={24} lg={12}>
            <Tabs
              activeKey={activeTab}
              onChange={handleTabChange}
              items={tabItems}
              className={styles.tabs}
            />
          </Col>
          <Col xs={24} lg={12} className={styles.filterControls}>
            <RangePicker 
              placeholder={['Từ ngày', 'Đến ngày']} 
              format="YYYY-MM-DD"
              onChange={handleDateChange}
              allowClear
              className={styles.datePicker}
            />
            <Input
              placeholder="Nhập mã đơn, SĐT khách..."
              prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
              allowClear
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className={styles.searchInput}
            />
          </Col>
        </Row>

        <div className={styles.tableWrap}>
          {loading ? (
            <div className={styles.loadingWrap}><Spin size="large" /></div>
          ) : (
            <Table
              dataSource={orders}
              columns={columns}
              rowKey="MaHienThi"
              onChange={(pagination) => setPage(pagination.current)}
              pagination={{
                current: page,
                pageSize: 10,
                total: total,
                showTotal: (t) => `Tổng ${t} đơn hàng`,
                showSizeChanger: false,
                position: ['bottomCenter'],
              }}
              locale={{ emptyText: <Empty description="Không tìm thấy đơn hàng nào" /> }}
              size="middle"
              scroll={{ x: 1000 }}
              bordered
              className={styles.table}
            />
          )}
        </div>
      </Card>

      {/* --- MODAL CẬP NHẬT TRẠNG THÁI --- */}
      <Modal
        title="Cập nhật trạng thái đơn hàng"
        open={updateModal}
        onOk={handleUpdateStatus}
        onCancel={() => setUpdateModal(false)}
        confirmLoading={updateLoading}
        okText="Lưu thay đổi"
        cancelText="Hủy"
        centered
      >
        <div className={styles.modalText}>
          Mã đơn hàng: <strong>#{editingOrder?.MaHienThi}</strong>
        </div>
        <div className={styles.modalLabel}>Chọn trạng thái mới:</div>
        <Select 
          className={styles.fullWidth} 
          value={newStatus} 
          onChange={(val) => setNewStatus(val)}
        >
          {ORDER_STATUS.filter(s => s.value !== undefined).map(status => (
            <Option key={status.value} value={status.value}>{status.label}</Option>
          ))}
        </Select>
      </Modal>

      {/* --- MODAL CHI TIẾT ĐƠN HÀNG --- */}
      <Modal
        open={detailModal}
        onCancel={() => setDetailModal(false)}
        footer={null}
        width={750}
        centered
        title={<span className={styles.modalTitle}>Chi tiết đơn hàng #{selectedOrder?.MaHienThi}</span>}
      >
        {selectedOrder && (
          <div>
            <Descriptions column={2} bordered size="small" className={styles.descriptions}>
              <Descriptions.Item label="Người nhận">{selectedOrder.TenNguoiNhan}</Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">{selectedOrder.SDT}</Descriptions.Item>
              <Descriptions.Item label="Địa chỉ" span={2}>{selectedOrder.DiaChiGiaoHang}</Descriptions.Item>
              <Descriptions.Item label="Ghi chú" span={2}>{selectedOrder.GhiChu || 'Không có'}</Descriptions.Item>
            </Descriptions>

            <div className={styles.productListTitle}>Danh sách sản phẩm:</div>
            <Table 
              dataSource={selectedOrder.ChiTietDonHangs} 
              rowKey="MaCTDH"
              pagination={false}
              size="small"
              className={styles.table}
              columns={[
                { 
                  title: 'Sản phẩm', 
                  render: (_, r) => r.BienTheSanPham?.SanPham?.TenSanPham 
                },
                { 
                  title: 'Phân loại', 
                  render: (_, r) => r.BienTheSanPham?.TenBienThe 
                },
                { 
                  title: 'SL', 
                  dataIndex: 'SoLuong',
                  width: 60,
                },
                { 
                  title: 'Thành tiền', 
                  dataIndex: 'ThanhTien',
                  render: (v) => fmt(v) 
                }
              ]}
            />
          </div>
        )}
      </Modal>
    </div>
  );
}