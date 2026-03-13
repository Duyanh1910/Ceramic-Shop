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
};
