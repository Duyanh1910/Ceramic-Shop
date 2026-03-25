import { DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

const OrderPromotionModel = sequelize.define(
  "ChiTietKhuyenMaiDonHang",
  {
    MaDonHang: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    MaKhuyenMai: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    SoTienChietKhau: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
  },
  {
    tableName: "ChiTietKhuyenMaiDonHang",
    timestamps: false,
  }
);

export default OrderPromotionModel;