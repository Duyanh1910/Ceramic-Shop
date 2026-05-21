import { DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

const PaymentTransactionModel = sequelize.define(
  "GiaoDichThanhToan",
  {
    MaGiaoDich: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    MaDonHang: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    MaPhuongThuc: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    LoaiGiaoDich: {
      type: DataTypes.STRING(30),
      defaultValue: "THANH_TOAN",
    },
    MaGiaoDichGoc: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    MaDoiTra: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    MaThamChieu: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    MaGiaoDichDoiTac: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true,
    },
    SoTien: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    TrangThai: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "PENDING",
    },
    MaLoi: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    DuLieuPhanHoi: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    ThoiGianGiaoDich: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "GiaoDichThanhToan",
    createdAt: "CreatedAt",
    updatedAt: "UpdatedAt",
    indexes: [
      {
        fields: ["MaDonHang"],
      },
      {
        fields: ["TrangThai"],
      },
      {
        fields: ["LoaiGiaoDich"],
      },
      {
        fields: ["MaDoiTra"],
      },
    ],
  },
);

export default PaymentTransactionModel;