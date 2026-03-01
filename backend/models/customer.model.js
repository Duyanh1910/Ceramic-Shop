import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const CustomerModel = sequelize.define(
  "KhachHang",
  {
    ID_KhachHang: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    ID_TaiKhoan: {
      type: DataTypes.BIGINT.UNSIGNED,
      unique: true,
    },
    TenKhachHang: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    SDT: {
      type: DataTypes.STRING(10),
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
    tableName: "KhachHang",
    timestamps: false,
  }
);

export default CustomerModel;
