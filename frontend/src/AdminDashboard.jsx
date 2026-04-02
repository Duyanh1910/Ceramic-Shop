import { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Tag, Statistic, Spin, Avatar, Button, Modal, Select, message } from 'antd';
import {
  ShoppingOutlined, TeamOutlined, DollarOutlined,
  FileTextOutlined, RiseOutlined, ClockCircleOutlined, EditOutlined
} from '@ant-design/icons';
import axios from 'axios';
import styles from './AdminDashboard.module.css';

const API_BASE = 'https://ceramic-shop-u8ak.onrender.com/api/v1';
const fmt = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

const ORDER_STATUS = {
  0: { label: 'Chờ xác nhận', color: 'gold' },
  1: { label: 'Đang chuẩn bị', color: 'blue' },
  2: { label: 'Đang giao', color: 'cyan' },
  3: { label: 'Hoàn thành', color: 'green' },
  4: { label: 'Đã huỷ', color: 'red' },
};

export default function AdminDashboard() {
  const [stats, setStats] = useState({});
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [updateModal, setUpdateModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [newStatus, setNewStatus] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  
  const token = localStorage.getItem('customer_token') || localStorage.getItem('token');
  const axiosConfig = { 
    headers: { Authorization: `Bearer ${token}` },
    withCredentials: true 
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ordersRes, customersRes, productsRes] = await Promise.allSettled([
        axios.get(`${API_BASE}/admin/orders?page=1&limit=5`, axiosConfig),
        axios.get(`${API_BASE}/admin/customers?page=1&limit=1`, axiosConfig),
        axios.get(`${API_BASE}/products?page=1&limit=1`, axiosConfig),
      ]);

      if (ordersRes.status === 'fulfilled') {
        setRecentOrders(ordersRes.value.data?.result?.orders || []);
        setStats((prev) => ({ ...prev, totalOrders: ordersRes.value.data?.result?.totalItems || 0 }));
      }
      if (customersRes.status === 'fulfilled') {
        setStats((prev) => ({ ...prev, totalCustomers: customersRes.value.data?.result?.total || 0 }));
      }
      if (productsRes.status === 'fulfilled') {
        setStats((prev) => ({ ...prev, totalProducts: productsRes.value.data?.result?.total || 0 }));
      }
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu dashboard:", error);
    } finally {
      setLoading(false);
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
        axiosConfig
      );
      message.success('Cập nhật trạng thái thành công!');
      setUpdateModal(false);
      fetchData(); 
    } catch (err) {
      message.error(err.response?.data?.message || 'Không thể cập nhật trạng thái!');
    } finally {
      setUpdateLoading(false);
    }
  };

  const statCards = [
    { title: 'Tổng đơn hàng', value: stats?.totalOrders ?? '—', icon: <FileTextOutlined />, color: '#1b437c', bg: '#e8f0fe' },
    { title: 'Khách hàng', value: stats?.totalCustomers ?? '—', icon: <TeamOutlined />, color: '#52c41a', bg: '#f6ffed' },
    { title: 'Sản phẩm', value: stats?.totalProducts ?? '—', icon: <ShoppingOutlined />, color: '#c48c46', bg: '#fff8e6' },
    { title: 'Doanh thu tháng', value: '—', icon: <DollarOutlined />, color: '#e74c3c', bg: '#fff1f0', prefix: '' },
  ];

  const columns = [
    {
      title: 'Mã đơn',
      dataIndex: 'MaHienThi',
      width: 130,
      render: (v) => <span className={styles.orderId}>#{v}</span>,
    },
    {
      title: 'Khách hàng',
      dataIndex: 'TenNguoiNhan',
      render: (v) => (
        <div className={styles.customerCell}>
          <Avatar size={28} className={styles.customerAvatar}>{v?.[0]}</Avatar>
          <span>{v}</span>
        </div>
      ),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'TongThanhToan',
      render: (v) => <span className={styles.amount}>{fmt(v)}</span>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'TrangThaiDonHang',
      render: (v) => (
        <Tag color={ORDER_STATUS[v]?.color}>{ORDER_STATUS[v]?.label}</Tag>
      ),
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'NgayDat',
      render: (v) => new Date(v).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Thao tác',
      width: 120,
      render: (_, row) => (
        <Button 
          size="small" 
          type="primary" 
          ghost 
          icon={<EditOutlined />}
          onClick={() => openUpdateModal(row)}
        >
          Cập nhật
        </Button>
      ),
    },
  ];

  return (
    <div className={styles.wrapper}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Tổng quan</h1>
          <p className={styles.pageSub}>
            <ClockCircleOutlined /> {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {loading ? (
        <div className={styles.loadingWrap}><Spin size="large" /></div>
      ) : (
        <>
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

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Đơn hàng gần đây</h2>
            </div>
            <div className={styles.tableWrap}>
              <Table
                dataSource={recentOrders}
                columns={columns}
                rowKey="MaHienThi"
                pagination={false}
                size="middle"
                className={styles.table}
                locale={{ emptyText: 'Chưa có đơn hàng nào' }}
              />
            </div>
          </div>
        </>
      )}

      {/* Modal Cập nhật trạng thái */}
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
        <div style={{ marginBottom: 16 }}>
          Mã đơn hàng: <strong>#{editingOrder?.MaHienThi}</strong>
        </div>
        <div style={{ marginBottom: 8 }}>Chọn trạng thái mới:</div>
        <Select
          style={{ width: '100%' }}
          value={newStatus}
          onChange={(val) => setNewStatus(val)}
        >
          {Object.entries(ORDER_STATUS).map(([key, value]) => (
            <Select.Option key={key} value={Number(key)}>
              {value.label}
            </Select.Option>
          ))}
        </Select>
      </Modal>
    </div>
  );
}