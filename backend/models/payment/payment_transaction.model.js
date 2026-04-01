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
    MaThamChieu: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true, // Đảm bảo mã gửi lên VNPAY/MoMo là duy nhất
    },
    MaGiaoDichDoiTac: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true, // Mã trả về từ Gateway
    },
    SoTien: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    TrangThai: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "PENDING", // PENDING, SUCCESS, FAILED
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
    ],
  },
);

export default PaymentTransactionModel;
