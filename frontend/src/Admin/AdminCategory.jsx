import React, {useCallback, useEffect, useMemo, useState} from "react";
import {Alert, Button, Form, Input, message, Modal, Popconfirm, Select, Space, Table, Tag, Tooltip,} from "antd";
import {DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined, SubnodeOutlined,} from "@ant-design/icons";
import axios from "axios";
import styles from "./AdminCategory.module.css";

import { API_ADMIN_BASE } from "../config/api";

const {TextArea} = Input;
const {Option} = Select;
const API_BASE = `${API_ADMIN_BASE}/categories`;

const lineClampStyle = {
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    textOverflow: "ellipsis",
    lineHeight: "22px",
    whiteSpace: "normal",
};

const isEmptyParentID = (value) => {
    return value === undefined || value === null || value === "";
};

const hasParentID = (value) => {
    return value !== undefined && value !== null && value !== "";
};

const normalizeParentID = (value) => {
    if (isEmptyParentID(value)) return null;
    const numberValue = Number(value);
    return Number.isNaN(numberValue) ? null : numberValue;
};

const getResultData = (response) => {
    const apiData = response?.data;
    if (apiData && Array.isArray(apiData.result)) return apiData.result;
    if (apiData && Array.isArray(apiData.data)) return apiData.data;
    if (Array.isArray(apiData)) return apiData;
    return [];
};

const buildTree = (flatData) => {
    const map = new Map();
    const tree = [];

    flatData.forEach((item) => {
        map.set(Number(item.MaDanhMuc), {...item, children: []});
    });

    flatData.forEach((item) => {
        const node = map.get(Number(item.MaDanhMuc));
        if (!node) return;

        if (hasParentID(item.ParentID)) {
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
            const response = await axios.get(API_BASE, {withCredentials: true});

            if (response.data?.success) {
                const categories = getResultData(response);
                setData(categories);
                const rootCategories = categories.filter((item) =>
                    isEmptyParentID(item.ParentID),
                );
                setParentOptions(rootCategories);
            } else {
                message.error(
                    response.data?.message || "Không thể tải danh mục sản phẩm!",
                );
            }
        } catch (error) {
            console.error("Lỗi khi tải danh sách danh mục:", error);
            message.error(
                error?.response?.data?.message ||
                "Lỗi khi tải dữ liệu danh mục sản phẩm!",
            );
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
                String(item.TenDanhMuc || "")
                    .toLowerCase()
                    .includes(keyword) ||
                String(item.MoTa || "")
                    .toLowerCase()
                    .includes(keyword);

            const matchType =
                !filterType ||
                (filterType === "parent" && isEmptyParentID(item.ParentID)) ||
                (filterType === "child" && hasParentID(item.ParentID));

            return matchSearch && matchType;
        });
    }, [data, searchText, filterType]);

    const treeData = useMemo(() => buildTree(filteredData), [filteredData]);

    const editingCategoryHasChildren = useMemo(() => {
        if (!editingCategory) return false;
        return data.some(
            (item) => Number(item.ParentID) === Number(editingCategory.MaDanhMuc),
        );
    }, [data, editingCategory]);

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
                ParentID: editingCategoryHasChildren
                    ? null
                    : normalizeParentID(values.ParentID),
            };

            if (editingCategory) {
                await axios.put(`${API_BASE}/${editingCategory.MaDanhMuc}`, payload, {
                    withCredentials: true,
                });
                message.success("Cập nhật danh mục sản phẩm thành công!");
            } else {
                await axios.post(API_BASE, payload, {withCredentials: true});
                message.success("Thêm danh mục sản phẩm thành công!");
            }

            setIsModalOpen(false);
            setEditingCategory(null);
            form.resetFields();
            await fetchAllCategories();
        } catch (error) {
            if (error?.errorFields) return;
            message.error(
                error?.response?.data?.message || "Lỗi khi xử lý danh mục sản phẩm!",
            );
        } finally {
            setLoadingSubmit(false);
        }
    };

    const handleDelete = async (record) => {
        try {
            setLoadingDeleteId(record.MaDanhMuc);
            await axios.delete(`${API_BASE}/${record.MaDanhMuc}`, {
                withCredentials: true,
            });
            message.success("Xóa danh mục sản phẩm thành công!");
            await fetchAllCategories();
        } catch (error) {
            message.error(
                error?.response?.data?.message || "Không thể xóa danh mục sản phẩm!",
            );
        } finally {
            setLoadingDeleteId(null);
        }
    };

    const columns = [
        {
            title: "Tên danh mục",
            dataIndex: "TenDanhMuc",
            key: "TenDanhMuc",
            width: 300,
            render: (text, record) => {
                const isChild = hasParentID(record.ParentID);
                return (
                    <div style={{display: "flex", alignItems: "center", gap: 10}}>
                        {isChild && <SubnodeOutlined style={{color: "#a3aed1"}}/>}
                        <span
                            style={{
                                fontWeight: isChild
                                    ? 400
                                    : 600,
                                color: isChild ? "#4a5568" : "#2b3674",
                                fontSize: isChild ? "14px" : "15px",
                            }}
                        >
              {text}
            </span>
                    </div>
                );
            },
        },
        {
            title: "Cấp độ",
            key: "LoaiDanhMuc",
            width: 150,
            align: "center",
            render: (_, record) =>
                hasParentID(record.ParentID) ? (
                    <Tag color="cyan" variant={"filled"}>
                        Danh mục con
                    </Tag>
                ) : (
                    <Tag color="blue" variant={"filled"}>
                        Danh mục cha
                    </Tag>
                ),
        },
        {
            title: "Mô tả",
            dataIndex: "MoTa",
            key: "MoTa",
            render: (text) => {
                const content = text || "Chưa có mô tả";
                return (
                    <div
                        style={{
                            ...lineClampStyle,
                            color: text ? "#4a5568" : "#a0aec0",
                            fontStyle: text ? "normal" : "italic",
                        }}
                    >
                        {content}
                    </div>
                );
            },
        },
        {
            title: "Thao tác",
            key: "actions",
            width: 120,
            align: "right",
            render: (_, record) => (
                <Space size="middle">
                    <Tooltip title="Chỉnh sửa">
                        <Button
                            type="text"
                            icon={<EditOutlined style={{color: "#3182ce"}}/>}
                            onClick={() => handleOpenEditModal(record)}
                        />
                    </Tooltip>

                    <Tooltip title="Xóa">
                        <Popconfirm
                            title="Xóa danh mục"
                            description="Bạn có chắc chắn muốn xóa danh mục này?"
                            okText="Xóa"
                            cancelText="Hủy"
                            okButtonProps={{danger: true}}
                            onConfirm={() => handleDelete(record)}
                        >
                            <Button
                                type="text"
                                danger
                                icon={<DeleteOutlined/>}
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
                    <h1 className={styles.pageTitle}>Danh mục sản phẩm</h1>
                    <p className={styles.pageSub}>
                        Quản lý và tổ chức hệ thống cây danh mục
                    </p>
                </div>

                <Button
                    type="primary"
                    icon={<PlusOutlined/>}
                    onClick={handleOpenCreateModal}
                    style={{
                        borderRadius: 8,
                        height: 40,
                        padding: "0 20px",
                        fontWeight: 500,
                        boxShadow: "0 2px 6px rgba(24, 144, 255, 0.2)",
                    }}
                >
                    Thêm danh mục
                </Button>
            </div>

            <div className={styles.toolbar} style={{display: "flex", gap: 16}}>
                <Input
                    placeholder="Tìm kiếm danh mục..."
                    prefix={<SearchOutlined style={{color: "#a0aec0"}}/>}
                    style={{flex: 1, borderRadius: 8, padding: "8px 12px"}}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    allowClear
                />

                <Select
                    placeholder="Lọc theo cấp độ"
                    style={{width: 200}}
                    value={filterType}
                    onChange={(val) => setFilterType(val)}
                    allowClear
                    size="large"
                >
                    <Option value="parent">Chỉ danh mục cha</Option>
                    <Option value="child">Chỉ danh mục con</Option>
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
                    scroll={{x: 800}}
                    expandable={{
                        expandIcon: () => null,
                        defaultExpandAllRows: true,
                    }}
                />
            </div>

            <Modal
                title={
                    <span style={{fontSize: 18, fontWeight: 600, color: "#2b3674"}}>
            {editingCategory ? "Cập nhật danh mục" : "Thêm danh mục mới"}
          </span>
                }
                open={isModalOpen}
                onCancel={handleCloseModal}
                onOk={handleSubmit}
                okText={editingCategory ? "Lưu thay đổi" : "Thêm mới"}
                cancelText="Hủy"
                confirmLoading={loadingSubmit}
                destroyOnHidden={true}
                centered
                mask={
                    {
                        closable: true
                    }
                }
            >
                <Form form={form} layout="vertical" style={{marginTop: 24}}>
                    <Form.Item
                        label={<span style={{fontWeight: 500}}>Tên danh mục</span>}
                        name="TenDanhMuc"
                        rules={[
                            {required: true, message: "Vui lòng nhập tên danh mục"},
                            {
                                max: 100,
                                message: "Tên danh mục không được vượt quá 100 ký tự",
                            },
                        ]}
                    >
                        <Input size="large" placeholder="Ví dụ: Bát đĩa gốm sứ..."/>
                    </Form.Item>

                    {editingCategoryHasChildren && (
                        <Alert
                            type="warning"
                            showIcon
                            style={{marginBottom: 16, borderRadius: 8}}
                            title="Danh mục này đang chứa các danh mục con"
                            description="Bạn không thể biến nó thành danh mục con của một danh mục khác trừ khi bạn xóa hoặc di chuyển các danh mục con bên trong nó đi nơi khác."
                        />
                    )}

                    <Form.Item
                        label={<span style={{fontWeight: 500}}>Danh mục cha</span>}
                        name="ParentID"
                    >
                        <Select
                            size="large"
                            placeholder="Để trống nếu đây là danh mục gốc (Level 1)"
                            allowClear
                            disabled={editingCategoryHasChildren}
                        >
                            {parentSelectOptions.map((item) => (
                                <Option key={item.MaDanhMuc} value={item.MaDanhMuc}>
                                    {item.TenDanhMuc}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label={<span style={{fontWeight: 500}}>Mô tả ngắn</span>}
                        name="MoTa"
                        rules={[
                            {max: 255, message: "Mô tả không được vượt quá 255 ký tự"},
                        ]}
                    >
                        <TextArea
                            rows={4}
                            placeholder="Nhập mô tả..."
                            showCount
                            maxLength={255}
                            style={{resize: "none"}}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default AdminCategories;
