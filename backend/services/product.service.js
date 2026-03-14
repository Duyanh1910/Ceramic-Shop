import {
  ProductModel,
  CategoryModel,
  VariantModel,
  VariantImageModel,
} from "../models/index.js";
import { Op, literal } from "sequelize";

export const getAllProductsService = async (
  page = 1,
  limit = 10,
  search = "",
  sort = "MaSanPham",
  order = "DESC",
  category = null,
) => {
  const allowedSortFields = ["MaSanPham", "TenSanPham", "Gia"];
  const allowedOrder = ["ASC", "DESC"];

  if (!allowedSortFields.includes(sort)) {
    sort = "MaSanPham";
  }

  if (!allowedOrder.includes(order.toUpperCase())) {
    order = "DESC";
  }

  page = page || 1;
  limit = limit || 10;

  const offset = (page - 1) * limit;

  const whereCondition = {};

  if (search) {
    whereCondition[Op.or] = [
      { TenSanPham: { [Op.like]: `%${search}%` } },
      { "$DanhMucSanPham.TenDanhMuc$": { [Op.like]: `%${search}%` } },
    ];
  }

  if (category !== null) {
    const childCategories = await CategoryModel.findAll({
      where: { ParentID: category },
      attributes: ["MaDanhMuc"],
    });

    const childIds = childCategories.map((c) => c.MaDanhMuc);

    whereCondition.MaDanhMuc = {
      [Op.in]: [category, ...childIds],
    };
  }

  let orderQuery;

  if (sort === "Gia") {
    orderQuery = [
      [
        literal(`(
          SELECT MIN(Gia)
          FROM BienTheSanPham
          WHERE BienTheSanPham.MaSanPham = SanPham.MaSanPham
        )`),
        order,
      ],
    ];
  } else {
    orderQuery = [[sort, order]];
  }

  const products = await ProductModel.findAndCountAll({
    where: whereCondition,

    attributes: [
      "MaSanPham",
      "TenSanPham",
      "MoTa",
      "TrangThai",
      [
        literal(`(
          SELECT SUM(SoLuong)
          FROM BienTheSanPham
          WHERE BienTheSanPham.MaSanPham = SanPham.MaSanPham
        )`),
        "TongSoLuong",
      ],
      [
        literal(`(
          SELECT MIN(Gia)
          FROM BienTheSanPham
          WHERE BienTheSanPham.MaSanPham = SanPham.MaSanPham
        )`),
        "GiaThapNhat",
      ],

      [
        literal(`(
          SELECT DuongDan
          FROM HinhAnhBienThe
          WHERE MaBienThe = (
            SELECT MaBienThe
            FROM BienTheSanPham
            WHERE BienTheSanPham.MaSanPham = SanPham.MaSanPham
            ORDER BY Gia ASC
            LIMIT 1
          )
          LIMIT 1
        )`),
        "Thumbnail",
      ],
    ],

    include: [
      {
        model: CategoryModel,
        attributes: ["MaDanhMuc", "TenDanhMuc"],
      },
    ],

    limit,
    offset,

    order: orderQuery,

    distinct: true,
  });

  const result = products.rows.map((p) => ({
    MaSanPham: p.MaSanPham,
    TenSanPham: p.TenSanPham,
    MoTa: p.MoTa,
    DanhMuc: p.DanhMucSanPham,
    GiaThapNhat: Number(p.get("GiaThapNhat")) || 0,
    Thumbnail: p.get("Thumbnail") || null,
    TongSoLuong: Number(p.get("TongSoLuong")) || 0,
  }));

  const total = products.count;

  return {
    data: result,
    total,
    totalPages: Math.ceil(total / limit),
    page,
  };
};

export const getProductService = async (id) => {
  const product = await ProductModel.findByPk(id, {
    attributes: ["MaSanPham", "TenSanPham", "MoTa", "MaDanhMuc", "TrangThai"],

    include: [
      {
        model: CategoryModel,
        attributes: ["MaDanhMuc", "TenDanhMuc"],
      },

      {
        model: VariantModel,
        attributes: ["MaBienThe", "TenBienThe", "Gia", "SoLuong"],

        include: [
          {
            model: VariantImageModel,
            attributes: ["DuongDan"],
          },
        ],
      },
    ],
  });

  return product;
};
