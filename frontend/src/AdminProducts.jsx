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
} from "@ant-design/icons";
import axios from "axios";
import styles from "./AdminTable.module.css";

const API_BASE = "https://ceramic-shop-u8ak.onrender.com/api/v1";
const CDN_CLOUD = "dcmwz0uis";
const CDN_PRESET = "the_creamy_shop";

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

  const handleImageUpload = async (options) => {
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
      message.success("Tải ảnh lên thành công!");
    } catch (err) {
      onError({ err });
      message.error("Lỗi khi tải ảnh lên Cloudinary!");
    } finally {
      setUploadingImage(false);
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

        const mappedVariants = p.BienTheSanPhams?.map((v) => ({
          MaBienThe: v.MaBienThe,
          TenBienThe: v.TenBienThe,
          Gia: v.Gia,
          SoLuong: v.SoLuong,
          KhoiLuong: v.KhoiLuong,
          ChieuDai: v.ChieuDai,
          ChieuRong: v.ChieuRong,
          ChieuCao: v.ChieuCao,
          TrangThai: v.TrangThai === 1, // Convert sang boolean cho Switch
        })) || [{}];

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
      message.error("Không thể lấy thông tin chi tiết sản phẩm!");
    } finally {
      setLoading(false);
    }
  };

  // HÀM XỬ LÝ XÓA BIẾN THỂ TRONG MODAL
  const handleRemoveVariant = async (removeFn, fieldName, variantId) => {
    if (!variantId) {
      // Nếu là biến thể mới thêm (chưa có ID), chỉ cần xóa trên giao diện
      removeFn(fieldName);
      return;
    }

    // Nếu biến thể đã có trong DB, gọi API ẩn nó đi
    try {
      await axios.patch(
        `${API_BASE}/admin/products/variants/${variantId}/status`,
        { status: 0 },
        axiosConfig,
      );
      message.success("Đã ẩn biến thể thành công!");
      removeFn(fieldName); // Sau đó xóa khỏi UI
    } catch (err) {
      message.error("Không thể ẩn biến thể!");
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
          TrangThai: v.TrangThai ? 1 : 0, // Convert boolean back to number
          KhoiLuong: Number(v.KhoiLuong || 0),
          ChieuDai: Number(v.ChieuDai || 0),
          ChieuRong: Number(v.ChieuRong || 0),
          ChieuCao: Number(v.ChieuCao || 0),
          attributes: [4],
        })),
      };

      if (editingId) {
        await axios.put(
          `${API_BASE}/admin/products/${editingId}`,
          payload,
          axiosConfig,
        );
        message.success("Cập nhật sản phẩm thành công!");
      } else {
        await axios.post(`${API_BASE}/admin/products`, payload, axiosConfig);
        message.success("Thêm sản phẩm thành công!");
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
      message.success(
        newStatus === 1 ? "Đã hiện sản phẩm!" : "Đã ẩn sản phẩm!",
      );
    } catch (err) {
      setData((prevData) =>
        prevData.map((item) =>
          item.MaSanPham === id ? { ...item, TrangThai: currentStatus } : item,
        ),
      );
      message.error("Cập nhật trạng thái thất bại!");
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
          fallback="https://via.placeholder.com/52"
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
      title: "Tồn kho",
      dataIndex: "TongSoLuong",
      render: (v) => (
        <Tag color={v > 10 ? "green" : v > 0 ? "orange" : "red"}>{v ?? 0}</Tag>
      ),
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
          <Tooltip title="Xem trên web">
            <Button
              type="text"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => window.open(`/product/${row.MaSanPham}`, "_blank")}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              size="small"
              className={styles.editBtn}
              onClick={() => showEditModal(row.MaSanPham)}
            />
          </Tooltip>
          <Tooltip title="Xoá (Ẩn)">
            <Popconfirm
              title="Xác nhận ẩn sản phẩm này?"
              onConfirm={() => handleUpdateStatus(row.MaSanPham, 1)}
              okText="Xoá"
              cancelText="Huỷ"
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
          className={styles.btnAdd}
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
          placeholder="Tìm kiếm tên sản phẩm, thương hiệu..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onPressEnter={handleSearch}
          className={styles.searchInput}
          allowClear
          onClear={handleReload}
        />
        <Button
          icon={<SearchOutlined />}
          onClick={handleSearch}
          className={styles.btnSearch}
        >
          Tìm kiếm
        </Button>
        <Button icon={<ReloadOutlined />} onClick={handleReload} />
      </div>

      <div className={styles.tableCard}>
        <Table
          dataSource={data}
          columns={columns}
          rowKey="MaSanPham"
          loading={loading}
          className={styles.table}
          pagination={{
            current: page,
            pageSize: 10,
            total,
            onChange: setPage,
            showTotal: (t) => `Tổng ${t} sản phẩm`,
            showSizeChanger: false,
          }}
          size="middle"
          locale={{ emptyText: "Không có sản phẩm nào" }}
        />
      </div>

      <Modal
        open={addModal}
        title={
          <span className={styles.modalTitle}>
            {editingId ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
          </span>
        }
        onCancel={() => {
          setAddModal(false);
          setEditingId(null);
          form.resetFields();
        }}
        footer={null}
        width={800}
        centered
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className={styles.modalForm}
        >
          <div
            style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}
          >
            <Form.Item
              name="productName"
              label="Tên sản phẩm"
              rules={[{ required: true, message: "Nhập tên!" }]}
            >
              <Input placeholder="Tên sản phẩm" />
            </Form.Item>
            <Form.Item
              name="categoryID"
              label="Danh mục"
              rules={[{ required: true, message: "Chọn danh mục!" }]}
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

          <Form.Item label="Ảnh đại diện" required>
            <div style={{ display: "flex", gap: "10px" }}>
              <Form.Item
                name="thumbnail"
                noStyle
                rules={[{ required: true, message: "Vui lòng tải ảnh lên!" }]}
              >
                <Input placeholder="URL ảnh..." readOnly style={{ flex: 1 }} />
              </Form.Item>
              <Upload
                showUploadList={false}
                customRequest={handleImageUpload}
                accept="image/*"
              >
                <Button icon={<UploadOutlined />} loading={uploadingImage}>
                  Tải ảnh lên
                </Button>
              </Upload>
            </div>
          </Form.Item>

          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
          >
            <Form.Item name="brand" label="Thương hiệu">
              <Input placeholder="Tên thương hiệu" />
            </Form.Item>
            <Form.Item name="status" label="Trạng thái SP">
              <Select>
                <Select.Option value={1}>Đang hoạt động</Select.Option>
                <Select.Option value={0}>Tạm ẩn</Select.Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} placeholder="Mô tả..." />
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
                        border: "1px solid #e8e8e8",
                        padding: "16px",
                        marginBottom: "16px",
                        borderRadius: "8px",
                        position: "relative",
                        background: "#fafafa",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "12px",
                        }}
                      >
                        <div style={{ fontWeight: "bold" }}>
                          Biến thể #{index + 1}
                        </div>

                        <Space>
                          {/* THÊM SWITCH ẨN/HIỆN CHO TỪNG BIẾN THỂ */}
                          <Form.Item
                            {...restField}
                            name={[name, "TrangThai"]}
                            valuePropName="checked"
                            noStyle
                            initialValue={true}
                          >
                            <Switch
                              checkedChildren="Hiện"
                              unCheckedChildren="Ẩn"
                              size="small"
                            />
                          </Form.Item>

                          {fields.length > 1 && (
                            <Popconfirm
                              title="Ẩn/Xóa biến thể này khỏi danh sách?"
                              onConfirm={() =>
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
                            >
                              <Button
                                type="text"
                                danger
                                icon={<DeleteOutlined />}
                                size="small"
                              />
                            </Popconfirm>
                          )}
                        </Space>
                      </div>

                      <Form.Item
                        {...restField}
                        name={[name, "MaBienThe"]}
                        hidden
                      >
                        <Input />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, "TenBienThe"]}
                        label="Tên biến thể"
                        rules={[{ required: true, message: "Nhập tên!" }]}
                      >
                        <Input placeholder="VD: Hoa sen cổ điển..." />
                      </Form.Item>

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
                          label="Giá (VNĐ)"
                          rules={[{ required: true, message: "Nhập giá!" }]}
                        >
                          <InputNumber
                            min={0}
                            style={{ width: "100%" }}
                            formatter={(v) =>
                              `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                            }
                          />
                        </Form.Item>
                        <Form.Item
                          {...restField}
                          name={[name, "SoLuong"]}
                          label="Số lượng tồn"
                          rules={[
                            { required: true, message: "Nhập số lượng!" },
                          ]}
                        >
                          <InputNumber min={0} style={{ width: "100%" }} />
                        </Form.Item>
                      </div>

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr 1fr 1fr",
                          gap: 12,
                          marginTop: 8,
                        }}
                      >
                        <Form.Item
                          {...restField}
                          name={[name, "KhoiLuong"]}
                          label="Nặng (g)"
                        >
                          <InputNumber min={0} style={{ width: "100%" }} />
                        </Form.Item>
                        <Form.Item
                          {...restField}
                          name={[name, "ChieuDai"]}
                          label="Dài (cm)"
                        >
                          <InputNumber min={0} style={{ width: "100%" }} />
                        </Form.Item>
                        <Form.Item
                          {...restField}
                          name={[name, "ChieuRong"]}
                          label="Rộng (cm)"
                        >
                          <InputNumber min={0} style={{ width: "100%" }} />
                        </Form.Item>
                        <Form.Item
                          {...restField}
                          name={[name, "ChieuCao"]}
                          label="Cao (cm)"
                        >
                          <InputNumber min={0} style={{ width: "100%" }} />
                        </Form.Item>
                      </div>
                    </div>
                  ))}
                  <Form.Item>
                    <Button
                      type="dashed"
                      onClick={() => add({ TrangThai: true })}
                      block
                      icon={<PlusOutlined />}
                    >
                      Thêm biến thể khác
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </div>

          <div className={styles.modalFooter}>
            <Button
              onClick={() => {
                setAddModal(false);
                setEditingId(null);
                form.resetFields();
              }}
            >
              Huỷ
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              className={styles.btnAdd}
            >
              {editingId ? "Cập nhật sản phẩm" : "Thêm sản phẩm"}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
