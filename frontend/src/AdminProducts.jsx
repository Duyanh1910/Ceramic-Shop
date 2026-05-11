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
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import axios from "axios";
import styles from "./AdminTable.module.css";

const API_BASE = "https://ceramic-shop-u8ak.onrender.com/api/v1";
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
    } catch (err) {
      console.error(err);
    }
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

        const v = p.BienTheSanPhams?.[0] || {};

        form.setFieldsValue({
          categoryID: p.MaDanhMuc,
          productName: p.TenSanPham,
          thumbnail: p.Thumbnail,
          brand: p.ThuongHieu,
          description: p.MoTa,
          status: p.TrangThai,
          variantName: v.TenBienThe,
          price: v.Gia,
          stock: v.SoLuong,
          weight: v.KhoiLuong,
          length: v.ChieuDai,
          width: v.ChieuRong,
          height: v.ChieuCao,
        });
      }
    } catch (err) {
      console.error(err);
      message.error("Không thể lấy thông tin chi tiết sản phẩm!");
    } finally {
      setLoading(false);
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
        BienThe: [
          {
            TenBienThe: values.variantName,
            Gia: Number(values.price),
            SoLuong: Number(values.stock),
            TrangThai: 1,
            KhoiLuong: Number(values.weight || 0),
            ChieuDai: Number(values.length || 0),
            ChieuRong: Number(values.width || 0),
            ChieuCao: Number(values.height || 0),
            attributes: [4], // Tự động thêm thuộc tính mặc định
          },
        ],
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

  // 6. Cập nhật trạng thái nhanh (Ẩn/Hiện)
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await axios.patch(
        `${API_BASE}/admin/products/${id}/status`,
        { status: newStatus },
        axiosConfig,
      );
      message.success(
        newStatus === 1 ? "Đã hiện sản phẩm!" : "Đã ẩn sản phẩm!",
      );
      fetchData();
    } catch (err) {
      console.error(err);
      message.error("Cập nhật trạng thái thất bại!");
    }
  };

  // Cấu hình các cột của bảng
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
      title: "Hiện/Ẩn",
      dataIndex: "TrangThai",
      width: 100,
      render: (v, row) => (
        <Switch
          checked={v === 1}
          size="small"
          onChange={(checked) =>
            handleUpdateStatus(row.MaSanPham, checked ? 1 : 0)
          }
        />
      ),
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
              onConfirm={() => handleUpdateStatus(row.MaSanPham, 0)}
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
            setAddModal(true);
            form.resetFields();
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
        width={650}
        centered
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className={styles.modalForm}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.5fr 1fr",
              gap: 16,
            }}
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

          <Form.Item
            name="thumbnail"
            label="URL ảnh đại diện"
            rules={[{ required: true, message: "Nhập URL ảnh!" }]}
          >
            <Input placeholder="https://..." />
          </Form.Item>

          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
          >
            <Form.Item name="brand" label="Thương hiệu">
              <Input placeholder="Tên thương hiệu" />
            </Form.Item>
            <Form.Item name="status" label="Trạng thái">
              <Select>
                <Select.Option value={1}>Đang hoạt động</Select.Option>
                <Select.Option value={0}>Tạm ẩn</Select.Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={2} placeholder="Mô tả..." />
          </Form.Item>

          <div className={styles.variantSection}>
            <div className={styles.variantTitle}>Thông tin bán hàng</div>
            <Form.Item
              name="variantName"
              label="Tên biến thể"
              rules={[{ required: true, message: "Nhập tên biến thể!" }]}
            >
              <Input placeholder="VD: Mặc định / Loại cao cấp..." />
            </Form.Item>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
            >
              <Form.Item
                name="price"
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
                name="stock"
                label="Số lượng tồn"
                rules={[{ required: true, message: "Nhập số lượng!" }]}
              >
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </div>
          </div>

          <div className={styles.variantSection} style={{ marginTop: 16 }}>
            <div className={styles.variantTitle}>
              Thông tin vận chuyển (Logistics)
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr 1fr",
                gap: 12,
              }}
            >
              <Form.Item name="weight" label="Nặng (g)">
                <InputNumber
                  min={0}
                  style={{ width: "100%" }}
                  placeholder="gram"
                />
              </Form.Item>
              <Form.Item name="length" label="Dài (cm)">
                <InputNumber
                  min={0}
                  style={{ width: "100%" }}
                  placeholder="cm"
                />
              </Form.Item>
              <Form.Item name="width" label="Rộng (cm)">
                <InputNumber
                  min={0}
                  style={{ width: "100%" }}
                  placeholder="cm"
                />
              </Form.Item>
              <Form.Item name="height" label="Cao (cm)">
                <InputNumber
                  min={0}
                  style={{ width: "100%" }}
                  placeholder="cm"
                />
              </Form.Item>
            </div>
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
