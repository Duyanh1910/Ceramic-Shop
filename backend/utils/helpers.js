import ErrorHandler from "./error_handler.js";
export const isStringEmpty = (val) => {
  return typeof val !== "string" || val.trim().length === 0;
};
export const checkValidate = (...strings) => {
  return strings.every((str) => !isStringEmpty(str));
};
export const isValidEmail = (email) => {
  if (!email) return false;
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};
export const isValidPhoneNumber = (phone) => {
  if (!phone) return false;
  const regex = /^0\d{9}$/;
  return regex.test(String(phone));
};

export const isValidDate = (date) => {
  const d = new Date(date);
  return d instanceof Date && !isNaN(d);
};

export const validateVariants = (BienThe) => {
  if (!BienThe || !Array.isArray(BienThe) || BienThe.length === 0) {
    throw new ErrorHandler("Biến thể không hợp lệ!", 400);
  }

  const nameSet = new Set();

  BienThe.forEach((item, index) => {
    const prefix = `Biến thể #${index + 1}`;

    if (!item.TenBienThe || item.TenBienThe.trim() === "") {
      throw new ErrorHandler(`${prefix} thiếu tên`, 400);
    }

    if (nameSet.has(item.TenBienThe)) {
      throw new ErrorHandler(
        `Tên biến thể "${item.TenBienThe}" bị trùng!`,
        400,
      );
    }
    nameSet.add(item.TenBienThe);

    if (item.Gia == null || isNaN(item.Gia) || Number(item.Gia) <= 0) {
      throw new ErrorHandler(`${prefix} giá không hợp lệ`, 400);
    }

    if (
      item.SoLuong == null ||
      isNaN(item.SoLuong) ||
      Number(item.SoLuong) < 0
    ) {
      throw new ErrorHandler(`${prefix} số lượng không hợp lệ`, 400);
    }

    if (item.TrangThai != null && ![0, 1].includes(item.TrangThai)) {
      throw new ErrorHandler(`${prefix} trạng thái không hợp lệ`, 400);
    }
    if (item.images != null) {
      if (!Array.isArray(item.images)) {
        throw new ErrorHandler(`${prefix} images phải là mảng`, 400);
      }

      item.images.forEach((img, i) => {
        if (typeof img !== "string" || img.trim() === "") {
          throw new ErrorHandler(`${prefix} ảnh #${i + 1} không hợp lệ`, 400);
        }
      });
    }
    if (item.attributes != null) {
      if (!Array.isArray(item.attributes)) {
        throw new ErrorHandler(`${prefix} attributes không hợp lệ`, 400);
      }

      item.attributes.forEach((attrId, i) => {
        if (!Number.isInteger(attrId) || attrId <= 0) {
          throw new ErrorHandler(
            `${prefix} attribute #${i + 1} không hợp lệ`,
            400,
          );
        }
      });
    }
  });
};
