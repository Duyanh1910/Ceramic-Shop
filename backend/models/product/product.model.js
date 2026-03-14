import { DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

const ProductModel = sequelize.define(
  "SanPham",
  {
    MaSanPham: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    MaDanhMuc: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    TenSanPham: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    MoTa: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    TrangThai: {
      type: DataTypes.TINYINT.UNSIGNED,
      defaultValue: 1,
      allowNull: false,
    },
  },
  {
    tableName: "SanPham",
    timestamps: false,
  },
);

export default ProductModel;
