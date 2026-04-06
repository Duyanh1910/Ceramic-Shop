import { useState, useEffect } from 'react';
import { Row, Col, Select, Radio, Table, Tag, Spin } from 'antd';
import {
  BarChartOutlined, RiseOutlined,
  TeamOutlined, DollarOutlined, CalendarOutlined,
  EyeOutlined, StarOutlined, FireOutlined
} from '@ant-design/icons';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import axios from 'axios';
import styles from './AdminReports.module.css';

const API_BASE = 'https://ceramic-shop-u8ak.onrender.com/api/v1/admin/statistics';

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

export default function AdminReports() {
  const [mode, setMode] = useState('year');
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [quarter, setQuarter] = useState(1);
  
  const [chartData, setChartData] = useState([]);
  const [summary, setSummary] = useState({ revenue: 0, orders: 0, customers: 0, avgOrder: 0 });
  const [loading, setLoading] = useState(false);


  const [bestSellers, setBestSellers] = useState([]);
  const [mostViewed, setMostViewed] = useState([]);
  const [topRatings, setTopRatings] = useState([]);

  const axiosConfig = { withCredentials: true };

  useEffect(() => {
    fetchData();
  }, [mode, year, month, quarter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      
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

      
      const [resBest, resView, resRate] = await Promise.all([
        axios.get(`${API_BASE}/best-sellers`, axiosConfig).catch(() => ({ data: {} })),
        axios.get(`${API_BASE}/most-viewed`, axiosConfig).catch(() => ({ data: {} })),
        axios.get(`${API_BASE}/ratings`, axiosConfig).catch(() => ({ data: {} }))
      ]);

      
      if (resBest.data?.success) {
        const list = resBest.data.result || [];
        const totalSold = list.reduce((sum, item) => sum + Number(item.TongDaBan), 0);
        
        const formattedBest = list.map(item => ({
          ...item,
          percent: totalSold > 0 ? Math.round((Number(item.TongDaBan) / totalSold) * 100) : 0
        }));
        setBestSellers(formattedBest.slice(0, 10)); 
      }

      
      if (resView.data?.success) {
        setMostViewed(resView.data.result.slice(0, 10)); 
      }

      
      if (resRate.data?.success) {
        setTopRatings(resRate.data.result.slice(0, 10)); 
      }

    } catch (error) {
      console.error("Lỗi khi tải dữ liệu thống kê:", error);
    } finally {
      setLoading(false);
    }
  };

  const periodLabel = () => {
    if (mode === 'month') return `Tháng ${month}/${year}`;
    if (mode === 'quarter') return `${QUARTERS.find((q) => q.value === quarter)?.label} - ${year}`;
    return `Năm ${year}`;
  };

  

  const bestSellerColumns = [
    { title: '#', render: (_, __, i) => <span className={styles.rank}>{i + 1}</span>, width: 44 },
    {
      title: 'Sản phẩm',
      dataIndex: 'TenSanPham',
      render: (v) => <span className={styles.productName}>{v}</span>,
    },
    {
      title: 'Đã bán',
      dataIndex: 'TongDaBan',
      render: (v) => <Tag color="volcano"><FireOutlined /> {v} SP</Tag>,
    },
    {
      title: 'Tỉ trọng',
      dataIndex: 'percent',
      render: (v) => (
        <div className={styles.barWrap}>
          <div className={styles.barFill} style={{ width: `${v * 3}px` }} />
          <span>{v}%</span>
        </div>
      ),
    },
  ];

  const mostViewedColumns = [
    { title: '#', render: (_, __, i) => <span className={styles.rankView}>{i + 1}</span>, width: 44 },
    {
      title: 'Sản phẩm',
      render: (record) => (
        <div className={styles.flexCenter}>
          {record.Thumbnail ? <img src={record.Thumbnail} alt="thumbnail" className={styles.productImage} /> : <div className={styles.noImg}></div>}
          <div>
            <div className={styles.productName}>{record.TenSanPham}</div>
            <div style={{ fontSize: 11, color: '#888' }}>{record.ThuongHieu}</div>
          </div>
        </div>
      )
    },
    {
      title: 'Lượt xem',
      dataIndex: 'LuotXem',
      render: (v) => <Tag color="geekblue"><EyeOutlined /> {v}</Tag>,
    }
  ];

  const ratingColumns = [
    { title: '#', render: (_, __, i) => <span className={styles.rankStar}>{i + 1}</span>, width: 44 },
    {
      title: 'Sản phẩm',
      render: (record) => (
        <div className={styles.flexCenter}>
          {record.Thumbnail ? <img src={record.Thumbnail} alt="thumbnail" className={styles.productImage} /> : <div className={styles.noImg}></div>}
          <span className={styles.productName}>{record.TenSanPham || `Sản phẩm ID: ${record.MaSanPham}`}</span>
        </div>
      )
    },
    {
      title: 'Điểm TB',
      dataIndex: 'DiemTrungBinh',
      render: (v) => <span className={styles.starText}><StarOutlined /> {Number(v).toFixed(1)}</span>,
    },
    {
      title: 'Số lượt ĐG',
      dataIndex: 'TongDanhGia',
      render: (v) => <Tag color="green">{v}</Tag>,
    }
  ];

  
  const pieData = bestSellers.slice(0, 5).map((p) => ({ 
    name: p.TenSanPham.split(' ').slice(0, 3).join(' ') + '...', 
    value: p.percent || 1 
  }));

  

  return (
    <div className={styles.wrapper}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Báo cáo & Thống kê</h1>
          <p className={styles.pageSub}><CalendarOutlined /> {periodLabel()}</p>
        </div>

        <div className={styles.filters}>
          <Radio.Group value={mode} onChange={(e) => setMode(e.target.value)} optionType="button" buttonStyle="solid" className={styles.modeGroup}>
            <Radio.Button value="month">Tháng</Radio.Button>
            <Radio.Button value="quarter">Quý</Radio.Button>
            <Radio.Button value="year">Năm</Radio.Button>
          </Radio.Group>
          {mode === 'month' && (
            <Select value={month} onChange={setMonth} className={styles.filterSelect}>
              {MONTHS.map((m) => <Select.Option key={m.value} value={m.value}>{m.label}</Select.Option>)}
            </Select>
          )}
          {mode === 'quarter' && (
            <Select value={quarter} onChange={setQuarter} className={styles.filterSelect}>
              {QUARTERS.map((q) => <Select.Option key={q.value} value={q.value}>{q.label}</Select.Option>)}
            </Select>
          )}
          <Select value={year} onChange={setYear} className={styles.filterSelect}>
            {YEARS.map((y) => <Select.Option key={y} value={y}>{y}</Select.Option>)}
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
                  <div className={styles.summaryIcon} style={{ background: card.bg, color: card.color }}>{card.icon}</div>
                  <div>
                    <div className={styles.summaryLabel}>{card.title}</div>
                    <div className={styles.summaryValue} style={{ color: card.color }}>{card.value}</div>
                  </div>
                </div>
              </Col>
            ))}
          </Row>

          {/* DÒNG 2: BIỂU ĐỒ */}
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
                    <Tooltip formatter={(v) => [fmt(v), 'Doanh thu']} contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }} />
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
                    <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }} />
                    <Legend />
                    <Line type="monotone" dataKey="orders" stroke="#1b437c" strokeWidth={2} dot={false} name="Đơn hàng" />
                    <Line type="monotone" dataKey="customers" stroke="#c48c46" strokeWidth={2} dot={false} name="Khách hàng" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Col>
          </Row>

          {/* DÒNG 3: BÁN CHẠY NHẤT & TỈ TRỌNG BÁN RA */}
          <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
            <Col xs={24} xl={16}>
              <div className={styles.chartCard}>
                <div className={styles.chartHeader}>
                  <span className={styles.chartTitle}>Top sản phẩm bán chạy</span>
                </div>
                <Table
                  dataSource={bestSellers}
                  columns={bestSellerColumns}
                  rowKey="MaSanPham"
                  pagination={false}
                  size="small"
                  className={styles.productTable}
                />
              </div>
            </Col>
            <Col xs={24} xl={8}>
              <div className={styles.chartCard}>
                <div className={styles.chartHeader}>
                  <span className={styles.chartTitle}>Tỉ trọng số lượng bán</span>
                </div>
                {pieData.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={260}>
                      <PieChart>
                        <Pie
                          data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={95}
                          paddingAngle={3} dataKey="value"
                          label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`} labelLine={false}
                        >
                          {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
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
                  </>
                ) : <div style={{padding: '50px 0', textAlign: 'center', color: '#999'}}>Không đủ dữ liệu vẽ biểu đồ</div>}
              </div>
            </Col>
          </Row>

          {/* DÒNG 4: LƯỢT XEM & ĐÁNH GIÁ */}
          <Row gutter={[16, 16]}>
            <Col xs={24} xl={12}>
              <div className={styles.chartCard}>
                <div className={styles.chartHeader}>
                  <span className={styles.chartTitle}>Sản phẩm xem nhiều nhất</span>
                </div>
                <Table
                  dataSource={mostViewed}
                  columns={mostViewedColumns}
                  rowKey="MaSanPham"
                  pagination={false}
                  size="small"
                  className={styles.productTable}
                />
              </div>
            </Col>
            <Col xs={24} xl={12}>
              <div className={styles.chartCard}>
                <div className={styles.chartHeader}>
                  <span className={styles.chartTitle}>Top đánh giá cao</span>
                </div>
                <Table
                  dataSource={topRatings}
                  columns={ratingColumns}
                  rowKey="MaSanPham"
                  pagination={false}
                  size="small"
                  className={styles.productTable}
                />
              </div>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
}