import { DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

const PaymentMethodModel = sequelize.define(
  "PhuongThucThanhToan",
  {
    MaPhuongThuc: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    TenPhuongThuc: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    MoTa: {
      type: DataTypes.STRING(255),
    },
    TrangThai: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
    },
  },
  {
    tableName: "PhuongThucThanhToan",
    timestamps: false,
  },
);

export default PaymentMethodModel;
