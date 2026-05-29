import { Op } from "sequelize";
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
import {
  buildDateRangeText,
  buildReportHeader,
  createReportWorkbook,
  createReportWorksheet,
  formatDateTimeVN,
  styleDataRow,
  styleHeaderRow,
} from "../utils/excelReport.js";

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
  const sortOrder = String(order).toUpperCase() === "ASC" ? "ASC" : "DESC";
  const keyword = String(search || "").trim();

  const rows = await InventoryHistoryModel.findAll({
    where: buildInventoryHistoryWhere(startDate, endDate),
    include: inventoryHistoryInclude,
    order: [["MaLichSu", sortOrder]],
  });

  const enrichedHistories = await enrichInventoryHistories(rows);
  const histories = filterInventoryHistoryByKeyword(enrichedHistories, keyword);

  const workbook = createReportWorkbook();
  const worksheet = createReportWorksheet(workbook, "Lịch sử tồn kho", {
    columnWidths: [14, 42, 24, 20, 20, 20, 18, 26, 26, 46],
  });

  await buildReportHeader({
    workbook,
    worksheet,
    lastColumn: "J",
    title: "BÁO CÁO LỊCH SỬ TỒN KHO",
    subtitle: buildDateRangeText(startDate, endDate),
  });

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
  styleHeaderRow(headerRow, 30);

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
    styleDataRow(row, [1, 4, 5, 7, 8, 9]);
  });

  worksheet.getColumn(4).numFmt = "#,##0";
  worksheet.getColumn(5).numFmt = "#,##0";
  worksheet.autoFilter = "A9:J9";

  return await workbook.xlsx.writeBuffer();
};
