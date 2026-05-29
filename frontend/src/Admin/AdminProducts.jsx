import { useState, useEffect } from "react";
import {
  Table,
  Button,
  Input,
  Select,
  Tag,
  Space,
  Modal,
  Form,
  InputNumber,
  message,
  Popconfirm,
  Image,
  Tooltip,
  Switch,
  Upload,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ReloadOutlined,
  UploadOutlined,
  FileImageOutlined,
} from "@ant-design/icons";
import axios from "axios";
import styles from "./AdminTable.module.css";

const API_BASE = "https://ceramic-shop-u8ak.onrender.com/api/v1";
const CDN_CLOUD = "dcmwz0uis";
const CDN_PRESET = "the_creamy_shop";

const MENH_OPTIONS = [
  { value: 30002, label: "Kim" },
  { value: 30003, label: "Mộc" },
  { value: 30004, label: "Thủy" },
  { value: 30005, label: "Hỏa" },
  { value: 30006, label: "Thổ" },
];

const fmt = (p) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    p ?? 0,
  );

const ImagePreviewBox = ({ url, size = 120, emptyText = "Chưa có ảnh" }) => {
  if (!url) {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: 14,
          border: "1px dashed #d9d9d9",
          background: "#fafafa",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#999",
          fontSize: 13,
          textAlign: "center",
          padding: 10,
          lineHeight: 1.4,
        }}
      >
        {emptyText}
      </div>
    );
  }

  return (
    <Image
      src={url}
      width={size}
      height={size}
      preview={{
        mask: "Xem ảnh",
      }}
      style={{
        objectFit: "cover",
        borderRadius: 14,
        border: "1px solid #eee",
        background: "#fff",
        cursor: "pointer",
      }}
    />
  );
};

export default function AdminProducts() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [addModal, setAddModal] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [categories, setCategories] = useState([]);
  
  const [suppliers, setSuppliers] = useState([]); 
  
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();

  const axiosConfig = { withCredentials: true };

  useEffect(() => {
    fetchData();
  }, [page, search]);

  useEffect(() => {
    fetchCategories();
    fetchSuppliers();
  }, []);

  const fetchData = async () => {
    setLoading(true);

    try {
      const res = await axios.get(
        `${API_BASE}/admin/products?page=${page}&limit=10&search=${search}`,
        axiosConfig,
      );

      setData(res.data?.result?.data || []);
      setTotal(res.data?.result?.total || 0);
    } catch {
      message.error("Không thể tải danh sách sản phẩm!");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_BASE}/categories`, axiosConfig);
      setCategories(res.data?.result || []);
    } catch {}
  };

  const fetchSuppliers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/admin/suppliers`, axiosConfig);
      
      const supplierData = res.data?.result?.data || res.data?.result || [];
      
      setSuppliers(Array.isArray(supplierData) ? supplierData : []);
    } catch {
      console.log("Lỗi hoặc chưa có API lấy danh sách nhà cung cấp.");
      setSuppliers([]);
    }
  };

  const handleSearch = () => {
    setPage(1);
    setSearch(searchInput.trim());
  };

  const handleReload = () => {
    setSearchInput("");
    setSearch("");
    setPage(1);
  };

  const handleMainImageUpload = async (options) => {
    const { file, onSuccess, onError } = options;

    setUploadingImage(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CDN_PRESET);

    try {
      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${CDN_CLOUD}/image/upload`,
        formData,
      );

      form.setFieldsValue({ thumbnail: res.data.secure_url });
      onSuccess("Ok");
    } catch (err) {
      onError({ err });
      message.error("Lỗi khi tải ảnh lên!");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleVariantImageUpload = async (options, index) => {
    const { file, onSuccess, onError } = options;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CDN_PRESET);

    try {
      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${CDN_CLOUD}/image/upload`,
        formData,
      );

      const currentVariants = form.getFieldValue("variants") || [];
      const updatedVariants = [...currentVariants];

      updatedVariants[index] = {
        ...updatedVariants[index],
        images: [res.data.secure_url],
      };

      form.setFieldsValue({ variants: updatedVariants });
      onSuccess("Ok");
    } catch (err) {
      onError({ err });
      message.error("Lỗi khi tải ảnh biến thể!");
    }
  };

  const showEditModal = async (id, isView = false) => {
    setLoading(true);
    setViewMode(isView);

    try {
      const res = await axios.get(
        `${API_BASE}/admin/products/${id}`,
        axiosConfig,
      );

      const p = res.data?.result;

      if (!p) return;

      setEditingId(id);
      setAddModal(true);

      const mappedVariants =
        p.BienTheSanPhams?.map((v) => {
          const validMenhIds = MENH_OPTIONS.map((opt) => opt.value);
          const menhAttr = v.GiaTriThuocTinhs?.find((attr) =>
            validMenhIds.includes(attr.MaGiaTri),
          );

          return {
            MaBienThe: v.MaBienThe,
            TenBienThe: v.TenBienThe,
            Menh: menhAttr ? menhAttr.MaGiaTri : undefined,
            Gia: v.Gia,
            SoLuong: v.SoLuong,
            KhoiLuong: v.KhoiLuong,
            ChieuDai: v.ChieuDai,
            ChieuRong: v.ChieuRong,
            ChieuCao: v.ChieuCao,
            TrangThai: v.TrangThai === 1,
            images: v.HinhAnhBienThes?.map((img) => img.DuongDan) || [],
          };
        }) || [];

      form.setFieldsValue({
        categoryID: p.MaDanhMuc,
        productName: p.TenSanPham,
        thumbnail: p.Thumbnail,
        brand: p.ThuongHieu,
        description: p.MoTa,
        status: p.TrangThai,
        
        MaNhaCC: p.MaNhaCC,
        ChatLieu: p.ChatLieu || "Gốm sứ",

        variants:
          mappedVariants.length > 0
            ? mappedVariants
            : [{ TrangThai: true, SoLuong: 0, images: [] }],
      });
    } catch {
      message.error("Lỗi lấy dữ liệu!");
    } finally {
      setLoading(false);
    }
  };

  const handleHideVariant = (fieldName) => {
    const currentVariants = form.getFieldValue("variants") || [];

    const updatedVariants = currentVariants.map((variant, index) => {
      if (index === fieldName) {
        return {
          ...variant,
          TrangThai: false,
        };
      }

      return variant;
    });

    form.setFieldsValue({
      variants: updatedVariants,
    });

    message.success("Đã ẩn biến thể!");
  };

  const handleDeleteProduct = async (id) => {
    try {
      await axios.delete(`${API_BASE}/admin/products/${id}`, axiosConfig);
      message.success("Đã xóa sản phẩm thành công!");
      fetchData();
    } catch {
      message.error("Lỗi khi xóa sản phẩm!");
    }
  };

  const handleSubmit = async (values) => {
    setSubmitting(true);

    try {
      const payload = {
        categoryID: Number(values.categoryID),
        productName: values.productName,
        thumbnail: values.thumbnail,
        brand: values.brand,
        description: values.description,
        status: Number(values.status ?? 1),
        
        MaNhaCC: values.MaNhaCC ? Number(values.MaNhaCC) : null,
        ChatLieu: values.ChatLieu || "Gốm sứ",
        
        BienThe: (values.variants || []).map((v) => ({
          MaBienThe: v.MaBienThe,
          TenBienThe: v.TenBienThe,
          Gia: Number(v.Gia),
          TrangThai: v.TrangThai ? 1 : 0,
          KhoiLuong: Number(v.KhoiLuong || 0),
          ChieuDai: Number(v.ChieuDai || 0),
          ChieuRong: Number(v.ChieuRong || 0),
          ChieuCao: Number(v.ChieuCao || 0),
          images: v.images || [],
          attributes: v.Menh ? [Number(v.Menh)] : [],
        })),
      };

      if (editingId) {
        await axios.put(
          `${API_BASE}/admin/products/${editingId}`,
          payload,
          axiosConfig,
        );

        message.success("Cập nhật thành công!");
      } else {
        await axios.post(`${API_BASE}/admin/products`, payload, axiosConfig);
        message.success("Thêm mới và ghi Blockchain thành công!");
      }

      setAddModal(false);
      setEditingId(null);
      setViewMode(false);
      form.resetFields();
      fetchData();
    } catch (err) {
      message.error(err.response?.data?.message || "Thao tác thất bại!");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id, currentStatus) => {
    const newStatus = Number(currentStatus) === 1 ? 0 : 1;

    setData((prevData) =>
      prevData.map((item) =>
        item.MaSanPham === id ? { ...item, TrangThai: newStatus } : item,
      ),
    );

    try {
      await axios.patch(
        `${API_BASE}/admin/products/${id}/status`,
        { status: newStatus },
        axiosConfig,
      );

      message.success(newStatus === 1 ? "Đã hiện!" : "Đã ẩn!");
    } catch {
      setData((prevData) =>
        prevData.map((item) =>
          item.MaSanPham === id ? { ...item, TrangThai: currentStatus } : item,
        ),
      );

      message.error("Lỗi cập nhật trạng thái!");
    }
  };

  const openCreateModal = () => {
    setViewMode(false);
    setEditingId(null);
    form.resetFields();
    form.setFieldsValue({
      status: 1,
      ChatLieu: "Gốm sứ",
      variants: [{ TrangThai: true, SoLuong: 0, images: [] }],
    });
    setAddModal(true);
  };

  const closeModal = () => {
    setAddModal(false);
    setEditingId(null);
    setViewMode(false);
    form.resetFields();
  };

  const columns = [
    {
      title: "Ảnh",
      dataIndex: "Thumbnail",
      width: 70,
      render: (url) => (
        <Image
          src={url}
          width={52}
          height={52}
          style={{ objectFit: "cover", borderRadius: 8 }}
          preview={false}
        />
      ),
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "TenSanPham",
      render: (v, row) => (
        <div>
          <div className={styles.productName}>{v}</div>
          {row.ThuongHieu && (
            <div className={styles.brand}>{row.ThuongHieu}</div>
          )}
        </div>
      ),
    },
    {
      title: "Danh mục",
      dataIndex: ["DanhMuc", "TenDanhMuc"],
      render: (v) => (v ? <Tag color="blue">{v}</Tag> : "—"),
    },
    {
      title: "Giá thấp nhất",
      dataIndex: "GiaThapNhat",
      render: (v) => <span className={styles.price}>{fmt(v)}</span>,
    },
    {
      title: "Trạng thái",
      dataIndex: "TrangThai",
      width: 140,
      render: (v, row) => {
        const isVisible = Number(v) === 1;

        return (
          <Space size={8}>
            <span
              style={{
                color: !isVisible ? "#ff4d4f" : "#bfbfbf",
                fontWeight: !isVisible ? 600 : 400,
                fontSize: 13,
              }}
            >
              Ẩn
            </span>

            <Switch
              checked={isVisible}
              size="small"
              onChange={() => handleUpdateStatus(row.MaSanPham, row.TrangThai)}
            />

            <span
              style={{
                color: isVisible ? "#52c41a" : "#bfbfbf",
                fontWeight: isVisible ? 600 : 400,
                fontSize: 13,
              }}
            >
              Hiện
            </span>
          </Space>
        );
      },
    },
    {
      title: "Thao tác",
      width: 120,
      render: (_, row) => (
        <Space size={4}>
          <Tooltip title="Xem sản phẩm">
            <Button
              type="text"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => showEditModal(row.MaSanPham, true)}
            />
          </Tooltip>

          <Tooltip title="Sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              size="small"
              className={styles.editBtn}
              onClick={() => showEditModal(row.MaSanPham, false)}
            />
          </Tooltip>

          <Tooltip title="Xóa sản phẩm">
            <Popconfirm
              title="Bạn có chắc chắn muốn xóa sản phẩm này?"
              description="Sản phẩm sẽ được xóa mềm để không ảnh hưởng đơn hàng cũ."
              okText="Xóa"
              cancelText="Hủy"
              onConfirm={() => handleDeleteProduct(row.MaSanPham)}
            >
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                size="small"
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  const leafCategories = categories.filter(
    (c) => !categories.some((other) => other.ParentID === c.MaDanhMuc),
  );

  return (
    <div className={styles.wrapper}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Quản lý sản phẩm</h1>
          <p className={styles.pageSub}>Tổng cộng {total} sản phẩm</p>
        </div>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={openCreateModal}
        >
          Thêm sản phẩm
        </Button>
      </div>

      <div className={styles.toolbar}>
        <Input
          prefix={<SearchOutlined />}
          placeholder="Tìm kiếm sản phẩm, thương hiệu, danh mục..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onPressEnter={handleSearch}
          style={{ width: 360 }}
          allowClear
          onClear={handleReload}
        />

        <Button icon={<ReloadOutlined />} onClick={handleReload}>
          Làm mới
        </Button>
      </div>

      <div className={styles.tableCard}>
        <Table
          dataSource={data}
          columns={columns}
          rowKey="MaSanPham"
          loading={loading}
          pagination={{
            current: page,
            pageSize: 10,
            total,
            onChange: setPage,
            showSizeChanger: false,
          }}
          size="middle"
        />
      </div>

      <Modal
        open={addModal}
        title={
          <div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>
              {viewMode
                ? "Xem chi tiết sản phẩm"
                : editingId
                  ? "Chỉnh sửa sản phẩm"
                  : "Thêm sản phẩm mới"}
            </div>
            <div style={{ fontSize: 13, color: "#8c8c8c", marginTop: 4 }}>
              Quản lý thông tin sản phẩm, ảnh đại diện và các biến thể.
            </div>
          </div>
        }
        onCancel={closeModal}
        footer={null}
        width={1100}
        centered
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          disabled={viewMode}
          initialValues={{
            status: 1,
            variants: [{ TrangThai: true, SoLuong: 0, images: [] }],
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr",
              gap: 18,
              marginTop: 18,
            }}
          >
            <Form.Item
              name="productName"
              label="Tên sản phẩm"
              rules={[
                { required: true, message: "Vui lòng nhập tên sản phẩm" },
              ]}
            >
              <Input size="large" placeholder="Nhập tên sản phẩm..." />
            </Form.Item>

            <Form.Item
              name="categoryID"
              label="Danh mục"
              rules={[{ required: true, message: "Vui lòng chọn danh mục" }]}
            >
              <Select size="large" placeholder="Chọn danh mục">
                {leafCategories.map((c) => (
                  <Select.Option key={c.MaDanhMuc} value={c.MaDanhMuc}>
                    {c.TenDanhMuc}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          <Form.Item
            name="thumbnail"
            hidden
            rules={[{ required: true, message: "Vui lòng chọn ảnh sản phẩm" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="Ảnh đại diện sản phẩm" required>
            <div
              style={{
                display: "flex",
                gap: 22,
                alignItems: "center",
                padding: 18,
                border: "1px solid #f0f0f0",
                borderRadius: 16,
                background: "#fafafa",
              }}
            >
              <Form.Item
                shouldUpdate={(prev, curr) => prev.thumbnail !== curr.thumbnail}
                noStyle
              >
                {({ getFieldValue }) => (
                  <ImagePreviewBox
                    url={getFieldValue("thumbnail")}
                    size={170}
                    emptyText="Chưa có ảnh sản phẩm"
                  />
                )}
              </Form.Item>

              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>
                  Ảnh chính của sản phẩm
                </div>

                <div
                  style={{
                    color: "#8c8c8c",
                    fontSize: 13,
                    marginBottom: 16,
                    lineHeight: 1.5,
                  }}
                >
                  Ảnh này sẽ hiển thị ở danh sách sản phẩm, trang chi tiết và
                  các khu vực giới thiệu sản phẩm.
                </div>

                {!viewMode && (
                  <Upload
                    showUploadList={false}
                    customRequest={handleMainImageUpload}
                    accept="image/*"
                  >
                    <Button
                      type="primary"
                      icon={<UploadOutlined />}
                      loading={uploadingImage}
                      size="large"
                    >
                      Tải ảnh sản phẩm
                    </Button>
                  </Upload>
                )}
              </div>
            </div>
          </Form.Item>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 18,
            }}
          >
            <Form.Item name="brand" label="Thương hiệu">
              <Input size="large" placeholder="Nhập thương hiệu..." />
            </Form.Item>

            <Form.Item name="status" label="Trạng thái sản phẩm">
              <Select size="large">
                <Select.Option value={1}>Đang hoạt động</Select.Option>
                <Select.Option value={0}>Tạm ẩn</Select.Option>
              </Select>
            </Form.Item>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 18,
            }}
          >
            <Form.Item name="MaNhaCC" label="Nhà cung cấp gốc">
              <Select size="large" placeholder="Chọn nhà cung cấp (nếu có)" allowClear>
                {suppliers.map((s) => (
                  <Select.Option key={s.MaNhaCC} value={s.MaNhaCC}>
                    {s.TenNhaCC}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item 
              name="ChatLieu" 
              label="Chất liệu" 
              rules={[{ required: true, message: "Vui lòng nhập chất liệu sản phẩm" }]}
            >
              <Input size="large" placeholder="Ví dụ: Gốm sứ Bát Tràng, Men rạn..." />
            </Form.Item>
          </div>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea
              rows={3}
              placeholder="Nhập mô tả ngắn cho sản phẩm..."
            />
          </Form.Item>

          <div className={styles.variantSection}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 14,
              }}
            >
              <div>
                <div className={styles.variantTitle}>Danh sách biến thể</div>
                <div style={{ color: "#8c8c8c", fontSize: 13 }}>
                  Mỗi biến thể có thể có giá, tồn kho, ảnh và thuộc tính riêng.
                </div>
              </div>
            </div>

            <Form.List name="variants">
              {(fields, { add }) => (
                <>
                  {fields.map(({ key, name, ...restField }, index) => (
                    <Form.Item
                      key={key}
                      shouldUpdate={(prev, curr) =>
                        prev.variants?.[name]?.TrangThai !==
                        curr.variants?.[name]?.TrangThai
                      }
                      noStyle
                    >
                      {({ getFieldValue }) => {
                        const variantStatus = getFieldValue([
                          "variants",
                          name,
                          "TrangThai",
                        ]);

                        const isHidden = variantStatus === false;

                        return (
                          <div
                            style={{
                              border: isHidden
                                ? "1px solid #ffccc7"
                                : "1px solid #f0f0f0",
                              padding: 18,
                              marginBottom: 18,
                              borderRadius: 16,
                              background: isHidden ? "#fff1f0" : "#fafafa",
                              opacity: isHidden ? 0.82 : 1,
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: 14,
                              }}
                            >
                              <Space>
                                <span style={{ fontWeight: 700, fontSize: 15 }}>
                                  Biến thể #{index + 1}
                                </span>

                                {isHidden ? (
                                  <Tag color="red">Đã ẩn</Tag>
                                ) : (
                                  <Tag color="green">Đang hiện</Tag>
                                )}
                              </Space>

                              <Space>
                                <span
                                  style={{
                                    fontSize: 13,
                                    color: isHidden ? "#ff4d4f" : "#52c41a",
                                  }}
                                >
                                  {isHidden ? "Ẩn" : "Hiện"}
                                </span>

                                <Form.Item
                                  {...restField}
                                  name={[name, "TrangThai"]}
                                  valuePropName="checked"
                                  noStyle
                                >
                                  <Switch size="small" />
                                </Form.Item>

                                {!viewMode && !isHidden && (
                                  <Tooltip title="Ẩn biến thể">
                                    <Button
                                      type="text"
                                      danger
                                      icon={<DeleteOutlined />}
                                      size="small"
                                      onClick={() => handleHideVariant(name)}
                                    />
                                  </Tooltip>
                                )}
                              </Space>
                            </div>

                            <Form.Item
                              {...restField}
                              name={[name, "images"]}
                              hidden
                            >
                              <Input />
                            </Form.Item>

                            <div
                              style={{
                                marginBottom: 18,
                                display: "flex",
                                alignItems: "center",
                                gap: 20,
                                padding: 16,
                                borderRadius: 14,
                                background: "#fff",
                                border: "1px solid #f0f0f0",
                              }}
                            >
                              <Form.Item
                                shouldUpdate={(prev, curr) =>
                                  prev.variants?.[name]?.images !==
                                  curr.variants?.[name]?.images
                                }
                                noStyle
                              >
                                {({ getFieldValue }) => {
                                  const imgs = getFieldValue([
                                    "variants",
                                    name,
                                    "images",
                                  ]);

                                  return (
                                    <ImagePreviewBox
                                      url={imgs?.[0]}
                                      size={140}
                                      emptyText="Chưa có ảnh biến thể"
                                    />
                                  );
                                }}
                              </Form.Item>

                              <div style={{ flex: 1 }}>
                                <div
                                  style={{
                                    fontWeight: 700,
                                    fontSize: 15,
                                    marginBottom: 6,
                                  }}
                                >
                                  Ảnh biến thể
                                </div>

                                <div
                                  style={{
                                    color: "#8c8c8c",
                                    fontSize: 13,
                                    marginBottom: 14,
                                    lineHeight: 1.5,
                                  }}
                                >
                                  Ảnh này giúp khách hàng nhận biết rõ từng biến
                                  thể của sản phẩm.
                                </div>

                                {!viewMode && (
                                  <Upload
                                    showUploadList={false}
                                    customRequest={(opt) =>
                                      handleVariantImageUpload(opt, name)
                                    }
                                    accept="image/*"
                                  >
                                    <Button
                                      size="large"
                                      icon={<FileImageOutlined />}
                                    >
                                      Tải ảnh biến thể
                                    </Button>
                                  </Upload>
                                )}
                              </div>
                            </div>

                            <Form.Item
                              {...restField}
                              name={[name, "MaBienThe"]}
                              hidden
                            >
                              <Input />
                            </Form.Item>

                            <div
                              style={{
                                display: "grid",
                                gridTemplateColumns: "2fr 1fr",
                                gap: 18,
                              }}
                            >
                              <Form.Item
                                {...restField}
                                name={[name, "TenBienThe"]}
                                label="Tên biến thể"
                                rules={[
                                  {
                                    required: true,
                                    message: "Vui lòng nhập tên biến thể",
                                  },
                                ]}
                              >
                                <Input
                                  size="large"
                                  placeholder="Ví dụ: Size M, Màu trắng..."
                                />
                              </Form.Item>

                              <Form.Item
                                {...restField}
                                name={[name, "Menh"]}
                                label="Mệnh"
                                rules={[
                                  {
                                    required: true,
                                    message: "Bắt buộc chọn mệnh",
                                  },
                                ]}
                              >
                                <Select size="large" placeholder="Chọn mệnh">
                                  {MENH_OPTIONS.map((opt) => (
                                    <Select.Option
                                      key={opt.value}
                                      value={opt.value}
                                    >
                                      {opt.label}
                                    </Select.Option>
                                  ))}
                                </Select>
                              </Form.Item>
                            </div>

                            <div
                              style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr",
                                gap: 18,
                              }}
                            >
                              <Form.Item
                                {...restField}
                                name={[name, "Gia"]}
                                label="Giá"
                                rules={[
                                  {
                                    required: true,
                                    message: "Vui lòng nhập giá",
                                  },
                                ]}
                              >
                                <InputNumber
                                  size="large"
                                  min={0}
                                  style={{ width: "100%" }}
                                  placeholder="Nhập giá"
                                />
                              </Form.Item>

                              <Form.Item
                                {...restField}
                                name={[name, "SoLuong"]}
                                label="Kho"
                                rules={[
                                  {
                                    required: true,
                                    message: "Vui lòng nhập số lượng",
                                  },
                                ]}
                              >
                                <InputNumber
                                  size="large"
                                  min={0}
                                  disabled
                                  style={{ width: "100%" }}
                                  placeholder="Nhập tồn kho"
                                />
                              </Form.Item>
                            </div>

                            <div
                              style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(4, 1fr)",
                                gap: 12,
                              }}
                            >
                              <Form.Item
                                {...restField}
                                name={[name, "KhoiLuong"]}
                                label="Nặng(g)"
                              >
                                <InputNumber
                                  size="middle"
                                  min={0}
                                  style={{ width: "100%" }}
                                />
                              </Form.Item>

                              <Form.Item
                                {...restField}
                                name={[name, "ChieuDai"]}
                                label="Dài(cm)"
                              >
                                <InputNumber
                                  size="middle"
                                  min={0}
                                  style={{ width: "100%" }}
                                />
                              </Form.Item>

                              <Form.Item
                                {...restField}
                                name={[name, "ChieuRong"]}
                                label="Rộng(cm)"
                              >
                                <InputNumber
                                  size="middle"
                                  min={0}
                                  style={{ width: "100%" }}
                                />
                              </Form.Item>

                              <Form.Item
                                {...restField}
                                name={[name, "ChieuCao"]}
                                label="Cao(cm)"
                              >
                                <InputNumber
                                  size="middle"
                                  min={0}
                                  style={{ width: "100%" }}
                                />
                              </Form.Item>
                            </div>
                          </div>
                        );
                      }}
                    </Form.Item>
                  ))}

                  {!viewMode && (
                    <Button
                      type="dashed"
                      onClick={() => add({ TrangThai: true, SoLuong: 0, images: [] })}
                      block
                      size="large"
                      icon={<PlusOutlined />}
                    >
                      Thêm biến thể
                    </Button>
                  )}
                </>
              )}
            </Form.List>
          </div>

          <div
            className={styles.modalFooter}
            style={{
              marginTop: 22,
              paddingTop: 16,
              borderTop: "1px solid #f0f0f0",
            }}
          >
            <Button size="large" onClick={closeModal}>
              Đóng
            </Button>

            {!viewMode && (
              <Button
                type="primary"
                size="large"
                htmlType="submit"
                loading={submitting}
              >
                {editingId ? "Cập nhật" : "Thêm mới"}
              </Button>
            )}
          </div>
        </Form>
      </Modal>
    </div>
  );
}
