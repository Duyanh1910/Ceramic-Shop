import { Op } from "sequelize";
import {
  sequelize,
  PaymentTransactionModel,
  PaymentMethodModel,
  OrderModel,
  CustomerModel,
  ReturnModel,
} from "../../models/index.js";
import ErrorHandler from "../../utils/error_handler.js";

const PAYMENT_TRANSACTION_TYPE = {
  PAYMENT: "THANH_TOAN",
  REFUND: "HOAN_TIEN",
};

const PAYMENT_TRANSACTION_STATUS = {
  PENDING: "PENDING",
  SUCCESS: "SUCCESS",
  FAILED: "FAILED",
  CANCELLED: "CANCELLED",
};

const VALID_TYPES = Object.values(PAYMENT_TRANSACTION_TYPE);
const VALID_STATUSES = Object.values(PAYMENT_TRANSACTION_STATUS);

const parsePositiveInteger = (value, message) => {
  const numberValue = Number(value);

  if (!Number.isInteger(numberValue) || numberValue <= 0) {
    throw new ErrorHandler(message, 422);
  }

  return numberValue;
};

const normalizeNullableText = (value) => {
  if (value === undefined || value === null) return null;

  const text = String(value).trim();
  return text || null;
};

const normalizeType = (value) => {
  if (!value) return null;

  const type = String(value).trim().toUpperCase();

  if (!VALID_TYPES.includes(type)) {
    throw new ErrorHandler("Loại giao dịch không hợp lệ!", 422);
  }

  return type;
};

const normalizeStatus = (value) => {
  if (!value) return null;

  const status = String(value).trim().toUpperCase();

  if (!VALID_STATUSES.includes(status)) {
    throw new ErrorHandler("Trạng thái giao dịch không hợp lệ!", 422);
  }

  return status;
};

const buildTransactionInclude = () => [
  {
    model: PaymentMethodModel,
    required: false,
  },
  {
    model: OrderModel,
    required: false,
    include: [
      {
        model: CustomerModel,
        required: false,
        attributes: ["MaKhachHang", "TenKhachHang", "SDT"],
      },
    ],
  },
  {
    model: ReturnModel,
    required: false,
  },
];

const findTransactionOrFail = async (MaGiaoDich, options = {}) => {
  const transaction = await PaymentTransactionModel.findByPk(MaGiaoDich, {
    include: buildTransactionInclude(),
    ...options,
  });

  if (!transaction) {
    throw new ErrorHandler("Không tìm thấy giao dịch thanh toán!", 404);
  }

  return transaction;
};

export const getAllPaymentTransactionsAdminService = async ({
  page = 1,
  limit = 10,
  search = "",
  type,
  status,
  method,
  startDate,
  endDate,
}) => {
  const currentPage = Math.max(Number(page) || 1, 1);
  const pageSize = Math.max(Number(limit) || 10, 1);
  const offset = (currentPage - 1) * pageSize;

  const where = {};
  const keyword = String(search || "").trim();

  const normalizedType = normalizeType(type);
  const normalizedStatus = normalizeStatus(status);

  if (normalizedType) {
    where.LoaiGiaoDich = normalizedType;
  }

  if (normalizedStatus) {
    where.TrangThai = normalizedStatus;
  }

  if (method !== undefined && method !== null && method !== "") {
    where.MaPhuongThuc = parsePositiveInteger(
      method,
      "Phương thức thanh toán không hợp lệ!",
    );
  }

  if (startDate || endDate) {
    where.ThoiGianGiaoDich = {};

    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      where.ThoiGianGiaoDich[Op.gte] = start;
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      where.ThoiGianGiaoDich[Op.lte] = end;
    }
  }

  if (keyword) {
    where[Op.or] = [
      { MaThamChieu: { [Op.like]: `%${keyword}%` } },
      { MaGiaoDichDoiTac: { [Op.like]: `%${keyword}%` } },
      { MaLoi: { [Op.like]: `%${keyword}%` } },
      { "$DonHang.MaHienThi$": { [Op.like]: `%${keyword}%` } },
      { "$DonHang.TenNguoiNhan$": { [Op.like]: `%${keyword}%` } },
      { "$DonHang.SDT$": { [Op.like]: `%${keyword}%` } },
    ];
  }

  const { count, rows } = await PaymentTransactionModel.findAndCountAll({
  where,
  include: buildTransactionInclude(),
  limit: pageSize,
  offset,
  distinct: true,
  col: "MaGiaoDich",
  subQuery: false,
  order: [["ThoiGianGiaoDich", "DESC"]],
});

  return {
    totalItems: count,
    totalPages: Math.ceil(count / pageSize),
    currentPage,
    data: rows,
  };
};

export const getPaymentTransactionByIdAdminService = async (MaGiaoDich) => {
  const transaction = await findTransactionOrFail(MaGiaoDich);

  let originalTransaction = null;

  if (transaction.MaGiaoDichGoc) {
    originalTransaction = await PaymentTransactionModel.findByPk(
      transaction.MaGiaoDichGoc,
      {
        include: buildTransactionInclude(),
      },
    );
  }

  return {
    transaction,
    originalTransaction,
  };
};

export const confirmRefundTransactionAdminService = async (
  MaGiaoDich,
  payload,
) => {
  const dbTransaction = await sequelize.transaction();

  try {
    const paymentTransaction = await PaymentTransactionModel.findByPk(
      MaGiaoDich,
      {
        transaction: dbTransaction,
        lock: dbTransaction.LOCK.UPDATE,
      },
    );

    if (!paymentTransaction) {
      throw new ErrorHandler("Không tìm thấy giao dịch hoàn tiền!", 404);
    }

    if (paymentTransaction.LoaiGiaoDich !== PAYMENT_TRANSACTION_TYPE.REFUND) {
      throw new ErrorHandler("Chỉ có thể xác nhận giao dịch hoàn tiền!", 400);
    }

    if (paymentTransaction.TrangThai !== PAYMENT_TRANSACTION_STATUS.PENDING) {
      throw new ErrorHandler(
        "Chỉ có thể xác nhận giao dịch hoàn tiền đang chờ xử lý!",
        400,
      );
    }

    await paymentTransaction.update(
      {
        TrangThai: PAYMENT_TRANSACTION_STATUS.SUCCESS,
        MaGiaoDichDoiTac:
          normalizeNullableText(payload.MaGiaoDichDoiTac) ||
          paymentTransaction.MaGiaoDichDoiTac,
        MaLoi: null,
        DuLieuPhanHoi: {
          ...(paymentTransaction.DuLieuPhanHoi || {}),
          confirmedByAdmin: true,
          note: normalizeNullableText(payload.GhiChu),
          confirmedAt: new Date().toISOString(),
        },
        ThoiGianGiaoDich: new Date(),
      },
      { transaction: dbTransaction },
    );

    await dbTransaction.commit();

    return await getPaymentTransactionByIdAdminService(MaGiaoDich);
    } catch (err) {
        if (!dbTransaction.finished) {
        await dbTransaction.rollback();
    }

        if (err.statusCode) throw err;

        throw new ErrorHandler("Lỗi server! Không thể xác nhận hoàn tiền!", 500);
    }
};

export const failRefundTransactionAdminService = async (
  MaGiaoDich,
  payload,
) => {
  const dbTransaction = await sequelize.transaction();

  try {
    const paymentTransaction = await PaymentTransactionModel.findByPk(
      MaGiaoDich,
      {
        transaction: dbTransaction,
        lock: dbTransaction.LOCK.UPDATE,
      },
    );

    if (!paymentTransaction) {
      throw new ErrorHandler("Không tìm thấy giao dịch hoàn tiền!", 404);
    }

    if (paymentTransaction.LoaiGiaoDich !== PAYMENT_TRANSACTION_TYPE.REFUND) {
      throw new ErrorHandler("Chỉ có thể cập nhật giao dịch hoàn tiền!", 400);
    }

    if (paymentTransaction.TrangThai !== PAYMENT_TRANSACTION_STATUS.PENDING) {
      throw new ErrorHandler(
        "Chỉ có thể đánh dấu thất bại giao dịch hoàn tiền đang chờ xử lý!",
        400,
      );
    }

    const reason =
      normalizeNullableText(payload.GhiChu) ||
      normalizeNullableText(payload.MaLoi) ||
      "Hoàn tiền thất bại";

    await paymentTransaction.update(
      {
        TrangThai: PAYMENT_TRANSACTION_STATUS.FAILED,
        MaLoi: normalizeNullableText(payload.MaLoi) || "REFUND_FAILED",
        DuLieuPhanHoi: {
          ...(paymentTransaction.DuLieuPhanHoi || {}),
          failedByAdmin: true,
          reason,
          failedAt: new Date().toISOString(),
        },
        ThoiGianGiaoDich: new Date(),
      },
      { transaction: dbTransaction },
    );

    await dbTransaction.commit();

    return await getPaymentTransactionByIdAdminService(MaGiaoDich);
    } catch (err) {
        if (!dbTransaction.finished) {
            await dbTransaction.rollback();
    }

        if (err.statusCode) throw err;

        throw new ErrorHandler(
            "Lỗi server! Không thể cập nhật giao dịch hoàn tiền!",
            500,
        );
    }
};