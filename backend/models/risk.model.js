import sequelize from "../config/database.js";
import { DataTypes } from "sequelize";

const RiskModel = sequelize.define(
  "RuiRo",
  {
    MaRuiRo: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    MaDonHang: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    LoaiRuiRo: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    MucDo: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: "BINH_THUONG",
    },
    NguonPhatHien: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: "NHAN_VIEN",
    },
    MoTa: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    TrangThai: {
      type: DataTypes.TINYINT,
      allowNull: true,
      defaultValue: 0,
    },
    NgayPhatHien: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
    NgayXuLy: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    GhiChu: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    MaNhanVienPhuTrach: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "RuiRo",
    timestamps: false,
  },
);

export default RiskModel;