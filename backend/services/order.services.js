import {
  sequelize,
  CustomerModel,
  CartModel,
  CartInfoModel,
  VariantModel,
  ProductModel,
  OrderModel,
  OrderDetailModel,
  InventoryHistoryModel,
  OrderPromotionModel,
  PromotionModel,
  PromotionWalletModel,
  VariantImageModel,
  ShippingTypeModel,
  PaymentMethodModel,
  PaymentTransactionModel,
} from "../models/index.js";
import ErrorHandler from "../utils/error_handler.js";
import { Op } from "sequelize";

import calculateShippingFee from "../utils/orders/calculate_shipping_fee.js";
import calculateOrderDiscount from "../utils/orders/calculate_order_discount.js";
export const ORDER_STATUS = {
  PENDING: 0,
  PREPARING: 1,
  SHIPPING: 2,
  COMPLETED: 3,
  CANCELED: 4,
};

const generateOrderCode = () => {
  const date = new Date();
  const dateStr = `${date.getFullYear().toString().slice(-2)}${(date.getMonth() + 1).toString().padStart(2, "0")}${date.getDate().toString().padStart(2, "0")}`;
  const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `DH${dateStr}${randomStr}`;
};

export const checkOutService = async (idAccount, orderData, selectedItems) => {
  if (!selectedItems) {
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
      addressObj,
      ListMaKhuyenMai,
      GhiChu,
    } = orderData;

    const customer = await CustomerModel.findOne({
      where: { MaTaiKhoan: idAccount },
    });
    if (!customer)
      throw new ErrorHandler("Không tìm thấy khách hàng này!", 404);

    const cart = await CartModel.findOne({
      where: { MaKhachHang: customer.MaKhachHang },
      include: [
        {
          model: CartInfoModel,
          where: { MaBienThe: { [Op.in]: selectedItems } },
          include: [
            {
              model: VariantModel,
              as: "BienTheSanPham",
              include: [
                {
                  model: ProductModel,
                  as: "SanPham",
                  attributes: ["MaDanhMuc"],
                },
              ],
            },
          ],
        },
      ],
    });

    const cartItems = cart?.CartInfoModels || cart?.ChiTietGioHangs;
    if (!cartItems) {
      throw new ErrorHandler(
        "Sản phẩm không hợp lệ, không đủ số lượng hoặc đã bị xóa khỏi giỏ!",
        400,
      );
    }

    let totalProductPrice = 0;
    const shippingItemsFormat = [];

    for (const item of cartItems) {
      const variant = item.BienTheSanPham;

      if (variant.SoLuong < item.SoLuong) {
        throw new ErrorHandler(
          `Sản phẩm ${variant.TenBienThe} không đủ số lượng trong kho!`,
          400,
        );
      }

      totalProductPrice += Number(variant.Gia) * item.SoLuong;
      shippingItemsFormat.push({
        MaBienThe: variant.MaBienThe,
        soLuong: item.SoLuong,
        KhoiLuong: variant.KhoiLuong,
      });
    }

    let totalShippingFee = 0;
    let shippingDetails = null;

    if (addressObj && MaPhi) {
      const shipResult = await calculateShippingFee(
        shippingItemsFormat,
        addressObj,
        MaPhi,
        totalProductPrice,
      );
      totalShippingFee = shipResult.data.total;
      shippingDetails = shipResult.data.ghnDetails;
    }

    const discountResult = await calculateOrderDiscount(
      ListMaKhuyenMai,
      customer.MaKhachHang,
      totalProductPrice,
      totalShippingFee,
      cartItems,
      MaPhi,
    );
    const totalPayment =
      totalProductPrice + totalShippingFee - discountResult.totalDiscount;

    const newOrder = await OrderModel.create(
      {
        MaKhachHang: customer.MaKhachHang,
        MaHienThi: generateOrderCode(),
        TongTienHang: totalProductPrice,
        TongPhiVanChuyen: totalShippingFee,
        TongGiamGia: discountResult.totalDiscount,
        TongThanhToan: totalPayment > 0 ? totalPayment : 0,
        DiaChiGiaoHang,
        TenNguoiNhan,
        SDT,
        TrangThaiDonHang: ORDER_STATUS.PENDING,
        TrangThaiThanhToan: 0,
        MaPhuongThuc,
        MaLoaiPhi: MaPhi,
        GhiChu,
      },
      { transaction },
    );

    const orderDetails = [];
    const inventoryHistories = [];

    for (const item of cartItems) {
      const variant = item.BienTheSanPham;
      const quantity = item.SoLuong;
      const unitPrice = Number(variant.Gia);

      orderDetails.push({
        MaDonHang: newOrder.MaDonHang,
        MaBienThe: variant.MaBienThe,
        SoLuong: quantity,
        GiaBan: unitPrice,
        ThanhTien: unitPrice * quantity,
      });

      inventoryHistories.push({
        MaBienThe: variant.MaBienThe,
        LoaiGiaoDich: "Xuất Bán",
        SoLuongThayDoi: -quantity,
        TonKhoHienTai: variant.SoLuong - quantity,
        LoaiThamChieu: "Đơn Hàng",
        MaThamChieu: newOrder.MaDonHang,
        GhiChu: `Khách hàng đặt mua đơn ${newOrder.MaHienThi}`,
      });
      await VariantModel.update(
        { SoLuong: variant.SoLuong - quantity },
        { where: { MaBienThe: variant.MaBienThe }, transaction },
      );
    }
    await OrderDetailModel.bulkCreate(orderDetails, { transaction });
    await InventoryHistoryModel.bulkCreate(inventoryHistories, { transaction });

    if (discountResult.validPromotions.length > 0) {
      const orderPromotions = [];

      for (const p of discountResult.validPromotions) {
        let discountApplied =
          p.LoaiVoucher === 1
            ? discountResult.orderDiscount
            : discountResult.shippingDiscount;
        orderPromotions.push({
          MaDonHang: newOrder.MaDonHang,
          MaKhuyenMai: p.MaKhuyenMai,
          SoTienChietKhau: discountApplied,
        });

        await PromotionWalletModel.update(
          { TrangThaiSuDung: 1 },
          {
            where: {
              MaKhachHang: customer.MaKhachHang,
              MaKhuyenMai: p.MaKhuyenMai,
            },
            transaction,
          },
        );

        await PromotionModel.decrement("SoLuong", {
          by: 1,
          where: { MaKhuyenMai: p.MaKhuyenMai },
          transaction,
        });
      }
      await OrderPromotionModel.bulkCreate(orderPromotions, { transaction });
    }

    await CartInfoModel.destroy({
      where: {
        MaGioHang: cart.MaGioHang,
        MaBienThe: { [Op.in]: selectedItems },
      },
      transaction,
    });

    await transaction.commit();

    return {
      success: true,
      message: "Đặt hàng thành công!",
      data: {
        orderID: newOrder.MaDonHang,
        orderCode: newOrder.MaHienThi,
        totalPayment,
      },
    };
  } catch (err) {
    await transaction.rollback();
    console.error("Lỗi CheckOut:", err);
    if (err.statusCode) throw err;
    throw new ErrorHandler(
      err.message || "Lỗi server! Không thể thêm mới đơn hàng!",
      500,
    );
  }
};

export const getMyOrderService = async (idAccount) => {
  const customer = await CustomerModel.findOne({
    where: { MaTaiKhoan: idAccount },
  });
  if (!customer) throw new ErrorHandler("Không tìm thấy khách hàng này!", 404);

  const order = await OrderModel.findAll({
    order: [["NgayDat", "DESC"]],
    where: {
      MaKhachHang: customer.MaKhachHang,
    },
    include: [
      {
        model: OrderDetailModel,
        include: [
          {
            model: VariantModel,
            attributes: ["TenBienThe", "Gia", "MaSanPham"],
            include: [
              {
                model: VariantImageModel,
                attributes: ["DuongDan"],
              },
              {
                model: ProductModel,
                attributes: ["TenSanPham", "Thumbnail", "MaSanPham"],
              },
            ],
          },
        ],
      },
      { model: ShippingTypeModel },
    ],
  });
  return order;
};

export const getMyOrderInfoService = async (idAccount, orderCode) => {
  try {
    const customer = await CustomerModel.findOne({
      where: { MaTaiKhoan: idAccount },
    });

    const order = await OrderModel.findOne({
      where: {
        MaHienThi: orderCode,
        MaKhachHang: customer.MaKhachHang,
      },
      include: [
        {
          model: OrderDetailModel,
          include: [
            { model: VariantModel, include: [{ model: ProductModel }] },
          ],
        },
        {
          model: PromotionModel,
          through: { attributes: ["SoTienChietKhau"] },
        },
        { model: ShippingTypeModel },
        {
          model: PaymentMethodModel,
        },
        {
          model: PaymentTransactionModel,
        },
      ],
    });

    if (!order)
      throw new ErrorHandler(
        "Đơn hàng không tồn tại hoặc bạn không có quyền truy cập!",
        404,
      );

    return order;
  } catch (err) {
    console.error(err);
    if (err.statusCode) throw err;
    throw new ErrorHandler(
      "Lỗi server! Không thể xem thông tin đơn hàng!",
      500,
    );
  }
};

export const cancelOrderService = async (idAccount, orderCode, reason) => {
  const transaction = await sequelize.transaction();
  try {
    const customer = await CustomerModel.findOne({
      where: { MaTaiKhoan: idAccount },
    });
    if (!customer) {
      throw new ErrorHandler("Không tìm thấy khách hàng này!", 404);
    }
    const order = await OrderModel.findOne({
      where: { MaHienThi: orderCode, MaKhachHang: customer.MaKhachHang },
      include: [{ model: OrderDetailModel }, { model: OrderPromotionModel }],
    });
    if (!order) throw new ErrorHandler("Không tìm thấy đơn hàng!", 404);
    if (order.TrangThaiDonHang !== ORDER_STATUS.PENDING) {
      throw new ErrorHandler(
        "Chỉ có thể hủy đơn hàng khi đang ở trạng thái Chờ xác nhận!",
        400,
      );
    }

    order.TrangThaiDonHang = ORDER_STATUS.CANCELED;
    order.GhiChu = order.GhiChu
      ? `${order.GhiChu} | Khách tự hủy: ${reason}`
      : `Khách tự hủy: ${reason}`;
    await order.save({ transaction });
    const inventoryHistories = [];
    for (const detail of order.ChiTietDonHangs) {
      const variant = await VariantModel.findByPk(detail.MaBienThe);

      if (variant) {
        const newQuantity = variant.SoLuong + detail.SoLuong;

        await VariantModel.update(
          { SoLuong: newQuantity },
          { where: { MaBienThe: variant.MaBienThe }, transaction },
        );

        inventoryHistories.push({
          MaBienThe: variant.MaBienThe,
          LoaiGiaoDich: "Hoàn trả hàng / Hủy đơn",
          SoLuongThayDoi: detail.SoLuong,
          TonKhoHienTai: newQuantity,
          LoaiThamChieu: "Đơn Hàng",
          MaThamChieu: order.MaDonHang,
          GhiChu: `Hoàn tồn kho do khách hủy đơn ${order.MaHienThi}`,
        });
      }
    }
    if (inventoryHistories.length > 0) {
      await InventoryHistoryModel.bulkCreate(inventoryHistories, {
        transaction,
      });
    }
    const promos =
      order.OrderPromotionModels || order.ChiTietKhuyenMaiDonHangs || [];
    if (promos.length > 0) {
      for (const promo of promos) {
        await PromotionWalletModel.update(
          { TrangThaiSuDung: 0 },
          {
            where: {
              MaKhachHang: customer.MaKhachHang,
              MaKhuyenMai: promo.MaKhuyenMai,
            },
            transaction,
          },
        );
        await PromotionModel.increment("SoLuong", {
          by: 1,
          where: { MaKhuyenMai: promo.MaKhuyenMai },
          transaction,
        });
      }
    }
    await transaction.commit();
    return true;
  } catch (err) {
    await transaction.rollback();
    console.error(err);
    if (err.statusCode) throw err;
    throw new ErrorHandler("Lỗi server! Không thể hủy đơn hàng!", 500);
  }
};

export const adminGetOrderService = async (
  page = 1,
  limit = 10,
  search = "",
  status = "",
  startDate = "",
  endDate = "",
) => {
  const offset = (page - 1) * limit;
  const whereCondition = {};

  if (status !== "" && status !== undefined && status !== null) {
    const statusInt = parseInt(status);
    if (Object.values(ORDER_STATUS).includes(statusInt)) {
      whereCondition.TrangThaiDonHang = statusInt;
    }
  }
  if (search) {
    whereCondition[Op.or] = [
      { MaHienThi: { [Op.like]: `%${search}%` } },
      { SDT: { [Op.like]: `%${search}%` } },
    ];
  }
  if (startDate || endDate) {
    whereCondition.NgayDat = {};

    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      whereCondition.NgayDat[Op.gte] = start;
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      whereCondition.NgayDat[Op.lte] = end;
    }
  }

  const { count, rows: orders } = await OrderModel.findAndCountAll({
    limit: parseInt(limit),
    offset: parseInt(offset),
    distinct: true,
    order: [["NgayDat", "DESC"]],
    where: whereCondition,
    include: [
      {
        model: OrderDetailModel,
        include: [
          {
            model: VariantModel,
            attributes: ["TenBienThe", "Gia"],
            include: [
              {
                model: VariantImageModel,
                attributes: ["DuongDan"],
              },
              {
                model: ProductModel,
                attributes: ["TenSanPham", "Thumbnail"],
              },
            ],
          },
        ],
      },
      {
        model: CustomerModel,
        attributes: ["MaKhachHang", "TenKhachHang", "SDT"],
      },
      { model: ShippingTypeModel },
    ],
  });

  return {
    totalItems: count,
    totalPages: Math.ceil(count / limit),
    currentPage: parseInt(page),
    orders: orders,
  };
};

export const adminGetOrderDetailService = async (orderCode) => {
  try {
    const order = await OrderModel.findOne({
      where: { MaHienThi: orderCode },
      include: [
        {
          model: OrderDetailModel,
          include: [
            {
              model: VariantModel,
              attributes: ["TenBienThe"],
              include: [
                { model: VariantImageModel },
                {
                  model: ProductModel,
                },
              ],
            },
          ],
        },
        {
          model: CustomerModel,
        },
        {
          model: PaymentMethodModel,
        },
        {
          model: PaymentTransactionModel,
        },
        {
          model: PromotionModel,
          through: { attributes: ["SoTienChietKhau"] },
        },
        { model: ShippingTypeModel },
      ],
    });

    if (!order) throw new ErrorHandler("Đơn hàng không tồn tại!", 404);

    return order;
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết đơn:", error);
    if (error.statusCode) throw error;
    throw new ErrorHandler(
      "Lỗi server! Không thể xem thông tin đơn hàng!",
      500,
    );
  }
};

export const adminUpdateOrderStatusService = async (
  orderCode,
  newStatus,
  note,
) => {
  const transaction = await sequelize.transaction();
  try {
    const order = await OrderModel.findOne({
      where: {
        MaHienThi: orderCode,
      },
      include: [
        {
          model: OrderDetailModel,
        },
        {
          model: OrderPromotionModel,
        },
      ],
    });
    if (!order) {
      throw new ErrorHandler("Không tìm thấy đơn hàng này!", 400);
    }
    const currentStatus = order.TrangThaiDonHang;
    if (
      currentStatus === ORDER_STATUS.COMPLETED ||
      currentStatus === ORDER_STATUS.CANCELED
    ) {
      throw new ErrorHandler("Không thể thay đổi trạng thái đơn hàng!", 400);
    }
    if (
      currentStatus === ORDER_STATUS.SHIPPING &&
      newStatus === ORDER_STATUS.CANCELED
    ) {
      throw new ErrorHandler(
        "Đơn hàng đang được giao, vui lòng thông báo với bưu cục hoàn hàng!",
        400,
      );
    }
    if (newStatus === ORDER_STATUS.CANCELED) {
      const now = new Date().toLocaleString("vi-VN", {
        timeZone: "Asia/Ho_Chi_Minh",
        hour12: false,
      });
      order.TrangThaiDonHang = ORDER_STATUS.CANCELED;
      order.GhiChu = order.GhiChu
        ? `${order.GhiChu}\n[${now}]Admin hủy: ${note}`
        : `[${now}]Admin hủy: ${note}`;
      if (order.TrangThaiThanhToan === 1) {
        order.GhiChu += `\nVui lòng inbox/đến trực tiếp cửa hàng để yêu cầu hoàn tiền.
Thông tin liên hệ:
📍 Địa chỉ: 484 Lạch Tray, Lê Chân, Hải Phòng.
📞 Hotline: 0329.835.725
📧 Email: theceramicshop24@gmail.com
📘 Facebook: https://www.facebook.com/tran.duy.anh.714185
💬 Zalo: https://zalo.me/0329835725`;
      }
      await order.save({
        transaction,
      });
      const orderDetails = order.ChiTietDonHangs;
      const inventoryLogs = [];
      for (const detail of orderDetails) {
        await VariantModel.increment(
          { SoLuong: detail.SoLuong },
          { where: { MaBienThe: detail.MaBienThe }, transaction },
        );
        const variantUpdated = await VariantModel.findByPk(detail.MaBienThe, {
          transaction,
          attributes: ["SoLuong"],
        });
        inventoryLogs.push({
          MaBienThe: detail.MaBienThe,
          LoaiGiaoDich: "Hủy Đơn",
          SoLuongThayDoi: detail.SoLuong,
          TonKhoHienTai: variantUpdated.SoLuong,
          LoaiThamChieu: "Đơn Hàng",
          MaThamChieu: order.MaDonHang,
          GhiChu: `Admin hủy đơn ${order.MaHienThi}`,
        });
      }
      if (inventoryLogs.length > 0) {
        await InventoryHistoryModel.bulkCreate(inventoryLogs, {
          transaction,
        });
      }
      const promos =
        order.OrderPromotionModels || order.ChiTietKhuyenMaiDonHangs || [];
      for (const promo of promos) {
        await PromotionWalletModel.update(
          { TrangThaiSuDung: 0 },
          {
            where: {
              MaKhachHang: order.MaKhachHang,
              MaKhuyenMai: promo.MaKhuyenMai,
            },
            transaction,
          },
        );
        await PromotionModel.increment("SoLuong", {
          by: 1,
          where: { MaKhuyenMai: promo.MaKhuyenMai },
          transaction,
        });
      }
    } else {
      order.TrangThaiDonHang = newStatus;
      await order.save({
        transaction,
      });
    }
    await transaction.commit();
  } catch (err) {
    await transaction.rollback();
    console.error(err);
    if (err.statusCode) throw err;
    throw new ErrorHandler(
      "Lỗi server! Không thể cập nhật trạng thái đơn hàng!",
      500,
    );
  }
};
