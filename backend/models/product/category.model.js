import { DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

const CategoryModel = sequelize.define(
  "DanhMucSanPham",
  {
    MaDanhMuc: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    TenDanhMuc: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    MoTa: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    ParentID: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
  },
  {
    tableName: "DanhMucSanPham",
    timestamps: false,
  },
);

export default CategoryModel;
