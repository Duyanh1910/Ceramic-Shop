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
      allowNull: false, // Bắt buộc phải biết là thay đổi tồn kho của sản phẩm nào
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
      // Số lượng tồn kho NGAY TẠI THỜI ĐIỂM giao dịch này xảy ra
    },
    LoaiThamChieu: {
      type: DataTypes.STRING(100),
      // Lưu tên bảng liên quan, ví dụ: 'DON_HANG', 'PHIEU_NHAP', 'DOI_TRA'
    },
    MaThamChieu: {
      type: DataTypes.INTEGER,
      // Lưu ID của Đơn hàng, Phếu nhập hoặc Đơn đổi trả tương ứng
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
