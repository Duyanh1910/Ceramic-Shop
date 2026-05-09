import { useState, useEffect } from "react";
import {
  Table,
  Form,
  Button,
  Input,
  Tag,
  Avatar,
  Tooltip,
  message,
  Modal,
  DatePicker,
  Popconfirm,
} from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  PlusOutlined,
  ReloadOutlined,
  DeleteOutlined,
  EditOutlined,
} from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";
import styles from "./AdminTable.module.css";

const API_BASE = "https://ceramic-shop-u8ak.onrender.com/api/v1";

export default function AdminStaffs() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [form] = Form.useForm();

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editSubmitLoading, setEditSubmitLoading] = useState(false);
  const [currentEditId, setCurrentEditId] = useState(null);
  const [editForm] = Form.useForm();

  const axiosConfig = { withCredentials: true };

  useEffect(() => {
    fetchData();
  }, [page, search]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_BASE}/admin/staffs?page=${page}&limit=10&search=${search}`,
        axiosConfig,
      );
      setData(res.data?.result?.data || []);
      setTotal(res.data?.result?.total || 0);
    } catch {
      message.error("Không thể tải danh sách nhân viên!");
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

  const showAddModal = () => {
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleCancelModal = () => {
    setIsModalVisible(false);
  };

  const handleAddSubmit = async (values) => {
    setSubmitLoading(true);
    try {
      const payload = {
        email: values.email,
        name: values.name,
        username: values.username,
        phoneNumber: values.phoneNumber,
        dob: values.dob ? values.dob.format("YYYY-MM-DD") : null,
        address: values.address,
      };

      await axios.post(`${API_BASE}/admin/staffs`, payload, axiosConfig);
      message.success("Thêm nhân viên mới thành công!");
      setIsModalVisible(false);
      form.resetFields();

      if (page === 1) {
        fetchData();
      } else {
        setPage(1);
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Có lỗi xảy ra khi thêm nhân viên!";
      message.error(errorMsg);
    } finally {
      setSubmitLoading(false);
    }
  };

  const showEditModal = (record) => {
    setCurrentEditId(record.MaNhanVien);
    editForm.setFieldsValue({
      SDT: record.SDT,
      DiaChi: record.DiaChi,
      NgaySinh: record.NgaySinh ? dayjs(record.NgaySinh) : null,
    });
    setIsEditModalVisible(true);
  };

  const handleEditSubmit = async (values) => {
    setEditSubmitLoading(true);
    try {
      const payload = {
        SDT: values.SDT,
        DiaChi: values.DiaChi,
        NgaySinh: values.NgaySinh ? values.NgaySinh.format("YYYY-MM-DD") : null,
      };

      await axios.put(
        `${API_BASE}/admin/staffs/${currentEditId}`,
        payload,
        axiosConfig,
      );
      message.success("Cập nhật thông tin nhân viên thành công!");
      setIsEditModalVisible(false);
      fetchData();
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        "Có lỗi xảy ra khi cập nhật nhân viên!";
      message.error(errorMsg);
    } finally {
      setEditSubmitLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE}/admin/staffs/${id}`, axiosConfig);
      message.success("Đã xóa nhân viên thành công!");
      fetchData();
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Có lỗi xảy ra khi xóa nhân viên!";
      message.error(errorMsg);
    }
  };

  const columns = [
    {
      title: "Nhân viên",
      render: (_, row) => (
        <div className={styles.userCell}>
          <Avatar className={styles.userAvatar} size={38}>
            {row.TenNhanVien?.[0] || "?"}
          </Avatar>
          <div>
            <div className={styles.userName}>{row.TenNhanVien}</div>
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
    },
    {
      title: "Ngày sinh",
      dataIndex: "NgaySinh",
      render: (v) => (v ? new Date(v).toLocaleDateString("vi-VN") : "—"),
    },
    {
      title: "Địa chỉ",
      dataIndex: "DiaChi",
      render: (v) => (
        <Tooltip title={v}>
          <span className={styles.address}>{v || "—"}</span>
        </Tooltip>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: ["TaiKhoan", "TrangThai"],
      render: (v) => (
        <Tag color={v === 1 ? "green" : "red"}>
          {v === 1 ? "Hoạt động" : "Khoá"}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      width: 120,
      render: (_, row) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <Tooltip title="Xem / Sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              size="small"
              className={styles.editBtn}
              onClick={() => showEditModal(row)}
            />
          </Tooltip>
          <Popconfirm
            title="Xóa nhân viên"
            description="Bạn có chắc chắn muốn xóa nhân viên này không?"
            onConfirm={() => handleDelete(row.MaNhanVien)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Xóa">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                size="small"
              />
            </Tooltip>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className={styles.wrapper}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Quản lý nhân viên</h1>
          <p className={styles.pageSub}>Tổng cộng {total} nhân viên</p>
        </div>
      </div>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        className={styles.btnAdd}
        onClick={showAddModal}
      >
        Thêm nhân viên
      </Button>
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
          scroll={{ x: 1000 }}
          dataSource={data}
          columns={columns}
          rowKey="MaNhanVien"
          loading={loading}
          className={styles.table}
          pagination={{
            current: page,
            pageSize: 10,
            total,
            onChange: setPage,
            showTotal: (t) => `Tổng ${t} nhân viên`,
            showSizeChanger: false,
          }}
          size="middle"
          locale={{ emptyText: "Không có dữ liệu" }}
        />
      </div>
      <Modal
        title={<span className={styles.modalTitle}>Thêm nhân viên mới</span>}
        open={isModalVisible}
        onCancel={handleCancelModal}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddSubmit}
          className={styles.modalForm}
        >
          <Form.Item
            name="name"
            label="Họ và tên"
            rules={[
              { required: true, message: "Vui lòng nhập họ tên nhân viên!" },
            ]}
          >
            <Input placeholder="Ví dụ: Nguyễn Văn A" />
          </Form.Item>

          <Form.Item
            name="username"
            label="Tên đăng nhập (Username)"
            rules={[
              { required: true, message: "Vui lòng nhập tên đăng nhập!" },
            ]}
          >
            <Input placeholder="Ví dụ: staff01" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Vui lòng nhập email!" },
              { type: "email", message: "Email không hợp lệ!" },
            ]}
          >
            <Input placeholder="Ví dụ: staff@gmail.com" />
          </Form.Item>

          <div style={{ display: "flex", gap: "16px" }}>
            <Form.Item
              name="phoneNumber"
              label="Số điện thoại"
              style={{ flex: 1 }}
              rules={[
                { required: true, message: "Vui lòng nhập số điện thoại!" },
                {
                  pattern: /^[0-9]{10,11}$/,
                  message: "Số điện thoại không hợp lệ!",
                },
              ]}
            >
              <Input placeholder="Ví dụ: 0329835725" />
            </Form.Item>

            <Form.Item
              name="dob"
              label="Ngày sinh"
              style={{ flex: 1 }}
              rules={[{ required: true, message: "Vui lòng chọn ngày sinh!" }]}
            >
              <DatePicker
                format="DD/MM/YYYY"
                style={{ width: "100%" }}
                disabledDate={(current) =>
                  current && current > dayjs().endOf("day")
                }
                placeholder="Chọn ngày sinh"
              />
            </Form.Item>
          </div>

          <Form.Item
            name="address"
            label="Địa chỉ"
            rules={[{ required: true, message: "Vui lòng nhập địa chỉ!" }]}
          >
            <Input.TextArea rows={2} placeholder="Ví dụ: 120 Yên Lãng" />
          </Form.Item>

          <div className={styles.modalFooter}>
            <Button onClick={handleCancelModal} disabled={submitLoading}>
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitLoading}
              className={styles.btnAdd}
            >
              Xác nhận thêm
            </Button>
          </div>
        </Form>
      </Modal>
      <Modal
        title={
          <span className={styles.modalTitle}>
            Cập nhật thông tin nhân viên
          </span>
        }
        open={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleEditSubmit}
          className={styles.modalForm}
        >
          <div style={{ display: "flex", gap: "16px" }}>
            <Form.Item
              name="SDT"
              label="Số điện thoại"
              style={{ flex: 1 }}
              rules={[
                { required: true, message: "Vui lòng nhập SDT!" },
                { pattern: /^[0-9]{10,11}$/, message: "SDT không hợp lệ!" },
              ]}
            >
              <Input placeholder="Ví dụ: 0912345111" />
            </Form.Item>
            <Form.Item
              name="NgaySinh"
              label="Ngày sinh"
              style={{ flex: 1 }}
              rules={[{ required: true, message: "Vui lòng chọn ngày sinh!" }]}
            >
              <DatePicker
                format="DD/MM/YYYY"
                style={{ width: "100%" }}
                disabledDate={(current) =>
                  current && current > dayjs().endOf("day")
                }
                placeholder="Chọn ngày sinh"
              />
            </Form.Item>
          </div>
          <Form.Item
            name="DiaChi"
            label="Địa chỉ"
            rules={[{ required: true, message: "Vui lòng nhập địa chỉ!" }]}
          >
            <Input.TextArea rows={2} placeholder="Ví dụ: Hai Bà Trưng" />
          </Form.Item>
          <div className={styles.modalFooter}>
            <Button
              onClick={() => setIsEditModalVisible(false)}
              disabled={editSubmitLoading}
            >
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={editSubmitLoading}
              className={styles.btnAdd}
            >
              Cập nhật
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
