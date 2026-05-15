import { Op } from "sequelize";
import ExcelJS from "exceljs";
import axios from "axios";
import {
  InventoryHistoryModel,
  OrderModel,
  VariantModel,
  ProductModel,
} from "../models/index.js";
import { adminGetOrderDetailService } from "../services/order.services.js";

export const getAllInventoryHistoryService = async (
  page = 1,
  limit = 10,
  search = "",
  order = "DESC",
) => {
  const currentPage = Math.max(Number(page) || 1, 1);
  const currentLimit = Math.max(Number(limit) || 10, 1);
  const offset = (currentPage - 1) * currentLimit;

  const sortOrder = String(order).toUpperCase() === "ASC" ? "ASC" : "DESC";
  const keyword = search.trim();

  const { rows, count } = await InventoryHistoryModel.findAndCountAll({
    LoaiThamChieu: { [Op.ne]: "Phiếu Nhập" },
    include: [
      {
        model: OrderModel,
        as: "DonHang",
        where: keyword
          ? {
              MaHienThi: {
                [Op.like]: `%${keyword}%`,
              },
            }
          : undefined,
        required: !!keyword,
      },
    ],
    order: [["MaLichSu", sortOrder]],
    limit: currentLimit,
    offset,
    distinct: true,
  });

  return {
    data: rows,
    pagination: {
      total: count,
      page: currentPage,
      limit: currentLimit,
      totalPages: Math.ceil(count / currentLimit),
    },
  };
};

export const showInventoryHistoryService = async (idInventory) => {
  const history = await InventoryHistoryModel.findOne({
    where: {
      MaLichSu: idInventory,
      LoaiThamChieu: { [Op.ne]: "Phiếu Nhập" },
    },
    include: [
      {
        model: OrderModel,
        as: "DonHang",
      },
    ],
  });

  const orderID = history?.DonHang?.MaHienThi;

  const orderDetail = orderID
    ? await adminGetOrderDetailService(orderID)
    : null;

  return {
    history,
    orderDetail,
  };
};

export const exportInventoryHistoryXlsxService = async (
  search = "",
  order = "DESC",
  startDate,
  endDate,
) => {
  const sortOrder = String(order).toUpperCase() === "ASC" ? "ASC" : "DESC";
  const keyword = String(search || "").trim();

  const whereCondition = {
    LoaiThamChieu: {
      [Op.ne]: "Phiếu Nhập",
    },
  };

  if (startDate || endDate) {
    whereCondition.NgayTao = {};

    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      whereCondition.NgayTao[Op.gte] = start;
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      whereCondition.NgayTao[Op.lte] = end;
    }
  }

  const histories = await InventoryHistoryModel.findAll({
    where: whereCondition,
    include: [
      {
        model: OrderModel,
        as: "DonHang",
        where: keyword
          ? {
              MaHienThi: {
                [Op.like]: `%${keyword}%`,
              },
            }
          : undefined,
        required: !!keyword,
      },
      {
        model: VariantModel,
        attributes: ["MaBienThe", "TenBienThe"],
        required: false,
        include: [
          {
            model: ProductModel,
            attributes: ["MaSanPham", "TenSanPham"],
            required: false,
          },
        ],
      },
    ],
    order: [["MaLichSu", sortOrder]],
  });

  const workbook = new ExcelJS.Workbook();

  workbook.creator = "CERAMIC-SHOP";
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet("Lịch sử tồn kho", {
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

  const colWidths = [14, 42, 24, 20, 20, 20, 18, 22, 26, 46];

  colWidths.forEach((width, index) => {
    worksheet.getColumn(index + 1).width = width;
  });

  worksheet.getRow(1).height = 28;
  worksheet.getRow(2).height = 26;
  worksheet.getRow(3).height = 22;
  worksheet.getRow(4).height = 16;
  worksheet.getRow(5).height = 30;
  worksheet.getRow(6).height = 22;
  worksheet.getRow(7).height = 22;
  worksheet.getRow(8).height = 14;

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
      tl: { col: 0.2, row: 0.15 },
      ext: { width: 115, height: 78 },
    });
  } catch (error) {
    console.error("Không tải được logo:", error.message);
  }

  worksheet.mergeCells("B1:E2");
  const shopNameCell = worksheet.getCell("B1");
  shopNameCell.value = "C E R A M I C - S H O P";
  shopNameCell.font = {
    name: "Times New Roman",
    size: 22,
    bold: true,
    color: { argb: "FF173B63" },
  };
  shopNameCell.alignment = {
    vertical: "middle",
    horizontal: "left",
  };

  worksheet.mergeCells("B3:E3");
  const sloganCell = worksheet.getCell("B3");
  sloganCell.value = "T I N H   H O A   G Ố M   S Ứ   V I Ệ T";
  sloganCell.font = {
    name: "Arial",
    size: 10,
    color: { argb: "FFC28A5D" },
  };
  sloganCell.alignment = {
    vertical: "middle",
    horizontal: "left",
  };

  worksheet.mergeCells("A5:J5");
  const reportTitleCell = worksheet.getCell("A5");
  reportTitleCell.value = "BÁO CÁO LỊCH SỬ TỒN KHO";
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

  worksheet.mergeCells("A6:J6");
  const exportDateCell = worksheet.getCell("A6");
  exportDateCell.value = `Ngày xuất: ${new Date().toLocaleString("vi-VN")}`;
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

  const formatDateOnly = (value) => {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleDateString("vi-VN");
  };

  let dateRangeText = "Thời gian dữ liệu: Tất cả";

  if (startDate && endDate) {
    dateRangeText = `Thời gian dữ liệu: Từ ${formatDateOnly(startDate)} đến ${formatDateOnly(endDate)}`;
  } else if (startDate) {
    dateRangeText = `Thời gian dữ liệu: Từ ${formatDateOnly(startDate)}`;
  } else if (endDate) {
    dateRangeText = `Thời gian dữ liệu: Đến ${formatDateOnly(endDate)}`;
  }

  worksheet.mergeCells("A7:J7");
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
    "Mã lịch sử",
    "Sản phẩm",
    "Loại giao dịch",
    "Số lượng thay đổi",
    "Tồn kho hiện tại",
    "Loại tham chiếu",
    "Mã tham chiếu",
    "Mã đơn hàng",
    "Ngày tạo",
    "Ghi chú",
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

  histories.forEach((item, index) => {
    const history = item.get({ plain: true });

    const variant =
      history.BienTheSanPham ||
      history.Variant ||
      history.VariantModel ||
      history.variant ||
      {};

    const product =
      variant.SanPham ||
      variant.Product ||
      variant.ProductModel ||
      variant.product ||
      {};

    const productName = product.TenSanPham || "";
    const variantName = variant.TenBienThe || "";

    const productDisplay = [productName, variantName]
      .filter(Boolean)
      .join(" - ");

    const row = worksheet.getRow(10 + index);

    row.values = [
      history.MaLichSu,
      productDisplay || `Biến thể #${history.MaBienThe || ""}`,
      history.LoaiGiaoDich || "",
      history.SoLuongThayDoi ?? 0,
      history.TonKhoHienTai ?? 0,
      history.LoaiThamChieu || "",
      history.MaThamChieu || "",
      history.DonHang?.MaHienThi || "",
      history.NgayTao ? new Date(history.NgayTao).toLocaleString("vi-VN") : "",
      history.GhiChu || "",
    ];

    row.height = 32;

    row.eachCell((cell, colNumber) => {
      cell.font = {
        name: "Arial",
        size: 11,
      };

      cell.alignment = {
        vertical: "middle",
        horizontal: [1, 4, 5, 7, 8, 9].includes(colNumber) ? "center" : "left",
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

  worksheet.getColumn(4).numFmt = "#,##0";
  worksheet.getColumn(5).numFmt = "#,##0";

  worksheet.autoFilter = "A9:J9";

  const buffer = await workbook.xlsx.writeBuffer();

  return buffer;
};
