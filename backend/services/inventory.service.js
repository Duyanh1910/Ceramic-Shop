import { Op } from "sequelize";
import ExcelJS from "exceljs";
import axios from "axios";
import {
  InventoryHistoryModel,
  OrderDetailModel,
  OrderModel,
  ProductModel,
  ReceivedNoteModel,
  ReturnModel,
  SupplierModel,
  VariantImageModel,
  VariantModel
} from "../models/index.js";
import { adminGetOrderDetailService } from "../services/order.services.js";

const normalizeText = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

const normalizeReferenceType = (value) =>
  String(value || "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/\s+/g, "")
    .toUpperCase();

const isReturnInventoryReference = (history) => {
  const referenceType = normalizeReferenceType(history.LoaiThamChieu);
  const transactionType = normalizeReferenceType(history.LoaiGiaoDich);

  return (
    referenceType === "DOITRA" ||
    referenceType === "DOI_TRA" ||
    transactionType === "XUAT_DOI_HANG" ||
    transactionType === "XUAT_GUI_BO_SUNG" ||
    transactionType === "NHAP_LAI_DOI_TRA"
  );
};

const isReceivedNoteInventoryReference = (history) => {
  const referenceType = normalizeReferenceType(history.LoaiThamChieu);
  const transactionType = normalizeReferenceType(history.LoaiGiaoDich);

  return (
    referenceType === "PHIEUNHAP" ||
    referenceType === "PHIEU_NHAP" ||
    referenceType === "NHAPKHO" ||
    referenceType === "NHAP_KHO" ||
    transactionType === "NHAPKHO" ||
    transactionType === "NHAP_KHO"
  );
};

const toPlain = (row) =>
  row && typeof row.get === "function" ? row.get({ plain: true }) : row;

const enrichInventoryHistories = async (rows) => {
  const histories = rows.map(toPlain).filter(Boolean);

  const returnIds = [
    ...new Set(
      histories
        .filter(isReturnInventoryReference)
        .map((history) => Number(history.MaThamChieu))
        .filter((id) => Number.isInteger(id) && id > 0),
    ),
  ];

  let returnMap = new Map();

  if (returnIds.length > 0) {
    const returns = await ReturnModel.findAll({
      where: {
        MaDoiTra: {
          [Op.in]: returnIds,
        },
      },
      include: [
        {
          model: OrderDetailModel,
          required: false,
          include: [
            {
              model: OrderModel,
              required: false,
            },
          ],
        },
      ],
    });

    returnMap = new Map(
      returns.map((item) => {
        const plain = item.get({ plain: true });
        return [Number(plain.MaDoiTra), plain];
      }),
    );
  }

  return histories.map((history) => {
    const relatedOrderFromReturn = (() => {
      if (!isReturnInventoryReference(history)) return null;

      const returnRequest = returnMap.get(Number(history.MaThamChieu));

      return (
        returnRequest?.ChiTietDonHang?.DonHang ||
        returnRequest?.OrderDetail?.DonHang ||
        null
      );
    })();

    const returnRequest = isReturnInventoryReference(history)
      ? returnMap.get(Number(history.MaThamChieu)) || null
      : null;

    return {
      ...history,
      DoiTra: returnRequest,
      DonHang: history.DonHang || relatedOrderFromReturn || null,
      PhieuNhap: isReceivedNoteInventoryReference(history)
        ? history.PhieuNhap || null
        : null,

      MaDonHangLienQuan:
        history.DonHang?.MaDonHang || relatedOrderFromReturn?.MaDonHang || null,

      MaHienThiLienQuan:
        history.DonHang?.MaHienThi || relatedOrderFromReturn?.MaHienThi || null,

      MaPhieuNhapLienQuan: isReceivedNoteInventoryReference(history)
        ? history.PhieuNhap?.MaPhieuNhap || history.MaThamChieu || null
        : null,

      TenNhaCungCapLienQuan: isReceivedNoteInventoryReference(history)
        ? history.PhieuNhap?.NhaCungCap?.TenNhaCC || null
        : null,
    };
  });
};

const filterInventoryHistoryByKeyword = (histories, keyword) => {
  const normalizedKeyword = normalizeText(keyword);

  if (!normalizedKeyword) {
    return histories;
  }

  return histories.filter((history) => {
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

    const searchableValues = [
      history.DonHang?.MaHienThi,
      history.MaHienThiLienQuan,

      history.PhieuNhap?.MaPhieuNhap,
      history.MaPhieuNhapLienQuan,
      history.PhieuNhap?.NhaCungCap?.TenNhaCC,
      history.TenNhaCungCapLienQuan,

      history.MaThamChieu,
      history.LoaiGiaoDich,
      history.LoaiThamChieu,
      history.GhiChu,

      variant.TenBienThe,
      product.TenSanPham,
    ];

    return searchableValues.some((value) =>
      normalizeText(value).includes(normalizedKeyword),
    );
  });
};

const getProductDisplay = (history) => {
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

  return (
    [productName, variantName].filter(Boolean).join(" - ") ||
    `Biến thể #${history.MaBienThe || ""}`
  );
};

const getRelatedReferenceCode = (history) => {
  if (isReceivedNoteInventoryReference(history)) {
    return history.PhieuNhap?.MaPhieuNhap || history.MaPhieuNhapLienQuan || "";
  }

  return history.DonHang?.MaHienThi || history.MaHienThiLienQuan || "";
};

const buildInventoryHistoryWhere = (startDate, endDate, extra = {}) => {
  const where = {
    ...extra,
  };

  if (startDate || endDate) {
    where.NgayTao = {};

    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      where.NgayTao[Op.gte] = start;
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      where.NgayTao[Op.lte] = end;
    }
  }

  return where;
};

const inventoryHistoryInclude = [
  {
    model: OrderModel,
    as: "DonHang",
    required: false,
  },
  {
    model: ReceivedNoteModel,
    as: "PhieuNhap",
    required: false,
    include: [
      {
        model: SupplierModel,
        required: false,
      },
    ],
  },
  {
    model: VariantModel,
    attributes: ["MaBienThe", "TenBienThe"],
    required: false,
    include: [
      {
        model: ProductModel,
        attributes: ["MaSanPham", "TenSanPham", "Thumbnail"],
        required: false,
      },
      {
        model: VariantImageModel,
        required: false,
      },
    ],
  },
];

export const getAllInventoryHistoryService = async (
  page = 1,
  limit = 10,
  search = "",
  order = "DESC",
  startDate,
  endDate,
) => {
  const currentPage = Math.max(Number(page) || 1, 1);
  const currentLimit = Math.max(Number(limit) || 10, 1);
  const offset = (currentPage - 1) * currentLimit;
  const sortOrder = String(order).toUpperCase() === "ASC" ? "ASC" : "DESC";
  const keyword = String(search || "").trim();

  const rows = await InventoryHistoryModel.findAll({
    where: buildInventoryHistoryWhere(startDate, endDate),
    include: inventoryHistoryInclude,
    order: [["MaLichSu", sortOrder]],
  });

  const enrichedHistories = await enrichInventoryHistories(rows);

  const filteredHistories = filterInventoryHistoryByKeyword(
    enrichedHistories,
    keyword,
  );

  const paginatedHistories = filteredHistories.slice(
    offset,
    offset + currentLimit,
  );

  return {
    data: paginatedHistories,
    pagination: {
      total: filteredHistories.length,
      page: currentPage,
      limit: currentLimit,
      totalPages: Math.ceil(filteredHistories.length / currentLimit),
    },
  };
};

export const showInventoryHistoryService = async (idInventory) => {
  const historyRow = await InventoryHistoryModel.findOne({
    where: buildInventoryHistoryWhere(null, null, {
      MaLichSu: idInventory,
    }),
    include: inventoryHistoryInclude,
  });

  const [history] = await enrichInventoryHistories(
    historyRow ? [historyRow] : [],
  );

  const orderID = history
    ? history.DonHang?.MaHienThi || history.MaHienThiLienQuan
    : null;

  const orderDetail = orderID
    ? await adminGetOrderDetailService(orderID)
    : null;

  return {
    history: history || null,
    orderDetail,
  };
};

export const exportInventoryHistoryXlsxService = async (
  search = "",
  order = "DESC",
  startDate,
  endDate,
) => {
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

  const sortOrder = String(order).toUpperCase() === "ASC" ? "ASC" : "DESC";
  const keyword = String(search || "").trim();

  const rows = await InventoryHistoryModel.findAll({
    where: buildInventoryHistoryWhere(startDate, endDate),
    include: inventoryHistoryInclude,
    order: [["MaLichSu", sortOrder]],
  });

  const enrichedHistories = await enrichInventoryHistories(rows);
  const histories = filterInventoryHistoryByKeyword(enrichedHistories, keyword);

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

  const colWidths = [14, 42, 24, 20, 20, 20, 18, 26, 26, 46];

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
    for (let col = 1; col <= 10; col += 1) {
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

  worksheet.mergeCells("A4:J4");
  worksheet.getCell("A4").border = {
    bottom: {
      style: "medium",
      color: { argb: "FF2F6B3F" },
    },
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
    dateRangeText = `Thời gian dữ liệu: Từ ${formatDateOnlyVN(
      startDate,
    )} đến ${formatDateOnlyVN(endDate)}`;
  } else if (startDate) {
    dateRangeText = `Thời gian dữ liệu: Từ ${formatDateOnlyVN(startDate)}`;
  } else if (endDate) {
    dateRangeText = `Thời gian dữ liệu: Đến ${formatDateOnlyVN(endDate)}`;
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
    "Mã liên quan",
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

  histories.forEach((history, index) => {
    const row = worksheet.getRow(10 + index);

    row.values = [
      history.MaLichSu,
      getProductDisplay(history),
      history.LoaiGiaoDich || "",
      history.SoLuongThayDoi ?? 0,
      history.TonKhoHienTai ?? 0,
      history.LoaiThamChieu || "",
      history.MaThamChieu || "",
      getRelatedReferenceCode(history),
      history.NgayTao ? formatDateTimeVN(history.NgayTao) : "",
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

  return await workbook.xlsx.writeBuffer();
};
