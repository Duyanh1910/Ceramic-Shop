import { getAllPromotionsService } from "../services/promotion.services.js";

export const getAllPromotionsController = async (req, res, next) => {
  try {
    const vouchers = await getAllPromotionsService();
    res.status(200).json({
      success: true,
      message: "Lấy danh sách khuyến mãi thành công!",
      vouchers,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};
