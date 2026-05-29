import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const NotificationsModel = sequelize.define(
  "ThongBao",
  {
    MaThongBao: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: "MaThongBao",
    },
    LoaiThongBao: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: "LoaiThongBao",
    },
    MaNhanVien: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "MaNhanVien",
    },
    TieuDe: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: "TieuDe",
    },
    NoiDung: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: "NoiDung",
    },
    DaDoc: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0,
      field: "DaDoc",
    },
    DuongDan: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: "DuongDan",
    },
    NgayTao: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
      field: "NgayTao",
    },
  },
  {
    tableName: "ThongBao",
    timestamps: false,
  },
);

export default NotificationsModel;
