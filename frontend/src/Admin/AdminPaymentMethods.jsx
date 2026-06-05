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
  Tag,
  Tooltip,
  Typography,
} from "antd";
import {
  CreditCardOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import axios from "axios";
import styles from "./AdminPaymentMethods.module.css";
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

const renderStatus = (value) =>
  Number(value) === 1 ? (
    <Tag color="green">Dang bat</Tag>
  ) : (
    <Tag color="default">Dang tat</Tag>
  );

export default function AdminPaymentMethods() {
  const [form] = Form.useForm();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState(null);

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
          "Khong the tai danh sach phuong thuc thanh toan!",
      );
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingMethod(null);
    form.resetFields();
    form.setFieldsValue({ TrangThai: true });
    setModalOpen(true);
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
    const values = await form.validateFields();
    const payload = {
      TenPhuongThuc: values.TenPhuongThuc,
      MoTa: values.MoTa || null,
      TrangThai: values.TrangThai ? 1 : 0,
    };

    setSaving(true);

    try {
      if (editingMethod?.MaPhuongThuc) {
        await axios.patch(
          `${API_BASE}/admin/payment-methods/${editingMethod.MaPhuongThuc}`,
          payload,
          authConfig(),
        );
        message.success("Da cap nhat phuong thuc thanh toan!");
      } else {
        await axios.post(
          `${API_BASE}/admin/payment-methods`,
          payload,
          authConfig(),
        );
        message.success("Da tao phuong thuc thanh toan!");
      }

      closeModal();
      await fetchData();
    } catch (err) {
      message.error(
        err.response?.data?.message || "Khong the luu phuong thuc thanh toan!",
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (record, checked) => {
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
      message.success("Da cap nhat trang thai phuong thuc thanh toan!");
    } catch (err) {
      message.error(
        err.response?.data?.message ||
          "Khong the cap nhat trang thai phuong thuc thanh toan!",
      );
    }
  };

  const columns = [
    {
      title: "Ma",
      dataIndex: "MaPhuongThuc",
      key: "MaPhuongThuc",
      width: 90,
      render: (value) => <Text strong>#{value}</Text>,
    },
    {
      title: "Ten phuong thuc",
      dataIndex: "TenPhuongThuc",
      key: "TenPhuongThuc",
      width: 240,
      render: (value) => <Text strong>{value}</Text>,
    },
    {
      title: "Mo ta",
      dataIndex: "MoTa",
      key: "MoTa",
      render: (value) => value || <Text type="secondary">Chua co mo ta</Text>,
    },
    {
      title: "Trang thai",
      dataIndex: "TrangThai",
      key: "TrangThai",
      width: 130,
      render: renderStatus,
    },
    {
      title: "Bat/Tat",
      key: "toggle",
      width: 120,
      render: (_, record) => (
        <Switch
          checked={Number(record.TrangThai) === 1}
          onChange={(checked) => toggleStatus(record, checked)}
        />
      ),
    },
    {
      title: "Thao tac",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <Tooltip title="Chinh sua">
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => openEdit(record)}
          >
            Sua
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
            Phuong thuc thanh toan
          </Title>
        </Space>
      }
      extra={
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchData}>
            Tai lai
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            Them phuong thuc
          </Button>
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
              description="Chua co phuong thuc thanh toan"
            />
          ),
        }}
      />

      <Modal
        open={modalOpen}
        title={
          editingMethod
            ? `Sua phuong thuc #${editingMethod.MaPhuongThuc}`
            : "Them phuong thuc thanh toan"
        }
        okText={editingMethod ? "Cap nhat" : "Tao moi"}
        cancelText="Huy"
        onOk={saveMethod}
        onCancel={closeModal}
        confirmLoading={saving}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="TenPhuongThuc"
            label="Ten phuong thuc"
            rules={[
              { required: true, message: "Vui long nhap ten phuong thuc!" },
              { max: 100, message: "Ten phuong thuc toi da 100 ky tu!" },
            ]}
          >
            <Input placeholder="VD: COD, MoMo, ZaloPay, Chuyen khoan" />
          </Form.Item>

          <Form.Item
            name="MoTa"
            label="Mo ta"
            rules={[{ max: 255, message: "Mo ta toi da 255 ky tu!" }]}
          >
            <Input.TextArea
              rows={3}
              placeholder="Mo ta ngan hien thi o man hinh thanh toan"
            />
          </Form.Item>

          <Form.Item
            name="TrangThai"
            label="Trang thai"
            valuePropName="checked"
          >
            <Switch checkedChildren="Bat" unCheckedChildren="Tat" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
