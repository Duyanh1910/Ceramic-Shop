import { DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

const VariantImageModel = sequelize.define(
  "HinhAnhBienThe",
  {
    MaHinhAnh: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    MaBienThe: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    DuongDan: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  },
  {
    tableName: "HinhAnhBienThe",
    timestamps: false,
  },
);

export default VariantImageModel;
