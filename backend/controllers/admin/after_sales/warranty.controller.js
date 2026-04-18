import { getAllWarrantyService } from "../../../services/warranty.service.js";
import ErrorHandler from "../../../utils/error_handler.js";

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
      message: "Lấy thông tin danh sách bảo hành thành công!",
      result: results,
    });
  } catch (err) {
    console.error("Error in getAllWarranties controller:", err);
    next(err);
  }
};
