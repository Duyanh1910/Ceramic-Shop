import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const CustomerModel = sequelize.define(
  "KhachHang",
  {
    MaKhachHang: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    MaTaiKhoan: {
      type: DataTypes.INTEGER.UNSIGNED,
      unique: true,
    },
    TenKhachHang: {
      type: DataTypes.STRING(100),
    },
    SDT: {
      type: DataTypes.STRING(10),
    },
    DiaChi: {
      type: DataTypes.STRING(255),
    },
    Avatar: {
      type: DataTypes.STRING(255),
    },
  },
  {
    tableName: "KhachHang",
    timestamps: false,
  },
);

export default CustomerModel;
