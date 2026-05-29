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
} from "../models/index.js";
import ErrorHandler from "../utils/error_handler.js";
import { Op } from "sequelize";
import ExcelJS from "exceljs";
import axios from "axios";
import {
  NOTIFICATION_TYPES,
  safeCreateAdminNotificationService,
} from "./adminNotifications.service.js";

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

  const orderWhere = {};

  if (search) {
    orderWhere[Op.or] = [
      { MaHienThi: { [Op.like]: `%${search}%` } },
      { TenNguoiNhan: { [Op.like]: `%${search}%` } },
      { SDT: { [Op.like]: `%${search}%` } },
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
            where: orderWhere,
            required: Boolean(search),
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

    await transaction.commit();

    await safeCreateAdminNotificationService({
      LoaiThongBao: NOTIFICATION_TYPES.WARRANTY_REQUESTED,
      TieuDe: "Yêu cầu bảo hành mới",
      NoiDung: `Phiếu bảo hành #${MaBaoHanh} của đơn ${order.MaHienThi} vừa được yêu cầu`,
      DuongDan: `/admin/warranties`,
    });

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
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!warranty) {
      throw new ErrorHandler("Không tìm thấy phiếu bảo hành!", 404);
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

    await transaction.commit();

    await safeCreateAdminNotificationService({
      LoaiThongBao: NOTIFICATION_TYPES.WARRANTY_STATUS_UPDATED,
      TieuDe: "Bảo hành đã cập nhật",
      NoiDung: `Phiếu bảo hành #${MaBaoHanh} đã chuyển trạng thái`,
      DuongDan: `/admin/warranties`,
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
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!warranty) {
      throw new ErrorHandler("Không tìm thấy phiếu bảo hành!", 404);
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

    await transaction.commit();

    await safeCreateAdminNotificationService({
      LoaiThongBao: NOTIFICATION_TYPES.WARRANTY_STATUS_UPDATED,
      TieuDe: "Bảo hành đã hoàn tất",
      NoiDung: `Phiếu bảo hành #${MaBaoHanh} đã được đổi mới sản phẩm`,
      DuongDan: `/admin/warranties`,
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
  const VIETNAM_TIME_ZONE = "Asia/Ho_Chi_Minh";

  const formatDateTimeVN = (value = new Date()) => {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return new Intl.DateTimeFormat("vi-VN", {
      timeZone: VIETNAM_TIME_ZONE,
      hour12: false,
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(date);
  };

  const formatDateOnlyVN = (value) => {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return new Intl.DateTimeFormat("vi-VN", {
      timeZone: VIETNAM_TIME_ZONE,
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

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

  const workbook = new ExcelJS.Workbook();

  workbook.creator = "CERAMIC-SHOP";
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet("Danh sách bảo hành", {
    properties: {
      defaultRowHeight: 24,
    },
    pageSetup: {
      paperSize: 9,
      orientation: "landscape",
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      horizontalCentered: true,
      margins: {
        left: 0.3,
        right: 0.3,
        top: 0.5,
        bottom: 0.5,
        header: 0.2,
        footer: 0.2,
      },
    },
  });

  worksheet.views = [
    {
      state: "frozen",
      ySplit: 9,
      showGridLines: false,
      zoomScale: 90,
    },
  ];

  const colWidths = [14, 20, 24, 18, 18, 34, 28, 18, 24, 24, 18, 34];

  colWidths.forEach((width, index) => {
    worksheet.getColumn(index + 1).width = width;
  });

  worksheet.getRow(1).height = 28;
  worksheet.getRow(2).height = 28;
  worksheet.getRow(3).height = 26;
  worksheet.getRow(4).height = 14;
  worksheet.getRow(5).height = 34;
  worksheet.getRow(6).height = 22;
  worksheet.getRow(7).height = 22;
  worksheet.getRow(8).height = 14;

  for (let row = 1; row <= 8; row += 1) {
    for (let col = 1; col <= 12; col += 1) {
      worksheet.getCell(row, col).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFFFFFFF" },
      };
    }
  }

  worksheet.mergeCells("A1:A3");
  worksheet.mergeCells("B1:E2");
  worksheet.mergeCells("B3:E3");

  try {
    const response = await axios.get(
      "https://res.cloudinary.com/dcmwz0uis/image/upload/v1773973973/logo_otxplb.png",
      {
        responseType: "arraybuffer",
      },
    );

    const logoId = workbook.addImage({
      buffer: Buffer.from(response.data),
      extension: "png",
    });

    worksheet.addImage(logoId, {
      tl: { col: 0.15, row: 0.32 },
      ext: { width: 100, height: 100 },
      editAs: "oneCell",
    });
  } catch (error) {
    console.error("Không tải được logo:", error.message);
  }

  const shopNameCell = worksheet.getCell("B1");
  shopNameCell.value = "CERAMIC-SHOP";
  shopNameCell.font = {
    name: "Times New Roman",
    size: 22,
    bold: true,
    color: { argb: "FF173B63" },
  };
  shopNameCell.alignment = {
    vertical: "bottom",
    horizontal: "left",
  };

  const sloganCell = worksheet.getCell("B3");
  sloganCell.value = "Tinh hoa gốm sứ Việt";
  sloganCell.font = {
    name: "Arial",
    size: 11,
    italic: true,
    color: { argb: "FFC28A5D" },
  };
  sloganCell.alignment = {
    vertical: "top",
    horizontal: "left",
  };

  worksheet.mergeCells("A4:L4");
  worksheet.getCell("A4").border = {
    bottom: {
      style: "medium",
      color: { argb: "FF2F6B3F" },
    },
  };

  worksheet.mergeCells("A5:L5");
  const reportTitleCell = worksheet.getCell("A5");
  reportTitleCell.value = "BÁO CÁO DANH SÁCH BẢO HÀNH";
  reportTitleCell.font = {
    name: "Arial",
    size: 18,
    bold: true,
    color: { argb: "FF173B63" },
  };
  reportTitleCell.alignment = {
    vertical: "middle",
    horizontal: "center",
  };

  worksheet.mergeCells("A6:L6");
  const exportDateCell = worksheet.getCell("A6");
  exportDateCell.value = `Ngày xuất: ${formatDateTimeVN(new Date())}`;
  exportDateCell.font = {
    name: "Arial",
    size: 11,
    italic: true,
    color: { argb: "FF666666" },
  };
  exportDateCell.alignment = {
    vertical: "middle",
    horizontal: "center",
  };

  let dateRangeText = "Thời gian dữ liệu: Tất cả";

  if (startDate && endDate) {
    dateRangeText = `Thời gian dữ liệu: Từ ${formatDateOnlyVN(startDate)} đến ${formatDateOnlyVN(endDate)}`;
  } else if (startDate) {
    dateRangeText = `Thời gian dữ liệu: Từ ${formatDateOnlyVN(startDate)}`;
  } else if (endDate) {
    dateRangeText = `Thời gian dữ liệu: Đến ${formatDateOnlyVN(endDate)}`;
  }

  worksheet.mergeCells("A7:L7");
  const dateRangeCell = worksheet.getCell("A7");
  dateRangeCell.value = dateRangeText;
  dateRangeCell.font = {
    name: "Arial",
    size: 11,
    italic: true,
    color: { argb: "FF666666" },
  };
  dateRangeCell.alignment = {
    vertical: "middle",
    horizontal: "center",
  };

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
  headerRow.height = 32;

  headerRow.eachCell((cell) => {
    cell.font = {
      name: "Arial",
      size: 11,
      bold: true,
      color: { argb: "FFFFFFFF" },
    };

    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF1F4E78" },
    };

    cell.alignment = {
      vertical: "middle",
      horizontal: "center",
      wrapText: true,
    };

    cell.border = {
      top: { style: "thin", color: { argb: "FFD9E2F3" } },
      left: { style: "thin", color: { argb: "FFD9E2F3" } },
      bottom: { style: "thin", color: { argb: "FFD9E2F3" } },
      right: { style: "thin", color: { argb: "FFD9E2F3" } },
    };
  });

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

    row.eachCell((cell, colNumber) => {
      cell.font = {
        name: "Arial",
        size: 11,
      };

      cell.alignment = {
        vertical: "middle",
        horizontal: [1, 2, 4, 5, 8, 9, 10, 11].includes(colNumber)
          ? "center"
          : "left",
        wrapText: true,
      };

      cell.border = {
        top: { style: "thin", color: { argb: "FFD9E2F3" } },
        left: { style: "thin", color: { argb: "FFD9E2F3" } },
        bottom: { style: "thin", color: { argb: "FFD9E2F3" } },
        right: { style: "thin", color: { argb: "FFD9E2F3" } },
      };
    });

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
