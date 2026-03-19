import { StaffModel, AccountModel, sequelize } from "../models/index.js";
import { Op } from "sequelize";
import ErrorHandler from "../utils/error_handler.js";

export const getAllStaffService = async (
  page = 1,
  limit = 10,
  search = "",
  sort = "MaNhanVien",
  order = "DESC",
) => {
  const allowedField = [
    "MaNhanVien",
    "TenNhanVien",
    "SDT",
    "Username",
    "Email",
  ];
  const offset = (page - 1) * limit;
  const searchCondition = search
    ? {
        [Op.or]: [
          {
            TenNhanVien: {
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
    orderQuery.push(["MaNhanVien", "ASC"]);
  }

  const users = await StaffModel.findAndCountAll({
    where: searchCondition,
    include: [
      {
        model: AccountModel,
        required: true,
        where: {
          MaQuyen: {
            [Op.ne]: 1,
          },
        },
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

export const getStaffService = async (id) => {
  const user = await StaffModel.findOne({
    where: {
      MaNhanVien: id,
    },
    include: {
      model: AccountModel,
      attributes: ["Username", "Email"],
    },
  });
  return user;
};

export const updateStaffMeService = async (id, data) => {
  const transaction = await sequelize.transaction();
  try {
    const staff = await StaffModel.findOne({
      where: {
        MaTaiKhoan: id,
      },
      transaction: transaction,
    });
    if (!staff) {
      throw new ErrorHandler("Không tìm thấy thông tin nhân viên này!", 404);
    }
    await StaffModel.update(data, {
      where: {
        MaTaiKhoan: id,
      },
      transaction: transaction,
    });
    await transaction.commit();
    const info = await StaffModel.findOne({
      where: {
        MaTaiKhoan: id,
      },
      attributes: ["TenNhanVien", "SDT", "DiaChi", "NgaySinh"],
    });
    return info;
  } catch (err) {
    await transaction.rollback();
    if (err.statusCode) throw err;
    console.error(err);
    throw new ErrorHandler("Lỗi server! Không thể cập nhật thông tin!", 500);
  }
};
