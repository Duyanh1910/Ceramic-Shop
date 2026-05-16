import {
  createPromotionService,
  getAllPromotionsAdminService,
  getPromotionByIDAdminService,
  updatePromotionService,
  updatePromotionStatusService,
} from "../../../services/promotion.services.js";

const normalizePromotionCode = (MaCode) => {
  const code = String(MaCode || "").trim();

  return code ? code.toUpperCase() : null;
};

export const getAllPromotionsAdminController = async (req, res, next) => {
  try {
    const promotions = await getAllPromotionsAdminService();

    res.status(200).json({
      success: true,
      message: "Lấy danh sách khuyến mãi thành công!",
      result: promotions,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export const getPromotionByIDAdminController = async (req, res, next) => {
  try {
    const MaKhuyenMai = Number(req.params.id);

    const promotion = await getPromotionByIDAdminService(MaKhuyenMai);

    res.status(200).json({
      success: true,
      message: "Lấy thông tin khuyến mãi thành công!",
      result: promotion,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export const createPromotionController = async (req, res, next) => {
  try {
    const {
      MaLoaiKM,
      TenKhuyenMai,
      GiaTri,
      GiaTriToiThieu,
      GiamToiDa,
      NgayBatDau,
      NgayKetThuc,
      TrangThai,
      MaCode,
      SoLuong,
      LoaiVoucher,
      MaDanhMuc,
    } = req.body;

    const promotion = await createPromotionService(
      Number(MaLoaiKM),
      TenKhuyenMai,
      Number(GiaTri),
      GiaTriToiThieu === null || GiaTriToiThieu === "" ? null : Number(GiaTriToiThieu),
      GiamToiDa === null || GiamToiDa === "" ? null : Number(GiamToiDa),
      NgayBatDau,
      NgayKetThuc,
      Number(TrangThai),
      normalizePromotionCode(MaCode),
      Number(SoLuong),
      Number(LoaiVoucher),
      MaDanhMuc || null,
    );

    res.status(201).json({
      success: true,
      message: "Tạo khuyến mãi thành công!",
      result: promotion,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export const updatePromotionController = async (req, res, next) => {
  try {
    const MaKhuyenMai = Number(req.params.id);

    const {
      MaLoaiKM,
      TenKhuyenMai,
      GiaTri,
      GiaTriToiThieu,
      GiamToiDa,
      NgayBatDau,
      NgayKetThuc,
      TrangThai,
      MaCode,
      SoLuong,
      LoaiVoucher,
      MaDanhMuc,
    } = req.body;

    const promotion = await updatePromotionService(
      MaKhuyenMai,
      Number(MaLoaiKM),
      TenKhuyenMai,
      Number(GiaTri),
      GiaTriToiThieu === null || GiaTriToiThieu === "" ? null : Number(GiaTriToiThieu),
      GiamToiDa === null || GiamToiDa === "" ? null : Number(GiamToiDa),
      NgayBatDau,
      NgayKetThuc,
      Number(TrangThai),
      normalizePromotionCode(MaCode),
      Number(SoLuong),
      Number(LoaiVoucher),
      MaDanhMuc || null,
    );

    res.status(200).json({
      success: true,
      message: "Cập nhật khuyến mãi thành công!",
      result: promotion,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export const updatePromotionStatusController = async (req, res, next) => {
  try {
    const MaKhuyenMai = Number(req.params.id);
    const TrangThai = Number(req.body.TrangThai);

    const promotion = await updatePromotionStatusService(
      MaKhuyenMai,
      TrangThai,
    );

    res.status(200).json({
      success: true,
      message: "Cập nhật trạng thái khuyến mãi thành công!",
      result: promotion,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};