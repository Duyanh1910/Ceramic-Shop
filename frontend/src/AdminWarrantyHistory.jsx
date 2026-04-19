import React, { useEffect, useState } from "react";
import {
  Modal,
  Timeline,
  Spin,
  Typography,
  Tag,
  Descriptions,
  Divider,
} from "antd";
import dayjs from "dayjs";
import axios from "axios";
import styles from "./AdminWarrantyHistory.module.css";
import { DescriptionsContext } from "antd/es/descriptions";

const { Text, Title } = Typography;
const API_BASE = "https://ceramic-shop-u8ak.onrender.com/api/v1";
const axiosConfig = { withCredentials: true };

const WarrantyHistory = ({ open, onCancel, maBaoHanh }) => {
  const [loading, setLoading] = useState(false);
  const [warrantyData, setWarrantyData] = useState(null);

  useEffect(() => {
    if (open && maBaoHanh) {
      fetchWarrantyDetail();
    } else {
      setWarrantyData(null);
    }
  }, [open, maBaoHanh]);

  const fetchWarrantyDetail = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_BASE}/admin/after_sales/warranties/${maBaoHanh}`,
        axiosConfig,
      );
      if (res.data?.success) {
        setWarrantyData(res.data.result);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const renderStatus = (status) => {
    if (status === 1) return <Tag color="green">Còn hiệu lực</Tag>;
    if (status === 0) return <Tag color="red">Hết hạn</Tag>;
    if (status === 2) return <Tag color="default">Đã hủy</Tag>;
    return <Tag>{status}</Tag>;
  };
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <Modal
      title={`Chi tiết phiếu bảo hành - #${maBaoHanh || ""} `}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={800}
      destroyOnHidden
    >
      <div className={styles.modalContent}>
        {loading ? (
          <div className={styles.loadingContainer}>
            <Spin
              description="Đang tải dữ liệu chi tiết..."
              size="large"
            ></Spin>
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
                  {warrantyData.ChiTietDonHang?.DonHang?.TenNguoiNhan}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">
                {warrantyData.ChiTietDonHang?.DonHang?.SDT}
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ">
                {warrantyData.ChiTietDonHang?.DonHang?.DiaChiGiaoHang}
              </Descriptions.Item>
              <Descriptions.Item label="Mã Đơn hàng">
                <Text copyable className={styles.highlightText}>
                  {warrantyData.ChiTietDonHang?.DonHang?.MaHienThi}
                </Text>
              </Descriptions.Item>

              <Descriptions.Item label="Sản phẩm / Phân loại">
                <Text strong>
                  {warrantyData.ChiTietDonHang?.BienTheSanPham?.TenBienThe}
                </Text>
              </Descriptions.Item>

              <Descriptions.Item label="Giá trị mua">
                {formatCurrency(warrantyData.ChiTietDonHang?.GiaBan)} (SL:{" "}
                {warrantyData.ChiTietDonHang?.SoLuong})
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
            <Divider />
            <Title level={5} className={styles.sectionTitle}>
              Lịch sử xử lý bảo hành
            </Title>

            {warrantyData.LichSuBaoHanhs &&
            warrantyData.LichSuBaoHanhs.length > 0 ? (
              <Timeline
                items={warrantyData.LichSuBaoHanhs.map((history) => ({
                  color: history.trangThai === "Hoàn thành" ? "green" : "blue",
                  children: (
                    <div className={styles.timelineItem}>
                      <div className={styles.timelineHeader}>
                        <Text strong>
                          {dayjs(history.ngayTao || history.createdAt).format(
                            "DD/MM/YYYY HH:mm",
                          )}
                        </Text>
                        <Tag color="blue">
                          {history.trangThai || "Cập nhật"}
                        </Tag>
                      </div>

                      <div className={styles.timelinePersonnel}>
                        <Text type="secondary">
                          Người xử lý:{" "}
                          {history.nguoiXuLy || history.nguoiTao || "Admin"}
                        </Text>
                      </div>

                      <div className={styles.timelineNote}>
                        {history.ghiChu || history.noiDung}
                      </div>
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
  );
};
export default WarrantyHistory;
