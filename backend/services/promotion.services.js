import {
  CustomerModel,
  PromotionModel,
  PromotionTypeModel,
  PromotionWalletModel,
} from "../models/index.js";
import ErrorHandler from "../utils/error_handler.js";
import { Sequelize, Op } from "sequelize";

export const getAllPromotionsService = async () => {
  const now = new Date();
  return await PromotionModel.findAll({
    where: {
      TrangThai: 1,
      NgayBatDau: {
        [Op.lte]: now,
      },
      NgayKetThuc: {
        [Op.gte]: now,
      },
    },
    order: [["NgayKetThuc", "ASC"]],
  });
};
