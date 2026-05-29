import { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Switch,
  Tag,
  Tooltip,
  message,
  Space,
  Row,
  Col,
  Divider,
  Empty,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  TagOutlined,
  SearchOutlined,
  ReloadOutlined,
  GiftOutlined,
  TruckOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  StopOutlined,
  CopyOutlined,
  TagsOutlined,
  DownloadOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";
import { exportExcelReport } from "../Utility/excelExport";
import styles from "./AdminPromotions.module.css";

const API_BASE = "https://ceramic-shop-u8ak.onrender.com/api/v1";

const fmt = (v) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(v ?? 0);

const formatInputNumber = (value) => {
  if (value === undefined || value === null || value === "") return "";

  return `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const parseInputNumber = (value) => {
  if (value === undefined || value === null || value === "") return undefined;

  const raw = String(value)
    .replace(/,/g, "")
    .replace(/[^\d.-]/g, "");

  if (!raw || raw === "-" || raw === ".") return undefined;

  const parsed = Number(raw);

  return Number.isNaN(parsed) ? undefined : parsed;
};

const toNumberOrUndefined = (value) => {
  if (value === undefined || value === null || value === "") return undefined;

  const parsed = Number(value);

  return Number.isNaN(parsed) ? undefined : parsed;
};

const toNumberOrNull = (value) => {
  const parsed = toNumberOrUndefined(value);

  return parsed === undefined ? null : parsed;
};

const normalizeDateForApi = (value) => {
  if (!value) return null;

  return dayjs(value).format("YYYY-MM-DD HH:mm:ss");
};

const token = () =>
  localStorage.getItem("admin_token") || localStorage.getItem("customer_token");

const authH = () => ({
  headers: {
    Authorization: `Bearer ${token()}`,
  },
  withCredentials: true,
});

const VOUCHER_TYPE_LABEL = {
  1: "Giảm đơn hàng",
  2: "Freeship",
};

const VOUCHER_TYPE_COLOR = {
  1: "blue",
  2: "cyan",
};

const normalizeListResponse = (payload) => {
  const list =
    payload?.result || payload?.categories || payload?.data || payload;

  return Array.isArray(list) ? list : [];
};

const getPromotionCategory = (promo) =>
  promo?.DanhMucSanPham || promo?.category || promo?.Category || null;

function statusInfo(promo) {
  const now = new Date();
  const start = new Date(promo.NgayBatDau);
  const end = new Date(promo.NgayKetThuc);

  if (Number(promo.TrangThai) === 0) {
    return {
      label: "Đã tắt",
      color: "default",
      icon: <StopOutlined />,
    };
  }

  if (now < start) {
    return {
      label: "Chưa bắt đầu",
      color: "orange",
      icon: <ClockCircleOutlined />,
    };
  }

  if (now > end) {
    return {
      label: "Hết hạn",
      color: "red",
      icon: <StopOutlined />,
    };
  }

  return {
    label: "Đang chạy",
    color: "green",
    icon: <CheckCircleOutlined />,
  };
}

export default function AdminPromotions() {
  const [promos, setPromos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingExport, setLoadingExport] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [form] = Form.useForm();

  const kmType = Form.useWatch("MaLoaiKM", form);

  useEffect(() => {
    fetchPromos();
    fetchCategories();
  }, []);

  const getCategoryName = (promo) => {
    const relationCategory = getPromotionCategory(promo);

    if (relationCategory?.TenDanhMuc) {
      return relationCategory.TenDanhMuc;
    }

    if (!promo?.MaDanhMuc) {
      return "Toàn shop";
    }

    const category = categories.find(
      (item) => Number(item.MaDanhMuc) === Number(promo.MaDanhMuc),
    );

    return category?.TenDanhMuc || `Danh mục #${promo.MaDanhMuc}`;
  };

  const fetchPromos = async () => {
    setLoading(true);

    try {
      const res = await axios.get(`${API_BASE}/admin/promotions`, authH());

      setPromos(res.data?.result || []);
    } catch (err) {
      message.error(
        err.response?.data?.message || "Không thể tải danh sách khuyến mãi!",
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    setCategoryLoading(true);

    try {
      const res = await axios.get(`${API_BASE}/categories`, authH());

      setCategories(normalizeListResponse(res.data));
    } catch (err) {
      message.error(
        err.response?.data?.message || "Không thể tải danh mục sản phẩm!",
      );
    } finally {
      setCategoryLoading(false);
    }
  };

  const handleExportReport = async () => {
    try {
      setLoadingExport(true);

      await exportExcelReport({
        url: `${API_BASE}/admin/promotions/export`,
        params: {
          search: searchText,
          status: filterStatus !== "all" ? filterStatus : undefined,
          type: filterType !== "all" ? filterType : undefined,
        },
        axiosConfig: authH(),
        fileName: `Bao_Cao_Khuyen_Mai_${dayjs().format("DDMMYYYY_HHmm")}.xlsx`,
      });

      message.success("Tải báo cáo thành công!");
    } catch (error) {
      console.error(error);
      message.error("Có lỗi xảy ra khi tải báo cáo Excel!");
    } finally {
      setLoadingExport(false);
    }
  };

  const openCreate = () => {
    setEditRecord(null);
    form.resetFields();
    form.setFieldsValue({
      MaLoaiKM: 1,
      LoaiVoucher: 1,
      TrangThai: true,
      SoLuong: 100,
      MaDanhMuc: null,
    });
    setModalOpen(true);
  };

  const openEdit = (record) => {
    setEditRecord(record);
    form.setFieldsValue({
      ...record,
      MaLoaiKM: toNumberOrUndefined(record.MaLoaiKM),
      LoaiVoucher: toNumberOrUndefined(record.LoaiVoucher),
      GiaTri: toNumberOrUndefined(record.GiaTri),
      GiamToiDa: toNumberOrUndefined(record.GiamToiDa),
      GiaTriToiThieu: toNumberOrUndefined(record.GiaTriToiThieu),
      SoLuong: toNumberOrUndefined(record.SoLuong),
      TrangThai: Number(record.TrangThai) === 1,
      NgayBatDau: record.NgayBatDau ? dayjs(record.NgayBatDau) : null,
      NgayKetThuc: record.NgayKetThuc ? dayjs(record.NgayKetThuc) : null,
      MaDanhMuc: toNumberOrNull(record.MaDanhMuc),
    });
    setModalOpen(true);
  };

  const handleSave = async (values) => {
    setSaving(true);

    try {
      const start = values.NgayBatDau;
      const end = values.NgayKetThuc;

      if (!start || !end) {
        message.error("Vui lòng chọn ngày bắt đầu và ngày kết thúc!");
        return;
      }

      if (!dayjs(end).isAfter(dayjs(start))) {
        message.error("Ngày kết thúc phải lớn hơn ngày bắt đầu!");
        return;
      }

      const payload = {
        TenKhuyenMai: values.TenKhuyenMai?.trim(),
        MaCode: values.MaCode?.trim()
          ? values.MaCode.trim().toUpperCase()
          : null,
        MaLoaiKM: Number(values.MaLoaiKM),
        LoaiVoucher: Number(values.LoaiVoucher),
        GiaTri: Number(values.GiaTri),
        GiaTriToiThieu:
          values.GiaTriToiThieu === undefined ||
          values.GiaTriToiThieu === null ||
          values.GiaTriToiThieu === ""
            ? null
            : Number(values.GiaTriToiThieu),
        GiamToiDa:
          values.GiamToiDa === undefined ||
          values.GiamToiDa === null ||
          values.GiamToiDa === ""
            ? null
            : Number(values.GiamToiDa),
        NgayBatDau: normalizeDateForApi(values.NgayBatDau),
        NgayKetThuc: normalizeDateForApi(values.NgayKetThuc),
        TrangThai: values.TrangThai ? 1 : 0,
        SoLuong: Number(values.SoLuong),
        MaDanhMuc: values.MaDanhMuc ? Number(values.MaDanhMuc) : null,
      };

      if (editRecord) {
        await axios.put(
          `${API_BASE}/admin/promotions/${editRecord.MaKhuyenMai}`,
          payload,
          authH(),
        );

        message.success("Cập nhật khuyến mãi thành công!");
      } else {
        await axios.post(`${API_BASE}/admin/promotions`, payload, authH());

        message.success("Tạo khuyến mãi thành công!");
      }

      setModalOpen(false);
      fetchPromos();
    } catch (err) {
      message.error(err.response?.data?.message || "Thao tác thất bại!");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (record) => {
    try {
      const newStatus = Number(record.TrangThai) === 1 ? 0 : 1;

      await axios.patch(
        `${API_BASE}/admin/promotions/${record.MaKhuyenMai}/status`,
        {
          TrangThai: newStatus,
        },
        authH(),
      );

      message.success(
        newStatus === 1 ? "Đã bật khuyến mãi!" : "Đã tắt khuyến mãi!",
      );

      fetchPromos();
    } catch (err) {
      message.error(err.response?.data?.message || "Không thể cập nhật!");
    }
  };

  const handleCopyCode = (code) => {
    if (!code) {
      message.warning("Khuyến mãi này chưa có mã code!");
      return;
    }

    navigator.clipboard.writeText(code);
    message.success(`Đã sao chép mã: ${code}`);
  };

  const now = new Date();

  const statsActive = promos.filter(
    (p) =>
      Number(p.TrangThai) === 1 &&
      new Date(p.NgayBatDau) <= now &&
      new Date(p.NgayKetThuc) >= now,
  ).length;

  const statsExpired = promos.filter(
    (p) => Number(p.TrangThai) === 0 || new Date(p.NgayKetThuc) < now,
  ).length;

  const statsPending = promos.filter(
    (p) => Number(p.TrangThai) === 1 && new Date(p.NgayBatDau) > now,
  ).length;

  const filtered = promos.filter((p) => {
    const categoryName = getCategoryName(p);
    const st = statusInfo(p).label;

    const matchSearch =
      !searchText ||
      p.TenKhuyenMai?.toLowerCase().includes(searchText.toLowerCase()) ||
      p.MaCode?.toLowerCase().includes(searchText.toLowerCase()) ||
      categoryName.toLowerCase().includes(searchText.toLowerCase());

    const matchStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && st === "Đang chạy") ||
      (filterStatus === "pending" && st === "Chưa bắt đầu") ||
      (filterStatus === "expired" && (st === "Hết hạn" || st === "Đã tắt"));

    const matchType =
      filterType === "all" || String(p.LoaiVoucher) === filterType;

    const matchCategory =
      filterCategory === "all" ||
      (filterCategory === "shop" && !p.MaDanhMuc) ||
      String(p.MaDanhMuc) === filterCategory;

    return matchSearch && matchStatus && matchType && matchCategory;
  });

  const columns = [
    {
      title: "Mã / Tên",
      key: "name",
      width: 190,
      render: (_, r) => (
        <div className={styles.cellName}>
          <div className={styles.cellTitle}>{r.TenKhuyenMai}</div>

          {r.MaCode && (
            <div className={styles.codeRow}>
              <code className={styles.code}>{r.MaCode}</code>

              <Tooltip title="Sao chép">
                <CopyOutlined
                  className={styles.copyIcon}
                  onClick={() => handleCopyCode(r.MaCode)}
                />
              </Tooltip>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Loại",
      key: "type",
      width: 130,
      render: (_, r) => (
        <div className={styles.cellTags}>
          <Tag
            className={styles.compactTag}
            color={VOUCHER_TYPE_COLOR[Number(r.LoaiVoucher)] || "blue"}
            icon={
              Number(r.LoaiVoucher) === 2 ? <TruckOutlined /> : <GiftOutlined />
            }
          >
            {VOUCHER_TYPE_LABEL[Number(r.LoaiVoucher)] || "Giảm giá"}
          </Tag>

          <Tag
            className={styles.compactTag}
            color={Number(r.MaLoaiKM) === 1 ? "purple" : "magenta"}
          >
            {Number(r.MaLoaiKM) === 1 ? "%" : "VNĐ"}
          </Tag>
        </div>
      ),
    },
    {
      title: "Danh mục",
      key: "category",
      width: 155,
      render: (_, r) => (
        <Tag
          className={styles.categoryTag}
          color={r.MaDanhMuc ? "geekblue" : "default"}
          icon={r.MaDanhMuc ? <AppstoreOutlined /> : <TagsOutlined />}
        >
          {getCategoryName(r)}
        </Tag>
      ),
    },
    {
      title: "Giá trị",
      key: "value",
      width: 145,
      render: (_, r) => (
        <div className={styles.cellValue}>
          <span className={styles.valueMain}>
            {Number(r.MaLoaiKM) === 1 ? `${Number(r.GiaTri)}%` : fmt(r.GiaTri)}
          </span>

          {Number(r.GiamToiDa || 0) > 0 && (
            <span className={styles.valueSub}>Tối đa {fmt(r.GiamToiDa)}</span>
          )}

          {Number(r.GiaTriToiThieu || 0) > 0 && (
            <span className={styles.valueSub}>
              Đơn tối thiểu {fmt(r.GiaTriToiThieu)}
            </span>
          )}
        </div>
      ),
    },
    {
      title: "Thời hạn",
      key: "dates",
      width: 110,
      render: (_, r) => (
        <div className={styles.cellDates}>
          <div>{dayjs(r.NgayBatDau).format("DD/MM/YYYY")}</div>
          <div>{dayjs(r.NgayKetThuc).format("DD/MM/YYYY")}</div>
        </div>
      ),
    },
    {
      title: "Lượt còn",
      key: "quota",
      width: 80,
      align: "center",
      render: (_, r) => (
        <div className={styles.cellQuota}>
          <span
            className={
              Number(r.SoLuong) === 0 ? styles.quotaEmpty : styles.quotaOk
            }
          >
            {r.SoLuong}
          </span>
          <span className={styles.quotaLabel}>lượt</span>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      key: "status",
      width: 165,
      render: (_, r) => {
        const st = statusInfo(r);

        return (
          <div className={styles.cellStatus}>
            <Tag className={styles.statusTag} color={st.color} icon={st.icon}>
              {st.label}
            </Tag>

            <Switch
              size="small"
              checked={Number(r.TrangThai) === 1}
              onChange={() => handleToggleStatus(r)}
              className={styles.statusSwitch}
            />
          </div>
        );
      },
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 55,
      align: "center",
      render: (_, r) => (
        <Space size={2} className={styles.actionSpace}>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              className={styles.btnEdit}
              onClick={() => openEdit(r)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <TagsOutlined className={styles.headerIcon} />

          <div>
            <h1 className={styles.pageTitle}>Quản lý Khuyến mãi</h1>
            <p className={styles.pageSub}>
              Tạo và quản lý các mã voucher, chương trình ưu đãi
            </p>
          </div>
        </div>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          className={styles.btnCreate}
          onClick={openCreate}
        >
          Tạo khuyến mãi
        </Button>
      </div>

      <Row gutter={[14, 14]} className={styles.statsRow}>
        {[
          {
            label: "Tổng",
            value: promos.length,
            color: "#1b437c",
            bg: "#e8f0fe",
            icon: <TagOutlined />,
          },
          {
            label: "Đang chạy",
            value: statsActive,
            color: "#52c41a",
            bg: "#f6ffed",
            icon: <CheckCircleOutlined />,
          },
          {
            label: "Chờ bắt đầu",
            value: statsPending,
            color: "#fa8c16",
            bg: "#fff7e6",
            icon: <ClockCircleOutlined />,
          },
          {
            label: "Hết hạn / Đã tắt",
            value: statsExpired,
            color: "#ff4d4f",
            bg: "#fff1f0",
            icon: <StopOutlined />,
          },
        ].map((s, i) => (
          <Col xs={12} sm={6} key={i}>
            <div
              className={styles.statCard}
              style={{
                "--c": s.color,
                "--bg": s.bg,
              }}
            >
              <div className={styles.statIcon}>{s.icon}</div>
              <div className={styles.statNum}>{s.value}</div>
              <div className={styles.statLabel}>{s.label}</div>
            </div>
          </Col>
        ))}
      </Row>

      <div className={styles.toolbar}>
        <Input
          prefix={<SearchOutlined style={{ color: "#bbb" }} />}
          placeholder="Tìm tên, mã voucher hoặc danh mục..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
          className={styles.searchInput}
        />

        <Select
          value={filterStatus}
          onChange={setFilterStatus}
          className={styles.filterSelect}
        >
          <Select.Option value="all">Tất cả trạng thái</Select.Option>
          <Select.Option value="active">Đang chạy</Select.Option>
          <Select.Option value="pending">Chờ bắt đầu</Select.Option>
          <Select.Option value="expired">Hết hạn / Đã tắt</Select.Option>
        </Select>

        <Select
          value={filterType}
          onChange={setFilterType}
          className={styles.filterSelect}
        >
          <Select.Option value="all">Tất cả loại</Select.Option>
          <Select.Option value="1">Giảm đơn hàng</Select.Option>
          <Select.Option value="2">Freeship</Select.Option>
        </Select>

        <Select
          value={filterCategory}
          onChange={setFilterCategory}
          className={styles.filterSelect}
          loading={categoryLoading}
          showSearch
          optionFilterProp="children"
        >
          <Select.Option value="all">Tất cả danh mục</Select.Option>
          <Select.Option value="shop">Toàn shop</Select.Option>
          {categories.map((category) => (
            <Select.Option
              key={category.MaDanhMuc}
              value={String(category.MaDanhMuc)}
            >
              {category.ParentID ? "— " : ""}
              {category.TenDanhMuc}
            </Select.Option>
          ))}
        </Select>

        <Button
          icon={<ReloadOutlined />}
          onClick={fetchPromos}
          className={styles.btnRefresh}
        />

        <Button
          type="primary"
          icon={<DownloadOutlined />}
          onClick={handleExportReport}
          loading={loadingExport}
          style={{ marginLeft: "auto" }}
        >
          Xuất báo cáo
        </Button>
      </div>

      <div className={styles.tableWrap}>
        <Table
          columns={columns}
          dataSource={filtered}
          rowKey="MaKhuyenMai"
          loading={loading}
          pagination={{
            pageSize: 10,
            showTotal: (total) => `${total} khuyến mãi`,
            showSizeChanger: false,
          }}
          className={styles.table}
          locale={{
            emptyText: (
              <Empty
                description="Chưa có khuyến mãi nào"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ),
          }}
        />
      </div>

      <Modal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        title={
          <div className={styles.modalTitle}>
            {editRecord ? <EditOutlined /> : <PlusOutlined />}
            {editRecord ? " Chỉnh sửa khuyến mãi" : " Tạo khuyến mãi mới"}
          </div>
        }
        footer={null}
        width={680}
        destroyOnHidden
        className={styles.modal}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          scrollToFirstError
        >
          <div className={styles.formGrid2}>
            <Form.Item
              name="TenKhuyenMai"
              label="Tên khuyến mãi"
              rules={[
                {
                  required: true,
                  message: "Nhập tên!",
                },
                {
                  whitespace: true,
                  message: "Tên khuyến mãi không được để trống!",
                },
              ]}
            >
              <Input
                placeholder="VD: Giảm 50k cho đơn từ 300k"
                className={styles.input}
              />
            </Form.Item>

            <Form.Item
              name="MaCode"
              label="Mã code (không bắt buộc)"
              rules={[
                {
                  pattern: /^[A-Z0-9_-]{3,30}$/,
                  message:
                    "Mã code gồm chữ hoa, số, - hoặc _, từ 3 đến 30 ký tự!",
                },
              ]}
            >
              <Input
                placeholder="VD: SALE50K"
                className={styles.input}
                style={{ textTransform: "uppercase" }}
                onChange={(e) =>
                  form.setFieldValue("MaCode", e.target.value.toUpperCase())
                }
              />
            </Form.Item>
          </div>

          <div className={styles.formGrid2}>
            <Form.Item
              name="LoaiVoucher"
              label="Loại voucher"
              rules={[
                {
                  required: true,
                  message: "Chọn loại!",
                },
              ]}
            >
              <Select className={styles.select}>
                <Select.Option value={1}>
                  <GiftOutlined /> Giảm đơn hàng
                </Select.Option>

                <Select.Option value={2}>
                  <TruckOutlined /> Freeship
                </Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="MaLoaiKM"
              label="Kiểu giảm giá"
              rules={[
                {
                  required: true,
                  message: "Chọn kiểu!",
                },
              ]}
            >
              <Select className={styles.select}>
                <Select.Option value={1}>Phần trăm (%)</Select.Option>
                <Select.Option value={2}>Số tiền cố định (VNĐ)</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="MaDanhMuc"
              label="Danh mục áp dụng"
              tooltip="Để trống nếu voucher áp dụng cho toàn shop. Chọn danh mục nếu voucher chỉ áp dụng cho sản phẩm thuộc danh mục đó."
            >
              <Select
                allowClear
                showSearch
                loading={categoryLoading}
                placeholder="Toàn shop"
                optionFilterProp="children"
                className={styles.select}
              >
                {categories.map((category) => (
                  <Select.Option
                    key={category.MaDanhMuc}
                    value={category.MaDanhMuc}
                  >
                    {category.ParentID ? "— " : ""}
                    {category.TenDanhMuc}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          <div className={styles.formGrid3}>
            <Form.Item
              name="GiaTri"
              label={kmType === 1 ? "Giá trị (%)" : "Giá trị (VNĐ)"}
              dependencies={["MaLoaiKM"]}
              rules={[
                {
                  validator(_, value) {
                    const currentKmType = Number(
                      form.getFieldValue("MaLoaiKM"),
                    );
                    const numberValue = Number(value);

                    if (value === undefined || value === null || value === "") {
                      return Promise.reject(new Error("Nhập giá trị!"));
                    }

                    if (!Number.isFinite(numberValue) || numberValue <= 0) {
                      return Promise.reject(new Error("Phải > 0!"));
                    }

                    if (currentKmType === 1 && numberValue > 100) {
                      return Promise.reject(new Error("Tối đa 100%!"));
                    }

                    return Promise.resolve();
                  },
                },
              ]}
            >
              <InputNumber
                min={0}
                max={kmType === 1 ? 100 : undefined}
                suffix={kmType === 1 ? "%" : "₫"}
                formatter={(value) =>
                  kmType === 2 ? formatInputNumber(value) : value
                }
                parser={parseInputNumber}
                className={styles.inputNum}
                style={{ width: "100%" }}
              />
            </Form.Item>

            <Form.Item
              name="GiamToiDa"
              label="Giảm tối đa (VNĐ)"
              tooltip={
                kmType === 1
                  ? "Áp dụng khi giảm %"
                  : "Để trống nếu không giới hạn"
              }
            >
              <InputNumber
                min={0}
                formatter={formatInputNumber}
                parser={parseInputNumber}
                className={styles.inputNum}
                style={{ width: "100%" }}
                placeholder="Không giới hạn"
              />
            </Form.Item>

            <Form.Item name="GiaTriToiThieu" label="Đơn tối thiểu (VNĐ)">
              <InputNumber
                min={0}
                formatter={formatInputNumber}
                parser={parseInputNumber}
                className={styles.inputNum}
                style={{ width: "100%" }}
                placeholder="Không yêu cầu"
              />
            </Form.Item>
          </div>

          <div className={styles.formGrid2}>
            <Form.Item
              name="NgayBatDau"
              label="Ngày bắt đầu"
              rules={[
                {
                  required: true,
                  message: "Chọn ngày!",
                },
              ]}
            >
              <DatePicker
                showTime
                format="DD/MM/YYYY HH:mm"
                placeholder="Chọn ngày bắt đầu"
                style={{ width: "100%" }}
              />
            </Form.Item>

            <Form.Item
              name="NgayKetThuc"
              label="Ngày kết thúc"
              dependencies={["NgayBatDau"]}
              rules={[
                {
                  required: true,
                  message: "Chọn ngày!",
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const start = getFieldValue("NgayBatDau");

                    if (
                      !value ||
                      !start ||
                      dayjs(value).isAfter(dayjs(start))
                    ) {
                      return Promise.resolve();
                    }

                    return Promise.reject(
                      new Error("Ngày kết thúc phải lớn hơn ngày bắt đầu!"),
                    );
                  },
                }),
              ]}
            >
              <DatePicker
                showTime
                format="DD/MM/YYYY HH:mm"
                placeholder="Chọn ngày kết thúc"
                style={{ width: "100%" }}
              />
            </Form.Item>
          </div>

          <div className={styles.formGrid2}>
            <Form.Item
              name="SoLuong"
              label="Số lượt dùng"
              rules={[
                {
                  required: true,
                  message: "Nhập số lượt!",
                },
                {
                  type: "integer",
                  min: 1,
                  message: "Số lượt phải là số nguyên lớn hơn 0!",
                },
              ]}
            >
              <InputNumber
                min={1}
                precision={0}
                style={{ width: "100%" }}
                className={styles.inputNum}
              />
            </Form.Item>

            <Form.Item
              name="TrangThai"
              label="Kích hoạt"
              valuePropName="checked"
            >
              <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
            </Form.Item>
          </div>

          <Divider style={{ margin: "8px 0 16px" }} />

          <div
            style={{
              display: "flex",
              gap: 10,
              justifyContent: "flex-end",
            }}
          >
            <Button onClick={() => setModalOpen(false)}>Huỷ</Button>

            <Button
              type="primary"
              htmlType="submit"
              loading={saving}
              className={styles.btnSave}
            >
              {editRecord ? "Lưu thay đổi" : "Tạo khuyến mãi"}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
