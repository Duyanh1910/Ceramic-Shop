import { useState, useEffect } from 'react';
import {
  Tabs, Tag, Table, Button, Empty, Spin, Modal,
  Steps, Descriptions, message, Select, Input, Space, DatePicker
} from 'antd';
import {
  ShoppingOutlined, ArrowLeftOutlined, EyeOutlined,
  CloseCircleOutlined, FileTextOutlined, CarOutlined,
  CheckCircleOutlined, ClockCircleOutlined, StopOutlined,
  EditOutlined, SearchOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import styles from './OrderTracking.module.css'; // Thay đổi import CSS cho phù hợp với dự án của bạn

const { Search } = Input;
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

  // State quản lý danh sách & bộ lọc
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  
  // State của các bộ lọc (Filters)
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [dateRange, setDateRange] = useState(['', '']); // ['startDate', 'endDate']
  
  // State Modal
  const [detailModal, setDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  
  const [updateModal, setUpdateModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [newStatus, setNewStatus] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);

  // useEffect sẽ tự động gọi lại API mỗi khi 1 trong 4 bộ lọc này thay đổi
  useEffect(() => {
    fetchOrders();
  }, [page, activeTab, searchText, dateRange]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = {
        page: page,
        limit: 10, // Số đơn trên 1 trang
        search: searchText || "",
      };
      
      if (activeTab !== 'all') params.status = activeTab;
      if (dateRange[0]) params.startDate = dateRange[0];
      if (dateRange[1]) params.endDate = dateRange[1];

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

  // --- CÁC HÀM XỬ LÝ SỰ KIỆN ĐỔI BỘ LỌC ---
  const handleSearch = (value) => {
    setSearchText(value);
    setPage(1); // Khi tìm kiếm mới thì quay về trang 1
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
    setPage(1);
  };

  const handleDateChange = (dates, dateStrings) => {
    // dateStrings là mảng ['YYYY-MM-DD', 'YYYY-MM-DD']
    setDateRange(dateStrings);
    setPage(1);
  };

  const handleTableChange = (pagination) => {
    setPage(pagination.current);
  };

  // --- CÁC HÀM XỬ LÝ API KHÁC (Chi tiết, Cập nhật) ---
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
      fetchOrders(); // Tải lại danh sách
    } catch (err) {
      message.error(err.response?.data?.message || 'Không thể cập nhật trạng thái!');
    } finally {
      setUpdateLoading(false);
    }
  };

  // --- CẤU HÌNH GIAO DIỆN ---
  const tabItems = ORDER_STATUS.map((s) => ({
    key: s.value === undefined ? 'all' : String(s.value),
    label: s.label,
  }));

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
      render: (v) => new Date(v).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'SDT',
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'TongThanhToan',
      render: (v) => <span className={styles.amount}>{fmt(v)}</span>,
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
      width: 200,
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

      {}
      <header className={styles.topHeader}>
        <div className={styles.logo} onClick={() => navigate('/')}>CERAMIC-SHOP</div>
        <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => navigate('/')}>
          Về trang chủ
        </Button>
      </header>

      <div className={styles.mainContent}>
        <div className={styles.container}>
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}><ShoppingOutlined /> Quản lý Đơn hàng</h1>
            <p className={styles.pageSub}>Theo dõi và quản lý tất cả đơn hàng</p>
          </div>

          <div className={styles.card}>
            {}
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
              <Tabs
                activeKey={activeTab}
                onChange={handleTabChange}
                items={tabItems}
                style={{ flex: 1, minWidth: '300px' }}
              />
              
              <Space style={{ marginBottom: '14px' }}>
                <RangePicker 
                  placeholder={['Từ ngày', 'Đến ngày']} 
                  format="YYYY-MM-DD"
                  onChange={handleDateChange}
                  allowClear
                />
                <Search
                  placeholder="Tìm mã đơn, SĐT..."
                  allowClear
                  enterButton={<SearchOutlined />}
                  onSearch={handleSearch}
                  style={{ width: 250 }}
                />
              </Space>
            </div>

            {loading ? (
              <div className={styles.loadingWrap}><Spin size="large" /></div>
            ) : (
              <Table
                dataSource={orders}
                columns={columns}
                rowKey="MaHienThi"
                // CẤU HÌNH PHÂN TRANG (Pagination)
                onChange={handleTableChange}
                pagination={{
                  current: page,
                  pageSize: 10,
                  total: total,
                  showTotal: (t) => `Tổng ${t} đơn hàng`,
                  showSizeChanger: false,
                  position: ['bottomCenter'], // Đặt thanh phân trang ở giữa phía dưới
                }}
                locale={{ emptyText: 'Không tìm thấy đơn hàng nào phù hợp' }}
                size="middle"
                scroll={{ x: 800 }}
              />
            )}
          </div>
        </div>
      </div>

      {}
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
        <div style={{ marginBottom: 16 }}>Mã đơn hàng: <strong>#{editingOrder?.MaHienThi}</strong></div>
        <div style={{ marginBottom: 8 }}>Chọn trạng thái mới:</div>
        <Select style={{ width: '100%' }} value={newStatus} onChange={(val) => setNewStatus(val)}>
          {ORDER_STATUS.filter(s => s.value !== undefined).map(status => (
            <Option key={status.value} value={status.value}>{status.label}</Option>
          ))}
        </Select>
      </Modal>

      {}
    </div>
  );
}