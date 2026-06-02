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
  Tag,
} from "antd";
import {
  SearchOutlined,
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  LinkOutlined,
  CheckCircleOutlined,
  StopOutlined,
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
        error.response?.data?.message || "Không thể xóa tài khoản khách hàng!",
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
      render: (v) => v || <span style={{ color: "#ccc" }}>Chưa cập nhật</span>,
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
      title: "Trạng thái",
      width: 140,
      render: (_, row) =>
        Number(row.TaiKhoan?.TrangThai) === 0 ? (
          <Tag icon={<StopOutlined />} color="default">
            Đã xóa
          </Tag>
        ) : (
          <Tag icon={<CheckCircleOutlined />} color="success">
            Hoạt động
          </Tag>
        ),
    },
    {
      title: "Thao tác",
      width: 150,
      align: "center",
      render: (_, row) =>
        isAdmin ? (
          <div className={styles.actionGroup}>
            <Tooltip title="Cập nhật thông tin">
              <Button
                type="text"
                icon={<EditOutlined />}
                className={`${styles.actionBtn} ${styles.editBtn}`}
                onClick={() => openEditModal(row)}
              />
            </Tooltip>

            <Popconfirm
              title="Xóa tài khoản khách hàng?"
              description="Đơn hàng của khách hàng này vẫn được giữ."
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
              onConfirm={() => handleSoftDelete(row)}
              disabled={Number(row.TaiKhoan?.TrangThai) === 0}
            >
              <Tooltip
                title={
                  Number(row.TaiKhoan?.TrangThai) === 0
                    ? "Tài khoản đã bị xóa"
                    : "Xóa tài khoản"
                }
              >
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  className={`${styles.actionBtn} ${styles.deleteBtn}`}
                  disabled={Number(row.TaiKhoan?.TrangThai) === 0}
                />
              </Tooltip>
            </Popconfirm>
          </div>
        ) : (
          <span className={styles.onlyAdmin}>Chỉ Admin</span>
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
        open={!!editingCustomer}
        onCancel={closeEditModal}
        onOk={() => form.submit()}
        confirmLoading={saving}
        okText="Lưu thay đổi"
        cancelText="Hủy"
        destroyOnHidden
        width={720}
        centered
        className={styles.customerModal}
        title={null}
      >
        <div className={styles.modalHero}>
          <div className={styles.modalAvatarWrap}>
            <Avatar
              size={76}
              src={Form.useWatch("Avatar", form) || editingCustomer?.Avatar}
              icon={<UserOutlined />}
              className={styles.modalAvatar}
            >
              {editingCustomer?.TenKhachHang?.[0] || "?"}
            </Avatar>
          </div>

          <div className={styles.modalHeroContent}>
            <h2>Chỉnh sửa khách hàng</h2>
            <p>
              Cập nhật thông tin cá nhân và trạng thái tài khoản khách hàng.
            </p>
            <div className={styles.modalMeta}>
              <Tag color="blue">
                {editingCustomer?.TaiKhoan?.Username || "-"}
              </Tag>
              {Number(editingCustomer?.TaiKhoan?.TrangThai) === 0 ? (
                <Tag icon={<StopOutlined />} color="default">
                  Đã xóa
                </Tag>
              ) : (
                <Tag icon={<CheckCircleOutlined />} color="success">
                  Đang hoạt động
                </Tag>
              )}
            </div>
          </div>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdateCustomer}
          className={styles.customerForm}
        >
          <div className={styles.formGrid}>
            <Form.Item
              label="Tên khách hàng"
              name="TenKhachHang"
              rules={[
                { required: true, message: "Vui lòng nhập tên khách hàng!" },
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                maxLength={100}
                placeholder="Nhập tên khách hàng"
              />
            </Form.Item>

            <Form.Item label="Tên đăng nhập">
              <Input
                prefix={<UserOutlined />}
                value={editingCustomer?.TaiKhoan?.Username || ""}
                disabled
              />
            </Form.Item>

            <Form.Item
              label="Email"
              name="Email"
              rules={[
                { required: true, message: "Vui lòng nhập email!" },
                { type: "email", message: "Email không hợp lệ!" },
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="example@gmail.com"
              />
            </Form.Item>

            <Form.Item
              label="Số điện thoại"
              name="SDT"
              rules={[
                {
                  pattern: /^0\d{9}$/,
                  message: "Số điện thoại phải gồm 10 số và bắt đầu bằng 0!",
                },
              ]}
            >
              <Input
                prefix={<PhoneOutlined />}
                maxLength={10}
                placeholder="Ví dụ: 0987654321"
              />
            </Form.Item>

            <Form.Item label="Địa chỉ" name="DiaChi" className={styles.fullRow}>
              <Input
                prefix={<HomeOutlined />}
                maxLength={255}
                placeholder="Nhập địa chỉ khách hàng"
              />
            </Form.Item>

            <Form.Item
              label="Avatar URL"
              name="Avatar"
              className={styles.fullRow}
            >
              <Input
                prefix={<LinkOutlined />}
                placeholder="Dán liên kết ảnh đại diện"
              />
            </Form.Item>

            <Form.Item
              label="Trạng thái tài khoản"
              name="TrangThai"
              className={styles.fullRow}
            >
              <Select
                options={[
                  {
                    value: 1,
                    label: (
                      <Space>
                        <CheckCircleOutlined />
                        Đang hoạt động
                      </Space>
                    ),
                  },
                  {
                    value: 0,
                    label: (
                      <Space>
                        <StopOutlined />
                        Đã xóa
                      </Space>
                    ),
                  },
                ]}
              />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
