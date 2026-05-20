import { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Switch,
  Tooltip,
  message,
  Space,
  Select,
  Row,
  Col,
  Upload,
  Divider,
  Empty,
  Image,
  Typography,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  FileTextOutlined,
  SearchOutlined,
  ReloadOutlined,
  UploadOutlined,
  CameraOutlined,
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined,
  OrderedListOutlined,
  UnorderedListOutlined,
  PictureOutlined,
  LinkOutlined,
  CodeOutlined,
  EyeOutlined,
  FontSizeOutlined,
  AlignLeftOutlined,
  AlignCenterOutlined,
  AlignRightOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";

import { useEditor, EditorContent } from "@tiptap/react";
import { Extension } from "@tiptap/core";
import TextStyle from "@tiptap/extension-text-style";
import TextAlign from "@tiptap/extension-text-align";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TiptapImage from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";

import styles from "./AdminNews.module.css";

const API_BASE = "https://ceramic-shop-u8ak.onrender.com/api/v1/admin";
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

const FontSize = Extension.create({
  name: "fontSize",

  addOptions() {
    return {
      types: ["textStyle"],
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => element.style.fontSize || null,
            renderHTML: (attributes) => {
              if (!attributes.fontSize) {
                return {};
              }

              return {
                style: `font-size: ${attributes.fontSize}`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setFontSize:
        (fontSize) =>
        ({ chain }) => {
          return chain().setMark("textStyle", { fontSize }).run();
        },

      unsetFontSize:
        () =>
        ({ chain }) => {
          return chain()
            .setMark("textStyle", { fontSize: null })
            .removeEmptyTextStyle()
            .run();
        },
    };
  },
});

const TiptapEditor = ({ value, onChange }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),

      TextStyle,

      FontSize,

      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center", "right", "justify"],
      }),

      Underline,

      TiptapImage.configure({
        inline: true,
      }),

      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
      }),
    ],

    content: value || "",

    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && value !== undefined && editor.getHTML() !== value) {
      editor.commands.setContent(value || "");
    }
  }, [value, editor]);

  if (!editor) return null;

  const handleImageUpload = () => {
    const input = document.createElement("input");

    input.type = "file";
    input.accept = "image/*";

    input.onchange = async () => {
      const file = input.files?.[0];

      if (!file) return;

      const hideMsg = message.loading("Đang tải ảnh lên...", 0);

      try {
        const fd = new FormData();

        fd.append("file", file);
        fd.append("upload_preset", CDN_PRESET);

        const res = await axios.post(
          `https://api.cloudinary.com/v1_1/${CDN_CLOUD}/image/upload`,
          fd,
        );

        editor.chain().focus().setImage({ src: res.data.secure_url }).run();

        hideMsg();
        message.success("Tải ảnh thành công!");
      } catch (error) {
        hideMsg();
        console.error(error);
        message.error("Lỗi khi tải ảnh lên!");
      }
    };

    input.click();
  };

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href || "";
    const url = window.prompt("Nhập URL:", previousUrl);

    if (url === null) return;

    if (url.trim() === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    const finalUrl =
      url.startsWith("http://") || url.startsWith("https://")
        ? url
        : `https://${url}`;

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: finalUrl })
      .run();
  };

  return (
    <div className={styles.tiptapContainer}>
      <div className={styles.tiptapToolbar}>
        <Space wrap size={2}>
          <Tooltip title="Heading 1">
            <Button
              size="small"
              type={
                editor.isActive("heading", { level: 1 }) ? "primary" : "text"
              }
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 1 }).run()
              }
            >
              H1
            </Button>
          </Tooltip>

          <Tooltip title="Heading 2">
            <Button
              size="small"
              type={
                editor.isActive("heading", { level: 2 }) ? "primary" : "text"
              }
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 2 }).run()
              }
            >
              H2
            </Button>
          </Tooltip>

          <Tooltip title="Heading 3">
            <Button
              size="small"
              type={
                editor.isActive("heading", { level: 3 }) ? "primary" : "text"
              }
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 3 }).run()
              }
            >
              H3
            </Button>
          </Tooltip>

          <Tooltip title="Cỡ chữ">
            <Select
              size="small"
              placeholder={<FontSizeOutlined />}
              style={{ width: 96 }}
              value={editor.getAttributes("textStyle").fontSize || undefined}
              onChange={(value) => {
                if (!value) {
                  editor.chain().focus().unsetFontSize().run();
                } else {
                  editor.chain().focus().setFontSize(value).run();
                }
              }}
              options={[
                { value: "", label: "Mặc định" },
                { value: "12px", label: "12" },
                { value: "14px", label: "14" },
                { value: "16px", label: "16" },
                { value: "18px", label: "18" },
                { value: "20px", label: "20" },
                { value: "24px", label: "24" },
                { value: "28px", label: "28" },
                { value: "32px", label: "32" },
              ]}
            />
          </Tooltip>

          <Divider type="vertical" />

          <Tooltip title="Căn trái">
            <Button
              size="small"
              type={editor.isActive({ textAlign: "left" }) ? "primary" : "text"}
              onClick={() => editor.chain().focus().setTextAlign("left").run()}
              icon={<AlignLeftOutlined />}
            />
          </Tooltip>

          <Tooltip title="Căn giữa">
            <Button
              size="small"
              type={
                editor.isActive({ textAlign: "center" }) ? "primary" : "text"
              }
              onClick={() =>
                editor.chain().focus().setTextAlign("center").run()
              }
              icon={<AlignCenterOutlined />}
            />
          </Tooltip>

          <Tooltip title="Căn phải">
            <Button
              size="small"
              type={
                editor.isActive({ textAlign: "right" }) ? "primary" : "text"
              }
              onClick={() => editor.chain().focus().setTextAlign("right").run()}
              icon={<AlignRightOutlined />}
            />
          </Tooltip>

          <Tooltip title="Căn đều">
            <Button
              size="small"
              type={
                editor.isActive({ textAlign: "justify" }) ? "primary" : "text"
              }
              onClick={() =>
                editor.chain().focus().setTextAlign("justify").run()
              }
              icon={<MenuOutlined />}
            />
          </Tooltip>

          <Divider type="vertical" />

          <Tooltip title="In đậm">
            <Button
              size="small"
              type={editor.isActive("bold") ? "primary" : "text"}
              onClick={() => editor.chain().focus().toggleBold().run()}
              icon={<BoldOutlined />}
            />
          </Tooltip>

          <Tooltip title="In nghiêng">
            <Button
              size="small"
              type={editor.isActive("italic") ? "primary" : "text"}
              onClick={() => editor.chain().focus().toggleItalic().run()}
              icon={<ItalicOutlined />}
            />
          </Tooltip>

          <Tooltip title="Gạch chân">
            <Button
              size="small"
              type={editor.isActive("underline") ? "primary" : "text"}
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              icon={<UnderlineOutlined />}
            />
          </Tooltip>

          <Divider type="vertical" />

          <Tooltip title="Danh sách chấm">
            <Button
              size="small"
              type={editor.isActive("bulletList") ? "primary" : "text"}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              icon={<UnorderedListOutlined />}
            />
          </Tooltip>

          <Tooltip title="Danh sách số">
            <Button
              size="small"
              type={editor.isActive("orderedList") ? "primary" : "text"}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              icon={<OrderedListOutlined />}
            />
          </Tooltip>

          <Divider type="vertical" />

          <Tooltip title="Chèn link">
            <Button
              size="small"
              type={editor.isActive("link") ? "primary" : "text"}
              onClick={setLink}
              icon={<LinkOutlined />}
            />
          </Tooltip>

          <Tooltip title="Chèn code">
            <Button
              size="small"
              type={editor.isActive("codeBlock") ? "primary" : "text"}
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              icon={<CodeOutlined />}
            />
          </Tooltip>

          <Tooltip title="Chèn ảnh">
            <Button
              size="small"
              type="text"
              onClick={handleImageUpload}
              icon={<PictureOutlined />}
            />
          </Tooltip>
        </Space>
      </div>

      <style>{`
        .ProseMirror {
          min-height: 280px;
          outline: none;
        }

        .ProseMirror ul {
          list-style-type: disc !important;
          padding-left: 24px !important;
          margin-bottom: 1em;
        }

        .ProseMirror ol {
          list-style-type: decimal !important;
          padding-left: 24px !important;
          margin-bottom: 1em;
        }

        .ProseMirror li {
          display: list-item !important;
        }

        .ProseMirror a {
          color: #1677ff !important;
          text-decoration: underline !important;
          cursor: pointer;
        }

        .ProseMirror img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 8px 0;
        }

        .ProseMirror pre {
          background: #f5f5f5;
          padding: 12px;
          border-radius: 8px;
          overflow-x: auto;
        }

        .ProseMirror code {
          background: #f5f5f5;
          padding: 2px 5px;
          border-radius: 4px;
        }
      `}</style>

      <EditorContent editor={editor} className={styles.tiptapEditorArea} />
    </div>
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
  const [form] = Form.useForm();

  const [statusFilter, setStatusFilter] = useState(null);

  useEffect(() => {
    fetchNews();
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
    });
    setModalOpen(true);
  };

  const openEdit = (record) => {
    setEditRecord(record);
    setImgPreview(record.HinhAnh || "");

    form.setFieldsValue({
      TieuDe: record.TieuDe,
      NoiDung: record.NoiDung || "",
      HinhAnh: record.HinhAnh,
      TrangThai: record.TrangThai === 1,
    });

    setModalOpen(true);
  };

  const openView = (record) => {
    setViewRecord(record);
    setViewModalOpen(true);
  };

  const handleUploadImage = async (info) => {
    const file = info.file;

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
        { status: newStatus },
        authH(),
      );

      message.success(`Đã ${checked ? "hiển thị" : "ẩn"} bài viết!`);

      setNews((prevNews) =>
        prevNews.map((item) =>
          item.MaTinTuc === record.MaTinTuc
            ? {
                ...item,
                TrangThai: newStatus,
              }
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
      const matchesSearch =
        !search || item.TieuDe?.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === null || item.TrangThai === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const dateA = dayjs(a.NgayTao).valueOf();
      const dateB = dayjs(b.NgayTao).valueOf();

      if (sortOrder === "newest") {
        return dateB - dateA;
      }

      return dateA - dateB;
    });

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
            style={{
              objectFit: "cover",
              borderRadius: 6,
            }}
          />
        ) : (
          <div className={styles.noImg}>
            <CameraOutlined />
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
          checked={record.TrangThai === 1}
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
              icon={<EyeOutlined />}
              onClick={() => openView(record)}
            />
          </Tooltip>

          <Tooltip title="Sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
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
          <FileTextOutlined className={styles.headerIcon} />
          <div>
            <h1 className={styles.pageTitle}>Quản lý Tin tức</h1>
            <p className={styles.pageSub}>Tạo và chỉnh sửa bài viết tin tức</p>
          </div>
        </div>

        <Button
          type="primary"
          icon={<PlusOutlined />}
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
            value: news.filter((item) => item.TrangThai === 1).length,
            color: "#52c41a",
            bg: "#f6ffed",
            status: 1,
          },
          {
            label: "Đang ẩn",
            value: news.filter((item) => item.TrangThai === 0).length,
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
              onClick={() => {
                if (item.status === null) {
                  setStatusFilter(null);
                } else {
                  setStatusFilter((prev) =>
                    prev === item.status ? null : item.status,
                  );
                }
              }}
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

      <div
        className={styles.toolbar}
        style={{
          display: "flex",
          gap: "8px",
        }}
      >
        <Input
          prefix={<SearchOutlined style={{ color: "#bbb" }} />}
          placeholder="Tìm kiếm tiêu đề..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
          className={styles.searchInput}
          style={{ flex: 1 }}
        />

        <Select
          value={sortOrder}
          onChange={(value) => setSortOrder(value)}
          style={{ width: 140 }}
          options={[
            {
              value: "newest",
              label: "Mới nhất",
            },
            {
              value: "oldest",
              label: "Cũ nhất",
            },
          ]}
        />

        <Button
          icon={<ReloadOutlined />}
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
          scroll={{ x: 700 }}
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
            {editRecord ? <EditOutlined /> : <PlusOutlined />}
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
            rules={[
              {
                required: true,
                message: "Nhập tiêu đề!",
              },
            ]}
          >
            <Input placeholder="Tiêu đề tin tức..." className={styles.input} />
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
                beforeUpload={() => false}
                onChange={handleUploadImage}
                accept=".jpg,.jpeg,.png,.webp"
              >
                <Button
                  icon={<UploadOutlined />}
                  loading={uploading}
                  className={styles.btnUpload}
                >
                  {uploading ? "Đang tải..." : "Chọn ảnh"}
                </Button>
              </Upload>

              <Form.Item name="HinhAnh" noStyle>
                <Input
                  placeholder="Hoặc dán URL ảnh..."
                  className={styles.input}
                  style={{ flex: 1 }}
                  onChange={(e) => setImgPreview(e.target.value)}
                />
              </Form.Item>
            </div>
          </Form.Item>

          <Form.Item
            name="NoiDung"
            label="Nội dung"
            rules={[
              {
                required: true,
                message: "Nhập nội dung bài viết!",
              },
            ]}
          >
            <TiptapEditor />
          </Form.Item>

          <div className={styles.formRow2}>
            <Form.Item
              name="TrangThai"
              label="Hiển thị công khai"
              valuePropName="checked"
            >
              <Switch checkedChildren="Hiện" unCheckedChildren="Ẩn" />
            </Form.Item>
          </div>

          <Divider style={{ margin: "8px 0 16px" }} />

          <div
            style={{
              display: "flex",
              gap: 10,
              justifyContent: "flex-end",
            }}
          >
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
        destroyOnClose
      >
        {viewRecord && (
          <div style={{ padding: "20px 0" }}>
            <Typography.Title level={2}>{viewRecord.TieuDe}</Typography.Title>

            <div style={{ color: "gray", marginBottom: "20px" }}>
              <span>
                {dayjs(viewRecord.NgayTao).format("DD/MM/YYYY HH:mm")}
              </span>

              {viewRecord.NhanVien?.TenNhanVien && (
                <span> - Đăng bởi: {viewRecord.NhanVien.TenNhanVien}</span>
              )}
            </div>

            {viewRecord.HinhAnh && (
              <div
                style={{
                  textAlign: "center",
                  marginBottom: "20px",
                }}
              >
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

                .view-content-html pre {
                  background: #f5f5f5;
                  padding: 12px;
                  border-radius: 8px;
                  overflow-x: auto;
                }

                .view-content-html code {
                  background: #f5f5f5;
                  padding: 2px 5px;
                  border-radius: 4px;
                }
              `}</style>

              <div dangerouslySetInnerHTML={{ __html: viewRecord.NoiDung }} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
