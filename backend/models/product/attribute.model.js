import { DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

const AttributeModel = sequelize.define(
  "ThuocTinh",
  {
    MaThuocTinh: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    TenThuocTinh: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
  },
  {
    tableName: "ThuocTinh",
    timestamps: false,
  },
);

export default AttributeModel;
