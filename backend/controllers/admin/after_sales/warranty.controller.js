import {
  createWarrantyHistoryService,
  getAllWarrantyService,
  getWarrantyByIdService,
  replaceWarrantyProductService,
  updateWarrantyStatusService,
} from "../../../services/warranty.service.js";
import ErrorHandler from "../../../utils/error_handler.js";

const parseIdParam = (id, message = "Giá trị nhập vào không hợp lệ!") => {
  const idNum = Number(id);

  if (!id || !Number.isInteger(idNum) || idNum <= 0) {
    throw new ErrorHandler(message, 422);
  }

  return idNum;
};

export const getAllWarranties = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      order = "DESC",
      status,
    } = req.query;

    const parsedStatus =
      status !== undefined && status !== "" ? Number(status) : undefined;

    const results = await getAllWarrantyService(
      Number(page),
      Number(limit),
      search,
      order,
      parsedStatus,
    );

    res.status(200).json({
      success: true,
      message: "Lấy danh sách bảo hành thành công!",
      result: results,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export const getWarrantyById = async (req, res, next) => {
  try {
    const MaBaoHanh = parseIdParam(req.params.id);

    const results = await getWarrantyByIdService(MaBaoHanh);

    res.status(200).json({
      success: true,
      message: "Lấy thông tin bảo hành thành công!",
      result: results,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export const createWarrantyHistory = async (req, res, next) => {
  try {
    const MaBaoHanh = parseIdParam(req.params.id);

    const {
      HanhDong,
      NoiDungXuLy,
      TrangThai,
      AnhMinhChung,
      MaNhanVienXuLy,
    } = req.body;

    const history = await createWarrantyHistoryService(
      MaBaoHanh,
      HanhDong || null,
      NoiDungXuLy || null,
      TrangThai === undefined || TrangThai === "" ? null : Number(TrangThai),
      AnhMinhChung || null,
      MaNhanVienXuLy || null,
    );

    res.status(201).json({
      success: true,
      message: "Thêm lịch sử bảo hành thành công!",
      result: history,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export const updateWarrantyStatus = async (req, res, next) => {
  try {
    const MaBaoHanh = parseIdParam(req.params.id);

    const {
      TrangThai,
      NoiDungXuLy,
      HanhDong,
      AnhMinhChung,
      MaNhanVienXuLy,
    } = req.body;

    if (TrangThai === undefined || TrangThai === "") {
      throw new ErrorHandler("Vui lòng truyền trạng thái bảo hành!", 422);
    }

    const warranty = await updateWarrantyStatusService(
      MaBaoHanh,
      Number(TrangThai),
      NoiDungXuLy || null,
      HanhDong || null,
      AnhMinhChung || null,
      MaNhanVienXuLy || null,
    );

    res.status(200).json({
      success: true,
      message: "Cập nhật trạng thái bảo hành thành công!",
      result: warranty,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export const replaceWarrantyProduct = async (req, res, next) => {
  try {
    const MaBaoHanh = parseIdParam(req.params.id);

    const {
      MaBienTheThayThe,
      SoLuongThayThe,
      NoiDungXuLy,
      MaNhanVienXuLy,
    } = req.body;

    if (!MaBienTheThayThe) {
      throw new ErrorHandler("Vui lòng chọn sản phẩm thay thế!", 422);
    }

    const warranty = await replaceWarrantyProductService(
      MaBaoHanh,
      Number(MaBienTheThayThe),
      Number(SoLuongThayThe || 1),
      NoiDungXuLy || null,
      MaNhanVienXuLy || null,
    );

    res.status(200).json({
      success: true,
      message: "Đổi mới sản phẩm bảo hành thành công!",
      result: warranty,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};