import { useState, useEffect } from 'react';
import { Row, Col, Card, Select, Radio, Table, Tag, Spin, Statistic, Empty } from 'antd';
import {
  BarChartOutlined, RiseOutlined, ShoppingOutlined,
  TeamOutlined, DollarOutlined, CalendarOutlined,
} from '@ant-design/icons';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import axios from 'axios';
import styles from './AdminReports.module.css';

const API_BASE = 'https://ceramic-shop-u8ak.onrender.com/api/v1';

const COLORS = ['#1b437c', '#c48c46', '#52c41a', '#e74c3c', '#9b59b6', '#3498db'];

const fmt = (p) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p ?? 0);

const fmtShort = (p) => {
  if (p >= 1_000_000_000) return `${(p / 1_000_000_000).toFixed(1)}B`;
  if (p >= 1_000_000) return `${(p / 1_000_000).toFixed(1)}M`;
  if (p >= 1_000) return `${(p / 1_000).toFixed(0)}K`;
  return p;
};

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - i);
const MONTHS = Array.from({ length: 12 }, (_, i) => ({ label: `Tháng ${i + 1}`, value: i + 1 }));
const QUARTERS = [
  { label: 'Quý 1 (T1-T3)', value: 1, months: [1, 2, 3] },
  { label: 'Quý 2 (T4-T6)', value: 2, months: [4, 5, 6] },
  { label: 'Quý 3 (T7-T9)', value: 3, months: [7, 8, 9] },
  { label: 'Quý 4 (T10-T12)', value: 4, months: [10, 11, 12] },
];

function buildMockData(mode, year, month, quarter) {
  if (mode === 'month') {
    const days = new Date(year, month, 0).getDate();
    return Array.from({ length: days }, (_, i) => ({
      label: `${i + 1}/${month}`,
      revenue: Math.floor(Math.random() * 50_000_000) + 5_000_000,
      orders: Math.floor(Math.random() * 20) + 1,
      customers: Math.floor(Math.random() * 10) + 1,
    }));
  }
  if (mode === 'quarter') {
    const q = QUARTERS.find((q) => q.value === quarter);
    return q.months.map((m) => ({
      label: `Tháng ${m}`,
      revenue: Math.floor(Math.random() * 300_000_000) + 50_000_000,
      orders: Math.floor(Math.random() * 150) + 20,
      customers: Math.floor(Math.random() * 80) + 10,
    }));
  }
  return Array.from({ length: 12 }, (_, i) => ({
    label: `T${i + 1}`,
    revenue: Math.floor(Math.random() * 500_000_000) + 100_000_000,
    orders: Math.floor(Math.random() * 300) + 50,
    customers: Math.floor(Math.random() * 150) + 20,
  }));
}

function buildTopProducts() {
  return [
    { name: 'Tượng Cá chép hóa rồng', sold: 142, revenue: 120_700_000, percent: 22 },
    { name: 'Lục bình Công đào họa tiết nổi', sold: 87, revenue: 435_000_000, percent: 18 },
    { name: 'Tượng Thần Tài', sold: 203, revenue: 111_650_000, percent: 16 },
    { name: 'Tượng Di Lặc', sold: 95, revenue: 64_600_000, percent: 14 },
    { name: 'Bát hương hoa sen', sold: 176, revenue: 149_600_000, percent: 12 },
  ];
}

export default function AdminReports() {
  const [mode, setMode] = useState('year');
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [quarter, setQuarter] = useState(1);
  const [chartData, setChartData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({ revenue: 0, orders: 0, customers: 0, avgOrder: 0 });

  // ĐÃ FIX: Xóa localStorage cũ đi, chuẩn bị sẵn axiosConfig bằng Cookie cho sau này bạn nối API thật
  const axiosConfig = { withCredentials: true };

  useEffect(() => {
    fetchData();
  }, [mode, year, month, quarter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Hiện tại code đang dùng Dữ liệu giả (Mock Data).
      // Sau này bạn chỉ cần sửa chỗ này thành: await axios.get(`${API_BASE}/reports...`, axiosConfig)
      const data = buildMockData(mode, year, month, quarter);
      setChartData(data);

      const totalRevenue = data.reduce((s, d) => s + d.revenue, 0);
      const totalOrders = data.reduce((s, d) => s + d.orders, 0);
      const totalCustomers = data.reduce((s, d) => s + d.customers, 0);
      setSummary({
        revenue: totalRevenue,
        orders: totalOrders,
        customers: totalCustomers,
        avgOrder: totalOrders > 0 ? Math.floor(totalRevenue / totalOrders) : 0,
      });

      setTopProducts(buildTopProducts());
    } finally {
      setLoading(false);
    }
  };

  const periodLabel = () => {
    if (mode === 'month') return `Tháng ${month}/${year}`;
    if (mode === 'quarter') return `${QUARTERS.find((q) => q.value === quarter)?.label} - ${year}`;
    return `Năm ${year}`;
  };

  const productColumns = [
    { title: '#', render: (_, __, i) => <span className={styles.rank}>{i + 1}</span>, width: 44 },
    {
      title: 'Sản phẩm',
      dataIndex: 'name',
      render: (v) => <span className={styles.productName}>{v}</span>,
    },
    {
      title: 'Đã bán',
      dataIndex: 'sold',
      render: (v) => <Tag color="blue">{v}</Tag>,
    },
    {
      title: 'Doanh thu',
      dataIndex: 'revenue',
      render: (v) => <span className={styles.revenue}>{fmt(v)}</span>,
    },
    {
      title: 'Tỉ trọng',
      dataIndex: 'percent',
      render: (v) => (
        <div className={styles.barWrap}>
          <div className={styles.barFill} style={{ width: `${v * 4}px` }} />
          <span>{v}%</span>
        </div>
      ),
    },
  ];

  const pieData = topProducts.map((p) => ({ name: p.name.split(' ').slice(0, 3).join(' '), value: p.percent }));

  return (
    <div className={styles.wrapper}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Báo cáo & Thống kê</h1>
          <p className={styles.pageSub}><CalendarOutlined /> {periodLabel()}</p>
        </div>

        <div className={styles.filters}>
          <Radio.Group
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            optionType="button"
            buttonStyle="solid"
            className={styles.modeGroup}
          >
            <Radio.Button value="month">Tháng</Radio.Button>
            <Radio.Button value="quarter">Quý</Radio.Button>
            <Radio.Button value="year">Năm</Radio.Button>
          </Radio.Group>

          {mode === 'month' && (
            <Select value={month} onChange={setMonth} className={styles.filterSelect}>
              {MONTHS.map((m) => (
                <Select.Option key={m.value} value={m.value}>{m.label}</Select.Option>
              ))}
            </Select>
          )}

          {mode === 'quarter' && (
            <Select value={quarter} onChange={setQuarter} className={styles.filterSelect}>
              {QUARTERS.map((q) => (
                <Select.Option key={q.value} value={q.value}>{q.label}</Select.Option>
              ))}
            </Select>
          )}

          <Select value={year} onChange={setYear} className={styles.filterSelect}>
            {YEARS.map((y) => (
              <Select.Option key={y} value={y}>{y}</Select.Option>
            ))}
          </Select>
        </div>
      </div>

      {loading ? (
        <div className={styles.loadingWrap}><Spin size="large" /></div>
      ) : (
        <>
          <Row gutter={[16, 16]} className={styles.summaryRow}>
            {[
              { title: 'Doanh thu', value: fmt(summary.revenue), icon: <DollarOutlined />, color: '#1b437c', bg: '#e8f0fe' },
              { title: 'Đơn hàng', value: summary.orders, icon: <BarChartOutlined />, color: '#52c41a', bg: '#f6ffed' },
              { title: 'Khách hàng mới', value: summary.customers, icon: <TeamOutlined />, color: '#c48c46', bg: '#fff8e6' },
              { title: 'Giá trị TB/đơn', value: fmt(summary.avgOrder), icon: <RiseOutlined />, color: '#e74c3c', bg: '#fff1f0' },
            ].map((card, i) => (
              <Col xs={24} sm={12} xl={6} key={i}>
                <div className={styles.summaryCard}>
                  <div className={styles.summaryIcon} style={{ background: card.bg, color: card.color }}>
                    {card.icon}
                  </div>
                  <div>
                    <div className={styles.summaryLabel}>{card.title}</div>
                    <div className={styles.summaryValue} style={{ color: card.color }}>{card.value}</div>
                  </div>
                </div>
              </Col>
            ))}
          </Row>

          <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
            <Col xs={24} xl={16}>
              <div className={styles.chartCard}>
                <div className={styles.chartHeader}>
                  <span className={styles.chartTitle}>Doanh thu theo {periodLabel()}</span>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#888' }} />
                    <YAxis tickFormatter={fmtShort} tick={{ fontSize: 12, fill: '#888' }} />
                    <Tooltip
                      formatter={(v) => [fmt(v), 'Doanh thu']}
                      contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}
                    />
                    <Bar dataKey="revenue" fill="#1b437c" radius={[4, 4, 0, 0]} name="Doanh thu" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Col>

            <Col xs={24} xl={8}>
              <div className={styles.chartCard}>
                <div className={styles.chartHeader}>
                  <span className={styles.chartTitle}>Đơn hàng & Khách hàng</span>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#888' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#888' }} />
                    <Tooltip
                      contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="orders" stroke="#1b437c" strokeWidth={2} dot={false} name="Đơn hàng" />
                    <Line type="monotone" dataKey="customers" stroke="#c48c46" strokeWidth={2} dot={false} name="Khách hàng" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} xl={16}>
              <div className={styles.chartCard}>
                <div className={styles.chartHeader}>
                  <span className={styles.chartTitle}>Top sản phẩm bán chạy</span>
                </div>
                <Table
                  dataSource={topProducts}
                  columns={productColumns}
                  rowKey="name"
                  pagination={false}
                  size="small"
                  className={styles.productTable}
                />
              </div>
            </Col>

            <Col xs={24} xl={8}>
              <div className={styles.chartCard}>
                <div className={styles.chartHeader}>
                  <span className={styles.chartTitle}>Tỉ trọng doanh thu</span>
                </div>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={95}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => [`${v}%`, 'Tỉ trọng']} />
                  </PieChart>
                </ResponsiveContainer>
                <div className={styles.legend}>
                  {pieData.map((item, i) => (
                    <div key={i} className={styles.legendItem}>
                      <span className={styles.legendDot} style={{ background: COLORS[i % COLORS.length] }} />
                      <span className={styles.legendLabel}>{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
}