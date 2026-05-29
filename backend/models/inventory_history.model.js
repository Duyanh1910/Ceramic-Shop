import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const InventoryHistoryModel = sequelize.define(
  "LichSuTonKho",
  {
    MaLichSu: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    MaBienThe: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    LoaiGiaoDich: {
      type: DataTypes.STRING(100),
      // Ví dụ: 'XUAT_BAN_HANG' (Bán), 'NHAP_KHO' (Nhập), 'KHACH_HOAN_TRA' (Đổi trả)
    },
    SoLuongThayDoi: {
      type: DataTypes.INTEGER,
      allowNull: false,
      // Lưu số âm (-) nếu xuất kho, số dương (+) nếu nhập kho
    },
    TonKhoHienTai: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    LoaiThamChieu: {
      type: DataTypes.STRING(100),
    },
    MaThamChieu: {
      type: DataTypes.INTEGER,
    },
    NgayTao: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    GhiChu: {
      type: DataTypes.STRING(255),
    },
  },
  {
    tableName: "LichSuTonKho",
    timestamps: false,
    indexes: [{ fields: ["MaBienThe"] }, { fields: ["MaThamChieu"] }],
  },
);

export default InventoryHistoryModel;
