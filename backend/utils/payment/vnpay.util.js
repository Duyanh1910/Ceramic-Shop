import crypto from "crypto";
import qs from "qs";

export const sortObject = (obj) => {
  const sorted = {};
  const keys = Object.keys(obj).sort();

  for (let key of keys) {
    sorted[key] = encodeURIComponent(obj[key]).replace(/%20/g, "+");
  }

  return sorted;
};

export const createSecureHash = (params, secretKey) => {
  const signData = qs.stringify(params, { encode: false });

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
  const secureHash = createSecureHash(sorted, config.hashSecret);

  sorted.vnp_SecureHash = secureHash;

  return `${config.vnpUrl}?${qs.stringify(sorted, { encode: false })}`;
};

export const verifyVnpay = (query, secretKey) => {
  const vnpParams = { ...query };

  const secureHash = vnpParams["vnp_SecureHash"];

  delete vnpParams["vnp_SecureHash"];
  delete vnpParams["vnp_SecureHashType"];

  const sorted = sortObject(vnpParams);
  const signData = qs.stringify(sorted, { encode: false });

  const signed = crypto
    .createHmac("sha512", secretKey)
    .update(signData, "utf-8")
    .digest("hex");

  return {
    isSuccess: secureHash === signed,
    data: vnpParams,
  };
};
