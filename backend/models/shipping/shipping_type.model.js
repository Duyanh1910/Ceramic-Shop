import { DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

const ShippingTypeModel = sequelize.define(
  "LoaiPhiVanChuyen",
  {
    MaLoaiPhi: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    TenLoaiPhi: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    MoTa: {
      type: DataTypes.STRING(255),
    },
  },
  {
    tableName: "LoaiPhiVanChuyen",
    timestamps: false,
  },
);

export default ShippingTypeModel;
