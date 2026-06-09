import ErrorHandler from "../error_handler.js";

export const normalizeSelectedVariantIds = (selectedVariantIds) => {
  if (!selectedVariantIds || selectedVariantIds.length === 0) {
    throw new ErrorHandler("Vui lòng chọn ít nhất 1 sản phẩm!", 400);
  }

  const uniqueSelectedVariantIds = [
    ...new Set(selectedVariantIds.map((id) => Number(id))),
  ];

  if (
    uniqueSelectedVariantIds.length === 0 ||
    uniqueSelectedVariantIds.some((id) => !Number.isInteger(id) || id <= 0)
  ) {
    throw new ErrorHandler("Danh sách sản phẩm được chọn không hợp lệ!", 400);
  }

  return uniqueSelectedVariantIds;
};

export const normalizePaymentMethodId = (paymentMethodId) => {
  const normalizedPaymentMethodId = Number(paymentMethodId);

  if (
    !Number.isInteger(normalizedPaymentMethodId) ||
    normalizedPaymentMethodId <= 0
  ) {
    throw new ErrorHandler("Phương thức thanh toán không hợp lệ!", 400);
  }

  return normalizedPaymentMethodId;
};

export const assertActivePaymentMethod = (activePaymentMethod) => {
  if (!activePaymentMethod) {
    throw new ErrorHandler("Phương thức thanh toán không hợp lệ!", 400);
  }
};

export const assertCustomerFound = (customer) => {
  if (!customer) {
    throw new ErrorHandler("Không tìm thấy khách hàng này!", 404);
  }
};

export const assertOrderFound = (
  order,
  message = "Không tìm thấy đơn hàng!",
  statusCode = 404,
) => {
  if (!order) {
    throw new ErrorHandler(message, statusCode);
  }
};

export const getValidatedCartItems = (cart, expectedItemCount) => {
  const cartItems = cart?.CartInfoModels || cart?.ChiTietGioHangs;

  if (!cartItems || cartItems.length === 0) {
    throw new ErrorHandler(
      "Sản phẩm không hợp lệ, không đủ số lượng hoặc đã bị xóa khỏi giỏ!",
      400,
    );
  }

  if (cartItems.length !== expectedItemCount) {
    throw new ErrorHandler("Một số sản phẩm đã bị xóa hoặc không hợp lệ!", 400);
  }

  return cartItems;
};

export const buildTrustedCartItems = (cartItems) => {
  let totalProductPrice = 0;
  const trustedItems = [];

  for (const item of cartItems) {
    const variant = item.BienTheSanPham;
    if (variant.SoLuong < item.SoLuong) {
      throw new ErrorHandler(
        `Sản phẩm ${variant.TenBienThe} không đủ số lượng trong kho!`,
        400,
      );
    }
    const donGia = Number(variant.Gia);
    totalProductPrice += donGia * item.SoLuong;

    trustedItems.push({
      MaBienThe: variant.MaBienThe,
      soLuong: item.SoLuong,
      donGia,
      MaDanhMuc: variant.SanPham?.MaDanhMuc,
      KhoiLuong: Number(variant.KhoiLuong || 0.5),
      ChieuDai: Number(variant.ChieuDai || 0),
      ChieuRong: Number(variant.ChieuRong || 0),
      ChieuCao: Number(variant.ChieuCao || 0),
    });
  }

  return { trustedItems, totalProductPrice };
};

export const assertCancelableOrder = (order, orderStatus) => {
  if (!order) {
    throw new ErrorHandler("Không tìm thấy đơn hàng!", 404);
  }

  if (Number(order.TrangThaiDonHang) !== orderStatus.PENDING) {
    throw new ErrorHandler(
      "Chỉ có thể hủy đơn hàng khi đang ở trạng thái Chờ xác nhận!",
      400,
    );
  }
};

export const validateAdminOrderStatusUpdate = ({
  order,
  newStatus,
  newPaymentStatus,
  orderStatus,
  paymentMethod,
  validOrderTransitions,
}) => {
  if (!order) {
    throw new ErrorHandler("Không tìm thấy đơn hàng này!", 400);
  }

  const currentStatus = Number(order.TrangThaiDonHang);
  const currentPaymentStatus = Number(order.TrangThaiThanhToan);
  const hasStatusUpdate = newStatus !== undefined && newStatus !== null;
  const hasPaymentUpdate =
    newPaymentStatus !== undefined && newPaymentStatus !== null;
  const nextStatus = hasStatusUpdate ? Number(newStatus) : currentStatus;
  const nextPaymentStatus = hasPaymentUpdate
    ? Number(newPaymentStatus)
    : currentPaymentStatus;

  if (hasStatusUpdate && !Object.values(orderStatus).includes(nextStatus)) {
    throw new ErrorHandler("Trạng thái đơn hàng không hợp lệ!", 400);
  }

  if (hasPaymentUpdate) {
    if (Number(order.MaPhuongThuc) !== paymentMethod.COD) {
      throw new ErrorHandler(
        "Chỉ được cập nhật trạng thái thanh toán cho đơn COD!",
        400,
      );
    }

    if (![0, 1].includes(nextPaymentStatus)) {
      throw new ErrorHandler("Trạng thái thanh toán không hợp lệ!", 400);
    }

    if (currentPaymentStatus === 1 && nextPaymentStatus === 0) {
      throw new ErrorHandler("Không thể chuyển đổi trạng thái!", 400);
    }
  }

  if (
    currentStatus === orderStatus.COMPLETED ||
    currentStatus === orderStatus.CANCELED
  ) {
    throw new ErrorHandler("Không thể thay đổi trạng thái đơn hàng!", 400);
  }

  if (
    currentStatus === orderStatus.SHIPPING &&
    nextStatus === orderStatus.CANCELED
  ) {
    throw new ErrorHandler(
      "Đơn hàng đang được giao, vui lòng thông báo với bưu cục hoàn hàng!",
      400,
    );
  }

  if (
    hasStatusUpdate &&
    nextStatus !== currentStatus &&
    !validOrderTransitions[currentStatus]?.includes(nextStatus)
  ) {
    throw new ErrorHandler("Không thể chuyển đổi trạng thái!", 400);
  }

  if (nextStatus === orderStatus.COMPLETED && nextPaymentStatus === 0) {
    throw new ErrorHandler(
      "Không thể thay đổi trạng thái sang Hoàn thành vì đơn hàng chưa được thanh toán!",
      400,
    );
  }

  return {
    currentStatus,
    currentPaymentStatus,
    hasStatusUpdate,
    hasPaymentUpdate,
    nextStatus,
    nextPaymentStatus,
  };
};
