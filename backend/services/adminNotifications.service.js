import { NotificationsModel, StaffModel } from "../models/index.js";
import { emitToAdmin } from "../config/socketIO.js";
import ErrorHandler from "../utils/error_handler.js";

export const NOTIFICATIONS_STATUS = {
  UNREAD_MESSAGES: 0,
  READ_MESSAGES: 1,
};

export const NOTIFICATION_TYPES = {
  ORDER_CREATED: "ORDER_CREATED",
  ORDER_STATUS_UPDATED: "ORDER_STATUS_UPDATED",
  ORDER_CANCELED: "ORDER_CANCELED",
  WARRANTY_REQUESTED: "WARRANTY_REQUESTED",
  WARRANTY_STATUS_UPDATED: "WARRANTY_STATUS_UPDATED",
  RISK_CREATED: "RISK_CREATED",
  RISK_STATUS_UPDATED: "RISK_STATUS_UPDATED",
  RETURN_REQUESTED: "RETURN_REQUESTED",
  RETURN_STATUS_UPDATED: "RETURN_STATUS_UPDATED",
};

const VALID_NOTIFICATION_TYPES = Object.values(NOTIFICATION_TYPES);

const normalizeNotificationType = (type) => {
  const normalizedType = String(type || "").trim().toUpperCase();

  if (!VALID_NOTIFICATION_TYPES.includes(normalizedType)) {
    throw new ErrorHandler("Loai thong bao khong hop le!", 422);
  }

  return normalizedType;
};

const normalizeReadStatus = (status) => {
  if (status === undefined || status === null || status === "") {
    return undefined;
  }

  const normalizedStatus = Number(status);

  if (!Object.values(NOTIFICATIONS_STATUS).includes(normalizedStatus)) {
    throw new ErrorHandler("Trang thai doc thong bao khong hop le!", 422);
  }

  return normalizedStatus;
};

const buildNotificationWhere = ({ status, type } = {}) => {
  const whereCondition = {};
  const normalizedStatus = normalizeReadStatus(status);

  if (normalizedStatus !== undefined) {
    whereCondition.DaDoc = normalizedStatus;
  }

  if (type !== undefined && type !== null && type !== "") {
    whereCondition.LoaiThongBao = normalizeNotificationType(type);
  }

  return whereCondition;
};

export const toAdminNotificationPayload = (notification) => {
  const data = notification?.get ? notification.get({ plain: true }) : notification;

  if (!data) return null;

  return {
    id: data.MaThongBao,
    MaThongBao: data.MaThongBao,
    type: data.LoaiThongBao,
    LoaiThongBao: data.LoaiThongBao,
    staffId: data.MaNhanVien,
    MaNhanVien: data.MaNhanVien,
    title: data.TieuDe,
    TieuDe: data.TieuDe,
    message: data.NoiDung,
    NoiDung: data.NoiDung,
    redirectUrl: data.DuongDan || "/admin/notifications",
    DuongDan: data.DuongDan,
    isRead: Number(data.DaDoc) === NOTIFICATIONS_STATUS.READ_MESSAGES,
    DaDoc: data.DaDoc,
    createdAt: data.NgayTao,
    NgayTao: data.NgayTao,
  };
};

export const getAllNotificationsService = async (
  page = 1,
  limit = 10,
  status,
  type,
) => {
  const currentPage = Math.max(Number(page) || 1, 1);
  const pageSize = Math.max(Number(limit) || 10, 1);
  const offset = (currentPage - 1) * pageSize;
  const whereCondition = buildNotificationWhere({ status, type });

  const { rows: notifications, count: total } =
    await NotificationsModel.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: StaffModel,
          as: "NhanVien",
          required: false,
          attributes: ["MaNhanVien", "TenNhanVien", "SDT"],
        },
      ],
      limit: pageSize,
      offset,
      order: [["NgayTao", "DESC"]],
    });

  return {
    data: notifications,
    total,
    totalPages: Math.ceil(total / pageSize),
    page: currentPage,
  };
};

export const getUnreadNotificationsCountService = async (type) => {
  const whereCondition = {
    DaDoc: NOTIFICATIONS_STATUS.UNREAD_MESSAGES,
  };

  if (type !== undefined && type !== null && type !== "") {
    whereCondition.LoaiThongBao = normalizeNotificationType(type);
  }

  return await NotificationsModel.count({
    where: whereCondition,
  });
};

export const markAsReadService = async (idNotification) => {
  try {
    const notification = await NotificationsModel.findByPk(idNotification);

    if (!notification) {
      throw new ErrorHandler("Khong tim thay thong bao!", 404);
    }

    return await notification.update({
      DaDoc: NOTIFICATIONS_STATUS.READ_MESSAGES,
    });
  } catch (err) {
    console.log(err);
    if (err.statusCode) throw err;
    throw new ErrorHandler("Loi server! Khong the danh dau da doc!", 500);
  }
};

export const markAllAsReadService = async (type) => {
  const whereCondition = {
    DaDoc: NOTIFICATIONS_STATUS.UNREAD_MESSAGES,
  };

  if (type !== undefined && type !== null && type !== "") {
    whereCondition.LoaiThongBao = normalizeNotificationType(type);
  }

  const [affectedRows] = await NotificationsModel.update(
    {
      DaDoc: NOTIFICATIONS_STATUS.READ_MESSAGES,
    },
    {
      where: whereCondition,
    },
  );

  return affectedRows;
};

export const deleteNotificationService = async (idNotification) => {
  const notification = await NotificationsModel.findByPk(idNotification);

  if (!notification) {
    throw new ErrorHandler("Khong tim thay thong bao!", 404);
  }

  await notification.destroy();

  return true;
};

export const deleteAllNotificationsService = async ({ status, type } = {}) => {
  return await NotificationsModel.destroy({
    where: buildNotificationWhere({ status, type }),
  });
};

export const createAdminNotificationService = async ({
  LoaiThongBao,
  MaNhanVien = null,
  TieuDe,
  NoiDung,
  DuongDan = "/admin/notifications",
}) => {
  const notification = await NotificationsModel.create({
    LoaiThongBao: normalizeNotificationType(LoaiThongBao),
    MaNhanVien,
    TieuDe: String(TieuDe || "").trim(),
    NoiDung: String(NoiDung || "").trim(),
    DaDoc: NOTIFICATIONS_STATUS.UNREAD_MESSAGES,
    DuongDan,
  });

  const payload = toAdminNotificationPayload(notification);
  emitToAdmin("admin:notification_created", payload);

  return notification;
};

export const safeCreateAdminNotificationService = async (payload) => {
  try {
    return await createAdminNotificationService(payload);
  } catch (err) {
    console.error("Khong the tao thong bao admin:", err);
    return null;
  }
};
