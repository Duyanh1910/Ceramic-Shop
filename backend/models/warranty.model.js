import sequelize from "../config/database.js";
import { DataTypes } from "sequelize";
const WarrantyModel = sequelize.define(
  "BaoHanh",
  {
    MaBaoHanh: {
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    MaCTDH: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    NgayBatDau: {
      allowNull: false,
      type: DataTypes.DATE,
    },
    NgayKetThuc: {
      allowNull: false,
      type: DataTypes.DATE,
    },
    // 1: active
    // 2: expired
    // 3: cancelled
    TrangThai: {
      type: DataTypes.TINYINT.UNSIGNED,
      defaultValue: 1,
    },
    GhiChu: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    tableName: "BaoHanh",
    timestamps: false,
  },
);

export default WarrantyModel;
