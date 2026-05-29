import crypto from "crypto";
import axios from "axios";

const key2 = "Iyz2habzyr7AG8SgvoBCbKwKi3UzlLi3";
const targetUrl =
  "https://ceramic-shop-u8ak.onrender.com/api/v1/payment/zalo-ipn";

const dataJson = {
  app_id: 553,
  app_trans_id: "260405_120002_118442",
  app_time: 1775371745906,
  app_user: "CeramicShopUser",
  amount: 724800,
  embed_data:
    '{"redirecturl":"https://ceramic-shop-rho.vercel.app/payment-result"}',
  item: "[{}]",
  zp_trans_id: 999888777666,
  server_time: Date.now(),
  channel: 38,
  merchant_user_id: "",
  zp_user_id: "",
  user_fee_amount: 0,
  discount_amount: 0,
};

const dataStr = JSON.stringify(dataJson);

const reqMac = crypto.createHmac("sha256", key2).update(dataStr).digest("hex");

console.log("Đang giả lập ZaloPay bắn IPN vào:", targetUrl);
axios
  .post(targetUrl, {
    data: dataStr,
    mac: reqMac,
  })
  .then((response) => {
    console.log("Server của bạn trả lời ZaloPay là:", response.data);
  })
  .catch((error) => {
    console.error("Lỗi khi bắn IPN:", error.message);
  });

export const queryZaloPayTransaction = async (app_trans_id) => {
  const postData = {
    app_id: ZALOPAY_CONFIG.app_id,
    app_trans_id: app_trans_id,
  };

  const dataForMac = `${postData.app_id}|${postData.app_trans_id}|${ZALOPAY_CONFIG.key1}`;
  postData.mac = crypto
    .createHmac("sha256", ZALOPAY_CONFIG.key1)
    .update(dataForMac)
    .digest("hex");

  try {
    const response = await axios.post(
      "https://sb-openapi.zalopay.vn/v2/query",
      qs.stringify(postData),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      },
    );

    const result = response.data;

    if (result.return_code === 1) {
      await sequelize.transaction(async (t) => {
        const giaoDich = await PaymentTransactionModel.findOne({
          where: { MaThamChieu: app_trans_id, TrangThai: "PENDING" },
          lock: true,
          transaction: t,
        });

        if (giaoDich) {
          await giaoDich.update(
            { TrangThai: "SUCCESS", MaLoi: "1" },
            { transaction: t },
          );
          await OrderModel.update(
            { TrangThaiThanhToan: 1 },
            { where: { MaDonHang: giaoDich.MaDonHang }, transaction: t },
          );
          console.log("Đã update DB qua lệnh Query chủ động!");
        }
      });
    }
    return result;
  } catch (error) {
    console.error("Lỗi Query:", error);
    throw new ErrorHandler("Lỗi khi truy vấn ZaloPay", 500);
  }
};
