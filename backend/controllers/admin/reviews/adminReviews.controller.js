import {
  adminGetAllReviewsService,
  exportCustomerFeedbackXlsxService,
} from "../../../services/rating.services.js";

export const adminGetAllReviews = async (req, res, next) => {
  try {
    const result = await adminGetAllReviewsService(req.query);

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách đánh giá thành công!",
      result,
    });
  } catch (error) {
    next(error);
  }
};

export const exportCustomerFeedbackXlsx = async (req, res, next) => {
  try {
    const buffer = await exportCustomerFeedbackXlsxService(req.query);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=bao-cao-phan-hoi-khach-hang.xlsx",
    );

    return res.send(buffer);
  } catch (error) {
    next(error);
  }
};
