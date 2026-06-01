import { io } from "socket.io-client";
import { API_ORIGIN } from "../config/api";

const SOCKET_URL = API_ORIGIN;
let hasGlobalAdminNotificationListener = false;

const getStoredToken = () => {
  const token = localStorage.getItem("admin_token") || localStorage.getItem("token");

  if (!token || token === "null" || token === "undefined") {
    return null;
  }

  return token;
};

export const resolveAdminNotificationRedirect = (payload = {}) => {
  const directUrl = payload.redirectUrl || payload.DuongDan || "";
  const type = payload.type || payload.LoaiThongBao || "";
  const haystack = [
    payload.title,
    payload.TieuDe,
    payload.message,
    payload.NoiDung,
    directUrl,
  ]
    .filter(Boolean)
    .join(" ");

  if (directUrl.includes("?")) {
    return directUrl;
  }

  if (String(type).startsWith("ORDER_")) {
    const orderCode = haystack.match(/\bDH[A-Z0-9]+\b/i)?.[0];
    if (orderCode) {
      return `/admin?orderCode=${encodeURIComponent(orderCode.toUpperCase())}`;
    }
  }

  if (String(type).startsWith("RISK_")) {
    const riskId = haystack.match(/(?:rủi ro|rui ro|risk)\s*#?\s*(\d+)/i)?.[1];
    if (riskId) {
      return `/admin/risks?riskId=${riskId}`;
    }
  }

  if (String(type).startsWith("WARRANTY_")) {
    const warrantyId =
      haystack.match(/(?:bảo hành|bao hanh|warranty|bh|phiếu|phieu)\s*#?\s*(\d+)/i)?.[1] ||
      haystack.match(/#\s*(\d+)/)?.[1];

    if (warrantyId) {
      return `/admin/warranties?warrantyId=${warrantyId}`;
    }
  }

  if (String(type).startsWith("RETURN_")) {
    const returnId =
      haystack.match(/(?:đổi trả|doi tra|return)\s*#?\s*(\d+)/i)?.[1] ||
      haystack.match(/#\s*(\d+)/)?.[1];

    if (returnId) {
      return `/admin/returns?returnId=${returnId}`;
    }
  }

  return directUrl || "/admin/notifications";
};

export const normalizeAdminNotificationPayload = (payload = {}) => ({
  id:
    payload.id ||
    payload.MaThongBao ||
    `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  type: payload.type || payload.LoaiThongBao,
  title: payload.title || payload.TieuDe || "Thông báo",
  message: payload.message || payload.NoiDung || "",
  redirectUrl: resolveAdminNotificationRedirect(payload),
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
  const token = getStoredToken();

  adminSocket.auth = token ? { token } : {};

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
