import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const AccountModel = sequelize.define(
  "TaiKhoan",
  {
    ID_TaiKhoan: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    Username: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    Password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    ID_PhanQuyen: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
  },
  {
    tableName: "TaiKhoan",
    timestamps: false,
  }
);

export default AccountModel;
