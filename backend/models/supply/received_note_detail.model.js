import { DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

const ReceivedNoteDetailModel = sequelize.define(
  "ChiTietPhieuNhap",
  {
    MaChiTietPhieu: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    MaPhieuNhap: {
      type: DataTypes.INTEGER,
    },
    MaBienThe: {
      type: DataTypes.INTEGER,
    },
    SoLuong: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    GiaNhap: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    ThanhTien: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
  },
  {
    tableName: "ChiTietPhieuNhap",
    timestamps: false,
    indexes: [{ unique: true, fields: ["MaChiTietPhieu"] }],
  },
);
export default ReceivedNoteDetailModel;
