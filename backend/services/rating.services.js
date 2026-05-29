import { Op, fn, col } from "sequelize";
import {
  RatingModel,
  CustomerModel,
  ProductModel,
  VariantModel,
  OrderDetailModel,
  OrderModel,
} from "../models/index.js";
import ErrorHandler from "../utils/error_handler.js";
import {
  buildDateRangeText,
  buildReportHeader,
  createReportWorkbook,
  createReportWorksheet,
  formatDateTimeVN,
  styleDataRow,
  styleHeaderRow,
} from "../utils/excelReport.js";

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

  const workbook = createReportWorkbook();
  const worksheet = createReportWorksheet(workbook, "Phản hồi khách hàng", {
    columnWidths: [14, 24, 36, 26, 16, 50, 18, 24, 24, 24],
  });

  await buildReportHeader({
    workbook,
    worksheet,
    lastColumn: "J",
    title: "BÁO CÁO PHẢN HỒI KHÁCH HÀNG",
    subtitle: buildDateRangeText(startDate, endDate),
  });

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
  styleHeaderRow(headerRow, 30);

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
    styleDataRow(row, [1, 5, 7, 8, 9, 10]);
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
