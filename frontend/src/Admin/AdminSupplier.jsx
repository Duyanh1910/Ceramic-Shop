import {useEffect, useState} from "react";
import {Button, Form, Input, message, Modal, Table, Tooltip} from "antd";
import {EditOutlined, PlusOutlined, SearchOutlined,} from "@ant-design/icons";
import axios from "axios";
import styles from "./AdminTable.module.css";
import { API_BASE } from "../config/api";

export default function AdminSuppliers() {
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

    const fetchData = async (signal) => {
        setLoading(true);

        try {
            const res = await axios.get(`${API_BASE}/admin/suppliers`, {
                ...axiosConfig,
                signal,
                params: {
                    page,
                    limit: 10,
                    search,
                    sort: "MaNhaCC",
                    order: "DESC",
                },
            });

            setData(res.data?.result?.data || []);
            setTotal(res.data?.result?.total || 0);
        } catch (error) {
            if (error.name === "CanceledError" || error.code === "ERR_CANCELED") {
                return;
            }

            message.error("Không thể tải danh sách nhà cung cấp!");
        } finally {
            setLoading(false);
        }
    };
    const axiosConfig = {withCredentials: true};

    useEffect(() => {
        const controller = new AbortController();

        queueMicrotask(() => {
            fetchData(controller.signal);
        });

        return () => {
            controller.abort();
        };
    }, [page, search]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(searchInput.trim());
            setPage(1);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchInput]);

    const handleReload = () => {
        setSearchInput("");
        setSearch("");
        setPage(1);
    };

    const showAddModal = () => {
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleCancelModal = () => {
        setIsModalVisible(false);
        form.resetFields();
    };

    const handleAddSubmit = async (values) => {
        setSubmitLoading(true);

        try {
            const payload = {
                TenNhaCC: values.TenNhaCC.trim(),
                Diachi: values.Diachi?.trim() || null,
                SDT: values.SDT?.trim() || null,
            };

            await axios.post(`${API_BASE}/admin/suppliers`, payload, axiosConfig);

            message.success("Thêm nhà cung cấp mới thành công!");
            setIsModalVisible(false);
            form.resetFields();

            if (page === 1) {
                fetchData();
            } else {
                setPage(1);
            }
        } catch (error) {
            const errorMsg =
                error.response?.data?.message || "Có lỗi xảy ra khi thêm nhà cung cấp!";
            message.error(errorMsg);
        } finally {
            setSubmitLoading(false);
        }
    };

    const showEditModal = (record) => {
        setCurrentEditId(record.MaNhaCC);

        editForm.setFieldsValue({
            TenNhaCC: record.TenNhaCC,
            Diachi: record.Diachi,
            SDT: record.SDT,
        });

        setIsEditModalVisible(true);
    };

    const handleCancelEditModal = () => {
        setIsEditModalVisible(false);
        setCurrentEditId(null);
        editForm.resetFields();
    };

    const handleEditSubmit = async (values) => {
        if (!currentEditId) {
            message.error("Không tìm thấy ID nhà cung cấp cần sửa!");
            return;
        }

        setEditSubmitLoading(true);

        try {
            const payload = {
                TenNhaCC: values.TenNhaCC.trim(),
                Diachi: values.Diachi?.trim() || null,
                SDT: values.SDT?.trim() || null,
            };

            await axios.patch(
                `${API_BASE}/admin/suppliers/${currentEditId}`,
                payload,
                axiosConfig,
            );

            message.success("Cập nhật thông tin nhà cung cấp thành công!");
            handleCancelEditModal();
            fetchData();
        } catch (error) {
            const errorMsg =
                error.response?.data?.message ||
                "Có lỗi xảy ra khi cập nhật thông tin nhà cung cấp!";
            message.error(errorMsg);
        } finally {
            setEditSubmitLoading(false);
        }
    };

    const columns = [
        {
            title: "Mã NCC",
            dataIndex: "MaNhaCC",
            width: 100,
        },
        {
            title: "Tên nhà cung cấp",
            dataIndex: "TenNhaCC",
            render: (value) => <div className={styles.userName}>{value}</div>,
        },
        {
            title: "Số điện thoại",
            dataIndex: "SDT",
            width: 160,
            render: (value) => value || "—",
        },
        {
            title: "Địa chỉ",
            dataIndex: "Diachi",
            render: (value) => (
                <Tooltip title={value}>
                    <span className={styles.address}>{value || "—"}</span>
                </Tooltip>
            ),
        },
        {
            title: "Thao tác",
            width: 130,
            render: (_, row) => (
                <Tooltip title="Cập nhật">
                    <Button
                        type="text"
                        icon={<EditOutlined/>}
                        size="small"
                        className={styles.editBtn}
                        onClick={() => showEditModal(row)}
                    >
                        Cập nhật
                    </Button>
                </Tooltip>
            ),
        },
    ];

    return (
        <div className={styles.wrapper}>
            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.pageTitle}>Quản lý nhà cung cấp</h1>
                    <p className={styles.pageSub}>Tổng cộng {total} nhà cung cấp</p>
                </div>

                <Button
                    type="primary"
                    icon={<PlusOutlined/>}
                    className={styles.btnAdd}
                    onClick={showAddModal}
                >
                    Thêm nhà cung cấp
                </Button>
            </div>

            <div className={styles.toolbar}>
                <Input
                    prefix={<SearchOutlined/>}
                    placeholder="Tìm theo tên, số điện thoại, địa chỉ..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className={styles.searchInput}
                    allowClear
                    onClear={handleReload}
                />
            </div>

            <div className={styles.tableCard}>
                <Table
                    scroll={{x: 900}}
                    dataSource={data}
                    columns={columns}
                    rowKey="MaNhaCC"
                    loading={loading}
                    className={styles.table}
                    pagination={{
                        current: page,
                        pageSize: 10,
                        total,
                        onChange: setPage,
                        showTotal: (t) => `Tổng ${t} nhà cung cấp`,
                        showSizeChanger: false,
                    }}
                    size="middle"
                    locale={{emptyText: "Không có dữ liệu"}}
                />
            </div>

            <Modal
                title={<span className={styles.modalTitle}>Thêm nhà cung cấp mới</span>}
                open={isModalVisible}
                onCancel={handleCancelModal}
                footer={null}
                destroyOnHidden={true}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleAddSubmit}
                    className={styles.modalForm}
                >
                    <Form.Item
                        name="TenNhaCC"
                        label="Tên nhà cung cấp"
                        rules={[
                            {required: true, message: "Vui lòng nhập tên nhà cung cấp!"},
                            {
                                max: 255,
                                message: "Tên nhà cung cấp không được quá 255 ký tự!",
                            },
                        ]}
                    >
                        <Input placeholder="Ví dụ: Công ty Gốm Sứ Minh Long"/>
                    </Form.Item>

                    <Form.Item
                        name="SDT"
                        label="Số điện thoại"
                        rules={[
                            {
                                pattern: /^[0-9]{10,11}$/,
                                message: "Số điện thoại không hợp lệ!",
                            },
                        ]}
                    >
                        <Input placeholder="Ví dụ: 0912345678"/>
                    </Form.Item>

                    <Form.Item
                        name="Diachi"
                        label="Địa chỉ"
                        rules={[{max: 255, message: "Địa chỉ không được quá 255 ký tự!"}]}
                    >
                        <Input.TextArea
                            rows={2}
                            placeholder="Ví dụ: 120 Yên Lãng, Hà Nội"
                        />
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
            Cập nhật thông tin nhà cung cấp
          </span>
                }
                open={isEditModalVisible}
                onCancel={handleCancelEditModal}
                footer={null}
                destroyOnHidden={true}
            >
                <Form
                    form={editForm}
                    layout="vertical"
                    onFinish={handleEditSubmit}
                    className={styles.modalForm}
                >
                    <Form.Item
                        name="TenNhaCC"
                        label="Tên nhà cung cấp"
                        rules={[
                            {required: true, message: "Vui lòng nhập tên nhà cung cấp!"},
                            {
                                max: 255,
                                message: "Tên nhà cung cấp không được quá 255 ký tự!",
                            },
                        ]}
                    >
                        <Input placeholder="Ví dụ: Công ty Gốm Sứ Minh Long"/>
                    </Form.Item>

                    <Form.Item
                        name="SDT"
                        label="Số điện thoại"
                        rules={[
                            {
                                pattern: /^[0-9]{10,11}$/,
                                message: "Số điện thoại không hợp lệ!",
                            },
                        ]}
                    >
                        <Input placeholder="Ví dụ: 0912345678"/>
                    </Form.Item>

                    <Form.Item
                        name="Diachi"
                        label="Địa chỉ"
                        rules={[{max: 255, message: "Địa chỉ không được quá 255 ký tự!"}]}
                    >
                        <Input.TextArea
                            rows={2}
                            placeholder="Ví dụ: Hai Bà Trưng, Hà Nội"
                        />
                    </Form.Item>

                    <div className={styles.modalFooter}>
                        <Button
                            onClick={handleCancelEditModal}
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
