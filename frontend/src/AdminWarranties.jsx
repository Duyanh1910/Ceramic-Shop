import React, { useState, useEffect } from "react";
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
  Badge,
} from "antd";
import {
  HistoryOutlined,
  SearchOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import axios from "axios";

import "./AdminWarranties.module.css";

const API_BASE = "https://ceramic-shop-u8ak.onrender.com/api/v1";
const { Title, Text } = Typography;

const WarrantyList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [status, setStatus] = useState(undefined);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedWarrantyId, setSelectedWarrantyId] = useState(null);

  const axiosConfig = { withCredentials: true };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (search !== searchInput) {
        setSearch(searchInput);
        setPage(1);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchInput, search]);

  useEffect(() => {
    fetchData();
  }, [page, search, status]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/admin/after_sales/warranties`, {
        params: {
          page,
          limit: 10,
          search,
          status,
        },
        ...axiosConfig,
      });

      const raw = res.data?.result?.data || [];
      const total = res.data?.result?.totalItems || 0;

      setData(normalizeData(raw));
      setTotalItems(total);
    } catch (err) {
      console.error("Lỗi khi tải danh sách:", err);
    } finally {
      setLoading(false);
    }
  };

  const normalizeData = (rawData) => {
    return rawData.map((item) => {
      const sp = item.ChiTietDonHang?.BienTheSanPham;
      return {
        key: item.MaBaoHanh,
        maBaoHanh: item.MaBaoHanh,
        ngayBatDau: item.NgayBatDau,
        ngayKetThuc: item.NgayKetThuc,
        trangThai: item.TrangThai,
        ghiChu: item.GhiChu,
        maDonHang: item.ChiTietDonHang?.DonHang?.MaHienThi || "N/A",
        tenSanPham: sp?.SanPham?.TenSanPham || "Sản phẩm không xác định",
        tenBienThe: sp?.TenBienThe || "",
        thumbnail: sp?.SanPham?.Thumbnail || "",
      };
    });
  };

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
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
            className="product-image"
          />
          <div className="product-col-wrapper">
            <div>
              <Text strong style={{ fontSize: "14px" }}>
                {record.tenSanPham}
              </Text>
            </div>

            <div style={{ marginTop: 2 }}>
              <Text type="secondary" className="product-variant">
                Phân loại: {record.tenBienThe}
              </Text>
            </div>

            {record.ghiChu && (
              <div style={{ marginTop: 6 }}>
                <Tooltip title={record.ghiChu}>
                  <Text
                    type="secondary"
                    ellipsis
                    className="product-note"
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
        <div className="info-col-wrapper">
          <Text strong style={{ color: "#1677ff" }}>
            {record.maDonHang}
          </Text>
          <div style={{ marginTop: 2 }}>
            <Text type="secondary" className="info-code">
              Mã BH: #{record.maBaoHanh}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: "Thời hạn bảo hành",
      key: "duration",
      render: (_, record) => (
        <div className="duration-col-wrapper">
          <div style={{ marginBottom: 4 }}>
            <span className="duration-start-label">Bắt đầu:</span>{" "}
            {dayjs(record.ngayBatDau).format("DD/MM/YYYY")}
          </div>
          <div>
            <span className="duration-end-label">Kết thúc:</span>{" "}
            {dayjs(record.ngayKetThuc).format("DD/MM/YYYY")}
          </div>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "trangThai",
      key: "trangThai",
      render: (trangThai) => {
        if (trangThai === 1) return <Tag color="green">Còn hiệu lực</Tag>;
        if (trangThai === 0) return <Tag color="red">Hết hạn</Tag>;
        if (trangThai === 2) return <Tag color="default">Đã hủy</Tag>;
        return <Tag>{trangThai}</Tag>;
      },
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
          Lịch sử
        </Button>
      ),
    },
  ];

  return (
    <Card
      bordered={false}
      className="warranty-card"
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
      {}
      <div className="warranty-toolbar">
        <Input
          placeholder="Tìm mã đơn hàng..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
          allowClear
          className="warranty-search-input"
        />

        <Radio.Group
          value={status}
          onChange={handleStatusChange}
          buttonStyle="solid"
        >
          <Radio.Button value={undefined}>Tất cả</Radio.Button>
          <Radio.Button value={1}>Còn hiệu lực</Radio.Button>
          <Radio.Button value={0}>Hết hạn</Radio.Button>
          <Radio.Button value={2}>Đã hủy</Radio.Button>
        </Radio.Group>
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
        rowClassName={(record) => (record.trangThai === 0 ? "row-expired" : "")}
      />

      {/* <WarrantyHistoryModal
        open={isHistoryModalOpen}
        maBaoHanh={selectedWarrantyId}
        onCancel={() => {
          setIsHistoryModalOpen(false);
          setSelectedWarrantyId(null);
        }}
      /> */}
    </Card>
  );
};

export default WarrantyList;
