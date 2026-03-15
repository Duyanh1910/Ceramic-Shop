import { CustomerModel, AccountModel, sequelize } from "../models/index.js";
import { Op } from "sequelize";
import ErrorHandler from "../utils/error_handler.js";

export const getAllCustomersService = async (
  page = 1,
  limit = 10,
  search = "",
  sort = "MaKhachHang",
  order = "DESC",
) => {
  const allowedField = [
    "MaKhachHang",
    "TenKhachHang",
    "SDT",
    "Username",
    "Email",
  ];
  const offset = (page - 1) * limit;
  const searchCondition = search
    ? {
        [Op.or]: [
          {
            TenKhachHang: {
              [Op.like]: `%${search}%`,
            },
          },
          {
            SDT: {
              [Op.like]: `%${search}%`,
            },
          },
          {
            "$TaiKhoan.Username$": {
              [Op.like]: `%${search}%`,
            },
          },
          {
            "$TaiKhoan.Email$": {
              [Op.like]: `%${search}%`,
            },
          },
        ],
      }
    : {};
  const sortField = sort.split(",");
  const orderField = order.split(",");
  const orderQuery = [];
  sortField.forEach((field, index) => {
    if (allowedField.includes(field)) {
      const direction =
        orderField[index]?.toUpperCase() === "ASC" ? "ASC" : "DESC";
      if (field === "Username" || field === "Email") {
        orderQuery.push([{ model: AccountModel }, field, direction]);
      } else {
        orderQuery.push([field, direction]);
      }
    }
  });
  if (orderQuery.length === 0) {
    orderQuery.push(["MaKhachHang", "ASC"]);
  }

  const users = await CustomerModel.findAndCountAll({
    where: searchCondition,
    include: [
      {
        model: AccountModel,
        attributes: {
          exclude: ["MaTaiKhoan", "Password"],
        },
      },
    ],
    attributes: {
      exclude: ["MaTaiKhoan"],
    },
    distinct: true,
    limit: Number(limit),
    offset: Number(offset),
    order: orderQuery,
  });
  return {
    data: users.rows,
    total: users.count,
    totalPages: Math.ceil(users.count / limit),
    page,
  };
};

export const getCustomerService = async (id) => {
  const user = await CustomerModel.findOne({
    where: {
      MaKhachHang: id,
    },
    include: {
      model: AccountModel,
      attributes: ["Username", "Email"],
    },
  });
  return user;
};

export const updateCustomerMeService = async (id, data) => {
  const transaction = await sequelize.transaction();
  try {
    const customer = await CustomerModel.findOne({
      where: {
        MaTaiKhoan: id,
      },
      transaction: transaction,
    });
    if (!customer) {
      throw new ErrorHandler("Không tìm thấy thông tin khách hàng này!", 404);
    }
    await CustomerModel.update(data, {
      where: {
        MaTaiKhoan: id,
      },
      transaction: transaction,
    });
    await transaction.commit();
    const info = await CustomerModel.findOne({
      where: {
        MaTaiKhoan: id,
      },
      attributes: ["TenKhachHang", "SDT", "DiaChi", "Avatar"],
    });
    return info;
  } catch (err) {
    await transaction.rollback();
    if (err.statusCode) throw err;
    console.error(err);
    throw new ErrorHandler("Lỗi server! Không thể cập nhật thông tin!", 500);
  }
};
