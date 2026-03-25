import { DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

const PromotionTypeModel = sequelize.define(
  "LoaiKhuyenMai",
  {
    MaLoaiKM: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    TenLoaiKM: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    MoTa: {
      type: DataTypes.STRING(255),
    },
  },
  {
    tableName: "LoaiKhuyenMai",
    timestamps: false,
  },
);

export default PromotionTypeModel;
