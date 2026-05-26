import { useState, useEffect } from 'react';
import {
  Tabs, Tag, Table, Button, Empty, Spin, Modal,
  Descriptions, message, Select, Input, Space, DatePicker, Card, Row, Col, Divider, Avatar
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
  const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
  
  const authHeader = { 
    headers: { Authorization: `Bearer ${token}` },
    withCredentials: true 
  };

  const [stats, setStats] = useState({});

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

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [ordersRes, customersRes, productsRes] = await Promise.allSettled([
          axios.get(`${API_BASE}/admin/orders?page=1&limit=1`, authHeader),
          axios.get(`${API_BASE}/admin/customers?page=1&limit=1`, authHeader), 
          axios.get(`${API_BASE}/products?page=1&limit=1`, authHeader),
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

  useEffect(() => {
    const handleOrdersChanged = () => {
      fetchOrders();
    };

    window.addEventListener('admin:orders_changed', handleOrdersChanged);

    return () => {
      window.removeEventListener('admin:orders_changed', handleOrdersChanged);
    };
  }, [page, activeTab, debouncedSearch, dateRange]);

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
      const res = await axios.get(`${API_BASE}/admin/orders/${orderCode}`, authHeader);
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
      await axios.patch(
        `${API_BASE}/admin/orders/${editingOrder.MaHienThi}`, 
        { newStatus: newStatus }, 
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
      title: 'Người nhận',
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

      <Modal
        open={detailModal}
        onCancel={() => setDetailModal(false)}
        footer={null}
        width={850}
        centered
        title={<span className={styles.modalTitle}>Chi tiết đơn hàng #{selectedOrder?.MaHienThi}</span>}
      >
        {selectedOrder && (
          <div className={styles.detailWrap}>
            <Descriptions column={{ xxl: 2, xl: 2, lg: 2, md: 2, sm: 1, xs: 1 }} bordered size="small" className={styles.descriptions}>
              <Descriptions.Item label="Ngày đặt">
                {new Date(selectedOrder.NgayDat).toLocaleString('vi-VN')}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái đơn">
                 <Tag color={STATUS_CONFIG[selectedOrder.TrangThaiDonHang]?.color} icon={STATUS_CONFIG[selectedOrder.TrangThaiDonHang]?.icon}>
                    {STATUS_CONFIG[selectedOrder.TrangThaiDonHang]?.label}
                 </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Khách hàng">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {selectedOrder.KhachHang?.Avatar && (
                    <Avatar src={selectedOrder.KhachHang.Avatar} size="default" />
                  )}
                  <strong>{selectedOrder.TenNguoiNhan}</strong>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại"><strong>{selectedOrder.SDT}</strong></Descriptions.Item>
              <Descriptions.Item label="Địa chỉ" span={2}>{selectedOrder.DiaChiGiaoHang}</Descriptions.Item>
              <Descriptions.Item label="Ghi chú" span={2}>
                 {selectedOrder.GhiChu ? <span style={{ color: 'red' }}>{selectedOrder.GhiChu}</span> : 'Không có'}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            {selectedOrder.GiaoDichThanhToans && selectedOrder.GiaoDichThanhToans.length > 0 && (
              <>
                <div className={styles.sectionTitle}>Lịch sử thanh toán</div>
                <Table
                  dataSource={selectedOrder.GiaoDichThanhToans}
                  rowKey="MaGiaoDich"
                  pagination={{ pageSize: 5 }}
                  size="small"
                  className={styles.productTable}
                  columns={[
                    { 
                      title: 'Mã tham chiếu', 
                      dataIndex: 'MaThamChieu',
                      render: (v) => <span style={{ fontSize: '12px', color: '#8c8c8c' }}>{v}</span>
                    },
                    { 
                      title: 'Đối tác', 
                      render: (_, r) => r.DuLieuPhanHoi?.partnerCode || r.DuLieuPhanHoi?.vnp_BankCode || 'Hệ thống' 
                    },
                    { 
                      title: 'Số tiền', 
                      dataIndex: 'SoTien',
                      render: (v) => fmt(v) 
                    },
                    { 
                      title: 'Trạng thái', 
                      dataIndex: 'TrangThai',
                      render: (v) => (
                        <Tag color={v === 'SUCCESS' ? 'green' : v === 'PENDING' ? 'gold' : 'red'}>
                          {v}
                        </Tag>
                      )
                    },
                    { 
                      title: 'Thời gian', 
                      dataIndex: 'ThoiGianGiaoDich',
                      render: (v) => new Date(v).toLocaleString('vi-VN') 
                    }
                  ]}
                />
                <Divider />
              </>
            )}

            <div className={styles.sectionTitle}>Danh sách sản phẩm</div>
            <Table 
              dataSource={selectedOrder.ChiTietDonHangs} 
              rowKey="MaCTDH"
              pagination={false}
              size="small"
              className={styles.productTable}
              columns={[
                { 
                  title: 'Sản phẩm', 
                  render: (_, r) => (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                       <img src={r.BienTheSanPham?.SanPham?.Thumbnail} alt="product" width={40} height={40} style={{ objectFit: 'cover', borderRadius: 4 }} />
                       <span style={{ fontWeight: 500 }}>{r.BienTheSanPham?.SanPham?.TenSanPham}</span>
                    </div>
                  )
                },
                { 
                  title: 'Phân loại', 
                  render: (_, r) => <Tag>{r.BienTheSanPham?.TenBienThe}</Tag> 
                },
                { 
                  title: 'Đơn giá', 
                  dataIndex: 'GiaBan',
                  render: (v) => fmt(v) 
                },
                { 
                  title: 'SL', 
                  dataIndex: 'SoLuong',
                  width: 60,
                  align: 'center'
                },
                { 
                  title: 'Thành tiền', 
                  dataIndex: 'ThanhTien',
                  align: 'right',
                  render: (v) => <strong style={{ color: '#d9363e' }}>{fmt(v)}</strong> 
                }
              ]}
            />

            <Divider />

            <Row justify="space-between" align="bottom">
              <Col xs={24} md={12}>
                {selectedOrder.KhuyenMais && selectedOrder.KhuyenMais.length > 0 && (
                  <div className={styles.voucherBox}>
                    <div className={styles.voucherTitle}>Mã giảm giá đã áp dụng:</div>
                    {selectedOrder.KhuyenMais.map(km => (
                      <div key={km.MaCode} className={styles.voucherItem}>
                        <Tag color="gold">{km.MaCode}</Tag>
                        <span>(-{fmt(km.ChiTietKhuyenMaiDonHang?.SoTienChietKhau)})</span>
                      </div>
                    ))}
                  </div>
                )}
              </Col>
              
              <Col xs={24} md={12}>
                <div className={styles.summaryWrap}>
                  <div className={styles.summaryRow}>
                    <span>Tổng tiền hàng:</span>
                    <span>{fmt(selectedOrder.TongTienHang)}</span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span>Phí vận chuyển:</span>
                    <span>{fmt(selectedOrder.TongPhiVanChuyen)}</span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span>Tổng giảm giá:</span>
                    <span style={{ color: '#52c41a' }}>- {fmt(selectedOrder.TongGiamGia)}</span>
                  </div>
                  <Divider style={{ margin: '12px 0' }} />
                  <div className={styles.summaryTotal}>
                    <span>Tổng thanh toán:</span>
                    <span className={styles.totalAmount}>{fmt(selectedOrder.TongThanhToan)}</span>
                  </div>
                  
                  <div style={{ textAlign: 'right', marginTop: '8px' }}>
                    <Tag color={selectedOrder.TrangThaiThanhToan === 1 ? 'green' : 'default'} style={{ margin: 0, fontSize: '14px', padding: '4px 8px' }}>
                      {selectedOrder.TrangThaiThanhToan === 1 ? 'ĐÃ THANH TOÁN' : 'CHƯA THANH TOÁN'}
                    </Tag>
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
}
