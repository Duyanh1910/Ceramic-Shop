import {
  getAllSuppliers,
  getSupllierInfo,
  createSupplierService,
  updateSupplierService,
} from "../../../services/supply/supply.service.js";
import ErrorHandler from "../../../utils/error_handler.js";
import { isStringEmpty, isValidPhoneNumber } from "../../../utils/helpers.js";

export const getSuppliers = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      sort = "MaNhaCC",
      order = "DESC",
    } = req.query;
    const suppliers = await getAllSuppliers(
      Number(page),
      Number(limit),
      search,
      sort,
      order,
    );
    res.status(200).json({
      success: true,
      message: "Lấy thông tin danh sách nhà cung cấp thành công!",
      result: suppliers,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export const getSupplierInfo = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return next(new ErrorHandler("ID không hợp lệ!", 400));
    }
    const supplier = await getSupllierInfo(id);
    if (!supplier) {
      return next(new ErrorHandler("ID không tồn tại!", 404));
    }
    res.status(200).json({
      success: true,
      message: "Lấy thông tin nhà cung cấp thành công!",
      result: supplier,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export const createSupplier = async (req, res, next) => {
  try {
    const { TenNhaCC, Diachi, SDT } = req.body;
    if (
      isStringEmpty(TenNhaCC) ||
      (!isStringEmpty(TenNhaCC) && String(TenNhaCC).length > 255)
    ) {
      return next(new ErrorHandler("Tên nhà cung cấp không hợp lệ!", 422));
    }
    if (!isStringEmpty(Diachi) && String(TenNhaCC).length > 255) {
      return next(new ErrorHandler("Địa chỉ không hợp lệ!", 422));
    }
    if (!isStringEmpty(SDT) && !isValidPhoneNumber(SDT)) {
      return next(new ErrorHandler("SDT không hợp lệ!", 422));
    }
    const supplier = await createSupplierService(TenNhaCC, Diachi, SDT);
    return res.status(201).json({
      success: true,
      message: "Thêm mới nhà cung cấp thành công!",
      result: supplier,
    });
  } catch (err) {
    next(err);
  }
};

export const updateSupplier = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || Number(id) < 0) {
      return next(new ErrorHandler("ID không hợp lệ!", 400));
    }
    const { TenNhaCC, Diachi, SDT } = req.body;
    if (
      isStringEmpty(TenNhaCC) ||
      (!isStringEmpty(TenNhaCC) && String(TenNhaCC).length > 255)
    ) {
      return next(new ErrorHandler("Tên nhà cung cấp không hợp lệ!", 422));
    }
    if (!isStringEmpty(Diachi) && String(TenNhaCC).length > 255) {
      return next(new ErrorHandler("Địa chỉ không hợp lệ!", 422));
    }
    if (!isStringEmpty(SDT) && !isValidPhoneNumber(SDT)) {
      return next(new ErrorHandler("SDT không hợp lệ!", 422));
    }
    const supplier = await updateSupplierService(id, TenNhaCC, Diachi, SDT);
    return res.status(200).json({
      success: true,
      message: "Sửa thông tin nhà cung cấp thành công!",
      result: supplier,
    });
  } catch (err) {
    next(err);
  }
};
