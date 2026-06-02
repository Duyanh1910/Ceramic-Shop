import { useState, useEffect } from "react";
import {
  Table,
  Button,
  Input,
  Space,
  Avatar,
  Tooltip,
  message,
  Modal,
  Form,
  Popconfirm,
  Select,
} from "antd";
import {
  SearchOutlined,
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import axios from "axios";
import styles from "./AdminTable.module.css";
import { API_BASE } from "../config/api";

export default function AdminCustomers() {
  const [form] = Form.useForm();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [editingCustomer, setEditingCustomer] = useState(null);
  const role = String(localStorage.getItem("role") || "").toLowerCase();
  const isAdmin = role === "admin";

  const axiosConfig = { withCredentials: true };

  useEffect(() => {
    fetchData();
  }, [page, search]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_BASE}/admin/customers?page=${page}&limit=10&search=${search}`,
        axiosConfig,
      );
      setData(res.data?.result?.data || []);
      setTotal(res.data?.result?.total || 0);
    } catch {
      message.error("Không thể tải danh sách khách hàng!");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    setSearch(searchInput);
  };

  const handleReload = () => {
    setSearchInput("");
    if (search === "" && page === 1) {
      fetchData();
    } else {
      setSearch("");
      setPage(1);
    }
  };

  const openEditModal = (customer) => {
    setEditingCustomer(customer);
    form.setFieldsValue({
      TenKhachHang: customer.TenKhachHang,
      Email: customer.TaiKhoan?.Email,
      SDT: customer.SDT,
      DiaChi: customer.DiaChi,
      Avatar: customer.Avatar,
      TrangThai: customer.TaiKhoan?.TrangThai ?? 1,
    });
  };

  const closeEditModal = () => {
    setEditingCustomer(null);
    form.resetFields();
  };

  const handleUpdateCustomer = async (values) => {
    if (!editingCustomer) return;
    setSaving(true);
    try {
      await axios.put(
        `${API_BASE}/admin/customers/${editingCustomer.MaKhachHang}`,
        {
          ...values,
          Email: values.Email?.trim().toLowerCase(),
        },
        axiosConfig,
      );
      message.success("Cập nhật thông tin khách hàng thành công!");
      closeEditModal();
      fetchData();
    } catch (error) {
      message.error(
        error.response?.data?.message ||
          "Không thể cập nhật thông tin khách hàng!",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSoftDelete = async (customer) => {
    try {
      await axios.delete(
        `${API_BASE}/admin/customers/${customer.MaKhachHang}`,
        axiosConfig,
      );
      message.success("Đã xóa tài khoản khách hàng!");
      fetchData();
    } catch (error) {
      message.error(
        error.response?.data?.message ||
          "Không thể xóa tài khoản khách hàng!",
      );
    }
  };

  const columns = [
    {
      title: "Khách hàng",
      render: (_, row) => (
        <div className={styles.userCell}>
          <Avatar
            src={row.Avatar || null}
            className={styles.userAvatar}
            size={38}
          >
            {row.TenKhachHang?.[0] || "?"}
          </Avatar>
          <div>
            <div className={styles.userName}>{row.TenKhachHang || "-"}</div>
            <div className={styles.userSub}>{row.TaiKhoan?.Username}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Email",
      dataIndex: ["TaiKhoan", "Email"],
      render: (v) => <span className={styles.email}>{v}</span>,
    },
    {
      title: "Số điện thoại",
      dataIndex: "SDT",
      render: (v) =>
        v || <span style={{ color: "#ccc" }}>Chưa cập nhật</span>,
    },
    {
      title: "Địa chỉ",
      dataIndex: "DiaChi",
      width: 350,
      ellipsis: true,
      render: (v) => (
        <Tooltip title={v} placement="topLeft">
          <span
            className={styles.address}
            style={{
              display: "block",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {v || <span style={{ color: "#ccc" }}>Chưa cập nhật</span>}
          </span>
        </Tooltip>
      ),
    },
    {
      title: "Thao tác",
      width: 140,
      render: (_, row) =>
        isAdmin ? (
          <Space>
            <Tooltip title="Sửa khách hàng">
              <Button icon={<EditOutlined />} onClick={() => openEditModal(row)} />
            </Tooltip>
            <Popconfirm
              title="Xóa tài khoản khách hàng?"
              description="Đơn hàng của khách hàng này vẫn được giữ."
              okText="Xóa"
              cancelText="Hủy"
              onConfirm={() => handleSoftDelete(row)}
              disabled={Number(row.TaiKhoan?.TrangThai) === 0}
            >
              <Tooltip title="Xóa tài khoản">
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  disabled={Number(row.TaiKhoan?.TrangThai) === 0}
                />
              </Tooltip>
            </Popconfirm>
          </Space>
        ) : (
          <span style={{ color: "#999" }}>Chỉ Admin</span>
        ),
    },
  ];

  return (
    <div className={styles.wrapper}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Quản lý khách hàng</h1>
          <p className={styles.pageSub}>Tổng cộng {total} khách hàng</p>
        </div>
      </div>

      <div className={styles.toolbar}>
        <Input
          prefix={<SearchOutlined />}
          placeholder="Tìm theo tên, email, số điện thoại..."
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
          rowKey="MaKhachHang"
          loading={loading}
          className={styles.table}
          pagination={{
            current: page,
            pageSize: 10,
            total,
            onChange: setPage,
            showTotal: (t) => `Tổng ${t} khách hàng`,
            showSizeChanger: false,
          }}
          size="middle"
          locale={{ emptyText: "Không có dữ liệu" }}
        />
      </div>

      <Modal
        title="Sửa thông tin khách hàng"
        open={!!editingCustomer}
        onCancel={closeEditModal}
        onOk={() => form.submit()}
        confirmLoading={saving}
        okText="Lưu"
        cancelText="Hủy"
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={handleUpdateCustomer}>
          <Form.Item
            label="Tên khách hàng"
            name="TenKhachHang"
            rules={[{ required: true, message: "Vui lòng nhập tên khách hàng!" }]}
          >
            <Input maxLength={100} />
          </Form.Item>
          <Form.Item label="Tên đăng nhập">
            <Input value={editingCustomer?.TaiKhoan?.Username || ""} disabled />
          </Form.Item>
          <Form.Item
            label="Email"
            name="Email"
            rules={[
              { required: true, message: "Vui lòng nhập email!" },
              { type: "email", message: "Email không hợp lệ!" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Số điện thoại"
            name="SDT"
            rules={[
              {
                pattern: /^0\d{9}$/,
                message:
                  "Số điện thoại phải gồm 10 số và bắt đầu bằng 0!",
              },
            ]}
          >
            <Input maxLength={10} />
          </Form.Item>
          <Form.Item label="Địa chỉ" name="DiaChi">
            <Input maxLength={255} />
          </Form.Item>
          <Form.Item label="Avatar URL" name="Avatar">
            <Input />
          </Form.Item>
          <Form.Item label="Trạng thái tài khoản" name="TrangThai">
            <Select
              options={[
                { value: 1, label: "Đang hoạt động" },
                { value: 0, label: "Đã xóa" },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
