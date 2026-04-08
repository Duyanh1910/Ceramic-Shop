import {
  addNewProductService,
  deleteVariantImageService,
} from "../../../services/product.service.js";
import ErrorHandler from "../../../utils/error_handler.js";
import { checkValidate, validateVariants } from "../../../utils/helpers.js";

export const addNewProductController = async (req, res, next) => {
  try {
    const {
      categoryID,
      productName,
      thumbnail,
      brand,
      description,
      status = 1,
      BienThe,
    } = req.body;

    if (!checkValidate(productName, thumbnail)) {
      return next(
        new ErrorHandler("Vui lòng điền đầy đủ thông tin sản phẩm!", 400),
      );
    }
    if (!Number.isInteger(categoryID) || categoryID <= 0) {
      return next(new ErrorHandler("ID không hợp lệ!", 400));
    }
    if (!Number.isInteger(status) || ![0, 1].includes(status)) {
      return next(new ErrorHandler("Trạng thái không hợp lệ!", 400));
    }
    validateVariants(BienThe);
    const product = await addNewProductService(
      Number(categoryID),
      productName,
      thumbnail,
      brand,
      description,
      Number(status),
      BienThe,
    );
    return res.status(201).json({
      success: true,
      message: "Thêm mới sản phẩm thành công!",
      result: product,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export const deleteVariantImage = async (req, res, next) => {
  try {
    const { variantID, imageID } = req.body;
    if (!variantID || !Number(variantID)) {
      return next(new ErrorHandler("Mã biến thể không hợp lệ!", 400));
    }
    if (!imageID || !Array.isArray(imageID)) {
      return next(new ErrorHandler("Mã hình ảnh không hợp lệ!", 400));
    }
    for (const item of imageID) {
      if (!Number.isInteger(item)) {
        return next(new ErrorHandler("Mã hình ảnh không hợp lệ!", 400));
      }
    }
    const result = await deleteVariantImageService(imageID, variantID);
    return res.status(204).json({
      success: true,
      message: "Xóa hình ảnh của biến thể thành công!",
    });
  } catch (err) {
    next(err);
  }
};
