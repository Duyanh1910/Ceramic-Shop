import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
const SystemModel = sequelize.define(
  "CauHinhHeThong",
  {
    MaCauHinh: {
      type: DataTypes.STRING(50),
      primaryKey: true,
    },
    GiaTri: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    MoTa: {
      type: DataTypes.STRING(255),
    },
  },
  {
    tableName: "CauHinhHeThong",
    timestamps: false,
  },
);
export default SystemModel;
