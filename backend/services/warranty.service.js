import {
  sequelize,
  WarrantyModel,
  WarrantyHistoryModel,
  OrderDetailModel,
  OrderModel,
  VariantModel,
  ProductModel,
  InventoryHistoryModel,
  CustomerModel,
  RiskModel,
} from "../models/index.js";
import ErrorHandler from "../utils/error_handler.js";
import { Op } from "sequelize";
import {
  NOTIFICATION_TYPES,
  safeCreateAdminNotificationService,
} from "./adminNotifications.service.js";
import {
  buildDateRangeText,
  buildReportHeader,
  createReportWorkbook,
  createReportWorksheet,
  formatDateTimeVN,
  styleDataRow,
  styleHeaderRow,
} from "../utils/excelReport.js";

export const WARRANTY_STATUS = {
  EXPIRED: 0,
  ACTIVE: 1,
  REQUESTED: 2,
  PROCESSING: 3,
  COMPLETED: 4,
  REJECTED: 5,
};

export const WARRANTY_HISTORY_STATUS = {
  PENDING: 0,
  APPROVED: 1,
  REJECTED: 2,
  COMPLETED: 3,
};

export const WARRANTY_ACTION = {
  TIEP_NHAN: "TIEP_NHAN",
  KIEM_TRA: "KIEM_TRA",
  DUYET: "DUYET",
  TU_CHOI: "TU_CHOI",
  HOAN_TAT: "HOAN_TAT",
  DOI_MOI: "DOI_MOI",
  TAO_PHIEU: "TAO_PHIEU",
  HET_HAN: "HET_HAN",
};

const DEFAULT_WARRANTY_MONTHS = 12;

const RISK_STATUS = {
  UNHANDLED: 0,
  RESOLVED: 1,
  PROCESSING: 2,
  IGNORED: 3,
};

const isValidWarrantyStatus = (status) => {
  return Object.values(WARRANTY_STATUS).includes(Number(status));
};

const addMonths = (date, months) => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);

  return result;
};

const getHistoryStatusByWarrantyStatus = (status) => {
  if (Number(status) === WARRANTY_STATUS.REJECTED) {
    return WARRANTY_HISTORY_STATUS.REJECTED;
  }

  if (Number(status) === WARRANTY_STATUS.COMPLETED) {
    return WARRANTY_HISTORY_STATUS.COMPLETED;
  }

  if (Number(status) === WARRANTY_STATUS.PROCESSING) {
    return WARRANTY_HISTORY_STATUS.APPROVED;
  }

  return WARRANTY_HISTORY_STATUS.PENDING;
};

const getActionByWarrantyStatus = (status) => {
  if (Number(status) === WARRANTY_STATUS.PROCESSING) {
    return WARRANTY_ACTION.DUYET;
  }

  if (Number(status) === WARRANTY_STATUS.REJECTED) {
    return WARRANTY_ACTION.TU_CHOI;
  }

  if (Number(status) === WARRANTY_STATUS.COMPLETED) {
    return WARRANTY_ACTION.HOAN_TAT;
  }

  return WARRANTY_ACTION.KIEM_TRA;
};

const assertPositiveInteger = (value, message) => {
  const numberValue = Number(value);

  if (!Number.isInteger(numberValue) || numberValue <= 0) {
    throw new ErrorHandler(message, 422);
  }

  return numberValue;
};

const assertValidWarrantyTransition = (currentStatus, nextStatus) => {
  const current = Number(currentStatus);
  const next = Number(nextStatus);

  const validTransitions = {
    [WARRANTY_STATUS.REQUESTED]: [
      WARRANTY_STATUS.PROCESSING,
      WARRANTY_STATUS.REJECTED,
    ],
    [WARRANTY_STATUS.PROCESSING]: [
      WARRANTY_STATUS.COMPLETED,
      WARRANTY_STATUS.REJECTED,
    ],
  };

  const allowedNextStatuses = validTransitions[current] || [];

  if (!allowedNextStatuses.includes(next)) {
    throw new ErrorHandler(
      "Không thể chuyển trạng thái bảo hành theo luồng này!",
      400,
    );
  }
};

const getWarrantyRiskStatus = (status) => {
  const statusNumber = Number(status);

  if (statusNumber === WARRANTY_STATUS.REQUESTED) return RISK_STATUS.UNHANDLED;
  if (statusNumber === WARRANTY_STATUS.PROCESSING) return RISK_STATUS.PROCESSING;
  if (statusNumber === WARRANTY_STATUS.COMPLETED) return RISK_STATUS.RESOLVED;
  if (
    statusNumber === WARRANTY_STATUS.REJECTED ||
    statusNumber === WARRANTY_STATUS.EXPIRED
  ) {
    return RISK_STATUS.IGNORED;
  }

  return RISK_STATUS.UNHANDLED;
};

const applyRiskResolutionTime = (risk, status) => {
  if (status === RISK_STATUS.RESOLVED || status === RISK_STATUS.IGNORED) {
    if (!risk.NgayXuLy) risk.NgayXuLy = new Date();
    return;
  }

  risk.NgayXuLy = null;
};

const buildWarrantyRiskMarker = (MaBaoHanh) => `[BaoHanh#${MaBaoHanh}]`;

const syncWarrantyRisk = async ({
  warranty,
  order,
  note,
  staffId,
  status,
  transaction,
}) => {
  if (!warranty || !order) {
    return { risk: null, created: false };
  }

  const marker = buildWarrantyRiskMarker(warranty.MaBaoHanh);
  const nextStatus = getWarrantyRiskStatus(status ?? warranty.TrangThai);

  const existed = await RiskModel.findOne({
    where: {
      MaDonHang: order.MaDonHang,
      LoaiRuiRo: "Yêu cầu bảo hành",
      GhiChu: { [Op.like]: `%${marker}%` },
    },
    transaction,
  });

  if (existed) {
    existed.MucDo = "CAO";
    existed.NguonPhatHien = "KHACH_HANG";
    existed.TrangThai = nextStatus;
    existed.MoTa =
      note ||
      existed.MoTa ||
      `Phát sinh từ yêu cầu bảo hành #${warranty.MaBaoHanh}`;
    if (staffId) {
      existed.MaNhanVienPhuTrach = staffId;
    }
    applyRiskResolutionTime(existed, nextStatus);
    await existed.save({ transaction });

    return { risk: existed, created: false };
  }

  const risk = await RiskModel.create(
    {
      MaDonHang: order.MaDonHang,
      LoaiRuiRo: "Yêu cầu bảo hành",
      MucDo: "CAO",
      NguonPhatHien: "KHACH_HANG",
      MoTa: note || `Phát sinh từ yêu cầu bảo hành #${warranty.MaBaoHanh}`,
      TrangThai: nextStatus,
      GhiChu: `${marker} Tự động đồng bộ từ yêu cầu bảo hành #${warranty.MaBaoHanh}`,
      MaNhanVienPhuTrach: staffId || null,
    },
    { transaction },
  );

  applyRiskResolutionTime(risk, nextStatus);
  await risk.save({ transaction });

  return { risk, created: true };
};

export const generateWarrantiesForOrderService = async (
  MaDonHang,
  transaction,
) => {
  const order = await OrderModel.findByPk(MaDonHang, {
    include: [
      {
        model: OrderDetailModel,
      },
    ],
    transaction,
  });

  if (!order) {
    throw new ErrorHandler("Không tìm thấy đơn hàng để tạo bảo hành!", 404);
  }

  if (Number(order.TrangThaiDonHang) !== 3) {
    throw new ErrorHandler("Chỉ tạo bảo hành cho đơn hàng đã hoàn thành!", 400);
  }

  const orderDetails = order.ChiTietDonHangs || [];

  if (orderDetails.length === 0) {
    return [];
  }

  const now = new Date();
  const warranties = [];

  for (const detail of orderDetails) {
    const existed = await WarrantyModel.findOne({
      where: {
        MaCTDH: detail.MaCTDH,
      },
      transaction,
    });

    if (existed) {
      warranties.push(existed);
      continue;
    }

    const warranty = await WarrantyModel.create(
      {
        MaCTDH: detail.MaCTDH,
        NgayBatDau: now,
        NgayKetThuc: addMonths(now, DEFAULT_WARRANTY_MONTHS),
        TrangThai: WARRANTY_STATUS.ACTIVE,
        GhiChu:
          "Bảo hành lỗi sản xuất, lỗi men sứ, lỗi nung trong 12 tháng kể từ ngày đơn hàng hoàn thành.",
      },
      { transaction },
    );

    await WarrantyHistoryModel.create(
      {
        MaBaoHanh: warranty.MaBaoHanh,
        HanhDong: WARRANTY_ACTION.TAO_PHIEU,
        NoiDungXuLy: `Hệ thống tạo phiếu bảo hành khi đơn hàng ${order.MaHienThi} hoàn thành`,
        TrangThai: WARRANTY_HISTORY_STATUS.COMPLETED,
      },
      { transaction },
    );

    warranties.push(warranty);
  }

  return warranties;
};

export const getAllWarrantyService = async (
  page = 1,
  limit = 10,
  search = "",
  order = "DESC",
  status,
) => {
  const currentPage = Number(page) > 0 ? Number(page) : 1;
  const pageSize = Number(limit) > 0 ? Number(limit) : 10;
  const offset = (currentPage - 1) * pageSize;

  const warrantyWhere = {};

  if (status !== undefined && status !== null && status !== "") {
    warrantyWhere.TrangThai = Number(status);
  }

  const keyword = String(search || "").trim();

  if (keyword) {
    const numericKeyword = /^\d+$/.test(keyword) ? Number(keyword) : null;

    warrantyWhere[Op.or] = [
      ...(numericKeyword !== null ? [{ MaBaoHanh: numericKeyword }] : []),
      { "$ChiTietDonHang.DonHang.MaHienThi$": { [Op.like]: `%${keyword}%` } },
      { "$ChiTietDonHang.DonHang.TenNguoiNhan$": { [Op.like]: `%${keyword}%` } },
      { "$ChiTietDonHang.DonHang.SDT$": { [Op.like]: `%${keyword}%` } },
    ];
  }

  const sortOrder = ["ASC", "DESC"].includes(String(order).toUpperCase())
    ? String(order).toUpperCase()
    : "DESC";

  const warranties = await WarrantyModel.findAndCountAll({
    where: warrantyWhere,
    limit: pageSize,
    offset,
    distinct: true,
    subQuery: false,
    order: [["MaBaoHanh", sortOrder]],
    include: [
      {
        model: OrderDetailModel,
        required: true,
        include: [
          {
            model: OrderModel,
            attributes: [
              "MaDonHang",
              "MaHienThi",
              "MaKhachHang",
              "TenNguoiNhan",
              "SDT",
              "DiaChiGiaoHang",
              "TrangThaiDonHang",
            ],
            required: false,
          },
          {
            model: VariantModel,
            include: [
              {
                model: ProductModel,
              },
            ],
          },
        ],
      },
    ],
  });

  return {
    totalItems: warranties.count,
    totalPages: Math.ceil(warranties.count / pageSize),
    currentPage,
    data: warranties.rows,
  };
};

export const getWarrantyByIdService = async (MaBaoHanh) => {
  const warranty = await WarrantyModel.findByPk(MaBaoHanh, {
    include: [
      {
        model: WarrantyHistoryModel,
        separate: true,
        order: [["NgayXuLy", "DESC"]],
      },
      {
        model: OrderDetailModel,
        include: [
          {
            model: OrderModel,
          },
          {
            model: VariantModel,
            include: [
              {
                model: ProductModel,
              },
            ],
          },
        ],
      },
    ],
  });

  if (!warranty) {
    throw new ErrorHandler("Không tìm thấy phiếu bảo hành!", 404);
  }

  return warranty;
};

export const getMyWarrantiesService = async (idAccount) => {
  const customer = await CustomerModel.findOne({
    where: {
      MaTaiKhoan: idAccount,
    },
  });

  if (!customer) {
    throw new ErrorHandler("Không tìm thấy khách hàng này!", 404);
  }

  return await WarrantyModel.findAll({
    order: [["MaBaoHanh", "DESC"]],
    include: [
      {
        model: OrderDetailModel,
        required: true,
        include: [
          {
            model: OrderModel,
            required: true,
            where: {
              MaKhachHang: customer.MaKhachHang,
            },
          },
          {
            model: VariantModel,
            include: [
              {
                model: ProductModel,
              },
            ],
          },
        ],
      },
    ],
  });
};

export const getMyWarrantyByIdService = async (idAccount, MaBaoHanh) => {
  const customer = await CustomerModel.findOne({
    where: {
      MaTaiKhoan: idAccount,
    },
  });

  if (!customer) {
    throw new ErrorHandler("Không tìm thấy khách hàng này!", 404);
  }

  const warranty = await WarrantyModel.findByPk(MaBaoHanh, {
    include: [
      {
        model: WarrantyHistoryModel,
        separate: true,
        order: [["NgayXuLy", "DESC"]],
      },
      {
        model: OrderDetailModel,
        required: true,
        include: [
          {
            model: OrderModel,
            required: true,
            where: {
              MaKhachHang: customer.MaKhachHang,
            },
          },
          {
            model: VariantModel,
            include: [
              {
                model: ProductModel,
              },
            ],
          },
        ],
      },
    ],
  });

  if (!warranty) {
    throw new ErrorHandler("Không tìm thấy phiếu bảo hành!", 404);
  }

  return warranty;
};

export const requestWarrantyService = async (
  idAccount,
  MaBaoHanh,
  NoiDungXuLy,
  AnhMinhChung,
) => {
  const transaction = await sequelize.transaction();

  try {
    const customer = await CustomerModel.findOne({
      where: {
        MaTaiKhoan: idAccount,
      },
      transaction,
    });

    if (!customer) {
      throw new ErrorHandler("Không tìm thấy khách hàng này!", 404);
    }

    const warranty = await WarrantyModel.findByPk(MaBaoHanh, {
      include: [
        {
          model: OrderDetailModel,
          required: true,
          include: [
            {
              model: OrderModel,
              required: true,
            },
          ],
        },
      ],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!warranty) {
      throw new ErrorHandler("Không tìm thấy phiếu bảo hành!", 404);
    }

    const order = warranty.ChiTietDonHang?.DonHang;

    if (!order || order.MaKhachHang !== customer.MaKhachHang) {
      throw new ErrorHandler(
        "Bạn không có quyền yêu cầu bảo hành phiếu này!",
        403,
      );
    }

    const now = new Date();

    if (Number(warranty.TrangThai) !== WARRANTY_STATUS.ACTIVE) {
      throw new ErrorHandler(
        "Phiếu bảo hành không còn ở trạng thái có thể yêu cầu!",
        400,
      );
    }

    if (new Date(warranty.NgayKetThuc) < now) {
      warranty.TrangThai = WARRANTY_STATUS.EXPIRED;
      await warranty.save({ transaction });

      await WarrantyHistoryModel.create(
        {
          MaBaoHanh,
          HanhDong: WARRANTY_ACTION.HET_HAN,
          NoiDungXuLy: "Phiếu bảo hành đã hết hạn khi khách gửi yêu cầu",
          AnhMinhChung: AnhMinhChung || null,
          TrangThai: WARRANTY_HISTORY_STATUS.REJECTED,
        },
        { transaction },
      );

      await transaction.commit();

      throw new ErrorHandler("Phiếu bảo hành đã hết hạn!", 400);
    }

    warranty.TrangThai = WARRANTY_STATUS.REQUESTED;
    await warranty.save({ transaction });

    await WarrantyHistoryModel.create(
      {
        MaBaoHanh,
        HanhDong: WARRANTY_ACTION.TIEP_NHAN,
        NoiDungXuLy: NoiDungXuLy || "Khách hàng gửi yêu cầu bảo hành",
        AnhMinhChung: AnhMinhChung || null,
        TrangThai: WARRANTY_HISTORY_STATUS.PENDING,
      },
      { transaction },
    );

    const riskResult = await syncWarrantyRisk({
      warranty,
      order,
      note: NoiDungXuLy || "Khách hàng gửi yêu cầu bảo hành",
      status: WARRANTY_STATUS.REQUESTED,
      transaction,
    });

    await transaction.commit();

    await safeCreateAdminNotificationService({
      LoaiThongBao: NOTIFICATION_TYPES.WARRANTY_REQUESTED,
      TieuDe: "Yêu cầu bảo hành mới",
      NoiDung: `Phiếu bảo hành #${MaBaoHanh} của đơn ${order.MaHienThi} vừa được yêu cầu`,
      DuongDan: `/admin/warranties?warrantyId=${MaBaoHanh}`,
    });

    if (riskResult.created && riskResult.risk) {
      await safeCreateAdminNotificationService({
        LoaiThongBao: NOTIFICATION_TYPES.RISK_CREATED,
        MaNhanVien: riskResult.risk.MaNhanVienPhuTrach,
        TieuDe: "Rủi ro mới",
        NoiDung: `Rủi ro #${riskResult.risk.MaRuiRo} được tạo từ bảo hành #${MaBaoHanh}`,
        DuongDan: `/admin/risks?riskId=${riskResult.risk.MaRuiRo}`,
      });
    }

    return await getMyWarrantyByIdService(idAccount, MaBaoHanh);
  } catch (err) {
    if (!transaction.finished) {
      await transaction.rollback();
    }

    if (err.statusCode) {
      throw err;
    }

    throw new ErrorHandler("Lỗi server! Không thể gửi yêu cầu bảo hành!", 500);
  }
};

export const createWarrantyHistoryService = async (
  MaBaoHanh,
  HanhDong,
  NoiDungXuLy,
  TrangThai,
  AnhMinhChung,
  MaNhanVienXuLy,
) => {
  const warranty = await WarrantyModel.findByPk(MaBaoHanh);

  if (!warranty) {
    throw new ErrorHandler("Không tìm thấy phiếu bảo hành!", 404);
  }

  return await WarrantyHistoryModel.create({
    MaBaoHanh,
    HanhDong,
    NoiDungXuLy,
    TrangThai,
    AnhMinhChung,
    MaNhanVienXuLy,
  });
};

export const updateWarrantyStatusService = async (
  MaBaoHanh,
  TrangThai,
  NoiDungXuLy,
  HanhDong,
  AnhMinhChung,
  MaNhanVienXuLy,
) => {
  if (!isValidWarrantyStatus(TrangThai)) {
    throw new ErrorHandler("Trạng thái bảo hành không hợp lệ!", 422);
  }

  const transaction = await sequelize.transaction();

  try {
    const warranty = await WarrantyModel.findByPk(MaBaoHanh, {
      include: [
        {
          model: OrderDetailModel,
          required: true,
          include: [{ model: OrderModel, required: true }],
        },
      ],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!warranty) {
      throw new ErrorHandler("Không tìm thấy phiếu bảo hành!", 404);
    }

    const order = warranty.ChiTietDonHang?.DonHang;

    if (!order) {
      throw new ErrorHandler("Không tìm thấy đơn hàng của phiếu bảo hành!", 404);
    }

    if (
      Number(warranty.TrangThai) === WARRANTY_STATUS.EXPIRED ||
      Number(warranty.TrangThai) === WARRANTY_STATUS.COMPLETED ||
      Number(warranty.TrangThai) === WARRANTY_STATUS.REJECTED
    ) {
      throw new ErrorHandler(
        "Phiếu bảo hành đã kết thúc, không thể cập nhật!",
        400,
      );
    }

    assertValidWarrantyTransition(warranty.TrangThai, TrangThai);

    warranty.TrangThai = Number(TrangThai);
    await warranty.save({ transaction });

    await WarrantyHistoryModel.create(
      {
        MaBaoHanh,
        HanhDong: HanhDong || getActionByWarrantyStatus(TrangThai),
        NoiDungXuLy:
          NoiDungXuLy || `Cập nhật trạng thái bảo hành sang ${TrangThai}`,
        TrangThai: getHistoryStatusByWarrantyStatus(TrangThai),
        AnhMinhChung: AnhMinhChung || null,
        MaNhanVienXuLy: MaNhanVienXuLy || null,
      },
      { transaction },
    );

    await syncWarrantyRisk({
      warranty,
      order,
      note: NoiDungXuLy || "Admin cập nhật trạng thái bảo hành",
      staffId: MaNhanVienXuLy,
      status: TrangThai,
      transaction,
    });

    await transaction.commit();

    await safeCreateAdminNotificationService({
      LoaiThongBao: NOTIFICATION_TYPES.WARRANTY_STATUS_UPDATED,
      TieuDe: "Bảo hành đã cập nhật",
      NoiDung: `Phiếu bảo hành #${MaBaoHanh} đã chuyển trạng thái`,
      DuongDan: `/admin/warranties?warrantyId=${MaBaoHanh}`,
    });

    return await getWarrantyByIdService(MaBaoHanh);
  } catch (err) {
    if (!transaction.finished) {
      await transaction.rollback();
    }

    if (err.statusCode) {
      throw err;
    }

    throw new ErrorHandler("Lỗi server! Không thể cập nhật bảo hành!", 500);
  }
};

export const replaceWarrantyProductService = async (
  MaBaoHanh,
  MaBienTheThayThe,
  SoLuongThayThe,
  NoiDungXuLy,
  MaNhanVienXuLy,
) => {
  const transaction = await sequelize.transaction();

  try {
    const warranty = await WarrantyModel.findByPk(MaBaoHanh, {
      include: [
        {
          model: OrderDetailModel,
          required: true,
          include: [{ model: OrderModel, required: true }],
        },
      ],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!warranty) {
      throw new ErrorHandler("Không tìm thấy phiếu bảo hành!", 404);
    }

    const order = warranty.ChiTietDonHang?.DonHang;

    if (!order) {
      throw new ErrorHandler("Không tìm thấy đơn hàng của phiếu bảo hành!", 404);
    }

    if (Number(warranty.TrangThai) !== WARRANTY_STATUS.PROCESSING) {
      throw new ErrorHandler(
        "Chỉ có thể đổi mới sản phẩm cho phiếu đang xử lý!",
        400,
      );
    }

    const quantity = assertPositiveInteger(
      SoLuongThayThe || 1,
      "Số lượng thay thế không hợp lệ!",
    );

    const variant = await VariantModel.findByPk(MaBienTheThayThe, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!variant) {
      throw new ErrorHandler("Không tìm thấy biến thể sản phẩm thay thế!", 404);
    }

    if (Number(variant.SoLuong) < quantity) {
      throw new ErrorHandler("Không đủ tồn kho để đổi mới sản phẩm!", 400);
    }

    const newStock = Number(variant.SoLuong) - quantity;

    variant.SoLuong = newStock;
    await variant.save({ transaction });

    await InventoryHistoryModel.create(
      {
        MaBienThe: MaBienTheThayThe,
        LoaiGiaoDich: "XUAT_BAO_HANH",
        SoLuongThayDoi: -quantity,
        TonKhoHienTai: newStock,
        LoaiThamChieu: "BaoHanh",
        MaThamChieu: MaBaoHanh,
        GhiChu:
          NoiDungXuLy || `Đổi mới sản phẩm cho phiếu bảo hành #${MaBaoHanh}`,
      },
      { transaction },
    );

    warranty.TrangThai = WARRANTY_STATUS.COMPLETED;
    await warranty.save({ transaction });

    await WarrantyHistoryModel.create(
      {
        MaBaoHanh,
        HanhDong: WARRANTY_ACTION.DOI_MOI,
        NoiDungXuLy:
          NoiDungXuLy ||
          `Đã đổi mới sản phẩm bằng biến thể #${MaBienTheThayThe}`,
        TrangThai: WARRANTY_HISTORY_STATUS.COMPLETED,
        MaNhanVienXuLy: MaNhanVienXuLy || null,
      },
      { transaction },
    );

    await syncWarrantyRisk({
      warranty,
      order,
      note: NoiDungXuLy || "Admin đổi mới sản phẩm bảo hành",
      staffId: MaNhanVienXuLy,
      status: WARRANTY_STATUS.COMPLETED,
      transaction,
    });

    await transaction.commit();

    await safeCreateAdminNotificationService({
      LoaiThongBao: NOTIFICATION_TYPES.WARRANTY_STATUS_UPDATED,
      TieuDe: "Bảo hành đã hoàn tất",
      NoiDung: `Phiếu bảo hành #${MaBaoHanh} đã được đổi mới sản phẩm`,
      DuongDan: `/admin/warranties?warrantyId=${MaBaoHanh}`,
    });

    return await getWarrantyByIdService(MaBaoHanh);
  } catch (err) {
    if (!transaction.finished) {
      await transaction.rollback();
    }

    if (err.statusCode) {
      throw err;
    }

    throw new ErrorHandler(
      "Lỗi server! Không thể đổi mới sản phẩm bảo hành!",
      500,
    );
  }
};

export const exportWarrantyXlsxService = async ({
  search = "",
  status = "all",
  order = "DESC",
  startDate,
  endDate,
} = {}) => {
  const formatMoneyVN = (value) => {
    const number = Number(value || 0);

    return new Intl.NumberFormat("vi-VN").format(number);
  };

  const getWarrantyStatusText = (value) => {
    const statusNumber = Number(value);

    if (statusNumber === WARRANTY_STATUS.EXPIRED) return "Hết hạn";
    if (statusNumber === WARRANTY_STATUS.ACTIVE) return "Còn hiệu lực";
    if (statusNumber === WARRANTY_STATUS.REQUESTED) return "Đang yêu cầu";
    if (statusNumber === WARRANTY_STATUS.PROCESSING) return "Đang xử lý";
    if (statusNumber === WARRANTY_STATUS.COMPLETED) return "Đã hoàn tất";
    if (statusNumber === WARRANTY_STATUS.REJECTED) return "Từ chối";

    return "Không rõ";
  };

  const sortOrder = String(order).toUpperCase() === "ASC" ? "ASC" : "DESC";
  const keyword = String(search || "").trim();

  const warrantyWhere = {};
  const orderWhere = {};

  if (
    status !== "all" &&
    status !== undefined &&
    status !== null &&
    status !== ""
  ) {
    warrantyWhere.TrangThai = Number(status);
  }

  if (startDate || endDate) {
    warrantyWhere.NgayBatDau = {};

    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      warrantyWhere.NgayBatDau[Op.gte] = start;
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      warrantyWhere.NgayBatDau[Op.lte] = end;
    }
  }

  if (keyword) {
    orderWhere[Op.or] = [
      {
        MaHienThi: {
          [Op.like]: `%${keyword}%`,
        },
      },
      {
        TenNguoiNhan: {
          [Op.like]: `%${keyword}%`,
        },
      },
      {
        SDT: {
          [Op.like]: `%${keyword}%`,
        },
      },
    ];
  }

  const warranties = await WarrantyModel.findAll({
    where: warrantyWhere,
    order: [["MaBaoHanh", sortOrder]],
    include: [
      {
        model: OrderDetailModel,
        required: true,
        include: [
          {
            model: OrderModel,
            attributes: [
              "MaDonHang",
              "MaHienThi",
              "TenNguoiNhan",
              "SDT",
              "DiaChiGiaoHang",
              "TrangThaiDonHang",
            ],
            where: orderWhere,
            required: Boolean(keyword),
          },
          {
            model: VariantModel,
            include: [
              {
                model: ProductModel,
              },
            ],
          },
        ],
      },
    ],
  });

  const workbook = createReportWorkbook();
  const worksheet = createReportWorksheet(workbook, "Danh sách bảo hành", {
    columnWidths: [14, 20, 24, 18, 18, 34, 28, 18, 24, 24, 18, 34],
    rowHeights: [28, 28, 26, 14, 34, 22, 22, 14],
  });

  await buildReportHeader({
    workbook,
    worksheet,
    lastColumn: "L",
    title: "BÁO CÁO DANH SÁCH BẢO HÀNH",
    subtitle: buildDateRangeText(startDate, endDate),
  });

  const headers = [
    "Mã bảo hành",
    "Mã đơn hàng",
    "Khách hàng",
    "Số điện thoại",
    "Mã CTĐH",
    "Sản phẩm",
    "Phân loại",
    "Giá mua",
    "Ngày bắt đầu",
    "Ngày kết thúc",
    "Trạng thái",
    "Ghi chú",
  ];

  const headerRow = worksheet.getRow(9);
  headerRow.values = headers;
  styleHeaderRow(headerRow, 32);

  warranties.forEach((warranty, index) => {
    const data = warranty.get({ plain: true });

    const orderDetail = data.ChiTietDonHang || {};
    const order = orderDetail.DonHang || {};
    const variant = orderDetail.BienTheSanPham || {};
    const product = variant.SanPham || {};

    const row = worksheet.getRow(10 + index);

    row.values = [
      data.MaBaoHanh,
      order.MaHienThi || "",
      order.TenNguoiNhan || "",
      order.SDT || "",
      orderDetail.MaCTDH || "",
      product.TenSanPham || "Sản phẩm không xác định",
      variant.TenBienThe || "",
      `${formatMoneyVN(orderDetail.GiaBan)} VNĐ`,
      data.NgayBatDau ? formatDateTimeVN(data.NgayBatDau) : "",
      data.NgayKetThuc ? formatDateTimeVN(data.NgayKetThuc) : "",
      getWarrantyStatusText(data.TrangThai),
      data.GhiChu || "",
    ];

    row.height = 34;
    styleDataRow(row, [1, 2, 4, 5, 8, 9, 10, 11]);

    const statusCell = row.getCell(11);

    if (Number(data.TrangThai) === WARRANTY_STATUS.ACTIVE) {
      statusCell.font = {
        name: "Arial",
        size: 11,
        bold: true,
        color: { argb: "FF008000" },
      };
    } else if (
      Number(data.TrangThai) === WARRANTY_STATUS.EXPIRED ||
      Number(data.TrangThai) === WARRANTY_STATUS.REJECTED
    ) {
      statusCell.font = {
        name: "Arial",
        size: 11,
        bold: true,
        color: { argb: "FFFF0000" },
      };
    } else if (Number(data.TrangThai) === WARRANTY_STATUS.PROCESSING) {
      statusCell.font = {
        name: "Arial",
        size: 11,
        bold: true,
        color: { argb: "FF1F4E78" },
      };
    }
  });

  worksheet.autoFilter = "A9:L9";

  const lastRow = worksheet.lastRow?.number || 9;

  worksheet.mergeCells(`A${lastRow + 2}:L${lastRow + 2}`);
  const totalCell = worksheet.getCell(`A${lastRow + 2}`);
  totalCell.value = `Tổng số phiếu bảo hành: ${warranties.length}`;
  totalCell.font = {
    name: "Arial",
    size: 12,
    bold: true,
    color: { argb: "FF173B63" },
  };
  totalCell.alignment = {
    vertical: "middle",
    horizontal: "right",
  };

  const buffer = await workbook.xlsx.writeBuffer();

  return buffer;
};
