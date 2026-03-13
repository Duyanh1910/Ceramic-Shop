import { DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

const AttributeValueModel = sequelize.define(
  "GiaTriThuocTinh",
  {
    MaGiaTri: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    MaThuocTinh: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    GiaTri: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
  },
  {
    tableName: "GiaTriThuocTinh",
    timestamps: false,
  },
);

export default AttributeValueModel;
