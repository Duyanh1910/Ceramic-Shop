import crypto from "crypto";
import qs from "qs"; // Nếu báo lỗi thiếu thư viện thì chạy: npm install qs

export const sortObject = (obj) => {
  const sorted = {};
  const keys = Object.keys(obj).sort();

  for (let key of keys) {
    if (obj[key] !== "" && obj[key] !== undefined && obj[key] !== null) {
      // BẮT BUỘC PHẢI ENCODE Ở BƯỚC NÀY
      sorted[key] = encodeURIComponent(String(obj[key])).replace(/%20/g, "+");
    }
  }

  return sorted;
};

export const createSecureHash = (params, secretKey) => {
  const sorted = sortObject(params);
  const signData = qs.stringify(sorted, { encode: false });

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

  // 1. Sắp xếp và Encode dữ liệu (quan trọng)
  const sorted = sortObject(vnpParams);

  // 2. Tạo chuỗi ký tự thô (không encode lại lần 2 để tránh lỗi)
  const signData = qs.stringify(sorted, { encode: false });

  // 3. Tạo chữ ký
  const secureHash = crypto
    .createHmac("sha512", config.hashSecret)
    .update(signData, "utf-8")
    .digest("hex");

  // 4. Gắn chữ ký vào mảng params
  sorted.vnp_SecureHash = secureHash;

  // 5. Build URL cuối cùng
  const queryString = qs.stringify(sorted, { encode: false });
  return `${config.vnpUrl}?${queryString}`;
};

export const verifyVnpay = (query, secretKey) => {
  const vnpParams = { ...query };

  const secureHash = vnpParams["vnp_SecureHash"];

  delete vnpParams["vnp_SecureHash"];
  delete vnpParams["vnp_SecureHashType"];

  Object.keys(vnpParams).forEach((key) => {
    if (!key.startsWith("vnp_")) {
      delete vnpParams[key];
    }
  });

  const sorted = sortObject(vnpParams);

  const signData = Object.keys(sorted)
    .map((key) => `${key}=${sorted[key]}`)
    .join("&");

  const signed = crypto
    .createHmac("sha512", secretKey)
    .update(signData, "utf-8")
    .digest("hex");

  console.log("\n====== [VERIFY SIGN DATA] ======");
  console.log(signData);
  console.log("VNPAY HASH:", secureHash);
  console.log("SERVER HASH:", signed);
  console.log("MATCH:", secureHash === signed);
  console.log("================================\n");

  return {
    isSuccess: secureHash?.toLowerCase() === signed.toLowerCase(),
    data: vnpParams,
  };
};
