import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge, Tooltip } from "antd";
import axios from "axios";
import {
  normalizeAdminNotificationPayload,
  resolveAdminNotificationRedirect,
} from "./socket.js";
import {
  ArrowRightOutlined,
  BellOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SafetyOutlined,
  ShoppingOutlined,
  SwapOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import styles from "./NotificationBell.module.css";

import { API_BASE } from "../config/api";

const STORAGE_KEY = "admin_notifications";
const MAX_STORED = 50;
const EVENT_META = {
  ORDER_CREATED: {
    label: "Đơn mới",
    icon: <ShoppingOutlined />,
    color: "#2563eb",
    bg: "rgba(37, 99, 235, 0.1)",
  },
  ORDER_STATUS_UPDATED: {
    label: "Cập nhật",
    icon: <CheckCircleOutlined />,
    color: "#059669",
    bg: "rgba(5, 150, 105, 0.1)",
  },
  ORDER_CANCELED: {
    label: "Đã hủy",
    icon: <CloseCircleOutlined />,
    color: "#dc2626",
    bg: "rgba(220, 38, 38, 0.1)",
  },
  WARRANTY_REQUESTED: {
    label: "Bảo hành",
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
    label: "Rủi ro",
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
    label: "Đổi trả",
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
    label: "Thông báo",
    icon: <BellOutlined />,
    color: "#c48c46",
    bg: "rgba(196, 140, 70, 0.12)",
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

  return `${Math.floor(h / 24)} ngày trước`;
};

const loadFromStorage = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
};

const saveToStorage = (list) => {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(list.slice(0, MAX_STORED)),
    );
  } catch {
    return undefined;
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
  const recentList = notifications.slice(0, 8);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await axios.get(
        `${API_BASE}/admin/notifications?page=1&limit=${MAX_STORED}`,
        { withCredentials: true },
      );

      const rows = res.data?.result?.data || [];
      const mapped = rows.map((item) =>
        normalizeAdminNotificationPayload({
          ...item,
          isRead: Number(item.DaDoc) === 1,
        }),
      );

      setNotifications(mapped);
    } catch (err) {
      console.warn("Cannot load admin notifications:", err.message);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(fetchNotifications, 0);

    const intervalId = window.setInterval(fetchNotifications, 5000);
    return () => {
      window.clearTimeout(timeoutId);
      window.clearInterval(intervalId);
    };
  }, [fetchNotifications]);

  useEffect(() => {
    saveToStorage(notifications);
  }, [notifications]);

  useEffect(() => {
    const handleNewNotif = (e) => {
      const item = e.detail;
      if (!item) return;

      setAnimating(true);
      window.setTimeout(() => setAnimating(false), 700);

      setNotifications((prev) =>
        [item, ...prev.filter((n) => n.id !== item.id)].slice(0, MAX_STORED),
      );
    };

    window.addEventListener("admin:new_notification", handleNewNotif);
    return () =>
      window.removeEventListener("admin:new_notification", handleNewNotif);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      const clickedDropdown = dropdownRef.current?.contains(e.target);
      const clickedBell = bellRef.current?.contains(e.target);

      if (!clickedDropdown && !clickedBell) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      await axios.patch(
        `${API_BASE}/admin/notifications/read-all`,
        {},
        { withCredentials: true },
      );
    } catch (err) {
      console.warn("Cannot mark notifications as read:", err.message);
    }

    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }, []);

  const clearAll = useCallback(async () => {
    try {
      await axios.delete(`${API_BASE}/admin/notifications`, {
        withCredentials: true,
      });
    } catch (err) {
      console.warn("Cannot delete notifications:", err.message);
    }

    setNotifications([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

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

    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n)),
    );

    setOpen(false);
    navigate(resolveAdminNotificationRedirect(item));
  };

  const handleKeyOpen = (e, item) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleItemClick(item);
    }
  };

  return (
    <div className={styles.wrapper}>
      <Tooltip title="Thông báo" placement="left">
        <button
          ref={bellRef}
          type="button"
          className={`${styles.bellBtn} ${open ? styles.bellActive : ""} ${
            animating ? styles.bellShake : ""
          }`}
          onClick={() => setOpen((v) => !v)}
          aria-label="Thông báo"
        >
          <Badge
            count={unread}
            overflowCount={99}
            size="small"
            offset={[-3, 3]}
          >
            <BellOutlined className={styles.bellIcon} />
          </Badge>

          {unread > 0 && <span className={styles.bellPulse} />}
        </button>
      </Tooltip>

      {open && (
        <div ref={dropdownRef} className={styles.dropdown}>
          <div className={styles.dropHeader}>
            <div>
              <h3 className={styles.dropTitle}>Thông báo</h3>
              <p className={styles.dropSub}>
                {unread > 0
                  ? `Bạn có ${unread} thông báo chưa đọc`
                  : "Không có thông báo mới"}
              </p>
            </div>

            {unread > 0 && <span className={styles.unreadBadge}>{unread}</span>}
          </div>

          <div className={styles.quickActions}>
            <button
              type="button"
              className={styles.actionBtn}
              onClick={markAllRead}
              disabled={unread === 0}
            >
              Đã đọc tất cả
            </button>

            <button
              type="button"
              className={`${styles.actionBtn} ${styles.clearBtn}`}
              onClick={clearAll}
              disabled={notifications.length === 0}
            >
              Xóa tất cả
            </button>
          </div>

          <div className={styles.dropList}>
            {notifications.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIconWrap}>
                  <BellOutlined className={styles.emptyIcon} />
                </div>
                <p>Chưa có thông báo nào</p>
                <span>Các cập nhật mới sẽ xuất hiện tại đây.</span>
              </div>
            ) : (
              recentList.map((item) => {
                const meta = getEventMeta(item.type);

                return (
                  <div
                    key={item.id}
                    role="button"
                    tabIndex={0}
                    className={`${styles.notifItem} ${
                      !item.isRead ? styles.notifUnread : ""
                    }`}
                    onClick={() => handleItemClick(item)}
                    onKeyDown={(e) => handleKeyOpen(e, item)}
                  >
                    <span
                      className={styles.notifIconWrap}
                      style={{ background: meta.bg, color: meta.color }}
                    >
                      {meta.icon}
                    </span>

                    <span className={styles.notifBody}>
                      <span className={styles.notifTop}>
                        <span className={styles.notifTitle}>
                          {item.title || "Thông báo"}
                        </span>
                        <span
                          className={styles.notifType}
                          style={{ background: meta.bg, color: meta.color }}
                        >
                          {meta.label}
                        </span>
                      </span>

                      <span className={styles.notifMsg}>
                        {item.message || "Không có nội dung thông báo."}
                      </span>

                      <span className={styles.notifTime}>
                        {timeAgo(item.createdAt)}
                      </span>
                    </span>

                    {!item.isRead && <span className={styles.unreadDot} />}
                  </div>
                );
              })
            )}
          </div>

          <button
            type="button"
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
