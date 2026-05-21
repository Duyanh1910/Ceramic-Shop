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

  const columns = [
    {
      title: "Mã LS",
      dataIndex: "MaLichSu",
      key: "MaLichSu",
      width: 100,
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
          style={{ color: val > 0 ? "green" : "#d0021b" }}
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
                <div className={styles.variantSection}>
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
                      <span className={styles.price}>
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
                    <div style={{ marginTop: 12 }}>
                      <strong>Sản phẩm trong đơn:</strong>
                      <ul style={{ paddingLeft: 20, marginTop: 8 }}>
                        {detailData.orderDetail.ChiTietDonHangs.map((item) => (
                          <li key={item.MaCTDH} style={{ marginBottom: 4 }}>
                            {item.BienTheSanPham?.SanPham?.TenSanPham} -{" "}
                            {item.BienTheSanPham?.TenBienThe} (x{item.SoLuong})
                          </li>
                        ))}
                      </ul>
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
