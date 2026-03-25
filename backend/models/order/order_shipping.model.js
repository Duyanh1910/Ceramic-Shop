import { DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

const OrderShippingModel = sequelize.define(
  "ChiTietPhiVanChuyenDonHang",
  {
    MaDonHang: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    MaPhi: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    SoTienPhi: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
  },
  {
    tableName: "ChiTietPhiVanChuyenDonHang",
    timestamps: false,
  },
);

export default OrderShippingModel;
