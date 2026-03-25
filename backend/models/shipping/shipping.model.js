import { DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

const ShippingModel = sequelize.define(
  "PhiVanChuyen",
  {
    MaPhi: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    MaLoaiPhi: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    GiaTri: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
  },
  {
    tableName: "PhiVanChuyen",
    timestamps: false,
  },
);

export default ShippingModel;
