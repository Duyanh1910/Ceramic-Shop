import { useEffect, useState } from "react";
import {
  Modal,
  Timeline,
  Spin,
  Typography,
  Tag,
  Descriptions,
  Divider,
  Button,
  Space,
  message,
} from "antd";
import dayjs from "dayjs";
import axios from "axios";
import styles from "./AdminWarrantyHistory.module.css";

const { Text, Title } = Typography;
const API_BASE = "https://ceramic-shop-u8ak.onrender.com/api/v1";

const WARRANTY_STATUS = {
  EXPIRED: 0,
  ACTIVE: 1,
  REQUESTED: 2,
  PROCESSING: 3,
  COMPLETED: 4,
  REJECTED: 5,
};

const getToken = () =>
  localStorage.getItem("admin_token") || localStorage.getItem("customer_token");

const authConfig = () => {
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

const renderStatus = (status) => {
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

  if (statusNumber === 0) {
    return <Tag color="gold">Tiếp nhận</Tag>;
  }

  if (statusNumber === 1) {
    return <Tag color="blue">Đã duyệt</Tag>;
  }

  if (statusNumber === 2) {
    return <Tag color="red">Từ chối</Tag>;
  }

  if (statusNumber === 3) {
    return <Tag color="green">Hoàn tất</Tag>;
  }

  return <Tag>Cập nhật</Tag>;
};

const renderAction = (action) => {
  if (action === "TAO_PHIEU") return "Tạo phiếu";
  if (action === "HET_HAN") return "Hết hạn";
  if (action === "TIEP_NHAN") return "Tiếp nhận";
  if (action === "KIEM_TRA") return "Kiểm tra";
  if (action === "DUYET") return "Duyệt";
  if (action === "TU_CHOI") return "Từ chối";
  if (action === "HOAN_TAT") return "Hoàn tất";
  if (action === "DOI_MOI") return "Đổi mới sản phẩm";

  return action || "Cập nhật";
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(Number(amount || 0));
};

const WarrantyHistory = ({ open, onCancel, maBaoHanh, onUpdated }) => {
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [warrantyData, setWarrantyData] = useState(null);
  const [previewImageUrl, setPreviewImageUrl] = useState("");

  useEffect(() => {
    if (open && maBaoHanh) {
      fetchWarrantyDetail();
    } else {
      setWarrantyData(null);
      setPreviewImageUrl("");
    }
  }, [open, maBaoHanh]);

  const fetchWarrantyDetail = async () => {
    setLoading(true);

    try {
      const res = await axios.get(
        `${API_BASE}/admin/after_sales/warranties/${maBaoHanh}`,
        authConfig(),
      );

      if (res.data?.success) {
        setWarrantyData(res.data.result);
      }
    } catch (err) {
      message.error(
        err.response?.data?.message || "Không thể tải chi tiết bảo hành!",
      );
    } finally {
      setLoading(false);
    }
  };

  const updateWarrantyStatus = async (nextStatus, action, note) => {
    setUpdating(true);

    try {
      const res = await axios.patch(
        `${API_BASE}/admin/after_sales/warranties/${maBaoHanh}/status`,
        {
          TrangThai: nextStatus,
          HanhDong: action,
          NoiDungXuLy: note,
        },
        authConfig(),
      );

      if (res.data?.success) {
        setWarrantyData(res.data.result);
        message.success(res.data.message || "Cập nhật bảo hành thành công!");

        if (onUpdated) {
          onUpdated();
        }
      }
    } catch (err) {
      message.error(
        err.response?.data?.message || "Không thể cập nhật bảo hành!",
      );
    } finally {
      setUpdating(false);
    }
  };

  const handleApprove = () => {
    updateWarrantyStatus(
      WARRANTY_STATUS.PROCESSING,
      "DUYET",
      "Admin đã duyệt yêu cầu và chuyển sang trạng thái đang xử lý",
    );
  };

  const handleReject = () => {
    updateWarrantyStatus(
      WARRANTY_STATUS.REJECTED,
      "TU_CHOI",
      "Admin từ chối yêu cầu bảo hành",
    );
  };

  const handleComplete = () => {
    updateWarrantyStatus(
      WARRANTY_STATUS.COMPLETED,
      "HOAN_TAT",
      "Admin hoàn tất xử lý bảo hành",
    );
  };

  const handleClose = () => {
    setPreviewImageUrl("");
    onCancel();
  };

  const openEvidencePreview = (url) => {
    setPreviewImageUrl(url);
  };

  const openEvidenceNewTab = (url) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const histories = warrantyData?.LichSuBaoHanhs || [];

  return (
    <>
      <Modal
        title={`Chi tiết phiếu bảo hành - #${maBaoHanh || ""}`}
        open={open}
        onCancel={handleClose}
        footer={null}
        width={900}
        destroyOnHidden
        styles={{
          body: {
            maxHeight: "72vh",
            overflowY: "auto",
            paddingRight: 8,
          },
        }}
      >
        <div className={styles.modalContent}>
          {loading ? (
            <div className={styles.loadingContainer}>
              <Spin size="large" />
              <div>Đang tải dữ liệu chi tiết...</div>
            </div>
          ) : warrantyData ? (
            <>
              <Title level={5} className={styles.sectionTitle}>
                Thông tin khách hàng và đơn hàng
              </Title>

              <Descriptions
                bordered
                size="small"
                column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
              >
                <Descriptions.Item label="Khách hàng">
                  <Text strong>
                    {warrantyData.ChiTietDonHang?.DonHang?.TenNguoiNhan ||
                      "Không rõ"}
                  </Text>
                </Descriptions.Item>

                <Descriptions.Item label="Số điện thoại">
                  {warrantyData.ChiTietDonHang?.DonHang?.SDT || "Không rõ"}
                </Descriptions.Item>

                <Descriptions.Item label="Địa chỉ" span={2}>
                  {warrantyData.ChiTietDonHang?.DonHang?.DiaChiGiaoHang ||
                    "Không rõ"}
                </Descriptions.Item>

                <Descriptions.Item label="Mã đơn hàng">
                  <Text copyable className={styles.highlightText}>
                    {warrantyData.ChiTietDonHang?.DonHang?.MaHienThi ||
                      "Không rõ"}
                  </Text>
                </Descriptions.Item>

                <Descriptions.Item label="Sản phẩm / Phân loại">
                  <Text strong>
                    {warrantyData.ChiTietDonHang?.BienTheSanPham?.TenBienThe ||
                      "Không rõ"}
                  </Text>
                </Descriptions.Item>

                <Descriptions.Item label="Giá trị mua">
                  {formatCurrency(warrantyData.ChiTietDonHang?.GiaBan)}{" "}
                  (SL: {warrantyData.ChiTietDonHang?.SoLuong || 0})
                </Descriptions.Item>

                <Descriptions.Item label="Trạng thái BH">
                  {renderStatus(warrantyData.TrangThai)}
                </Descriptions.Item>

                <Descriptions.Item label="Bắt đầu">
                  {dayjs(warrantyData.NgayBatDau).format("DD/MM/YYYY HH:mm")}
                </Descriptions.Item>

                <Descriptions.Item label="Kết thúc">
                  {dayjs(warrantyData.NgayKetThuc).format("DD/MM/YYYY HH:mm")}
                </Descriptions.Item>

                <Descriptions.Item label="Ghi chú BH" span={2}>
                  {warrantyData.GhiChu || "Không có"}
                </Descriptions.Item>
              </Descriptions>

              <div className={styles.actionBar}>
                <Space wrap>
                  {Number(warrantyData.TrangThai) === WARRANTY_STATUS.REQUESTED && (
                    <>
                      <Button
                        type="primary"
                        loading={updating}
                        onClick={handleApprove}
                      >
                        Duyệt xử lý
                      </Button>

                      <Button danger loading={updating} onClick={handleReject}>
                        Từ chối
                      </Button>
                    </>
                  )}

                  {Number(warrantyData.TrangThai) ===
                    WARRANTY_STATUS.PROCESSING && (
                    <Button
                      type="primary"
                      loading={updating}
                      onClick={handleComplete}
                    >
                      Hoàn tất bảo hành
                    </Button>
                  )}
                </Space>
              </div>

              <Divider />

              <Title level={5} className={styles.sectionTitle}>
                Lịch sử xử lý bảo hành
              </Title>

              {histories.length > 0 ? (
                <Timeline
                  items={histories.map((history) => ({
                    color:
                      Number(history.TrangThai) === 3
                        ? "green"
                        : Number(history.TrangThai) === 2
                          ? "red"
                          : "blue",
                    children: (
                      <div className={styles.timelineItem}>
                        <div className={styles.timelineHeader}>
                          <Text strong>
                            {dayjs(history.NgayXuLy).format("DD/MM/YYYY HH:mm")}
                          </Text>

                          <Space size={6} wrap>
                            <Tag color="blue">
                              {renderAction(history.HanhDong)}
                            </Tag>
                            {renderHistoryStatus(history.TrangThai)}
                          </Space>
                        </div>

                        {history.MaNhanVienXuLy && (
                          <div className={styles.timelinePersonnel}>
                            <Text type="secondary">
                              Nhân viên xử lý: #{history.MaNhanVienXuLy}
                            </Text>
                          </div>
                        )}

                        <div className={styles.timelineNote}>
                          {history.NoiDungXuLy || "Không có nội dung xử lý"}
                        </div>

                        {history.AnhMinhChung && (
                          <div className={styles.evidenceWrap}>
                            <button
                              type="button"
                              className={styles.evidenceButton}
                              onClick={() =>
                                openEvidencePreview(history.AnhMinhChung)
                              }
                            >
                              <img
                                src={history.AnhMinhChung}
                                alt="Ảnh minh chứng bảo hành"
                                className={styles.evidenceThumb}
                              />
                              <span>Xem ảnh minh chứng</span>
                            </button>

                            <Button
                              type="link"
                              size="small"
                              onClick={() =>
                                openEvidenceNewTab(history.AnhMinhChung)
                              }
                            >
                              Mở tab mới
                            </Button>
                          </div>
                        )}
                      </div>
                    ),
                  }))}
                />
              ) : (
                <div className={styles.emptyHistory}>
                  Chưa có lịch sử cập nhật/xử lý nào cho phiếu bảo hành này.
                </div>
              )}
            </>
          ) : (
            <div className={styles.notFound}>Không tìm thấy thông tin.</div>
          )}
        </div>
      </Modal>

      <Modal
        open={Boolean(previewImageUrl)}
        title="Ảnh minh chứng bảo hành"
        footer={null}
        width={900}
        centered
        destroyOnHidden
        onCancel={() => setPreviewImageUrl("")}
        className={styles.previewModal}
      >
        <div className={styles.previewContent}>
          {previewImageUrl && (
            <img
              src={previewImageUrl}
              alt="Ảnh minh chứng bảo hành"
              className={styles.previewImage}
            />
          )}
        </div>
      </Modal>
    </>
  );
};

export default WarrantyHistory;