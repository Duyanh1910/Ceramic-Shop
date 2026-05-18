import sequelize from "../config/database.js";
import { DataTypes } from "sequelize";

const WarrantyHistoryModel = sequelize.define(
  "LichSuBaoHanh",
  {
    MaLichSuBH: {
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    MaBaoHanh: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    HanhDong: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    NgayXuLy: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    NoiDungXuLy: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    AnhMinhChung: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    MaNhanVienXuLy: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    TrangThai: {
      type: DataTypes.TINYINT,
      allowNull: true,
    },
  },
  {
    tableName: "LichSuBaoHanh",
    timestamps: false,
  },
);

export default WarrantyHistoryModel;