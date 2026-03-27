import {
  sequelize,
  CustomerModel,
  CartModel,
  CartInfoModel,
  VariantModel,
  OrderModel,
  OrderDetailModel,
  InventoryHistoryModel,
  ShippingModel,
  PromotionModel,
  OrderShippingModel,
  OrderPromotionModel,
  ProductModel,
} from "../models/index.js";
import ErrorHandler from "../utils/error_handler.js";
import { Op } from "sequelize";
import { MienBac, MienTrung, MienNam, NoiThanhHP } from "../utils/VN_province";

export const checkOutService = async (idAccount, orderData, selectedItems) => {
  if (
    !selectedItems ||
    !Array.isArray(selectedItems) ||
    selectedItems.length === 0
  ) {
    throw new ErrorHandler("Vui lòng chọn ít nhất 1 sản phẩm!", 400);
  }
  const transaction = await sequelize.transaction();
  try {
    const {
      TenNguoiNhan,
      SDT,
      DiaChiGiaoHang,
      MaPhuongThuc,
      MaPhi,
      ListMaKhuyenMai,
      GhiChu,
    } = orderData;
    const customer = await CustomerModel.findOne({
      where: {
        MaTaiKhoan: idAccount,
      },
    });
    if (!customer) {
      throw new ErrorHandler("Không tìm thấy khách hàng này!", 404);
    }
    const cart = await CartModel.findOne({
      where: {
        MaKhachHang: customer.MaKhachHang,
      },
      include: [
        {
          model: CartInfoModel,
          where: {
            MaBienThe: {
              [Op.in]: selectedItems,
            },
          },
          include: [
            {
              model: VariantModel,
              include: [
                {
                  model: ProductModel,
                  attributes: ["MaDanhMuc"],
                },
              ],
            },
          ],
        },
      ],
    });
    const cartItems = cart?.ChiTietGioHangs;
    if (!cartItems || cartItems.length !== selectedItems.length) {
      throw new ErrorHandler("Sản phẩm không hợp lệ hoặc đã bị xóa!", 400);
    }
    let totalShippingPrice = 0;
    const shippingDetails = [];
  } catch (err) {
    await transaction.rollback();
    console.error(err);
    if (err.statusCode) throw err;
    throw new ErrorHandler("Lỗi server! Không thể thêm mới đơn hàng!", 500);
  }
};
