import {
  deleteAllNotificationsService,
  deleteNotificationService,
  getAllNotificationsService,
  getUnreadNotificationsCountService,
  markAllAsReadService,
  markAsReadService,
} from "../../../services/adminNotifications.service.js";

export const getNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, DaDoc, type, LoaiThongBao } = req.query;

    const notifications = await getAllNotificationsService(
      Number(page),
      Number(limit),
      status ?? DaDoc,
      type ?? LoaiThongBao,
    );

    res.status(200).json({
      success: true,
      message: "Lay danh sach thong bao thanh cong!",
      result: notifications,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export const getUnreadNotificationsCount = async (req, res, next) => {
  try {
    const { type, LoaiThongBao } = req.query;
    const count = await getUnreadNotificationsCountService(type ?? LoaiThongBao);

    res.status(200).json({
      success: true,
      message: "Lay so thong bao chua doc thanh cong!",
      result: {
        count,
      },
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export const markNotificationAsRead = async (req, res, next) => {
  try {
    const notification = await markAsReadService(Number(req.params.id));

    res.status(200).json({
      success: true,
      message: "Danh dau thong bao da doc thanh cong!",
      result: notification,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export const markAllNotificationsAsRead = async (req, res, next) => {
  try {
    const { type, LoaiThongBao } = req.query;
    const affectedRows = await markAllAsReadService(type ?? LoaiThongBao);

    res.status(200).json({
      success: true,
      message: "Danh dau tat ca thong bao da doc thanh cong!",
      result: {
        affectedRows,
      },
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export const deleteNotification = async (req, res, next) => {
  try {
    await deleteNotificationService(Number(req.params.id));

    res.status(200).json({
      success: true,
      message: "Xoa thong bao thanh cong!",
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export const deleteAllNotifications = async (req, res, next) => {
  try {
    const { status, DaDoc, type, LoaiThongBao } = req.query;
    const affectedRows = await deleteAllNotificationsService({
      status: status ?? DaDoc,
      type: type ?? LoaiThongBao,
    });

    res.status(200).json({
      success: true,
      message: "Xoa thong bao thanh cong!",
      result: {
        affectedRows,
      },
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};
