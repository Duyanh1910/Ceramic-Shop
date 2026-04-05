import {
  OrderModel,
  ProductModel,
  VariantModel,
  OrderDetailModel,
  sequelize,
} from "../../models/index.js";
import { fn, col } from "sequelize";
export const countProductSelledServices = async () => {
  const result = await OrderDetailModel.findAll({
    attributes: [[fn("COUNT", "SoLuong"), "Số lượng"]],
  });
};
