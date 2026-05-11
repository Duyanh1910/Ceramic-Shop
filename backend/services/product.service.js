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
import ErrorHandler from "../utils/error_handler.js";

const getProductsHelper = async (
  page = 1,
  limit = 10,
  search = "",
  sort = "MaSanPham",
  order = "DESC",
  category = null,
  isAdmin = false,
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
  if (!isAdmin) {
    whereCondition.TrangThai = 1;
  }

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
    include: [{ model: CategoryModel, attributes: [] }],
    order: orderCondition,
    limit,
    offset,
    raw: true,
  });

  const ids = productIdsResult.map((p) => p.MaSanPham);

  if (ids.length === 0) {
    return { data: [], total: 0, totalPages: 0, page };
  }

  const products = await ProductModel.findAll({
    where: { MaSanPham: ids },
    attributes: [
      "MaSanPham",
      "TenSanPham",
      "Thumbnail",
      "ThuongHieu",
      "LuotXem",
      "MoTa",
      "TrangThai",
    ],
    include: [
      { model: CategoryModel, attributes: ["MaDanhMuc", "TenDanhMuc"] },
      { model: VariantModel, attributes: ["Gia", "SoLuong"] },
    ],
  });

  const total = await ProductModel.count({
    where: whereCondition,
    include: [{ model: CategoryModel, attributes: [] }],
    distinct: true,
  });

  const productMap = new Map();
  products.forEach((p) => productMap.set(p.MaSanPham, p));
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

const getSingleProductHelper = async (id, isAdmin = false) => {
  if (!isAdmin) {
    await ProductModel.increment("LuotXem", {
      where: { MaSanPham: id },
      by: 1,
    });
  }

  const productWhere = isAdmin ? {} : { TrangThai: 1 };
  const variantWhere = isAdmin ? {} : { TrangThai: 1 };

  const product = await ProductModel.findOne({
    attributes: ["MaSanPham", "TenSanPham", "MoTa", "Thumbnail", "TrangThai"],
    where: {
      MaSanPham: id,
      ...productWhere,
    },
    include: [
      {
        model: CategoryModel,
        attributes: ["MaDanhMuc", "TenDanhMuc"],
      },
      {
        model: VariantModel,
        where: variantWhere,
        required: false,
        attributes: [
          "MaBienThe",
          "TenBienThe",
          "Gia",
          "SoLuong",
          "KhoiLuong",
          "TrangThai",
        ],
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

  return product || null;
};

export const getAllProductsService = (...args) =>
  getProductsHelper(...args, false);

export const getProductService = (id) => getSingleProductHelper(id, false);

export const getAllProductsAdminService = (...args) =>
  getProductsHelper(...args, true);

export const getProductAdminService = (id) => getSingleProductHelper(id, true);

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
          KhoiLuong: item.KhoiLuong || 0,
          ChieuDai: item.ChieuDai || 0,
          ChieuRong: item.ChieuRong || 0,
          ChieuCao: item.ChieuCao || 0,
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

export const updateProductInfoService = async (
  productID,
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
    const existProduct = await ProductModel.findByPk(productID);
    if (!existProduct) {
      throw new ErrorHandler("Không tồn tại sản phẩm này!", 400);
    }
    const category = await CategoryModel.findByPk(categoryID);
    if (!category) {
      throw new ErrorHandler("Không tồn tại danh mục này!", 400);
    }
    const countChild = await CategoryModel.count({
      where: { ParentID: categoryID },
    });
    if (countChild > 0) {
      throw new ErrorHandler("Chỉ được thêm sản phẩm vào danh mục con!", 400);
    }

    await existProduct.update(
      {
        MaDanhMuc: categoryID,
        TenSanPham: productName,
        Thumbnail: thumbnail,
        ThuongHieu: brand,
        LuotXem: existProduct.LuotXem,
        MoTa: description,
        TrangThai: status,
      },
      { transaction: transaction },
    );

    for (const item of BienThe) {
      if (item.MaBienThe) {
        await VariantModel.update(
          {
            MaSanPham: existProduct.MaSanPham,
            TenBienThe: item.TenBienThe,
            Gia: item.Gia,
            SoLuong: item.SoLuong,
            TrangThai: item.TrangThai,
            MoTa: item.MoTa,
            KhoiLuong: item.KhoiLuong || 0,
            ChieuDai: item.ChieuDai || 0,
            ChieuRong: item.ChieuRong || 0,
            ChieuCao: item.ChieuCao || 0,
          },
          {
            where: { MaBienThe: item.MaBienThe },
            transaction: transaction,
          },
        );

        if (item.images && item.images.length > 0) {
          await VariantImageModel.destroy({
            where: { MaBienThe: item.MaBienThe },
            transaction,
          });
          const images = item.images.map((img) => ({
            MaBienThe: item.MaBienThe,
            DuongDan: img,
          }));
          await VariantImageModel.bulkCreate(images, {
            transaction: transaction,
          });
        }

        if (item.attributes && item.attributes.length > 0) {
          await VariantAttributeModel.destroy({
            where: { MaBienThe: item.MaBienThe },
            transaction,
          });
          const attributes = item.attributes.map((atrri) => ({
            MaBienThe: item.MaBienThe,
            MaGiaTri: atrri,
          }));
          await VariantAttributeModel.bulkCreate(attributes, {
            transaction: transaction,
          });
        }
      } else {
        const newVariant = await VariantModel.create(
          {
            MaSanPham: existProduct.MaSanPham,
            TenBienThe: item.TenBienThe,
            Gia: item.Gia,
            SoLuong: item.SoLuong,
            TrangThai: item.TrangThai,
            MoTa: item.MoTa,
          },
          { transaction: transaction },
        );
        if (item.images && item.images.length > 0) {
          const images = item.images.map((img) => ({
            MaBienThe: newVariant.MaBienThe,
            DuongDan: img,
          }));
          await VariantImageModel.bulkCreate(images, {
            transaction: transaction,
          });
        }
        if (item.attributes && item.attributes.length > 0) {
          const attributes = item.attributes.map((atrri) => ({
            MaBienThe: newVariant.MaBienThe,
            MaGiaTri: atrri,
          }));
          await VariantAttributeModel.bulkCreate(attributes, {
            transaction: transaction,
          });
        }
      }
    }
    await transaction.commit();
    return existProduct;
  } catch (err) {
    await transaction.rollback();
    if (err.statusCode) throw err;
    console.error(err);
    throw new ErrorHandler("Lỗi server! Không thể cập nhật sản phẩm!", 500);
  }
};

export const deleteVariantImageService = async (imageID, variantID) => {
  const transaction = await sequelize.transaction();
  try {
    const variant = await VariantModel.findByPk(variantID);
    if (!variant) {
      throw new ErrorHandler("Không tìm thấy biến thể này!", 404);
    }
    await VariantImageModel.destroy({
      where: {
        MaBienThe: variantID,
        MaHinhAnh: { [Op.in]: imageID },
      },
      transaction,
    });
    await transaction.commit();
  } catch (err) {
    await transaction.rollback();
    console.error(err);
    if (err.statusCode) throw err;
    throw new ErrorHandler("Lỗi server! Không thể xóa ảnh của biến thể", 500);
  }
};

export const updateProductStatusService = async (productID, status) => {
  const transaction = await sequelize.transaction();
  try {
    const product = await ProductModel.findByPk(productID);
    if (!product) {
      throw new ErrorHandler("Không tìm thấy sản phẩm này!", 404);
    }
    await product.update(
      {
        TrangThai: status,
      },
      {
        transaction,
      },
    );
    await transaction.commit();
  } catch (err) {
    await transaction.rollback();
    console.error(err);
    if (err.statusCode) throw err;
    throw new ErrorHandler(
      "Lỗi server! Không thể cập nhật trạng thái của sản phẩm",
      500,
    );
  }
};

export const updateVariantStatusService = async (variantID, status) => {
  const transaction = await sequelize.transaction();
  try {
    const variant = await VariantModel.findByPk(variantID);
    if (!variant) {
      throw new ErrorHandler("Không tìm thấy biến thể này!", 404);
    }
    await variant.update(
      {
        TrangThai: status,
      },
      {
        transaction,
      },
    );
    await transaction.commit();
  } catch (err) {
    await transaction.rollback();
    console.error(err);
    if (err.statusCode) throw err;
    throw new ErrorHandler(
      "Lỗi server! Không thể cập nhật trạng thái của biến thể này",
      500,
    );
  }
};
