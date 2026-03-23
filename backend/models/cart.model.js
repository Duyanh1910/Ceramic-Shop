import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

export const CartModel = sequelize.define(
  "GioHang",
  {
    MaGioHang: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    MaKhachHang: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      unique: true,
    },
  },
  {
    timestamps: false,
    tableName: "GioHang",
  },
);

export const CartInfoModel = sequelize.define(
  "ChiTietGioHang",
  {
    MaChiTietGH: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    MaGioHang: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    MaBienThe: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    SoLuong: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
  },
  {
    tableName: "ChiTietGioHang",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["MaGioHang", "MaBienThe"],
      },
    ],
  },
);
