import { useState, useEffect } from "react";
import {
  Table,
  Tag,
  Input,
  Button,
  Card,
  Space,
  Typography,
  Image,
  Tooltip,
  Radio,
  message,
} from "antd";
import {
  HistoryOutlined,
  SearchOutlined,
  SafetyCertificateOutlined,
  ReloadOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import axios from "axios";
import { useSearchParams } from "react-router-dom";

import { exportExcelReport } from "../Utility/excelExport";
import styles from "./AdminWarranties.module.css";
import WarrantyHistory from "./AdminWarrantyHistory";
import { API_BASE } from "../config/api";

const { Title, Text } = Typography;
const ALL_STATUS = "all";

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

const renderWarrantyStatus = (status) => {
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

const WarrantyList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const warrantyIdParam = searchParams.get("warrantyId");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingExport, setLoadingExport] = useState(false);
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [status, setStatus] = useState(ALL_STATUS);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedWarrantyId, setSelectedWarrantyId] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== searchInput) {
        setSearch(searchInput);
        setPage(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput, search]);

  useEffect(() => {
    fetchData();
  }, [page, search, status]);

  useEffect(() => {
    if (!warrantyIdParam) return;

    setSearchInput(warrantyIdParam);
    setSearch(warrantyIdParam);
    setStatus(ALL_STATUS);
    setPage(1);
    setSelectedWarrantyId(warrantyIdParam);
    setIsHistoryModalOpen(true);
  }, [warrantyIdParam]);

  const fetchData = async () => {
    setLoading(true);

    try {
      const res = await axios.get(`${API_BASE}/admin/after_sales/warranties`, {
        params: {
          page,
          limit: 10,
          search: search.trim(),
          status: status === ALL_STATUS ? undefined : status,
        },
        ...authConfig(),
      });

      const raw = res.data?.result?.data || [];
      const total = res.data?.result?.totalItems || 0;

      setData(normalizeData(raw));
      setTotalItems(total);
    } catch (err) {
      message.error(
        err.response?.data?.message || "Không thể tải danh sách bảo hành!",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = async () => {
    try {
      setLoadingExport(true);

      await exportExcelReport({
        url: `${API_BASE}/admin/after_sales/warranties/export`,
        params: {
          search: search.trim(),
          status: status !== ALL_STATUS ? status : undefined,
        },
        axiosConfig: authConfig(),
        fileName: `Bao_Cao_Bao_Hanh_${dayjs().format("DDMMYYYY_HHmm")}.xlsx`,
      });

      message.success("Tải báo cáo bảo hành thành công!");
    } catch (error) {
      console.error(error);
      message.error("Có lỗi xảy ra khi tải báo cáo Excel!");
    } finally {
      setLoadingExport(false);
    }
  };

  const normalizeData = (rawData) => {
    return rawData.map((item) => {
      const orderDetail = item.ChiTietDonHang;
      const variant = orderDetail?.BienTheSanPham;
      const product = variant?.SanPham;
      const order = orderDetail?.DonHang;

      return {
        key: item.MaBaoHanh,
        maBaoHanh: item.MaBaoHanh,
        ngayBatDau: item.NgayBatDau,
        ngayKetThuc: item.NgayKetThuc,
        trangThai: item.TrangThai,
        ghiChu: item.GhiChu,
        maDonHang: order?.MaHienThi || "N/A",
        tenNguoiNhan: order?.TenNguoiNhan || "Không rõ",
        sdt: order?.SDT || "Không rõ",
        tenSanPham: product?.TenSanPham || "Sản phẩm không xác định",
        tenBienThe: variant?.TenBienThe || "",
        thumbnail: product?.Thumbnail || "",
      };
    });
  };

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
    setPage(1);
  };

  const handleReload = () => {
    setSearchInput("");

    if (search === "" && status === ALL_STATUS && page === 1) {
      fetchData();
      return;
    }

    setSearch("");
    setStatus(ALL_STATUS);
    setPage(1);
  };

  const handleViewHistory = (record) => {
    setSelectedWarrantyId(record.maBaoHanh);
    setIsHistoryModalOpen(true);
  };

  const handleTableChange = (pagination) => {
    setPage(pagination.current);
  };

  const columns = [
    {
      title: "Sản phẩm",
      key: "product",
      render: (_, record) => (
        <Space align="start">
          <Image
            width={64}
            height={64}
            src={record.thumbnail}
            fallback="https://via.placeholder.com/64"
            className={styles["product-image"]}
          />

          <div className={styles["product-col-wrapper"]}>
            <div>
              <Text strong style={{ fontSize: "14px" }}>
                {record.tenSanPham}
              </Text>
            </div>

            <div style={{ marginTop: 2 }}>
              <Text type="secondary" className={styles["product-variant"]}>
                Phân loại: {record.tenBienThe}
              </Text>
            </div>

            {record.ghiChu && (
              <div style={{ marginTop: 6 }}>
                <Tooltip title={record.ghiChu}>
                  <Text
                    type="secondary"
                    ellipsis
                    className={styles["product-note"]}
                    style={{ margin: 0 }}
                  >
                    {record.ghiChu}
                  </Text>
                </Tooltip>
              </div>
            )}
          </div>
        </Space>
      ),
    },
    {
      title: "Thông tin phiếu",
      key: "info",
      render: (_, record) => (
        <div className={styles["info-col-wrapper"]}>
          <Text strong style={{ color: "#1677ff" }}>
            {record.maDonHang}
          </Text>

          <div style={{ marginTop: 2 }}>
            <Text type="secondary" className={styles["info-code"]}>
              Mã BH: #{record.maBaoHanh}
            </Text>
          </div>

          <div style={{ marginTop: 2 }}>
            <Text type="secondary" className={styles["info-code"]}>
              Khách: {record.tenNguoiNhan}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: "Thời hạn bảo hành",
      key: "duration",
      render: (_, record) => (
        <div className={styles["duration-col-wrapper"]}>
          <div style={{ marginBottom: 4 }}>
            <span className={styles["duration-start-label"]}>Bắt đầu:</span>{" "}
            {dayjs(record.ngayBatDau).format("DD/MM/YYYY")}
          </div>

          <div>
            <span className={styles["duration-end-label"]}>Kết thúc:</span>{" "}
            {dayjs(record.ngayKetThuc).format("DD/MM/YYYY")}
          </div>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "trangThai",
      key: "trangThai",
      render: renderWarrantyStatus,
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Button
          type="primary"
          ghost
          size="small"
          icon={<HistoryOutlined />}
          onClick={() => handleViewHistory(record)}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  return (
    <Card
      bordered={false}
      className={styles["warranty-card"]}
      title={
        <Space>
          <SafetyCertificateOutlined
            style={{ color: "#1677ff", fontSize: "20px" }}
          />
          <Title level={4} style={{ margin: 0 }}>
            Quản lý bảo hành
          </Title>
        </Space>
      }
    >
      <div className={styles["warranty-toolbar"]}>
        <Input
          placeholder="Tìm mã đơn hàng, tên khách hoặc số điện thoại..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
          allowClear
          className={styles["warranty-search-input"]}
        />

        <Space wrap>
          <Radio.Group
            value={status}
            onChange={handleStatusChange}
            buttonStyle="solid"
          >
            <Radio.Button value={ALL_STATUS}>Tất cả</Radio.Button>
            <Radio.Button value={WARRANTY_STATUS.ACTIVE}>
              Còn hiệu lực
            </Radio.Button>
            <Radio.Button value={WARRANTY_STATUS.REQUESTED}>
              Đang yêu cầu
            </Radio.Button>
            <Radio.Button value={WARRANTY_STATUS.PROCESSING}>
              Đang xử lý
            </Radio.Button>
            <Radio.Button value={WARRANTY_STATUS.COMPLETED}>
              Hoàn tất
            </Radio.Button>
            <Radio.Button value={WARRANTY_STATUS.REJECTED}>
              Từ chối
            </Radio.Button>
            <Radio.Button value={WARRANTY_STATUS.EXPIRED}>Hết hạn</Radio.Button>
          </Radio.Group>

          <Button icon={<ReloadOutlined />} onClick={handleReload}>
            Tải lại
          </Button>

          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleExportReport}
            loading={loadingExport}
          >
            Xuất báo cáo
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        onChange={handleTableChange}
        pagination={{
          current: page,
          pageSize: 10,
          total: totalItems,
          showSizeChanger: false,
          showTotal: (total) => `Tổng số: ${total} phiếu`,
        }}
        rowClassName={(record) =>
          Number(record.trangThai) === WARRANTY_STATUS.EXPIRED
            ? styles["row-expired"]
            : ""
        }
      />

      <WarrantyHistory
        open={isHistoryModalOpen}
        maBaoHanh={selectedWarrantyId}
        onUpdated={fetchData}
        onCancel={() => {
          setIsHistoryModalOpen(false);
          setSelectedWarrantyId(null);

          if (warrantyIdParam) {
            setSearchParams({});
          }
        }}
      />
    </Card>
  );
};

export default WarrantyList;
