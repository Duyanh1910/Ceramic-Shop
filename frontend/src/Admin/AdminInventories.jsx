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

const isExportTransaction = (value) => {
  const normalizedValue = String(value || "").toUpperCase();
  return normalizedValue.includes("XUAT") || normalizedValue.includes("XUẤT");
};

const getInventoryOrderCode = (record) =>
  record.DonHang?.MaHienThi || record.MaHienThiLienQuan || "N/A";

const getInventoryProductName = (record) => {
  const productName = record.BienTheSanPham?.SanPham?.TenSanPham;
  const variantName = record.BienTheSanPham?.TenBienThe;

  return (
    [productName, variantName].filter(Boolean).join(" - ") ||
    `Biến thể #${record.MaBienThe}`
  );
};

const getInventoryProductImage = (record) =>
  record.BienTheSanPham?.HinhAnhBienThes?.[0]?.DuongDan;

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
      width: 360,
      render: (_, record) => {
        const productDisplay = getInventoryProductName(record);
        const imageUrl = getInventoryProductImage(record);

        return (
          <div className={styles.inventoryProductCell}>
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="variant"
                className={styles.inventoryProductImage}
              />
            ) : (
              <div className={styles.inventoryProductImagePlaceholder} />
            )}

            <span className={styles.inventoryProductName}>
              {productDisplay}
            </span>
          </div>
        );
      },
    },
    {
      title: "Loại giao dịch",
      dataIndex: "LoaiGiaoDich",
      key: "LoaiGiaoDich",
      width: 160,
      render: (text) => (
        <Tag color={isExportTransaction(text) ? "volcano" : "green"}>
          {text}
        </Tag>
      ),
    },
    {
      title: "SL Thay đổi",
      dataIndex: "SoLuongThayDoi",
      key: "SoLuongThayDoi",
      width: 120,
      render: (val) => (
        <span
          className={styles.price}
          style={{
            color: val > 0 ? "green" : "#d0021b",
            fontWeight: "bold",
          }}
        >
          {val > 0 ? `+${val}` : val}
        </span>
      ),
    },
    {
      title: "Tồn kho",
      dataIndex: "TonKhoHienTai",
      key: "TonKhoHienTai",
      width: 100,
    },
    {
      title: "Mã đơn hàng",
      key: "MaHienThi",
      width: 140,
      render: (_, record) => getInventoryOrderCode(record),
    },
    {
      title: "Ngày tạo",
      dataIndex: "NgayTao",
      key: "NgayTao",
      width: 160,
      render: (date) => dayjs(date).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 120,
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
          scroll={{ x: 1200 }}
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
        width={760}
      >
        <Spin spinning={loadingDetail}>
          {detailData && (
            <>
              <div className={styles.variantSection}>
                <h3 className={styles.variantTitle}>Thông tin giao dịch</h3>

                <div className={styles.inventoryDetailProductBox}>
                  {detailData.history.BienTheSanPham?.HinhAnhBienThes?.[0]
                    ?.DuongDan ? (
                    <img
                      src={
                        detailData.history.BienTheSanPham.HinhAnhBienThes[0]
                          .DuongDan
                      }
                      alt="variant"
                      className={styles.inventoryDetailProductImage}
                    />
                  ) : (
                    <div className={styles.inventoryDetailImagePlaceholder} />
                  )}

                  <div>
                    <div className={styles.inventoryDetailProductName}>
                      {[
                        detailData.history.BienTheSanPham?.SanPham?.TenSanPham,
                        detailData.history.BienTheSanPham?.TenBienThe,
                      ]
                        .filter(Boolean)
                        .join(" - ") ||
                        `Biến thể #${detailData.history.MaBienThe}`}
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
                        isExportTransaction(detailData.history.LoaiGiaoDich)
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

                  <Descriptions.Item label="Mã đơn hàng">
                    {detailData.history.DonHang?.MaHienThi ||
                      detailData.history.MaHienThiLienQuan ||
                      "N/A"}
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

                  {detailData.orderDetail.ChiTietDonHangs?.length > 0 && (
                    <div style={{ marginTop: 16 }}>
                      <strong style={{ display: "block", marginBottom: 12 }}>
                        Sản phẩm trong đơn:
                      </strong>

                      <div className={styles.inventoryOrderItems}>
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
                              className={styles.inventoryOrderItem}
                            >
                              {imgUrl ? (
                                <img
                                  src={imgUrl}
                                  alt="product"
                                  className={styles.inventoryOrderItemImage}
                                />
                              ) : (
                                <div
                                  className={
                                    styles.inventoryOrderItemImagePlaceholder
                                  }
                                />
                              )}

                              <div className={styles.inventoryOrderItemInfo}>
                                <div className={styles.inventoryOrderItemName}>
                                  {productDisplay}
                                </div>

                                <div className={styles.inventoryOrderItemQty}>
                                  Số lượng:{" "}
                                  <strong style={{ color: "#333" }}>
                                    x{item.SoLuong}
                                  </strong>
                                </div>
                              </div>

                              <div className={styles.inventoryOrderItemPrice}>
                                {Number(item.ThanhTien).toLocaleString(
                                  "vi-VN",
                                )}{" "}
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