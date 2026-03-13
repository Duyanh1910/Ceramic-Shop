import { DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

const VariantModel = sequelize.define(
  "BienTheSanPham",
  {
    MaBienThe: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    MaSanPham: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    TenBienThe: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    Gia: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    SoLuong: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    TrangThai: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
    },
    MoTa: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    tableName: "BienTheSanPham",
    timestamps: false,
  },
);

export default VariantModel;
