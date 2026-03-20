import {
  getAllAttributesService,
  getAttributeService,
} from "../services/attribute.services.js";

export const getAllAttributesController = async (req, res, next) => {
  try {
    const attributes = await getAllAttributesService();
    return res.status(200).json({
      success: true,
      message: "Lấy danh sách thuộc tính thành công!",
      result: attributes,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export const getAttributeController = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return next(new ErrorHandler("ID không hợp lệ!", 400));
    }
    const attribute = await getAttributeService(id);
    if (!attribute) {
      return next(new ErrorHandler("Không tồn tại thuộc tính này!", 404));
    }
    return res.status(200).json({
      success: true,
      message: "Lấy danh sách thuộc tính thành công!",
      result: attribute,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};
