import {useCallback, useEffect, useMemo, useState} from "react";
import {
    Button,
    Descriptions,
    Divider,
    Form,
    Image,
    Input,
    InputNumber,
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
    CheckCircleOutlined,
    CloseCircleOutlined,
    EditOutlined,
    EyeOutlined,
    PlusOutlined,
    ReloadOutlined,
    SearchOutlined,
} from "@ant-design/icons";
import axios from "axios";
import styles from "./AdminTable.module.css";

const API_BASE = "https://ceramic-shop-u8ak.onrender.com/api/v1";
const axiosConfig = {withCredentials: true};

const NOTE_STATUS = {
    PENDING: 0,
    COMPLETED: 1,
    CANCELED: 2,
};

const STATUS_META = {
    [NOTE_STATUS.PENDING]: {
        text: "Chờ xử lý",
        color: "gold",
    },
    [NOTE_STATUS.COMPLETED]: {
        text: "Đã nhập kho",
        color: "green",
    },
    [NOTE_STATUS.CANCELED]: {
        text: "Đã hủy",
        color: "red",
    },
};

const formatCurrency = (value) => {
    const number = Number(value || 0);

    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
    }).format(number);
};

const formatDateTime = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "—";

    return new Intl.DateTimeFormat("vi-VN", {
        hour12: false,
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
};

const getStatusTag = (status) => {
    const meta = STATUS_META[Number(status)] || {
        text: "Không rõ",
        color: "default",
    };

    return <Tag color={meta.color}>{meta.text}</Tag>;
};

const getNoteDetails = (note) => note?.ChiTietPhieuNhaps || [];

const getVariantImage = (variant) =>
    variant?.HinhAnhBienThes?.[0]?.DuongDan ||
    variant?.HinhAnhBienThe?.[0]?.DuongDan ||
    variant?.SanPham?.Thumbnail ||
    "";

const getProductVariantText = (variant) => {
    const productName = variant?.SanPham?.TenSanPham || "";
    const variantName = variant?.TenBienThe || "";

    return [productName, variantName].filter(Boolean).join(" - ") || "—";
};

const normalizeProductList = (raw) => {
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.data)) return raw.data;
    if (Array.isArray(raw?.result)) return raw.result;
    if (Array.isArray(raw?.result?.data)) return raw.result.data;

    return [];
};

const normalizeSuppliers = (raw) => {
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.data)) return raw.data;
    if (Array.isArray(raw?.result)) return raw.result;
    if (Array.isArray(raw?.result?.data)) return raw.result.data;

    return [];
};

const normalizeVariants = (product) => {
    const source =
        product?.BienTheSanPhams ||
        product?.BienTheSanPham ||
        product?.variants ||
        product?.Variants ||
        [];

    return Array.isArray(source) ? source : [];
};

export default function AdminReceivedNotes() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);

    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [status, setStatus] = useState(undefined);

    const [suppliers, setSuppliers] = useState([]);
    const [products, setProducts] = useState([]);
    const [variantOptionsByRow, setVariantOptionsByRow] = useState({});

    const [detailOpen, setDetailOpen] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);
    const [currentDetail, setCurrentDetail] = useState(null);

    const [formOpen, setFormOpen] = useState(false);
    const [formMode, setFormMode] = useState("create");
    const [currentEditId, setCurrentEditId] = useState(null);
    const [submitLoading, setSubmitLoading] = useState(false);

    const [form] = Form.useForm();

    const watchedItems = Form.useWatch("items", form);

    const selectedVariantIds = useMemo(() => {
        const itemRows = watchedItems || [];

        return itemRows
            .map((item) => Number(item?.MaBienThe))
            .filter((id) => Number.isInteger(id) && id > 0);
    }, [watchedItems]);

    const fetchData = useCallback(async (signal) => {
        setLoading(true);

        try {
            const res = await axios.get(`${API_BASE}/admin/received_notes`, {
                ...axiosConfig,
                signal,
                params: {
                    page,
                    limit: 10,
                    search,
                    order: "DESC",
                    status,
                },
            });

            setData(res.data?.result?.data || []);
            setTotal(res.data?.result?.total || 0);
        } catch (error) {
            if (error.name === "CanceledError" || error.code === "ERR_CANCELED") {
                return;
            }

            message.error("Không thể tải danh sách phiếu nhập!");
        } finally {
            setLoading(false);
        }
    }, [page, search, status]);

    const fetchSuppliers = useCallback(async () => {
        try {
            const res = await axios.get(`${API_BASE}/admin/suppliers`, {
                ...axiosConfig,
                params: {
                    page: 1,
                    limit: 1000,
                    order: "ASC",
                },
            });

            setSuppliers(normalizeSuppliers(res.data));
        } catch {
            message.error("Không thể tải danh sách nhà cung cấp!");
        }
    }, []);

    const fetchProducts = useCallback(async () => {
        try {
            const res = await axios.get(`${API_BASE}/admin/products`, {
                ...axiosConfig,
                params: {
                    page: 1,
                    limit: 1000,
                    order: "ASC",
                },
            });

            setProducts(normalizeProductList(res.data));
        } catch {
            message.error("Không thể tải danh sách sản phẩm!");
        }
    }, []);

    const fetchProductVariants = async (productId, rowKey) => {
        if (!productId) {
            setVariantOptionsByRow((prev) => ({
                ...prev,
                [rowKey]: [],
            }));
            return;
        }

        const productInList = products.find(
            (product) => Number(product.MaSanPham) === Number(productId),
        );

        const variantsInList = normalizeVariants(productInList);

        if (variantsInList.length > 0) {
            setVariantOptionsByRow((prev) => ({
                ...prev,
                [rowKey]: variantsInList,
            }));
            return;
        }

        try {
            const res = await axios.get(`${API_BASE}/admin/products/${productId}`, {
                ...axiosConfig,
            });

            const productDetail = res.data?.result || res.data?.data || res.data;
            const variants = normalizeVariants(productDetail);

            setVariantOptionsByRow((prev) => ({
                ...prev,
                [rowKey]: variants,
            }));
        } catch {
            setVariantOptionsByRow((prev) => ({
                ...prev,
                [rowKey]: [],
            }));

            message.error("Không thể tải biến thể của sản phẩm!");
        }
    };

    useEffect(() => {
        const controller = new AbortController();

        queueMicrotask(() => {
            fetchData(controller.signal);
        });

        return () => {
            controller.abort();
        };
    }, [fetchData]);

    useEffect(() => {
        queueMicrotask(() => {
            fetchSuppliers();
            fetchProducts();
        });
    }, [fetchProducts, fetchSuppliers]);

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
        setStatus(undefined);
        setPage(1);
    };

    const openCreateModal = () => {
        setFormMode("create");
        setCurrentEditId(null);
        setVariantOptionsByRow({});
        form.resetFields();

        form.setFieldsValue({
            GhiChu: "",
            items: [
                {
                    MaSanPham: undefined,
                    MaBienThe: undefined,
                    SoLuong: 1,
                    GiaNhap: 0,
                },
            ],
        });

        setFormOpen(true);
    };

    const openUpdateModal = async (record) => {
        if (Number(record.TrangThai) !== NOTE_STATUS.PENDING) {
            message.warning("Chỉ được cập nhật phiếu nhập đang chờ xử lý!");
            return;
        }

        setFormMode("update");
        setCurrentEditId(record.MaPhieuNhap);
        setSubmitLoading(true);

        try {
            const res = await axios.get(
                `${API_BASE}/admin/received_notes/${record.MaPhieuNhap}`,
                axiosConfig,
            );

            const note = res.data?.result;
            const details = getNoteDetails(note);
            const nextVariantOptions = {};

            const items = details.map((detail, index) => {
                const variant = detail.BienTheSanPham || {};
                const productId = variant.MaSanPham;
                const rowKey = String(index);

                const productInList = products.find(
                    (product) => Number(product.MaSanPham) === Number(productId),
                );

                nextVariantOptions[rowKey] = normalizeVariants(productInList);

                if (nextVariantOptions[rowKey].length === 0 && variant.MaBienThe) {
                    nextVariantOptions[rowKey] = [variant];
                }

                return {
                    MaSanPham: productId,
                    MaBienThe: detail.MaBienThe,
                    SoLuong: Number(detail.SoLuong),
                    GiaNhap: Number(detail.GiaNhap),
                };
            });

            setVariantOptionsByRow(nextVariantOptions);

            form.setFieldsValue({
                MaNhaCC: note.MaNhaCC,
                GhiChu: note.GhiChu,
                items:
                    items.length > 0
                        ? items
                        : [
                            {
                                MaSanPham: undefined,
                                MaBienThe: undefined,
                                SoLuong: 1,
                                GiaNhap: 0,
                            },
                        ],
            });

            setFormOpen(true);
        } catch (error) {
            const errorMsg =
                error.response?.data?.message || "Không thể tải thông tin phiếu nhập!";
            message.error(errorMsg);
        } finally {
            setSubmitLoading(false);
        }
    };

    const closeFormModal = () => {
        setFormOpen(false);
        setCurrentEditId(null);
        setVariantOptionsByRow({});
        form.resetFields();
    };

    const openDetailModal = async (record) => {
        setDetailOpen(true);
        setDetailLoading(true);
        setCurrentDetail(null);

        try {
            const res = await axios.get(
                `${API_BASE}/admin/received_notes/${record.MaPhieuNhap}`,
                axiosConfig,
            );

            setCurrentDetail(res.data?.result || null);
        } catch (error) {
            const errorMsg =
                error.response?.data?.message || "Không thể tải chi tiết phiếu nhập!";
            message.error(errorMsg);
            setDetailOpen(false);
        } finally {
            setDetailLoading(false);
        }
    };

    const handleProductChange = async (fieldName, productId) => {
        const items = form.getFieldValue("items") || [];

        items[fieldName] = {
            ...items[fieldName],
            MaSanPham: productId,
            MaBienThe: undefined,
        };

        form.setFieldValue("items", items);

        await fetchProductVariants(productId, String(fieldName));
    };

    const handleSubmit = async (values) => {
        setSubmitLoading(true);

        try {
            const payload = {
                MaNhaCC: Number(values.MaNhaCC),
                GhiChu: values.GhiChu?.trim() || null,
                items: values.items.map((item) => ({
                    MaBienThe: Number(item.MaBienThe),
                    SoLuong: Number(item.SoLuong),
                    GiaNhap: Number(item.GiaNhap),
                })),
            };

            if (formMode === "create") {
                await axios.post(`${API_BASE}/admin/received_notes`, payload, axiosConfig);
                message.success("Thêm mới phiếu nhập thành công!");
            } else {
                await axios.patch(
                    `${API_BASE}/admin/received_notes/${currentEditId}`,
                    payload,
                    axiosConfig,
                );
                message.success("Cập nhật phiếu nhập thành công!");
            }

            closeFormModal();

            if (page === 1) {
                fetchData();
            } else {
                setPage(1);
            }
        } catch (error) {
            const errorMsg =
                error.response?.data?.message || "Có lỗi xảy ra khi lưu phiếu nhập!";
            message.error(errorMsg);
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleComplete = async (record) => {
        try {
            await axios.patch(
                `${API_BASE}/admin/received_notes/${record.MaPhieuNhap}/complete`,
                {},
                axiosConfig,
            );

            message.success("Xác nhận nhập kho thành công!");
            fetchData();
        } catch (error) {
            const errorMsg =
                error.response?.data?.message || "Không thể xác nhận nhập kho!";
            message.error(errorMsg);
        }
    };

    const handleCancel = async (record) => {
        try {
            await axios.patch(
                `${API_BASE}/admin/received_notes/${record.MaPhieuNhap}/cancel`,
                {},
                axiosConfig,
            );

            message.success("Hủy phiếu nhập thành công!");
            fetchData();
        } catch (error) {
            const errorMsg =
                error.response?.data?.message || "Không thể hủy phiếu nhập!";
            message.error(errorMsg);
        }
    };

    const detailColumns = [
        {
            title: "Sản phẩm",
            dataIndex: "BienTheSanPham",
            render: (variant) => {
                const image = getVariantImage(variant);

                return (
                    <div className={styles.inventoryProductCell}>
                        {image ? (
                            <Image
                                src={image}
                                alt={getProductVariantText(variant)}
                                className={styles.inventoryProductImage}
                                preview={false}
                            />
                        ) : (
                            <div className={styles.inventoryProductImagePlaceholder}/>
                        )}

                        <div className={styles.inventoryProductName}>
                            {getProductVariantText(variant)}
                        </div>
                    </div>
                );
            },
        },
        {
            title: "Số lượng",
            dataIndex: "SoLuong",
            width: 110,
            align: "center",
        },
        {
            title: "Giá nhập",
            dataIndex: "GiaNhap",
            width: 150,
            align: "right",
            render: formatCurrency,
        },
        {
            title: "Thành tiền",
            dataIndex: "ThanhTien",
            width: 160,
            align: "right",
            render: formatCurrency,
        },
    ];

    const columns = [
        {
            title: "Mã phiếu",
            dataIndex: "MaPhieuNhap",
            width: 100,
            render: (value) => <strong>#{value}</strong>,
        },
        {
            title: "Nhà cung cấp",
            dataIndex: "NhaCungCap",
            render: (supplier) => (
                <div>
                    <div className={styles.userName}>{supplier?.TenNhaCC || "—"}</div>
                    <div className={styles.userSub}>{supplier?.SDT || ""}</div>
                </div>
            ),
        },
        {
            title: "Ngày nhập",
            dataIndex: "NgayNhap",
            width: 160,
            render: formatDateTime,
        },
        {
            title: "Tổng tiền",
            dataIndex: "TongTien",
            width: 150,
            align: "right",
            render: (value) => <span className={styles.price}>{formatCurrency(value)}</span>,
        },
        {
            title: "Trạng thái",
            dataIndex: "TrangThai",
            width: 140,
            align: "center",
            render: getStatusTag,
        },
        {
            title: "Ghi chú",
            dataIndex: "GhiChu",
            width: 220,
            render: (value) => (
                <Tooltip title={value}>
                    <span className={styles.address}>{value || "—"}</span>
                </Tooltip>
            ),
        },
        {
            title: "Thao tác",
            width: 280,
            fixed: "right",
            render: (_, row) => {
                const isPending = Number(row.TrangThai) === NOTE_STATUS.PENDING;

                return (
                    <Space size={4} wrap>
                        <Tooltip title="Xem chi tiết">
                            <Button
                                type="text"
                                size="small"
                                icon={<EyeOutlined/>}
                                onClick={() => openDetailModal(row)}
                            />
                        </Tooltip>

                        <Tooltip title="Cập nhật">
                            <Button
                                type="text"
                                size="small"
                                icon={<EditOutlined/>}
                                disabled={!isPending}
                                className={styles.editBtn}
                                onClick={() => openUpdateModal(row)}
                            >
                                Sửa
                            </Button>
                        </Tooltip>

                        <Popconfirm
                            title="Xác nhận nhập kho?"
                            description="Sau khi xác nhận, tồn kho sẽ được cộng và không thể sửa phiếu."
                            okText="Xác nhận"
                            cancelText="Hủy"
                            disabled={!isPending}
                            onConfirm={() => handleComplete(row)}
                        >
                            <Button
                                type="text"
                                size="small"
                                icon={<CheckCircleOutlined/>}
                                disabled={!isPending}
                            >
                                Nhập kho
                            </Button>
                        </Popconfirm>

                        <Popconfirm
                            title="Hủy phiếu nhập?"
                            description="Phiếu đã hủy sẽ không thể xác nhận nhập kho."
                            okText="Hủy phiếu"
                            cancelText="Đóng"
                            disabled={!isPending}
                            onConfirm={() => handleCancel(row)}
                        >
                            <Button
                                danger
                                type="text"
                                size="small"
                                icon={<CloseCircleOutlined/>}
                                disabled={!isPending}
                            >
                                Hủy
                            </Button>
                        </Popconfirm>
                    </Space>
                );
            },
        },
    ];

    return (
        <div className={styles.wrapper}>
            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.pageTitle}>Quản lý phiếu nhập hàng</h1>
                    <p className={styles.pageSub}>Tổng cộng {total} phiếu nhập</p>
                </div>

                <Button
                    type="primary"
                    icon={<PlusOutlined/>}
                    className={styles.btnAdd}
                    onClick={openCreateModal}
                >
                    Thêm phiếu nhập
                </Button>
            </div>

            <div className={styles.toolbar}>
                <Input
                    prefix={<SearchOutlined/>}
                    placeholder="Tìm theo mã phiếu, nhà cung cấp..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className={styles.searchInput}
                    allowClear
                    onClear={handleReload}
                />

                <Select
                    placeholder="Trạng thái"
                    value={status}
                    allowClear
                    style={{width: 180}}
                    onChange={(value) => {
                        setStatus(value);
                        setPage(1);
                    }}
                    options={[
                        {
                            value: NOTE_STATUS.PENDING,
                            label: "Chờ xử lý",
                        },
                        {
                            value: NOTE_STATUS.COMPLETED,
                            label: "Đã nhập kho",
                        },
                        {
                            value: NOTE_STATUS.CANCELED,
                            label: "Đã hủy",
                        },
                    ]}
                />

                <Button icon={<ReloadOutlined/>} onClick={handleReload}>
                    Làm mới
                </Button>
            </div>

            <div className={styles.tableCard}>
                <Table
                    scroll={{x: 1100}}
                    dataSource={data}
                    columns={columns}
                    rowKey="MaPhieuNhap"
                    loading={loading}
                    className={styles.table}
                    pagination={{
                        current: page,
                        pageSize: 10,
                        total,
                        onChange: setPage,
                        showTotal: (t) => `Tổng ${t} phiếu nhập`,
                        showSizeChanger: false,
                    }}
                    size="middle"
                    locale={{emptyText: "Không có dữ liệu"}}
                />
            </div>

            <Modal
                title={
                    <span className={styles.modalTitle}>
            {formMode === "create" ? "Thêm phiếu nhập hàng" : "Cập nhật phiếu nhập"}
          </span>
                }
                open={formOpen}
                onCancel={closeFormModal}
                footer={null}
                destroyOnHidden
                width={980}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    className={styles.modalForm}
                >
                    <Form.Item
                        name="MaNhaCC"
                        label="Nhà cung cấp"
                        rules={[{required: true, message: "Vui lòng chọn nhà cung cấp!"}]}
                    >
                        <Select
                            showSearch
                            placeholder="Chọn nhà cung cấp"
                            optionFilterProp="label"
                            options={suppliers.map((supplier) => ({
                                value: supplier.MaNhaCC,
                                label: supplier.TenNhaCC,
                            }))}
                        />
                    </Form.Item>

                    <Form.Item
                        name="GhiChu"
                        label="Ghi chú"
                        rules={[
                            {
                                max: 255,
                                message: "Ghi chú không được quá 255 ký tự!",
                            },
                        ]}
                    >
                        <Input.TextArea rows={2} placeholder="Ví dụ: Nhập lô hàng đầu tháng"/>
                    </Form.Item>

                    <Divider orientation="left">Chi tiết sản phẩm nhập</Divider>

                    <Form.List name="items">
                        {(fields, {add, remove}) => (
                            <>
                                {fields.map((field) => {
                                    const rowVariants = variantOptionsByRow[String(field.name)] || [];

                                    return (
                                        <div key={field.key} className={styles.variantSection}>
                                            <div className={styles.variantTitle}>
                                                Sản phẩm nhập #{field.name + 1}
                                            </div>

                                            <div
                                                style={{
                                                    display: "grid",
                                                    gridTemplateColumns: "1.4fr 1.4fr 0.7fr 0.9fr auto",
                                                    gap: 12,
                                                    alignItems: "start",
                                                }}
                                            >
                                                <Form.Item
                                                    name={[field.name, "MaSanPham"]}
                                                    label="Sản phẩm"
                                                    rules={[
                                                        {
                                                            required: true,
                                                            message: "Vui lòng chọn sản phẩm!",
                                                        },
                                                    ]}
                                                >
                                                    <Select
                                                        showSearch
                                                        placeholder="Chọn sản phẩm"
                                                        optionFilterProp="label"
                                                        onChange={(value) => handleProductChange(field.name, value)}
                                                        options={products.map((product) => ({
                                                            value: product.MaSanPham,
                                                            label: product.TenSanPham,
                                                        }))}
                                                    />
                                                </Form.Item>

                                                <Form.Item
                                                    name={[field.name, "MaBienThe"]}
                                                    label="Biến thể"
                                                    rules={[
                                                        {
                                                            required: true,
                                                            message: "Vui lòng chọn biến thể!",
                                                        },
                                                    ]}
                                                >
                                                    <Select
                                                        showSearch
                                                        placeholder="Chọn biến thể"
                                                        optionFilterProp="label"
                                                        options={rowVariants.map((variant) => {
                                                            const disabled =
                                                                selectedVariantIds.includes(Number(variant.MaBienThe)) &&
                                                                Number(
                                                                    form.getFieldValue([
                                                                        "items",
                                                                        field.name,
                                                                        "MaBienThe",
                                                                    ]),
                                                                ) !== Number(variant.MaBienThe);

                                                            return {
                                                                value: variant.MaBienThe,
                                                                label: `${variant.TenBienThe} - Tồn: ${
                                                                    variant.SoLuong ?? 0
                                                                }`,
                                                                disabled,
                                                            };
                                                        })}
                                                    />
                                                </Form.Item>

                                                <Form.Item
                                                    name={[field.name, "SoLuong"]}
                                                    label="Số lượng"
                                                    rules={[
                                                        {
                                                            required: true,
                                                            message: "Nhập số lượng!",
                                                        },
                                                    ]}
                                                >
                                                    <InputNumber min={1} precision={0} style={{width: "100%"}}/>
                                                </Form.Item>

                                                <Form.Item
                                                    name={[field.name, "GiaNhap"]}
                                                    label="Giá nhập"
                                                    rules={[
                                                        {
                                                            required: true,
                                                            message: "Nhập giá nhập!",
                                                        },
                                                    ]}
                                                >
                                                    <InputNumber
                                                        min={1}
                                                        precision={0}
                                                        style={{width: "100%"}}
                                                        formatter={(value) =>
                                                            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                                        }
                                                        parser={(value) => value?.replace(/\$\s?|(,*)/g, "")}
                                                    />
                                                </Form.Item>

                                                <Form.Item label=" ">
                                                    <Button
                                                        danger
                                                        disabled={fields.length === 1}
                                                        onClick={() => remove(field.name)}
                                                    >
                                                        Xóa
                                                    </Button>
                                                </Form.Item>
                                            </div>
                                        </div>
                                    );
                                })}

                                <Button
                                    type="dashed"
                                    block
                                    icon={<PlusOutlined/>}
                                    onClick={() =>
                                        add({
                                            MaSanPham: undefined,
                                            MaBienThe: undefined,
                                            SoLuong: 1,
                                            GiaNhap: 0,
                                        })
                                    }
                                >
                                    Thêm dòng sản phẩm
                                </Button>
                            </>
                        )}
                    </Form.List>

                    <div className={styles.modalFooter}>
                        <Button onClick={closeFormModal} disabled={submitLoading}>
                            Hủy
                        </Button>

                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={submitLoading}
                            className={styles.btnAdd}
                        >
                            {formMode === "create" ? "Xác nhận thêm" : "Cập nhật"}
                        </Button>
                    </div>
                </Form>
            </Modal>

            <Modal
                title={<span className={styles.modalTitle}>Chi tiết phiếu nhập</span>}
                open={detailOpen}
                onCancel={() => setDetailOpen(false)}
                footer={null}
                width={980}
            >
                {detailLoading ? (
                    <Table loading pagination={false} columns={[]} dataSource={[]}/>
                ) : (
                    currentDetail && (
                        <>
                            <Descriptions bordered size="small" column={2}>
                                <Descriptions.Item label="Mã phiếu">
                                    #{currentDetail.MaPhieuNhap}
                                </Descriptions.Item>

                                <Descriptions.Item label="Trạng thái">
                                    {getStatusTag(currentDetail.TrangThai)}
                                </Descriptions.Item>

                                <Descriptions.Item label="Nhà cung cấp">
                                    {currentDetail.NhaCungCap?.TenNhaCC || "—"}
                                </Descriptions.Item>

                                <Descriptions.Item label="Nhân viên">
                                    {currentDetail.NhanVien?.TenNhanVien || "—"}
                                </Descriptions.Item>

                                <Descriptions.Item label="Ngày nhập">
                                    {formatDateTime(currentDetail.NgayNhap)}
                                </Descriptions.Item>

                                <Descriptions.Item label="Tổng tiền">
                                    <strong>{formatCurrency(currentDetail.TongTien)}</strong>
                                </Descriptions.Item>

                                <Descriptions.Item label="Ghi chú" span={2}>
                                    {currentDetail.GhiChu || "—"}
                                </Descriptions.Item>
                            </Descriptions>

                            <Divider orientation="left">Danh sách sản phẩm nhập</Divider>

                            <Table
                                rowKey="MaChiTietPhieu"
                                columns={detailColumns}
                                dataSource={getNoteDetails(currentDetail)}
                                pagination={false}
                                size="middle"
                                className={styles.table}
                            />
                        </>
                    )
                )}
            </Modal>
        </div>
    );
}
