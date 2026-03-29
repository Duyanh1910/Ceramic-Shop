import { useState, useEffect } from 'react';
import {
  Table, Button, Input, Select, Tag, Space, Modal,
  Form, InputNumber, message, Popconfirm, Image, Tooltip,
} from 'antd';
import {
  PlusOutlined, SearchOutlined, EditOutlined,
  DeleteOutlined, EyeOutlined, ReloadOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import styles from './AdminTable.module.css';

const API_BASE = 'https://ceramic-shop-u8ak.onrender.com/api/v1';
const fmt = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

export default function AdminProducts() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [addModal, setAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [form] = Form.useForm();
  
  const axiosConfig = { withCredentials: true };

  useEffect(() => { fetchData(); }, [page, search]);
  useEffect(() => { fetchCategories(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_BASE}/products?page=${page}&limit=10&search=${search}`,
        axiosConfig
      );
      setData(res.data?.result?.data || []);
      setTotal(res.data?.result?.total || 0);
    } catch {
      message.error('Không thể tải danh sách sản phẩm!');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_BASE}/categories`, axiosConfig);
      setCategories(res.data?.result || []);
    } catch {}
  };

  const handleSearch = () => {
    setPage(1);
    setSearch(searchInput);
  };

  const handleReload = () => {
    setSearchInput('');
    if (search === '' && page === 1) {
      fetchData(); 
    } else {
      setSearch('');
      setPage(1);
    }
  };

  const handleAddProduct = async (values) => {
    setSubmitting(true);
    try {
      await axios.post(
        `${API_BASE}/admin/products`,
        {
          categoryID: values.categoryID,
          productName: values.productName,
          thumbnail: values.thumbnail,
          brand: values.brand,
          description: values.description,
          status: values.status ?? 1,
          BienThe: [{
            TenBienThe: values.variantName,
            Gia: values.price,
            SoLuong: values.stock,
            TrangThai: 1,
          }],
        },
        axiosConfig
      );
      message.success('Thêm sản phẩm thành công!');
      setAddModal(false);
      form.resetFields();
      fetchData();
    } catch (err) {
      message.error(err.response?.data?.message || 'Thêm sản phẩm thất bại!');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      title: 'Ảnh',
      dataIndex: 'Thumbnail',
      width: 70,
      render: (url) => (
        <Image
          src={url} width={52} height={52}
          style={{ objectFit: 'cover', borderRadius: 6 }}
          fallback="https://via.placeholder.com/52" preview={false}
        />
      ),
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'TenSanPham',
      render: (v, row) => (
        <div>
          <div className={styles.productName}>{v}</div>
          {row.ThuongHieu && <div className={styles.brand}>{row.ThuongHieu}</div>}
        </div>
      ),
    },
    {
      title: 'Danh mục',
      dataIndex: ['DanhMuc', 'TenDanhMuc'],
      render: (v) => v ? <Tag color="blue">{v}</Tag> : '—',
    },
    {
      title: 'Giá thấp nhất',
      dataIndex: 'GiaThapNhat',
      render: (v) => <span className={styles.price}>{fmt(v)}</span>,
    },
    {
      title: 'Tồn kho',
      dataIndex: 'TongSoLuong',
      render: (v) => (
        <Tag color={v > 10 ? 'green' : v > 0 ? 'orange' : 'red'}>{v ?? 0}</Tag>
      ),
    },
    {
      title: 'Lượt xem',
      dataIndex: 'LuotXem',
      render: (v) => <span style={{ color: '#888' }}>{v ?? 0}</span>,
    },
    {
      title: 'Thao tác',
      width: 110,
      render: (_, row) => (
        <Space size={4}>
          <Tooltip title="Xem chi tiết">
            <Button type="text" icon={<EyeOutlined />} size="small"
              onClick={() => window.open(`/product/${row.MaSanPham}`, '_blank')} />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button type="text" icon={<EditOutlined />} size="small" className={styles.editBtn} />
          </Tooltip>
          <Tooltip title="Xoá">
            <Popconfirm title="Xác nhận xoá sản phẩm này?" okText="Xoá" cancelText="Huỷ">
              <Button type="text" danger icon={<DeleteOutlined />} size="small" />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  const leafCategories = categories.filter((c) =>
    !categories.some((other) => other.ParentID === c.MaDanhMuc)
  );

  return (
    <div className={styles.wrapper}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Quản lý sản phẩm</h1>
          <p className={styles.pageSub}>Tổng cộng {total} sản phẩm</p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} className={styles.btnAdd} onClick={() => setAddModal(true)}>
          Thêm sản phẩm
        </Button>
      </div>

      <div className={styles.toolbar}>
        <Input
          prefix={<SearchOutlined />} placeholder="Tìm kiếm tên sản phẩm, thương hiệu..."
          value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
          onPressEnter={handleSearch} className={styles.searchInput}
          allowClear onClear={handleReload}
        />
        <Button icon={<SearchOutlined />} onClick={handleSearch} className={styles.btnSearch}>
          Tìm kiếm
        </Button>
        <Button icon={<ReloadOutlined />} onClick={handleReload} />
      </div>

      <div className={styles.tableCard}>
        <Table
          dataSource={data} columns={columns} rowKey="MaSanPham"
          loading={loading} className={styles.table}
          pagination={{ current: page, pageSize: 10, total, onChange: setPage, showTotal: (t) => `Tổng ${t} sản phẩm`, showSizeChanger: false }}
          size="middle" locale={{ emptyText: 'Không có sản phẩm nào' }}
        />
      </div>

      <Modal
        open={addModal} title={<span className={styles.modalTitle}>Thêm sản phẩm mới</span>}
        onCancel={() => { setAddModal(false); form.resetFields(); }} footer={null} width={600} centered
      >
        <Form form={form} layout="vertical" onFinish={handleAddProduct} className={styles.modalForm}>
          <Form.Item name="categoryID" label="Danh mục" rules={[{ required: true, message: 'Chọn danh mục!' }]}>
            <Select placeholder="Chọn danh mục sản phẩm">
              {leafCategories.map((c) => (
                <Select.Option key={c.MaDanhMuc} value={c.MaDanhMuc}>{c.TenDanhMuc}</Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="productName" label="Tên sản phẩm" rules={[{ required: true, message: 'Nhập tên sản phẩm!' }]}>
            <Input placeholder="Tên sản phẩm" />
          </Form.Item>

          <Form.Item name="thumbnail" label="URL ảnh đại diện" rules={[{ required: true, message: 'Nhập URL ảnh!' }]}>
            <Input placeholder="https://..." />
          </Form.Item>

          <Form.Item name="brand" label="Thương hiệu"><Input placeholder="Tên thương hiệu" /></Form.Item>
          <Form.Item name="description" label="Mô tả"><Input.TextArea rows={3} placeholder="Mô tả sản phẩm..." /></Form.Item>

          <div className={styles.variantSection}>
            <div className={styles.variantTitle}>Biến thể đầu tiên</div>
            <Form.Item name="variantName" label="Tên biến thể" rules={[{ required: true, message: 'Nhập tên biến thể!' }]}>
              <Input placeholder="VD: Loại thường / Size M..." />
            </Form.Item>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Form.Item name="price" label="Giá (VNĐ)" rules={[{ required: true, message: 'Nhập giá!' }]}>
                <InputNumber min={0} style={{ width: '100%' }} formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} placeholder="500000" />
              </Form.Item>
              <Form.Item name="stock" label="Số lượng tồn kho" rules={[{ required: true, message: 'Nhập số lượng!' }]}>
                <InputNumber min={0} style={{ width: '100%' }} placeholder="100" />
              </Form.Item>
            </div>
          </div>

          <div className={styles.modalFooter}>
            <Button onClick={() => { setAddModal(false); form.resetFields(); }}>Huỷ</Button>
            <Button type="primary" htmlType="submit" loading={submitting} className={styles.btnAdd}>Thêm sản phẩm</Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}