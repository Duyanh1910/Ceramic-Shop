import { DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

const ReceivedNoteModel = sequelize.define(
  "PhieuNhap",
  {
    MaPhieuNhap: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    MaNhaCC: {
      type: DataTypes.INTEGER,
    },
    MaNhanVien: {
      type: DataTypes.INTEGER,
    },
    NgayNhap: { type: DataTypes.NOW, allowNull: false },
    TongTien: { type: DataTypes.DECIMAL(15, 2), default: 0 },
    GhiChu: { type: DataTypes.STRING(255), allowNull: true },
    TrangThai: { type: DataTypes.TINYINT, default: 0 },
    // 0: Phiếu tạm / Chờ nhập
    // 1: Đã nhập kho / Hoàn tất
    // 2: Đã hủy
  },
  {
    tableName: "PhieuNhap",
    timestamps: false,
    indexes: [{ unique: true, fields: ["MaNhaCC"] }],
  },
);
export default ReceivedNoteModel;
