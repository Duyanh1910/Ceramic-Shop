import ErrorHandler from "../error_handler.js";
import { SystemModel, sequelize, ShippingModel } from "../../models/index.js";
import { MienBac, MienTrung, MienNam, NoiThanhHP } from "../VN_province.js";

const calculateShippingFee = async (cartItems, MaPhi, DiaChiGiaoHang) => {
  try {
    let totalWeight = 0;
    let hasBulkyItem = false;
    let hasExtremeBulkyItem = false;
    let countBulkyItem = false;
    let countExtremeBulkyItem = false;
    const feeList = new Set();
    let basicFee = 0;
    let overweightFee = 0;
    let wrappingFee = 0;

    if (MaPhi == 10) {
      return {
        totalShippingFee: 0,
        details: [],
      };
    }

    const items = cartItems.map((item) => ({
      KhoiLuong: item.BienTheSanPham.KhoiLuong,
      SoLuong: item.SoLuong,
    }));

    const surcharge = await ShippingModel.findAll({ raw: true });
    const rows = await SystemModel.findAll();

    const StandardWeight = Number(config.MUC_KG_TIEU_CHUAN.GiaTri) || 3.0;
    const TruckFee = Number(config.PHI_THUE_XE_BAN_TAI) || 150000.0;
    const ExpressOverFee = Number(config.PHI_VUOT_KG_HOA_TOC.GiaTri) || 10000.0;
    const InterprovincialOverFee =
      Number(config.PHI_VUOT_KG_LIEN_TINH.GiaTri) || 10000.0;
    const InnerOverFee = Number(config.PHI_VUOT_KG_NOI_THANH.GiaTri) || 5000.0;
    const BulkyFee = Number(config.PHU_PHI_CONG_KENH.GiaTri) || 20000.0;
    const ExtremeBulkyFee =
      Number(config.PHU_PHI_SIEU_CONG_KENH.GiaTri) || 100000.0;
    const InternationalOverFee =
      Number(config.PHI_VUOT_KG_QUOC_TE.GiaTri) || 200000.0;

    const config = rows.reduce((acc, row) => {
      acc[row.MaCauHinh] = row;
      return acc;
    }, {});
    for (const item of items) {
      const weight = Number(item.KhoiLuong) * Number(item.SoLuong);
      totalWeight += weight;
      if (item.KhoiLuong >= 20) {
        countExtremeBulkyItem += item.SoLuong;
      } else if (item.KhoiLuong >= 1) {
        countBulkyItem += item.SoLuong;
      }
    }
    totalWeight = Math.ceil(totalWeight * 2) / 2;
    if (DiaChiGiaoHang.QuocGia === "Việt Nam") {
      if (DiaChiGiaoHang.TinhThanh === "Hải Phòng") {
        if (NoiThanhHP.includes(DiaChiGiaoHang.PhuongXa)) {
          feeList.add(1); 
        } else {
          feeList.add(2); 
        }
        if (totalWeight > StandardWeight) {
          overweightFee =
            Math.ceil(totalWeight - StandardWeight) * InnerOverFee;
        }
      } else {
        if (MienBac.includes(DiaChiGiaoHang.TinhThanh)) {
          feeList.add(3);
        } else if (MienTrung.includes(DiaChiGiaoHang.TinhThanh)) {
          feeList.add(4);
        } else {
          feeList.add(5);
        }
        if (totalWeight > StandardWeight) {
          overweightFee =
            Math.ceil(totalWeight - StandardWeight) * InterprovincialOverFee;
        }
      }
    } else {
      if (hasExtremeBulkyItem) {
        throw new ErrorHandler(
          "Rất tiếc, chúng tôi chưa hỗ trợ vận chuyển quốc tế cho hàng Siêu Cồng Kềnh (>=20kg/món)",
          400,
        );
      }
      feeList.add(9);
      if (totalWeight > 1) {
        overweightFee =
          Math.ceil((totalWeight - 1) / 0.5) * InternationalOverFee;
      }
    }

    wrappingFee =
      countExtremeBulkyItem * ExtremeBulkyFee + countBulkyItem * BulkyFee;

    if(MaPhi ===6){

    }
  } catch (error) {
    console.error("Lỗi tính phí ship:", error);
    throw new ErrorHandler("Lỗi server! Không thể tính phí ship", 500);
  }
};

export default calculateShippingFee;
