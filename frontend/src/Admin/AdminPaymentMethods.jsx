import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Empty,
  Form,
  Input,
  message,
  Modal,
  Space,
  Switch,
  Table,
  Tooltip,
  Typography,
} from "antd";
import {
  CreditCardOutlined,
  EditOutlined,
} from "@ant-design/icons";
import axios from "axios";
import styles from "./AdminTable.module.css";
import { API_BASE } from "../config/api";

const { Title, Text } = Typography;

const authConfig = () => {
  const token =
    localStorage.getItem("admin_token") ||
    localStorage.getItem("customer_token") ||
    localStorage.getItem("token");

  return {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    withCredentials: true,
  };
};

export default function AdminPaymentMethods() {
  const [form] = Form.useForm();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);

    try {
      const res = await axios.get(
        `${API_BASE}/admin/payment-methods`,
        authConfig(),
      );
      setData(res.data?.result || []);
    } catch (err) {
      message.error(
        err.response?.data?.message ||
          "Không thể tải danh sách phương thức thanh toán!",
      );
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (record) => {
    setEditingMethod(record);
    form.setFieldsValue({
      TenPhuongThuc: record.TenPhuongThuc,
      MoTa: record.MoTa,
      TrangThai: Number(record.TrangThai) === 1,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingMethod(null);
    form.resetFields();
  };

  const saveMethod = async () => {
    if (!editingMethod?.MaPhuongThuc) {
      message.error("Không tìm thấy phương thức thanh toán cần cập nhật!");
      return;
    }

    const values = await form.validateFields();

    const payload = {
      TenPhuongThuc: values.TenPhuongThuc,
      MoTa: values.MoTa || null,
      TrangThai: values.TrangThai ? 1 : 0,
    };

    setSaving(true);

    try {
      await axios.patch(
        `${API_BASE}/admin/payment-methods/${editingMethod.MaPhuongThuc}`,
        payload,
        authConfig(),
      );

      message.success("Đã cập nhật phương thức thanh toán!");
      closeModal();
      await fetchData();
    } catch (err) {
      message.error(
        err.response?.data?.message || "Không thể lưu phương thức thanh toán!",
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (record, checked) => {
    setTogglingId(record.MaPhuongThuc);

    try {
      await axios.patch(
        `${API_BASE}/admin/payment-methods/${record.MaPhuongThuc}`,
        { TrangThai: checked ? 1 : 0 },
        authConfig(),
      );

      setData((current) =>
        current.map((item) =>
          item.MaPhuongThuc === record.MaPhuongThuc
            ? { ...item, TrangThai: checked ? 1 : 0 }
            : item,
        ),
      );

      message.success(
        checked
          ? "Đã bật phương thức thanh toán!"
          : "Đã tắt phương thức thanh toán!",
      );
    } catch (err) {
      message.error(
        err.response?.data?.message ||
          "Không thể cập nhật trạng thái phương thức thanh toán!",
      );
    } finally {
      setTogglingId(null);
    }
  };

  const columns = [
    {
      title: "Tên phương thức",
      dataIndex: "TenPhuongThuc",
      key: "TenPhuongThuc",
      width: 240,
      render: (value) => <Text strong>{value}</Text>,
    },
    {
      title: "Mô tả",
      dataIndex: "MoTa",
      key: "MoTa",
      render: (value) => value || <Text type="secondary">Chưa có mô tả</Text>,
    },
    {
      title: "Trạng thái",
      dataIndex: "TrangThai",
      key: "TrangThai",
      width: 130,
      align: "center",
      render: (_, record) => (
        <Switch
          checked={Number(record.TrangThai) === 1}
          checkedChildren="Bật"
          unCheckedChildren="Tắt"
          loading={togglingId === record.MaPhuongThuc}
          onChange={(checked) => toggleStatus(record, checked)}
        />
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 120,
      align: "center",
      render: (_, record) => (
        <Tooltip title="Chỉnh sửa">
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => openEdit(record)}
          >
            Sửa
          </Button>
        </Tooltip>
      ),
    },
  ];

  return (
    <Card
      bordered={false}
      className={styles.card}
      title={
        <Space>
          <CreditCardOutlined className={styles.titleIcon} />
          <Title level={4} style={{ margin: 0 }}>
            Phương thức thanh toán
          </Title>
        </Space>
      }
    >
      <Table
        columns={columns}
        dataSource={data}
        rowKey="MaPhuongThuc"
        loading={loading}
        className={styles.table}
        pagination={false}
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Chưa có phương thức thanh toán"
            />
          ),
        }}
      />

      <Modal
        open={modalOpen}
        title={
          editingMethod
            ? `Sửa phương thức #${editingMethod.MaPhuongThuc}`
            : "Sửa phương thức thanh toán"
        }
        okText="Cập nhật"
        cancelText="Hủy"
        onOk={saveMethod}
        onCancel={closeModal}
        confirmLoading={saving}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="TenPhuongThuc"
            label="Tên phương thức"
            rules={[
              { required: true, message: "Vui lòng nhập tên phương thức!" },
              { max: 100, message: "Tên phương thức tối đa 100 ký tự!" },
            ]}
          >
            <Input placeholder="VD: COD, MoMo, ZaloPay, Chuyển khoản" />
          </Form.Item>

          <Form.Item
            name="MoTa"
            label="Mô tả"
            rules={[{ max: 255, message: "Mô tả tối đa 255 ký tự!" }]}
          >
            <Input.TextArea
              rows={3}
              placeholder="Mô tả ngắn hiển thị ở màn hình thanh toán"
            />
          </Form.Item>

          <Form.Item
            name="TrangThai"
            label="Trạng thái"
            valuePropName="checked"
          >
            <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
