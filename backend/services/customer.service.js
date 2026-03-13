import { CustomerModel, AccountModel } from "../models/index.js";
import { Op } from "sequelize";

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
        orderField[index]?.toUpperCase() === "ASC" ? "ASC" : "DESC" || "DESC";
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

