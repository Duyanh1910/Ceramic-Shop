import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const ReturnProcessModel = sequelize.define(
  "XuLyDoiTra",
  {
    MaXuLy: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    MaDoiTra: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    HanhDong: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    GhiChu: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    NgayXuLy: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "XuLyDoiTra",
    timestamps: false,
  },
);

export default ReturnProcessModel;