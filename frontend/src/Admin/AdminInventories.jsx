import React, { useState, useEffect, useCallback } from "react";
import {
  Table,
  Input,
  Button,
  DatePicker,
  message,
  Tag,
  Modal,
  Descriptions,
  Spin,
} from "antd";
import {
  SearchOutlined,
  DownloadOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import axios from "axios";
import styles from "./AdminTable.module.css";

const { RangePicker } = DatePicker;
const API_BASE = "https://ceramic-shop-u8ak.onrender.com/api/v1/admin";

const InventoryHistory = () => {
  const [data, setData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [dateRange, setDateRange] = useState(null);
  const [loadingExport, setLoadingExport] = useState(false);
  const [loadingTable, setLoadingTable] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailData, setDetailData] = useState(null);

  const fetchData = useCallback(
    async (page = 1, limit = 10, search = "", dates = null) => {
      try {
        setLoadingTable(true);

        let startDate = "";
        let endDate = "";

        if (dates && dates.length === 2) {
          startDate = dates[0].format("YYYY-MM-DD");
          endDate = dates[1].format("YYYY-MM-DD");
        }

        const queryParams = new URLSearchParams({
          page,
          limit,
          search,
          ...(startDate && { startDate }),
          ...(endDate && { endDate }),
        });

        const response = await axios.get(
          `${API_BASE}/inventories?${queryParams.toString()}`,
          { withCredentials: true },
        );

        if (response.data.success) {
          setData(response.data.result.data);
          setPagination({
            current: response.data.result.pagination.page,
            pageSize: response.data.result.pagination.limit,
            total: response.data.result.pagination.total,
          });
        }
      } catch (error) {
        console.error(error);
        message.error("Lỗi khi tải dữ liệu lịch sử tồn kho!");
      } finally {
        setLoadingTable(false);
      }
    },
    [],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData(pagination.current, pagination.pageSize, searchText, dateRange);
    }, 500);

    return () => clearTimeout(timer);
  }, [
    fetchData,
    pagination.current,
    pagination.pageSize,
    searchText,
    dateRange,
  ]);

  const handleTableChange = (newPagination) => {
    setPagination({
      ...pagination,
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    });
  };

  const handleExportReport = async () => {
    try {
      setLoadingExport(true);
      let startDate = "";
      let endDate = "";

      if (dateRange && dateRange.length === 2) {
        startDate = dateRange[0].format("YYYY-MM-DD");
        endDate = dateRange[1].format("YYYY-MM-DD");
      }

      const queryParams = new URLSearchParams({
        search: searchText,
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
      });

      const url = `${API_BASE}/inventories/export?${queryParams.toString()}`;

      const response = await axios.get(url, {
        responseType: "blob",
        withCredentials: true,
      });

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const downloadUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute(
        "download",
        `Bao_Cao_Ton_Kho_${dayjs().format("DDMMYYYY_HHmm")}.xlsx`,
      );

      document.body.appendChild(link);
      link.click();

      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      message.success("Tải báo cáo thành công!");
    } catch (error) {
      console.error(error);
      message.error("Có lỗi xảy ra khi tải file!");
    } finally {
      setLoadingExport(false);
    }
  };

  const handleViewDetails = async (id) => {
    setIsModalOpen(true);
    setLoadingDetail(true);
    setDetailData(null);
    try {
      const response = await axios.get(`${API_BASE}/inventories/${id}`, {
        withCredentials: true,
      });
      if (response.data.success) {
        setDetailData(response.data.result);
      }
    } catch (error) {
      console.error(error);
      message.error("Lỗi khi tải chi tiết lịch sử!");
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setDetailData(null);
  };

  // CẬP NHẬT CỘT DỮ LIỆU TẠI ĐÂY
  const columns = [
    {
      title: "Mã LS",
      dataIndex: "MaLichSu",
      key: "MaLichSu",
      width: 90,
    },
    {
      title: "Sản phẩm",
      key: "SanPham",
      render: (_, record) => {
        const productName = record.BienTheSanPham?.SanPham?.TenSanPham;
        const variantName = record.BienTheSanPham?.TenBienThe;

        // Format chuỗi hiển thị theo yêu cầu
        const productDisplay = [productName, variantName]
          .filter(Boolean)
          .join(" - ");

        // Lấy ảnh đầu tiên của biến thể
        const imageUrl = record.BienTheSanPham?.HinhAnhBienThes?.[0]?.DuongDan;

        return (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              minWidth: "250px",
            }}
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="variant"
                style={{
                  width: 44,
                  height: 44,
                  objectFit: "cover",
                  borderRadius: "6px",
                  border: "1px solid #f0f0f0",
                  flexShrink: 0,
                }}
              />
            ) : (
              <div
                style={{
                  width: 44,
                  height: 44,
                  backgroundColor: "#fafafa",
                  borderRadius: "6px",
                  border: "1px solid #f0f0f0",
                  flexShrink: 0,
                }}
              />
            )}
            <span style={{ fontWeight: 500, lineHeight: 1.4 }}>
              {productDisplay || `Biến thể #${record.MaBienThe}`}
            </span>
          </div>
        );
      },
    },
    {
      title: "Loại giao dịch",
      dataIndex: "LoaiGiaoDich",
      key: "LoaiGiaoDich",
      render: (text) => {
        let color = text.includes("Xuất") ? "volcano" : "green";
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: "SL Thay đổi",
      dataIndex: "SoLuongThayDoi",
      key: "SoLuongThayDoi",
      render: (val) => (
        <span
          className={styles.price}
          style={{ color: val > 0 ? "green" : "#d0021b", fontWeight: "bold" }}
        >
          {val > 0 ? `+${val}` : val}
        </span>
      ),
    },
    {
      title: "Tồn kho",
      dataIndex: "TonKhoHienTai",
      key: "TonKhoHienTai",
    },
    {
      title: "Mã đơn hàng",
      key: "MaHienThi",
      render: (_, record) => record.DonHang?.MaHienThi || "N/A",
    },
    {
      title: "Ngày tạo",
      dataIndex: "NgayTao",
      key: "NgayTao",
      render: (date) => dayjs(date).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetails(record.MaLichSu)}
          className={styles.editBtn}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div className={styles.wrapper}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Lịch sử tồn kho</h1>
          <p className={styles.pageSub}>
            Quản lý biến động số lượng sản phẩm gốm sứ
          </p>
        </div>
      </div>

      <div className={styles.toolbar}>
        <Input
          placeholder="Tìm kiếm mã đơn hàng..."
          prefix={<SearchOutlined />}
          className={styles.searchInput}
          value={searchText}
          onChange={(e) => {
            setSearchText(e.target.value);
            setPagination((prev) => ({ ...prev, current: 1 }));
          }}
        />

        <RangePicker
          style={{ borderRadius: "8px" }}
          format="DD/MM/YYYY"
          value={dateRange}
          onChange={(dates) => {
            setDateRange(dates);
            setPagination((prev) => ({ ...prev, current: 1 }));
          }}
          placeholder={["Từ ngày", "Đến ngày"]}
          allowClear
        />

        <Button
          type="primary"
          icon={<DownloadOutlined />}
          className={styles.btnAdd}
          onClick={handleExportReport}
          loading={loadingExport}
          style={{ marginLeft: "auto" }}
        >
          Xuất báo cáo
        </Button>
      </div>

      <div className={styles.tableCard}>
        <Table
          className={styles.table}
          columns={columns}
          dataSource={data}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: false,
          }}
          loading={loadingTable}
          onChange={handleTableChange}
          rowKey="MaLichSu"
          scroll={{ x: "max-content" }} // Đảm bảo bảng không bị tràn khung khi cột Sản phẩm dài
        />
      </div>

      <Modal
        title={
          <span className={styles.modalTitle}>Chi tiết lịch sử tồn kho</span>
        }
        open={isModalOpen}
        onCancel={handleCloseModal}
        footer={[
          <Button key="close" onClick={handleCloseModal}>
            Đóng
          </Button>,
        ]}
        width={700}
      >
        <Spin spinning={loadingDetail}>
          {detailData && (
            <>
              <div className={styles.variantSection}>
                <h3 className={styles.variantTitle}>Thông tin giao dịch</h3>

                {/* HIỂN THỊ SẢN PHẨM CỦA LỊCH SỬ TỒN KHO NÀY */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    marginBottom: "20px",
                    padding: "12px",
                    backgroundColor: "#f9f9f9",
                    borderRadius: "8px",
                    border: "1px solid #f0f0f0",
                  }}
                >
                  {detailData.history.BienTheSanPham?.HinhAnhBienThes?.[0]
                    ?.DuongDan ? (
                    <img
                      src={
                        detailData.history.BienTheSanPham.HinhAnhBienThes[0]
                          .DuongDan
                      }
                      alt="variant"
                      style={{
                        width: 64,
                        height: 64,
                        objectFit: "cover",
                        borderRadius: "6px",
                        border: "1px solid #e8e8e8",
                        flexShrink: 0,
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 64,
                        height: 64,
                        backgroundColor: "#e8e8e8",
                        borderRadius: "6px",
                        flexShrink: 0,
                      }}
                    />
                  )}
                  <div>
                    <div
                      style={{
                        fontSize: "16px",
                        fontWeight: "600",
                        color: "#173b63",
                        marginBottom: "4px",
                        lineHeight: 1.4,
                      }}
                    >
                      {[
                        detailData.history.BienTheSanPham?.SanPham?.TenSanPham,
                        detailData.history.BienTheSanPham?.TenBienThe,
                      ]
                        .filter(Boolean)
                        .join(" - ")}
                    </div>
                    <div style={{ color: "#666" }}>
                      Mã biến thể:{" "}
                      <strong>#{detailData.history.MaBienThe}</strong>
                    </div>
                  </div>
                </div>

                <Descriptions column={2} size="small">
                  <Descriptions.Item label="Mã lịch sử">
                    <strong>{detailData.history.MaLichSu}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Ngày tạo">
                    {dayjs(detailData.history.NgayTao).format(
                      "DD/MM/YYYY HH:mm",
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="Loại giao dịch">
                    <Tag
                      color={
                        detailData.history.LoaiGiaoDich.includes("Xuất")
                          ? "volcano"
                          : "green"
                      }
                    >
                      {detailData.history.LoaiGiaoDich}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Mã tham chiếu">
                    {detailData.history.MaThamChieu}
                  </Descriptions.Item>
                  <Descriptions.Item label="Số lượng thay đổi">
                    <span
                      style={{
                        color:
                          detailData.history.SoLuongThayDoi > 0
                            ? "green"
                            : "#d0021b",
                        fontWeight: "bold",
                        fontSize: "15px",
                      }}
                    >
                      {detailData.history.SoLuongThayDoi > 0 ? "+" : ""}
                      {detailData.history.SoLuongThayDoi}
                    </span>
                  </Descriptions.Item>
                  <Descriptions.Item label="Tồn kho hiện tại">
                    <strong>{detailData.history.TonKhoHienTai}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Ghi chú" span={2}>
                    {detailData.history.GhiChu || "Không có"}
                  </Descriptions.Item>
                </Descriptions>
              </div>

              {detailData.orderDetail && (
                <div
                  className={styles.variantSection}
                  style={{ marginTop: 24 }}
                >
                  <h3 className={styles.variantTitle}>
                    Thông tin đơn hàng liên quan
                  </h3>
                  <Descriptions column={2} size="small">
                    <Descriptions.Item label="Mã đơn hàng">
                      <strong>{detailData.orderDetail.MaHienThi}</strong>
                    </Descriptions.Item>
                    <Descriptions.Item label="Khách hàng">
                      {detailData.orderDetail.KhachHang?.TenKhachHang || "N/A"}
                    </Descriptions.Item>
                    <Descriptions.Item label="SĐT">
                      {detailData.orderDetail.SDT || "N/A"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Tổng tiền">
                      <span
                        className={styles.price}
                        style={{ color: "#d0021b", fontWeight: "bold" }}
                      >
                        {Number(
                          detailData.orderDetail.TongThanhToan,
                        ).toLocaleString("vi-VN")}{" "}
                        VNĐ
                      </span>
                    </Descriptions.Item>
                    <Descriptions.Item label="Địa chỉ giao hàng" span={2}>
                      {detailData.orderDetail.DiaChiGiaoHang}
                    </Descriptions.Item>
                  </Descriptions>

                  {/* HIỂN THỊ DANH SÁCH SẢN PHẨM TRONG ĐƠN CÓ ẢNH */}
                  {detailData.orderDetail.ChiTietDonHangs?.length > 0 && (
                    <div style={{ marginTop: 16 }}>
                      <strong style={{ display: "block", marginBottom: 12 }}>
                        Sản phẩm trong đơn:
                      </strong>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "10px",
                        }}
                      >
                        {detailData.orderDetail.ChiTietDonHangs.map((item) => {
                          const productDisplay = [
                            item.BienTheSanPham?.SanPham?.TenSanPham,
                            item.BienTheSanPham?.TenBienThe,
                          ]
                            .filter(Boolean)
                            .join(" - ");
                          const imgUrl =
                            item.BienTheSanPham?.HinhAnhBienThes?.[0]?.DuongDan;

                          return (
                            <div
                              key={item.MaCTDH}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                padding: "10px",
                                border: "1px solid #f0f0f0",
                                borderRadius: "8px",
                              }}
                            >
                              {imgUrl ? (
                                <img
                                  src={imgUrl}
                                  alt="product"
                                  style={{
                                    width: 50,
                                    height: 50,
                                    objectFit: "cover",
                                    borderRadius: "4px",
                                    border: "1px solid #f0f0f0",
                                    flexShrink: 0,
                                  }}
                                />
                              ) : (
                                <div
                                  style={{
                                    width: 50,
                                    height: 50,
                                    backgroundColor: "#fafafa",
                                    borderRadius: "4px",
                                    border: "1px solid #f0f0f0",
                                    flexShrink: 0,
                                  }}
                                />
                              )}
                              <div style={{ flex: 1 }}>
                                <div
                                  style={{ fontWeight: 500, lineHeight: 1.4 }}
                                >
                                  {productDisplay}
                                </div>
                                <div
                                  style={{
                                    color: "#666",
                                    fontSize: "13px",
                                    marginTop: "4px",
                                  }}
                                >
                                  Số lượng:{" "}
                                  <strong style={{ color: "#333" }}>
                                    x{item.SoLuong}
                                  </strong>
                                </div>
                              </div>
                              <div
                                style={{
                                  fontWeight: 600,
                                  color: "#173b63",
                                  flexShrink: 0,
                                }}
                              >
                                {Number(item.ThanhTien).toLocaleString("vi-VN")}{" "}
                                ₫
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </Spin>
      </Modal>
    </div>
  );
};

export default InventoryHistory;
