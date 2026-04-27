import {
  AccountModel,
  CustomerModel,
  OrderModel,
  OrderDetailModel,
  
} from "./models/index.js";
import { Op } from "sequelize";
const row = await CustomerModel.findOne({
  include: [
    {
      model: AccountModel,
      as: "TaiKhoan",
      where: {
        Username: {
          [Op.like]: "khachhang1",
        },
      },
    },
  ],
});

console.log(row);
