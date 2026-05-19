import { PromotionModel } from "../models/index.js";
import ExcelJS from "exceljs";
import ErrorHandler from "../utils/error_handler.js";
import { Op } from "sequelize";
import axios from "axios";

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
    order: [
      ["NgayKetThuc", "ASC"],
      ["TrangThai", "DESC"],
    ],
  });
};

export const getAllPromotionsAdminService = async () => {
  return await PromotionModel.findAll({
    order: [
      ["NgayKetThuc", "ASC"],
      ["TrangThai", "DESC"],
    ],
  });
};

export const getPromotionByIDAdminService = async (MaKhuyenMai) => {
  const promotion = await PromotionModel.findByPk(MaKhuyenMai);

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

  return await PromotionModel.create({
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

  return await PromotionModel.findByPk(MaKhuyenMai);
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

  return await PromotionModel.findByPk(MaKhuyenMai);
};

export const exportPromotionXlsxService = async ({
  search = "",
  status = "all",
  type = "all",
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

  const workbook = new ExcelJS.Workbook();

  workbook.creator = "CERAMIC-SHOP";
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet("Danh sách khuyến mãi", {
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

  const colWidths = [16, 36, 22, 20, 18, 20, 20, 18, 24, 24, 18, 20];

  colWidths.forEach((width, index) => {
    worksheet.getColumn(index + 1).width = width;
  });

  worksheet.getRow(1).height = 24;
  worksheet.getRow(2).height = 24;
  worksheet.getRow(3).height = 22;
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
  const dividerCell = worksheet.getCell("A4");
  dividerCell.border = {
    bottom: { style: "medium", color: { argb: "FF2F6B3F" } },
  };

  worksheet.mergeCells("A5:L5");
  const reportTitleCell = worksheet.getCell("A5");
  reportTitleCell.value = "BÁO CÁO DANH SÁCH KHUYẾN MÃI";
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
  headerRow.height = 30;

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

    row.eachCell((cell, colNumber) => {
      cell.font = {
        name: "Arial",
        size: 11,
      };

      cell.alignment = {
        vertical: "middle",
        horizontal: [1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].includes(colNumber)
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
  });

  worksheet.autoFilter = "A9:L9";

  const buffer = await workbook.xlsx.writeBuffer();

  return buffer;
};
