import {useEffect, useState} from "react";
import {
    Button,
    Col,
    Divider,
    Empty,
    Form,
    Image,
    Input,
    message,
    Modal,
    Row,
    Select,
    Space,
    Switch,
    Table,
    Tooltip,
    Typography,
    Upload,
} from "antd";
import {
    CameraOutlined,
    EditOutlined,
    EyeOutlined,
    FileTextOutlined,
    PlusOutlined,
    ReloadOutlined,
    SearchOutlined,
    UploadOutlined,
} from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";

import {Editor} from "@tinymce/tinymce-react";
import "tinymce/tinymce";
import "tinymce/icons/default";
import "tinymce/themes/silver";
import "tinymce/models/dom";
import "tinymce/skins/ui/oxide/skin.min.css";
import "tinymce/skins/content/default/content.min.css";
import "tinymce/plugins/advlist";
import "tinymce/plugins/autolink";
import "tinymce/plugins/image";
import "tinymce/plugins/link";
import "tinymce/plugins/lists";
import "tinymce/plugins/preview";
import "tinymce/plugins/table";
import "tinymce/plugins/wordcount";

import styles from "./AdminNews.module.css";
import { API_ADMIN_BASE as API_BASE } from "../config/api";

const CDN_CLOUD = "dcmwz0uis";
const CDN_PRESET = "the_creamy_shop";

const authH = () => ({
    headers: {
        Authorization: `Bearer ${
            localStorage.getItem("customer_token") ||
            localStorage.getItem("admin_token")
        }`,
    },
    withCredentials: true,
});

const TinyMceEditor = ({value = "", onChange}) => {
    const uploadImageToCloudinary = async (file) => {
        if (!file) {
            throw new Error("Không tìm thấy file ảnh!");
        }

        if (file.size > 5 * 1024 * 1024) {
            message.error("Ảnh tối đa 5MB!");
            throw new Error("Ảnh tối đa 5MB!");
        }

        const fd = new FormData();
        fd.append("file", file);
        fd.append("upload_preset", CDN_PRESET);

        const res = await axios.post(
            `https://api.cloudinary.com/v1_1/${CDN_CLOUD}/image/upload`,
            fd,
        );

        return res.data.secure_url;
    };

    return (
        <Editor
            value={value || ""}
            onEditorChange={(content) => onChange?.(content)}
            init={{
                height: 420,
                menubar: "file edit view insert format table help",
                plugins: "advlist autolink lists link image table preview wordcount",
                toolbar:
                    "undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | " +
                    "alignleft aligncenter alignright alignjustify | " +
                    "bullist numlist outdent indent | forecolor backcolor | link image table | removeformat preview",
                toolbar_mode: "wrap",

                image_advtab: true,
                image_caption: true,

                fontsize_formats:
                    "12px 14px 16px 18px 20px 24px 28px 32px 36px 48px",

                block_formats:
                    "Đoạn văn=p; Tiêu đề 1=h1; Tiêu đề 2=h2; Tiêu đề 3=h3; Trích dẫn=blockquote",

                branding: false,
                promotion: false,
                resize: true,
                license_key: "gpl",

                automatic_uploads: true,
                paste_data_images: true,
                images_file_types: "jpeg,jpg,png,webp,gif",
                file_picker_types: "image",

                invalid_elements: "script,iframe,object,embed,form,input,button",
                extended_valid_elements:
                    "a[href|target=_blank|rel],img[src|alt|title|width|height|style],span[style],p[style],h1[style],h2[style],h3[style],table[style|border],tr[style],td[style|colspan|rowspan],th[style|colspan|rowspan]",

                content_style: `
          body {
            font-family: Arial, Helvetica, sans-serif;
            font-size: 16px;
            line-height: 1.7;
          }

          img {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
          }

          a {
            color: #1677ff;
            text-decoration: underline;
          }
        `,

                images_upload_handler: async (blobInfo) => {
                    const hideMsg = message.loading("Đang tải ảnh lên...", 0);

                    try {
                        const url = await uploadImageToCloudinary(blobInfo.blob());
                        hideMsg();
                        message.success("Tải ảnh thành công!");
                        return url;
                    } catch (error) {
                        hideMsg();
                        message.error("Lỗi khi tải ảnh lên!");
                        throw error;
                    }
                },

                file_picker_callback: (callback) => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = "image/*";

                    input.onchange = async () => {
                        const file = input.files?.[0];
                        if (!file) return;

                        const hideMsg = message.loading("Đang tải ảnh lên...", 0);

                        try {
                            const url = await uploadImageToCloudinary(file);
                            hideMsg();
                            message.success("Tải ảnh thành công!");
                            callback(url, {title: file.name});
                        } catch (error) {
                            hideMsg();
                            message.error("Lỗi khi tải ảnh lên!");
                            console.error(error);
                        }
                    };

                    input.click();
                },
            }}
        />
    );
};

export default function AdminNews() {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [modalOpen, setModalOpen] = useState(false);
    const [editRecord, setEditRecord] = useState(null);

    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [viewRecord, setViewRecord] = useState(null);

    const [sortOrder, setSortOrder] = useState("newest");
    const [search, setSearch] = useState("");
    const [uploading, setUploading] = useState(false);
    const [imgPreview, setImgPreview] = useState("");

    const [statusFilter, setStatusFilter] = useState(null);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchNews();
    }, []);

    useEffect(() => {
        const handleFocusIn = (e) => {
            if (document.querySelector(".tox-tinymce-aux")?.contains(e.target)) {
                e.stopImmediatePropagation();
            }
        };

        document.addEventListener("focusin", handleFocusIn, true);

        return () => {
            document.removeEventListener("focusin", handleFocusIn, true);
        };
    }, []);

    const fetchNews = async () => {
        setLoading(true);

        try {
            const res = await axios.get(`${API_BASE}/news`, authH());
            setNews(res.data?.result || []);
        } catch {
            message.error("Không thể tải danh sách tin tức!");
        } finally {
            setLoading(false);
        }
    };

    const openCreate = () => {
        setEditRecord(null);
        setImgPreview("");

        form.resetFields();
        form.setFieldsValue({
            TrangThai: true,
            NoiDung: "",
            HinhAnh: "",
        });

        setModalOpen(true);
    };

    const openEdit = (record) => {
        setEditRecord(record);
        setImgPreview(record.HinhAnh || "");

        form.setFieldsValue({
            TieuDe: record.TieuDe,
            NoiDung: record.NoiDung || "",
            HinhAnh: record.HinhAnh || "",
            TrangThai: Number(record.TrangThai) === 1,
        });

        setModalOpen(true);
    };

    const openView = (record) => {
        setViewRecord(record);
        setViewModalOpen(true);
    };

    const uploadCoverImage = async (file) => {
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            message.error("Ảnh tối đa 5MB!");
            return;
        }

        setUploading(true);

        try {
            const fd = new FormData();
            fd.append("file", file);
            fd.append("upload_preset", CDN_PRESET);

            const res = await axios.post(
                `https://api.cloudinary.com/v1_1/${CDN_CLOUD}/image/upload`,
                fd,
            );

            const url = res.data.secure_url;

            form.setFieldValue("HinhAnh", url);
            setImgPreview(url);
            message.success("Tải ảnh thành công!");
        } catch {
            message.error("Tải ảnh thất bại!");
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async (values) => {
        setSaving(true);

        try {
            const payload = {
                title: values.TieuDe,
                content: values.NoiDung,
                imageUrl: values.HinhAnh,
                status: values.TrangThai ? 1 : 0,
            };

            if (editRecord) {
                await axios.patch(
                    `${API_BASE}/news/${editRecord.MaTinTuc}`,
                    payload,
                    authH(),
                );

                message.success("Cập nhật tin tức thành công!");
            } else {
                await axios.post(`${API_BASE}/news`, payload, authH());
                message.success("Tạo tin tức thành công!");
            }

            setModalOpen(false);
            fetchNews();
        } catch (err) {
            message.error(err.response?.data?.message || "Thao tác thất bại!");
        } finally {
            setSaving(false);
        }
    };

    const handleStatusChange = async (checked, record) => {
        const newStatus = checked ? 1 : 0;

        try {
            await axios.patch(
                `${API_BASE}/news/${record.MaTinTuc}/status`,
                {status: newStatus},
                authH(),
            );

            message.success(`Đã ${checked ? "hiển thị" : "ẩn"} bài viết!`);

            setNews((prevNews) =>
                prevNews.map((item) =>
                    item.MaTinTuc === record.MaTinTuc
                        ? {...item, TrangThai: newStatus}
                        : item,
                ),
            );
        } catch (err) {
            message.error(
                err.response?.data?.message || "Lỗi khi cập nhật trạng thái!",
            );
        }
    };

    const filteredAndSorted = news
        .filter((item) => {
            const title = item.TieuDe || "";

            const matchesSearch =
                !search || title.toLowerCase().includes(search.toLowerCase());

            const matchesStatus =
                statusFilter === null || Number(item.TrangThai) === statusFilter;

            return matchesSearch && matchesStatus;
        })
        .sort((a, b) => {
            const dateA = dayjs(a.NgayTao).valueOf();
            const dateB = dayjs(b.NgayTao).valueOf();

            return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
        });

    const totalVisible = news.filter((item) => Number(item.TrangThai) === 1).length;
    const totalHidden = news.filter((item) => Number(item.TrangThai) === 0).length;

    const columns = [
        {
            title: "Ảnh",
            key: "img",
            width: 80,
            render: (_, record) =>
                record.HinhAnh ? (
                    <Image
                        src={record.HinhAnh}
                        width={56}
                        height={42}
                        style={{objectFit: "cover", borderRadius: 6}}
                    />
                ) : (
                    <div className={styles.noImg}>
                        <CameraOutlined/>
                    </div>
                ),
        },
        {
            title: "Tiêu đề",
            key: "title",
            render: (_, record) => (
                <div className={styles.cellTitle}>
                    <div className={styles.titleText}>{record.TieuDe}</div>

                    <div className={styles.titleMeta}>
                        {record.NhanVien?.TenNhanVien && (
                            <span>{record.NhanVien.TenNhanVien} · </span>
                        )}
                        <span>{dayjs(record.NgayTao).format("DD/MM/YYYY")}</span>
                    </div>
                </div>
            ),
        },
        {
            title: "Trạng thái",
            key: "status",
            width: 120,
            render: (_, record) => (
                <Switch
                    checked={Number(record.TrangThai) === 1}
                    onChange={(checked) => handleStatusChange(checked, record)}
                    checkedChildren="Hiện"
                    unCheckedChildren="Ẩn"
                />
            ),
        },
        {
            title: "Thao tác",
            key: "actions",
            width: 120,
            fixed: "right",
            render: (_, record) => (
                <Space size={4}>
                    <Tooltip title="Xem">
                        <Button
                            type="text"
                            icon={<EyeOutlined/>}
                            onClick={() => openView(record)}
                        />
                    </Tooltip>

                    <Tooltip title="Sửa">
                        <Button
                            type="text"
                            icon={<EditOutlined/>}
                            className={styles.btnEdit}
                            onClick={() => openEdit(record)}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div className={styles.page}>
            <div className={styles.pageHeader}>
                <div className={styles.headerLeft}>
                    <FileTextOutlined className={styles.headerIcon}/>

                    <div>
                        <h1 className={styles.pageTitle}>Quản lý Tin tức</h1>
                        <p className={styles.pageSub}>Tạo và chỉnh sửa bài viết tin tức</p>
                    </div>
                </div>

                <Button
                    type="primary"
                    icon={<PlusOutlined/>}
                    className={styles.btnCreate}
                    onClick={openCreate}
                >
                    Viết tin mới
                </Button>
            </div>

            <Row gutter={[12, 12]} className={styles.statsRow}>
                {[
                    {
                        label: "Tổng tin",
                        value: news.length,
                        color: "#1b437c",
                        bg: "#e8f0fe",
                        status: null,
                    },
                    {
                        label: "Đang hiện",
                        value: totalVisible,
                        color: "#52c41a",
                        bg: "#f6ffed",
                        status: 1,
                    },
                    {
                        label: "Đang ẩn",
                        value: totalHidden,
                        color: "#888",
                        bg: "#f5f5f5",
                        status: 0,
                    },
                ].map((item, index) => (
                    <Col xs={24} sm={8} key={index}>
                        <div
                            className={styles.statCard}
                            style={{
                                "--c": item.color,
                                "--bg": item.bg,
                                cursor: "pointer",
                                border:
                                    statusFilter === item.status
                                        ? `2px solid ${item.color}`
                                        : "1px solid rgba(0, 0, 0, 0.04)",
                                boxShadow:
                                    statusFilter === item.status
                                        ? "0 4px 12px rgba(0,0,0,0.12)"
                                        : "none",
                                transform:
                                    statusFilter === item.status ? "translateY(-2px)" : "none",
                                transition: "all 0.2s ease",
                            }}
                            onClick={() =>
                                setStatusFilter((prev) =>
                                    prev === item.status ? null : item.status,
                                )
                            }
                        >
                            <div className={styles.statNum}>{item.value}</div>

                            <div className={styles.statLabel}>
                                {item.label}{" "}
                                {statusFilter === item.status &&
                                    item.status !== null &&
                                    "• Đang lọc"}
                            </div>
                        </div>
                    </Col>
                ))}
            </Row>

            <div className={styles.toolbar} style={{display: "flex", gap: "8px"}}>
                <Input
                    prefix={<SearchOutlined style={{color: "#bbb"}}/>}
                    placeholder="Tìm kiếm tiêu đề..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    allowClear
                    className={styles.searchInput}
                    style={{flex: 1}}
                />

                <Select
                    value={sortOrder}
                    onChange={(value) => setSortOrder(value)}
                    style={{width: 140}}
                    options={[
                        {value: "newest", label: "Mới nhất"},
                        {value: "oldest", label: "Cũ nhất"},
                    ]}
                />

                <Button
                    icon={<ReloadOutlined/>}
                    onClick={fetchNews}
                    className={styles.btnRefresh}
                />
            </div>

            <div className={styles.tableWrap}>
                <Table
                    columns={columns}
                    dataSource={filteredAndSorted}
                    rowKey="MaTinTuc"
                    loading={loading}
                    scroll={{x: 700}}
                    pagination={{
                        pageSize: 10,
                        showTotal: (total) => `${total} tin tức`,
                    }}
                    className={styles.table}
                    locale={{
                        emptyText: (
                            <Empty
                                description={
                                    statusFilter !== null
                                        ? "Không tìm thấy tin tức nào khớp với trạng thái lựa chọn"
                                        : "Chưa có tin tức nào"
                                }
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                            />
                        ),
                    }}
                />
            </div>

            <Modal
                open={modalOpen}
                onCancel={() => setModalOpen(false)}
                centered
                title={
                    <div className={styles.modalTitle}>
                        {editRecord ? <EditOutlined/> : <PlusOutlined/>}
                        {editRecord ? " Chỉnh sửa tin tức" : " Viết tin mới"}
                    </div>
                }
                footer={null}
                width={1000}
                destroyOnHidden
                className={styles.modal}
            >
                <Form form={form} layout="vertical" onFinish={handleSave}>
                    <Form.Item
                        name="TieuDe"
                        label="Tiêu đề"
                        rules={[{required: true, message: "Nhập tiêu đề!"}]}
                    >
                        <Input placeholder="Tiêu đề tin tức..." className={styles.input}/>
                    </Form.Item>

                    <Form.Item label="Ảnh bìa">
                        <div className={styles.uploadArea}>
                            {imgPreview && (
                                <img
                                    src={imgPreview}
                                    alt="preview"
                                    className={styles.imgPreview}
                                />
                            )}

                            <Upload
                                showUploadList={false}
                                beforeUpload={(file) => {
                                    uploadCoverImage(file);
                                    return false;
                                }}
                                accept=".jpg,.jpeg,.png,.webp"
                            >
                                <Button
                                    icon={<UploadOutlined/>}
                                    loading={uploading}
                                    className={styles.btnUpload}
                                >
                                    {uploading ? "Đang tải..." : "Chọn ảnh"}
                                </Button>
                            </Upload>

                            <Form.Item
                                name="HinhAnh"
                                noStyle
                                rules={[
                                    {
                                        type: "url",
                                        message: "URL ảnh không hợp lệ!",
                                    },
                                ]}
                            >
                                <Input
                                    placeholder="Hoặc dán URL ảnh..."
                                    className={styles.input}
                                    style={{flex: 1}}
                                    onChange={(e) => setImgPreview(e.target.value)}
                                />
                            </Form.Item>
                        </div>
                    </Form.Item>

                    <Form.Item
                        name="NoiDung"
                        label="Nội dung"
                        rules={[{required: true, message: "Nhập nội dung bài viết!"}]}
                    >
                        <TinyMceEditor/>
                    </Form.Item>

                    <div className={styles.formRow2}>
                        <Form.Item
                            name="TrangThai"
                            label="Hiển thị công khai"
                            valuePropName="checked"
                        >
                            <Switch checkedChildren="Hiện" unCheckedChildren="Ẩn"/>
                        </Form.Item>
                    </div>

                    <Divider style={{margin: "8px 0 16px"}}/>

                    <div style={{display: "flex", gap: 10, justifyContent: "flex-end"}}>
                        <Button onClick={() => setModalOpen(false)}>Huỷ</Button>

                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={saving}
                            className={styles.btnSave}
                        >
                            {editRecord ? "Lưu thay đổi" : "Đăng tin"}
                        </Button>
                    </div>
                </Form>
            </Modal>

            <Modal
                open={viewModalOpen}
                onCancel={() => setViewModalOpen(false)}
                centered
                footer={[
                    <Button key="close" onClick={() => setViewModalOpen(false)}>
                        Đóng
                    </Button>,
                ]}
                width={1000}
                title="Xem trước bài viết"
                destroyOnHidden
            >
                {viewRecord && (
                    <div style={{padding: "20px 0"}}>
                        <Typography.Title level={2}>{viewRecord.TieuDe}</Typography.Title>

                        <div style={{color: "gray", marginBottom: "20px"}}>
                            <span>{dayjs(viewRecord.NgayTao).format("DD/MM/YYYY HH:mm")}</span>

                            {viewRecord.NhanVien?.TenNhanVien && (
                                <span> - Đăng bởi: {viewRecord.NhanVien.TenNhanVien}</span>
                            )}
                        </div>

                        {viewRecord.HinhAnh && (
                            <div style={{textAlign: "center", marginBottom: "20px"}}>
                                <img
                                    src={viewRecord.HinhAnh}
                                    alt={viewRecord.TieuDe}
                                    style={{
                                        maxWidth: "100%",
                                        maxHeight: "400px",
                                        objectFit: "contain",
                                        borderRadius: "8px",
                                    }}
                                />
                            </div>
                        )}

                        <div className="view-content-html">
                            <style>{`
                .view-content-html ul {
                  list-style-type: disc;
                  padding-left: 24px;
                  margin-bottom: 1em;
                }

                .view-content-html ol {
                  list-style-type: decimal;
                  padding-left: 24px;
                  margin-bottom: 1em;
                }

                .view-content-html li {
                  display: list-item;
                }

                .view-content-html a {
                  color: #1677ff;
                  text-decoration: underline;
                }

                .view-content-html img {
                  max-width: 100%;
                  height: auto;
                  border-radius: 8px;
                }

                .view-content-html table {
                  border-collapse: collapse;
                  width: 100%;
                  margin: 1em 0;
                }

                .view-content-html table,
                .view-content-html th,
                .view-content-html td {
                  border: 1px solid #ddd;
                }

                .view-content-html th,
                .view-content-html td {
                  padding: 8px;
                }
              `}</style>

                            <div dangerouslySetInnerHTML={{__html: viewRecord.NoiDung}}/>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
