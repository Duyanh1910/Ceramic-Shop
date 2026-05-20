import {
  AccountModel,
  CustomerModel,
  OrderModel,
  OrderDetailModel,
  CategoryModel,
} from "./models/index.js";
import { Op } from "sequelize";
const rows = await CategoryModel.findAll({
  where: {
    ParentID: {
      [Op.ne]: null,
    },
  },
});

console.log(rows);
