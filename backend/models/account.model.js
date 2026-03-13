import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const AccountModel = sequelize.define(
  "TaiKhoan",
  {
    MaTaiKhoan: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    Username: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    Email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    Password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    MaQuyen: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: "MaPhanQuyen",
    },
  },
  {
    tableName: "TaiKhoan",
    timestamps: false,
  },
);

export default AccountModel;
