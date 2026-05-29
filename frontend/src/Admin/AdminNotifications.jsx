import {useCallback, useEffect, useState, useMemo} from "react";
import {useNavigate} from "react-router-dom";
import {Badge, Empty, Input, Pagination, Select, Tabs} from "antd";
import axios from "axios";
import {BellOutlined, CheckCircleOutlined, CloseCircleOutlined, DeleteOutlined, SafetyOutlined, SearchOutlined, ShopOutlined, SwapOutlined, WarningOutlined} from "@ant-design/icons";
import styles from "./AdminNotifications.module.css";
const STORAGE_KEY = "admin_notifications";
const PAGE_SIZE = 15;
const API_BASE = "https://ceramic-shop-u8ak.onrender.com/api/v1";
const EVENT_META = {
    ORDER_CREATED:{
        label:"Đơn mới",
        icon:<ShopOutlined/>,
        color: "#3b82f6",
        bg: "rgba(59,130,246,0.10)",
    },
    ORDER_STATUS_UPDATED:{
        label:"Cập nhật đơn",
        icon:<CheckCircleOutlined/>,
        color: "#10b981",
        bg: "rgba(16,185,129,0.10)",
    },
    ORDER_CANCELED:{
        label:"Hủy đơn",
        icon:<CloseCircleOutlined/>,
        color: "#ef4444",
        bg: "rgba(239,68,68,0.10)",
    },
    WARRANTY_REQUESTED:{
        label:"Bảo hành mới",
        icon:<SafetyOutlined/>,
        color: "#7c3aed",
        bg: "rgba(124,58,237,0.10)",
    },
    WARRANTY_STATUS_UPDATED:{
        label:"Bảo hành",
        icon:<SafetyOutlined/>,
        color: "#7c3aed",
        bg: "rgba(124,58,237,0.10)",
    },
    RISK_CREATED:{
        label:"Rủi ro mới",
        icon:<WarningOutlined/>,
        color: "#dc2626",
        bg: "rgba(220,38,38,0.10)",
    },
    RISK_STATUS_UPDATED:{
        label:"Rủi ro",
        icon:<WarningOutlined/>,
        color: "#dc2626",
        bg: "rgba(220,38,38,0.10)",
    },
    RETURN_REQUESTED:{
        label:"Đổi trả mới",
        icon:<SwapOutlined/>,
        color: "#f59e0b",
        bg: "rgba(245,158,11,0.10)",
    },
    RETURN_STATUS_UPDATED:{
        label:"Đổi trả",
        icon:<SwapOutlined/>,
        color: "#f59e0b",
        bg: "rgba(245,158,11,0.10)",
    },
};
const getEventMeta = (type) =>
    EVENT_META[type] ||{
        label:"Khác",
        icon:<BellOutlined/>,
        color: "#c48c46",
        bg: "rgba(196,140,70,0.10)",
    };
const formatDate = (dateStr) => 
    new Date(dateStr).toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff/60000);
    if(m<1) return "Vừa xong";
    if(m<60) return `${m} phút trước`;
    const h = Math.floor(m/60);
    if(h<24) return `${h} giờ trước`;
    const d = Math.floor(h/24);
    return `${d} ngày trước`;
};
const loadAll = () => {
    try{
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    }
    catch(e){
        return [];
    }
};
const saveAll = (data) => {
    try{
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
    catch{}
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

      const res = await axios.get(`${API_BASE}/admin/notifications?${params.toString()}`, {
        withCredentials: true,
      });
      const rows = res.data?.result?.data || [];

      setAll(
        rows.map((item) => ({
          id: item.MaThongBao,
          type: item.LoaiThongBao,
          title: item.TieuDe,
          message: item.NoiDung,
          redirectUrl: item.DuongDan || "/admin/notifications",
          isRead: Number(item.DaDoc) === 1,
          createdAt: item.NgayTao,
        })),
      );
    } catch (err) {
      console.warn("Cannot load admin notifications:", err.message);
    }
  }, [activeTab, typeFilter]);

  // sync state → localStorage
  useEffect(() => { saveAll(all); }, [all]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // lắng nghe thông báo mới từ AdminLayout (khi đang ở trang này)
  useEffect(() => {
    const handler = (e) => {
      const item = e.detail;
      if (!item) return;
      setAll((prev) => [item, ...prev.filter((n) => n.id !== item.id)].slice(0, 200));
    };
    window.addEventListener("admin:new_notification", handler);
    return () => window.removeEventListener("admin:new_notification", handler);
  }, []);

  // reset trang khi đổi filter
  useEffect(() => { setPage(1); }, [activeTab, typeFilter, search]);

  // ── Lọc & tìm kiếm ────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return all.filter((n) => {
      if (activeTab === "unread" && n.isRead) return false;
      if (typeFilter !== "all" && n.type !== typeFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          n.title?.toLowerCase().includes(q) ||
          n.message?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [all, activeTab, typeFilter, search]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const unreadCount = all.filter((n) => !n.isRead).length;

  // ── Actions ────────────────────────────────────────────────────────
  const markAllRead = async () => {
    try {
      const suffix = typeFilter !== "all" ? `?type=${encodeURIComponent(typeFilter)}` : "";
      await axios.patch(`${API_BASE}/admin/notifications/read-all${suffix}`, {}, { withCredentials: true });
    } catch (err) {
      console.warn("Cannot mark notifications as read:", err.message);
    }
    setAll((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const clearAll = () => {
    setAll([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const handleItemClick = async (item) => {
    if (Number.isInteger(Number(item.id))) {
      try {
        await axios.patch(`${API_BASE}/admin/notifications/${item.id}/read`, {}, { withCredentials: true });
      } catch (err) {
        console.warn("Cannot mark notification as read:", err.message);
      }
    }
    setAll((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
    );
    navigate(item.redirectUrl);
  };

  const deleteItem = (e, id) => {
    e.stopPropagation();
    setAll((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className={styles.page}>
      {/* ── Heading ── */}
      <div className={styles.pageHeader}>
        <div className={styles.pageTitleWrap}>
          <BellOutlined className={styles.pageTitleIcon} />
          <h1 className={styles.pageTitle}>Thông báo</h1>
          {unreadCount > 0 && (
            <span className={styles.headerBadge}>{unreadCount} chưa đọc</span>
          )}
        </div>
        <div className={styles.pageActions}>
          {unreadCount > 0 && (
            <button className={styles.markAllBtn} onClick={markAllRead}>
              Đánh dấu tất cả đã đọc
            </button>
          )}
          {all.length > 0 && (
            <button className={styles.clearAllBtn} onClick={clearAll}>
              <DeleteOutlined /> Xoá tất cả
            </button>
          )}
        </div>
      </div>

      {/* ── Filters ── */}
      <div className={styles.filterRow}>
        <Input
          prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
          placeholder="Tìm kiếm thông báo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
          className={styles.searchInput}
        />
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
      </div>

      {/* ── Tabs ── */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        className={styles.tabs}
        items={[
          { key: "all", label: `Tất cả (${all.length})` },
          {
            key: "unread",
            label: (
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                Chưa đọc
                {unreadCount > 0 && <Badge count={unreadCount} size="small" />}
              </span>
            ),
          },
        ]}
      />

      {/* ── List ── */}
      <div className={styles.card}>
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
                <button
                  key={item.id}
                  className={`${styles.item} ${!item.isRead ? styles.itemUnread : ""}`}
                  onClick={() => handleItemClick(item)}
                >
                  {!item.isRead && (
                    <span className={styles.unreadBar} style={{ background: meta.color }} />
                  )}

                  <span
                    className={styles.iconWrap}
                    style={{ background: meta.bg, color: meta.color }}
                  >
                    {meta.icon}
                  </span>

                  <span className={styles.itemBody}>
                    <span className={styles.itemTop}>
                      <span className={styles.itemTitle}>{item.title}</span>
                      <span
                        className={styles.itemType}
                        style={{ color: meta.color, background: meta.bg }}
                      >
                        {meta.label}
                      </span>
                    </span>
                    <span className={styles.itemMsg}>{item.message}</span>
                    <span className={styles.itemTime}>
                      {timeAgo(item.createdAt)}
                      <span className={styles.itemDate}>· {formatDate(item.createdAt)}</span>
                    </span>
                  </span>

                  <span className={styles.itemRight}>
                    {!item.isRead && (
                      <span className={styles.dot} style={{ background: meta.color }} />
                    )}
                    <button
                      className={styles.deleteBtn}
                      onClick={(e) => deleteItem(e, item.id)}
                      title="Xoá thông báo này"
                    >
                      <DeleteOutlined />
                    </button>
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Pagination ── */}
      {filtered.length > PAGE_SIZE && (
        <div className={styles.paginationWrap}>
          <Pagination
            current={page}
            total={filtered.length}
            pageSize={PAGE_SIZE}
            onChange={setPage}
            showSizeChanger={false}
            showTotal={(t) => `${t} thông báo`}
          />
        </div>
      )}
    </div>
  );
}
