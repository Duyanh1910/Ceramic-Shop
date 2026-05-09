import { StaffModel, AccountModel, sequelize } from "../models/index.js";
import bcrypt from "bcrypt";
import { Op } from "sequelize";
import ErrorHandler from "../utils/error_handler.js";

const SALT_ROUNDS = Number(process.env.SALT_ROUNDS);

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
          TrangThai: 1,
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
    page: Number(page),
  };
};

export const getStaffService = async (id) => {
  const user = await StaffModel.findOne({
    where: {
      MaNhanVien: id,
    },
    include: {
      model: AccountModel,
      where: { TrangThai: 1 },
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

export const createStaffService = async (
  email,
  name,
  username,
  phoneNumber,
  dob,
  address,
) => {
  const transaction = await sequelize.transaction();
  try {
    const exist = await AccountModel.findOne({
      where: {
        [Op.or]: [
          {
            Username: {
              [Op.like]: username,
            },
          },
          {
            Email: {
              [Op.like]: email,
            },
          },
        ],
      },
      transaction: transaction,
    });
    if (exist) {
      throw new ErrorHandler("Tài khoản này đã tồn tại!", 422);
    }
    const defaultPassword = "123456";
    const hashed = await bcrypt.hash(defaultPassword, SALT_ROUNDS);
    const account = await AccountModel.create(
      {
        Username: username,
        Email: email,
        Password: hashed,
        MaQuyen: 2,
      },
      {
        transaction: transaction,
      },
    );
    const staff = await StaffModel.create(
      {
        MaTaiKhoan: account.MaTaiKhoan,
        TenNhanVien: name,
        SDT: phoneNumber,
        NgaySinh: dob,
        DiaChi: address,
      },
      {
        transaction: transaction,
      },
    );
    await transaction.commit();
    return {
      MaNhanVien: staff.MaNhanVien,
      TenNhanVien: name,
      Email: email,
      SDT: phoneNumber,
      NgaySinh: dob,
      DiaChi: address,
    };
  } catch (err) {
    await transaction.rollback();
    console.error(err);
    if (err.statusCode) throw err;
    throw new ErrorHandler(
      "Lỗi server! Không thể tạo tài khoản nhân viên!",
      500,
    );
  }
};

export const updateStaffService = async (id, data) => {
  const transaction = await sequelize.transaction();
  try {
    const staff = await StaffModel.findOne({
      where: {
        MaNhanVien: id,
      },
      transaction: transaction,
    });
    if (!staff) {
      throw new ErrorHandler("Không tìm thấy thông tin nhân viên này!", 404);
    }
    await StaffModel.update(data, {
      where: {
        MaNhanVien: id,
      },
      transaction: transaction,
    });
    await transaction.commit();
    const info = await StaffModel.findOne({
      where: {
        MaNhanVien: id,
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

export const deleteStaffService = async (id) => {
  const transaction = await sequelize.transaction();
  try {
    const staff = await StaffModel.findOne({
      where: {
        MaNhanVien: id,
      },
      include: [
        {
          model: AccountModel,
          where: {
            TrangThai: 1,
          },
        },
      ],
      transaction: transaction,
    });
    if (!staff) {
      throw new ErrorHandler("Không tìm thấy thông tin nhân viên này!", 404);
    }
    await AccountModel.update(
      {
        TrangThai: 0,
      },
      {
        where: {
          MaTaiKhoan: staff.MaTaiKhoan,
        },
        transaction,
      },
    );
    await transaction.commit();
    return true;
  } catch (err) {
    await transaction.rollback();
    if (err.statusCode) throw err;
    console.error(err);
    throw new ErrorHandler("Lỗi server! Không thể xóa nhân viên!", 500);
  }
};
