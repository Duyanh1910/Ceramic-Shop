import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Badge, Tooltip } from "antd";
import {
  BellOutlined,
  ShoppingOutlined,
  SwapOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import styles from "./NotificationBell.module.css";

const STORAGE_KEY = "admin_notifications";
const MAX_STORED = 50;

const EVENT_META = {
  ORDER_CREATED: {
    icon: <ShoppingOutlined />,
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.10)",
  },
  ORDER_STATUS_UPDATED: {
    icon: <CheckCircleOutlined />,
    color: "#10b981",
    bg: "rgba(16,185,129,0.10)",
  },
  ORDER_CANCELED: {
    icon: <CloseCircleOutlined />,
    color: "#ef4444",
    bg: "rgba(239,68,68,0.10)",
  },
  ORDER_RETURN: {
    icon: <SwapOutlined />,
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.10)",
  },
};

const getEventMeta = (type) =>
  EVENT_META[type] || {
    icon: <BellOutlined />,
    color: "#c48c46",
    bg: "rgba(196,140,70,0.10)",
  };

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Vừa xong";
  if (m < 60) return `${m} phút trước`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} giờ trước`;
  return `${Math.floor(h / 24)} ngày trước`;
};

// ── LocalStorage helpers ────────────────────────────────────────────
const loadFromStorage = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
};

const saveToStorage = (list) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, MAX_STORED)));
  } catch {
    // storage full → bỏ qua
  }
};

export default function NotificationBell() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(() => loadFromStorage());
  const [animating, setAnimating] = useState(false);
  const dropdownRef = useRef(null);
  const bellRef = useRef(null);

  const unread = notifications.filter((n) => !n.isRead).length;

  // ── Đồng bộ state → localStorage mỗi khi list thay đổi ──────────
  useEffect(() => {
    saveToStorage(notifications);
  }, [notifications]);

  // ── Nhận thông báo mới từ AdminLayout qua CustomEvent ────────────
  useEffect(() => {
    const handleNewNotif = (e) => {
      const item = e.detail;
      if (!item) return;

      setAnimating(true);
      setTimeout(() => setAnimating(false), 700);

      setNotifications((prev) => {
        const next = [item, ...prev].slice(0, MAX_STORED);
        saveToStorage(next);
        return next;
      });
    };

    window.addEventListener("admin:new_notification", handleNewNotif);
    return () =>
      window.removeEventListener("admin:new_notification", handleNewNotif);
  }, []);

  // ── Đóng dropdown khi click ngoài ────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        bellRef.current &&
        !bellRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── Đánh dấu tất cả đã đọc ───────────────────────────────────────
  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  // ── Xoá tất cả ───────────────────────────────────────────────────
  const clearAll = () => {
    setNotifications([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  // ── Click vào 1 thông báo ─────────────────────────────────────────
  const handleItemClick = (item) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
    );
    setOpen(false);
    navigate(item.redirectUrl);
  };

  // chỉ hiện 8 cái gần nhất trong dropdown
  const recentList = notifications.slice(0, 8);

  return (
    <div className={styles.wrapper}>
      {/* ── Floating Bell Button ── */}
      <Tooltip title="Thông báo" placement="left">
        <button
          ref={bellRef}
          className={`${styles.bellBtn} ${open ? styles.bellActive : ""} ${animating ? styles.bellShake : ""}`}
          onClick={() => setOpen((v) => !v)}
          aria-label="Thông báo"
        >
          <Badge count={unread} overflowCount={99} size="small" offset={[-2, 2]}>
            <BellOutlined className={styles.bellIcon} />
          </Badge>
          {unread > 0 && <span className={styles.bellPulse} />}
        </button>
      </Tooltip>

      {/* ── Dropdown Panel ── */}
      {open && (
        <div ref={dropdownRef} className={styles.dropdown}>
          {/* header */}
          <div className={styles.dropHeader}>
            <span className={styles.dropTitle}>
              Thông báo
              {unread > 0 && (
                <span className={styles.unreadBadge}>{unread} mới</span>
              )}
            </span>
            <div className={styles.dropActions}>
              {unread > 0 && (
                <button className={styles.actionBtn} onClick={markAllRead}>
                  Đã đọc tất cả
                </button>
              )}
              {notifications.length > 0 && (
                <button className={`${styles.actionBtn} ${styles.clearBtn}`} onClick={clearAll}>
                  Xoá
                </button>
              )}
            </div>
          </div>

          {/* list */}
          <div className={styles.dropList}>
            {notifications.length === 0 ? (
              <div className={styles.emptyState}>
                <BellOutlined className={styles.emptyIcon} />
                <p>Chưa có thông báo nào</p>
              </div>
            ) : (
              recentList.map((item) => {
                const meta = getEventMeta(item.type);
                return (
                  <button
                    key={item.id}
                    className={`${styles.notifItem} ${!item.isRead ? styles.notifUnread : ""}`}
                    onClick={() => handleItemClick(item)}
                  >
                    <span
                      className={styles.notifIconWrap}
                      style={{ background: meta.bg, color: meta.color }}
                    >
                      {meta.icon}
                    </span>
                    <span className={styles.notifBody}>
                      <span className={styles.notifTitle}>{item.title}</span>
                      <span className={styles.notifMsg}>{item.message}</span>
                      <span className={styles.notifTime}>
                        {timeAgo(item.createdAt)}
                      </span>
                    </span>
                    {!item.isRead && <span className={styles.unreadDot} />}
                  </button>
                );
              })
            )}
          </div>

          {/* footer */}
          <button
            className={styles.viewAll}
            onClick={() => {
              setOpen(false);
              navigate("/admin/notifications");
            }}
          >
            Xem tất cả ({notifications.length})
            <ArrowRightOutlined />
          </button>
        </div>
      )}
    </div>
  );
}
