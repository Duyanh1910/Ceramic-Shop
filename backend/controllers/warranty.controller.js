import {
  getMyWarrantiesService,
  getMyWarrantyByIdService,
  requestWarrantyService,
} from "../services/warranty.service.js";
import ErrorHandler from "../utils/error_handler.js";

const parseIdParam = (id, message = "Giá trị nhập vào không hợp lệ!") => {
  const idNum = Number(id);

  if (!id || !Number.isInteger(idNum) || idNum <= 0) {
    throw new ErrorHandler(message, 422);
  }

  return idNum;
};

export const getMyWarranties = async (req, res, next) => {
  try {
    const idAccount = req.user.id;

    const warranties = await getMyWarrantiesService(idAccount);

    res.status(200).json({
      success: true,
      message: "Lấy danh sách bảo hành của tôi thành công!",
      result: warranties,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export const getMyWarrantyById = async (req, res, next) => {
  try {
    const idAccount = req.user.id;
    const MaBaoHanh = parseIdParam(req.params.id);

    const warranty = await getMyWarrantyByIdService(idAccount, MaBaoHanh);

    res.status(200).json({
      success: true,
      message: "Lấy chi tiết bảo hành thành công!",
      result: warranty,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export const requestWarranty = async (req, res, next) => {
  try {
    const idAccount = req.user.id;
    const MaBaoHanh = parseIdParam(req.params.id);
    const { NoiDungXuLy, AnhMinhChung } = req.body;

    const warranty = await requestWarrantyService(
      idAccount,
      MaBaoHanh,
      NoiDungXuLy,
      AnhMinhChung,
    );

    res.status(200).json({
      success: true,
      message: "Gửi yêu cầu bảo hành thành công!",
      result: warranty,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

