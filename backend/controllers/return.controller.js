import {
  cancelReturnRequestService,
  createReturnRequestService,
  getMyReturnByIdService,
  getMyReturnsService,
} from "../services/return.service.js";
import ErrorHandler from "../utils/error_handler.js";

const parseIdParam = (id, message = "Giá trị nhập vào không hợp lệ!") => {
  const idNum = Number(id);

  if (!id || !Number.isInteger(idNum) || idNum <= 0) {
    throw new ErrorHandler(message, 422);
  }

  return idNum;
};

export const getMyReturns = async (req, res, next) => {
  try {
    const idAccount = req.user.id;
    const returns = await getMyReturnsService(idAccount);

    res.status(200).json({
      success: true,
      message: "Lấy danh sách yêu cầu đổi trả thành công!",
      result: returns,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export const getMyReturnById = async (req, res, next) => {
  try {
    const idAccount = req.user.id;
    const MaDoiTra = parseIdParam(req.params.id);
    const result = await getMyReturnByIdService(idAccount, MaDoiTra);

    res.status(200).json({
      success: true,
      message: "Lấy chi tiết yêu cầu đổi trả thành công!",
      result,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export const createReturnRequest = async (req, res, next) => {
  try {
    const idAccount = req.user.id;
    const result = await createReturnRequestService(idAccount, req.body);

    res.status(201).json({
      success: true,
      message: "Tạo yêu cầu đổi trả thành công!",
      result,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export const cancelReturnRequest = async (req, res, next) => {
  try {
    const idAccount = req.user.id;
    const MaDoiTra = parseIdParam(req.params.id);
    const result = await cancelReturnRequestService(
      idAccount,
      MaDoiTra,
      req.body?.LyDo || req.body?.reason || null,
    );

    res.status(200).json({
      success: true,
      message: "Hủy yêu cầu đổi trả thành công!",
      result,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};