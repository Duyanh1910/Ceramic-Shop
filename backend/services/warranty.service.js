import {
  WarrantyModel,
  WarrantyHistoryModel,
  OrderDetailModel,
  OrderModel,
  VariantModel,
  ProductModel,
} from "../models/index.js";
import { Op } from "sequelize";

export const WARRANTY_STATUS = {
  EXPIRED: 0,
  ACTIVE: 1,
  CANCELLED: 2,
};

export const getAllWarrantyService = async (
  page = 1,
  limit = 10,
  search = "",
  order = "DESC",
  status,
) => {
  const offset = (page - 1) * limit;

  const warrantyWhere = {};

  if (status !== undefined && status !== null && status !== "") {
    warrantyWhere.TrangThai = status;
  }

  const orderWhere = {};
  if (search) {
    orderWhere.MaHienThi = { [Op.like]: `%${search}%` };
  }

  const sortOrder = ["ASC", "DESC"].includes(order?.toUpperCase())
    ? order.toUpperCase()
    : "DESC";

  const warranties = await WarrantyModel.findAndCountAll({
    where: warrantyWhere,
    limit: limit,
    offset: offset,
    order: [["MaBaoHanh", sortOrder]],
    include: [
      {
        model: OrderDetailModel,
        required: true,
        include: [
          {
            model: OrderModel,
            attributes: ["MaHienThi", "MaDonHang"],
            where: orderWhere,
            required: search ? true : false,
          },
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
  });
  return {
    totalItems: warranties.count,
    totalPages: Math.ceil(warranties.count / limit),
    currentPage: parseInt(page),
    data: warranties.rows,
  };
};

export const getWarrantyByIdService = async (id) => {
  const warranty = await WarrantyModel.findByPk(id, {
    include: [
      {
        model: WarrantyHistoryModel,
        separate: true,
        order: [["NgayXuLy", "DESC"]],
      },
      {
        model: OrderDetailModel,
        include: [
          {
            model: OrderModel,
          },
          {
            model: VariantModel,
          },
        ],
      },
    ],
  });
  return warranty;
};
