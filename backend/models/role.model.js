import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const RoleModel = sequelize.define(
  "PhanQuyen",
  {
    ID_PhanQuyen: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    TenPhanQuyen: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true,
    },
  },
  {
    tableName: "PhanQuyen",
    timestamps: false,
  }
);

export default RoleModel;
