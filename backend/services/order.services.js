import {
  CartInfoModel,
  CartModel,
  CustomerModel,
  InventoryHistoryModel,
  OrderDetailModel,
  OrderModel,
  OrderPromotionModel,
  PaymentMethodModel,
  PaymentTransactionModel,
  ProductModel,
  PromotionModel,
  PromotionWalletModel,
  sequelize,
  ShippingTypeModel,
  VariantImageModel,
  VariantModel,
} from "../models/index.js";
import ErrorHandler from "../utils/error_handler.js";
import { literal, Op } from "sequelize";
import { generateWarrantiesForOrderService } from "./warranty.service.js";
import calculateShippingFee from "../utils/orders/calculate_shipping_fee.js";
import calculateOrderDiscount from "../utils/orders/calculate_order_discount.js";
import {
  assertActivePaymentMethod,
  assertCancelableOrder,
  assertCustomerFound,
  assertOrderFound,
  buildTrustedCartItems,
  getValidatedCartItems,
  normalizePaymentMethodId,
  normalizeSelectedVariantIds,
  validateAdminOrderStatusUpdate,
} from "../utils/orders/order_validation.helper.js";
import { emitToCustomer } from "../config/socketIO.js";
import {
  NOTIFICATION_TYPES,
  safeCreateAdminNotificationService,
} from "./adminNotifications.service.js";

export const ORDER_STATUS = {
  PENDING: 0,
  PREPARING: 1,
  SHIPPING: 2,
  COMPLETED: 3,
  CANCELED: 4,
};

const PAYMENT_METHOD = {
  COD: 1,
  MOMO: 4,
  ZALOPAY: 5,
};

const VALID_ORDER_TRANSITIONS = {
  [ORDER_STATUS.PENDING]: [ORDER_STATUS.PREPARING, ORDER_STATUS.CANCELED],
  [ORDER_STATUS.PREPARING]: [ORDER_STATUS.SHIPPING, ORDER_STATUS.CANCELED],
  [ORDER_STATUS.SHIPPING]: [ORDER_STATUS.COMPLETED],
};

const generateOrderCode = () => {
  const date = new Date();
  const dateStr = `${date.getFullYear().toString().slice(-2)}${(date.getMonth() + 1).toString().padStart(2, "0")}${date.getDate().toString().padStart(2, "0")}`;
  const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `DH${dateStr}${randomStr}`;
};

export const checkOutService = async (
  idAccount,
  orderData,
  selectedVariantIds,
) => {
  const uniqueSelectedVariantIds =
    normalizeSelectedVariantIds(selectedVariantIds);

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

    const normalizedPaymentMethodId = normalizePaymentMethodId(MaPhuongThuc);

    const activePaymentMethod = await PaymentMethodModel.findOne({
      where: {
        MaPhuongThuc: normalizedPaymentMethodId,
        TrangThai: 1,
      },
      transaction,
    });

    assertActivePaymentMethod(activePaymentMethod);

    const customer = await CustomerModel.findOne({
      where: { MaTaiKhoan: idAccount },
    });
    assertCustomerFound(customer);
    const cart = await CartModel.findOne({
      where: { MaKhachHang: customer.MaKhachHang },
      include: [
        {
          model: CartInfoModel,
          where: { MaBienThe: { [Op.in]: uniqueSelectedVariantIds } },
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

    const cartItems = getValidatedCartItems(
      cart,
      uniqueSelectedVariantIds.length,
    );
    const { trustedItems, totalProductPrice } =
      buildTrustedCartItems(cartItems);

    let totalShippingFee = 0;
    if (addressObj && MaPhi) {
      const shipResult = await calculateShippingFee(
        trustedItems,
        addressObj,
        MaPhi,
        totalProductPrice,
      );
      totalShippingFee = shipResult.data.total;
    }

    const discountResult = await calculateOrderDiscount(
      ListMaKhuyenMai,
      customer.MaKhachHang,
      totalProductPrice,
      totalShippingFee,
      trustedItems,
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
        MaPhuongThuc: normalizedPaymentMethodId,
        MaLoaiPhi: MaPhi ? Number(MaPhi) : null,
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

      const [affectedRows] = await VariantModel.update(
        { SoLuong: literal(`SoLuong - ${quantity}`) },
        {
          where: {
            MaBienThe: variant.MaBienThe,
            SoLuong: { [Op.gte]: quantity },
          },
          transaction,
        },
      );

      if (affectedRows !== 1) {
        throw new ErrorHandler(
          `Sản phẩm ${variant.TenBienThe} không đủ số lượng trong kho!`,
          400,
        );
      }

      const updatedVariant = await VariantModel.findByPk(variant.MaBienThe, {
        attributes: ["SoLuong"],
        transaction,
      });

      inventoryHistories.push({
        MaBienThe: variant.MaBienThe,
        LoaiGiaoDich: "Xuất Bán",
        SoLuongThayDoi: -quantity,
        TonKhoHienTai: updatedVariant.SoLuong,
        LoaiThamChieu: "Đơn Hàng",
        MaThamChieu: newOrder.MaDonHang,
        GhiChu: `Khách hàng đặt mua đơn ${newOrder.MaHienThi}`,
      });
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

        const [walletAffectedRows] = await PromotionWalletModel.update(
          { TrangThaiSuDung: 1 },
          {
            where: {
              MaKhachHang: customer.MaKhachHang,
              MaKhuyenMai: p.MaKhuyenMai,
              TrangThaiSuDung: 0,
            },
            transaction,
          },
        );

        if (walletAffectedRows !== 1) {
          throw new ErrorHandler(
            "Mã khuyến mãi không hợp lệ hoặc đã bị sử dụng!",
            400,
          );
        }

        const [promoAffectedRows] = await PromotionModel.update(
          { SoLuong: literal("SoLuong - 1") },
          {
            where: {
              MaKhuyenMai: p.MaKhuyenMai,
              SoLuong: { [Op.gt]: 0 },
            },
            transaction,
          },
        );

        if (promoAffectedRows !== 1) {
          throw new ErrorHandler("Mã khuyến mãi đã hết lượt sử dụng!", 400);
        }
      }
      await OrderPromotionModel.bulkCreate(orderPromotions, { transaction });
    }

    await CartInfoModel.destroy({
      where: {
        MaGioHang: cart.MaGioHang,
        MaBienThe: { [Op.in]: uniqueSelectedVariantIds },
      },
      transaction,
    });

    await transaction.commit();

    await safeCreateAdminNotificationService({
      LoaiThongBao: NOTIFICATION_TYPES.ORDER_CREATED,
      TieuDe: "Có đơn hàng mới",
      NoiDung: `Đơn ${newOrder.MaHienThi} vừa được tạo`,
      DuongDan: `/admin?orderCode=${newOrder.MaHienThi}`,
    });

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
  assertCustomerFound(customer);

  return await OrderModel.findAll({
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
      { model: PaymentMethodModel },
    ],
  });
};

export const getMyOrderInfoService = async (idAccount, orderCode) => {
  try {
    const customer = await CustomerModel.findOne({
      where: { MaTaiKhoan: idAccount },
    });

    assertCustomerFound(customer);

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

    assertOrderFound(
      order,
      "Đơn hàng không tồn tại hoặc bạn không có quyền truy cập!",
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
    assertCustomerFound(customer);

    const order = await OrderModel.findOne({
      where: { MaHienThi: orderCode, MaKhachHang: customer.MaKhachHang },
      include: [{ model: OrderDetailModel }, { model: OrderPromotionModel }],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    assertCancelableOrder(order, ORDER_STATUS);

    order.TrangThaiDonHang = ORDER_STATUS.CANCELED;
    order.GhiChu = order.GhiChu
      ? `${order.GhiChu} | Khách tự hủy: ${reason}`
      : `Khách tự hủy: ${reason}`;
    await order.save({ transaction });
    const inventoryHistories = [];
    for (const detail of order.ChiTietDonHangs) {
      const variant = await VariantModel.findByPk(detail.MaBienThe, {
        attributes: ["MaBienThe", "SoLuong"],
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (variant) {
        const restoredQuantity =
          Number(variant.SoLuong) + Number(detail.SoLuong);

        await variant.update({ SoLuong: restoredQuantity }, { transaction });

        inventoryHistories.push({
          MaBienThe: variant.MaBienThe,
          LoaiGiaoDich: "Hoàn trả hàng / Hủy đơn",
          SoLuongThayDoi: detail.SoLuong,
          TonKhoHienTai: restoredQuantity,
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

    const orderCanceledPayload = {
      type: "ORDER_CANCELED",
      title: "Đơn hàng đã hủy",
      message: `Đơn ${order.MaHienThi} đã được khách hàng hủy`,
      redirectUrl: `/orders?orderCode=${order.MaHienThi}`,
      adminRedirectUrl: `/admin?orderCode=${order.MaHienThi}`,
      canceledBy: "Customer",
      reason: reason || null,
      order: {
        MaDonHang: order.MaDonHang,
        MaHienThi: order.MaHienThi,
        MaKhachHang: order.MaKhachHang,
        TrangThaiDonHang: order.TrangThaiDonHang,
        TrangThaiThanhToan: order.TrangThaiThanhToan,
      },
    };

    emitToCustomer(
      order.MaKhachHang,
      "customer:order_canceled",
      orderCanceledPayload,
    );

    await safeCreateAdminNotificationService({
      LoaiThongBao: NOTIFICATION_TYPES.ORDER_CANCELED,
      TieuDe: "Đơn hàng đã hủy",
      NoiDung: `Đơn ${order.MaHienThi} đã được khách hàng hủy`,
      DuongDan: orderCanceledPayload.adminRedirectUrl,
    });

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

    assertOrderFound(order, "Đơn hàng không tồn tại!");

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
  newPaymentStatus,
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
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    const {
      currentStatus,
      currentPaymentStatus,
      hasStatusUpdate,
      hasPaymentUpdate,
      nextStatus,
      nextPaymentStatus,
    } = validateAdminOrderStatusUpdate({
      order,
      newStatus,
      newPaymentStatus,
      orderStatus: ORDER_STATUS,
      paymentMethod: PAYMENT_METHOD,
      validOrderTransitions: VALID_ORDER_TRANSITIONS,
    });

    if (
      hasStatusUpdate &&
      nextStatus !== currentStatus &&
      nextStatus === ORDER_STATUS.CANCELED
    ) {
      const now = new Date().toLocaleString("vi-VN", {
        timeZone: "Asia/Ho_Chi_Minh",
        hour12: false,
      });
      order.TrangThaiDonHang = ORDER_STATUS.CANCELED;
      order.GhiChu = order.GhiChu
        ? `${order.GhiChu}\n[${now}]Admin hủy: ${note}`
        : `[${now}]Admin hủy: ${note}`;
      if (Number(order.TrangThaiThanhToan) === 1) {
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
        const variantUpdated = await VariantModel.findByPk(detail.MaBienThe, {
          attributes: ["MaBienThe", "SoLuong"],
          transaction,
          lock: transaction.LOCK.UPDATE,
        });

        if (!variantUpdated) {
          continue;
        }

        const restoredQuantity =
          Number(variantUpdated.SoLuong) + Number(detail.SoLuong);

        await variantUpdated.update(
          { SoLuong: restoredQuantity },
          { transaction },
        );
        inventoryLogs.push({
          MaBienThe: detail.MaBienThe,
          LoaiGiaoDich: "Hủy Đơn",
          SoLuongThayDoi: detail.SoLuong,
          TonKhoHienTai: restoredQuantity,
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
      if (hasPaymentUpdate) {
        order.TrangThaiThanhToan = nextPaymentStatus;
      }

      if (hasStatusUpdate) {
        order.TrangThaiDonHang = nextStatus;
      }
      await order.save({
        transaction,
      });

      if (
        hasStatusUpdate &&
        nextStatus !== currentStatus &&
        nextStatus === ORDER_STATUS.COMPLETED
      ) {
        await generateWarrantiesForOrderService(order.MaDonHang, transaction);
      }
    }
    await transaction.commit();

    const orderStatusPayload = {
      type: "ORDER_STATUS_UPDATED",
      title: "Trạng thái đơn hàng đã thay đổi",
      message: `Đơn ${order.MaHienThi} đã được cập nhật trạng thái`,
      redirectUrl: `/orders?orderCode=${order.MaHienThi}`,
      adminRedirectUrl: `/admin?orderCode=${order.MaHienThi}`,
      order: {
        MaDonHang: order.MaDonHang,
        MaHienThi: order.MaHienThi,
        MaKhachHang: order.MaKhachHang,
        TrangThaiDonHang: order.TrangThaiDonHang,
        TrangThaiThanhToan: order.TrangThaiThanhToan,
      },
    };

    emitToCustomer(
      order.MaKhachHang,
      "customer:order_updated",
      orderStatusPayload,
    );

    if (Number(order.TrangThaiDonHang) === ORDER_STATUS.CANCELED) {
      const orderCanceledPayload = {
        ...orderStatusPayload,
        type: "ORDER_CANCELED",
        title: "Đơn hàng đã hủy",
        message: `Đơn ${order.MaHienThi} đã bị admin hủy`,
        canceledBy: "Admin",
      };

      emitToCustomer(
        order.MaKhachHang,
        "customer:order_canceled",
        orderCanceledPayload,
      );

      await safeCreateAdminNotificationService({
        LoaiThongBao: NOTIFICATION_TYPES.ORDER_CANCELED,
        TieuDe: "Đơn hàng đã hủy",
        NoiDung: `Đơn ${order.MaHienThi} đã bị admin hủy`,
        DuongDan: orderCanceledPayload.adminRedirectUrl,
      });
    } else if (
      (hasStatusUpdate && nextStatus !== currentStatus) ||
      (hasPaymentUpdate &&
        Number(order.TrangThaiThanhToan) !== currentPaymentStatus)
    ) {
      await safeCreateAdminNotificationService({
        LoaiThongBao: NOTIFICATION_TYPES.ORDER_STATUS_UPDATED,
        TieuDe: "Trạng thái đơn hàng đã thay đổi",
        NoiDung: `Đơn ${order.MaHienThi} đã được cập nhật trạng thái`,
        DuongDan: orderStatusPayload.adminRedirectUrl,
      });
    }
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
