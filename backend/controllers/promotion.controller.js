import { getAllPromotionsService } from "../services/promotion.services.js";

export const getAllPromotionsController = async (req, res, next) => {
  try {
    const vouchers = await getAllPromotionsService();
    res.status(200).json({
      success: true,
      message: "Lấy danh sách khuyến mãi hành công!",
      vouchers,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export const adminGetAllPromotions = async (req, res, next) => {
  try {
    const promos = await PromotionModel.findAll({
      order: [['NgayKetThuc', 'DESC']],
    });
    res.json({ success: true, result: promos });
  } catch (err) { next(err); }
};

export const adminCreatePromotion = async (req, res, next) => {
  try {
    const promo = await PromotionModel.create(req.body);
    res.status(201).json({ success: true, message: 'Tạo thành công!', result: promo });
  } catch (err) { next(err); }
};

export const adminUpdatePromotion = async (req, res, next) => {
  try {
    const { id } = req.params;
    await PromotionModel.update(req.body, { where: { MaKhuyenMai: id } });
    res.json({ success: true, message: 'Cập nhật thành công!' });
  } catch (err) { next(err); }
};

export const adminDeletePromotion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const inUse = await OrderPromotionModel.findOne({ where: { MaKhuyenMai: id } });
    if (inUse) {
      return res.status(400).json({ success: false, message: 'Không thể xoá, mã đã được dùng trong đơn hàng!' });
    }
    await PromotionModel.destroy({ where: { MaKhuyenMai: id } });
    res.json({ success: true, message: 'Xoá thành công!' });
  } catch (err) { next(err); }
};

export const adminToggleStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { TrangThai } = req.body;
    await PromotionModel.update({ TrangThai }, { where: { MaKhuyenMai: id } });
    res.json({ success: true, message: 'Cập nhật trạng thái thành công!' });
  } catch (err) { next(err); }
};