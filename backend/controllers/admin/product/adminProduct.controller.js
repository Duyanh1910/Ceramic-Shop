import {
  addNewProductService,
  deleteVariantImageService,
  getAllProductsAdminService,
  getProductAdminService,
  updateProductInfoService,
  updateProductStatusService,
  updateVariantStatusService,
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
    if (!Number.isInteger(Number(categoryID)) || Number(categoryID) <= 0) {
      return next(new ErrorHandler("ID danh mục không hợp lệ!", 400));
    }
    if (!Number.isInteger(Number(status)) || ![0, 1].includes(Number(status))) {
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

export const getProducts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      sort = "MaSanPham",
      order = "DESC",
      category = null,
    } = req.query;

    const products = await getAllProductsAdminService(
      Number(page),
      Number(limit),
      search,
      sort,
      order,
      category ? Number(category) : null,
    );

    res.status(200).json({
      success: true,
      message: "Lấy thông tin danh sách sản phẩm thành công!",
      result: products,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export const getProductInfo = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return next(new ErrorHandler("ID sản phẩm không hợp lệ!", 400));
    }

    const product = await getProductAdminService(id);
    if (!product) {
      return next(new ErrorHandler("Không tìm thấy sản phẩm này!", 404));
    }

    return res.status(200).json({
      success: true,
      message: "Lấy thông tin sản phẩm thành công!",
      result: product,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export const updateProductController = async (req, res, next) => {
  try {
    const productID = Number(req.params.id); // Lấy ID từ URL params
    const {
      categoryID,
      productName,
      thumbnail,
      brand,
      description,
      status = 1,
      BienThe,
    } = req.body;

    if (!Number.isInteger(productID) || productID <= 0) {
      return next(new ErrorHandler("ID sản phẩm không hợp lệ!", 400));
    }
    if (!Number.isInteger(Number(categoryID)) || Number(categoryID) <= 0) {
      return next(new ErrorHandler("ID danh mục không hợp lệ!", 400));
    }
    if (!Number.isInteger(Number(status)) || ![0, 1].includes(Number(status))) {
      return next(new ErrorHandler("Trạng thái không hợp lệ!", 400));
    }

    validateVariants(BienThe);

    const product = await updateProductInfoService(
      productID,
      Number(categoryID),
      productName,
      thumbnail,
      brand,
      description,
      Number(status),
      BienThe,
    );

    return res.status(200).json({
      success: true,
      message: "Sửa thông tin sản phẩm thành công!",
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

    if (!variantID || !Number.isInteger(Number(variantID))) {
      return next(new ErrorHandler("Mã biến thể không hợp lệ!", 400));
    }
    if (!imageID || !Array.isArray(imageID) || imageID.length === 0) {
      return next(new ErrorHandler("Mã hình ảnh không hợp lệ hoặc rỗng!", 400));
    }

    for (const item of imageID) {
      if (!Number.isInteger(Number(item))) {
        return next(
          new ErrorHandler("Mã hình ảnh trong mảng không hợp lệ!", 400),
        );
      }
    }

    await deleteVariantImageService(imageID, Number(variantID));

    return res.status(200).json({
      success: true,
      message: "Xóa hình ảnh của biến thể thành công!",
    });
  } catch (err) {
    next(err);
  }
};

export const updateProductStatusController = async (req, res, next) => {
  try {
    const productID = Number(req.params.id);
    const { status } = req.body;

    if (!Number.isInteger(productID) || productID <= 0) {
      return next(new ErrorHandler("ID sản phẩm không hợp lệ!", 400));
    }
    if (!Number.isInteger(Number(status)) || ![0, 1].includes(Number(status))) {
      return next(
        new ErrorHandler("Trạng thái không hợp lệ (chỉ nhận 0 hoặc 1)!", 400),
      );
    }

    await updateProductStatusService(productID, Number(status));

    return res.status(200).json({
      success: true,
      message: "Cập nhật trạng thái sản phẩm thành công!",
    });
  } catch (err) {
    next(err);
  }
};

export const updateVariantStatusController = async (req, res, next) => {
  try {
    const variantID = Number(req.params.id);
    const { status } = req.body;

    if (!Number.isInteger(variantID) || variantID <= 0) {
      return next(new ErrorHandler("ID biến thể không hợp lệ!", 400));
    }
    if (!Number.isInteger(Number(status)) || ![0, 1].includes(Number(status))) {
      return next(
        new ErrorHandler("Trạng thái không hợp lệ (chỉ nhận 0 hoặc 1)!", 400),
      );
    }

    await updateVariantStatusService(variantID, Number(status));

    return res.status(200).json({
      success: true,
      message: "Cập nhật trạng thái biến thể thành công!",
    });
  } catch (err) {
    next(err);
  }
};
