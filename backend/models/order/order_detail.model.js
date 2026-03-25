import { DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

const OrderDetailModel = sequelize.define(
  "ChiTietDonHang",
  {
    MaCTDH: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    MaDonHang: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    MaBienThe: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    SoLuong: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    GiaBan: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    ThanhTien: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
  },
  {
    tableName: "ChiTietDonHang",
    timestamps: false,
  },
);

export default OrderDetailModel;
