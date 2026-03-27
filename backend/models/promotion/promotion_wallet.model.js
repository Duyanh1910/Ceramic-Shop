import { DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

const PromotionWalletModel = sequelize.define(
  "ViKhuyenMai",
  {
    MaVi: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    MaKhachHang: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    MaKhuyenMai: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    NgayLuu: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    TrangThaiSuDung: {
      type: DataTypes.TINYINT,
      defaultValue: 0,
    },
  },
  {
    tableName: "ViKhuyenMai",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["MaKhachHang", "MaKhuyenMai"],
      },
    ],
  },
);

export default PromotionWalletModel;
