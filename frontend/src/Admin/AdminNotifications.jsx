import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge, Empty, Input, Pagination, Select, Tabs } from "antd";
import axios from "axios";
import {
  BellOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  SafetyOutlined,
  SearchOutlined,
  ShopOutlined,
  SwapOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import {
  normalizeAdminNotificationPayload,
  resolveAdminNotificationRedirect,
} from "../Utility/socket.js";
import styles from "./AdminNotifications.module.css";

const STORAGE_KEY = "admin_notifications";
const PAGE_SIZE = 12;
const API_BASE = "https://ceramic-shop-u8ak.onrender.com/api/v1";

const EVENT_META = {
  ORDER_CREATED: {
    label: "Đơn mới",
    icon: <ShopOutlined />,
    color: "#2563eb",
    bg: "rgba(37, 99, 235, 0.1)",
  },
  ORDER_STATUS_UPDATED: {
    label: "Cập nhật đơn",
    icon: <CheckCircleOutlined />,
    color: "#059669",
    bg: "rgba(5, 150, 105, 0.1)",
  },
  ORDER_CANCELED: {
    label: "Hủy đơn",
    icon: <CloseCircleOutlined />,
    color: "#dc2626",
    bg: "rgba(220, 38, 38, 0.1)",
  },
  WARRANTY_REQUESTED: {
    label: "Bảo hành mới",
    icon: <SafetyOutlined />,
    color: "#7c3aed",
    bg: "rgba(124, 58, 237, 0.1)",
  },
  WARRANTY_STATUS_UPDATED: {
    label: "Bảo hành",
    icon: <SafetyOutlined />,
    color: "#7c3aed",
    bg: "rgba(124, 58, 237, 0.1)",
  },
  RISK_CREATED: {
    label: "Rủi ro mới",
    icon: <WarningOutlined />,
    color: "#e11d48",
    bg: "rgba(225, 29, 72, 0.1)",
  },
  RISK_STATUS_UPDATED: {
    label: "Rủi ro",
    icon: <WarningOutlined />,
    color: "#e11d48",
    bg: "rgba(225, 29, 72, 0.1)",
  },
  RETURN_REQUESTED: {
    label: "Đổi trả mới",
    icon: <SwapOutlined />,
    color: "#d97706",
    bg: "rgba(217, 119, 6, 0.12)",
  },
  RETURN_STATUS_UPDATED: {
    label: "Đổi trả",
    icon: <SwapOutlined />,
    color: "#d97706",
    bg: "rgba(217, 119, 6, 0.12)",
  },
};

const getEventMeta = (type) =>
  EVENT_META[type] || {
    label: "Khác",
    icon: <BellOutlined />,
    color: "#c48c46",
    bg: "rgba(196, 140, 70, 0.12)",
  };

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const timeAgo = (dateStr) => {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "Không rõ thời gian";

  const diff = Date.now() - date.getTime();
  const m = Math.floor(diff / 60000);

  if (m < 1) return "Vừa xong";
  if (m < 60) return `${m} phút trước`;

  const h = Math.floor(m / 60);
  if (h < 24) return `${h} giờ trước`;

  const d = Math.floor(h / 24);
  if (d < 30) return `${d} ngày trước`;

  return formatDate(dateStr);
};

const loadAll = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
};

const saveAll = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data.slice(0, 200)));
  } catch {
    // ignore
  }
};

export default function AdminNotifications() {
  const navigate = useNavigate();

  const [all, setAll] = useState(() => loadAll());
  const [activeTab, setActiveTab] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const fetchNotifications = useCallback(async () => {
    try {
      const params = new URLSearchParams({ page: "1", limit: "200" });

      if (activeTab === "unread") params.set("status", "0");
      if (typeFilter !== "all") params.set("type", typeFilter);

      const res = await axios.get(
        `${API_BASE}/admin/notifications?${params.toString()}`,
        { withCredentials: true },
      );

      const rows = res.data?.result?.data || [];

      setAll(
        rows.map((item) =>
          normalizeAdminNotificationPayload({
            ...item,
            isRead: Number(item.DaDoc) === 1,
          }),
        ),
      );
    } catch (err) {
      console.warn("Cannot load admin notifications:", err.message);
    }
  }, [activeTab, typeFilter]);

  useEffect(() => {
    fetchNotifications();

    const intervalId = window.setInterval(fetchNotifications, 5000);
    return () => window.clearInterval(intervalId);
  }, [fetchNotifications]);

  useEffect(() => {
    saveAll(all);
  }, [all]);

  useEffect(() => {
    const handler = (e) => {
      const item = e.detail;
      if (!item) return;

      setAll((prev) =>
        [item, ...prev.filter((n) => n.id !== item.id)].slice(0, 200),
      );
    };

    window.addEventListener("admin:new_notification", handler);
    return () => window.removeEventListener("admin:new_notification", handler);
  }, []);

  useEffect(() => {
    setPage(1);
  }, [activeTab, typeFilter, search]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return all.filter((n) => {
      if (activeTab === "unread" && n.isRead) return false;
      if (typeFilter !== "all" && n.type !== typeFilter) return false;

      if (!q) return true;

      return (
        n.title?.toLowerCase().includes(q) ||
        n.message?.toLowerCase().includes(q) ||
        getEventMeta(n.type).label.toLowerCase().includes(q)
      );
    });
  }, [all, activeTab, typeFilter, search]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const unreadCount = all.filter((n) => !n.isRead).length;
  const readCount = all.length - unreadCount;

  const markAllRead = async () => {
    try {
      const suffix =
        typeFilter !== "all" ? `?type=${encodeURIComponent(typeFilter)}` : "";

      await axios.patch(
        `${API_BASE}/admin/notifications/read-all${suffix}`,
        {},
        { withCredentials: true },
      );
    } catch (err) {
      console.warn("Cannot mark notifications as read:", err.message);
    }

    setAll((prev) =>
      prev.map((n) =>
        typeFilter === "all" || n.type === typeFilter
          ? { ...n, isRead: true }
          : n,
      ),
    );
  };

  const clearAll = async () => {
    try {
      const params = new URLSearchParams();

      if (typeFilter !== "all") params.set("type", typeFilter);
      if (activeTab === "unread") params.set("status", "0");

      const suffix = params.toString() ? `?${params.toString()}` : "";

      await axios.delete(`${API_BASE}/admin/notifications${suffix}`, {
        withCredentials: true,
      });
    } catch (err) {
      console.warn("Cannot delete notifications:", err.message);
    }

    setAll((prev) =>
      prev.filter((n) => {
        const matchType = typeFilter === "all" || n.type === typeFilter;
        const matchStatus = activeTab !== "unread" || !n.isRead;
        return !(matchType && matchStatus);
      }),
    );
  };

  const handleItemClick = async (item) => {
    if (Number.isInteger(Number(item.id))) {
      try {
        await axios.patch(
          `${API_BASE}/admin/notifications/${item.id}/read`,
          {},
          { withCredentials: true },
        );
      } catch (err) {
        console.warn("Cannot mark notification as read:", err.message);
      }
    }

    setAll((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n)),
    );

    navigate(resolveAdminNotificationRedirect(item));
  };

  const deleteItem = async (e, id) => {
    e.stopPropagation();

    if (Number.isInteger(Number(id))) {
      try {
        await axios.delete(`${API_BASE}/admin/notifications/${id}`, {
          withCredentials: true,
        });
      } catch (err) {
        console.warn("Cannot delete notification:", err.message);
      }
    }

    setAll((prev) => prev.filter((n) => n.id !== id));
  };

  const handleKeyOpen = (e, item) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleItemClick(item);
    }
  };

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div>
          <div className={styles.kicker}>
            <BellOutlined />
            Trung tâm thông báo
          </div>
          <h1 className={styles.pageTitle}>Thông báo quản trị</h1>
          <p className={styles.pageDesc}>
            Theo dõi đơn hàng, bảo hành, đổi trả và các cảnh báo mới nhất trong
            hệ thống.
          </p>
        </div>

        <div className={styles.heroStats}>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>{all.length}</span>
            <span className={styles.statLabel}>Tổng</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>{unreadCount}</span>
            <span className={styles.statLabel}>Chưa đọc</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>{readCount}</span>
            <span className={styles.statLabel}>Đã đọc</span>
          </div>
        </div>
      </section>

      <section className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <Input
            prefix={<SearchOutlined className={styles.searchIcon} />}
            placeholder="Tìm theo tiêu đề, nội dung hoặc loại thông báo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
            className={styles.searchInput}
          />
        </div>

        <Select
          value={typeFilter}
          onChange={setTypeFilter}
          className={styles.typeSelect}
          options={[
            { value: "all", label: "Tất cả loại" },
            ...Object.entries(EVENT_META).map(([key, m]) => ({
              value: key,
              label: m.label,
            })),
          ]}
        />

        <div className={styles.actionGroup}>
          {unreadCount > 0 && (
            <button className={styles.markAllBtn} onClick={markAllRead}>
              Đánh dấu đã đọc
            </button>
          )}

          {filtered.length > 0 && (
            <button className={styles.clearAllBtn} onClick={clearAll}>
              <DeleteOutlined />
              Xóa đang lọc
            </button>
          )}
        </div>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            className={styles.tabs}
            items={[
              {
                key: "all",
                label: <span>Tất cả ({all.length})</span>,
              },
              {
                key: "unread",
                label: (
                  <span className={styles.tabLabel}>
                    Chưa đọc
                    {unreadCount > 0 && (
                      <Badge count={unreadCount} size="small" />
                    )}
                  </span>
                ),
              },
            ]}
          />

          <span className={styles.resultCount}>
            Hiển thị {filtered.length} thông báo
          </span>
        </div>

        {paginated.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              search || typeFilter !== "all" || activeTab === "unread"
                ? "Không tìm thấy thông báo phù hợp"
                : "Chưa có thông báo nào"
            }
            className={styles.empty}
          />
        ) : (
          <div className={styles.list}>
            {paginated.map((item) => {
              const meta = getEventMeta(item.type);

              return (
                <div
                  key={item.id}
                  className={`${styles.item} ${
                    !item.isRead ? styles.itemUnread : ""
                  }`}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleItemClick(item)}
                  onKeyDown={(e) => handleKeyOpen(e, item)}
                >
                  <span
                    className={styles.iconWrap}
                    style={{ background: meta.bg, color: meta.color }}
                  >
                    {meta.icon}
                  </span>

                  <div className={styles.itemBody}>
                    <div className={styles.itemTop}>
                      <h3 className={styles.itemTitle}>
                        {item.title || "Thông báo"}
                      </h3>

                      <span
                        className={styles.itemType}
                        style={{ color: meta.color, background: meta.bg }}
                      >
                        {meta.label}
                      </span>

                      {!item.isRead && (
                        <span className={styles.newBadge}>Mới</span>
                      )}
                    </div>

                    <p className={styles.itemMsg}>
                      {item.message || "Không có nội dung thông báo."}
                    </p>

                    <div className={styles.itemMeta}>
                      <span>{timeAgo(item.createdAt)}</span>
                      <span className={styles.dotDivider}>•</span>
                      <span>{formatDate(item.createdAt)}</span>
                    </div>
                  </div>

                  <button
                    className={styles.deleteBtn}
                    onClick={(e) => deleteItem(e, item.id)}
                    title="Xóa thông báo này"
                    aria-label="Xóa thông báo này"
                  >
                    <DeleteOutlined />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {filtered.length > PAGE_SIZE && (
        <div className={styles.paginationWrap}>
          <Pagination
            current={page}
            total={filtered.length}
            pageSize={PAGE_SIZE}
            onChange={setPage}
            showSizeChanger={false}
            showTotal={(total) => `${total} thông báo`}
          />
        </div>
      )}
    </div>
  );
}
