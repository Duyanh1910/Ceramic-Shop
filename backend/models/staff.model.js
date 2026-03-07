import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const StaffModel = sequelize.define(
  "NhanVien",
  {
    MaNhanVien: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    MaTaiKhoan: {
      type: DataTypes.INTEGER.UNSIGNED,
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
    DiaChi: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  },
  {
    tableName: "NhanVien",
    timestamps: false,
  },
);

export default StaffModel;
