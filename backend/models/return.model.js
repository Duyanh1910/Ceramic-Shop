import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const ReturnModel = sequelize.define(
  "DoiTra",
  {
    MaDoiTra: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    MaCTDH: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    LoaiYeuCau: {
      type: DataTypes.STRING(50),
      defaultValue: "DOI_TRA",
    },
    MaBienTheDoi: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    SoLuongDoiTra: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    LyDo: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    TinhTrangHangTra: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    CoNhapLaiKho: {
      type: DataTypes.TINYINT,
      defaultValue: 0,
    },
    HinhThucXuLy: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    SoTienHoan: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
    },
    AnhMinhChung: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    MaNhanVienXuLy: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    TrangThai: {
      type: DataTypes.TINYINT,
      defaultValue: 0,
    },
    NgayYeuCau: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    NgayHoanTat: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "DoiTra",
    timestamps: false,
  },
);

export default ReturnModel;