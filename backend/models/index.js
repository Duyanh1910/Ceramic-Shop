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

import ShippingModel from "./shipping/shipping.model.js";
import ShippingTypeModel from "./shipping/shipping_type.model.js";

import OrderDetailModel from "./order/order_detail.model.js";
import OrderModel from "./order/order.model.js";
import OrderPromotionModel from "./order/order_promotion.model.js";
import OrderShippingModel from "./order/order_shipping.model.js";

import PaymentMethodModel from "./payment_method.model.js";

import InventoryHistoryModel from "./inventory_history.model.js";

RoleModel.hasMany(AccountModel, {
  foreignKey: "MaQuyen",
  sourceKey: "MaPhanQuyen",
});

AccountModel.belongsTo(RoleModel, {
  foreignKey: "MaQuyen",
  targetKey: "MaPhanQuyen",
});

AccountModel.hasOne(StaffModel, {
  foreignKey: "MaTaiKhoan",
});
StaffModel.belongsTo(AccountModel, {
  foreignKey: "MaTaiKhoan",
});

AccountModel.hasOne(CustomerModel, {
  foreignKey: "MaTaiKhoan",
});
CustomerModel.belongsTo(AccountModel, {
  foreignKey: "MaTaiKhoan",
});

CategoryModel.hasMany(ProductModel, {
  foreignKey: "MaDanhMuc",
});

ProductModel.belongsTo(CategoryModel, {
  foreignKey: "MaDanhMuc",
});

ProductModel.hasMany(VariantModel, {
  foreignKey: "MaSanPham",
});

VariantModel.belongsTo(ProductModel, {
  foreignKey: "MaSanPham",
});

VariantModel.hasMany(VariantImageModel, {
  foreignKey: "MaBienThe",
});

VariantImageModel.belongsTo(VariantModel, {
  foreignKey: "MaBienThe",
});

AttributeModel.hasMany(AttributeValueModel, {
  foreignKey: "MaThuocTinh",
});

AttributeValueModel.belongsTo(AttributeModel, {
  foreignKey: "MaThuocTinh",
});

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

CustomerModel.hasOne(CartModel, {
  foreignKey: "MaKhachHang",
});

CartModel.belongsTo(CustomerModel, {
  foreignKey: "MaKhachHang",
});

CartModel.hasMany(CartInfoModel, {
  foreignKey: "MaGioHang",
});

CartInfoModel.belongsTo(CartModel, {
  foreignKey: "MaGioHang",
});

CartInfoModel.belongsTo(VariantModel, {
  foreignKey: "MaBienThe",
});

VariantModel.hasMany(CartInfoModel, {
  foreignKey: "MaBienThe",
});

PromotionTypeModel.hasMany(PromotionModel, { foreignKey: "MaLoaiKM" });
PromotionModel.belongsTo(PromotionTypeModel, { foreignKey: "MaLoaiKM" });

ShippingTypeModel.hasMany(ShippingModel, { foreignKey: "MaLoaiPhi" });
ShippingModel.belongsTo(ShippingTypeModel, { foreignKey: "MaLoaiPhi" });

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

OrderModel.belongsToMany(ShippingModel, {
  through: OrderShippingModel,
  foreignKey: "MaDonHang",
  otherKey: "MaPhi",
});
ShippingModel.belongsToMany(OrderModel, {
  through: OrderShippingModel,
  foreignKey: "MaPhi",
  otherKey: "MaDonHang",
});

OrderModel.hasMany(OrderShippingModel, {
  foreignKey: "MaDonHang",
});
OrderShippingModel.belongsTo(OrderModel, { foreignKey: "MaDonHang" });
ShippingModel.hasMany(OrderShippingModel, { foreignKey: "MaPhi" });
OrderShippingModel.belongsTo(ShippingModel, {
  foreignKey: "MaPhi",
});

CustomerModel.hasMany(OrderModel, { foreignKey: "MaKhachHang" });
OrderModel.belongsTo(CustomerModel, { foreignKey: "MaKhachHang" });

OrderModel.hasMany(OrderDetailModel, {
  foreignKey: "MaDonHang",
});
OrderDetailModel.belongsTo(OrderModel, { foreignKey: "MaDonHang" });

VariantModel.hasMany(OrderDetailModel, { foreignKey: "MaBienThe" });
OrderDetailModel.belongsTo(VariantModel, {
  foreignKey: "MaBienThe",
});

PaymentMethodModel.hasMany(OrderModel, {
  foreignKey: "MaPhuongThuc",
});

OrderModel.belongsTo(PaymentMethodModel, {
  foreignKey: "MaPhuongThuc",
});

VariantModel.hasMany(InventoryHistoryModel, {
  foreignKey: "MaBienThe",
});

InventoryHistoryModel.belongsTo(VariantModel, {
  foreignKey: "MaBienThe",
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
  OrderShippingModel,
  PromotionModel,
  PromotionTypeModel,
  ShippingModel,
  ShippingTypeModel,
  PaymentMethodModel,
  InventoryHistoryModel,
};
