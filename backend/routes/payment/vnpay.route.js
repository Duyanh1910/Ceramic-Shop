import express from "express";
import { verifyVnpay } from "../../utils/payment/vnpay.util.js";
import {
  PaymentTransactionModel,
  OrderModel,
  sequelize,
} from "../../models/index.js";

const router = express.Router();

router.get("/vnpay-return", (req, res) => {
  const verify = verifyVnpay(req.query, process.env.VNP_HASHSECRET);

  if (!verify.isSuccess) {
    return res.send("Sai chữ ký");
  }

  const data = verify.data;

  if (data.vnp_ResponseCode === "00") {
    return res.redirect("http://localhost:5173/payment-success");
  } else {
    return res.redirect("http://localhost:5173/payment-fail");
  }
});

router.get("/vnpay-ipn", async (req, res) => {
  const verify = verifyVnpay(req.query, process.env.VNP_HASHSECRET);

  if (!verify.isSuccess) {
    return res.json({ RspCode: "97", Message: "Invalid signature" });
  }

  const data = verify.data;
  const { vnp_TxnRef, vnp_ResponseCode, vnp_TransactionNo, vnp_Amount } = data;

  try {
    await sequelize.transaction(async (t) => {
      const giaoDich = await PaymentTransactionModel.findOne({
        where: { MaThamChieu: vnp_TxnRef },
        lock: true,
        transaction: t,
      });

      if (!giaoDich) {
        throw new Error("Order not found");
      }

      if (giaoDich.TrangThai !== "PENDING") {
        throw new Error("Already processed");
      }

      if (Number(vnp_Amount) !== giaoDich.SoTien * 100) {
        throw new Error("Invalid amount");
      }

      const isSuccess = vnp_ResponseCode === "00";

      await giaoDich.update(
        {
          TrangThai: isSuccess ? "SUCCESS" : "FAILED",
          MaGiaoDichDoiTac: vnp_TransactionNo,
          MaLoi: vnp_ResponseCode,
          DuLieuPhanHoi: data,
        },
        { transaction: t },
      );

      if (isSuccess) {
        await OrderModel.update(
          { TrangThaiThanhToan: 1 },
          {
            where: { MaDonHang: giaoDich.MaDonHang },
            transaction: t,
          },
        );
      }
    });

    return res.json({ RspCode: "00", Message: "OK" });
  } catch (err) {
    return res.json({ RspCode: "99", Message: err.message });
  }
});

export default router;
