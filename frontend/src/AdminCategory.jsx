import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import axios from "axios";
import styles from "./AdminTable.module.css";

const { TextArea } = Input;
const { Option } = Select;

const API_BASE = "https://ceramic-shop-u8ak.onrender.com/api/v1";

const lineClampStyle = {
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
  textOverflow: "ellipsis",
  lineHeight: "20px",
  maxHeight: "40px",
  whiteSpace: "normal",
};

const normalizeParentID = (value) => {
  if (value === undefined || value === null || value === "") return null;
  return Number(value);
};

const getResultData = (response) => {
  const apiData = response?.data;

  if (apiData && Array.isArray(apiData.result)) {
    return apiData.result;
  }
  if (apiData && Array.isArray(apiData.data)) {
    return apiData.data;
  }
  if (Array.isArray(apiData)) {
    return apiData;
  }
  return [];
};

const buildTree = (flatData) => {
  const map = new Map();
  const tree = [];

  flatData.forEach((item) => {
    map.set(Number(item.MaDanhMuc), {
      ...item,
      children: [],
    });
  });

  flatData.forEach((item) => {
    const node = map.get(Number(item.MaDanhMuc));

    if (!node) return;

    if (item.ParentID) {
      const parent = map.get(Number(item.ParentID));

      if (parent) {
        parent.children.push(node);
      } else {
        tree.push(node);
      }
    } else {
      tree.push(node);
    }
  });

  const cleanEmptyChildren = (nodes) => {
    nodes.forEach((node) => {
      if (node.children && node.children.length === 0) {
        delete node.children;
      } else if (node.children) {
        cleanEmptyChildren(node.children);
      }
    });
  };

  cleanEmptyChildren(tree);

  return tree;
};

const AdminCategories = () => {
  const [form] = Form.useForm();

  const [data, setData] = useState([]);
  const [parentOptions, setParentOptions] = useState([]);

  const [loadingTable, setLoadingTable] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [loadingDeleteId, setLoadingDeleteId] = useState(null);

  const [searchText, setSearchText] = useState("");
  const [filterType, setFilterType] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const fetchAllCategories = useCallback(async () => {
    try {
      setLoadingTable(true);

      const response = await axios.get(`${API_BASE}/categories`, {
        withCredentials: true,
      });

      if (response.data.success) {
        const categories = getResultData(response);
        setData(categories);

        const rootCategories = categories.filter(
          (item) => item.ParentID === null || item.ParentID === undefined,
        );

        setParentOptions(rootCategories);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách danh mục:", error);
      message.error("Lỗi khi tải dữ liệu danh mục sản phẩm!");
    } finally {
      setLoadingTable(false);
    }
  }, []);

  useEffect(() => {
    fetchAllCategories();
  }, [fetchAllCategories]);

  const filteredData = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();

    return data.filter((item) => {
      const matchSearch =
        !keyword ||
        String(item.MaDanhMuc || "")
          .toLowerCase()
          .includes(keyword) ||
        String(item.TenDanhMuc || "")
          .toLowerCase()
          .includes(keyword) ||
        String(item.MoTa || "")
          .toLowerCase()
          .includes(keyword);

      const matchType =
        !filterType ||
        (filterType === "parent" &&
          (item.ParentID === null || item.ParentID === undefined)) ||
        (filterType === "child" &&
          item.ParentID !== null &&
          item.ParentID !== undefined);

      return matchSearch && matchType;
    });
  }, [data, searchText, filterType]);

  const treeData = useMemo(() => {
    return buildTree(filteredData);
  }, [filteredData]);

  const parentSelectOptions = useMemo(() => {
    return parentOptions.filter((item) => {
      if (!editingCategory) return true;

      return Number(item.MaDanhMuc) !== Number(editingCategory.MaDanhMuc);
    });
  }, [parentOptions, editingCategory]);

  const handleOpenCreateModal = () => {
    setEditingCategory(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (record) => {
    setEditingCategory(record);

    form.setFieldsValue({
      TenDanhMuc: record.TenDanhMuc,
      MoTa: record.MoTa,
      ParentID: record.ParentID ?? null,
    });

    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (loadingSubmit) return;

    setIsModalOpen(false);
    setEditingCategory(null);
    form.resetFields();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      setLoadingSubmit(true);

      const payload = {
        TenDanhMuc: values.TenDanhMuc.trim(),
        MoTa: values.MoTa?.trim() || null,
        ParentID: normalizeParentID(values.ParentID),
      };

      if (editingCategory) {
        await axios.put(
          `${API_BASE}/admin/categories/${editingCategory.MaDanhMuc}`,
          payload,
          {
            withCredentials: true,
          },
        );

        message.success("Cập nhật danh mục sản phẩm thành công!");
      } else {
        await axios.post(`${API_BASE}/admin/categories`, payload, {
          withCredentials: true,
        });

        message.success("Thêm danh mục sản phẩm thành công!");
      }

      setIsModalOpen(false);
      setEditingCategory(null);
      form.resetFields();

      await fetchAllCategories();
    } catch (error) {
      if (error?.errorFields) return;

      console.error("Lỗi khi lưu danh mục:", error);

      const errorMessage =
        error?.response?.data?.message ||
        (editingCategory
          ? "Lỗi khi cập nhật danh mục sản phẩm!"
          : "Lỗi khi thêm danh mục sản phẩm!");

      message.error(errorMessage);
    } finally {
      setLoadingSubmit(false);
    }
  };

  const handleDelete = async (record) => {
    try {
      setLoadingDeleteId(record.MaDanhMuc);

      await axios.delete(`${API_BASE}/admin/categories/${record.MaDanhMuc}`, {
        withCredentials: true,
      });

      message.success("Xóa danh mục sản phẩm thành công!");

      await fetchAllCategories();
    } catch (error) {
      console.error("Lỗi khi xóa danh mục:", error);

      const errorMessage =
        error?.response?.data?.message || "Không thể xóa danh mục sản phẩm!";

      message.error(errorMessage);
    } finally {
      setLoadingDeleteId(null);
    }
  };

  const columns = [
    {
      title: "Mã DM",
      dataIndex: "MaDanhMuc",
      key: "MaDanhMuc",
      width: 90,
      align: "center",
    },
    {
      title: "Tên danh mục",
      dataIndex: "TenDanhMuc",
      key: "TenDanhMuc",
      width: 280,
      render: (text) => (
        <Tooltip title={text}>
          <div
            style={{
              ...lineClampStyle,
              fontWeight: 600,
              color: "#173B63",
            }}
          >
            {text}
          </div>
        </Tooltip>
      ),
    },
    {
      title: "Loại danh mục",
      key: "LoaiDanhMuc",
      width: 150,
      align: "center",
      render: (_, record) =>
        record.ParentID ? (
          <Tag color="blue">Danh mục con</Tag>
        ) : (
          <Tag color="green">Danh mục cha</Tag>
        ),
    },
    {
      title: "Mô tả",
      dataIndex: "MoTa",
      key: "MoTa",
      width: 420,
      render: (text) => {
        const content = text || "Không có mô tả";

        return (
          <Tooltip title={content}>
            <div
              style={{
                ...lineClampStyle,
                color: text ? "inherit" : "#aaa",
                fontStyle: text ? "normal" : "italic",
              }}
            >
              {content}
            </div>
          </Tooltip>
        );
      },
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 150,
      align: "center",
      fixed: "right",
      render: (_, record) => (
        <Space>
          <Tooltip title="Sửa danh mục">
            <Button
              type="primary"
              ghost
              icon={<EditOutlined />}
              onClick={() => handleOpenEditModal(record)}
            />
          </Tooltip>

          <Tooltip title="Xóa danh mục">
            <Popconfirm
              title="Xóa danh mục sản phẩm"
              description="Bạn có chắc chắn muốn xóa danh mục này?"
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
              onConfirm={() => handleDelete(record)}
            >
              <Button
                danger
                icon={<DeleteOutlined />}
                loading={loadingDeleteId === record.MaDanhMuc}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className={styles.wrapper}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Quản lý Danh mục sản phẩm</h1>
          <p className={styles.pageSub}>
            Thêm, cập nhật và quản lý danh mục cha - con của sản phẩm
          </p>
        </div>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleOpenCreateModal}
          style={{
            borderRadius: 8,
            height: 38,
            whiteSpace: "nowrap",
          }}
        >
          Thêm danh mục
        </Button>
      </div>

      <div
        className={styles.toolbar}
        style={{
          display: "flex",
          alignItems: "center",
          flexWrap: "nowrap",
          gap: 12,
          width: "100%",
        }}
      >
        <Input
          placeholder="Tìm theo mã, tên danh mục, mô tả..."
          prefix={<SearchOutlined />}
          style={{
            flex: "1 1 420px",
            minWidth: 320,
            borderRadius: 8,
          }}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
        />

        <Select
          placeholder="Loại danh mục"
          style={{ width: 180 }}
          value={filterType}
          onChange={(val) => setFilterType(val)}
          allowClear
        >
          <Option value="parent">Danh mục cha</Option>
          <Option value="child">Danh mục con</Option>
        </Select>
      </div>

      <div className={styles.tableCard}>
        <Table
          key={treeData.length > 0 ? "has-data" : "empty-data"}
          className={styles.table}
          columns={columns}
          dataSource={treeData}
          pagination={false}
          loading={loadingTable}
          rowKey="MaDanhMuc"
          scroll={{ x: "max-content" }}
          defaultExpandAllRows
        />
      </div>

      <Modal
        title={
          editingCategory
            ? "Cập nhật danh mục sản phẩm"
            : "Thêm danh mục sản phẩm"
        }
        open={isModalOpen}
        onCancel={handleCloseModal}
        onOk={handleSubmit}
        okText={editingCategory ? "Cập nhật" : "Thêm mới"}
        cancelText="Hủy"
        confirmLoading={loadingSubmit}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Tên danh mục"
            name="TenDanhMuc"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập tên danh mục",
              },
              {
                max: 100,
                message: "Tên danh mục không được vượt quá 100 ký tự",
              },
            ]}
          >
            <Input placeholder="Nhập tên danh mục sản phẩm" />
          </Form.Item>

          <Form.Item label="Danh mục cha" name="ParentID">
            <Select placeholder="Không chọn nếu đây là danh mục cha" allowClear>
              {parentSelectOptions.map((item) => (
                <Option key={item.MaDanhMuc} value={item.MaDanhMuc}>
                  {item.TenDanhMuc}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Mô tả"
            name="MoTa"
            rules={[
              {
                max: 255,
                message: "Mô tả không được vượt quá 255 ký tự",
              },
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Nhập mô tả ngắn cho danh mục sản phẩm"
              showCount
              maxLength={255}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminCategories;
