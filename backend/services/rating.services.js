import { Op, fn, col } from "sequelize";
import ExcelJS from "exceljs";
import axios from "axios";
import {
  RatingModel,
  CustomerModel,
  ProductModel,
  VariantModel,
  OrderDetailModel,
  OrderModel,
} from "../models/index.js";
import ErrorHandler from "../utils/error_handler.js";

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

const buildReviewFilter = ({
  search = "",
  productName = "",
  variantName = "",
  productId,
  variantId,
  rating,
  status,
  startDate,
  endDate,
} = {}) => {
  const keyword = String(search || "").trim();
  const productKeyword = String(productName || "").trim();
  const variantKeyword = String(variantName || "").trim();

  const ratingWhere = {};
  const variantWhere = {};
  const productWhere = {};

  if (keyword) {
    ratingWhere[Op.or] = [
      {
        NoiDung: {
          [Op.like]: `%${keyword}%`,
        },
      },
      {
        "$ChiTietDonHang.BienTheSanPham.TenBienThe$": {
          [Op.like]: `%${keyword}%`,
        },
      },
      {
        "$ChiTietDonHang.BienTheSanPham.SanPham.TenSanPham$": {
          [Op.like]: `%${keyword}%`,
        },
      },
      {
        "$KhachHang.TenKhachHang$": {
          [Op.like]: `%${keyword}%`,
        },
      },
      {
        "$ChiTietDonHang.DonHang.MaHienThi$": {
          [Op.like]: `%${keyword}%`,
        },
      },
    ];
  }

  if (rating !== undefined && rating !== null && rating !== "") {
    ratingWhere.DiemDanhGia = Number(rating);
  }

  if (status !== undefined && status !== null && status !== "") {
    ratingWhere.TrangThai = Number(status);
  }

  if (startDate || endDate) {
    ratingWhere.NgayGui = {};

    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      ratingWhere.NgayGui[Op.gte] = start;
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      ratingWhere.NgayGui[Op.lte] = end;
    }
  }

  if (productId !== undefined && productId !== null && productId !== "") {
    variantWhere.MaSanPham = Number(productId);
  }

  if (variantId !== undefined && variantId !== null && variantId !== "") {
    variantWhere.MaBienThe = Number(variantId);
  }

  if (variantKeyword) {
    variantWhere.TenBienThe = {
      [Op.like]: `%${variantKeyword}%`,
    };
  }

  if (productKeyword) {
    productWhere.TenSanPham = {
      [Op.like]: `%${productKeyword}%`,
    };
  }

  return {
    ratingWhere,
    variantWhere,
    productWhere,
  };
};

const getReviewIncludes = ({ variantWhere = {}, productWhere = {} } = {}) => [
  {
    model: CustomerModel,
    as: "KhachHang",
    attributes: ["MaKhachHang", "TenKhachHang", "Avatar"],
    required: false,
  },
  {
    model: OrderDetailModel,
    as: "ChiTietDonHang",
    required: true,
    include: [
      {
        model: OrderModel,
        as: "DonHang",
        attributes: ["MaDonHang", "MaHienThi", "NgayDat"],
        required: false,
      },
      {
        model: VariantModel,
        as: "BienTheSanPham",
        attributes: ["MaBienThe", "TenBienThe", "MaSanPham"],
        where: Object.keys(variantWhere).length ? variantWhere : undefined,
        required: true,
        include: [
          {
            model: ProductModel,
            as: "SanPham",
            attributes: ["MaSanPham", "TenSanPham"],
            where: Object.keys(productWhere).length ? productWhere : undefined,
            required: Object.keys(productWhere).length > 0,
          },
        ],
      },
    ],
  },
];

export const reviewsProductService = async (productID) => {
  const reviews = await RatingModel.findAll({
    where: {
      TrangThai: 1,
    },
    include: [
      {
        model: OrderDetailModel,
        as: "ChiTietDonHang",
        required: true,
        include: [
          {
            model: VariantModel,
            as: "BienTheSanPham",
            required: true,
            where: {
              MaSanPham: productID,
            },
          },
        ],
      },
      {
        model: CustomerModel,
        as: "KhachHang",
        attributes: ["TenKhachHang", "Avatar"],
      },
    ],
  });

  return reviews;
};

export const averageRatingService = async (productID) => {
  const ratings = await RatingModel.findOne({
    attributes: [
      [fn("avg", col("DiemDanhGia")), "DiemTrungBinh"],
      [fn("count", col("MaDanhGia")), "TongDanhGia"],
    ],
    include: [
      {
        model: OrderDetailModel,
        as: "ChiTietDonHang",
        attributes: [],
        required: true,
        include: [
          {
            model: VariantModel,
            as: "BienTheSanPham",
            required: true,
            attributes: [],
            where: { MaSanPham: productID },
          },
        ],
      },
    ],
    group: ["MaSanPham"],
    raw: true,
  });

  return ratings;
};

export const createReviewsService = async (
  idAccount,
  idProduct,
  DiemDanhGia,
  NoiDung,
) => {
  try {
    const customer = await CustomerModel.findOne({
      where: {
        MaTaiKhoan: idAccount,
      },
    });

    if (!customer) {
      throw new ErrorHandler("Không tìm thấy khách hàng này!", 404);
    }

    const purchasedItems = await OrderDetailModel.findAll({
      include: [
        {
          model: OrderModel,
          as: "DonHang",
          where: {
            MaKhachHang: customer.MaKhachHang,
            TrangThaiDonHang: 3,
          },
          attributes: ["MaDonHang"],
        },
        {
          model: VariantModel,
          as: "BienTheSanPham",
          where: { MaSanPham: idProduct },
          attributes: ["MaSanPham"],
        },
      ],
    });

    if (!purchasedItems || purchasedItems.length === 0) {
      throw new ErrorHandler(
        "Bạn cần mua sản phẩm này để có thể đánh giá!",
        403,
      );
    }

    const reviewedItems = await RatingModel.findAll({
      where: {
        MaKhachHang: customer.MaKhachHang,
      },
      attributes: ["MaCTDH"],
    });

    const reviewed = reviewedItems.map((item) => item.MaCTDH);

    const unreviewedItem = purchasedItems.find(
      (item) => !reviewed.includes(item.MaCTDH),
    );

    if (!unreviewedItem) {
      throw new ErrorHandler(
        "Bạn đã đánh giá sản phẩm này trong đơn hàng của bạn rồi!",
        409,
      );
    }

    const newReview = await RatingModel.create({
      MaKhachHang: customer.MaKhachHang,
      MaCTDH: unreviewedItem.MaCTDH,
      DiemDanhGia,
      NoiDung: NoiDung || null,
      TrangThai: 1,
    });

    return newReview;
  } catch (error) {
    console.error(error);

    if (error.statusCode) throw error;

    throw new ErrorHandler(
      "Lỗi server! Không thể thêm mới đánh giá cho sản phẩm này!",
      500,
    );
  }
};

export const adminGetAllReviewsService = async ({
  page = 1,
  limit = 10,
  search = "",
  productName = "",
  variantName = "",
  productId,
  variantId,
  rating,
  status,
  startDate,
  endDate,
  order = "DESC",
} = {}) => {
  const currentPage = Math.max(Number(page) || 1, 1);
  const currentLimit = Math.max(Number(limit) || 10, 1);
  const offset = (currentPage - 1) * currentLimit;
  const sortOrder = String(order).toUpperCase() === "ASC" ? "ASC" : "DESC";

  const { ratingWhere, variantWhere, productWhere } = buildReviewFilter({
    search,
    productName,
    variantName,
    productId,
    variantId,
    rating,
    status,
    startDate,
    endDate,
  });

  const { rows, count } = await RatingModel.findAndCountAll({
    where: ratingWhere,
    include: getReviewIncludes({
      variantWhere,
      productWhere,
    }),
    order: [["MaDanhGia", sortOrder]],
    limit: currentLimit,
    offset,
    distinct: true,
    subQuery: false,
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

export const exportCustomerFeedbackXlsxService = async ({
  search = "",
  productName = "",
  variantName = "",
  productId,
  variantId,
  rating,
  status,
  startDate,
  endDate,
  order = "DESC",
} = {}) => {
  const sortOrder = String(order).toUpperCase() === "ASC" ? "ASC" : "DESC";

  const { ratingWhere, variantWhere, productWhere } = buildReviewFilter({
    search,
    productName,
    variantName,
    productId,
    variantId,
    rating,
    status,
    startDate,
    endDate,
  });

  const reviews = await RatingModel.findAll({
    where: ratingWhere,
    include: getReviewIncludes({
      variantWhere,
      productWhere,
    }),
    order: [["MaDanhGia", sortOrder]],
    subQuery: false,
  });

  const workbook = new ExcelJS.Workbook();

  workbook.creator = "CERAMIC-SHOP";
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet("Phản hồi khách hàng", {
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

  const colWidths = [14, 24, 36, 26, 16, 50, 18, 24, 24, 24];

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
    for (let colNumber = 1; colNumber <= 10; colNumber += 1) {
      worksheet.getCell(row, colNumber).fill = {
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
      ext: { width: 72, height: 52 },
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
  const dividerCell = worksheet.getCell("A4");
  dividerCell.border = {
    bottom: { style: "medium", color: { argb: "FF2F6B3F" } },
  };

  worksheet.mergeCells("A5:J5");
  const reportTitleCell = worksheet.getCell("A5");
  reportTitleCell.value = "BÁO CÁO PHẢN HỒI KHÁCH HÀNG";
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
    dateRangeText = `Thời gian dữ liệu: Từ ${formatDateOnlyVN(startDate)} đến ${formatDateOnlyVN(endDate)}`;
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
    "Mã đánh giá",
    "Khách hàng",
    "Sản phẩm",
    "Biến thể",
    "Điểm",
    "Nội dung phản hồi",
    "Trạng thái",
    "Mã đơn hàng",
    "Ngày mua",
    "Ngày đánh giá",
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

  reviews.forEach((item, index) => {
    const review = item.get({ plain: true });

    const customer = review.KhachHang || {};
    const orderDetail = review.ChiTietDonHang || {};
    const order = orderDetail.DonHang || {};
    const variant = orderDetail.BienTheSanPham || {};
    const product = variant.SanPham || {};

    const row = worksheet.getRow(10 + index);

    row.values = [
      review.MaDanhGia,
      customer.TenKhachHang || "",
      product.TenSanPham || "",
      variant.TenBienThe || "",
      review.DiemDanhGia ?? "",
      review.NoiDung || "",
      Number(review.TrangThai) === 1 ? "Hiển thị" : "Ẩn",
      order.MaHienThi || order.MaDonHang || "",
      order.NgayDat ? formatDateTimeVN(order.NgayDat) : "",
      review.NgayGui ? formatDateTimeVN(review.NgayGui) : "",
    ];

    row.height = 42;

    row.eachCell((cell, colNumber) => {
      cell.font = {
        name: "Arial",
        size: 11,
      };

      cell.alignment = {
        vertical: "middle",
        horizontal: [1, 5, 7, 8, 9, 10].includes(colNumber) ? "center" : "left",
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

  worksheet.getColumn(5).numFmt = "0";

  worksheet.autoFilter = "A9:J9";

  const lastDataRow = 9 + reviews.length;
  const minVisibleRows = Math.max(lastDataRow + 5, 25);

  for (let rowNumber = minVisibleRows + 1; rowNumber <= 300; rowNumber += 1) {
    worksheet.getRow(rowNumber).hidden = true;
  }

  for (let colNumber = 11; colNumber <= 30; colNumber += 1) {
    worksheet.getColumn(colNumber).hidden = true;
  }

  worksheet.pageSetup.printArea = `A1:J${Math.max(lastDataRow, 9)}`;

  const buffer = await workbook.xlsx.writeBuffer();

  return buffer;
};
