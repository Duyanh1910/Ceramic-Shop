import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Col,
  Radio,
  Row,
  Select,
  Spin,
  Table,
  Tag,
  message,
} from "antd";
import {
  BarChartOutlined,
  CalendarOutlined,
  DollarOutlined,
  DownloadOutlined,
  EyeOutlined,
  FireOutlined,
  RiseOutlined,
  StarOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import axios from "axios";
import { exportExcelReport } from "../Utility/excelExport";
import styles from "./AdminReports.module.css";
import { API_ADMIN_BASE } from "../config/api";

const API_BASE = `${API_ADMIN_BASE}/statistics`;

const COLORS = [
  "#1b437c",
  "#c48c46",
  "#52c41a",
  "#e74c3c",
  "#9b59b6",
  "#3498db",
];

const fmt = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value ?? 0);

const fmtShort = (value) => {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return value;
};

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, index) => currentYear - index);
const MONTHS = Array.from({ length: 12 }, (_, index) => ({
  label: `Tháng ${index + 1}`,
  value: index + 1,
}));
const QUARTERS = [
  { label: "Quý 1 (T1-T3)", value: 1, months: [1, 2, 3] },
  { label: "Quý 2 (T4-T6)", value: 2, months: [4, 5, 6] },
  { label: "Quý 3 (T7-T9)", value: 3, months: [7, 8, 9] },
  { label: "Quý 4 (T10-T12)", value: 4, months: [10, 11, 12] },
];

const getMonthName = (month) =>
  MONTHS.find((item) => item.value === month)?.label || "";

export default function AdminReports() {
  const [mode, setMode] = useState("year");
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [quarter, setQuarter] = useState(1);
  const [mostViewedOrder, setMostViewedOrder] = useState("DESC");

  const [chartData, setChartData] = useState([]);
  const [summary, setSummary] = useState({
    revenue: 0,
    orders: 0,
    customers: 0,
    avgOrder: 0,
  });
  const [loading, setLoading] = useState(false);
  const [exportingRevenue, setExportingRevenue] = useState(false);
  const [exportingMostViewed, setExportingMostViewed] = useState(false);

  const [bestSellers, setBestSellers] = useState([]);
  const [mostViewed, setMostViewed] = useState([]);
  const [topRatings, setTopRatings] = useState([]);

  const axiosConfig = { withCredentials: true };

  const getDateRange = () => {
    if (mode === "month") {
      const lastDay = new Date(year, month, 0).getDate();

      return {
        startDate: `${year}-${String(month).padStart(2, "0")}-01`,
        endDate: `${year}-${String(month).padStart(2, "0")}-${lastDay}`,
      };
    }

    if (mode === "quarter") {
      const startMonth = (quarter - 1) * 3 + 1;
      const endMonth = quarter * 3;
      const lastDay = new Date(year, endMonth, 0).getDate();

      return {
        startDate: `${year}-${String(startMonth).padStart(2, "0")}-01`,
        endDate: `${year}-${String(endMonth).padStart(2, "0")}-${lastDay}`,
      };
    }

    return {
      startDate: `${year}-01-01`,
      endDate: `${year}-12-31`,
    };
  };

  useEffect(() => {
    fetchData();
  }, [mode, year, month, quarter, mostViewedOrder]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { startDate, endDate } = getDateRange();

      const [resBest, resView, resRate, resOverview] = await Promise.all([
        axios
          .get(`${API_BASE}/best-sellers`, axiosConfig)
          .catch(() => ({ data: {} })),
        axios
          .get(`${API_BASE}/most-viewed`, {
            ...axiosConfig,
            params: { order: mostViewedOrder },
          })
          .catch(() => ({ data: {} })),
        axios
          .get(`${API_BASE}/ratings`, axiosConfig)
          .catch(() => ({ data: {} })),
        axios
          .post(`${API_BASE}/overview`, { startDate, endDate }, axiosConfig)
          .catch(() => ({ data: {} })),
      ]);

      if (resBest.data?.success) {
        const list = resBest.data.result || [];
        const totalSold = list.reduce(
          (sum, item) => sum + Number(item.TongDaBan || 0),
          0,
        );
        const formattedBest = list.map((item) => ({
          ...item,
          percent:
            totalSold > 0
              ? Math.round((Number(item.TongDaBan || 0) / totalSold) * 100)
              : 0,
        }));

        setBestSellers(formattedBest.slice(0, 10));
      }

      if (resView.data?.success) {
        setMostViewed((resView.data.result || []).slice(0, 10));
      }

      if (resRate.data?.success) {
        setTopRatings((resRate.data.result || []).slice(0, 10));
      }

      if (resOverview.data?.success) {
        const overviewData = resOverview.data.result;
        const revenue = Number(overviewData.summary.revenue || 0);
        const orders = Number(overviewData.summary.orders || 0);

        setChartData(overviewData.chartData || []);
        setSummary({
          revenue,
          orders,
          customers: overviewData.summary.customers,
          avgOrder: orders > 0 ? Math.floor(revenue / orders) : 0,
        });
      }
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu thống kê:", error);
      message.error("Không thể tải dữ liệu báo cáo.");
    } finally {
      setLoading(false);
    }
  };

  const periodLabel = () => {
    if (mode === "month") return `Tháng ${month}/${year}`;
    if (mode === "quarter") {
      return `${QUARTERS.find((item) => item.value === quarter)?.label} - ${year}`;
    }
    return `Năm ${year}`;
  };

  const revenueReportRows = useMemo(() => {
    const dailyRows = chartData.map((item, index) => {
      const [dayValue, monthValue] = String(item.label || "")
        .split("/")
        .map(Number);

      return {
        key: `${item.label}-${index}`,
        day: dayValue,
        month: monthValue,
        period: `Ngày ${item.label}/${year}`,
        periodShort: item.label,
        orders: Number(item.orders || 0),
        revenue: Number(item.revenue || 0),
      };
    });

    if (mode === "month") {
      return dailyRows;
    }

    const months =
      mode === "quarter"
        ? QUARTERS.find((item) => item.value === quarter)?.months || []
        : MONTHS.map((item) => item.value);

    return months.map((monthValue) => {
      const items = dailyRows.filter((item) => item.month === monthValue);
      const revenue = items.reduce((sum, item) => sum + item.revenue, 0);
      const orders = items.reduce((sum, item) => sum + item.orders, 0);

      return {
        key: `month-${monthValue}`,
        month: monthValue,
        period: `${getMonthName(monthValue)}/${year}`,
        periodShort: `T${monthValue}`,
        orders,
        revenue,
      };
    });
  }, [chartData, mode, quarter, year]);

  const revenueTotal = useMemo(
    () =>
      revenueReportRows.reduce(
        (total, item) => ({
          orders: total.orders + Number(item.orders || 0),
          revenue: total.revenue + Number(item.revenue || 0),
        }),
        { orders: 0, revenue: 0 },
      ),
    [revenueReportRows],
  );

  const revenueChartData = mode === "month" ? chartData : revenueReportRows;

  const downloadRevenueReport = async () => {
    setExportingRevenue(true);
    try {
      const { startDate, endDate } = getDateRange();
      await exportExcelReport({
        url: `${API_BASE}/total-revenue/export`,
        axiosConfig,
        params: {
          mode,
          year,
          month,
          quarter,
          startDate,
          endDate,
        },
        fileName: `bao-cao-doanh-thu-${Date.now()}.xlsx`,
      });

      message.success("Đã tải báo cáo doanh thu.");
    } catch (error) {
      console.error("Lỗi khi xuất báo cáo doanh thu:", error);
      message.error("Không thể xuất báo cáo doanh thu.");
    } finally {
      setExportingRevenue(false);
    }
  };

  const downloadMostViewedReport = async () => {
    setExportingMostViewed(true);
    try {
      await exportExcelReport({
        url: `${API_BASE}/most-viewed/export`,
        axiosConfig,
        params: { order: mostViewedOrder },
        fileName: `bao-cao-san-pham-xem-nhieu-${Date.now()}.xlsx`,
      });

      message.success("Đã tải báo cáo sản phẩm xem nhiều.");
    } catch (error) {
      console.error("Lỗi khi xuất báo cáo sản phẩm xem nhiều:", error);
      message.error("Không thể xuất báo cáo sản phẩm xem nhiều.");
    } finally {
      setExportingMostViewed(false);
    }
  };

  const revenueReportColumns = [
    {
      title: mode === "month" ? "Ngày" : "Kỳ báo cáo",
      dataIndex: "period",
      render: (value) => <span className={styles.productName}>{value}</span>,
    },
    {
      title: "Số đơn",
      dataIndex: "orders",
      align: "center",
      render: (value) => <Tag color="blue">{value}</Tag>,
    },
    {
      title: "Doanh thu",
      dataIndex: "revenue",
      align: "right",
      render: (value) => <span className={styles.revenue}>{fmt(value)}</span>,
    },
    {
      title: "Tỷ trọng",
      dataIndex: "revenue",
      align: "center",
      render: (value) => {
        const percent =
          revenueTotal.revenue > 0
            ? Math.round((Number(value || 0) / revenueTotal.revenue) * 100)
            : 0;

        return (
          <div className={styles.barWrap}>
            <div
              className={styles.barFill}
              style={{ width: `${percent * 2}px` }}
            />
            <span>{percent}%</span>
          </div>
        );
      },
    },
  ];

  const bestSellerColumns = [
    {
      title: "#",
      render: (_, __, index) => (
        <span className={styles.rank}>{index + 1}</span>
      ),
      width: 44,
    },
    {
      title: "Sản phẩm",
      dataIndex: "TenSanPham",
      render: (value) => <span className={styles.productName}>{value}</span>,
    },
    {
      title: "Đã bán",
      dataIndex: "TongDaBan",
      render: (value) => (
        <Tag color="volcano">
          <FireOutlined /> {value} SP
        </Tag>
      ),
    },
    {
      title: "Tỷ trọng",
      dataIndex: "percent",
      render: (value) => (
        <div className={styles.barWrap}>
          <div className={styles.barFill} style={{ width: `${value * 3}px` }} />
          <span>{value}%</span>
        </div>
      ),
    },
  ];

  const mostViewedColumns = [
    {
      title: "#",
      render: (_, __, index) => (
        <span className={styles.rankView}>{index + 1}</span>
      ),
      width: 44,
    },
    {
      title: "Sản phẩm",
      render: (record) => (
        <div className={styles.flexCenter}>
          {record.Thumbnail ? (
            <img
              src={record.Thumbnail}
              alt="thumbnail"
              className={styles.productImage}
            />
          ) : (
            <div className={styles.noImg} />
          )}
          <div>
            <div className={styles.productName}>{record.TenSanPham}</div>
            <div className={styles.productMeta}>
              {record.ThuongHieu || "Chưa có"}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Lượt xem",
      dataIndex: "LuotXem",
      align: "center",
      render: (value) => (
        <Tag color="geekblue">
          <EyeOutlined /> {value}
        </Tag>
      ),
    },
  ];

  const ratingColumns = [
    {
      title: "#",
      render: (_, __, index) => (
        <span className={styles.rankStar}>{index + 1}</span>
      ),
      width: 44,
    },
    {
      title: "Sản phẩm",
      render: (record) => (
        <div className={styles.flexCenter}>
          {record.Thumbnail ? (
            <img
              src={record.Thumbnail}
              alt="thumbnail"
              className={styles.productImage}
            />
          ) : (
            <div className={styles.noImg} />
          )}
          <span className={styles.productName}>
            {record.TenSanPham || `Sản phẩm ID: ${record.MaSanPham}`}
          </span>
        </div>
      ),
    },
    {
      title: "Điểm TB",
      dataIndex: "DiemTrungBinh",
      render: (value) => (
        <span className={styles.starText}>
          <StarOutlined /> {Number(value).toFixed(1)}
        </span>
      ),
    },
    {
      title: "Số lượt ĐG",
      dataIndex: "TongDanhGia",
      render: (value) => <Tag color="green">{value}</Tag>,
    },
  ];

  const pieData = bestSellers.slice(0, 5).map((product) => ({
    name: `${product.TenSanPham.split(" ").slice(0, 3).join(" ")}...`,
    value: product.percent || 1,
  }));

  return (
    <div className={styles.wrapper}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Báo cáo & Thống kê</h1>
          <p className={styles.pageSub}>
            <CalendarOutlined /> {periodLabel()}
          </p>
        </div>
        <div className={styles.filters}>
          <Radio.Group
            value={mode}
            onChange={(event) => setMode(event.target.value)}
            optionType="button"
            buttonStyle="solid"
            className={styles.modeGroup}
          >
            <Radio.Button value="month">Tháng</Radio.Button>
            <Radio.Button value="quarter">Quý</Radio.Button>
            <Radio.Button value="year">Năm</Radio.Button>
          </Radio.Group>

          {mode === "month" && (
            <Select
              value={month}
              onChange={setMonth}
              className={styles.filterSelect}
            >
              {MONTHS.map((item) => (
                <Select.Option key={item.value} value={item.value}>
                  {item.label}
                </Select.Option>
              ))}
            </Select>
          )}

          {mode === "quarter" && (
            <Select
              value={quarter}
              onChange={setQuarter}
              className={styles.filterSelect}
            >
              {QUARTERS.map((item) => (
                <Select.Option key={item.value} value={item.value}>
                  {item.label}
                </Select.Option>
              ))}
            </Select>
          )}

          <Select
            value={year}
            onChange={setYear}
            className={styles.filterSelect}
          >
            {YEARS.map((item) => (
              <Select.Option key={item} value={item}>
                {item}
              </Select.Option>
            ))}
          </Select>
        </div>
      </div>

      {loading ? (
        <div className={styles.loadingWrap}>
          <Spin size="large" />
        </div>
      ) : (
        <>
          <Row gutter={[16, 16]} className={styles.summaryRow}>
            {[
              {
                title: "Doanh thu",
                value: fmt(summary.revenue),
                icon: <DollarOutlined />,
                color: "#1b437c",
                bg: "#e8f0fe",
              },
              {
                title: "Đơn hàng",
                value: summary.orders,
                icon: <BarChartOutlined />,
                color: "#52c41a",
                bg: "#f6ffed",
              },
              {
                title: "Khách hàng",
                value: summary.customers,
                icon: <TeamOutlined />,
                color: "#c48c46",
                bg: "#fff8e6",
              },
              {
                title: "Giá trị TB/đơn",
                value: fmt(summary.avgOrder),
                icon: <RiseOutlined />,
                color: "#e74c3c",
                bg: "#fff1f0",
              },
            ].map((card, index) => (
              <Col xs={24} sm={12} xl={6} key={index}>
                <div className={styles.summaryCard}>
                  <div
                    className={styles.summaryIcon}
                    style={{ background: card.bg, color: card.color }}
                  >
                    {card.icon}
                  </div>
                  <div>
                    <div className={styles.summaryLabel}>{card.title}</div>
                    <div
                      className={styles.summaryValue}
                      style={{ color: card.color }}
                    >
                      {card.value}
                    </div>
                  </div>
                </div>
              </Col>
            ))}
          </Row>

          <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
            <Col xs={24} xl={16}>
              <div className={styles.chartCard}>
                <div className={styles.chartHeader}>
                  <span className={styles.chartTitle}>
                    Doanh thu theo {periodLabel()}
                  </span>
                  <span className={styles.periodHint}>
                    Tổng: {fmt(revenueTotal.revenue)}
                  </span>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={revenueChartData}
                    margin={{ top: 10, right: 20, left: 10, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey={mode === "month" ? "label" : "periodShort"}
                      tick={{ fontSize: 12, fill: "#888" }}
                    />
                    <YAxis
                      tickFormatter={fmtShort}
                      tick={{ fontSize: 12, fill: "#888" }}
                    />
                    <Tooltip
                      formatter={(value) => [fmt(value), "Doanh thu"]}
                      contentStyle={{
                        borderRadius: 8,
                        border: "none",
                        boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Bar
                      dataKey="revenue"
                      fill="#1b437c"
                      radius={[4, 4, 0, 0]}
                      name="Doanh thu"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Col>
            <Col xs={24} xl={8}>
              <div className={styles.chartCard}>
                <div className={styles.chartHeader}>
                  <span className={styles.chartTitle}>Đơn hàng</span>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={revenueChartData}
                    margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey={mode === "month" ? "label" : "periodShort"}
                      tick={{ fontSize: 11, fill: "#888" }}
                    />
                    <YAxis tick={{ fontSize: 11, fill: "#888" }} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 8,
                        border: "none",
                        boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="orders"
                      stroke="#1b437c"
                      strokeWidth={2}
                      dot={false}
                      name="Đơn hàng"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
            <Col xs={24} xl={14}>
              <div className={styles.chartCard}>
                <div className={styles.chartHeader}>
                  <div>
                    <span className={styles.chartTitle}>
                      Báo cáo doanh thu cửa hàng
                    </span>
                    <div className={styles.periodHint}>{periodLabel()}</div>
                  </div>
                  <div className={styles.chartActions}>
                    <span className={styles.totalRevenueText}>
                      {fmt(revenueTotal.revenue)}
                    </span>
                    <Button
                      size="small"
                      icon={<DownloadOutlined />}
                      loading={exportingRevenue}
                      onClick={downloadRevenueReport}
                    >
                      Xuất Excel
                    </Button>
                  </div>
                </div>
                <Table
                  dataSource={revenueReportRows}
                  columns={revenueReportColumns}
                  rowKey="key"
                  pagination={mode === "month" ? { pageSize: 10 } : false}
                  size="small"
                  className={styles.productTable}
                  summary={() => (
                    <Table.Summary>
                      <Table.Summary.Row>
                        <Table.Summary.Cell index={0}>
                          <strong>Tổng cộng</strong>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={1} align="center">
                          <strong>{revenueTotal.orders}</strong>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={2} align="right">
                          <strong className={styles.revenue}>
                            {fmt(revenueTotal.revenue)}
                          </strong>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={3} align="center">
                          <strong>100%</strong>
                        </Table.Summary.Cell>
                      </Table.Summary.Row>
                    </Table.Summary>
                  )}
                />
              </div>
            </Col>

            <Col xs={24} xl={10}>
              <div className={styles.chartCard}>
                <div className={styles.chartHeader}>
                  <span className={styles.chartTitle}>
                    Báo cáo sản phẩm xem nhiều
                  </span>
                  <div className={styles.chartActions}>
                    <Select
                      value={mostViewedOrder}
                      onChange={setMostViewedOrder}
                      size="small"
                      className={styles.sortSelect}
                    >
                      <Select.Option value="DESC">
                        Lượt xem giảm dần
                      </Select.Option>
                      <Select.Option value="ASC">
                        Lượt xem tăng dần
                      </Select.Option>
                    </Select>
                    <Button
                      size="small"
                      icon={<DownloadOutlined />}
                      loading={exportingMostViewed}
                      onClick={downloadMostViewedReport}
                    >
                      Xuất Excel
                    </Button>
                  </div>
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
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} xl={16}>
              <div className={styles.chartCard}>
                <div className={styles.chartHeader}>
                  <span className={styles.chartTitle}>
                    Top sản phẩm bán chạy
                  </span>
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
                  <span className={styles.chartTitle}>
                    Tỷ trọng số lượng bán
                  </span>
                </div>
                {pieData.length > 0 ? (
                  <>
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
                          label={({ percent }) =>
                            `${(percent * 100).toFixed(0)}%`
                          }
                          labelLine={false}
                        >
                          {pieData.map((_, index) => (
                            <Cell
                              key={index}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => [`${value}%`, "Tỷ trọng"]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className={styles.legend}>
                      {pieData.map((item, index) => (
                        <div key={index} className={styles.legendItem}>
                          <span
                            className={styles.legendDot}
                            style={{
                              background: COLORS[index % COLORS.length],
                            }}
                          />
                          <span className={styles.legendLabel}>
                            {item.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className={styles.emptyChart}>
                    Không đủ dữ liệu vẽ biểu đồ
                  </div>
                )}
              </div>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
            <Col xs={24}>
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
