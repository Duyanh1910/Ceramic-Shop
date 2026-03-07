import sequelize from "../config/database.js";
import AccountModel from "./account.model.js";
import RoleModel from "./role.model.js";
import CustomerModel from "./customer.model.js";
import StaffModel from "./staff.model.js";

RoleModel.hasMany(AccountModel, {
  foreignKey: "MaPhanQuyen",
});
AccountModel.belongsTo(RoleModel, {
  foreignKey: "MaPhanQuyen",
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

export { sequelize, AccountModel, RoleModel, StaffModel, CustomerModel };
