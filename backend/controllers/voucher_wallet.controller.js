import {
  getMyVouchersService,
  saveVouchersService,
} from "../services/voucher_wallet.service.js";

export const getMyVouchersController = async (req, res, next) => {
  try {
    const id = req.user.id;
    const vouchers = await getMyVouchersService(id);
    res.status(200).json({
      success: true,
      message: "Lấy danh sách khuyến mãi từ ví khuyến mãi thành công!",
      vouchers,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export const saveVouchersController = async (req, res, next) => {
  try {
    const id = req.user.id;
    const idPromotion = Number(req.body.idPromotion);
    const vouchers = await saveVouchersService(id, idPromotion);
    res.status(200).json({
      success: true,
      message: "Thêm khuyến mãi vào ví khuyến mãi thành công!",
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};
