import { VNPay } from "vnpay";

const vnpay = new VNPay({
  vnpayHost: "https://sandbox.vnpayment.vn",
  tmnCode: process.env.VNP_TMNCODE,
  secureSecret: process.env.VNP_HASHSECRET,
  testMode: true,
  hashAlgorithm: "SHA512",
  endpoints: {
    paymentEndpoint: "paymentv2/vpcpay.html",
    queryDrRefundEndpoint: "merchant_webapi/api/transaction",
    getBankListEndpoint: "qrpayauth/api/merchant/get_bank_list",
  },
});

export default vnpay;
