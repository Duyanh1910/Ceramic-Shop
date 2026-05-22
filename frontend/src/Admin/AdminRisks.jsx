import React, { useState, useEffect } from "react";
import {
  Table,
  Tag,
  Input,
  Button,
  Card,
  Space,
  Typography,
  Tooltip,
  Radio,
} from "antd";
import { SearchOutlined, AlertOutlined, EditOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import axios from "axios";

import styles from "./AdminRisks.module.css";


const API_BASE = "https://ceramic-shop-u8ak.onrender.com/api/v1";
const { Title, Text } = Typography;

const RiskList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [status, setStatus] = useState(undefined);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedRiskId, setSelectedRiskId] = useState(null);

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
      const res = await axios.get(`${API_BASE}/admin/after_sales/risks`, {
        params: {
          page,
          limit: 10,
          search: search?.toUpperCase().trim(),
          status,
        },
        ...axiosConfig,
      });

      const raw = res.data?.result?.data || [];
      const total = res.data?.result?.totalItems || 0;

      setData(normalizeData(raw));
      setTotalItems(total);
    } catch (err) {
      console.error("Lỗi khi tải danh sách rủi ro:", err);
    } finally {
      setLoading(false);
    }
  };

  const normalizeData = (rawData) => {
    return rawData.map((item) => {
      return {
        key: item.MaRuiRo,
        maRuiRo: item.MaRuiRo,
        loaiRuiRo: item.LoaiRuiRo,
        moTa: item.MoTa,
        trangThai: item.TrangThai,
        ngayPhatHien: item.NgayPhatHien,
        ghiChu: item.GhiChu,
        maHienThi: item.DonHang?.MaHienThi || "N/A",
      };
    });
  };

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
    setPage(1);
  };

  const handleViewDetail = (record) => {
    setSelectedRiskId(record.maRuiRo);
    setIsDetailModalOpen(true);
  };

  const handleTableChange = (pagination) => {
    setPage(pagination.current);
  };

  const columns = [
    {
      title: "Thông tin đơn hàng",
      key: "orderInfo",
      render: (_, record) => (
        <div className={styles["info-col-wrapper"]}>
          <Text strong style={{ color: "#1677ff" }}>
            {record.maHienThi}
          </Text>
          <div style={{ marginTop: 2 }}>
            <Text type="secondary" className={styles["info-code"]}>
              Mã RR: #{record.maRuiRo}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: "Chi tiết sự cố",
      key: "riskDetail",
      render: (_, record) => (
        <div className={styles["risk-col-wrapper"]}>
          <Text strong>{record.loaiRuiRo}</Text>
          <Text type="secondary" className={styles["risk-desc"]}>
            {record.moTa}
          </Text>
          {record.ghiChu && (
            <div style={{ marginTop: 6 }}>
              <Tooltip title={record.ghiChu}>
                <Tag color="blue" style={{ margin: 0, borderStyle: "dashed" }}>
                  Có ghi chú
                </Tag>
              </Tooltip>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Ngày ghi nhận",
      key: "date",
      render: (_, record) => (
        <Text>{dayjs(record.ngayPhatHien).format("DD/MM/YYYY HH:mm")}</Text>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "trangThai",
      key: "trangThai",
      render: (trangThai) => {
        if (trangThai === 0) return <Tag color="orange">Đang xử lý</Tag>;
        if (trangThai === 1) return <Tag color="green">Đã giải quyết</Tag>;
        if (trangThai === 2) return <Tag color="default">Không hợp lệ</Tag>;
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
          icon={<EditOutlined />}
          onClick={() => handleViewDetail(record)}
        >
          Xử lý
        </Button>
      ),
    },
  ];

  return (
    <Card
      bordered={false}
      className={styles["risk-card"]}
      title={
        <Space>
          <AlertOutlined style={{ color: "#faad14", fontSize: "20px" }} />
          <Title level={4} style={{ margin: 0 }}>
            Quản lý rủi ro & sự cố
          </Title>
        </Space>
      }
    >
      <div className={styles["risk-toolbar"]}>
        <Input
          placeholder="Tìm theo mã đơn hàng..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
          allowClear
          className={styles["risk-search-input"]}
        />

        <Radio.Group
          value={status}
          onChange={handleStatusChange}
          buttonStyle="solid"
        >
          <Radio.Button value={undefined}>Tất cả</Radio.Button>
          <Radio.Button value={0}>Đang xử lý</Radio.Button>
          <Radio.Button value={1}>Đã giải quyết</Radio.Button>
          <Radio.Button value={2}>Không hợp lệ</Radio.Button>
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
          showTotal: (total) => `Tổng số: ${total} sự cố`,
        }}
        rowClassName={(record) =>
          record.trangThai === 0 ? styles["row-pending"] : ""
        }
      />
    </Card>
  );
};

export default RiskList;
