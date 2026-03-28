import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import ErrorHandler from "../utils/error_handler.js";
import {
  AccountModel,
  CustomerModel,
  RoleModel,
  sequelize,
  StaffModel,
  AccountProviderModel,
} from "../models/index.js";
const JWT_SECRET = process.env.JWT_SECRET;
const EXPIRES_IN = process.env.JWT_EXPIRES_IN;
const REMEMBER_ME_EXPIRES_IN = process.env.REMEMBER_ME_EXPIRES_IN;
import { SALT_ROUNDS } from "../config/app_config.js";
import { Op } from "sequelize";

export const customerRegisterService = async (
  username,
  password,
  name,
  phone_number,
  email,
  address,
) => {
  const existingAccount = await AccountModel.findOne({
    where: {
      [Op.or]: [{ Username: username }, { Email: email }],
    },
  });

  if (existingAccount) {
    if (existingAccount.Username === username) {
      throw new ErrorHandler("Tài khoản này đã tồn tại!", 400);
    }
    if (existingAccount.Email === email) {
      throw new ErrorHandler("Đã tồn tại Email này!", 400);
    }
  }

  const transaction = await sequelize.transaction();
  try {
    const hashed = await bcrypt.hash(password, Number(SALT_ROUNDS));
    const newAccount = await AccountModel.create(
      {
        Username: username,
        Email: email,
        Password: hashed,
        MaQuyen: 3,
      },
      { transaction },
    );
    const newCustomer = await CustomerModel.create(
      {
        MaTaiKhoan: newAccount.MaTaiKhoan,
        TenKhachHang: name || newAccount.Username,
        SDT: phone_number || null,
        DiaChi: address || null,
      },
      {
        transaction,
      },
    );
    await transaction.commit();
    return {
      username,
      email,
      role: "Customer",
    };
  } catch (err) {
    await transaction.rollback();
    if (err.statusCode) throw err;
    console.error(err);
    throw new ErrorHandler("Lỗi server! Không thể tạo tài khoản.", 500);
  }
};

export const loginService = async (username, password, rememberMe) => {
  const account = await AccountModel.findOne({
    where: {
      Username: username,
    },
    include: [
      {
        model: RoleModel,
        attributes: ["TenQuyen"],
      },
    ],
  });

  if (account == null) {
    throw new ErrorHandler("Tên đăng nhập hoặc mật khẩu không chính xác!", 401);
  }

  if (!account.Password) {
    throw new ErrorHandler("Tài khoản được xác thực qua Google/Facebook!", 400);
  }
  const isMatch = await bcrypt.compare(password, account.Password);

  if (!isMatch) {
    throw new ErrorHandler("Tên đăng nhập hoặc mật khẩu không chính xác!", 401);
  }
  const role = account.PhanQuyen.TenQuyen;
  const expiresIn = rememberMe ? REMEMBER_ME_EXPIRES_IN : EXPIRES_IN;
  const token = jwt.sign(
    {
      id: account.MaTaiKhoan,
      role: role,
    },
    JWT_SECRET,
    {
      expiresIn: expiresIn,
    },
  );

  return {
    username,
    token,
    role: role,
    expiresInDays: rememberMe ? 30 : 1,
  };
};

export const getMeService = async (id) => {
  const user = await AccountModel.findByPk(id, {
    attributes: ["Username", "Email", "Password"],
    include: [
      {
        model: StaffModel,
        attributes: ["TenNhanVien", "SDT", "NgaySinh", "DiaChi"],
      },
      {
        model: CustomerModel,
        attributes: ["TenKhachHang", "SDT", "DiaChi", "Avatar"],
      },
      {
        model: RoleModel,
        attributes: ["MaPhanQuyen", "TenQuyen"],
      },
    ],
  });
  if (!user) {
    return null;
  }
  const role = user.PhanQuyen.TenQuyen;
  let profile = null;
  if (role === "Customer" && user.KhachHang) {
    profile = user.KhachHang;
  }
  if ((role === "Staff" || role === "Admin") && user.NhanVien) {
    profile = user.NhanVien;
  }
  return {
    id: id,
    username: user.Username,
    email: user.Email,
    hasPassword: !!user.Password,
    role: role,
    profile,
  };
};

export const changePasswordService = async (id, oldPassword, newPassword) => {
  try {
    const account = await AccountModel.findByPk(id);
    if (!account) {
      throw new ErrorHandler("Không tìm thấy người dùng này!", 404);
    }
    if (!account.Password) {
      const hashed_password = await bcrypt.hash(
        newPassword,
        Number(SALT_ROUNDS),
      );
      account.Password = hashed_password;
      await account.save();
      return;
    }
    if (!oldPassword)
      throw new ErrorHandler("Vui lòng nhập mật khẩu hiện tại!", 400);
    const isMatch = await bcrypt.compare(oldPassword, account.Password);
    if (!isMatch) {
      throw new ErrorHandler("Mật khẩu không chính xác!", 401);
    }
    const SALT_ROUNDS = Number(process.env.SALT_ROUNDS);
    const hashed_password = await bcrypt.hash(newPassword, SALT_ROUNDS);
    account.Password = hashed_password;
    account.save();
  } catch (err) {
    if (err.statusCode) throw err;
    console.error(err);
    throw new ErrorHandler("Lỗi server! Không thể đổi mật khẩu!", 500);
  }
};

export const OAuthService = async (profile, provider, rememberMe) => {
  const providerId = profile.id;
  const email =
    profile.emails && profile.emails.length > 0
      ? profile.emails[0].value
      : null;
  if (!email) {
    throw new ErrorHandler("Không thế lấy email!", 400);
  }
  const transaction = await sequelize.transaction();
  try {
    let account;
    const Linked = await AccountProviderModel.findOne({
      where: {
        ProviderID: providerId,
        Provider: provider,
      },
      include: [
        {
          model: AccountModel,
          include: [
            {
              model: RoleModel,
            },
          ],
        },
      ],
    });
    if (Linked) {
      account = Linked.TaiKhoan;
    } else {
      account = await AccountModel.findOne({
        where: { Email: email },
        include: [{ model: RoleModel }],
      });

      if (!account) {
        const base = email.split("@")[0];
        const username = `${base}_${Date.now().toString().slice(-4)}`;
        account = await AccountModel.create(
          {
            Username: username,
            Email: email,
            MaQuyen: 3,
          },
          {
            transaction,
          },
        );

        await CustomerModel.create(
          {
            MaTaiKhoan: account.MaTaiKhoan,
            TenKhachHang: profile.displayName || uniqueUsername,
          },
          { transaction },
        );

        account.PhanQuyen = { TenQuyen: "Customer" };
      }
      await AccountProviderModel.create(
        {
          MaTaiKhoan: account.MaTaiKhoan,
          Provider: provider,
          ProviderID: providerId,
        },
        { transaction },
      );
    }
    await transaction.commit();

    const roleName = account.PhanQuyen
      ? account.PhanQuyen.TenQuyen
      : "Customer";

    const isRemember = rememberMe === "true";
    const expiresIn = isRemember ? EXPIRES_REMEMBER : EXPIRES_NORMAL;

    const token = jwt.sign(
      { id: account.MaTaiKhoan, role: roleName },
      JWT_SECRET,
      { expiresIn: expiresIn },
    );

    return {
      token,
      expiresInDays: isRemember ? 30 : 1,
    };
  } catch (err) {
    await transaction.rollback();
    console.error(err);
    if (err.statusCode) throw err;
    throw new ErrorHandler("Đăng nhập bằng mạng xã hội thất bại!", 500);
  }
};
