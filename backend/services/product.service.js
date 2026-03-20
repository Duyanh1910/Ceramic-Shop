import {
  ProductModel,
  CategoryModel,
  VariantModel,
  VariantImageModel,
  VariantAttributeModel,
  AttributeValueModel,
  AttributeModel,
  sequelize,
} from "../models/index.js";
import { Sequelize, Op } from "sequelize";

export const getAllProductsService = async (
  page = 1,
  limit = 10,
  search = "",
  sort = "MaSanPham",
  order = "DESC",
  category = null,
) => {
  const offset = (page - 1) * limit;

  const allowedSortFields = [
    "MaSanPham",
    "TenSanPham",
    "LuotXem",
    "ThuongHieu",
    "Gia",
  ];

  const allowedOrder = ["ASC", "DESC"];

  if (!allowedSortFields.includes(sort)) sort = "MaSanPham";
  if (!allowedOrder.includes(order.toUpperCase())) order = "DESC";

  const whereCondition = {};

  if (search) {
    whereCondition[Op.or] = [
      { TenSanPham: { [Op.like]: `%${search}%` } },
      { ThuongHieu: { [Op.like]: `%${search}%` } },
      { "$DanhMucSanPham.TenDanhMuc$": { [Op.like]: `%${search}%` } },
    ];
  }
  if (category) {
    const childCategories = await CategoryModel.findAll({
      where: { ParentID: category },
      attributes: ["MaDanhMuc"],
    });

    const childIds = childCategories.map((c) => c.MaDanhMuc);

    whereCondition.MaDanhMuc = {
      [Op.in]: [category, ...childIds],
    };
  }

  let orderCondition;

  if (sort === "Gia") {
    orderCondition = [
      [
        Sequelize.literal(`(
          SELECT MIN(Gia)
          FROM BienTheSanPham v
          WHERE v.MaSanPham = SanPham.MaSanPham
        )`),
        order,
      ],
    ];
  } else {
    orderCondition = [[sort, order]];
  }
  const productIdsResult = await ProductModel.findAll({
    where: whereCondition,
    attributes: ["MaSanPham"],

    include: [
      {
        model: CategoryModel,
        attributes: [],
      },
    ],

    order: orderCondition,
    limit,
    offset,
    raw: true,
  });

  const ids = productIdsResult.map((p) => p.MaSanPham);

  if (ids.length === 0) {
    return {
      data: [],
      total: 0,
      totalPages: 0,
      page,
    };
  }

  const products = await ProductModel.findAll({
    where: {
      MaSanPham: ids,
    },

    attributes: [
      "MaSanPham",
      "TenSanPham",
      "Thumbnail",
      "ThuongHieu",
      "LuotXem",
      "MoTa",
    ],

    include: [
      {
        model: CategoryModel,
        attributes: ["MaDanhMuc", "TenDanhMuc"],
      },
      {
        model: VariantModel,
        attributes: ["Gia", "SoLuong"],
      },
    ],
  });

  const total = await ProductModel.count({
    where: whereCondition,
    include: [
      {
        model: CategoryModel,
        attributes: [],
      },
    ],
    distinct: true,
  });

  const productMap = new Map();

  products.forEach((p) => {
    productMap.set(p.MaSanPham, p);
  });

  const sortedProducts = ids.map((id) => productMap.get(id));

  const result = sortedProducts.map((p) => {
    const variants = p.BienTheSanPhams || [];

    const giaThapNhat =
      variants.length > 0 ? Math.min(...variants.map((v) => v.Gia)) : 0;

    const tongSoLuong = variants.reduce((sum, v) => sum + (v.SoLuong || 0), 0);

    return {
      MaSanPham: p.MaSanPham,
      TenSanPham: p.TenSanPham,
      Thumbnail: p.Thumbnail,
      ThuongHieu: p.ThuongHieu,
      LuotXem: p.LuotXem,
      MoTa: p.MoTa,
      DanhMuc: p.DanhMucSanPham,
      GiaThapNhat: giaThapNhat,
      TongSoLuong: tongSoLuong,
    };
  });

  return {
    data: result,
    total,
    totalPages: Math.ceil(total / limit),
    page,
  };
};

export const getProductService = async (id) => {
  await ProductModel.increment("LuotXem", {
    where: {
      MaSanPham: id,
    },
    by: 1,
  });
  const product = await ProductModel.findByPk(id, {
    attributes: ["MaSanPham", "TenSanPham", "MoTa", "Thumbnail"],

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

          {
            model: AttributeValueModel,
            attributes: ["MaGiaTri", "GiaTri"],
            through: { attributes: [] },
            include: [
              {
                model: AttributeModel,
                attributes: ["MaThuocTinh", "TenThuocTinh"],
              },
            ],
          },
        ],
      },
    ],
  });

  if (!product) return null;

  return product;
};

export const addNewProductService = async (
  categoryID,
  productName,
  thumbnail,
  brand,
  description,
  status = 1,
  BienThe,
) => {
  const transaction = await sequelize.transaction();
  try {
    const category = await CategoryModel.findByPk(categoryID);
    if (!category) {
      throw new ErrorHandler("Không tồn tại danh mục này!", 400);
    }
    const countChild = await CategoryModel.count({
      where: {
        ParentID: categoryID,
      },
    });
    if (countChild > 0) {
      throw new ErrorHandler("Chỉ được thêm sản phẩm vào danh mục con!", 400);
    }
    const product = await ProductModel.create(
      {
        MaDanhMuc: categoryID,
        TenSanPham: productName,
        Thumbnail: thumbnail,
        ThuongHieu: brand,
        LuotXem: 0,
        MoTa: description,
        TrangThai: status,
      },
      {
        transaction: transaction,
      },
    );
    for (const item of BienThe) {
      const variants = await VariantModel.create(
        {
          MaSanPham: product.MaSanPham,
          TenBienThe: item.TenBienThe,
          Gia: item.Gia,
          SoLuong: item.SoLuong,
          TrangThai: item.TrangThai,
          MoTa: item.MoTa,
        },
        {
          transaction: transaction,
        },
      );
      if (item.images && item.images.length > 0) {
        const images = item.images.map((img) => ({
          MaBienThe: variants.MaBienThe,
          DuongDan: img,
        }));
        await VariantImageModel.bulkCreate(images, {
          transaction: transaction,
        });
      }
      if (item.attributes && item.attributes.length > 0) {
        const attributes = item.attributes.map((atrri) => ({
          MaBienThe: variants.MaBienThe,
          MaGiaTri: atrri,
        }));
        await VariantAttributeModel.bulkCreate(attributes, {
          transaction: transaction,
        });
      }
    }
    await transaction.commit();
    return product;
  } catch (err) {
    await transaction.rollback();
    if (err.statusCode) throw err;
    console.error(err);
    throw new ErrorHandler("Lỗi server! Không thể thêm mới sản phẩm!", 500);
  }
};
