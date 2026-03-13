import { DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

const VariantAttributeModel = sequelize.define(
  "ChiTietBienThe",
  {
    MaBienThe: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
    },
    MaGiaTri: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
    },
  },
  {
    tableName: "ChiTietBienThe",
    timestamps: false,
  },
);

export default VariantAttributeModel;
