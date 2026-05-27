import { SupplierModel } from "../../models/index.js";
import { Op } from "sequelize";
import ErrorHandler from "../../utils/error_handler.js";

export const getAllSuppliers = async (
  page = 1,
  limit = 10,
  search = "",
  sort = "MaNhaCC",
  order = "DESC",
) => {
  const offset = (page - 1) * limit;

  const keyword = `%${search}%`;

  const whereCondition = search
    ? {
        [Op.or]: [
          {
            TenNhaCC: {
              [Op.like]: keyword,
            },
          },
          {
            SDT: {
              [Op.like]: keyword,
            },
          },
          {
            Diachi: {
              [Op.like]: keyword,
            },
          },
        ],
      }
    : {};

  const { rows, count } = await SupplierModel.findAndCountAll({
    where: whereCondition,
    limit: Number(limit),
    offset: Number(offset),
    order: [[sort, order]],
  });

  return {
    data: rows,
    total: count,
    totalPages: Math.ceil(count / limit),
    page: Number(page),
  };
};
export const getSupllierInfo = async (idSupplier) => {
  return await SupplierModel.findByPk(idSupplier);
};

export const createSupplierService = async (TenNhaCC, Diachi, SDT) => {
  try {
    return await SupplierModel.create({
      TenNhaCC,
      Diachi,
      SDT,
    });
  } catch (err) {
    if (err.statusCode) throw err;
    console.error(err);
    throw new ErrorHandler("Lỗi! Không thể thêm mới nhà sản xuất!", 500);
  }
};

export const updateSupplierService = async (
  idSupplier,
  TenNhaCC,
  Diachi,
  SDT,
) => {
  try {
    const exist = await SupplierModel.findOne({
      where: {
        TenNhaCC: TenNhaCC,
        MaNhaCC: {
          [Op.ne]: idSupplier,
        },
      },
    });
    if (exist) {
      throw new ErrorHandler("Tên này đã tồn tại!", 422);
    }
    const supplier = await SupplierModel.findByPk(idSupplier);
    if (!supplier) {
      throw new ErrorHandler("Không tồn tại nhà cung cấp này!", 404);
    }
    await supplier.update({
      TenNhaCC,
      Diachi,
      SDT,
    });
    return supplier.reload();
  } catch (err) {
    if (err.statusCode) throw err;
    console.error(err);
    throw new ErrorHandler("Lỗi! Không thể sửa thông tin nhà sản xuất!", 500);
  }
};
