import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const RatingModel = sequelize.define(
  "DanhGia",
  {
    MaDanhGia: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    MaKhachHang: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    MaCTDH: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    DiemDanhGia: {
      type: DataTypes.INTEGER,
    },
    NoiDung: {
      type: DataTypes.STRING,
    },
    NgayGui: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    TrangThai: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
    },
  },
  {
    tableName: "DanhGia",
    timestamps: false,
  },
);

export default RatingModel;
