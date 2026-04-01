import { VNPay } from "vnpay";

const vnpay = new VNPay({
  vnpayHost: "https://sandbox.vnpayment.vn",
  tmnCode: "53DOY4SR",
  secureSecret: "GPQAHHW4US5FV4RWFBGLCJQAPE26I8TB",
  testMode: true,
  endpoints: {
    paymentEndpoint: "paymentv2/vpcpay.html",
    queryDrRefundEndpoint: "merchant_webapi/api/transaction",
    getBankListEndpoint: "qrpayauth/api/merchant/get_bank_list",
  },
});

export default vnpay;
