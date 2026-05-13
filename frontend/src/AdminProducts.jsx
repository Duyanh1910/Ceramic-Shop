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
    p,
  );

export default function AdminProducts() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [addModal, setAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [categories, setCategories] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();

  const axiosConfig = { withCredentials: true };

  useEffect(() => {
    fetchData();
  }, [page, search]);
  useEffect(() => {
    fetchCategories();
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

  const handleSearch = () => {
    setPage(1);
    setSearch(searchInput);
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

  const showEditModal = async (id) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_BASE}/admin/products/${id}`,
        axiosConfig,
      );
      const p = res.data?.result;
      if (p) {
        setEditingId(id);
        setAddModal(true);
        const mappedVariants = p.BienTheSanPhams?.map((v) => {
          const validMenhIds = MENH_OPTIONS.map((opt) => opt.value);
          const menhAttr = v.AttributeValues?.find((attr) =>
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
            images: v.VariantImages?.map((img) => img.DuongDan) || [],
          };
        }) || [{}];

        form.setFieldsValue({
          categoryID: p.MaDanhMuc,
          productName: p.TenSanPham,
          thumbnail: p.Thumbnail,
          brand: p.ThuongHieu,
          description: p.MoTa,
          status: p.TrangThai,
          variants: mappedVariants,
        });
      }
    } catch (err) {
      message.error("Lỗi lấy dữ liệu!");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveVariant = async (removeFn, fieldName, variantId) => {
    if (!variantId) {
      removeFn(fieldName);
      return;
    }
    try {
      await axios.patch(
        `${API_BASE}/admin/products/variants/${variantId}/status`,
        { status: 0 },
        axiosConfig,
      );
      message.success("Đã ẩn biến thể!");
      removeFn(fieldName);
    } catch (err) {
      message.error("Lỗi khi ẩn biến thể!");
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
        BienThe: values.variants.map((v) => ({
          MaBienThe: v.MaBienThe,
          TenBienThe: v.TenBienThe,
          Gia: Number(v.Gia),
          SoLuong: Number(v.SoLuong),
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
        message.success("Thêm mới thành công!");
      }

      setAddModal(false);
      setEditingId(null);
      form.resetFields();
      fetchData();
    } catch (err) {
      message.error(err.response?.data?.message || "Thao tác thất bại!");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 1 ? 0 : 1;
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
    } catch (err) {
      setData((prevData) =>
        prevData.map((item) =>
          item.MaSanPham === id ? { ...item, TrangThai: currentStatus } : item,
        ),
      );
      message.error("Lỗi!");
    }
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
          style={{ objectFit: "cover", borderRadius: 6 }}
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
                fontWeight: !isVisible ? "600" : "normal",
                fontSize: "13px",
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
                fontWeight: isVisible ? "600" : "normal",
                fontSize: "13px",
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
      width: 110,
      render: (_, row) => (
        <Space size={4}>
          <Tooltip title="Xem web">
            <Button
              type="text"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => window.open(`/product/${row.MaSanPham}`, "_blank")}
            />
          </Tooltip>
          <Tooltip title="Sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              size="small"
              className={styles.editBtn}
              onClick={() => showEditModal(row.MaSanPham)}
            />
          </Tooltip>
          <Tooltip title="Ẩn">
            <Popconfirm
              title="Ẩn SP này?"
              onConfirm={() => handleUpdateStatus(row.MaSanPham, 1)}
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
          onClick={() => {
            setEditingId(null);
            form.resetFields();
            form.setFieldsValue({ variants: [{ TrangThai: true }] });
            setAddModal(true);
          }}
        >
          Thêm sản phẩm
        </Button>
      </div>

      <div className={styles.toolbar}>
        <Input
          prefix={<SearchOutlined />}
          placeholder="Tìm kiếm..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onPressEnter={handleSearch}
          style={{ width: 300 }}
          allowClear
          onClear={handleReload}
        />
        <Button icon={<ReloadOutlined />} onClick={handleReload} />
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
        title={editingId ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
        onCancel={() => {
          setAddModal(false);
          setEditingId(null);
          form.resetFields();
        }}
        footer={null}
        width={850}
        centered
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <div
            style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}
          >
            <Form.Item
              name="productName"
              label="Tên sản phẩm"
              rules={[{ required: true }]}
            >
              <Input placeholder="Tên sản phẩm..." />
            </Form.Item>
            <Form.Item
              name="categoryID"
              label="Danh mục"
              rules={[{ required: true }]}
            >
              <Select placeholder="Chọn danh mục">
                {leafCategories.map((c) => (
                  <Select.Option key={c.MaDanhMuc} value={c.MaDanhMuc}>
                    {c.TenDanhMuc}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          <Form.Item label="Ảnh đại diện (Sản phẩm)" required>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <Form.Item name="thumbnail" noStyle rules={[{ required: true }]}>
                <Input placeholder="URL ảnh..." readOnly style={{ flex: 1 }} />
              </Form.Item>
              <Upload
                showUploadList={false}
                customRequest={handleMainImageUpload}
                accept="image/*"
              >
                <Button icon={<UploadOutlined />} loading={uploadingImage}>
                  Tải ảnh lên
                </Button>
              </Upload>

              <Form.Item
                shouldUpdate={(prev, curr) => prev.thumbnail !== curr.thumbnail}
                noStyle
              >
                {({ getFieldValue }) => {
                  const thumbUrl = getFieldValue("thumbnail");
                  return thumbUrl ? (
                    <Image
                      src={thumbUrl}
                      width={40}
                      height={40}
                      style={{ objectFit: "cover", borderRadius: 4 }}
                    />
                  ) : null;
                }}
              </Form.Item>
            </div>
          </Form.Item>

          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
          >
            <Form.Item name="brand" label="Thương hiệu">
              <Input />
            </Form.Item>
            <Form.Item name="status" label="Trạng thái SP">
              <Select>
                <Select.Option value={1}>Đang hoạt động</Select.Option>
                <Select.Option value={0}>Tạm ẩn</Select.Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={2} />
          </Form.Item>

          <div className={styles.variantSection}>
            <div className={styles.variantTitle}>Danh sách biến thể</div>
            <Form.List name="variants">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }, index) => (
                    <div
                      key={key}
                      style={{
                        border: "1px solid #f0f0f0",
                        padding: 16,
                        marginBottom: 16,
                        borderRadius: 8,
                        background: "#fafafa",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: 12,
                        }}
                      >
                        <span style={{ fontWeight: 600 }}>
                          Biến thể #{index + 1}
                        </span>
                        <Space>
                          <Form.Item
                            {...restField}
                            name={[name, "TrangThai"]}
                            valuePropName="checked"
                            noStyle
                          >
                            <Switch size="small" />
                          </Form.Item>
                          {fields.length > 1 && (
                            <Button
                              type="text"
                              danger
                              icon={<DeleteOutlined />}
                              size="small"
                              onClick={() =>
                                handleRemoveVariant(
                                  remove,
                                  name,
                                  form.getFieldValue([
                                    "variants",
                                    name,
                                    "MaBienThe",
                                  ]),
                                )
                              }
                            />
                          )}
                        </Space>
                      </div>

                      <div
                        style={{
                          marginBottom: 16,
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                        }}
                      >
                        <Form.Item
                          {...restField}
                          name={[name, "images"]}
                          noStyle
                        >
                          <Input hidden />
                        </Form.Item>
                        <Upload
                          showUploadList={false}
                          customRequest={(opt) =>
                            handleVariantImageUpload(opt, name)
                          }
                          accept="image/*"
                        >
                          <Button size="small" icon={<FileImageOutlined />}>
                            Ảnh biến thể
                          </Button>
                        </Upload>

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
                            return imgs?.[0] ? (
                              <Image
                                src={imgs[0]}
                                width={50}
                                height={50}
                                style={{
                                  borderRadius: 4,
                                  objectFit: "cover",
                                  border: "1px solid #ddd",
                                }}
                              />
                            ) : (
                              <div
                                style={{
                                  width: 50,
                                  height: 50,
                                  background: "#eee",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  borderRadius: 4,
                                  fontSize: 10,
                                  color: "#999",
                                }}
                              >
                                No Image
                              </div>
                            );
                          }}
                        </Form.Item>
                      </div>

                      <Form.Item
                        {...restField}
                        name={[name, "MaBienThe"]}
                        hidden
                      >
                        <Input />
                      </Form.Item>

                      {/* Thêm div bọc ngoài để chia cột 2/1 cho Tên và Mệnh */}
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "2fr 1fr",
                          gap: 16,
                        }}
                      >
                        <Form.Item
                          {...restField}
                          name={[name, "TenBienThe"]}
                          label="Tên biến thể"
                          rules={[{ required: true }]}
                        >
                          <Input />
                        </Form.Item>
                        <Form.Item
                          {...restField}
                          name={[name, "Menh"]}
                          label="Mệnh"
                          rules={[
                            { required: true, message: "Bắt buộc chọn mệnh" },
                          ]}
                        >
                          <Select placeholder="Chọn Mệnh">
                            {MENH_OPTIONS.map((opt) => (
                              <Select.Option key={opt.value} value={opt.value}>
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
                          gap: 16,
                        }}
                      >
                        <Form.Item
                          {...restField}
                          name={[name, "Gia"]}
                          label="Giá"
                        >
                          <InputNumber style={{ width: "100%" }} />
                        </Form.Item>
                        <Form.Item
                          {...restField}
                          name={[name, "SoLuong"]}
                          label="Kho"
                        >
                          <InputNumber style={{ width: "100%" }} />
                        </Form.Item>
                      </div>

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(4, 1fr)",
                          gap: 8,
                          marginTop: 8,
                        }}
                      >
                        <Form.Item
                          {...restField}
                          name={[name, "KhoiLuong"]}
                          label="Nặng(g)"
                        >
                          <InputNumber size="small" style={{ width: "100%" }} />
                        </Form.Item>
                        <Form.Item
                          {...restField}
                          name={[name, "ChieuDai"]}
                          label="Dài(cm)"
                        >
                          <InputNumber size="small" style={{ width: "100%" }} />
                        </Form.Item>
                        <Form.Item
                          {...restField}
                          name={[name, "ChieuRong"]}
                          label="Rộng(cm)"
                        >
                          <InputNumber size="small" style={{ width: "100%" }} />
                        </Form.Item>
                        <Form.Item
                          {...restField}
                          name={[name, "ChieuCao"]}
                          label="Cao(cm)"
                        >
                          <InputNumber size="small" style={{ width: "100%" }} />
                        </Form.Item>
                      </div>
                    </div>
                  ))}
                  <Button
                    type="dashed"
                    onClick={() => add({ TrangThai: true, images: [] })}
                    block
                    icon={<PlusOutlined />}
                  >
                    Thêm biến thể
                  </Button>
                </>
              )}
            </Form.List>
          </div>

          <div className={styles.modalFooter}>
            <Button onClick={() => setAddModal(false)}>Huỷ</Button>
            <Button type="primary" htmlType="submit" loading={submitting}>
              {editingId ? "Cập nhật" : "Thêm mới"}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
