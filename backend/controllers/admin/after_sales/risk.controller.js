import { getAllRiskService } from "../../../services/risk.service.js";
import ErrorHandler from "../../../utils/error_handler.js";

export const getAllRisks = async (req, res, next) => {
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

    const results = await getAllRiskService(
      Number(page),
      Number(limit),
      search,
      parsedStatus,
      order,
    );

    res.status(200).json({
      success: true,
      message: "Lấy thông tin danh sách rủi ro thành công!",
      result: results,
    });
  } catch (err) {
    console.error("Lỗi server:", err);
    next(err);
  }
};

// export const getWarrantyById = async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const idNum = Number(id);
//     if (!id || !Number.isInteger(idNum)) {
//       throw new ErrorHandler("Giá trị nhập vào không hợp lệ!", 422);
//     }
//     const results = await getWarrantyByIdService(Number(id));

//     res.status(200).json({
//       success: true,
//       message: "Lấy thông tin danh sách bảo hành thành công!",
//       result: results,
//     });
//   } catch (err) {
//     next(err);
//   }
// };
