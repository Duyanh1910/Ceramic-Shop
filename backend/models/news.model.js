import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const NewsModel = sequelize.define(
  "TinTuc",
  {
    MaTinTuc: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    MaNhanVien: {
      type: DataTypes.INTEGER,
    },
    TieuDe: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    NoiDung: {
      type: DataTypes.TEXT("long"),
      allowNull: true,
    },
    HinhAnh: {
      type: DataTypes.STRING(255),
    },
    NgayTao: {
      type: DataTypes.DATE,
      default: DataTypes.NOW,
    },
    TrangThai: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
    },
  },
  {
    tableName: "TinTuc",
    timestamps: false,
  },
);

export default NewsModel;
