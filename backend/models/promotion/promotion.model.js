import { DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

const PromotionModel = sequelize.define(
  "KhuyenMai",
  {
    MaKhuyenMai: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    MaLoaiKM: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    TenKhuyenMai: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    GiaTri: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    GiaTriToiThieu: {
      type: DataTypes.DECIMAL(15, 2),
    },
    GiamToiDa: {
      type: DataTypes.DECIMAL(15, 2),
    },
    NgayBatDau: {
      type: DataTypes.DATE,
    },
    NgayKetThuc: {
      type: DataTypes.DATE,
    },
    TrangThai: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
    },
  },
  {
    tableName: "KhuyenMai",
    timestamps: false,
  },
);

export default PromotionModel;
