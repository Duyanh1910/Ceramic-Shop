import {
  CartModel,
  CartInfoModel,
  CustomerModel,
  VariantModel,
  ProductModel,
  VariantImageModel,
} from "../models/index.js";
import ErrorHandler from "../utils/error_handler.js";
import calculateOrderDiscount from "../utils/orders/calculate_order_discount.js";
import calculateProduct from "../utils/orders/calculate_product_fee.js";
import calculateShippingFee from "../utils/orders/calculate_shipping_fee.js";

export const getCartService = async (id) => {
  try {
    const customer = await CustomerModel.findOne({
      where: {
        MaTaiKhoan: id,
      },
    });
    if (!customer) {
      throw new ErrorHandler("Không tìm thấy khách hàng này!", 404);
    }
    const cartInfo = await CartModel.findOne({
      where: {
        MaKhachHang: customer.MaKhachHang,
      },
      include: [
        {
          model: CartInfoModel,
          attributes: ["MaChiTietGH", "MaBienThe", "SoLuong"],
          include: [
            {
              model: VariantModel,
              as: "BienTheSanPham",
              attributes: ["MaSanPham", "TenBienThe", "Gia", "SoLuong"],
              include: [
                {
                  model: ProductModel,
                  as: "SanPham",
                  attributes: ["TenSanPham", "Thumbnail", "MaDanhMuc"],
                },
                {
                  model: VariantImageModel,
                  as: "HinhAnhBienThes",
                  attributes: ["DuongDan"],
                },
              ],
            },
          ],
        },
      ],
    });
    const items = cartInfo?.ChiTietGioHangs || [];
    if (!items.length) {
      return {
        items: [],
        totalPrice: 0,
      };
    }
    const totalPrice = cartInfo.ChiTietGioHangs.reduce((acc, item) => {
      const price = Number(item.BienTheSanPham?.Gia) || 0;
      const quantity = Number(item.SoLuong) || 0;
      return acc + quantity * price;
    }, 0);
    return {
      items: cartInfo.ChiTietGioHangs,
      totalPrice: Number(totalPrice),
    };
  } catch (err) {
    if (err.statusCode) throw err;
    console.error(err);
    throw new ErrorHandler("Lỗi server! Không thể xem giỏ hàng!", 500);
  }
};

export const addCartItemsService = async (idAccount, idVariant, quantity) => {
  try {
    const customer = await CustomerModel.findOne({
      where: {
        MaTaiKhoan: idAccount,
      },
    });
    if (!customer) {
      throw new ErrorHandler("Không tìm thấy khách hàng này!", 404);
    }
    const variant = await VariantModel.findByPk(idVariant, {
      attributes: ["MaSanPham", "TenBienThe", "Gia", "SoLuong", "TrangThai"],
      include: [
        {
          model: VariantImageModel,
          attributes: ["DuongDan"],
        },
      ],
    });
    if (!variant || variant.TrangThai === 0) {
      throw new ErrorHandler(
        "Sản phẩm này không tồn tại hoặc đã ngừng kinh doanh!",
        404,
      );
    }
    const [cart] = await CartModel.findOrCreate({
      where: {
        MaKhachHang: customer.MaKhachHang,
      },
    });
    const existItem = await CartInfoModel.findOne({
      where: {
        MaGioHang: cart.MaGioHang,
        MaBienThe: idVariant,
      },
    });
    if (existItem) {
      const totalQuantity = existItem.SoLuong + quantity;
      if (totalQuantity > variant.SoLuong) {
        throw new ErrorHandler("Sản phẩm vượt quá số lượng trong kho!", 400);
      }
      existItem.SoLuong = totalQuantity;
      await existItem.save();
    } else {
      if (quantity > variant.SoLuong) {
        throw new ErrorHandler("Sản phẩm vượt quá số lượng trong kho!", 400);
      }
      await CartInfoModel.create({
        MaGioHang: cart.MaGioHang,
        MaBienThe: idVariant,
        SoLuong: quantity,
      });
    }
    return await getCartService(idAccount);
  } catch (err) {
    if (err.statusCode) throw err;
    console.error(err);
    throw new ErrorHandler(
      "Lỗi server! Không thể thêm sản phẩm vào giỏ hàng!",
      500,
    );
  }
};

export const updateCartItemsService = async (
  idAccount,
  idVariant,
  quantity,
) => {
  try {
    const customer = await CustomerModel.findOne({
      where: {
        MaTaiKhoan: idAccount,
      },
    });
    if (!customer) {
      throw new ErrorHandler("Không tìm thấy khách hàng này!", 404);
    }
    const variant = await VariantModel.findByPk(idVariant, {
      attributes: ["MaSanPham", "TenBienThe", "Gia", "SoLuong", "TrangThai"],
    });
    if (!variant || variant.TrangThai === 0) {
      throw new ErrorHandler(
        "Sản phẩm này không tồn tại hoặc đã ngừng kinh doanh!",
        404,
      );
    }
    const cart = await CartModel.findOne({
      where: {
        MaKhachHang: customer.MaKhachHang,
      },
    });
    if (!cart) {
      return null;
    }
    const existItem = await CartInfoModel.findOne({
      where: {
        MaGioHang: cart.MaGioHang,
        MaBienThe: idVariant,
      },
    });
    if (existItem) {
      if (quantity === 0) {
        await existItem.destroy();
      } else if (quantity > variant.SoLuong) {
        throw new ErrorHandler("Sản phẩm vượt quá số lượng trong kho!", 400);
      } else {
        existItem.SoLuong = quantity;
        await existItem.save();
      }
    } else {
      throw new ErrorHandler(
        "Không tìm thấy sản phẩm này trong giỏ hàng của bạn!",
        404,
      );
    }
    return await getCartService(idAccount);
  } catch (err) {
    if (err.statusCode) throw err;
    console.error(err);
    throw new ErrorHandler(
      "Lỗi server! Không thể sửa số lượng sản phẩm trong giỏ hàng!",
      500,
    );
  }
};

export const deleteCartItemsService = async (idAccount, idVariant) => {
  try {
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
    });
    if (!cart) {
      return null;
    }
    const existItem = await CartInfoModel.findOne({
      where: {
        MaGioHang: cart.MaGioHang,
        MaBienThe: idVariant,
      },
    });
    if (!existItem) {
      throw new ErrorHandler(
        "Không tìm thấy sản phẩm này trong giỏ hàng!",
        404,
      );
    }
    await existItem.destroy();
    return await getCartService(idAccount);
  } catch (err) {
    if (err.statusCode) throw err;
    console.error(err);
    throw new ErrorHandler(
      "Lỗi server! Không thể xóa sản phẩm trong giỏ hàng!",
      500,
    );
  }
};

export const deleteCartService = async (idAccount) => {
  try {
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
    });
    if (!cart) {
      return { items: [], totalPrice: 0 };
    }
    await CartInfoModel.destroy({
      where: {
        MaGioHang: cart.MaGioHang,
      },
    });
    return await getCartService(idAccount);
  } catch (err) {
    if (err.statusCode) throw err;
    console.error(err);
    throw new ErrorHandler(
      "Lỗi server! Không thể xóa sản phẩm trong giỏ hàng!",
      500,
    );
  }
};

export const calculateSummaryService = async (idAccount, payload) => {
  const { selectedVariantIds, MaPhi, addressObj, ListMaKhuyenMai } = payload;

  if (!selectedVariantIds || selectedVariantIds.length === 0) {
    return {
      success: true,
      data: {
        totalProductPrice: 0,
        shippingFee: 0,
        discount: { totalDiscount: 0, orderDiscount: 0, shippingDiscount: 0 },
        finalPayment: 0,
      },
    };
  }

  const customer = await CustomerModel.findOne({
    where: { MaTaiKhoan: idAccount },
  });
  if (!customer) throw new ErrorHandler("Không tìm thấy khách hàng!", 404);

  const productResult = await calculateProduct(
    customer.MaKhachHang,
    selectedVariantIds,
  );
  const trustedItems = productResult.items;
  const totalProductPrice = productResult.total;

  let shippingFee = 0;
  let shippingDetails = null;

  if (MaPhi && (Number(MaPhi) === 3 || addressObj)) {
    const shipResult = await calculateShippingFee(
      trustedItems,
      addressObj,
      MaPhi,
      totalProductPrice,
    );
    shippingFee = shipResult.data.total;
    shippingDetails = shipResult.data.ghnDetails;
  }

  let discountResult = {
    totalDiscount: 0,
    orderDiscount: 0,
    shippingDiscount: 0,
    validPromotions: [],
  };

  if (
    ListMaKhuyenMai &&
    Array.isArray(ListMaKhuyenMai) &&
    ListMaKhuyenMai.length > 0
  ) {
    discountResult = await calculateOrderDiscount(
      ListMaKhuyenMai,
      customer.MaKhachHang,
      totalProductPrice,
      shippingFee,
      trustedItems,
      MaPhi,
    );
  }

  const finalPayment =
    totalProductPrice + shippingFee - discountResult.totalDiscount;

  return {
    success: true,
    data: {
      totalProductPrice,
      shippingInfo: {
        fee: shippingFee,
        details: shippingDetails,
      },
      discountInfo: {
        totalDiscount: discountResult.totalDiscount,
        orderDiscount: discountResult.orderDiscount,
        shippingDiscount: discountResult.shippingDiscount,
        appliedVouchers: discountResult.validPromotions.map((p) => p.MaCode),
      },
      finalPayment: finalPayment > 0 ? finalPayment : 0,

      itemsDetails: trustedItems.map((item) => ({
        MaBienThe: item.MaBienThe,
        soLuong: item.soLuong,
        donGia: item.donGia,
        thanhTien: item.donGia * item.soLuong,
      })),
    },
  };
};
