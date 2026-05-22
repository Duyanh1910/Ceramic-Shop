import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Descriptions,
  Form,
  Image,
  Input,
  InputNumber,
  message,
  Modal,
  Radio,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Timeline,
  Tooltip,
  Typography,
} from "antd";
import {
  CheckCircleOutlined,
  EyeOutlined,
  ReloadOutlined,
  RollbackOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";
import styles from "./AdminReturns.module.css";

const { Title, Text } = Typography;

const API_BASE = "https://ceramic-shop-u8ak.onrender.com/api/v1";
const ALL_STATUS = "all";
const ALL_TYPE = "all";

const RETURN_STATUS = {
  WAITING: 0,
  APPROVED: 1,
  REJECTED: 2,
  PROCESSING: 3,
  COMPLETED: 4,
  CUSTOMER_CANCELED: 5,
};

const REQUEST_LABELS = {
  DOI_HANG: "Đổi hàng",
  TRA_HANG: "Trả hàng",
  HOAN_TIEN: "Hoàn tiền",
  VO_HONG_VAN_CHUYEN: "Vỡ/hỏng vận chuyển",
  THIEU_HANG: "Thiếu hàng",
  SAI_SAN_PHAM: "Sai sản phẩm",
};

const PROCESS_LABELS = {
  DOI_SAN_PHAM: "Đổi sản phẩm",
  GUI_BO_SUNG: "Gửi bổ sung",
  HOAN_TIEN_MOT_PHAN: "Hoàn tiền một phần",
  HOAN_TIEN_TOAN_PHAN: "Hoàn tiền toàn phần",
};

const CONDITION_LABELS = {
  CON_NGUYEN: "Còn nguyên",
  DA_SU_DUNG: "Đã sử dụng",
  VO_HONG: "Vỡ / hỏng",
  LOI_SAN_XUAT: "Lỗi sản xuất",
  KHONG_NHAN_LAI: "Không nhận lại hàng",
};

const STATUS_OPTIONS = [
  { label: "Tất cả", value: ALL_STATUS },
  { label: "Chờ xử lý", value: RETURN_STATUS.WAITING },
  { label: "Đã duyệt", value: RETURN_STATUS.APPROVED },
  { label: "Từ chối", value: RETURN_STATUS.REJECTED },
  { label: "Đang xử lý", value: RETURN_STATUS.PROCESSING },
  { label: "Hoàn tất", value: RETURN_STATUS.COMPLETED },
  { label: "Khách hủy", value: RETURN_STATUS.CUSTOMER_CANCELED },
];

const TYPE_OPTIONS = [
  { label: "Tất cả", value: ALL_TYPE },
  { label: "Đổi hàng", value: "DOI_HANG" },
  { label: "Trả hàng", value: "TRA_HANG" },
  { label: "Hoàn tiền", value: "HOAN_TIEN" },
  { label: "Vỡ vận chuyển", value: "VO_HONG_VAN_CHUYEN" },
  { label: "Thiếu hàng", value: "THIEU_HANG" },
  { label: "Sai sản phẩm", value: "SAI_SAN_PHAM" },
];

const PROCESS_OPTIONS = [
  { label: "Đổi sản phẩm", value: "DOI_SAN_PHAM" },
  { label: "Gửi bổ sung", value: "GUI_BO_SUNG" },
  { label: "Hoàn tiền một phần", value: "HOAN_TIEN_MOT_PHAN" },
  { label: "Hoàn tiền toàn phần", value: "HOAN_TIEN_TOAN_PHAN" },
];

const getToken = () =>
  localStorage.getItem("admin_token") || localStorage.getItem("customer_token");

const authConfig = () => {
  const token = getToken();

  return {
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {},
    withCredentials: true,
  };
};

const fmt = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(Number(value || 0));

const renderStatus = (status) => {
  const statusNumber = Number(status);

  if (statusNumber === RETURN_STATUS.WAITING) {
    return <Tag color="gold">Chờ xử lý</Tag>;
  }

  if (statusNumber === RETURN_STATUS.APPROVED) {
    return <Tag color="blue">Đã duyệt</Tag>;
  }

  if (statusNumber === RETURN_STATUS.REJECTED) {
    return <Tag color="red">Từ chối</Tag>;
  }

  if (statusNumber === RETURN_STATUS.PROCESSING) {
    return <Tag color="cyan">Đang xử lý</Tag>;
  }

  if (statusNumber === RETURN_STATUS.COMPLETED) {
    return <Tag color="green">Hoàn tất</Tag>;
  }

  if (statusNumber === RETURN_STATUS.CUSTOMER_CANCELED) {
    return <Tag>Khách hủy</Tag>;
  }

  return <Tag>{status}</Tag>;
};

const renderPaymentStatus = (status) => {
  if (status === "PENDING") {
    return <Tag color="gold">Chờ xác nhận</Tag>;
  }

  if (status === "SUCCESS") {
    return <Tag color="green">Thành công</Tag>;
  }

  if (status === "FAILED") {
    return <Tag color="red">Thất bại</Tag>;
  }

  return <Tag>{status || "Không rõ"}</Tag>;
};

const getDetail = (item) => item?.ChiTietDonHang || {};
const getOrder = (item) => getDetail(item)?.DonHang || {};
const getVariant = (item) => getDetail(item)?.BienTheSanPham || {};
const getProduct = (item) => getVariant(item)?.SanPham || {};

const getHistories = (item) =>
  item?.XuLyDoiTras || item?.ReturnProcessModels || [];

const getTransactions = (item) =>
  item?.GiaoDichThanhToans ||
  item?.PaymentTransactionModels ||
  item?.PaymentTransactions ||
  [];

export default function AdminReturns() {
  const [form] = Form.useForm();

  const [data, setData] = useState([]);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [confirmingRefund, setConfirmingRefund] = useState(false);

  const [variantOptions, setVariantOptions] = useState([]);
  const [variantLoading, setVariantLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(ALL_STATUS);
  const [type, setType] = useState(ALL_TYPE);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const selectedProcessType = Form.useWatch("HinhThucXuLy", form);
  const selectedQuantity = Form.useWatch("SoLuongDoiTra", form);

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
  }, [page, search, status, type]);

  useEffect(() => {
    if (!detail) return;
    if (selectedProcessType !== "HOAN_TIEN_TOAN_PHAN") return;

    const unitPrice = Number(detail?.ChiTietDonHang?.GiaBan || 0);
    const quantity = Number(selectedQuantity || detail.SoLuongDoiTra || 1);

    form.setFieldValue("SoTienHoan", unitPrice * quantity);
  }, [selectedProcessType, selectedQuantity, detail, form]);

  const fetchData = async () => {
    setLoading(true);

    try {
      const res = await axios.get(`${API_BASE}/admin/after_sales/returns`, {
        params: {
          page,
          limit: 10,
          search: search.trim(),
          status: status === ALL_STATUS ? undefined : status,
          type: type === ALL_TYPE ? undefined : type,
        },
        ...authConfig(),
      });

      setData(res.data?.result?.data || []);
      setTotalItems(res.data?.result?.totalItems || 0);
    } catch (err) {
      message.error(
        err.response?.data?.message || "Không thể tải danh sách đổi trả!",
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchDetail = async (id) => {
    setDetailLoading(true);

    try {
      const res = await axios.get(
        `${API_BASE}/admin/after_sales/returns/${id}`,
        authConfig(),
      );

      setDetail(res.data?.result || null);
      form.resetFields();
    } catch (err) {
      message.error(
        err.response?.data?.message || "Không thể tải chi tiết đổi trả!",
      );
    } finally {
      setDetailLoading(false);
    }
  };

  const fetchVariantOptions = async (keyword = "") => {
    setVariantLoading(true);

    try {
      const res = await axios.get(
        `${API_BASE}/admin/after_sales/returns/variants`,
        {
          params: {
            search: keyword,
          },
          ...authConfig(),
        },
      );

      const options = (res.data?.result || []).map((item) => ({
        value: item.MaBienThe,
        label: item.label,
        raw: item,
      }));

      setVariantOptions(options);
    } catch (err) {
      message.error(
        err.response?.data?.message || "Không thể tải danh sách biến thể!",
      );
    } finally {
      setVariantLoading(false);
    }
  };

  const openDetail = async (record) => {
    setDetail(null);
    setIsDetailOpen(true);
    await Promise.all([fetchDetail(record.MaDoiTra), fetchVariantOptions()]);
  };

  const closeDetail = () => {
    setIsDetailOpen(false);
    setDetail(null);
    form.resetFields();
  };

  const updateStatus = async (nextStatus, note) => {
    if (!detail?.MaDoiTra) return;

    setUpdating(true);

    try {
      const res = await axios.patch(
        `${API_BASE}/admin/after_sales/returns/${detail.MaDoiTra}/status`,
        {
          TrangThai: nextStatus,
          NoiDungXuLy: note,
        },
        authConfig(),
      );

      message.success(res.data?.message || "Cập nhật trạng thái thành công!");
      setDetail(res.data?.result || null);
      await fetchData();
    } catch (err) {
      message.error(
        err.response?.data?.message || "Không thể cập nhật trạng thái!",
      );
    } finally {
      setUpdating(false);
    }
  };

  const submitProcess = async () => {
    if (!detail?.MaDoiTra) return;

    const values = await form.validateFields();
    setProcessing(true);

    try {
      const res = await axios.post(
        `${API_BASE}/admin/after_sales/returns/${detail.MaDoiTra}/process`,
        values,
        authConfig(),
      );

      const isRefundProcess =
        values.HinhThucXuLy === "HOAN_TIEN_MOT_PHAN" ||
        values.HinhThucXuLy === "HOAN_TIEN_TOAN_PHAN";

      message.success(
        isRefundProcess
          ? "Đã tạo giao dịch hoàn tiền, chờ xác nhận đã thanh toán cho khách!"
          : res.data?.message || "Xử lý đổi trả thành công!",
      );

      setDetail(res.data?.result || null);
      form.resetFields();
      await fetchData();
    } catch (err) {
      message.error(
        err.response?.data?.message || "Không thể xử lý yêu cầu đổi trả!",
      );
    } finally {
      setProcessing(false);
    }
  };

  const confirmRefund = async () => {
    if (!detail?.MaDoiTra) return;

    setConfirmingRefund(true);

    try {
      const res = await axios.patch(
        `${API_BASE}/admin/after_sales/returns/${detail.MaDoiTra}/confirm-refund`,
        {
          NoiDungXuLy: "Admin xác nhận đã hoàn tiền cho khách",
        },
        authConfig(),
      );

      message.success(res.data?.message || "Đã xác nhận hoàn tiền!");
      setDetail(res.data?.result || null);
      await fetchData();
    } catch (err) {
      message.error(
        err.response?.data?.message || "Không thể xác nhận hoàn tiền!",
      );
    } finally {
      setConfirmingRefund(false);
    }
  };

  const handleReload = () => {
    setSearchInput("");

    if (
      search === "" &&
      status === ALL_STATUS &&
      type === ALL_TYPE &&
      page === 1
    ) {
      fetchData();
      return;
    }

    setSearch("");
    setStatus(ALL_STATUS);
    setType(ALL_TYPE);
    setPage(1);
  };

  const columns = [
    {
      title: "Sản phẩm",
      key: "product",
      render: (_, record) => {
        const product = getProduct(record);
        const variant = getVariant(record);

        return (
          <Space align="start">
            <Image
              width={58}
              height={58}
              src={product?.Thumbnail}
              fallback="https://via.placeholder.com/58"
              className={styles.productImage}
            />

            <div>
              <Text strong>{product?.TenSanPham || "Sản phẩm"}</Text>
              <div className={styles.muted}>
                Phân loại: {variant?.TenBienThe || "Không rõ"}
              </div>
              <div className={styles.muted}>
                SL yêu cầu: {record.SoLuongDoiTra}
              </div>
            </div>
          </Space>
        );
      },
    },
    {
      title: "Đơn hàng / khách",
      key: "order",
      render: (_, record) => {
        const order = getOrder(record);

        return (
          <div>
            <Text strong style={{ color: "#1677ff" }}>
              {order?.MaHienThi || `#${order?.MaDonHang || "N/A"}`}
            </Text>

            <div className={styles.muted}>
              Khách: {order?.TenNguoiNhan || "Không rõ"}
            </div>

            <div className={styles.muted}>SĐT: {order?.SDT || "Không rõ"}</div>
          </div>
        );
      },
    },
    {
      title: "Loại yêu cầu",
      dataIndex: "LoaiYeuCau",
      key: "LoaiYeuCau",
      render: (value) => <Tag>{REQUEST_LABELS[value] || value}</Tag>,
    },
    {
      title: "Ngày yêu cầu",
      dataIndex: "NgayYeuCau",
      key: "NgayYeuCau",
      render: (value) =>
        value ? dayjs(value).format("DD/MM/YYYY HH:mm") : "Không rõ",
    },
    {
      title: "Trạng thái",
      dataIndex: "TrangThai",
      key: "TrangThai",
      render: renderStatus,
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Button
          type="primary"
          ghost
          size="small"
          icon={<EyeOutlined />}
          onClick={() => openDetail(record)}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  const detailOrder = detail ? getOrder(detail) : {};
  const detailVariant = detail ? getVariant(detail) : {};
  const detailProduct = detail ? getProduct(detail) : {};
  const detailOrderItem = detail ? getDetail(detail) : {};
  const histories = detail ? getHistories(detail) : [];
  const transactions = detail ? getTransactions(detail) : [];

  const pendingRefund = transactions.find(
    (transaction) =>
      transaction.LoaiGiaoDich === "HOAN_TIEN" &&
      transaction.TrangThai === "PENDING",
  );

  const isRefundProcess =
    selectedProcessType === "HOAN_TIEN_MOT_PHAN" ||
    selectedProcessType === "HOAN_TIEN_TOAN_PHAN";

  return (
    <Card
      bordered={false}
      className={styles.returnsCard}
      title={
        <Space>
          <RollbackOutlined style={{ color: "#1677ff", fontSize: 20 }} />
          <Title level={4} style={{ margin: 0 }}>
            Quản lý đổi trả / hậu mãi
          </Title>
        </Space>
      }
    >
      <div className={styles.toolbar}>
        <Input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          allowClear
          prefix={<SearchOutlined />}
          placeholder="Tìm mã đơn, tên khách hoặc số điện thoại..."
          className={styles.searchInput}
        />

        <Space wrap>
          <Select
            value={type}
            options={TYPE_OPTIONS}
            onChange={(value) => {
              setType(value);
              setPage(1);
            }}
            style={{ width: 180 }}
          />

          <Radio.Group
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            buttonStyle="solid"
          >
            {STATUS_OPTIONS.map((item) => (
              <Radio.Button key={item.value} value={item.value}>
                {item.label}
              </Radio.Button>
            ))}
          </Radio.Group>

          <Button icon={<ReloadOutlined />} onClick={handleReload}>
            Tải lại
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="MaDoiTra"
        loading={loading}
        onChange={(pagination) => setPage(pagination.current)}
        pagination={{
          current: page,
          pageSize: 10,
          total: totalItems,
          showSizeChanger: false,
          showTotal: (total) => `Tổng số: ${total} yêu cầu`,
        }}
      />

      <Modal
        title={`Chi tiết yêu cầu đổi trả #${detail?.MaDoiTra || ""}`}
        open={isDetailOpen}
        onCancel={closeDetail}
        footer={null}
        width={960}
        destroyOnHidden
        styles={{
          body: {
            maxHeight: "75vh",
            overflowY: "auto",
            paddingRight: 8,
          },
        }}
      >
        {detailLoading || !detail ? (
          <div style={{ padding: 40, textAlign: "center" }}>
            Đang tải chi tiết...
          </div>
        ) : (
          <div className={styles.detailWrap}>
            <Alert
              type="info"
              showIcon
              message="Đơn hàng gốc không bị sửa. Các thao tác nhập kho, xuất kho, hoàn tiền và rủi ro chỉ được ghi nhận khi admin hoàn tất xử lý."
            />

            <Descriptions
              bordered
              size="small"
              column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
            >
              <Descriptions.Item label="Mã yêu cầu">
                #{detail.MaDoiTra}
              </Descriptions.Item>

              <Descriptions.Item label="Trạng thái">
                {renderStatus(detail.TrangThai)}
              </Descriptions.Item>

              <Descriptions.Item label="Loại yêu cầu">
                <Tag>{REQUEST_LABELS[detail.LoaiYeuCau] || detail.LoaiYeuCau}</Tag>
              </Descriptions.Item>

              <Descriptions.Item label="Tình trạng hàng">
                {CONDITION_LABELS[detail.TinhTrangHangTra] ||
                  detail.TinhTrangHangTra ||
                  "Không rõ"}
              </Descriptions.Item>

              <Descriptions.Item label="Mã đơn hàng">
                <Text copyable>{detailOrder.MaHienThi || "Không rõ"}</Text>
              </Descriptions.Item>

              <Descriptions.Item label="Khách hàng">
                {detailOrder.TenNguoiNhan || "Không rõ"} -{" "}
                {detailOrder.SDT || "Không rõ"}
              </Descriptions.Item>

              <Descriptions.Item label="Địa chỉ" span={2}>
                {detailOrder.DiaChiGiaoHang || "Không rõ"}
              </Descriptions.Item>

              <Descriptions.Item label="Sản phẩm" span={2}>
                <Space align="start">
                  <Image
                    width={72}
                    height={72}
                    src={detailProduct?.Thumbnail}
                    fallback="https://via.placeholder.com/72"
                    className={styles.productImage}
                  />

                  <div>
                    <Text strong>
                      {detailProduct?.TenSanPham || "Sản phẩm"}
                    </Text>

                    <div className={styles.muted}>
                      Phân loại: {detailVariant?.TenBienThe || "Không rõ"}
                    </div>

                    <div className={styles.muted}>
                      SL mua: {detailOrderItem?.SoLuong || 0} · SL yêu cầu:{" "}
                      {detail.SoLuongDoiTra}
                    </div>

                    <div className={styles.muted}>
                      Giá mua: {fmt(detailOrderItem?.GiaBan)}
                    </div>
                  </div>
                </Space>
              </Descriptions.Item>

              <Descriptions.Item label="Lý do" span={2}>
                {detail.LyDo || "Không có"}
              </Descriptions.Item>

              <Descriptions.Item label="Hình thức xử lý">
                {PROCESS_LABELS[detail.HinhThucXuLy] ||
                  detail.HinhThucXuLy ||
                  "Chưa xử lý"}
              </Descriptions.Item>

              <Descriptions.Item label="Số tiền hoàn">
                {fmt(detail.SoTienHoan)}
              </Descriptions.Item>

              <Descriptions.Item label="Ngày yêu cầu">
                {detail.NgayYeuCau
                  ? dayjs(detail.NgayYeuCau).format("DD/MM/YYYY HH:mm")
                  : "Không rõ"}
              </Descriptions.Item>

              <Descriptions.Item label="Ngày hoàn tất">
                {detail.NgayHoanTat
                  ? dayjs(detail.NgayHoanTat).format("DD/MM/YYYY HH:mm")
                  : "Chưa hoàn tất"}
              </Descriptions.Item>

              {detail.AnhMinhChung && (
                <Descriptions.Item label="Ảnh minh chứng" span={2}>
                  <Image
                    width={140}
                    src={detail.AnhMinhChung}
                    className={styles.productImage}
                  />
                </Descriptions.Item>
              )}
            </Descriptions>

            <div className={styles.actionBar}>
              <Space wrap>
                {Number(detail.TrangThai) === RETURN_STATUS.WAITING && (
                  <>
                    <Button
                      type="primary"
                      loading={updating}
                      onClick={() =>
                        updateStatus(
                          RETURN_STATUS.APPROVED,
                          "Admin đã duyệt yêu cầu đổi trả",
                        )
                      }
                    >
                      Duyệt
                    </Button>

                    <Button
                      loading={updating}
                      onClick={() =>
                        updateStatus(
                          RETURN_STATUS.PROCESSING,
                          "Admin duyệt và chuyển sang trạng thái đang xử lý",
                        )
                      }
                    >
                      Duyệt & xử lý
                    </Button>

                    <Button
                      danger
                      loading={updating}
                      onClick={() =>
                        updateStatus(
                          RETURN_STATUS.REJECTED,
                          "Admin từ chối yêu cầu đổi trả",
                        )
                      }
                    >
                      Từ chối
                    </Button>
                  </>
                )}

                {Number(detail.TrangThai) === RETURN_STATUS.APPROVED && (
                  <>
                    <Button
                      type="primary"
                      loading={updating}
                      onClick={() =>
                        updateStatus(
                          RETURN_STATUS.PROCESSING,
                          "Admin chuyển yêu cầu sang trạng thái đang xử lý",
                        )
                      }
                    >
                      Chuyển đang xử lý
                    </Button>

                    <Button
                      danger
                      loading={updating}
                      onClick={() =>
                        updateStatus(
                          RETURN_STATUS.REJECTED,
                          "Admin từ chối yêu cầu đổi trả",
                        )
                      }
                    >
                      Từ chối
                    </Button>
                  </>
                )}

                {pendingRefund && (
                  <Button
                    type="primary"
                    loading={confirmingRefund}
                    onClick={confirmRefund}
                  >
                    Xác nhận đã hoàn tiền
                  </Button>
                )}
              </Space>
            </div>

            {pendingRefund && (
              <Alert
                type="warning"
                showIcon
                message="Yêu cầu này đã tạo giao dịch hoàn tiền và đang chờ admin xác nhận đã thanh toán cho khách."
              />
            )}

            {Number(detail.TrangThai) === RETURN_STATUS.PROCESSING &&
              !pendingRefund && (
                <Card
                  title={isRefundProcess ? "Tạo giao dịch hoàn tiền" : "Hoàn tất xử lý"}
                  size="small"
                  className={styles.processCard}
                >
                  <Form form={form} layout="vertical">
                    <div className={styles.formGrid}>
                      <Form.Item
                        name="HinhThucXuLy"
                        label="Hình thức xử lý"
                        rules={[
                          {
                            required: true,
                            message: "Vui lòng chọn hình thức xử lý!",
                          },
                        ]}
                      >
                        <Select options={PROCESS_OPTIONS} />
                      </Form.Item>

                      <Form.Item
                        name="SoLuongDoiTra"
                        label="Số lượng xử lý"
                        initialValue={detail.SoLuongDoiTra}
                        rules={[
                          {
                            required: true,
                            message: "Vui lòng nhập số lượng xử lý!",
                          },
                        ]}
                      >
                        <InputNumber
                          min={1}
                          max={Number(detail.SoLuongDoiTra)}
                          style={{ width: "100%" }}
                        />
                      </Form.Item>

                      {(selectedProcessType === "DOI_SAN_PHAM" ||
                        selectedProcessType === "GUI_BO_SUNG") && (
                        <Form.Item
                          name="MaBienTheDoi"
                          label="Biến thể gửi cho khách"
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng chọn biến thể gửi cho khách!",
                            },
                          ]}
                          tooltip="Chọn sản phẩm/biến thể sẽ gửi đổi hoặc gửi bổ sung cho khách."
                        >
                          <Select
                            showSearch
                            allowClear
                            filterOption={false}
                            loading={variantLoading}
                            options={variantOptions}
                            placeholder="Tìm theo tên sản phẩm, tên biến thể hoặc mã biến thể..."
                            onSearch={fetchVariantOptions}
                            onFocus={() => fetchVariantOptions()}
                          />
                        </Form.Item>
                      )}

                      {(selectedProcessType === "HOAN_TIEN_MOT_PHAN" ||
                        selectedProcessType === "HOAN_TIEN_TOAN_PHAN") && (
                        <Form.Item
                          name="SoTienHoan"
                          label="Số tiền hoàn"
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng nhập số tiền hoàn!",
                            },
                          ]}
                        >
                          <InputNumber
                            min={1}
                            max={
                              Number(detailOrderItem?.GiaBan || 0) *
                              Number(selectedQuantity || detail.SoLuongDoiTra || 1)
                            }
                            disabled={
                              selectedProcessType === "HOAN_TIEN_TOAN_PHAN"
                            }
                            formatter={(value) =>
                              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                            }
                            parser={(value) =>
                              String(value || "").replace(/\$\s?|(,*)/g, "")
                            }
                            style={{ width: "100%" }}
                          />
                        </Form.Item>
                      )}

                      <Form.Item
                        name="CoNhapLaiKho"
                        label="Nhập lại hàng cũ vào kho"
                        valuePropName="checked"
                        tooltip="Chỉ bật nếu hàng khách trả còn đủ điều kiện nhập lại kho."
                      >
                        <Switch />
                      </Form.Item>
                    </div>

                    <Form.Item
                      name="NoiDungXuLy"
                      label="Ghi chú xử lý"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng nhập nội dung xử lý!",
                        },
                      ]}
                    >
                      <Input.TextArea
                        rows={3}
                        placeholder="Mô tả kết quả kiểm tra, cách xử lý..."
                      />
                    </Form.Item>

                    <Tooltip title="Nếu là hoàn tiền, hệ thống chỉ tạo giao dịch chờ xác nhận. Sau khi admin thanh toán thực tế cho khách, bấm xác nhận đã hoàn tiền.">
                      <Button
                        type="primary"
                        icon={<CheckCircleOutlined />}
                        loading={processing}
                        onClick={submitProcess}
                      >
                        {isRefundProcess
                          ? "Tạo giao dịch hoàn tiền"
                          : "Hoàn tất xử lý"}
                      </Button>
                    </Tooltip>
                  </Form>
                </Card>
              )}

            <Card
              title="Lịch sử xử lý"
              size="small"
              className={styles.timelineCard}
            >
              {histories.length > 0 ? (
                <Timeline
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
              ) : (
                <div className={styles.muted}>
                  Chưa có lịch sử xử lý cho yêu cầu này.
                </div>
              )}
            </Card>

            {transactions.length > 0 && (
              <Card
                title="Giao dịch liên quan"
                size="small"
                className={styles.timelineCard}
              >
                <Timeline
                  items={transactions.map((transaction) => ({
                    children: (
                      <div>
                        <Text strong>
                          {transaction.LoaiGiaoDich || "Giao dịch"} -{" "}
                          {fmt(transaction.SoTien)}
                        </Text>

                        <div className={styles.muted}>
                          Trạng thái: {renderPaymentStatus(transaction.TrangThai)}
                        </div>

                        <div className={styles.muted}>
                          Mã tham chiếu: {transaction.MaThamChieu || "Không có"}
                        </div>
                      </div>
                    ),
                  }))}
                />
              </Card>
            )}
          </div>
        )}
      </Modal>
    </Card>
  );
}