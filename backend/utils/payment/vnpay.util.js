import crypto from "crypto";

export const sortObject = (obj) => {
  const sorted = {};
  const keys = Object.keys(obj).sort();

  for (let key of keys) {
    // VNPAY yêu cầu encodeURIComponent và thay thế khoảng trắng bằng dấu '+'
    sorted[key] = encodeURIComponent(obj[key]).replace(/%20/g, "+");
  }

  return sorted;
};

export const createSecureHash = (params, secretKey) => {
  // Sắp xếp param
  const sorted = sortObject(params);

  // Tự nối chuỗi thủ công theo định dạng key=value&...
  const signData = Object.keys(sorted)
    .map((key) => `${key}=${sorted[key]}`)
    .join("&");

  // Tạo mã băm HMAC-SHA512
  return crypto
    .createHmac("sha512", secretKey)
    .update(signData, "utf-8")
    .digest("hex");
};

export const buildPaymentUrl = (params, config) => {
  const vnpParams = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: config.tmnCode,
    ...params,
  };

  const sorted = sortObject(vnpParams);

  // Nối chuỗi tạo chữ ký
  const signData = Object.keys(sorted)
    .map((key) => `${key}=${sorted[key]}`)
    .join("&");

  // Băm chữ ký
  const secureHash = crypto
    .createHmac("sha512", config.hashSecret)
    .update(signData, "utf-8")
    .digest("hex");

  sorted.vnp_SecureHash = secureHash;

  // Nối chuỗi để tạo URL cuối cùng trả về frontend
  const queryString = Object.keys(sorted)
    .map((key) => `${key}=${sorted[key]}`)
    .join("&");

  return `${config.vnpUrl}?${queryString}`;
};

export const verifyVnpay = (query, secretKey) => {
  const vnpParams = { ...query };

  const secureHash = vnpParams["vnp_SecureHash"];

  // 1. Xóa các trường không dùng để tạo chữ ký
  delete vnpParams["vnp_SecureHash"];
  delete vnpParams["vnp_SecureHashType"];

  // 2. LỚP BẢO VỆ: Quét và xóa toàn bộ các param rác
  // (Phòng trường hợp frontend hoặc React/Vue tự động nhét thêm param vào URL)
  Object.keys(vnpParams).forEach((key) => {
    if (!key.startsWith("vnp_")) {
      delete vnpParams[key];
    }
  });

  // 3. Sắp xếp lại object đã sạch
  const sorted = sortObject(vnpParams);

  // 4. Tự nối chuỗi thủ công theo chuẩn
  const signData = Object.keys(sorted)
    .map((key) => `${key}=${sorted[key]}`)
    .join("&");

  // 5. Băm chữ ký để so sánh
  const signed = crypto
    .createHmac("sha512", secretKey)
    .update(signData, "utf-8")
    .digest("hex");

  return {
    isSuccess: secureHash === signed,
    data: vnpParams, // Trả về data đã được làm sạch
  };
};
