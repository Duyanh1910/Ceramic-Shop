import crypto from "crypto";

export const sortObject = (obj) => {
  const sorted = {};
  const keys = Object.keys(obj).sort();

  for (let key of keys) {
    if (obj[key] !== "" && obj[key] !== undefined && obj[key] !== null) {
      sorted[key] = encodeURIComponent(String(obj[key])).replace(/%20/g, "+");
    }
  }

  return sorted;
};

export const createSecureHash = (params, secretKey) => {
  const sorted = sortObject(params);

  const signData = Object.keys(sorted)
    .map((key) => `${key}=${sorted[key]}`)
    .join("&");

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

  const signData = Object.keys(sorted)
    .map((key) => `${key}=${sorted[key]}`)
    .join("&");

  const secureHash = crypto
    .createHmac("sha512", config.hashSecret)
    .update(signData, "utf-8")
    .digest("hex");

  sorted.vnp_SecureHash = secureHash;

  const queryString = Object.keys(sorted)
    .map((key) => `${key}=${sorted[key]}`)
    .join("&");

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
  console.log("\n====== DEBUG VNPAY SIGNATURE ======");
  console.log("1. Dữ liệu gốc VNPAY gửi về (Query):", query);
  console.log("2. Chuỗi hash VNPAY gửi về (secureHash):", secureHash);
  console.log("3. Chuỗi hash Server tự tính (signed):", signed);
  console.log(
    "4. Trạng thái SecretKey:",
    secretKey
      ? `Hợp lệ (Độ dài: ${secretKey.length})`
      : "BỊ MISSING (Undefined/Null)",
  );
  console.log("\n---> 5. CHUỖI SIGN-DATA TRƯỚC KHI HASH (Quan trọng nhất):");
  console.log(signData);
  console.log("=====================================\n");
  return {
    isSuccess: secureHash.toLowerCase() === signed.toLowerCase(),
    data: vnpParams,
  };
};
