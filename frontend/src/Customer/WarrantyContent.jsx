import { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Descriptions,
  Empty,
  Form,
  Image,
  Input,
  message,
  Modal,
  Segmented,
  Space,
  Spin,
  Tag,
  Timeline,
  Tooltip,
  Upload,
} from 'antd';
import {
  DeleteOutlined,
  EyeOutlined,
  FileProtectOutlined,
  ReloadOutlined,
  SearchOutlined,
  SendOutlined,
  SafetyCertificateOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';
import styles from './WarrantyContent.module.css';

const { TextArea } = Input;

const API_BASE = 'https://ceramic-shop-u8ak.onrender.com/api/v1';
const CLOUDINARY_CLOUD_NAME = 'dcmwz0uis';
const CLOUDINARY_UPLOAD_PRESET = 'the_creamy_shop';

const WARRANTY_STATUS = {
  EXPIRED: 0,
  ACTIVE: 1,
  REQUESTED: 2,
  PROCESSING: 3,
  COMPLETED: 4,
  REJECTED: 5,
};

const WARRANTY_TABS = {
  ACTIVE: 'active',
  REQUESTED: 'requested',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  REJECTED: 'rejected',
  EXPIRED: 'expired',
};

const getToken = () =>
  localStorage.getItem('customer_token') || localStorage.getItem('admin_token');

const authHeader = () => {
  const token = getToken();

  return {
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {},
    withCredentials: true,
  };
};

const fmt = (value) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(Number(value || 0));

const isExpiredByDate = (warranty) => {
  if (!warranty?.NgayKetThuc) return false;

  return (
    Number(warranty.TrangThai) === WARRANTY_STATUS.ACTIVE &&
    dayjs(warranty.NgayKetThuc).isBefore(dayjs(), 'minute')
  );
};

const getEffectiveStatus = (warranty) => {
  if (isExpiredByDate(warranty)) {
    return WARRANTY_STATUS.EXPIRED;
  }

  return Number(warranty?.TrangThai);
};

const getStatusLabel = (status) => {
  const statusNumber = Number(status);

  if (statusNumber === WARRANTY_STATUS.EXPIRED) return 'Hết hạn';
  if (statusNumber === WARRANTY_STATUS.ACTIVE) return 'Còn hiệu lực';
  if (statusNumber === WARRANTY_STATUS.REQUESTED) return 'Đang yêu cầu';
  if (statusNumber === WARRANTY_STATUS.PROCESSING) return 'Đang xử lý';
  if (statusNumber === WARRANTY_STATUS.COMPLETED) return 'Đã hoàn tất';
  if (statusNumber === WARRANTY_STATUS.REJECTED) return 'Từ chối';

  return 'Không rõ';
};

const renderStatusTag = (status) => {
  const statusNumber = Number(status);

  if (statusNumber === WARRANTY_STATUS.EXPIRED) {
    return <Tag color="red">Hết hạn</Tag>;
  }

  if (statusNumber === WARRANTY_STATUS.ACTIVE) {
    return <Tag color="green">Còn hiệu lực</Tag>;
  }

  if (statusNumber === WARRANTY_STATUS.REQUESTED) {
    return <Tag color="gold">Đang yêu cầu</Tag>;
  }

  if (statusNumber === WARRANTY_STATUS.PROCESSING) {
    return <Tag color="blue">Đang xử lý</Tag>;
  }

  if (statusNumber === WARRANTY_STATUS.COMPLETED) {
    return <Tag color="green">Đã hoàn tất</Tag>;
  }

  if (statusNumber === WARRANTY_STATUS.REJECTED) {
    return <Tag color="red">Từ chối</Tag>;
  }

  return <Tag>{status}</Tag>;
};

const renderHistoryStatus = (status) => {
  const statusNumber = Number(status);

  if (statusNumber === 0) return <Tag color="gold">Tiếp nhận</Tag>;
  if (statusNumber === 1) return <Tag color="blue">Đã duyệt</Tag>;
  if (statusNumber === 2) return <Tag color="red">Từ chối</Tag>;
  if (statusNumber === 3) return <Tag color="green">Hoàn tất</Tag>;

  return <Tag>Cập nhật</Tag>;
};

const renderHistoryAction = (action) => {
  if (action === 'TAO_PHIEU') return 'Tạo phiếu';
  if (action === 'HET_HAN') return 'Hết hạn';
  if (action === 'TIEP_NHAN') return 'Tiếp nhận';
  if (action === 'KIEM_TRA') return 'Kiểm tra';
  if (action === 'DUYET') return 'Duyệt';
  if (action === 'TU_CHOI') return 'Từ chối';
  if (action === 'HOAN_TAT') return 'Hoàn tất';
  if (action === 'DOI_MOI') return 'Đổi mới sản phẩm';

  return action || 'Cập nhật';
};

const getOrderDetail = (warranty) => warranty?.ChiTietDonHang;
const getVariant = (warranty) => getOrderDetail(warranty)?.BienTheSanPham;
const getProduct = (warranty) => getVariant(warranty)?.SanPham;
const getOrder = (warranty) => getOrderDetail(warranty)?.DonHang;

const getSearchText = (warranty) => {
  const product = getProduct(warranty);
  const variant = getVariant(warranty);
  const order = getOrder(warranty);

  return [
    warranty?.MaBaoHanh,
    order?.MaHienThi,
    product?.TenSanPham,
    variant?.TenBienThe,
    warranty?.GhiChu,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
};

export default function WarrantyContent({ compact = false }) {
  const [tab, setTab] = useState(WARRANTY_TABS.ACTIVE);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [warranties, setWarranties] = useState([]);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedWarranty, setSelectedWarranty] = useState(null);

  const [requestOpen, setRequestOpen] = useState(false);
  const [requestSubmitting, setRequestSubmitting] = useState(false);
  const [requestWarranty, setRequestWarranty] = useState(null);
  const [requestForm] = Form.useForm();

  const [evidenceUploading, setEvidenceUploading] = useState(false);
  const [evidenceUrl, setEvidenceUrl] = useState('');

  const fetchWarranties = async () => {
    setLoading(true);

    try {
      const res = await axios.get(`${API_BASE}/warranties`, authHeader());
      setWarranties(res.data?.result || []);
    } catch (err) {
      message.error(
        err.response?.data?.message || 'Không thể tải danh sách bảo hành!',
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchWarrantyDetail = async (maBaoHanh) => {
    setDetailLoading(true);
    setDetailOpen(true);

    try {
      const res = await axios.get(
        `${API_BASE}/warranties/${maBaoHanh}`,
        authHeader(),
      );

      setSelectedWarranty(res.data?.result || null);
    } catch (err) {
      message.error(
        err.response?.data?.message || 'Không thể tải chi tiết bảo hành!',
      );
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    fetchWarranties();
  }, []);

  useEffect(() => {
    if (!detailOpen && !requestOpen) {
      return undefined;
    }

    const html = document.documentElement;
    const body = document.body;

    const previousHtmlOverflow = html.style.overflow;
    const previousBodyOverflow = body.style.overflow;
    const previousBodyPaddingRight = body.style.paddingRight;

    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    body.style.paddingRight = '0px';

    return () => {
      html.style.overflow = previousHtmlOverflow;
      body.style.overflow = previousBodyOverflow;
      body.style.paddingRight = previousBodyPaddingRight;
    };
  }, [detailOpen, requestOpen]);

  const counters = useMemo(() => {
    const result = {
      [WARRANTY_TABS.ACTIVE]: 0,
      [WARRANTY_TABS.REQUESTED]: 0,
      [WARRANTY_TABS.PROCESSING]: 0,
      [WARRANTY_TABS.COMPLETED]: 0,
      [WARRANTY_TABS.REJECTED]: 0,
      [WARRANTY_TABS.EXPIRED]: 0,
    };

    warranties.forEach((warranty) => {
      const status = getEffectiveStatus(warranty);

      if (status === WARRANTY_STATUS.ACTIVE) result[WARRANTY_TABS.ACTIVE] += 1;
      if (status === WARRANTY_STATUS.REQUESTED) result[WARRANTY_TABS.REQUESTED] += 1;
      if (status === WARRANTY_STATUS.PROCESSING) result[WARRANTY_TABS.PROCESSING] += 1;
      if (status === WARRANTY_STATUS.COMPLETED) result[WARRANTY_TABS.COMPLETED] += 1;
      if (status === WARRANTY_STATUS.REJECTED) result[WARRANTY_TABS.REJECTED] += 1;
      if (status === WARRANTY_STATUS.EXPIRED) result[WARRANTY_TABS.EXPIRED] += 1;
    });

    return result;
  }, [warranties]);

  const visibleWarranties = useMemo(() => {
    const q = keyword.trim().toLowerCase();

    return warranties.filter((warranty) => {
      const status = getEffectiveStatus(warranty);

      const matchedTab =
        (tab === WARRANTY_TABS.ACTIVE && status === WARRANTY_STATUS.ACTIVE) ||
        (tab === WARRANTY_TABS.REQUESTED && status === WARRANTY_STATUS.REQUESTED) ||
        (tab === WARRANTY_TABS.PROCESSING && status === WARRANTY_STATUS.PROCESSING) ||
        (tab === WARRANTY_TABS.COMPLETED && status === WARRANTY_STATUS.COMPLETED) ||
        (tab === WARRANTY_TABS.REJECTED && status === WARRANTY_STATUS.REJECTED) ||
        (tab === WARRANTY_TABS.EXPIRED && status === WARRANTY_STATUS.EXPIRED);

      if (!matchedTab) return false;
      if (!q) return true;

      return getSearchText(warranty).includes(q);
    });
  }, [warranties, tab, keyword]);

  const openRequestModal = (warranty) => {
    setRequestWarranty(warranty);
    setEvidenceUrl('');
    requestForm.resetFields();
    setRequestOpen(true);
  };

  const closeRequestModal = () => {
    setRequestOpen(false);
    setRequestWarranty(null);
    setEvidenceUrl('');
    requestForm.resetFields();
  };

  const closeDetailModal = () => {
    setDetailOpen(false);
    setSelectedWarranty(null);
  };

  const handleEvidenceUpload = async (file) => {
    const isImage = file.type?.startsWith('image/');

    if (!isImage) {
      message.error('Vui lòng chọn file ảnh!');
      return Upload.LIST_IGNORE;
    }

    const isValidSize = file.size / 1024 / 1024 <= 5;

    if (!isValidSize) {
      message.error('Ảnh minh chứng không được vượt quá 5MB!');
      return Upload.LIST_IGNORE;
    }

    setEvidenceUploading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    try {
      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        formData,
      );

      const secureUrl = res.data.secure_url;

      setEvidenceUrl(secureUrl);
      requestForm.setFieldsValue({
        AnhMinhChung: secureUrl,
      });

      message.success('Tải ảnh minh chứng thành công!');
    } catch (err) {
      console.error(err);
      message.error('Tải ảnh minh chứng thất bại!');
    } finally {
      setEvidenceUploading(false);
    }

    return Upload.LIST_IGNORE;
  };

  const clearEvidenceImage = () => {
    setEvidenceUrl('');
    requestForm.setFieldsValue({
      AnhMinhChung: null,
    });
  };

  const submitRequest = async (values) => {
    if (!requestWarranty) return;

    setRequestSubmitting(true);

    try {
      const res = await axios.post(
        `${API_BASE}/warranties/${requestWarranty.MaBaoHanh}/request`,
        {
          NoiDungXuLy: values.NoiDungXuLy,
          AnhMinhChung: values.AnhMinhChung || null,
        },
        authHeader(),
      );

      message.success(res.data?.message || 'Gửi yêu cầu bảo hành thành công!');
      closeRequestModal();
      await fetchWarranties();

      if (
        detailOpen &&
        selectedWarranty?.MaBaoHanh === requestWarranty.MaBaoHanh
      ) {
        await fetchWarrantyDetail(requestWarranty.MaBaoHanh);
      }
    } catch (err) {
      message.error(
        err.response?.data?.message || 'Không thể gửi yêu cầu bảo hành!',
      );
    } finally {
      setRequestSubmitting(false);
    }
  };

  const canRequestWarranty = (warranty) => {
    return getEffectiveStatus(warranty) === WARRANTY_STATUS.ACTIVE;
  };

  const detailOrder = getOrder(selectedWarranty);
  const detailOrderDetail = getOrderDetail(selectedWarranty);
  const detailVariant = getVariant(selectedWarranty);
  const detailProduct = getProduct(selectedWarranty);
  const histories = selectedWarranty?.LichSuBaoHanhs || [];

  return (
    <div className={`${styles.warrantyBox} ${compact ? styles.compact : ''}`}>
      <div className={styles.warrantyHeader}>
        <div>
          <h2 className={styles.title}>
            <FileProtectOutlined /> Bảo hành của tôi
          </h2>
          <p className={styles.subTitle}>
            Theo dõi phiếu bảo hành và gửi yêu cầu xử lý khi sản phẩm phát sinh lỗi.
          </p>
        </div>

        <Tooltip title="Tải lại">
          <Button icon={<ReloadOutlined />} onClick={fetchWarranties} />
        </Tooltip>
      </div>

      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <span>Còn hiệu lực</span>
          <strong>{counters[WARRANTY_TABS.ACTIVE]}</strong>
        </div>

        <div className={styles.statCard}>
          <span>Đang xử lý</span>
          <strong>
            {counters[WARRANTY_TABS.REQUESTED] +
              counters[WARRANTY_TABS.PROCESSING]}
          </strong>
        </div>

        <div className={styles.statCard}>
          <span>Đã kết thúc</span>
          <strong>
            {counters[WARRANTY_TABS.COMPLETED] +
              counters[WARRANTY_TABS.REJECTED] +
              counters[WARRANTY_TABS.EXPIRED]}
          </strong>
        </div>
      </div>

      <div className={styles.toolbar}>
        <Segmented
          value={tab}
          onChange={setTab}
          options={[
            {
              label: `Còn hiệu lực (${counters[WARRANTY_TABS.ACTIVE]})`,
              value: WARRANTY_TABS.ACTIVE,
            },
            {
              label: `Đang yêu cầu (${counters[WARRANTY_TABS.REQUESTED]})`,
              value: WARRANTY_TABS.REQUESTED,
            },
            {
              label: `Đang xử lý (${counters[WARRANTY_TABS.PROCESSING]})`,
              value: WARRANTY_TABS.PROCESSING,
            },
            {
              label: `Hoàn tất (${counters[WARRANTY_TABS.COMPLETED]})`,
              value: WARRANTY_TABS.COMPLETED,
            },
            {
              label: `Từ chối (${counters[WARRANTY_TABS.REJECTED]})`,
              value: WARRANTY_TABS.REJECTED,
            },
            {
              label: `Hết hạn (${counters[WARRANTY_TABS.EXPIRED]})`,
              value: WARRANTY_TABS.EXPIRED,
            },
          ]}
        />

        <Input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          prefix={<SearchOutlined />}
          allowClear
          placeholder="Tìm mã đơn hàng, sản phẩm..."
          className={styles.searchInput}
        />
      </div>

      {loading ? (
        <div className={styles.loadingWrap}>
          <Spin />
          <span>Đang tải phiếu bảo hành...</span>
        </div>
      ) : visibleWarranties.length === 0 ? (
        <div className={styles.emptyWrap}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Không có phiếu bảo hành phù hợp"
          />
        </div>
      ) : (
        <div className={styles.warrantyList}>
          {visibleWarranties.map((warranty) => {
            const orderDetail = getOrderDetail(warranty);
            const variant = getVariant(warranty);
            const product = getProduct(warranty);
            const order = getOrder(warranty);
            const effectiveStatus = getEffectiveStatus(warranty);

            return (
              <div key={warranty.MaBaoHanh} className={styles.warrantyCard}>
                <div className={styles.productThumb}>
                  <Image
                    src={product?.Thumbnail}
                    fallback="https://via.placeholder.com/76"
                    width={76}
                    height={76}
                    preview={false}
                    className={styles.productImage}
                  />
                </div>

                <div className={styles.warrantyBody}>
                  <div className={styles.cardTop}>
                    {renderStatusTag(effectiveStatus)}
                    <Tag color="blue" icon={<SafetyCertificateOutlined />}>
                      Mã BH #{warranty.MaBaoHanh}
                    </Tag>
                  </div>

                  <h3>{product?.TenSanPham || 'Sản phẩm không xác định'}</h3>

                  <div className={styles.meta}>
                    <span>Phân loại: {variant?.TenBienThe || 'Không rõ'}</span>
                    <span>Mã đơn: {order?.MaHienThi || 'Không rõ'}</span>
                    <span>
                      Giá mua: {fmt(orderDetail?.GiaBan)} × {orderDetail?.SoLuong || 0}
                    </span>
                  </div>

                  <div className={styles.expireText}>
                    Thời hạn: {dayjs(warranty.NgayBatDau).format('DD/MM/YYYY')} -{' '}
                    {dayjs(warranty.NgayKetThuc).format('DD/MM/YYYY')}
                  </div>

                  {warranty.GhiChu && (
                    <div className={styles.note}>{warranty.GhiChu}</div>
                  )}
                </div>

                <div className={styles.actions}>
                  <Button
                    icon={<EyeOutlined />}
                    onClick={() => fetchWarrantyDetail(warranty.MaBaoHanh)}
                  >
                    Chi tiết
                  </Button>

                  {canRequestWarranty(warranty) ? (
                    <Button
                      type="primary"
                      icon={<SendOutlined />}
                      className={styles.primaryBtn}
                      onClick={() => openRequestModal(warranty)}
                    >
                      Yêu cầu BH
                    </Button>
                  ) : (
                    <Tooltip
                      title={`Phiếu đang ở trạng thái ${getStatusLabel(effectiveStatus)}`}
                    >
                      <Button disabled>Yêu cầu BH</Button>
                    </Tooltip>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        open={detailOpen}
        title={`Chi tiết phiếu bảo hành #${selectedWarranty?.MaBaoHanh || ''}`}
        onCancel={closeDetailModal}
        footer={null}
        width={900}
        centered
        destroyOnHidden
        maskClosable={false}
        className={styles.detailModal}
        wrapClassName={styles.detailModalWrap}
        styles={{
          content: {
            maxHeight: '88vh',
            overflow: 'hidden',
          },
          body: {
            padding: 0,
            overflow: 'hidden',
          },
        }}
      >
        <div className={styles.detailModalBody}>
          {detailLoading ? (
            <div className={styles.loadingWrap}>
              <Spin />
              <span>Đang tải chi tiết bảo hành...</span>
            </div>
          ) : selectedWarranty ? (
            <div className={styles.detailContent}>
              <Descriptions
                bordered
                size="small"
                column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
              >
                <Descriptions.Item label="Mã đơn hàng">
                  {detailOrder?.MaHienThi || 'Không rõ'}
                </Descriptions.Item>

                <Descriptions.Item label="Trạng thái">
                  {renderStatusTag(getEffectiveStatus(selectedWarranty))}
                </Descriptions.Item>

                <Descriptions.Item label="Sản phẩm">
                  {detailProduct?.TenSanPham || 'Không rõ'}
                </Descriptions.Item>

                <Descriptions.Item label="Phân loại">
                  {detailVariant?.TenBienThe || 'Không rõ'}
                </Descriptions.Item>

                <Descriptions.Item label="Giá mua">
                  {fmt(detailOrderDetail?.GiaBan)} × {detailOrderDetail?.SoLuong || 0}
                </Descriptions.Item>

                <Descriptions.Item label="Thời hạn">
                  {dayjs(selectedWarranty.NgayBatDau).format('DD/MM/YYYY HH:mm')} -{' '}
                  {dayjs(selectedWarranty.NgayKetThuc).format('DD/MM/YYYY HH:mm')}
                </Descriptions.Item>

                <Descriptions.Item label="Ghi chú" span={2}>
                  {selectedWarranty.GhiChu || 'Không có'}
                </Descriptions.Item>
              </Descriptions>

              {canRequestWarranty(selectedWarranty) && (
                <div className={styles.detailAction}>
                  <Button
                    type="primary"
                    icon={<SendOutlined />}
                    className={styles.primaryBtn}
                    onClick={() => openRequestModal(selectedWarranty)}
                  >
                    Gửi yêu cầu bảo hành
                  </Button>
                </div>
              )}

              <h3 className={styles.timelineTitle}>Lịch sử xử lý bảo hành</h3>

              {histories.length > 0 ? (
                <Timeline
                  items={histories.map((history) => ({
                    color:
                      Number(history.TrangThai) === 3
                        ? 'green'
                        : Number(history.TrangThai) === 2
                          ? 'red'
                          : 'blue',
                    children: (
                      <div className={styles.timelineItem}>
                        <div className={styles.timelineHeader}>
                          <strong>
                            {dayjs(history.NgayXuLy).format('DD/MM/YYYY HH:mm')}
                          </strong>

                          <Space size={6} wrap>
                            <Tag color="blue">
                              {renderHistoryAction(history.HanhDong)}
                            </Tag>
                            {renderHistoryStatus(history.TrangThai)}
                          </Space>
                        </div>

                        <div className={styles.timelineNote}>
                          {history.NoiDungXuLy || 'Không có nội dung xử lý'}
                        </div>

                        {history.AnhMinhChung && (
                          <div className={styles.evidenceWrap}>
                            <Image
                              src={history.AnhMinhChung}
                              width={130}
                              preview={false}
                              alt="Ảnh minh chứng bảo hành"
                            />
                          </div>
                        )}
                      </div>
                    ),
                  }))}
                />
              ) : (
                <Empty description="Chưa có lịch sử xử lý." />
              )}
            </div>
          ) : (
            <Empty description="Không tìm thấy phiếu bảo hành." />
          )}
        </div>
      </Modal>

      <Modal
        open={requestOpen}
        title={`Gửi yêu cầu bảo hành #${requestWarranty?.MaBaoHanh || ''}`}
        okText="Gửi yêu cầu"
        cancelText="Hủy"
        confirmLoading={requestSubmitting || evidenceUploading}
        onCancel={closeRequestModal}
        onOk={() => requestForm.submit()}
        destroyOnHidden
      >
        <Form form={requestForm} layout="vertical" onFinish={submitRequest}>
          <Form.Item
            name="NoiDungXuLy"
            label="Mô tả lỗi cần bảo hành"
            rules={[
              {
                required: true,
                message: 'Vui lòng mô tả lỗi cần bảo hành!',
              },
            ]}
          >
            <TextArea
              rows={5}
              maxLength={255}
              showCount
              placeholder="Ví dụ: Sản phẩm bị lỗi men, nứt nhẹ, bong lớp phủ sau khi sử dụng..."
            />
          </Form.Item>

          <Form.Item name="AnhMinhChung" hidden>
            <Input />
          </Form.Item>

          <Form.Item
            label="Ảnh minh chứng"
            extra="Bạn có thể chọn ảnh trực tiếp từ máy. Hệ thống sẽ tự tải ảnh lên và gửi kèm yêu cầu bảo hành."
          >
            <Upload
              accept="image/*"
              maxCount={1}
              showUploadList={false}
              beforeUpload={handleEvidenceUpload}
              disabled={evidenceUploading || requestSubmitting}
            >
              <Button icon={<UploadOutlined />} loading={evidenceUploading}>
                {evidenceUrl ? 'Đổi ảnh minh chứng' : 'Chọn ảnh từ máy'}
              </Button>
            </Upload>

            {evidenceUrl && (
              <div className={styles.requestEvidencePreview}>
                <Image
                  src={evidenceUrl}
                  width={140}
                  preview={false}
                  alt="Ảnh minh chứng bảo hành"
                />

                <Button
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={clearEvidenceImage}
                  disabled={requestSubmitting}
                >
                  Xóa ảnh
                </Button>
              </div>
            )}
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}