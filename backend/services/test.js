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
import { MienBac, MienTrung, MienNam, NoiThanhHP } from "../utils/VN_province.js";

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
    let totalPrice = 0;
    const orderDetails = [];
    const inventoryLogs = [];
    const bulkyitem = [14, 15, 16, 17];
    const shippingInfo = new Set();
    for (const item of cartItems) {
      const variant = item.BienTheSanPham;
      if (!variant || variant.TrangThai === 0) {
        throw new ErrorHandler(
          `Sản phẩm ${variant.TenBienThe || "đã chọn"} ngừng kinh doanh!`,
          400,
        );
      }
      if (item.SoLuong > variant.SoLuong) {
        throw new ErrorHandler(
          `Sản phẩm ${variant.TenBienThe} không đủ số lượng trong kho!`,
          400,
        );
      }
      if (bulkyitem.includes(variant.SanPham.MaDanhMuc)) {
        shippingInfo.add(8);
      }
      const price = Number(variant.Gia);
      const total = price * item.SoLuong;
      totalPrice += total;

      orderDetails.push({
        MaBienThe: item.MaBienThe,
        SoLuong: item.SoLuong,
        GiaBan: price,
        ThanhTien: total,
      });

      const new_quantity = variant.SoLuong - item.SoLuong;
      await VariantModel.update(
        {
          SoLuong: new_quantity,
        },
        {
          where: {
            MaBienThe: variant.MaBienThe,
          },
          transaction: transaction,
        },
      );
      inventoryLogs.push({
        MaBienThe: variant.MaBienThe,
        LoaiGiaoDich: "Xuất Bán",
        SoLuongThayDoi: -item.SoLuong,
        TonKhoHienTai: new_quantity,
        LoaiThamChieu: "Đơn Hàng",
      });
    }

    if (MaPhi === 10) {
      shippingInfo.clear();
      shippingInfo.add(10);
    } else {
      if (DiaChiGiaoHang.QuocGia === "Việt Nam") {
        if (DiaChiGiaoHang.TinhThanh === "Hải Phòng") {
          if (NoiThanhHP.includes(DiaChiGiaoHang.PhuongXa)) {
            shippingInfo.add(1);
          } else {
            shippingInfo.add(2);
          }
        } else {
          if (MienBac.includes(DiaChiGiaoHang.TinhThanh)) {
            shippingInfo.add(3);
          } else if (MienTrung.includes(DiaChiGiaoHang.TinhThanh)) {
            shippingInfo.add(4);
          } else {
            shippingInfo.add(5);
          }
        }
        if (MaPhi === 6 || MaPhi === 7) {
          shippingInfo.add(MaPhi);
        }
      } else {
        shippingInfo.add(9);
      }
    }
    let totalShippingPrice = 0;
    const shippingDetails = [];
    const shippingRecords = await ShippingModel.findAll({
      where: {
        MaPhi: {
          [Op.in]: [...shippingInfo],
        },
      },
    });
    for (const idFee of shippingRecords) {
      const fee = Number(shipping.GiaTri);
      totalShippingPrice += fee;
      shippingDetails.push({
        MaPhi: idFee,
        SoTienPhi: fee,
      });
    }

    let totalProductDiscount = 0;
    let totalShippingDiscount = 0;
    if (
      ListMaKhuyenMai &&
      Array.isArray(ListMaKhuyenMai) &&
      ListMaKhuyenMai.length > 0
    ) {
      const promotions = await PromotionModel.findAll({
        where: {
          MaKhuyenMai: {
            [Op.in]: ListMaKhuyenMai,
            TrangThai: 1,
          },
        },
      });
      if (promotions.length !== ListMaKhuyenMai.length) {
        throw new ErrorHandler("Một hoặc nhiều mã giảm giá không hợp lệ!", 400);
      }
      let hasProductDiscount = false;
      let hasShippingDiscount = false;
      const currentDate = new Date();
      for (const promo of promotions) {
        if (currentDate < new Date(promo.NgayBatDau)) {
          throw new ErrorHandler(
            `Mã ${promo.TenKhuyenMai} chưa đến hạn sử dụng!`,
            400,
          );
        } else if (currentDate > new Date(promo.NgayKetThuc)) {
          throw new ErrorHandler(
            `Mã ${promo.TenKhuyenMai} đã quá hạn sử dụng!`,
            400,
          );
        } else {
          if (
            promo.GiaTriToiThieu &&
            totalPrice < Number(promo.GiaTriToiThieu)
          ) {
            throw new ErrorHandler(
              `Đơn hàng không đủ điều kiện áp dụng mã ${promo.TenKhuyenMai}!`,
              400,
            );
          }
        }
      }
    }
  } catch (err) {
    await transaction.rollback();
    console.error(err);
    if (err.statusCode) throw err;
    throw new ErrorHandler("Lỗi server! Không thể thêm mới đơn hàng!", 500);
  }
};
