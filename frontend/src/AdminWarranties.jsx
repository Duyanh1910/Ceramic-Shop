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
} from "antd";
import { HistoryOutlined, SearchOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import axios from "axios";

//import WarrantyHistoryModal from "./WarrantyHistoryModal";
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

  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedWarrantyId, setSelectedWarrantyId] = useState(null);

  const axiosConfig = { withCredentials: true };

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

  useEffect(() => {
    fetchData();
  }, [page, search]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_BASE}/admin/after_sales/warranties?page=${page}&limit=10&search=${search}`,
        axiosConfig,
      );

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

  const handleSearch = () => {
    setPage(1);
    setSearch(searchInput);
  };

  const handleViewHistory = (record) => {
    setSelectedWarrantyId(record.maBaoHanh);
    setIsHistoryModalOpen(true);
  };

  const columns = [
    {
      title: "Sản phẩm",
      key: "product",
      render: (_, record) => (
        <Space align="start">
          <Image
            width={60}
            height={60}
            src={record.thumbnail}
            fallback="https://via.placeholder.com/60"
            className="product-image"
          />
          <div className="product-col-wrapper">
            <Text strong>{record.tenSanPham}</Text>
            <Text type="secondary" className="product-variant">
              Phân loại: {record.tenBienThe}
            </Text>
            {record.ghiChu && (
              <Tooltip title={record.ghiChu}>
                <Text type="secondary" ellipsis className="product-note">
                  {record.ghiChu}
                </Text>
              </Tooltip>
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
          <Text strong>ĐH: {record.maDonHang}</Text>
          <Text type="secondary" className="info-code">
            Mã BH: #{record.maBaoHanh}
          </Text>
        </div>
      ),
    },
    {
      title: "Thời hạn bảo hành",
      key: "duration",
      render: (_, record) => (
        <div className="duration-col-wrapper">
          <div>
            <span className="duration-start-label">Từ:</span>{" "}
            {dayjs(record.ngayBatDau).format("DD/MM/YYYY")}
          </div>
          <div>
            <span className="duration-end-label">Đến:</span>{" "}
            {dayjs(record.ngayKetThuc).format("DD/MM/YYYY")}
          </div>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "trangThai",
      key: "trangThai",
      render: (trangThai) => (
        <Tag color={trangThai === 1 ? "green" : "red"}>
          {trangThai === 1 ? "Còn hiệu lực" : "Hết hạn"}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Button
          type="primary"
          ghost
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
      title={
        <Title level={4} style={{ margin: 0 }}>
          Danh sách bảo hành
        </Title>
      }
      bordered={false}
      className="warranty-card"
    >
      <div className="warranty-header-action">
        <Text type="secondary">
          Quản lý và tra cứu thông tin bảo hành của khách hàng
        </Text>
        <Input
          placeholder="Nhập mã đơn hàng..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onPressEnter={handleSearch}
          suffix={
            <SearchOutlined
              style={{ cursor: "pointer", color: "#1677ff" }}
              onClick={handleSearch}
            />
          }
          className="warranty-search-input"
        />
      </div>

      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={{
          current: page,
          pageSize: 10,
          total: totalItems,
          showSizeChanger: false,
          onChange: (p) => setPage(p),
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
