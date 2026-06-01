import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Descriptions,
  Empty,
  Form,
  Input,
  message,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  ReloadOutlined,
  SearchOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";
import styles from "./AdminPayments.module.css";

import { API_BASE } from "../config/api";

const { Title, Text } = Typography;
const PAGE_SIZE = 10;
const ALL_VALUE = "all";

const TYPE_OPTIONS = [
  { label: "Tất cả loại", value: ALL_VALUE },
  { label: "Thanh toán", value: "THANH_TOAN" },
  { label: "Hoàn tiền", value: "HOAN_TIEN" },
];

const STATUS_OPTIONS = [
  { label: "Tất cả trạng thái", value: ALL_VALUE },
  { label: "Đang chờ", value: "PENDING" },
  { label: "Thành công", value: "SUCCESS" },
  { label: "Thất bại", value: "FAILED" },
  { label: "Đã hủy", value: "CANCELLED" },
];

const METHOD_OPTIONS = [
  { label: "Tất cả phương thức", value: ALL_VALUE },
  { label: "COD", value: 1 },
  { label: "MoMo", value: 4 },
  { label: "ZaloPay", value: 5 },
];

const fmt = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(Number(value || 0));

const authConfig = () => {
  const token =
    localStorage.getItem("admin_token") ||
    localStorage.getItem("customer_token") ||
    localStorage.getItem("token");

  return {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    withCredentials: true,
  };
};

const getOrder = (transaction) => transaction?.DonHang || {};
const getMethod = (transaction) => transaction?.PhuongThucThanhToan || {};
const getReturn = (transaction) => transaction?.DoiTra || {};

const renderType = (type) => {
  if (type === "HOAN_TIEN") {
    return <Tag color="magenta">Hoàn tiền</Tag>;
  }

  return <Tag color="blue">Thanh toán</Tag>;
};

const renderStatus = (status) => {
  if (status === "SUCCESS") {
    return <Tag color="green">Thành công</Tag>;
  }

  if (status === "FAILED") {
    return <Tag color="red">Thất bại</Tag>;
  }

  if (status === "CANCELLED") {
    return <Tag color="default">Đã hủy</Tag>;
  }

  return <Tag color="gold">Đang chờ</Tag>;
};

export default function AdminPayments() {
  const [confirmForm] = Form.useForm();
  const [failForm] = Form.useForm();

  const [data, setData] = useState([]);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [originalTransaction, setOriginalTransaction] = useState(null);

  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [type, setType] = useState(ALL_VALUE);
  const [status, setStatus] = useState(ALL_VALUE);
  const [method, setMethod] = useState(ALL_VALUE);

  const [detailOpen, setDetailOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [failOpen, setFailOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== searchInput) {
        setSearch(searchInput);
        setPage(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput, search]);

  useEffect(() => {
    fetchData();
  }, [page, search, type, status, method]);

  const fetchData = async () => {
    setLoading(true);

    try {
      const res = await axios.get(`${API_BASE}/admin/payments`, {
        params: {
          page,
          limit: PAGE_SIZE,
          search: search.trim(),
          type: type === ALL_VALUE ? undefined : type,
          status: status === ALL_VALUE ? undefined : status,
          method: method === ALL_VALUE ? undefined : method,
        },
        ...authConfig(),
      });

      setData(res.data?.result?.data || []);
      setTotalItems(res.data?.result?.totalItems || 0);
    } catch (err) {
      message.error(
        err.response?.data?.message ||
          "Không thể tải danh sách giao dịch thanh toán!",
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchDetail = async (id) => {
    setDetailLoading(true);

    try {
      const res = await axios.get(
        `${API_BASE}/admin/payments/${id}`,
        authConfig(),
      );

      setSelectedDetail(res.data?.result?.transaction || null);
      setOriginalTransaction(res.data?.result?.originalTransaction || null);
    } catch (err) {
      message.error(
        err.response?.data?.message || "Không thể tải chi tiết giao dịch!",
      );
    } finally {
      setDetailLoading(false);
    }
  };

  const openDetail = async (record) => {
    setDetailOpen(true);
    setSelectedDetail(null);
    setOriginalTransaction(null);
    await fetchDetail(record.MaGiaoDich);
  };

  const closeDetail = () => {
    setDetailOpen(false);
    setSelectedDetail(null);
    setOriginalTransaction(null);
  };

  const openConfirmRefund = (record) => {
    setSelectedDetail(record);
    confirmForm.resetFields();
    setConfirmOpen(true);
  };

  const openFailRefund = (record) => {
    setSelectedDetail(record);
    failForm.resetFields();
    setFailOpen(true);
  };

  const handleConfirmRefund = async () => {
    if (!selectedDetail?.MaGiaoDich) return;

    const values = await confirmForm.validateFields();
    setActionLoading(true);

    try {
      await axios.patch(
        `${API_BASE}/admin/payments/${selectedDetail.MaGiaoDich}/confirm-refund`,
        {
          MaGiaoDichDoiTac: values.MaGiaoDichDoiTac || null,
          GhiChu: values.GhiChu || null,
        },
        authConfig(),
      );

      message.success("Đã xác nhận hoàn tiền thành công!");
      setConfirmOpen(false);
      await fetchData();

      if (detailOpen) {
        await fetchDetail(selectedDetail.MaGiaoDich);
      }
    } catch (err) {
      message.error(
        err.response?.data?.message || "Không thể xác nhận hoàn tiền!",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleFailRefund = async () => {
    if (!selectedDetail?.MaGiaoDich) return;

    const values = await failForm.validateFields();
    setActionLoading(true);

    try {
      await axios.patch(
        `${API_BASE}/admin/payments/${selectedDetail.MaGiaoDich}/fail-refund`,
        {
          MaLoi: values.MaLoi || "REFUND_FAILED",
          GhiChu: values.GhiChu,
        },
        authConfig(),
      );

      message.success("Đã đánh dấu hoàn tiền thất bại!");
      setFailOpen(false);
      await fetchData();

      if (detailOpen) {
        await fetchDetail(selectedDetail.MaGiaoDich);
      }
    } catch (err) {
      message.error(
        err.response?.data?.message ||
          "Không thể đánh dấu hoàn tiền thất bại!",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const resetFilters = () => {
    setSearchInput("");
    setSearch("");
    setType(ALL_VALUE);
    setStatus(ALL_VALUE);
    setMethod(ALL_VALUE);
    setPage(1);
  };

  const columns = [
    {
      title: "Giao dịch",
      key: "transaction",
      width: 210,
      render: (_, record) => (
        <div className={styles.transactionCell}>
          <Text strong>#{record.MaGiaoDich}</Text>
          <Text type="secondary" className={styles.smallText}>
            {record.MaThamChieu}
          </Text>
          <Text type="secondary" className={styles.smallText}>
            {dayjs(record.ThoiGianGiaoDich).format("DD/MM/YYYY HH:mm")}
          </Text>
        </div>
      ),
    },
    {
      title: "Đơn hàng",
      key: "order",
      width: 160,
      render: (_, record) => {
        const order = getOrder(record);

        return (
          <div className={styles.transactionCell}>
            <Text strong>{order.MaHienThi || `#${record.MaDonHang}`}</Text>
            <Text type="secondary" className={styles.smallText}>
              {order.TenNguoiNhan || "Không rõ khách"}
            </Text>
            <Text type="secondary" className={styles.smallText}>
              {order.SDT || ""}
            </Text>
          </div>
        );
      },
    },
    {
      title: "Loại",
      dataIndex: "LoaiGiaoDich",
      key: "LoaiGiaoDich",
      width: 110,
      render: renderType,
    },
    {
      title: "Phương thức",
      key: "method",
      width: 120,
      render: (_, record) =>
        getMethod(record).TenPhuongThuc || `#${record.MaPhuongThuc}`,
    },
    {
      title: "Số tiền",
      dataIndex: "SoTien",
      key: "SoTien",
      width: 130,
      render: (value, record) => (
        <Text
          strong
          className={
            record.LoaiGiaoDich === "HOAN_TIEN"
              ? styles.refundAmount
              : styles.paymentAmount
          }
        >
          {record.LoaiGiaoDich === "HOAN_TIEN" ? "- " : ""}
          {fmt(value)}
        </Text>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "TrangThai",
      key: "TrangThai",
      width: 120,
      render: renderStatus,
    },
    {
      title: "Đổi trả",
      key: "return",
      width: 100,
      render: (_, record) =>
        record.MaDoiTra ? <Tag color="purple">#{record.MaDoiTra}</Tag> : "—",
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 210,
      render: (_, record) => {
        const isPendingRefund =
          record.LoaiGiaoDich === "HOAN_TIEN" &&
          record.TrangThai === "PENDING";

        return (
          <Space size={4}>
            <Tooltip title="Xem chi tiết">
              <Button
                size="small"
                icon={<EyeOutlined />}
                onClick={() => openDetail(record)}
              >
                Chi tiết
              </Button>
            </Tooltip>

            {isPendingRefund && (
              <>
                <Tooltip title="Xác nhận đã hoàn tiền">
                  <Button
                    size="small"
                    type="primary"
                    icon={<CheckCircleOutlined />}
                    onClick={() => openConfirmRefund(record)}
                  />
                </Tooltip>

                <Tooltip title="Đánh dấu hoàn tiền thất bại">
                  <Button
                    size="small"
                    danger
                    icon={<CloseCircleOutlined />}
                    onClick={() => openFailRefund(record)}
                  />
                </Tooltip>
              </>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <Card
      bordered={false}
      className={styles.paymentCard}
      title={
        <Space>
          <WalletOutlined className={styles.titleIcon} />
          <Title level={4} style={{ margin: 0 }}>
            Quản lý thanh toán & hoàn tiền
          </Title>
        </Space>
      }
    >
      <div className={styles.toolbar}>
        <Input
          placeholder="Tìm mã đơn, khách hàng, SĐT, mã giao dịch..."
          prefix={<SearchOutlined />}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          allowClear
          className={styles.searchInput}
        />

        <Select
          value={type}
          options={TYPE_OPTIONS}
          className={styles.filterSelect}
          onChange={(value) => {
            setType(value);
            setPage(1);
          }}
        />

        <Select
          value={status}
          options={STATUS_OPTIONS}
          className={styles.filterSelect}
          onChange={(value) => {
            setStatus(value);
            setPage(1);
          }}
        />

        <Select
          value={method}
          options={METHOD_OPTIONS}
          className={styles.filterSelect}
          onChange={(value) => {
            setMethod(value);
            setPage(1);
          }}
        />

        <Button icon={<ReloadOutlined />} onClick={resetFilters}>
          Làm mới
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="MaGiaoDich"
        loading={loading}
        className={styles.table}
        scroll={{ x: 1250 }}
        pagination={{
          current: page,
          pageSize: PAGE_SIZE,
          total: totalItems,
          showSizeChanger: false,
          showTotal: (total) => `Tổng số: ${total} giao dịch`,
        }}
        onChange={(pagination) => setPage(pagination.current)}
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Chưa có giao dịch thanh toán"
            />
          ),
        }}
      />

      <Modal
        open={detailOpen}
        onCancel={closeDetail}
        title={`Chi tiết giao dịch #${selectedDetail?.MaGiaoDich || ""}`}
        width={880}
        footer={[
          <Button key="close" onClick={closeDetail}>
            Đóng
          </Button>,
        ]}
        destroyOnClose
      >
        {detailLoading ? (
          <div className={styles.loadingBox}>Đang tải chi tiết...</div>
        ) : selectedDetail ? (
          <div className={styles.detailWrap}>
            <Descriptions bordered size="small" column={2}>
              <Descriptions.Item label="Mã giao dịch">
                #{selectedDetail.MaGiaoDich}
              </Descriptions.Item>

              <Descriptions.Item label="Trạng thái">
                {renderStatus(selectedDetail.TrangThai)}
              </Descriptions.Item>

              <Descriptions.Item label="Loại giao dịch">
                {renderType(selectedDetail.LoaiGiaoDich)}
              </Descriptions.Item>

              <Descriptions.Item label="Phương thức">
                {getMethod(selectedDetail).TenPhuongThuc ||
                  `#${selectedDetail.MaPhuongThuc}`}
              </Descriptions.Item>

              <Descriptions.Item label="Số tiền">
                <Text strong>{fmt(selectedDetail.SoTien)}</Text>
              </Descriptions.Item>

              <Descriptions.Item label="Thời gian">
                {dayjs(selectedDetail.ThoiGianGiaoDich).format(
                  "DD/MM/YYYY HH:mm",
                )}
              </Descriptions.Item>

              <Descriptions.Item label="Mã tham chiếu" span={2}>
                <Text copyable>{selectedDetail.MaThamChieu}</Text>
              </Descriptions.Item>

              <Descriptions.Item label="Mã đối tác" span={2}>
                {selectedDetail.MaGiaoDichDoiTac || "Chưa có"}
              </Descriptions.Item>

              <Descriptions.Item label="Mã lỗi" span={2}>
                {selectedDetail.MaLoi || "Không có"}
              </Descriptions.Item>
            </Descriptions>

            <Descriptions
              bordered
              size="small"
              column={2}
              title="Thông tin đơn hàng"
            >
              <Descriptions.Item label="Mã đơn">
                {getOrder(selectedDetail).MaHienThi ||
                  `#${selectedDetail.MaDonHang}`}
              </Descriptions.Item>

              <Descriptions.Item label="Người nhận">
                {getOrder(selectedDetail).TenNguoiNhan || "Không rõ"}
              </Descriptions.Item>

              <Descriptions.Item label="SĐT">
                {getOrder(selectedDetail).SDT || "Không rõ"}
              </Descriptions.Item>

              <Descriptions.Item label="Tổng thanh toán">
                {fmt(getOrder(selectedDetail).TongThanhToan)}
              </Descriptions.Item>
            </Descriptions>

            {selectedDetail.MaDoiTra && (
              <Descriptions
                bordered
                size="small"
                column={2}
                title="Yêu cầu đổi trả liên quan"
              >
                <Descriptions.Item label="Mã đổi trả">
                  #{selectedDetail.MaDoiTra}
                </Descriptions.Item>

                <Descriptions.Item label="Loại yêu cầu">
                  {getReturn(selectedDetail).LoaiYeuCau || "Không rõ"}
                </Descriptions.Item>

                <Descriptions.Item label="Hình thức xử lý">
                  {getReturn(selectedDetail).HinhThucXuLy || "Không rõ"}
                </Descriptions.Item>

                <Descriptions.Item label="Số tiền hoàn">
                  {fmt(getReturn(selectedDetail).SoTienHoan)}
                </Descriptions.Item>
              </Descriptions>
            )}

            {originalTransaction && (
              <Descriptions
                bordered
                size="small"
                column={2}
                title="Giao dịch gốc"
              >
                <Descriptions.Item label="Mã giao dịch">
                  #{originalTransaction.MaGiaoDich}
                </Descriptions.Item>

                <Descriptions.Item label="Trạng thái">
                  {renderStatus(originalTransaction.TrangThai)}
                </Descriptions.Item>

                <Descriptions.Item label="Mã tham chiếu" span={2}>
                  {originalTransaction.MaThamChieu}
                </Descriptions.Item>
              </Descriptions>
            )}
          </div>
        ) : (
          <Empty description="Không có dữ liệu chi tiết" />
        )}
      </Modal>

      <Modal
        open={confirmOpen}
        onCancel={() => setConfirmOpen(false)}
        title="Xác nhận đã hoàn tiền"
        okText="Xác nhận"
        cancelText="Hủy"
        confirmLoading={actionLoading}
        onOk={handleConfirmRefund}
        destroyOnClose
      >
        <Form form={confirmForm} layout="vertical">
          <Form.Item label="Giao dịch">
            <Text strong>#{selectedDetail?.MaGiaoDich}</Text>
          </Form.Item>

          <Form.Item label="Số tiền hoàn">
            <Text strong className={styles.refundAmount}>
              {fmt(selectedDetail?.SoTien)}
            </Text>
          </Form.Item>

          <Form.Item
            name="MaGiaoDichDoiTac"
            label="Mã giao dịch chuyển khoản / đối tác"
          >
            <Input placeholder="VD: MBVCB123456, MOMO_REFUND_..." />
          </Form.Item>

          <Form.Item name="GhiChu" label="Ghi chú xác nhận">
            <Input.TextArea
              rows={3}
              placeholder="VD: Đã chuyển khoản hoàn tiền cho khách."
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        open={failOpen}
        onCancel={() => setFailOpen(false)}
        title="Đánh dấu hoàn tiền thất bại"
        okText="Xác nhận thất bại"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
        confirmLoading={actionLoading}
        onOk={handleFailRefund}
        destroyOnClose
      >
        <Form form={failForm} layout="vertical">
          <Form.Item label="Giao dịch">
            <Text strong>#{selectedDetail?.MaGiaoDich}</Text>
          </Form.Item>

          <Form.Item
            name="MaLoi"
            label="Mã lỗi"
            initialValue="REFUND_FAILED"
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="GhiChu"
            label="Lý do thất bại"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập lý do hoàn tiền thất bại!",
              },
            ]}
          >
            <Input.TextArea rows={3} placeholder="VD: Sai số tài khoản..." />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}