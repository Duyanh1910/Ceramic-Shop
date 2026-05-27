import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Empty,
  Image,
  List,
  message,
  Popconfirm,
  Segmented,
  Space,
  Spin,
  Tag,
  Timeline,
  Typography,
} from "antd";
import {
  ReloadOutlined,
  RollbackOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";
import ReturnRequestModal from "./ReturnRequestModal";
import styles from "./CustomerReturns.module.css";

const { Text, Title } = Typography;
const API_BASE = "https://ceramic-shop-u8ak.onrender.com/api/v1";
const ORDER_COMPLETED = 3;
const RETURN_PAGE_SIZE = 6;

const getToken = () =>
  localStorage.getItem("customer_token") || localStorage.getItem("admin_token");

const authConfig = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
  },
  withCredentials: true,
});

const fmt = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(Number(value || 0));

const REQUEST_LABELS = {
  DOI_HANG: "Đổi hàng",
  TRA_HANG: "Trả hàng",
  HOAN_TIEN: "Hoàn tiền",
  VO_HONG_VAN_CHUYEN: "Vỡ / hỏng do vận chuyển",
  THIEU_HANG: "Thiếu hàng",
  SAI_SAN_PHAM: "Sai sản phẩm / sai màu",
};

const STATUS_LABELS = {
  0: { label: "Chờ xử lý", color: "gold" },
  1: { label: "Đã duyệt", color: "blue" },
  2: { label: "Từ chối", color: "red" },
  3: { label: "Đang xử lý", color: "cyan" },
  4: { label: "Hoàn tất", color: "green" },
  5: { label: "Đã hủy", color: "default" },
};

const getOrdersFromResponse = (res) => {
  const payload = res.data?.result || res.data?.data || res.data;

  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.orders)) return payload.orders;
  if (Array.isArray(payload?.data)) return payload.data;

  return [];
};

const getOrderItems = (order) =>
  order?.ChiTietDonHangs ||
  order?.OrderDetailModels ||
  order?.OrderDetails ||
  [];

const getVariant = (item) =>
  item?.BienTheSanPham || item?.Variant || item?.variant || {};

const getProduct = (item) => {
  const variant = getVariant(item);

  return variant?.SanPham || variant?.Product || item?.SanPham || {};
};

const getReturnProduct = (item) => {
  const detail = item?.ChiTietDonHang || item?.OrderDetail || {};
  const variant = detail?.BienTheSanPham || detail?.Variant || {};
  const product = variant?.SanPham || variant?.Product || {};

  return { detail, variant, product };
};

const getHistories = (item) =>
  item?.XuLyDoiTras || item?.XuLyDoiTras || item?.ReturnProcessModels || [];

const renderStatus = (value) => {
  const info = STATUS_LABELS[Number(value)] || {
    label: "Không rõ",
    color: "default",
  };

  return <Tag color={info.color}>{info.label}</Tag>;
};

export default function CustomerReturns({ compact = false }) {
  const [tab, setTab] = useState("create");
  const [orders, setOrders] = useState([]);
  const [returns, setReturns] = useState([]);
  const [visibleOrderCount, setVisibleOrderCount] = useState(RETURN_PAGE_SIZE);
  const [visibleReturnCount, setVisibleReturnCount] = useState(RETURN_PAGE_SIZE);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [cancelingId, setCancelingId] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  const resetVisibleCounts = () => {
    setVisibleOrderCount(RETURN_PAGE_SIZE);
    setVisibleReturnCount(RETURN_PAGE_SIZE);
  };

  const completedOrders = useMemo(
    () =>
      orders.filter(
        (order) => Number(order.TrangThaiDonHang) === ORDER_COMPLETED,
      ),
    [orders],
  );

  const displayedCompletedOrders = useMemo(
    () => completedOrders.slice(0, visibleOrderCount),
    [completedOrders, visibleOrderCount],
  );

  const displayedReturns = useMemo(
    () => returns.slice(0, visibleReturnCount),
    [returns, visibleReturnCount],
  );

  const shownOrderCount = Math.min(visibleOrderCount, completedOrders.length);
  const shownReturnCount = Math.min(visibleReturnCount, returns.length);
  const hasMoreOrders = shownOrderCount < completedOrders.length;
  const hasMoreReturns = shownReturnCount < returns.length;

  const fetchData = async () => {
    setLoading(true);

    try {
      const [ordersRes, returnsRes] = await Promise.all([
        axios.get(`${API_BASE}/orders`, authConfig()),
        axios.get(`${API_BASE}/returns`, authConfig()),
      ]);

      setOrders(getOrdersFromResponse(ordersRes));
      setReturns(returnsRes.data?.result || []);
      resetVisibleCounts();
    } catch (err) {
      message.error(
        err.response?.data?.message || "Không thể tải dữ liệu đổi trả!",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (tab === "create") {
      setVisibleOrderCount(RETURN_PAGE_SIZE);
    }

    if (tab === "history") {
      setVisibleReturnCount(RETURN_PAGE_SIZE);
    }
  }, [tab]);

  const handleLoadMoreOrders = () => {
    setVisibleOrderCount((current) => current + RETURN_PAGE_SIZE);
  };

  const handleLoadMoreReturns = () => {
    setVisibleReturnCount((current) => current + RETURN_PAGE_SIZE);
  };

  const handleSubmit = async (values) => {
    setSubmitting(true);

    try {
      await axios.post(`${API_BASE}/returns`, values, authConfig());

      message.success("Đã gửi yêu cầu đổi trả!");
      setSelectedItem(null);
      setTab("history");
      await fetchData();
    } catch (err) {
      message.error(
        err.response?.data?.message || "Không thể gửi yêu cầu đổi trả!",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelReturn = async (item) => {
    setCancelingId(item.MaDoiTra);

    try {
      await axios.patch(
        `${API_BASE}/returns/${item.MaDoiTra}/cancel`,
        { LyDo: "Khách hàng hủy yêu cầu" },
        authConfig(),
      );

      message.success("Đã hủy yêu cầu đổi trả!");
      await fetchData();
    } catch (err) {
      message.error(
        err.response?.data?.message || "Không thể hủy yêu cầu đổi trả!",
      );
    } finally {
      setCancelingId(null);
    }
  };

  return (
    <Card
      bordered={false}
      className={`${styles.returnsCard} ${compact ? styles.compact : ""}`}
      title={
        <Space>
          <RollbackOutlined />
          <Title level={4} style={{ margin: 0 }}>
            Đổi trả / Hoàn tiền
          </Title>
        </Space>
      }
      extra={
        <Button icon={<ReloadOutlined />} onClick={fetchData}>
          Tải lại
        </Button>
      }
    >
      <Alert
        type="info"
        showIcon
        className={styles.notice}
        message="Bạn chỉ có thể gửi yêu cầu đổi trả cho đơn hàng đã hoàn thành. Admin sẽ kiểm tra trước khi nhập kho, gửi bù hoặc hoàn tiền."
      />

      <Segmented
        value={tab}
        onChange={setTab}
        className={styles.tabs}
        options={[
          { label: "Tạo yêu cầu", value: "create" },
          { label: "Yêu cầu đã gửi", value: "history" },
        ]}
      />

      {loading ? (
        <div className={styles.loadingWrap}>
          <Spin />
          <span>Đang tải dữ liệu...</span>
        </div>
      ) : tab === "create" ? (
        completedOrders.length === 0 ? (
          <Empty description="Chưa có đơn hàng hoàn thành để tạo yêu cầu đổi trả" />
        ) : (
          <>
            <div className={styles.orderList}>
              {displayedCompletedOrders.map((order) => (
                <div key={order.MaDonHang} className={styles.orderCard}>
                  <div className={styles.orderHeader}>
                    <div>
                      <Text strong>
                        Đơn hàng {order.MaHienThi || `#${order.MaDonHang}`}
                      </Text>

                      <div className={styles.muted}>
                        Ngày đặt:{" "}
                        {order.NgayDat
                          ? dayjs(order.NgayDat).format("DD/MM/YYYY HH:mm")
                          : "Không rõ"}
                      </div>
                    </div>

                    <Tag color="green">Đã hoàn thành</Tag>
                  </div>

                  <List
                    dataSource={getOrderItems(order)}
                    renderItem={(item) => {
                      const variant = getVariant(item);
                      const product = getProduct(item);

                      return (
                        <List.Item
                          actions={[
                            <Button
                              key="request"
                              type="primary"
                              size="small"
                              icon={<ShoppingOutlined />}
                              onClick={() => setSelectedItem(item)}
                            >
                              Yêu cầu đổi trả
                            </Button>,
                          ]}
                        >
                          <List.Item.Meta
                            avatar={
                              <Image
                                width={54}
                                height={54}
                                src={product?.Thumbnail}
                                fallback="https://via.placeholder.com/54"
                                className={styles.productImage}
                              />
                            }
                            title={product?.TenSanPham || "Sản phẩm"}
                            description={
                              <div>
                                <div>
                                  Phân loại:{" "}
                                  {variant?.TenBienThe || "Không rõ"}
                                </div>
                                <div>
                                  SL: {item.SoLuong || 1} · Giá:{" "}
                                  {fmt(item.GiaBan || variant?.Gia)}
                                </div>
                              </div>
                            }
                          />
                        </List.Item>
                      );
                    }}
                  />
                </div>
              ))}
            </div>

            <div className={styles.listFooter}>
              <span>
                Đang hiển thị {shownOrderCount} / {completedOrders.length} đơn hàng hoàn thành
              </span>

              {hasMoreOrders && (
                <Button className={styles.loadMoreBtn} onClick={handleLoadMoreOrders}>
                  Xem thêm đơn hàng
                </Button>
              )}
            </div>
          </>
        )
      ) : returns.length === 0 ? (
        <Empty description="Bạn chưa gửi yêu cầu đổi trả nào" />
      ) : (
        <>
          <div className={styles.returnList}>
            {displayedReturns.map((item) => {
              const { detail, variant, product } = getReturnProduct(item);
              const histories = getHistories(item);

              return (
                <div key={item.MaDoiTra} className={styles.returnCard}>
                  <div className={styles.returnHeader}>
                    <div>
                      <Text strong>Yêu cầu #{item.MaDoiTra}</Text>

                      <div className={styles.muted}>
                        {REQUEST_LABELS[item.LoaiYeuCau] || item.LoaiYeuCau} ·{" "}
                        {item.NgayYeuCau
                          ? dayjs(item.NgayYeuCau).format("DD/MM/YYYY HH:mm")
                          : "Không rõ thời gian"}
                      </div>
                    </div>

                    {renderStatus(item.TrangThai)}
                  </div>

                  <div className={styles.returnBody}>
                    <Image
                      width={64}
                      height={64}
                      src={product?.Thumbnail}
                      fallback="https://via.placeholder.com/64"
                      className={styles.productImage}
                    />

                    <div>
                      <Text strong>{product?.TenSanPham || "Sản phẩm"}</Text>
                      <div className={styles.muted}>
                        Phân loại: {variant?.TenBienThe || "Không rõ"}
                      </div>
                      <div className={styles.muted}>
                        SL yêu cầu: {item.SoLuongDoiTra} · Giá mua:{" "}
                        {fmt(detail?.GiaBan)}
                      </div>
                      <div className={styles.reason}>
                        Lý do: {item.LyDo || "Không có"}
                      </div>
                    </div>
                  </div>

                  {item.AnhMinhChung && (
                    <div className={styles.evidenceBox}>
                      <Text type="secondary">Ảnh minh chứng:</Text>
                      <Image
                        width={96}
                        height={96}
                        src={item.AnhMinhChung}
                        className={styles.evidenceImage}
                      />
                    </div>
                  )}

                  {Number(item.TrangThai) === 0 && (
                    <Popconfirm
                      title="Hủy yêu cầu đổi trả?"
                      okText="Hủy yêu cầu"
                      cancelText="Không"
                      okButtonProps={{ danger: true }}
                      onConfirm={() => handleCancelReturn(item)}
                    >
                      <Button danger loading={cancelingId === item.MaDoiTra}>
                        Hủy yêu cầu
                      </Button>
                    </Popconfirm>
                  )}

                  {histories.length > 0 && (
                    <Timeline
                      className={styles.timeline}
                      items={histories.map((history) => ({
                        children: (
                          <div>
                            <Text strong>{history.HanhDong || "Cập nhật"}</Text>
                            <div className={styles.muted}>
                              {history.NgayXuLy
                                ? dayjs(history.NgayXuLy).format(
                                    "DD/MM/YYYY HH:mm",
                                  )
                                : "Không rõ thời gian"}
                            </div>
                            <div>{history.GhiChu || "Không có ghi chú"}</div>
                          </div>
                        ),
                      }))}
                    />
                  )}
                </div>
              );
            })}
          </div>

          <div className={styles.listFooter}>
            <span>
              Đang hiển thị {shownReturnCount} / {returns.length} yêu cầu đổi trả
            </span>

            {hasMoreReturns && (
              <Button className={styles.loadMoreBtn} onClick={handleLoadMoreReturns}>
                Xem thêm yêu cầu
              </Button>
            )}
          </div>
        </>
      )}

      <ReturnRequestModal
        open={Boolean(selectedItem)}
        item={selectedItem}
        loading={submitting}
        onCancel={() => setSelectedItem(null)}
        onSubmit={handleSubmit}
      />
    </Card>
  );
}