import {
  confirmReturnRefundAdminService,
  getAllReturnsAdminService,
  getReturnByIdAdminService,
  getReturnVariantOptionsAdminService,
  processReturnAdminService,
  updateReturnStatusAdminService,
} from "../../../services/return.service.js";
import ErrorHandler from "../../../utils/error_handler.js";

const parseIdParam = (id, message = "Giá trị nhập vào không hợp lệ!") => {
  const idNum = Number(id);

  if (!id || !Number.isInteger(idNum) || idNum <= 0) {
    throw new ErrorHandler(message, 422);
  }

  return idNum;
};

const normalizeNullableStaffId = (value) => {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const numberValue = Number(value);

  if (!Number.isInteger(numberValue) || numberValue <= 0) {
    throw new ErrorHandler("Nhân viên xử lý không hợp lệ!", 422);
  }

  return numberValue;
};

export const getAllReturns = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      order = "DESC",
      status,
      type,
    } = req.query;

    const parsedStatus =
      status !== undefined && status !== "" ? Number(status) : undefined;

    const results = await getAllReturnsAdminService(
      Number(page),
      Number(limit),
      search,
      order,
      parsedStatus,
      type || null,
    );

    res.status(200).json({
      success: true,
      message: "Lấy danh sách đổi trả thành công!",
      result: results,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export const getReturnVariantOptions = async (req, res, next) => {
  try {
    const { search = "" } = req.query;
    const result = await getReturnVariantOptionsAdminService(search);

    res.status(200).json({
      success: true,
      message: "Lấy danh sách biến thể thành công!",
      result,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export const getReturnById = async (req, res, next) => {
  try {
    const MaDoiTra = parseIdParam(req.params.id);
    const result = await getReturnByIdAdminService(MaDoiTra);

    res.status(200).json({
      success: true,
      message: "Lấy chi tiết đổi trả thành công!",
      result,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export const updateReturnStatus = async (req, res, next) => {
  try {
    const MaDoiTra = parseIdParam(req.params.id);
    const { TrangThai, GhiChu, NoiDungXuLy, MaNhanVienXuLy } = req.body;

    if (TrangThai === undefined || TrangThai === null || TrangThai === "") {
      throw new ErrorHandler("Vui lòng truyền trạng thái đổi trả!", 422);
    }

    const result = await updateReturnStatusAdminService(
      MaDoiTra,
      Number(TrangThai),
      NoiDungXuLy || GhiChu || null,
      normalizeNullableStaffId(MaNhanVienXuLy),
    );

    res.status(200).json({
      success: true,
      message: "Cập nhật trạng thái đổi trả thành công!",
      result,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export const processReturn = async (req, res, next) => {
  try {
    const MaDoiTra = parseIdParam(req.params.id);
    const result = await processReturnAdminService(MaDoiTra, req.body);

    res.status(200).json({
      success: true,
      message: "Xử lý yêu cầu đổi trả thành công!",
      result,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export const confirmReturnRefund = async (req, res, next) => {
  try {
    const MaDoiTra = parseIdParam(req.params.id);
    const { GhiChu, NoiDungXuLy, MaNhanVienXuLy } = req.body;

    const result = await confirmReturnRefundAdminService(
      MaDoiTra,
      NoiDungXuLy || GhiChu || null,
      normalizeNullableStaffId(MaNhanVienXuLy),
    );

    res.status(200).json({
      success: true,
      message: "Xác nhận hoàn tiền thành công!",
      result,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};