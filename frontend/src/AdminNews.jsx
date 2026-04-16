import { useState, useEffect } from 'react';
import {
  Table, Button, Modal, Form, Input, Switch, Tag,
  Tooltip, Popconfirm, message, Space, Row, Col,
  Upload, Divider, Empty, Image,
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined,
  FileTextOutlined, SearchOutlined, ReloadOutlined,
  UploadOutlined, CameraOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';
import styles from './AdminNews.module.css';

const API_BASE    = 'https://ceramic-shop-u8ak.onrender.com/api/v1';
const CDN_CLOUD   = 'dcmwz0uis';
const CDN_PRESET  = 'the_creamy_shop';

const authH = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('customer_token') || localStorage.getItem('admin_token')}` },
  withCredentials: true,
});

export default function AdminNews() {
  const [news, setNews]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [search, setSearch]       = useState('');
  const [uploading, setUploading] = useState(false);
  const [imgPreview, setImgPreview] = useState('');
  const [form] = Form.useForm();

  useEffect(() => { fetchNews(); }, []);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/news`, authH());
      setNews(res.data?.result || []);
    } catch {
      message.error('Không thể tải danh sách tin tức!');
    } finally { setLoading(false); }
  };

  const openCreate = () => {
    setEditRecord(null);
    setImgPreview('');
    form.resetFields();
    form.setFieldsValue({ TrangThai: true });
    setModalOpen(true);
  };

  const openEdit = (record) => {
    setEditRecord(record);
    setImgPreview(record.HinhAnh || '');
    form.setFieldsValue({
      TieuDe:         record.TieuDe,
      NoiDung:        record.NoiDung,
      HinhAnh:        record.HinhAnh,
      TrangThai:      record.TrangThai === 1,
    });
    setModalOpen(true);
  };

  const handleUploadImage = async (info) => {
    const file = info.file;
    if (file.size > 5 * 1024 * 1024) { message.error('Ảnh tối đa 5MB!'); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('upload_preset', CDN_PRESET);
      const res = await axios.post(`https://api.cloudinary.com/v1_1/${CDN_CLOUD}/image/upload`, fd);
      const url = res.data.secure_url;
      form.setFieldValue('HinhAnh', url);
      setImgPreview(url);
      message.success('Tải ảnh thành công!');
    } catch { message.error('Tải ảnh thất bại!'); }
    finally { setUploading(false); }
  };

  const handleSave = async (values) => {
    setSaving(true);
    try {
      const payload = {
        ...values,
        TrangThai: values.TrangThai ? 1 : 0,
      };

      if (editRecord) {
        await axios.put(`${API_BASE}/news/admin/${editRecord.MaTinTuc}`, payload, authH());
        message.success('Cập nhật tin tức thành công!');
      } else {
        await axios.post(`${API_BASE}/news/admin`, payload, authH());
        message.success('Tạo tin tức thành công!');
      }
      setModalOpen(false);
      fetchNews();
    } catch (err) {
      message.error(err.response?.data?.message || 'Thao tác thất bại!');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE}/news/admin/${id}`, authH());
      message.success('Đã xoá tin tức!');
      fetchNews();
    } catch (err) {
      message.error(err.response?.data?.message || 'Không thể xoá!');
    }
  };

  const filtered = news.filter(n =>
    !search || n.TieuDe?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      title: 'Ảnh',
      key: 'img',
      width: 80,
      render: (_, r) => r.HinhAnh
        ? <Image src={r.HinhAnh} width={56} height={42} style={{ objectFit: 'cover', borderRadius: 6 }} />
        : <div className={styles.noImg}><CameraOutlined /></div>,
    },
    {
      title: 'Tiêu đề',
      key: 'title',
      render: (_, r) => (
        <div className={styles.cellTitle}>
          <div className={styles.titleText}>{r.TieuDe}</div>
          <div className={styles.titleMeta}>
            {r.NhanVien?.TenNhanVien && <span>{r.NhanVien.TenNhanVien} · </span>}
            <span>{dayjs(r.NgayTao).format('DD/MM/YYYY')}</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 110,
      render: (_, r) => (
        <Tag color={r.TrangThai === 1 ? 'green' : 'default'}>
          {r.TrangThai === 1 ? 'Hiển thị' : 'Ẩn'}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 90,
      fixed: 'right',
      render: (_, r) => (
        <Space size={4}>
          <Tooltip title="Sửa">
            <Button type="text" icon={<EditOutlined />} className={styles.btnEdit} onClick={() => openEdit(r)} />
          </Tooltip>
          <Popconfirm
            title="Xoá tin tức này?"
            onConfirm={() => handleDelete(r.MaTinTuc)}
            okText="Xoá" cancelText="Huỷ" okButtonProps={{ danger: true }}
          >
            <Tooltip title="Xoá">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
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
            <p className={styles.pageSub}>
              Tạo và chỉnh sửa bài viết tin tức
            </p>
          </div>
        </div>
        <Button type="primary" icon={<PlusOutlined />} className={styles.btnCreate} onClick={openCreate}>
          Viết tin mới
        </Button>
      </div>

      <Row gutter={[12, 12]} className={styles.statsRow}>
        {[
          { label: 'Tổng tin',  value: news.length,                                         color: '#1b437c', bg: '#e8f0fe' },
          { label: 'Đang hiện', value: news.filter(n => n.TrangThai === 1).length,          color: '#52c41a', bg: '#f6ffed' },
          { label: 'Đang ẩn',   value: news.filter(n => n.TrangThai === 0).length,          color: '#888',    bg: '#f5f5f5' },
        ].map((s, i) => (
          <Col xs={12} sm={6} key={i}>
            <div className={styles.statCard} style={{ '--c': s.color, '--bg': s.bg }}>
              <div className={styles.statNum}>{s.value}</div>
              <div className={styles.statLabel}>{s.label}</div>
            </div>
          </Col>
        ))}
      </Row>

      <div className={styles.toolbar}>
        <Input
          prefix={<SearchOutlined style={{ color: '#bbb' }} />}
          placeholder="Tìm kiếm tiêu đề..."
          value={search} onChange={e => setSearch(e.target.value)}
          allowClear className={styles.searchInput}
        />
        <Button icon={<ReloadOutlined />} onClick={fetchNews} className={styles.btnRefresh} />
      </div>

      <div className={styles.tableWrap}>
        <Table
          columns={columns}
          dataSource={filtered}
          rowKey="MaTinTuc"
          loading={loading}
          scroll={{ x: 700 }}
          pagination={{ pageSize: 10, showTotal: t => `${t} tin tức` }}
          className={styles.table}
          locale={{ emptyText: <Empty description="Chưa có tin tức nào" image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
        />
      </div>

      <Modal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        title={
          <div className={styles.modalTitle}>
            {editRecord ? <EditOutlined /> : <PlusOutlined />}
            {editRecord ? ' Chỉnh sửa tin tức' : ' Viết tin mới'}
          </div>
        }
        footer={null}
        width={720}
        destroyOnHidden
        className={styles.modal}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item name="TieuDe" label="Tiêu đề"
            rules={[{ required: true, message: 'Nhập tiêu đề!' }]}>
            <Input placeholder="Tiêu đề tin tức..." className={styles.input} />
          </Form.Item>

          <Form.Item label="Ảnh bìa">
            <div className={styles.uploadArea}>
              {imgPreview && (
                <img src={imgPreview} alt="preview" className={styles.imgPreview} />
              )}
              <Upload showUploadList={false} beforeUpload={() => false}
                onChange={handleUploadImage} accept=".jpg,.jpeg,.png,.webp">
                <Button icon={<UploadOutlined />} loading={uploading} className={styles.btnUpload}>
                  {uploading ? 'Đang tải...' : 'Chọn ảnh'}
                </Button>
              </Upload>
              <Form.Item name="HinhAnh" noStyle>
                <Input placeholder="Hoặc dán URL ảnh..." className={styles.input}
                  style={{ flex: 1 }}
                  onChange={e => setImgPreview(e.target.value)} />
              </Form.Item>
            </div>
          </Form.Item>

          <Form.Item name="NoiDung" label="Nội dung">
            <Input.TextArea rows={10} placeholder="Nội dung bài viết (hỗ trợ HTML)..."
              className={styles.textarea} />
          </Form.Item>

          <div className={styles.formRow2}>
            <Form.Item name="TrangThai" label="Hiển thị công khai" valuePropName="checked">
              <Switch checkedChildren="Hiện" unCheckedChildren="Ẩn" />
            </Form.Item>
          </div>

          <Divider style={{ margin: '8px 0 16px' }} />
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Button onClick={() => setModalOpen(false)}>Huỷ</Button>
            <Button type="primary" htmlType="submit" loading={saving} className={styles.btnSave}>
              {editRecord ? 'Lưu thay đổi' : 'Đăng tin'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}