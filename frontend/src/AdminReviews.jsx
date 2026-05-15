import React, { useState, useEffect, useCallback } from "react";
import {
  Table,
  Input,
  Button,
  DatePicker,
  message,
  Tag,
  Select,
  Rate,
  Tooltip,
} from "antd";
import { SearchOutlined, DownloadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import axios from "axios";
import styles from "./AdminTable.module.css";

const { RangePicker } = DatePicker;
const { Option } = Select;

const API_BASE = "https://ceramic-shop-u8ak.onrender.com/api/v1/admin/reviews";

const AdminReviews = () => {
  const [data, setData] = useState([]);
  const [loadingTable, setLoadingTable] = useState(false);
  const [loadingExport, setLoadingExport] = useState(false);

  const [searchText, setSearchText] = useState("");
  const [filterRating, setFilterRating] = useState(null);
  const [filterStatus, setFilterStatus] = useState(null);
  const [dateRange, setDateRange] = useState(null);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const fetchData = useCallback(
    async (page = 1, limit = 10, search = "", rating, status, dates) => {
      try {
        setLoadingTable(true);

        let startDate = "";
        let endDate = "";

        if (dates && dates.length === 2) {
          startDate = dates[0].format("YYYY-MM-DD");
          endDate = dates[1].format("YYYY-MM-DD");
        }

        const params = {
          page,
          limit,
          search,
          ...(rating !== null && rating !== undefined && { rating }),
          ...(status !== null && status !== undefined && { status }),
          ...(startDate && { startDate }),
          ...(endDate && { endDate }),
        };

        const queryParams = new URLSearchParams(params);

        const response = await axios.get(
          `${API_BASE}?${queryParams.toString()}`,
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
        console.error("Lỗi khi tải danh sách đánh giá:", error);
        message.error("Lỗi khi tải dữ liệu đánh giá!");
      } finally {
        setLoadingTable(false);
      }
    },
    [],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData(
        pagination.current,
        pagination.pageSize,
        searchText,
        filterRating,
        filterStatus,
        dateRange,
      );
    }, 500);

    return () => clearTimeout(timer);
  }, [
    fetchData,
    pagination.current,
    pagination.pageSize,
    searchText,
    filterRating,
    filterStatus,
    dateRange,
  ]);

  const handleTableChange = (newPagination) => {
    setPagination({
      ...pagination,
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    });
  };

  const resetPagination = () => {
    setPagination((prev) => ({ ...prev, current: 1 }));
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

      const params = {
        search: searchText,
        ...(filterRating !== null && { rating: filterRating }),
        ...(filterStatus !== null && { status: filterStatus }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
      };

      const queryParams = new URLSearchParams(params);
      const url = `${API_BASE}/export?${queryParams.toString()}`;

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
        `Bao_Cao_Danh_Gia_${dayjs().format("DDMMYYYY_HHmm")}.xlsx`,
      );

      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      message.success("Xuất báo cáo thành công!");
    } catch (error) {
      console.error(error);
      message.error("Có lỗi xảy ra khi tải file!");
    } finally {
      setLoadingExport(false);
    }
  };

  const columns = [
    {
      title: "Mã ĐG",
      dataIndex: "MaDanhGia",
      key: "MaDanhGia",
      width: 80,
    },
    {
      title: "Khách hàng",
      key: "KhachHang",
      render: (_, record) => {
        const customer = record.KhachHang || {};
        return customer.TenKhachHang || "Khách ẩn danh";
      },
    },
    {
      title: "Sản phẩm",
      key: "SanPham",
      width: 250,
      render: (_, record) => {
        const orderDetail = record.ChiTietDonHang || {};
        const variant = orderDetail.BienTheSanPham || {};
        const product = variant.SanPham || {};

        return (
          <div>
            <div style={{ fontWeight: 500, color: "#173B63" }}>
              {product.TenSanPham || "N/A"}
            </div>
            <div style={{ fontSize: "12px", color: "#888" }}>
              Phân loại: {variant.TenBienThe || "N/A"}
            </div>
          </div>
        );
      },
    },
    {
      title: "Đánh giá",
      dataIndex: "DiemDanhGia",
      key: "DiemDanhGia",
      width: 150,
      render: (diem) => (
        <Rate disabled defaultValue={diem} style={{ fontSize: 14 }} />
      ),
    },
    {
      title: "Nội dung",
      dataIndex: "NoiDung",
      key: "NoiDung",
      width: 300,
      render: (text) => (
        <Tooltip title={text}>
          <div
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: 280,
            }}
          >
            {text || (
              <span style={{ color: "#ccc", fontStyle: "italic" }}>
                Không có nội dung
              </span>
            )}
          </div>
        </Tooltip>
      ),
    },
    {
      title: "Mã Đơn Hàng",
      key: "MaDonHang",
      render: (_, record) => {
        const orderDetail = record.ChiTietDonHang || {};
        const order = orderDetail.DonHang || {};
        return order.MaHienThi || order.MaDonHang || "N/A";
      },
    },
    {
      title: "Ngày đánh giá",
      dataIndex: "NgayGui",
      key: "NgayGui",
      render: (date) => (date ? dayjs(date).format("DD/MM/YYYY HH:mm") : "N/A"),
    },
    {
      title: "Trạng thái",
      dataIndex: "TrangThai",
      key: "TrangThai",
      render: (status) => {
        return status === 1 ? (
          <Tag color="green">Hiển thị</Tag>
        ) : (
          <Tag color="default">Đã ẩn</Tag>
        );
      },
    },
  ];

  return (
    <div className={styles.wrapper}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Quản lý Đánh giá</h1>
          <p className={styles.pageSub}>
            Xem phản hồi và đánh giá từ khách hàng
          </p>
        </div>
      </div>

      <div className={styles.toolbar} style={{ flexWrap: "wrap", gap: "12px" }}>
        <Input
          placeholder="Tìm nội dung đánh giá..."
          prefix={<SearchOutlined />}
          style={{ width: 250, borderRadius: "8px" }}
          value={searchText}
          onChange={(e) => {
            setSearchText(e.target.value);
            resetPagination();
          }}
          allowClear
        />

        <Select
          placeholder="Lọc số sao"
          style={{ width: 140 }}
          value={filterRating}
          onChange={(val) => {
            setFilterRating(val);
            resetPagination();
          }}
          allowClear
        >
          <Option value={5}>5 Sao</Option>
          <Option value={4}>4 Sao</Option>
          <Option value={3}>3 Sao</Option>
          <Option value={2}>2 Sao</Option>
          <Option value={1}>1 Sao</Option>
        </Select>

        <Select
          placeholder="Trạng thái"
          style={{ width: 140 }}
          value={filterStatus}
          onChange={(val) => {
            setFilterStatus(val);
            resetPagination();
          }}
          allowClear
        >
          <Option value={1}>Hiển thị</Option>
          <Option value={0}>Đã ẩn</Option>
        </Select>

        <RangePicker
          style={{ borderRadius: "8px" }}
          format="DD/MM/YYYY"
          value={dateRange}
          onChange={(dates) => {
            setDateRange(dates);
            resetPagination();
          }}
          placeholder={["Từ ngày", "Đến ngày"]}
          allowClear
        />

        <Button
          type="primary"
          icon={<DownloadOutlined />}
          onClick={handleExportReport}
          loading={loadingExport}
          style={{ marginLeft: "auto", borderRadius: "8px" }}
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
            showSizeChanger: true,
          }}
          loading={loadingTable}
          onChange={handleTableChange}
          rowKey="MaDanhGia"
          scroll={{ x: "max-content" }}
        />
      </div>
    </div>
  );
};

export default AdminReviews;
