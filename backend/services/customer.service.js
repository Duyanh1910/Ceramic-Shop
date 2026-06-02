import { CustomerModel, AccountModel, sequelize } from "../models/index.js";
import redisClient from "../config/redis.config.js";
import { sendEmailVerifyService } from "./email.services.js";
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
      attributes: ["Username", "Email", "TrangThai"],
    },
  });
  return user;
};

export const updateCustomerByAdminService = async (id, data) => {
  const transaction = await sequelize.transaction();
  try {
    const customer = await CustomerModel.findByPk(id, {
      include: [{ model: AccountModel }],
      transaction,
    });
    if (!customer) {
      throw new ErrorHandler("Không tìm thấy khách hàng này!", 404);
    }

    const customerData = {};
    ["TenKhachHang", "SDT", "DiaChi", "Avatar"].forEach((field) => {
      if (data[field] !== undefined) customerData[field] = data[field];
    });

    const accountData = {};
    if (data.Email !== undefined) accountData.Email = data.Email;
    if (data.TrangThai !== undefined) accountData.TrangThai = data.TrangThai;

    if (accountData.Email) {
      const existingAccount = await AccountModel.findOne({
        where: {
          MaTaiKhoan: { [Op.ne]: customer.MaTaiKhoan },
          Email: accountData.Email,
        },
        transaction,
      });

      if (existingAccount) {
        throw new ErrorHandler("Email này đã tồn tại!", 400);
      }
    }

    if (Object.keys(customerData).length > 0) {
      await customer.update(customerData, { transaction });
    }
    if (Object.keys(accountData).length > 0) {
      await AccountModel.update(accountData, {
        where: { MaTaiKhoan: customer.MaTaiKhoan },
        transaction,
      });
    }

    await transaction.commit();
    return getCustomerService(id);
  } catch (err) {
    await transaction.rollback();
    if (err.statusCode) throw err;
    console.error(err);
    throw new ErrorHandler(
      "Lỗi server! Không thể cập nhật khách hàng!",
      500,
    );
  }
};

export const softDeleteCustomerAccountService = async (id) => {
  const transaction = await sequelize.transaction();
  try {
    const customer = await CustomerModel.findByPk(id, { transaction });
    if (!customer) {
      throw new ErrorHandler("Không tìm thấy khách hàng này!", 404);
    }

    await AccountModel.update(
      { TrangThai: 0 },
      {
        where: { MaTaiKhoan: customer.MaTaiKhoan },
        transaction,
      },
    );

    await transaction.commit();
    return true;
  } catch (err) {
    await transaction.rollback();
    if (err.statusCode) throw err;
    console.error(err);
    throw new ErrorHandler(
      "Lỗi server! Không thể xóa tài khoản khách hàng!",
      500,
    );
  }
};

export const sendChangeEmailOtpService = async (accountId, email) => {
  const account = await AccountModel.findByPk(accountId);
  if (!account || account.TrangThai !== 1) {
    throw new ErrorHandler("Tài khoản không tồn tại hoặc đã bị khóa!", 404);
  }

  const normalizedEmail = String(email || "").trim().toLowerCase();
  if (normalizedEmail === String(account.Email || "").trim().toLowerCase()) {
    throw new ErrorHandler("Email mới phải khác email hiện tại!", 400);
  }

  const existingAccount = await AccountModel.findOne({
    where: {
      Email: normalizedEmail,
      MaTaiKhoan: { [Op.ne]: accountId },
    },
  });
  if (existingAccount) {
    throw new ErrorHandler("Email này đã tồn tại!", 400);
  }

  const cooldownKey = `otp_change_email_cooldown:${accountId}:${normalizedEmail}`;
  const otpKey = `otp_change_email:${accountId}:${normalizedEmail}`;
  const attemptsKey = `otp_change_email_attempts:${accountId}:${normalizedEmail}`;
  const cooldown = await redisClient.get(cooldownKey);
  if (cooldown) {
    throw new ErrorHandler("Vui lòng đợi mã OTP mới sau 60 giây!", 429);
  }

  await redisClient.del(attemptsKey);
  const otp = await sendEmailVerifyService(normalizedEmail, "change_email");
  await redisClient.set(cooldownKey, "1", { ex: 60 });
  await redisClient.set(otpKey, otp, { ex: 300 });
};

export const verifyChangeEmailOtpService = async (accountId, email, otp) => {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const cooldownKey = `otp_change_email_cooldown:${accountId}:${normalizedEmail}`;
  const otpKey = `otp_change_email:${accountId}:${normalizedEmail}`;
  const attemptsKey = `otp_change_email_attempts:${accountId}:${normalizedEmail}`;

  const attempts = parseInt((await redisClient.get(attemptsKey)) || "0", 10);
  if (attempts >= 5) {
    const ttl = await redisClient.ttl(attemptsKey);
    throw new ErrorHandler("Nhập OTP quá nhiều lần, vui lòng thử lại sau!", 429, {
      retryAfter: ttl > 0 ? ttl : 0,
    });
  }

  const savedOTP = await redisClient.get(otpKey);
  if (!savedOTP) {
    throw new ErrorHandler("Mã OTP này đã hết hạn hoặc không hợp lệ!", 400);
  }

  const formatOtp = String(otp || "").padStart(6, "0");
  if (String(savedOTP) !== String(formatOtp)) {
    const newAttempts = await redisClient.incr(attemptsKey);
    if (newAttempts === 1) {
      await redisClient.expire(attemptsKey, 300);
    }
    throw new ErrorHandler("Mã OTP không hợp lệ!", 400, {
      remainingAttempts: Math.max(5 - newAttempts, 0),
    });
  }

  const transaction = await sequelize.transaction();
  try {
    const existingAccount = await AccountModel.findOne({
      where: {
        Email: normalizedEmail,
        MaTaiKhoan: { [Op.ne]: accountId },
      },
      transaction,
    });
    if (existingAccount) {
      throw new ErrorHandler("Email này đã tồn tại!", 400);
    }

    const account = await AccountModel.findOne({
      where: { MaTaiKhoan: accountId, TrangThai: 1 },
      transaction,
    });
    if (!account) {
      throw new ErrorHandler("Tài khoản không tồn tại hoặc đã bị khóa!", 404);
    }

    await account.update({ Email: normalizedEmail }, { transaction });
    await transaction.commit();
    await redisClient.del(otpKey, cooldownKey, attemptsKey);
    return { Email: normalizedEmail };
  } catch (err) {
    await transaction.rollback();
    if (err.statusCode) throw err;
    console.error(err);
    throw new ErrorHandler("Lỗi server! Không thể cập nhật email!", 500);
  }
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
