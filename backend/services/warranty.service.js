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

    return await getWarrantyByIdService(MaBaoHanh);
  } catch (err) {
    if (!transaction.finished) {
      await transaction.rollback();
    }

    if (err.statusCode) {
      throw err;
    }

    throw new ErrorHandler("Lỗi server! Không thể đổi mới sản phẩm bảo hành!", 500);
  }
};