import { DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

const OrderModel = sequelize.define(
  "DonHang",
  {
    MaDonHang: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    MaKhachHang: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    NgayDat: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    TongTienHang: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
    },
    TongPhiVanChuyen: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
    },
    TongGiamGia: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
    },
    TongThanhToan: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
    },
    DiaChiGiaoHang: {
      type: DataTypes.STRING(255),
    },
    TenNguoiNhan: {
      type: DataTypes.STRING(100),
    },
    SDT: {
      type: DataTypes.STRING(10),
    },
    TrangThaiDonHang: {
      type: DataTypes.TINYINT,
      defaultValue: 0,
      // 0: Chờ xác nhận, 1: Đang chuẩn bị, 2: Đang giao, 3: Hoàn thành, 4: Đã hủy
    },
    TrangThaiThanhToan: {
      type: DataTypes.TINYINT,
      defaultValue: 0,
      // 0: Chưa thanh toán, 1: Đã thanh toán
    },
    MaPhuongThuc: {
      type: DataTypes.INTEGER,
    },
    GhiChu: {
      type: DataTypes.STRING(255),
    },
    MaHienThi: {
      type: DataTypes.STRING(30),
      unique: true,
      allowNull: false,
    },
    MaLoaiPhi: {
      type: DataTypes.INTEGER,
    },
  },
  {
    tableName: "DonHang",
    timestamps: false,
  },
);

export default OrderModel;
