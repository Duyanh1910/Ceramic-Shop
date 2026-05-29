import sequelize from "../config/database.js";
import AccountModel from "./account.model.js";
import RoleModel from "./role.model.js";
import CustomerModel from "./customer.model.js";
import StaffModel from "./staff.model.js";

import ProductModel from "./product/product.model.js";
import CategoryModel from "./product/category.model.js";
import VariantModel from "./product/variant.model.js";
import VariantImageModel from "./product/variant_image.model.js";
import AttributeModel from "./product/attribute.model.js";
import AttributeValueModel from "./product/attribute_value.model.js";
import VariantAttributeModel from "./product/variant_attribute.model.js";

import { CartInfoModel, CartModel } from "./cart.model.js";

import PromotionTypeModel from "./promotion/promotion_type.model.js";
import PromotionModel from "./promotion/promotion.model.js";
import PromotionWalletModel from "./promotion/promotion_wallet.model.js";

import OrderDetailModel from "./order/order_detail.model.js";
import OrderModel from "./order/order.model.js";
import OrderPromotionModel from "./order/order_promotion.model.js";

import PaymentMethodModel from "./payment/payment_method.model.js";
import PaymentTransactionModel from "./payment/payment_transaction.model.js";
import InventoryHistoryModel from "./inventory_history.model.js";
import SystemModel from "./system_model.model.js";
import AccountProviderModel from "./account_provider.model.js";

import ShippingTypeModel from "./shipping/shipping_type.model.js";
import RatingModel from "./rating.model.js";

import NewsModel from "./news.model.js";

import WarrantyHistoryModel from "./warranty_history.model.js";
import WarrantyModel from "./warranty.model.js";
import RiskModel from "./risk.model.js";
import ReturnModel from "./return.model.js";
import ReturnProcessModel from "./return_process.model.js";

import SupplierModel from "./supply/supplier.model.js";
import ReceivedNoteDetailModel from "./supply/received_note_detail.model.js";
import ReceivedNoteModel from "./supply/received_note.model.js";
import NotificationsModel from "./notification.model.js";
// --- QUAN HỆ TÀI KHOẢN & PHÂN QUYỀN ---
RoleModel.hasMany(AccountModel, {
  foreignKey: "MaQuyen",
  sourceKey: "MaPhanQuyen",
});
AccountModel.belongsTo(RoleModel, {
  foreignKey: "MaQuyen",
  targetKey: "MaPhanQuyen",
});

AccountModel.hasOne(StaffModel, { foreignKey: "MaTaiKhoan" });
StaffModel.belongsTo(AccountModel, { foreignKey: "MaTaiKhoan" });

AccountModel.hasOne(CustomerModel, { foreignKey: "MaTaiKhoan" });
CustomerModel.belongsTo(AccountModel, { foreignKey: "MaTaiKhoan" });

AccountModel.hasMany(AccountProviderModel, { foreignKey: "MaTaiKhoan" });
AccountProviderModel.belongsTo(AccountModel, { foreignKey: "MaTaiKhoan" });

// --- QUAN HỆ SẢN PHẨM & BIẾN THỂ ---
CategoryModel.hasMany(ProductModel, { foreignKey: "MaDanhMuc" });
ProductModel.belongsTo(CategoryModel, { foreignKey: "MaDanhMuc" });

ProductModel.hasMany(VariantModel, { foreignKey: "MaSanPham" });
VariantModel.belongsTo(ProductModel, { foreignKey: "MaSanPham" });

VariantModel.hasMany(VariantImageModel, { foreignKey: "MaBienThe" });
VariantImageModel.belongsTo(VariantModel, { foreignKey: "MaBienThe" });

AttributeModel.hasMany(AttributeValueModel, { foreignKey: "MaThuocTinh" });
AttributeValueModel.belongsTo(AttributeModel, { foreignKey: "MaThuocTinh" });

VariantModel.belongsToMany(AttributeValueModel, {
  through: VariantAttributeModel,
  foreignKey: "MaBienThe",
  otherKey: "MaGiaTri",
});
AttributeValueModel.belongsToMany(VariantModel, {
  through: VariantAttributeModel,
  foreignKey: "MaGiaTri",
  otherKey: "MaBienThe",
});

// --- QUAN HỆ GIỎ HÀNG ---
CustomerModel.hasOne(CartModel, { foreignKey: "MaKhachHang" });
CartModel.belongsTo(CustomerModel, { foreignKey: "MaKhachHang" });

CartModel.hasMany(CartInfoModel, { foreignKey: "MaGioHang" });
CartInfoModel.belongsTo(CartModel, { foreignKey: "MaGioHang" });

CartInfoModel.belongsTo(VariantModel, { foreignKey: "MaBienThe" });
VariantModel.hasMany(CartInfoModel, { foreignKey: "MaBienThe" });

// --- QUAN HỆ KHUYẾN MÃI & VÍ ---
PromotionTypeModel.hasMany(PromotionModel, { foreignKey: "MaLoaiKM" });
PromotionModel.belongsTo(PromotionTypeModel, { foreignKey: "MaLoaiKM" });

CategoryModel.hasMany(PromotionModel, { foreignKey: "MaDanhMuc" });
PromotionModel.belongsTo(CategoryModel, { foreignKey: "MaDanhMuc" });

CustomerModel.belongsToMany(PromotionModel, {
  through: PromotionWalletModel,
  foreignKey: "MaKhachHang",
  otherKey: "MaKhuyenMai",
});
PromotionModel.belongsToMany(CustomerModel, {
  through: PromotionWalletModel,
  foreignKey: "MaKhuyenMai",
  otherKey: "MaKhachHang",
});

CustomerModel.hasMany(PromotionWalletModel, { foreignKey: "MaKhachHang" });
PromotionWalletModel.belongsTo(CustomerModel, { foreignKey: "MaKhachHang" });

PromotionModel.hasMany(PromotionWalletModel, { foreignKey: "MaKhuyenMai" });
PromotionWalletModel.belongsTo(PromotionModel, { foreignKey: "MaKhuyenMai" });

// --- QUAN HỆ ĐƠN HÀNG ---
CustomerModel.hasMany(OrderModel, { foreignKey: "MaKhachHang" });
OrderModel.belongsTo(CustomerModel, { foreignKey: "MaKhachHang" });

OrderModel.hasMany(OrderDetailModel, { foreignKey: "MaDonHang" });
OrderDetailModel.belongsTo(OrderModel, { foreignKey: "MaDonHang" });

VariantModel.hasMany(OrderDetailModel, { foreignKey: "MaBienThe" });
OrderDetailModel.belongsTo(VariantModel, { foreignKey: "MaBienThe" });

PaymentMethodModel.hasMany(OrderModel, { foreignKey: "MaPhuongThuc" });
OrderModel.belongsTo(PaymentMethodModel, { foreignKey: "MaPhuongThuc" });

ShippingTypeModel.hasMany(OrderModel, {
  foreignKey: "MaLoaiPhi",
});

OrderModel.belongsTo(ShippingTypeModel, {
  foreignKey: "MaLoaiPhi",
});

// Đơn hàng - Khuyến mãi
OrderModel.belongsToMany(PromotionModel, {
  through: OrderPromotionModel,
  foreignKey: "MaDonHang",
  otherKey: "MaKhuyenMai",
});
PromotionModel.belongsToMany(OrderModel, {
  through: OrderPromotionModel,
  foreignKey: "MaKhuyenMai",
  otherKey: "MaDonHang",
});

OrderModel.hasMany(OrderPromotionModel, { foreignKey: "MaDonHang" });
OrderPromotionModel.belongsTo(OrderModel, { foreignKey: "MaDonHang" });
PromotionModel.hasMany(OrderPromotionModel, { foreignKey: "MaKhuyenMai" });
OrderPromotionModel.belongsTo(PromotionModel, { foreignKey: "MaKhuyenMai" });

// --- QUAN HỆ TỒN KHO ---
VariantModel.hasMany(InventoryHistoryModel, { foreignKey: "MaBienThe" });
InventoryHistoryModel.belongsTo(VariantModel, { foreignKey: "MaBienThe" });

OrderModel.hasMany(InventoryHistoryModel, {
  foreignKey: "MaThamChieu",
  sourceKey: "MaDonHang",
  constraints: false,
  as: "LichSuTonKho",
  scope: {
    LoaiThamChieu: "DonHang",
  },
});

InventoryHistoryModel.belongsTo(OrderModel, {
  foreignKey: "MaThamChieu",
  targetKey: "MaDonHang",
  constraints: false,
  as: "DonHang",
});

// --- QUAN HỆ ĐÁNH GIÁ ---
RatingModel.belongsTo(CustomerModel, {
  foreignKey: "MaKhachHang",
});
RatingModel.belongsTo(OrderDetailModel, {
  foreignKey: "MaCTDH",
});

CustomerModel.hasMany(RatingModel, {
  foreignKey: "MaKhachHang",
});
OrderDetailModel.hasMany(RatingModel, {
  foreignKey: "MaCTDH",
});

// --- QUAN HỆ THANH TOÁN ---
PaymentMethodModel.hasMany(PaymentTransactionModel, {
  foreignKey: "MaPhuongThuc",
});
PaymentTransactionModel.belongsTo(PaymentMethodModel, {
  foreignKey: "MaPhuongThuc",
});

PaymentTransactionModel.belongsTo(OrderModel, {
  foreignKey: "MaDonHang",
});
OrderModel.hasMany(PaymentTransactionModel, {
  foreignKey: "MaDonHang",
});

// --- QUAN HỆ TIN TỨC ---
StaffModel.hasMany(NewsModel, {
  foreignKey: "MaNhanVien",
});
NewsModel.belongsTo(StaffModel, {
  foreignKey: "MaNhanVien",
});

// --- QUAN HỆ HẬU MÃI ---
OrderModel.hasMany(RiskModel, {
  foreignKey: "MaDonHang",
});
RiskModel.belongsTo(OrderModel, {
  foreignKey: "MaDonHang",
});
StaffModel.hasMany(RiskModel, {
  foreignKey: "MaNhanVienPhuTrach",
  as: "RuiRoPhuTrach",
});
RiskModel.belongsTo(StaffModel, {
  foreignKey: "MaNhanVienPhuTrach",
  as: "NhanVienPhuTrach",
});

OrderDetailModel.hasMany(WarrantyModel, {
  foreignKey: "MaCTDH",
});
WarrantyModel.belongsTo(OrderDetailModel, {
  foreignKey: "MaCTDH",
});

WarrantyModel.hasMany(WarrantyHistoryModel, {
  foreignKey: "MaBaoHanh",
});
WarrantyHistoryModel.belongsTo(WarrantyModel, {
  foreignKey: "MaBaoHanh",
});
// --- QUAN HỆ ĐỔI TRẢ ---
OrderDetailModel.hasMany(ReturnModel, {
  foreignKey: "MaCTDH",
});
ReturnModel.belongsTo(OrderDetailModel, {
  foreignKey: "MaCTDH",
});

VariantModel.hasMany(ReturnModel, {
  foreignKey: "MaBienTheDoi",
  as: "YeuCauDoiTraThayThe",
});
ReturnModel.belongsTo(VariantModel, {
  foreignKey: "MaBienTheDoi",
  as: "BienTheDoi",
});

StaffModel.hasMany(ReturnModel, {
  foreignKey: "MaNhanVienXuLy",
});
ReturnModel.belongsTo(StaffModel, {
  foreignKey: "MaNhanVienXuLy",
});

ReturnModel.hasMany(ReturnProcessModel, {
  foreignKey: "MaDoiTra",
});
ReturnProcessModel.belongsTo(ReturnModel, {
  foreignKey: "MaDoiTra",
});

ReturnModel.hasMany(PaymentTransactionModel, {
  foreignKey: "MaDoiTra",
});
PaymentTransactionModel.belongsTo(ReturnModel, {
  foreignKey: "MaDoiTra",
});

// --- QUAN HỆ NHÀ CUNG CẤP & PHIẾU NHẬP ---
SupplierModel.hasMany(ReceivedNoteModel, {
  foreignKey: "MaNhaCC",
});
ReceivedNoteModel.belongsTo(SupplierModel, {
  foreignKey: "MaNhaCC",
});

SupplierModel.hasMany(ProductModel, {
  foreignKey: "MaNhaCC",
});
ProductModel.belongsTo(SupplierModel, {
  foreignKey: "MaNhaCC",
});

StaffModel.hasMany(ReceivedNoteModel, {
  foreignKey: "MaNhanVien",
});
ReceivedNoteModel.belongsTo(StaffModel, {
  foreignKey: "MaNhanVien",
});

ReceivedNoteModel.hasMany(ReceivedNoteDetailModel, {
  foreignKey: "MaPhieuNhap",
});
ReceivedNoteDetailModel.belongsTo(ReceivedNoteModel, {
  foreignKey: "MaPhieuNhap",
});

VariantModel.hasMany(ReceivedNoteDetailModel, {
  foreignKey: "MaBienThe",
});
ReceivedNoteDetailModel.belongsTo(VariantModel, {
  foreignKey: "MaBienThe",
});

ReceivedNoteModel.hasMany(InventoryHistoryModel, {
  foreignKey: "MaThamChieu",
  sourceKey: "MaPhieuNhap",
  constraints: false,
  as: "LichSuTonKhoPhieuNhap",
});

InventoryHistoryModel.belongsTo(ReceivedNoteModel, {
  foreignKey: "MaThamChieu",
  targetKey: "MaPhieuNhap",
  constraints: false,
  as: "PhieuNhap",
});

// --- QUAN HỆ THÔNG BÁO ---
StaffModel.hasMany(NotificationsModel, {
  foreignKey: "MaNhanVien",
  as: "ThongBao",
});

NotificationsModel.belongsTo(StaffModel, {
  foreignKey: "MaNhanVien",
  as: "NhanVien",
});
export {
  sequelize,
  AccountModel,
  RoleModel,
  StaffModel,
  CustomerModel,
  ProductModel,
  CategoryModel,
  VariantModel,
  VariantImageModel,
  AttributeModel,
  AttributeValueModel,
  VariantAttributeModel,
  CartModel,
  CartInfoModel,
  OrderDetailModel,
  OrderModel,
  OrderPromotionModel,
  PromotionModel,
  PromotionTypeModel,
  PaymentMethodModel,
  InventoryHistoryModel,
  PromotionWalletModel,
  SystemModel,
  AccountProviderModel,
  RatingModel,
  PaymentTransactionModel,
  ShippingTypeModel,
  NewsModel,
  RiskModel,
  WarrantyHistoryModel,
  WarrantyModel,
  ReturnModel,
  ReturnProcessModel,
  ReceivedNoteDetailModel,
  ReceivedNoteModel,
  SupplierModel,
  NotificationsModel,
};
