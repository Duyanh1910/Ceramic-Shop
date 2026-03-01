import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const StaffModel = sequelize.define(
  "NhanVien",
  {
    ID_NhanVien: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    ID_TaiKhoan: {
      type: DataTypes.BIGINT.UNSIGNED,
      unique: true,
    },
    TenNhanVien: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    SDT: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    NgaySinh: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    Email: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    DiaChi: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  },
  {
    tableName: "NhanVien",
    timestamps: false,
  }
);

export default StaffModel;
