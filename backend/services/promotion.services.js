import {
  CategoryModel,
  PromotionModel,
  PromotionTypeModel,
} from "../models/index.js";
import ErrorHandler from "../utils/error_handler.js";
import { Op } from "sequelize";
import {
  buildDateRangeText,
  buildReportHeader,
  createReportWorkbook,
  createReportWorksheet,
  formatDateTimeVN,
  styleDataRow,
  styleHeaderRow,
} from "../utils/excelReport.js";

const promotionInclude = [
  {
    model: PromotionTypeModel,
    attributes: ["MaLoaiKM", "TenLoaiKM"],
    required: false,
  },
  {
    model: CategoryModel,
    attributes: ["MaDanhMuc", "TenDanhMuc", "ParentID"],
    required: false,
  },
];

const findPromotionWithRelations = async (MaKhuyenMai) => {
  return await PromotionModel.findByPk(MaKhuyenMai, {
    include: promotionInclude,
  });
};

const assertCategoryExists = async (MaDanhMuc) => {
  if (MaDanhMuc === null || MaDanhMuc === undefined) {
    return;
  }

  if (Number.isNaN(Number(MaDanhMuc))) {
    throw new ErrorHandler("Danh mục áp dụng không hợp lệ", 422);
  }

  const category = await CategoryModel.findByPk(MaDanhMuc);

  if (!category) {
    throw new ErrorHandler("Danh mục áp dụng không tồn tại", 422);
  }
};

export const getAllPromotionsService = async () => {
  const now = new Date();

  return await PromotionModel.findAll({
    where: {
      TrangThai: 1,
      NgayBatDau: {
        [Op.lte]: now,
      },
      NgayKetThuc: {
        [Op.gte]: now,
      },
    },
    include: promotionInclude,
    order: [
      ["NgayKetThuc", "ASC"],
      ["TrangThai", "DESC"],
    ],
  });
};

export const getAllPromotionsAdminService = async () => {
  return await PromotionModel.findAll({
    include: promotionInclude,
    order: [
      ["NgayKetThuc", "ASC"],
      ["TrangThai", "DESC"],
    ],
  });
};

export const getPromotionByIDAdminService = async (MaKhuyenMai) => {
  const promotion = await findPromotionWithRelations(MaKhuyenMai);

  if (!promotion) {
    throw new ErrorHandler("Mã này không tồn tại", 404);
  }

  return promotion;
};

export const createPromotionService = async (
  MaLoaiKM,
  TenKhuyenMai,
  GiaTri,
  GiaTriToiThieu,
  GiamToiDa,
  NgayBatDau,
  NgayKetThuc,
  TrangThai,
  MaCode,
  SoLuong,
  LoaiVoucher,
  MaDanhMuc,
) => {
  await assertCategoryExists(MaDanhMuc);

  if (MaCode) {
    const isExist = await PromotionModel.findOne({
      where: {
        MaCode,
      },
    });

    if (isExist) {
      throw new ErrorHandler("Mã Code này đã tồn tại", 422);
    }
  }

  const promotion = await PromotionModel.create({
    MaLoaiKM,
    TenKhuyenMai,
    GiaTri,
    GiaTriToiThieu,
    GiamToiDa,
    NgayBatDau,
    NgayKetThuc,
    TrangThai,
    MaCode,
    SoLuong,
    LoaiVoucher,
    MaDanhMuc,
  });

  return await findPromotionWithRelations(promotion.MaKhuyenMai);
};

export const updatePromotionService = async (
  MaKhuyenMai,
  MaLoaiKM,
  TenKhuyenMai,
  GiaTri,
  GiaTriToiThieu,
  GiamToiDa,
  NgayBatDau,
  NgayKetThuc,
  TrangThai,
  MaCode,
  SoLuong,
  LoaiVoucher,
  MaDanhMuc,
) => {
  const isExist = await PromotionModel.findByPk(MaKhuyenMai);

  if (!isExist) {
    throw new ErrorHandler("Mã này không tồn tại", 404);
  }

  await assertCategoryExists(MaDanhMuc);

  if (MaCode) {
    const promo = await PromotionModel.findOne({
      where: {
        MaCode,
        MaKhuyenMai: {
          [Op.ne]: MaKhuyenMai,
        },
      },
    });

    if (promo) {
      throw new ErrorHandler("Mã Code này đã tồn tại", 422);
    }
  }

  await PromotionModel.update(
    {
      MaLoaiKM,
      TenKhuyenMai,
      GiaTri,
      GiaTriToiThieu,
      GiamToiDa,
      NgayBatDau,
      NgayKetThuc,
      TrangThai,
      MaCode,
      SoLuong,
      LoaiVoucher,
      MaDanhMuc,
    },
    {
      where: {
        MaKhuyenMai,
      },
    },
  );

  return await findPromotionWithRelations(MaKhuyenMai);
};

export const updatePromotionStatusService = async (MaKhuyenMai, TrangThai) => {
  const isExist = await PromotionModel.findByPk(MaKhuyenMai);

  if (!isExist) {
    throw new ErrorHandler("Mã này không tồn tại", 404);
  }

  await PromotionModel.update(
    {
      TrangThai,
    },
    {
      where: {
        MaKhuyenMai,
      },
    },
  );

  return await findPromotionWithRelations(MaKhuyenMai);
};

export const exportPromotionXlsxService = async ({
  search = "",
  status = "all",
  type = "all",
  order = "DESC",
  startDate,
  endDate,
} = {}) => {
  const formatMoneyVN = (value) => {
    const number = Number(value || 0);

    return new Intl.NumberFormat("vi-VN").format(number);
  };

  const sortOrder = String(order).toUpperCase() === "ASC" ? "ASC" : "DESC";
  const keyword = String(search || "").trim();
  const now = new Date();

  const whereCondition = {};

  if (keyword) {
    whereCondition[Op.or] = [
      {
        TenKhuyenMai: {
          [Op.like]: `%${keyword}%`,
        },
      },
      {
        MaCode: {
          [Op.like]: `%${keyword}%`,
        },
      },
    ];
  }

  if (type !== "all") {
    whereCondition.LoaiVoucher = Number(type);
  }

  if (status === "active") {
    whereCondition.TrangThai = 1;
    whereCondition.NgayBatDau = {
      [Op.lte]: now,
    };
    whereCondition.NgayKetThuc = {
      [Op.gte]: now,
    };
  } else if (status === "pending") {
    whereCondition.TrangThai = 1;
    whereCondition.NgayBatDau = {
      [Op.gt]: now,
    };
  } else if (status === "expired") {
    whereCondition[Op.or] = [
      {
        TrangThai: 0,
      },
      {
        NgayKetThuc: {
          [Op.lt]: now,
        },
      },
    ];
  }

  if (startDate || endDate) {
    whereCondition.NgayBatDau = whereCondition.NgayBatDau || {};

    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      whereCondition.NgayBatDau[Op.gte] = start;
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      whereCondition.NgayBatDau[Op.lte] = end;
    }
  }

  const promotions = await PromotionModel.findAll({
    where: whereCondition,
    order: [["MaKhuyenMai", sortOrder]],
  });

  const workbook = createReportWorkbook();
  const worksheet = createReportWorksheet(workbook, "Danh sách khuyến mãi", {
    columnWidths: [16, 36, 22, 20, 18, 20, 20, 18, 24, 24, 18, 20],
  });

  await buildReportHeader({
    workbook,
    worksheet,
    lastColumn: "L",
    title: "BÁO CÁO DANH SÁCH KHUYẾN MÃI",
    subtitle: buildDateRangeText(startDate, endDate),
  });

  const headers = [
    "Mã khuyến mãi",
    "Tên khuyến mãi",
    "Mã code",
    "Loại khuyến mãi",
    "Loại voucher",
    "Giá trị",
    "Giá trị tối thiểu",
    "Giảm tối đa",
    "Số lượng",
    "Ngày bắt đầu",
    "Ngày kết thúc",
    "Trạng thái",
  ];

  const headerRow = worksheet.getRow(9);
  headerRow.values = headers;
  styleHeaderRow(headerRow, 30);

  promotions.forEach((promo, index) => {
    const data = promo.get({ plain: true });

    const loaiKhuyenMaiStr =
      Number(data.MaLoaiKM) === 1 ? "Phần trăm" : "Tiền mặt";
    const loaiVoucherStr =
      Number(data.LoaiVoucher) === 1 ? "Giảm đơn hàng" : "Freeship";

    const giaTriStr =
      Number(data.MaLoaiKM) === 1
        ? `${formatMoneyVN(data.GiaTri)}%`
        : `${formatMoneyVN(data.GiaTri)} VNĐ`;

    const giaTriToiThieuStr = data.GiaTriToiThieu
      ? `${formatMoneyVN(data.GiaTriToiThieu)} VNĐ`
      : "";

    const giamToiDaStr = data.GiamToiDa
      ? `${formatMoneyVN(data.GiamToiDa)} VNĐ`
      : "";

    let trangThaiStr = "Đã tắt";

    if (Number(data.TrangThai) === 1) {
      const start = data.NgayBatDau ? new Date(data.NgayBatDau) : null;
      const end = data.NgayKetThuc ? new Date(data.NgayKetThuc) : null;

      if (start && start > now) {
        trangThaiStr = "Chưa bắt đầu";
      } else if (end && end < now) {
        trangThaiStr = "Đã hết hạn";
      } else {
        trangThaiStr = "Đang hoạt động";
      }
    }

    const row = worksheet.getRow(10 + index);

    row.values = [
      data.MaKhuyenMai,
      data.TenKhuyenMai || "",
      data.MaCode || "Không có",
      loaiKhuyenMaiStr,
      loaiVoucherStr,
      giaTriStr,
      giaTriToiThieuStr,
      giamToiDaStr,
      data.SoLuong ?? 0,
      data.NgayBatDau ? formatDateTimeVN(data.NgayBatDau) : "",
      data.NgayKetThuc ? formatDateTimeVN(data.NgayKetThuc) : "",
      trangThaiStr,
    ];

    row.height = 32;
    styleDataRow(row, [1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  worksheet.autoFilter = "A9:L9";

  const buffer = await workbook.xlsx.writeBuffer();

  return buffer;
};
