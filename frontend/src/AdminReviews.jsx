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
  const [productName, setProductName] = useState("");
  const [variantName, setVariantName] = useState("");
  const [filterRating, setFilterRating] = useState(null);
  const [filterStatus, setFilterStatus] = useState(null);
  const [dateRange, setDateRange] = useState(null);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const fetchData = useCallback(
    async (
      page = 1,
      limit = 10,
      search = "",
      rating,
      status,
      dates,
      product = "",
      variant = "",
    ) => {
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
          ...(product && { productName: product }),
          ...(variant && { variantName: variant }),
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
          setData(response.data.result.data || []);
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
        productName,
        variantName,
      );
    }, 500);

    return () => clearTimeout(timer);
  }, [
    fetchData,
    pagination.current,
    pagination.pageSize,
    searchText,
    productName,
    variantName,
    filterRating,
    filterStatus,
    dateRange,
  ]);

  const handleTableChange = (newPagination) => {
    setPagination((prev) => ({
      ...prev,
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    }));
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
        ...(productName && { productName }),
        ...(variantName && { variantName }),
        ...(filterRating !== null &&
          filterRating !== undefined && { rating: filterRating }),
        ...(filterStatus !== null &&
          filterStatus !== undefined && { status: filterStatus }),
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
      console.error("Lỗi khi xuất báo cáo:", error);
      message.error("Có lỗi xảy ra khi tải file!");
    } finally {
      setLoadingExport(false);
    }
  };

  const getOrderDetail = (record) => {
    return (
      record.ChiTietDonHang ||
      record.OrderDetail ||
      record.OrderDetailModel ||
      record.orderDetail ||
      {}
    );
  };

  const getVariant = (record) => {
    const orderDetail = getOrderDetail(record);

    return (
      orderDetail.BienTheSanPham ||
      orderDetail.Variant ||
      orderDetail.VariantModel ||
      orderDetail.variant ||
      {}
    );
  };

  const getProduct = (record) => {
    const variant = getVariant(record);

    return (
      variant.SanPham ||
      variant.Product ||
      variant.ProductModel ||
      variant.product ||
      {}
    );
  };

  const getOrder = (record) => {
    const orderDetail = getOrderDetail(record);

    return (
      orderDetail.DonHang ||
      orderDetail.Order ||
      orderDetail.OrderModel ||
      orderDetail.order ||
      {}
    );
  };

  const columns = [
    {
      title: "Mã ĐG",
      dataIndex: "MaDanhGia",
      key: "MaDanhGia",
      width: 80,
      align: "center",
    },
    {
      title: "Khách hàng",
      key: "KhachHang",
      width: 180,
      render: (_, record) => {
        const customer =
          record.KhachHang ||
          record.Customer ||
          record.CustomerModel ||
          record.customer ||
          {};

        return customer.TenKhachHang || "Khách ẩn danh";
      },
    },
    {
      title: "Sản phẩm",
      key: "SanPham",
      width: 280,
      render: (_, record) => {
        const variant = getVariant(record);
        const product = getProduct(record);

        return (
          <div>
            <div style={{ fontWeight: 600, color: "#173B63" }}>
              {product.TenSanPham || "N/A"}
            </div>
            <div style={{ fontSize: "12px", color: "#888", marginTop: 4 }}>
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
      align: "center",
      render: (diem) => (
        <Rate disabled value={Number(diem) || 0} style={{ fontSize: 14 }} />
      ),
    },
    {
      title: "Nội dung",
      dataIndex: "NoiDung",
      key: "NoiDung",
      width: 320,
      render: (text) => (
        <Tooltip title={text || "Không có nội dung"}>
          <div
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: 300,
            }}
          >
            {text || (
              <span style={{ color: "#aaa", fontStyle: "italic" }}>
                Không có nội dung
              </span>
            )}
          </div>
        </Tooltip>
      ),
    },
    {
      title: "Mã đơn hàng",
      key: "MaDonHang",
      width: 150,
      align: "center",
      render: (_, record) => {
        const order = getOrder(record);
        return order.MaHienThi || order.MaDonHang || "N/A";
      },
    },
    {
      title: "Ngày đánh giá",
      key: "NgayDanhGia",
      width: 170,
      align: "center",
      render: (_, record) => {
        const date = record.NgayDanhGia || record.NgayGui || record.createdAt;
        return date ? dayjs(date).format("DD/MM/YYYY HH:mm") : "N/A";
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "TrangThai",
      key: "TrangThai",
      width: 120,
      align: "center",
      render: (status) => {
        return Number(status) === 1 ? (
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
          style={{ width: 240, borderRadius: "8px" }}
          value={searchText}
          onChange={(e) => {
            setSearchText(e.target.value);
            resetPagination();
          }}
          allowClear
        />

        <Input
          placeholder="Lọc theo tên sản phẩm..."
          prefix={<SearchOutlined />}
          style={{ width: 240, borderRadius: "8px" }}
          value={productName}
          onChange={(e) => {
            setProductName(e.target.value);
            resetPagination();
          }}
          allowClear
        />

        <Input
          placeholder="Lọc theo tên biến thể..."
          prefix={<SearchOutlined />}
          style={{ width: 220, borderRadius: "8px" }}
          value={variantName}
          onChange={(e) => {
            setVariantName(e.target.value);
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
            showTotal: (total) => `Tổng ${total} đánh giá`,
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
