import {
  RiskModel,
  OrderModel,
  OrderDetailModel,
  VariantModel,
  ProductModel,
} from "../models/index.js";
import { Op } from "sequelize";

export const RISK_STATUS = {
  PENDING: 0,
  RESOLVED: 1,
  INVALID: 2,
};

export const getAllRiskService = async (
  page = 1,
  limit = 10,
  search = "",
  status,
  order = "DESC",
) => {
  const offset = (page - 1) * limit;

  const riskWhere = {};
  const orderWhere = {};

  const sortOrder = ["ASC", "DESC"].includes(order?.toUpperCase())
    ? order.toUpperCase()
    : "DESC";

  if (status !== undefined && status !== null && status !== "") {
    riskWhere.TrangThai = status;
  }

  if (search) {
    orderWhere.MaHienThi = { [Op.like]: `%${search}%` };
  }

  const risks = await RiskModel.findAndCountAll({
    where: riskWhere,
    limit: limit,
    offset: offset,
    order: [["MaRuiRo", sortOrder]],
    include: [
      {
        model: OrderModel,
        where: orderWhere,
        required: search ? true : false,
        include: [
          {
            model: OrderDetailModel,
            include: [
              {
                model: VariantModel,
                include: [
                  {
                    model: ProductModel,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  });

  return {
    totalItems: risks.count,
    totalPages: Math.ceil(risks.count / limit),
    currentPage: page,
    data: risks.rows,
  };
};
