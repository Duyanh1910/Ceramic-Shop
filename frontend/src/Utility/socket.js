import { io } from "socket.io-client";

const SOCKET_URL = "https://ceramic-shop-u8ak.onrender.com";
let hasGlobalAdminNotificationListener = false;

export const normalizeAdminNotificationPayload = (payload = {}) => ({
  id:
    payload.id ||
    payload.MaThongBao ||
    `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  type: payload.type || payload.LoaiThongBao,
  title: payload.title || payload.TieuDe || "Thông báo",
  message: payload.message || payload.NoiDung || "",
  redirectUrl: payload.redirectUrl || payload.DuongDan || "/admin/notifications",
  isRead: Boolean(payload.isRead),
  createdAt: payload.createdAt || payload.NgayTao || new Date().toISOString(),
});

const dispatchAdminNotification = (payload = {}, fallbackType) => {
  window.dispatchEvent(
    new CustomEvent("admin:new_notification", {
      detail: normalizeAdminNotificationPayload({
        ...payload,
        type: payload.type || payload.LoaiThongBao || fallbackType,
      }),
    }),
  );
};

export const adminSocket = io(SOCKET_URL, {
  transports: ["websocket", "polling"],
  autoConnect: false,
  withCredentials: true,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
});

export const connectAdminSocket = () => {
  const token = localStorage.getItem("admin_token") || localStorage.getItem("token");

  if (!token) return null;

  adminSocket.auth = { token };

  if (!hasGlobalAdminNotificationListener) {
    adminSocket.on("admin:notification_created", (payload) =>
      dispatchAdminNotification(payload),
    );
    adminSocket.on("admin:order_created", (payload) =>
      dispatchAdminNotification(payload, "ORDER_CREATED"),
    );
    adminSocket.on("admin:order_updated", (payload) =>
      dispatchAdminNotification(payload, "ORDER_STATUS_UPDATED"),
    );
    adminSocket.on("admin:order_canceled", (payload) =>
      dispatchAdminNotification(payload, "ORDER_CANCELED"),
    );
    hasGlobalAdminNotificationListener = true;
  }

  if (!adminSocket.connected) {
    adminSocket.connect();
  }

  return adminSocket;
};

export const disconnectAdminSocket = () => {
  if (adminSocket.connected) {
    adminSocket.disconnect();
  }
};
