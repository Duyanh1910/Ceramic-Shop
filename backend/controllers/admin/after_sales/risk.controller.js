import {
  createRiskService,
  getAllRiskService,
  getRiskByIdService,
  updateRiskService,
  updateRiskStatusService,
} from "../../../services/risk.service.js";
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
    throw new ErrorHandler("Nhân viên phụ trách không hợp lệ!", 422);
  }

  return numberValue;
};

export const getAllRisks = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      order = "DESC",
      status,
      level,
      source,
    } = req.query;

    const parsedStatus =
      status !== undefined && status !== "" ? Number(status) : undefined;

    const results = await getAllRiskService(
      Number(page),
      Number(limit),
      search,
      parsedStatus,
      order,
      level || null,
      source || null,
    );

    res.status(200).json({
      success: true,
      message: "Lấy danh sách rủi ro thành công!",
      result: results,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export const getRiskById = async (req, res, next) => {
  try {
    const MaRuiRo = parseIdParam(req.params.id);
    const result = await getRiskByIdService(MaRuiRo);

    res.status(200).json({
      success: true,
      message: "Lấy chi tiết rủi ro thành công!",
      result,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export const createRisk = async (req, res, next) => {
  try {
    const result = await createRiskService(req.body);

    res.status(201).json({
      success: true,
      message: "Tạo rủi ro thành công!",
      result,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export const updateRisk = async (req, res, next) => {
  try {
    const MaRuiRo = parseIdParam(req.params.id);
    const result = await updateRiskService(MaRuiRo, req.body);

    res.status(200).json({
      success: true,
      message: "Cập nhật rủi ro thành công!",
      result,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export const updateRiskStatus = async (req, res, next) => {
  try {
    const MaRuiRo = parseIdParam(req.params.id);
    const { TrangThai, GhiChu, MaNhanVienPhuTrach } = req.body;

    if (TrangThai === undefined || TrangThai === null || TrangThai === "") {
      throw new ErrorHandler("Vui lòng truyền trạng thái rủi ro!", 422);
    }

    const result = await updateRiskStatusService(
      MaRuiRo,
      Number(TrangThai),
      GhiChu,
      normalizeNullableStaffId(MaNhanVienPhuTrach),
    );

    res.status(200).json({
      success: true,
      message: "Cập nhật trạng thái rủi ro thành công!",
      result,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};