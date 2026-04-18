import sequelize from "../config/database.js";
import { DataTypes } from "sequelize";
const RiskModel = sequelize.define(
  "RuiRo",
  {
    MaRuiRo: {
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    MaDonHang: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    LoaiRuiRo: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    MoTa: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    TrangThai: {
      type: DataTypes.TINYINT,
      defaultValue: 0,
    },
    NgayPhatHien: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    GhiChu: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    tableName: "RuiRo",
    timestamps: false,
  },
);

export default RiskModel;
