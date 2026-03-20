import {
  AttributeValueModel,
  AttributeModel,
  sequelize,
} from "../models/index.js";

export const getAllAttributesService = async () => {
  const attributes = await AttributeModel.findAll({
    order: [["MaThuocTinh", "ASC"]],
  });
  return attributes;
};

export const getAttributeService = async (id) => {
  const attribute = await AttributeModel.findByPk(id, {
    include: [
      {
        model: AttributeValueModel,
        attributes: ["MaGiaTri", "GiaTri"],
      },
    ],
  });
  return attribute;
};
