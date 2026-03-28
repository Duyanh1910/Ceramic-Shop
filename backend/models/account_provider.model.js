import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const AccountProviderModel = sequelize.define(
  "TaiKhoanProvider",
  {
    MaProvider: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    MaTaiKhoan: { type: DataTypes.INTEGER, allowNull: false },
    Provider: { type: DataTypes.STRING(50), allowNull: false },
    ProviderID: { type: DataTypes.STRING(255), allowNull: false },
    CreatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    tableName: "TaiKhoanProvider",
    timestamps: false,
    indexes: [{ unique: true, fields: ["Provider", "ProviderID"] }],
  },
);
export default AccountProviderModel;
