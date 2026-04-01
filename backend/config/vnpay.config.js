import { VNPay } from "vnpay";

const vnpay = new VNPay({
  vnpayHost: "https://sandbox.vnpayment.vn",
  tmnCode: "TMNCODE",
  secureSecret: "SERCRET",
  testMode: true,
  hashAlgorithm: "SHA512",
  endpoints: {
    paymentEndpoint: "paymentv2/vpcpay.html",
    queryDrRefundEndpoint: "merchant_webapi/api/transaction",
    getBankListEndpoint: "qrpayauth/api/merchant/get_bank_list",
  },
});

export default vnpay;
