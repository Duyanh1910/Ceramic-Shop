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
  const offset = (page - 1) * limit;

  let searchCondition = {};

  if (search) {
    searchCondition[Op.or] = [
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

    searchCondition.MaDanhMuc = {
      [Op.in]: [category, ...childIds],
    };
  }

  const sortField = sort ? sort.split(",") : [];
  const orderField = order ? order.split(",") : [];

  const orderQuery = [];

  sortField.forEach((field, index) => {
    const direction =
      orderField[index]?.toUpperCase() === "ASC" ? "ASC" : "DESC";

    if (field === "Gia") {
      orderQuery.push([
        literal(`(
          SELECT MIN(Gia)
          FROM BienTheSanPhams
          WHERE BienTheSanPhams.MaSanPham = SanPhams.MaSanPham
        )`),
        direction,
      ]);
    } else if (field === "MaSanPham" || field === "TenSanPham") {
      orderQuery.push([field, direction]);
    }
  });

  if (orderQuery.length === 0) {
    orderQuery.push(["MaSanPham", "DESC"]);
  }

  const products = await ProductModel.findAndCountAll({
    where: searchCondition,

    include: [
      {
        model: CategoryModel,
        attributes: ["MaDanhMuc", "TenDanhMuc"],
      },
      {
        model: VariantModel,
        attributes: ["MaBienThe", "Gia"],
        include: [
          {
            model: VariantImageModel,
            attributes: ["DuongDan"],
          },
        ],
      },
    ],
    distinct: true,
    subQuery: false,
    limit: Number(limit),
    offset: Number(offset),
    order: orderQuery,
  });

  const result = products.rows.map((product) => {
    const variants = product.BienTheSanPhams || [];

    if (!variants.length) {
      return {
        MaSanPham: product.MaSanPham,
        TenSanPham: product.TenSanPham,
        MoTa: product.MoTa,
        DanhMuc: product.DanhMucSanPham,
        GiaThapNhat: 0,
        Thumbnail: null,
      };
    }

    const cheapestVariant = variants.reduce((min, v) =>
      !min || Number(v.Gia) < Number(min.Gia) ? v : min,
    );

    const thumbnail = cheapestVariant?.HinhAnhBienThes?.[0]?.DuongDan || null;

    return {
      MaSanPham: product.MaSanPham,
      TenSanPham: product.TenSanPham,
      MoTa: product.MoTa,
      DanhMuc: product.DanhMucSanPham,
      GiaThapNhat: Number(cheapestVariant.Gia),
      Thumbnail: thumbnail,
    };
  });

  const total = products.count;

  return {
    data: result,
    total,
    totalPages: Math.ceil(total / limit),
    page: Number(page),
  };
};

export const getProductService = async (id) => {
  const product = await ProductModel.findByPk(id, {
    include: [
      {
        model: CategoryModel,
        attributes: ["MaDanhMuc", "TenDanhMuc"],
      },
      {
        model: VariantModel,
        attributes: ["MaDanhMuc", "TenDanhMuc"],
      },
    ],
  });
  return product;
};
