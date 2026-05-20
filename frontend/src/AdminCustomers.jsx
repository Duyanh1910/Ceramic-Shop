import { useState, useEffect } from "react";
import {
  Table,
  Button,
  Input,
  Tag,
  Space,
  Avatar,
  Tooltip,
  message,
} from "antd";
import { SearchOutlined, EyeOutlined, ReloadOutlined } from "@ant-design/icons";
import axios from "axios";
import styles from "./AdminTable.module.css";

const API_BASE = "https://ceramic-shop-u8ak.onrender.com/api/v1";

export default function AdminCustomers() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const axiosConfig = { withCredentials: true };

  useEffect(() => {
    fetchData();
  }, [page, search]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_BASE}/admin/customers?page=${page}&limit=10&search=${search}`,
        axiosConfig,
      );
      setData(res.data?.result?.data || []);
      setTotal(res.data?.result?.total || 0);
    } catch {
      message.error("Không thể tải danh sách khách hàng!");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    setSearch(searchInput);
  };

  const handleReload = () => {
    setSearchInput("");
    if (search === "" && page === 1) {
      fetchData();
    } else {
      setSearch("");
      setPage(1);
    }
  };

  const columns = [
    {
      title: "Khách hàng",
      render: (_, row) => (
        <div className={styles.userCell}>
          <Avatar
            src={row.Avatar || null}
            className={styles.userAvatar}
            size={38}
          >
            {row.TenKhachHang?.[0] || "?"}
          </Avatar>
          <div>
            <div className={styles.userName}>{row.TenKhachHang || "—"}</div>
            <div className={styles.userSub}>{row.TaiKhoan?.Username}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Email",
      dataIndex: ["TaiKhoan", "Email"],
      render: (v) => <span className={styles.email}>{v}</span>,
    },
    {
      title: "Số điện thoại",
      dataIndex: "SDT",
      render: (v) => v || <span style={{ color: "#ccc" }}>Chưa cập nhật</span>,
    },
    {
      title: "Địa chỉ",
      dataIndex: "DiaChi",
      width: 350,
      ellipsis: true,
      render: (v) => (
        <Tooltip title={v} placement="topLeft">
          <span
            className={styles.address}
            style={{
              display: "block",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {v || <span style={{ color: "#ccc" }}>Chưa cập nhật</span>}
          </span>
        </Tooltip>
      ),
    },
  ];

  return (
    <div className={styles.wrapper}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Quản lý khách hàng</h1>
          <p className={styles.pageSub}>Tổng cộng {total} khách hàng</p>
        </div>
      </div>

      <div className={styles.toolbar}>
        <Input
          prefix={<SearchOutlined />}
          placeholder="Tìm theo tên, email, số điện thoại..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onPressEnter={handleSearch}
          className={styles.searchInput}
          allowClear
          onClear={handleReload}
        />
        <Button
          icon={<SearchOutlined />}
          onClick={handleSearch}
          className={styles.btnSearch}
        >
          Tìm kiếm
        </Button>
        <Button icon={<ReloadOutlined />} onClick={handleReload} />
      </div>

      <div className={styles.tableCard}>
        <Table
          dataSource={data}
          columns={columns}
          rowKey="MaKhachHang"
          loading={loading}
          className={styles.table}
          pagination={{
            current: page,
            pageSize: 10,
            total,
            onChange: setPage,
            showTotal: (t) => `Tổng ${t} khách hàng`,
            showSizeChanger: false,
          }}
          size="middle"
          locale={{ emptyText: "Không có dữ liệu" }}
        />
      </div>
    </div>
  );
}
