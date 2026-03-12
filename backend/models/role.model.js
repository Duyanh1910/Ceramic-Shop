import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const RoleModel = sequelize.define(
  "PhanQuyen",
  {
    MaPhanQuyen: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    TenQuyen: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
  },
  {
    tableName: "PhanQuyen",
    timestamps: false,
  },
);

export default RoleModel;
