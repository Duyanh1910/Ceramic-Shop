import sequelize from "../config/database.js";
import AccountModel from "./account.model.js";
import RoleModel from "./role.model.js";
import CustomerModel from "./customer.model.js";
import StaffModel from "./staff.model.js";

RoleModel.hasMany(AccountModel, {
  foreignKey: "ID_PhanQuyen",
});
AccountModel.belongsTo(RoleModel, {
  foreignKey: "ID_PhanQuyen",
});

AccountModel.hasOne(StaffModel, {
  foreignKey: "ID_TaiKhoan",
});
StaffModel.belongsTo(AccountModel, {
  foreignKey: "ID_TaiKhoan",
});

AccountModel.hasOne(CustomerModel, {
  foreignKey: "ID_TaiKhoan",
});
CustomerModel.belongsTo(AccountModel, {
  foreignKey: "ID_TaiKhoan",
});

export { sequelize, AccountModel, RoleModel, StaffModel, CustomerModel };
