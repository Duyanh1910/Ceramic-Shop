import { DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

const SupplierModel = sequelize.define(
  "NhaCungCap",
  {
    MaNhaCC: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    TenNhaCC: { type: DataTypes.STRING(100), allowNull: false },
    Diachi: { type: DataTypes.STRING(255), allowNull: true },
    SDT: { type: DataTypes.STRING(10), allowNull: true },
  },
  {
    tableName: "NhaCungCap",
    timestamps: false,
    indexes: [{ unique: true, fields: ["MaNhaCC"] }],
  },
);
export default SupplierModel;
