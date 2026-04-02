export const createSecureHash = (params, secretKey) => {
  const signData = Object.keys(params)
    .map((key) => `${key}=${params[key]}`)
    .join("&");

  return crypto
    .createHmac("sha512", secretKey)
    .update(signData, "utf-8")
    .digest("hex");
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

  return {
    isSuccess: secureHash === signed,
    data: vnpParams,
  };
};
