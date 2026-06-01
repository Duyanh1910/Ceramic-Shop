import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Descriptions,
  Empty,
  Form,
  Input,
  message,
  Modal,
  Radio,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  Tooltip,
  Typography,
  Image,
} from "antd";
import {
  AlertOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DownloadOutlined,
  EditOutlined,
  EyeOutlined,
  ReloadOutlined,
  SearchOutlined,
  StopOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";
import { useSearchParams } from "react-router-dom";
import { exportExcelReport } from "../Utility/excelExport";
import styles from "./AdminRisks.module.css";

import { API_BASE } from "../config/api";

const { Title, Text } = Typography;
const ALL_VALUE = "all";
const PAGE_SIZE = 10;

const RISK_STATUS = {
  UNHANDLED: 0,
  RESOLVED: 1,
  PROCESSING: 2,
  IGNORED: 3,
};

const STATUS_OPTIONS = [
  { label: "Tất cả", value: ALL_VALUE },
  { label: "Chưa xử lý", value: RISK_STATUS.UNHANDLED },
  { label: "Đã xử lý", value: RISK_STATUS.RESOLVED },
  { label: "Đang xử lý", value: RISK_STATUS.PROCESSING },
  { label: "Bỏ qua", value: RISK_STATUS.IGNORED },
];

const STATUS_FORM_OPTIONS = [
  { label: "Chưa xử lý", value: RISK_STATUS.UNHANDLED },
  { label: "Đang xử lý", value: RISK_STATUS.PROCESSING },
  { label: "Đã xử lý", value: RISK_STATUS.RESOLVED },
  { label: "Bỏ qua", value: RISK_STATUS.IGNORED },
];

const RISK_LEVEL_LABEL = {
  THAP: "Thấp",
  BINH_THUONG: "Bình thường",
  CAO: "Cao",
  KHAN_CAP: "Khẩn cấp",
};

const RISK_LEVEL_COLOR = {
  THAP: "default",
  BINH_THUONG: "blue",
  CAO: "orange",
  KHAN_CAP: "red",
};

const LEVEL_OPTIONS = [
  { label: "Tất cả mức độ", value: ALL_VALUE },
  { label: "Thấp", value: "THAP" },
  { label: "Bình thường", value: "BINH_THUONG" },
  { label: "Cao", value: "CAO" },
  { label: "Khẩn cấp", value: "KHAN_CAP" },
];

const LEVEL_FORM_OPTIONS = LEVEL_OPTIONS.filter(
  (item) => item.value !== ALL_VALUE,
);

const RISK_SOURCE_LABEL = {
  HE_THONG: "Hệ thống",
  NHAN_VIEN: "Nhân viên",
  KHACH_HANG: "Khách hàng",
  THANH_TOAN: "Thanh toán",
  VAN_CHUYEN: "Vận chuyển",
};

const RISK_SOURCE_COLOR = {
  HE_THONG: "purple",
  NHAN_VIEN: "geekblue",
  KHACH_HANG: "cyan",
  THANH_TOAN: "magenta",
  VAN_CHUYEN: "volcano",
};

const SOURCE_OPTIONS = [
  { label: "Tất cả nguồn", value: ALL_VALUE },
  { label: "Hệ thống", value: "HE_THONG" },
  { label: "Nhân viên", value: "NHAN_VIEN" },
  { label: "Khách hàng", value: "KHACH_HANG" },
  { label: "Thanh toán", value: "THANH_TOAN" },
  { label: "Vận chuyển", value: "VAN_CHUYEN" },
];

const SOURCE_FORM_OPTIONS = SOURCE_OPTIONS.filter(
  (item) => item.value !== ALL_VALUE,
);

const getToken = () =>
  localStorage.getItem("admin_token") ||
  localStorage.getItem("customer_token") ||
  localStorage.getItem("token");

const authConfig = () => {
  const token = getToken();

  return {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
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

  if (statusNumber === RISK_STATUS.UNHANDLED) {
    return (
      <Tag color="gold" icon={<ClockCircleOutlined />}>
        Chưa xử lý
      </Tag>
    );
  }

  if (statusNumber === RISK_STATUS.PROCESSING) {
    return (
      <Tag color="blue" icon={<WarningOutlined />}>
        Đang xử lý
      </Tag>
    );
  }

  if (statusNumber === RISK_STATUS.RESOLVED) {
    return (
      <Tag color="green" icon={<CheckCircleOutlined />}>
        Đã xử lý
      </Tag>
    );
  }

  if (statusNumber === RISK_STATUS.IGNORED) {
    return (
      <Tag color="default" icon={<StopOutlined />}>
        Bỏ qua
      </Tag>
    );
  }

  return <Tag>{status}</Tag>;
};

const renderLevel = (level) => (
  <Tag color={RISK_LEVEL_COLOR[level] || "default"}>
    {RISK_LEVEL_LABEL[level] || level || "Không rõ"}
  </Tag>
);

const renderSource = (source) => (
  <Tag color={RISK_SOURCE_COLOR[source] || "default"}>
    {RISK_SOURCE_LABEL[source] || source || "Không rõ"}
  </Tag>
);

const renderHandledDate = (value, status) => {
  if (value) {
    return dayjs(value).format("DD/MM/YYYY HH:mm");
  }

  if (
    Number(status) === RISK_STATUS.RESOLVED ||
    Number(status) === RISK_STATUS.IGNORED
  ) {
    return "Chưa có ngày xử lý";
  }

  return "Chưa xử lý";
};

const getOrder = (risk) => risk?.DonHang || risk?.Order || {};
const getOrderItems = (order) =>
  order?.ChiTietDonHangs ||
  order?.OrderDetailModels ||
  order?.OrderDetails ||
  [];

const getVariant = (item) =>
  item?.BienTheSanPham ||
  item?.Variant ||
  item?.VariantModel ||
  {};

const getProduct = (variant) =>
  variant?.SanPham ||
  variant?.Product ||
  variant?.ProductModel ||
  {};

const getVariantImages = (variant) =>
  variant?.HinhAnhBienThes ||
  variant?.VariantImageModels ||
  variant?.VariantImages ||
  [];

const getProductDisplay = (item) => {
  const variant = getVariant(item);
  const product = getProduct(variant);

  return (
    [product?.TenSanPham, variant?.TenBienThe].filter(Boolean).join(" - ") ||
    "Sản phẩm"
  );
};

const getProductImage = (item) => {
  const variant = getVariant(item);
  const product = getProduct(variant);
  const images = getVariantImages(variant);

  return images?.[0]?.DuongDan || product?.Thumbnail || "";
};

const toStaffOption = (staff) => {
  const staffName = staff.TenNhanVien || "Nhân viên";
  const staffPhone = staff.SDT || "Chưa có SĐT";
  const username = staff.TaiKhoan?.Username || "";

  return {
    value: staff.MaNhanVien,
    label: `${staffName} - NV #${staff.MaNhanVien} - ${staffPhone}`,
    searchText:
      `${staff.MaNhanVien} ${staffName} ${staffPhone} ${username}`.toLowerCase(),
  };
};

export default function AdminRisks() {
  const [form] = Form.useForm();
  const [searchParams, setSearchParams] = useSearchParams();
  const riskIdParam = searchParams.get("riskId");

  const [data, setData] = useState([]);
  const [selectedRisk, setSelectedRisk] = useState(null);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingExport, setLoadingExport] = useState(false);

  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(ALL_VALUE);
  const [level, setLevel] = useState(ALL_VALUE);
  const [source, setSource] = useState(ALL_VALUE);

  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [staffOptions, setStaffOptions] = useState([]);
  const [staffLoading, setStaffLoading] = useState(false);

  const fetchStaffOptions = async (keyword = "") => {
    setStaffLoading(true);

    try {
      const res = await axios.get(`${API_BASE}/admin/staffs`, {
        params: {
          page: 1,
          limit: 50,
          search: keyword.trim(),
          sort: "TenNhanVien",
          order: "ASC",
        },
        ...authConfig(),
      });

      const staffs = res.data?.result?.data || [];
      setStaffOptions(staffs.map(toStaffOption));
    } catch (err) {
      message.error(
        err.response?.data?.message || "Không thể tải danh sách nhân viên!",
      );
    } finally {
      setStaffLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffOptions();
  }, []);

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
  }, [page, search, status, level, source]);

  useEffect(() => {
    if (!riskIdParam) return;

    setSelectedRisk(null);
    setIsDetailOpen(true);
    form.resetFields();
    setSearchInput(riskIdParam);
    setSearch(riskIdParam);
    setStatus(ALL_VALUE);
    setLevel(ALL_VALUE);
    setSource(ALL_VALUE);
    setPage(1);
    fetchRiskDetail(riskIdParam);
  }, [riskIdParam]);

  const fetchData = async () => {
    setLoading(true);

    try {
      const res = await axios.get(`${API_BASE}/admin/after_sales/risks`, {
        params: {
          page,
          limit: PAGE_SIZE,
          search: search.trim(),
          status: status === ALL_VALUE ? undefined : status,
          level: level === ALL_VALUE ? undefined : level,
          source: source === ALL_VALUE ? undefined : source,
        },
        ...authConfig(),
      });

      setData(res.data?.result?.data || []);
      setTotalItems(res.data?.result?.totalItems || 0);
    } catch (err) {
      message.error(
        err.response?.data?.message || "Không thể tải danh sách rủi ro!",
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchRiskDetail = async (riskId) => {
    setDetailLoading(true);

    try {
      const res = await axios.get(
        `${API_BASE}/admin/after_sales/risks/${riskId}`,
        authConfig(),
      );

      const risk = res.data?.result || null;

      if (risk?.NhanVienPhuTrach?.MaNhanVien) {
        const assignedStaffOption = toStaffOption(risk.NhanVienPhuTrach);

        setStaffOptions((prev) => {
          const exists = prev.some(
            (item) => item.value === assignedStaffOption.value,
          );

          return exists ? prev : [assignedStaffOption, ...prev];
        });
      }

      setSelectedRisk(risk);

      form.setFieldsValue({
        TrangThai:
          risk?.TrangThai === undefined || risk?.TrangThai === null
            ? RISK_STATUS.UNHANDLED
            : Number(risk.TrangThai),
        MucDo: risk?.MucDo || "BINH_THUONG",
        NguonPhatHien: risk?.NguonPhatHien || "NHAN_VIEN",
        GhiChu: risk?.GhiChu || "",
        MaNhanVienPhuTrach: risk?.MaNhanVienPhuTrach || null,
      });
    } catch (err) {
      message.error(
        err.response?.data?.message || "Không thể tải chi tiết rủi ro!",
      );
    } finally {
      setDetailLoading(false);
    }
  };

  const openDetail = async (record) => {
    setSelectedRisk(null);
    setIsDetailOpen(true);
    form.resetFields();
    await fetchRiskDetail(record.MaRuiRo);
  };

  const closeDetail = () => {
    setIsDetailOpen(false);
    setSelectedRisk(null);
    form.resetFields();

    if (riskIdParam) {
      setSearchParams({});
    }
  };

  const submitRiskUpdate = async () => {
    if (!selectedRisk?.MaRuiRo) return;

    const values = await form.validateFields();
    setSaving(true);

    try {
      const payload = {
        TrangThai: values.TrangThai,
        MucDo: values.MucDo,
        NguonPhatHien: values.NguonPhatHien,
        GhiChu: values.GhiChu || null,
        MaNhanVienPhuTrach: values.MaNhanVienPhuTrach || null,
      };

      const res = await axios.patch(
        `${API_BASE}/admin/after_sales/risks/${selectedRisk.MaRuiRo}`,
        payload,
        authConfig(),
      );

      message.success(res.data?.message || "Cập nhật rủi ro thành công!");
      setSelectedRisk(res.data?.result || null);

      if (res.data?.result?.NhanVienPhuTrach?.MaNhanVien) {
        const assignedStaffOption = toStaffOption(
          res.data.result.NhanVienPhuTrach,
        );

        setStaffOptions((prev) => {
          const exists = prev.some(
            (item) => item.value === assignedStaffOption.value,
          );

          return exists ? prev : [assignedStaffOption, ...prev];
        });
      }

      await fetchData();
    } catch (err) {
      message.error(
        err.response?.data?.message || "Không thể cập nhật rủi ro!",
      );
    } finally {
      setSaving(false);
    }
  };

  const quickChangeStatus = async (risk, nextStatus) => {
    setSaving(true);

    try {
      const res = await axios.patch(
        `${API_BASE}/admin/after_sales/risks/${risk.MaRuiRo}/status`,
        {
          TrangThai: nextStatus,
          GhiChu:
            nextStatus === RISK_STATUS.PROCESSING
              ? "Admin chuyển rủi ro sang trạng thái đang xử lý"
              : nextStatus === RISK_STATUS.RESOLVED
                ? "Admin xác nhận rủi ro đã được xử lý"
                : nextStatus === RISK_STATUS.IGNORED
                  ? "Admin bỏ qua rủi ro"
                  : "Admin cập nhật trạng thái rủi ro",
        },
        authConfig(),
      );

      message.success(res.data?.message || "Cập nhật trạng thái thành công!");

      if (selectedRisk?.MaRuiRo === risk.MaRuiRo) {
        setSelectedRisk(res.data?.result || null);
        form.setFieldValue("TrangThai", nextStatus);
      }

      await fetchData();
    } catch (err) {
      message.error(
        err.response?.data?.message || "Không thể cập nhật trạng thái!",
      );
    } finally {
      setSaving(false);
    }
  };

  const resetFilters = () => {
    setSearchInput("");
    setSearch("");
    setStatus(ALL_VALUE);
    setLevel(ALL_VALUE);
    setSource(ALL_VALUE);
    setPage(1);
  };

  const handleExportReport = async () => {
    setLoadingExport(true);

    try {
      await exportExcelReport({
        url: `${API_BASE}/admin/after_sales/risks/export`,
        params: {
          search: search.trim(),
          status: status === ALL_VALUE ? undefined : status,
          level: level === ALL_VALUE ? undefined : level,
          source: source === ALL_VALUE ? undefined : source,
        },
        axiosConfig: authConfig(),
        fileName: `Bao_Cao_Rui_Ro_${dayjs().format("DDMMYYYY_HHmm")}.xlsx`,
      });

      message.success("Tải báo cáo rủi ro thành công!");
    } catch (err) {
      console.error(err);
      message.error("Có lỗi xảy ra khi tải báo cáo rủi ro!");
    } finally {
      setLoadingExport(false);
    }
  };

  const columns = [
    {
      title: "Đơn hàng",
      key: "order",
      width: 170,
      render: (_, record) => {
        const order = getOrder(record);

        return (
          <div className={styles.orderCell}>
            <Text strong className={styles.orderCode}>
              {order?.MaHienThi || `#${record.MaDonHang || "N/A"}`}
            </Text>

            <Text type="secondary" className={styles.smallText}>
              RR #{record.MaRuiRo}
            </Text>

            <Text type="secondary" className={styles.smallText}>
              {order?.TenNguoiNhan || "Không rõ khách"}
            </Text>
          </div>
        );
      },
    },
    {
      title: "Nội dung rủi ro",
      key: "risk",
      render: (_, record) => (
        <div className={styles.riskCell}>
          <Text strong className={styles.riskType}>
            {record.LoaiRuiRo || "Rủi ro"}
          </Text>

          <Text type="secondary" className={styles.riskDesc}>
            {record.MoTa || "Không có mô tả"}
          </Text>

          <Space size={4} wrap className={styles.tagLine}>
            {renderLevel(record.MucDo)}
            {renderSource(record.NguonPhatHien)}
          </Space>
        </div>
      ),
    },
    {
      title: "Ngày ghi nhận",
      dataIndex: "NgayPhatHien",
      key: "NgayPhatHien",
      width: 150,
      render: (value) =>
        value ? dayjs(value).format("DD/MM/YYYY HH:mm") : "Không rõ",
    },
    {
      title: "Ngày xử lý",
      dataIndex: "NgayXuLy",
      key: "NgayXuLy",
      width: 150,
      render: (value, record) => renderHandledDate(value, record.TrangThai),
    },
    {
      title: "Trạng thái",
      dataIndex: "TrangThai",
      key: "TrangThai",
      width: 130,
      render: renderStatus,
    },
    {
      title: "Thao tác",
      key: "action",
      width: 150,
      render: (_, record) => (
        <Space size={4}>
          <Tooltip title="Xem chi tiết / xử lý">
            <Button
              size="small"
              type="primary"
              ghost
              icon={<EyeOutlined />}
              onClick={() => openDetail(record)}
            >
              Chi tiết
            </Button>
          </Tooltip>

          {Number(record.TrangThai) === RISK_STATUS.UNHANDLED && (
            <Tooltip title="Chuyển sang đang xử lý">
              <Button
                size="small"
                icon={<EditOutlined />}
                loading={saving}
                onClick={() =>
                  quickChangeStatus(record, RISK_STATUS.PROCESSING)
                }
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  const detailOrder = getOrder(selectedRisk);
  const detailItems = getOrderItems(detailOrder);

  return (
    <Card
      bordered={false}
      className={styles.riskCard}
      title={
        <Space>
          <AlertOutlined className={styles.titleIcon} />
          <Title level={4} style={{ margin: 0 }}>
            Quản lý rủi ro & sự cố
          </Title>
        </Space>
      }
    >
      <Alert
        type="info"
        showIcon
        className={styles.infoAlert}
        message="Rủi ro là dữ liệu nội bộ, dùng để theo dõi sự cố vận chuyển, giao sai, thiếu hàng, thanh toán hoặc lỗi phát sinh từ bảo hành/đổi trả."
      />

      <div className={styles.toolbar}>
        <Input
          placeholder="Tìm mã đơn, khách hàng, SĐT, loại rủi ro..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          prefix={<SearchOutlined />}
          allowClear
          className={styles.searchInput}
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

        <Select
          value={level}
          options={LEVEL_OPTIONS}
          onChange={(value) => {
            setLevel(value);
            setPage(1);
          }}
          className={styles.filterSelect}
        />

        <Select
          value={source}
          options={SOURCE_OPTIONS}
          onChange={(value) => {
            setSource(value);
            setPage(1);
          }}
          className={styles.filterSelect}
        />

        <Button icon={<ReloadOutlined />} onClick={resetFilters}>
          Làm mới
        </Button>

        <Button
          type="primary"
          icon={<DownloadOutlined />}
          onClick={handleExportReport}
          loading={loadingExport}
        >
          Xuất báo cáo
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="MaRuiRo"
        loading={loading}
        className={styles.table}
        rowClassName={(record) =>
          record.MucDo === "KHAN_CAP"
            ? styles.rowUrgent
            : Number(record.TrangThai) === RISK_STATUS.UNHANDLED
              ? styles.rowUnhandled
              : ""
        }
        pagination={{
          current: page,
          pageSize: PAGE_SIZE,
          total: totalItems,
          showSizeChanger: false,
          showTotal: (total) => `Tổng số: ${total} rủi ro`,
        }}
        onChange={(pagination) => setPage(pagination.current)}
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Chưa có rủi ro nào"
            />
          ),
        }}
      />

      <Modal
        className={styles.riskDetailModal}
        open={isDetailOpen}
        onCancel={closeDetail}
        title={`Chi tiết rủi ro #${selectedRisk?.MaRuiRo || ""}`}
        width={980}
        style={{ top: 24 }}
        footer={[
          <Button key="close" onClick={closeDetail}>
            Đóng
          </Button>,
          <Button
            key="save"
            type="primary"
            loading={saving}
            onClick={submitRiskUpdate}
          >
            Lưu xử lý
          </Button>,
        ]}
        destroyOnHidden
        styles={{
          body: {
            maxHeight: "calc(100vh - 220px)",
            overflowY: "auto",
            paddingRight: 8,
          },
        }}
      >
        <Spin spinning={detailLoading}>
          {selectedRisk ? (
            <div className={styles.detailWrap}>
              <Descriptions
                bordered
                size="small"
                column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
              >
                <Descriptions.Item label="Mã rủi ro">
                  #{selectedRisk.MaRuiRo}
                </Descriptions.Item>

                <Descriptions.Item label="Trạng thái">
                  {renderStatus(selectedRisk.TrangThai)}
                </Descriptions.Item>

                <Descriptions.Item label="Loại rủi ro">
                  {selectedRisk.LoaiRuiRo || "Không rõ"}
                </Descriptions.Item>

                <Descriptions.Item label="Mức độ">
                  {renderLevel(selectedRisk.MucDo)}
                </Descriptions.Item>

                <Descriptions.Item label="Nguồn phát hiện">
                  {renderSource(selectedRisk.NguonPhatHien)}
                </Descriptions.Item>

                <Descriptions.Item label="Nhân viên phụ trách">
                  {selectedRisk.NhanVienPhuTrach?.TenNhanVien ||
                    selectedRisk.MaNhanVienPhuTrach ||
                    "Chưa gán"}
                </Descriptions.Item>

                <Descriptions.Item label="Ngày phát hiện">
                  {selectedRisk.NgayPhatHien
                    ? dayjs(selectedRisk.NgayPhatHien).format(
                        "DD/MM/YYYY HH:mm",
                      )
                    : "Không rõ"}
                </Descriptions.Item>

                <Descriptions.Item label="Ngày xử lý">
                  {renderHandledDate(
                    selectedRisk.NgayXuLy,
                    selectedRisk.TrangThai,
                  )}
                </Descriptions.Item>

                <Descriptions.Item label="Mô tả" span={2}>
                  {selectedRisk.MoTa || "Không có"}
                </Descriptions.Item>

                <Descriptions.Item label="Ghi chú hiện tại" span={2}>
                  {selectedRisk.GhiChu || "Không có"}
                </Descriptions.Item>
              </Descriptions>

              <Card
                size="small"
                title="Thông tin đơn hàng liên quan"
                className={styles.sectionCard}
              >
                <Descriptions
                  bordered
                  size="small"
                  column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
                >
                  <Descriptions.Item label="Mã đơn hàng">
                    <Text copyable>
                      {detailOrder?.MaHienThi ||
                        `#${selectedRisk.MaDonHang || "N/A"}`}
                    </Text>
                  </Descriptions.Item>

                  <Descriptions.Item label="Khách hàng">
                    {detailOrder?.TenNguoiNhan || "Không rõ"}
                  </Descriptions.Item>

                  <Descriptions.Item label="SĐT">
                    {detailOrder?.SDT || "Không rõ"}
                  </Descriptions.Item>

                  <Descriptions.Item label="Tổng thanh toán">
                    <Text strong>{fmt(detailOrder?.TongThanhToan)}</Text>
                  </Descriptions.Item>

                  <Descriptions.Item label="Địa chỉ" span={2}>
                    {detailOrder?.DiaChiGiaoHang || "Không rõ"}
                  </Descriptions.Item>
                </Descriptions>

                {detailItems.length > 0 && (
                  <div className={styles.orderItems}>
                    {detailItems.map((item) => (
                      <div key={item.MaCTDH} className={styles.orderItem}>
                        <Image
                          width={54}
                          height={54}
                          src={getProductImage(item)}
                          fallback="https://via.placeholder.com/54"
                          className={styles.productImage}
                        />

                        <div className={styles.orderItemInfo}>
                          <Text strong>{getProductDisplay(item)}</Text>

                          <Text type="secondary" className={styles.smallText}>
                            Số lượng: {item.SoLuong} · Giá bán:{" "}
                            {fmt(item.GiaBan)}
                          </Text>
                        </div>

                        <Text strong>{fmt(item.ThanhTien)}</Text>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              <Card
                size="small"
                title="Cập nhật xử lý rủi ro"
                className={styles.sectionCard}
              >
                <Form form={form} layout="vertical">
                  <div className={styles.formGrid}>
                    <Form.Item
                      name="TrangThai"
                      label="Trạng thái"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng chọn trạng thái!",
                        },
                      ]}
                    >
                      <Select options={STATUS_FORM_OPTIONS} />
                    </Form.Item>

                    <Form.Item
                      name="MucDo"
                      label="Mức độ"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng chọn mức độ!",
                        },
                      ]}
                    >
                      <Select options={LEVEL_FORM_OPTIONS} />
                    </Form.Item>

                    <Form.Item
                      name="NguonPhatHien"
                      label="Nguồn phát hiện"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng chọn nguồn phát hiện!",
                        },
                      ]}
                    >
                      <Select options={SOURCE_FORM_OPTIONS} />
                    </Form.Item>

                    <Form.Item
                      name="MaNhanVienPhuTrach"
                      label="Nhân viên phụ trách"
                      tooltip="Có thể để trống nếu chưa cần gán nhân viên."
                    >
                      <Select
                        allowClear
                        showSearch
                        loading={staffLoading}
                        options={staffOptions}
                        placeholder="Tìm theo tên, SĐT hoặc mã nhân viên"
                        optionFilterProp="searchText"
                        filterOption={(input, option) =>
                          String(option?.searchText || option?.label || "")
                            .toLowerCase()
                            .includes(input.toLowerCase())
                        }
                        onSearch={fetchStaffOptions}
                        onFocus={() => {
                          if (staffOptions.length === 0) {
                            fetchStaffOptions();
                          }
                        }}
                        notFoundContent={
                          staffLoading ? (
                            <Spin size="small" />
                          ) : (
                            "Không tìm thấy nhân viên"
                          )
                        }
                      />
                    </Form.Item>
                  </div>

                  <Form.Item name="GhiChu" label="Ghi chú xử lý">
                    <Input.TextArea
                      rows={4}
                      placeholder="Nhập hướng xử lý, kết quả xử lý hoặc lý do bỏ qua..."
                    />
                  </Form.Item>
                </Form>
              </Card>
            </div>
          ) : (
            <Empty description="Không có dữ liệu chi tiết" />
          )}
        </Spin>
      </Modal>
    </Card>
  );
}
