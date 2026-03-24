import {
  CartModel,
  CartInfoModel,
  CustomerModel,
  VariantModel,
  ProductModel,
  VariantImageModel,
} from "../models/index.js";
import ErrorHandler from "../utils/error_handler.js";

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
              attributes: ["MaSanPham", "TenBienThe", "Gia", "SoLuong"],
              include: [
                {
                  model: ProductModel,
                  attributes: ["TenSanPham", "Thumbnail"],
                },
                {
                  model: VariantImageModel,
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
    if (!variant) {
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
    if (!variant) {
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
