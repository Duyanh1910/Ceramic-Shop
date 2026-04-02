import crypto from "crypto";

// ✅ KHÔNG encode ở đây
export const sortObject = (obj) => {
  const sorted = {};
  const keys = Object.keys(obj).sort();

  for (let key of keys) {
    if (obj[key] !== "" && obj[key] !== undefined && obj[key] !== null) {
      sorted[key] = obj[key];
    }
  }

  return sorted;
};

// ✅ CREATE PAYMENT URL
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

  console.log("\n====== [CREATE SIGN DATA] ======");
  console.log(signData);
  console.log("================================\n");

  const secureHash = crypto
    .createHmac("sha512", config.hashSecret)
    .update(signData, "utf-8")
    .digest("hex");

  // ✅ CHỈ encode khi build URL
  const queryString = Object.keys(sorted)
    .map((key) => `${key}=${encodeURIComponent(sorted[key])}`)
    .join("&");

  return `${config.vnpUrl}?${queryString}&vnp_SecureHash=${secureHash}`;
};

// ✅ VERIFY
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
