import axios from "axios";
import { VariantModel, SystemModel } from "../../models/index.js";
import { Op } from "sequelize";
import ErrorHandler from "../error_handler.js";

const calculateShippingFee = async (
  cartItems,
  address,
  MaPhi,
  totalProductFee,
) => {
  try {
    if (Number(MaPhi) === 3) {
      return {
        success: true,
        data: { baseCost: 0, surcharge: 0, total: 0, ghnDetails: null },
      };
    }

    const rows = await SystemModel.findAll();
    const config = rows.reduce((acc, row) => {
      acc[row.MaCauHinh] = Number(row.GiaTri);
      return acc;
    }, {});

    const variantIds = cartItems.map((item) => item.id || item.MaBienThe);
    const variantsFromDB = await VariantModel.findAll({
      where: { MaBienThe: { [Op.in]: variantIds } },
    });

    const variantMap = {};
    variantsFromDB.forEach((v) => (variantMap[v.MaBienThe] = v));

    let totalWeight = 0;
    let totalSurcharge = 0;

    for (const item of cartItems) {
      const variant = variantMap[item.id || item.MaBienThe];
      if (!variant) continue;

      const quantity = Number(item.soLuong || item.SoLuong);
      const weight = Number(variant.KhoiLuong || 0.5);
      totalWeight += weight * 1000 * quantity;

      const length = Number(variant.ChieuDai || 0);
      const width = Number(variant.ChieuRong || 0);
      const height = Number(variant.ChieuCao || 0);

      const maxLength = Math.max(length, width, height);
      const volume = length * width * height;

      let itemSurcharge = 0;
      if (maxLength >= 100)
        itemSurcharge = config["PHU_PHI_DONG_THUNG_3"] || 500000.0;
      else if (maxLength >= 60)
        itemSurcharge = config["PHU_PHI_DONG_THUNG_2"] || 150000.0;
      else if (maxLength >= 40)
        itemSurcharge = config["PHU_PHI_DONG_THUNG_1"] || 50000.0;
      else {
        if (volume >= 20000)
          itemSurcharge = config["PHU_PHI_BOC_XOP_3"] || 30000.0;
        else if (volume >= 5000)
          itemSurcharge = config["PHU_PHI_BOC_XOP_2"] || 15000.0;
        else itemSurcharge = config["PHU_PHI_BOC_XOP_1"] || 5000.0;
      }
      totalSurcharge += itemSurcharge * quantity;
    }

    const totalInsuranceValue =
      totalProductFee > 5000000 ? 5000000 : totalProductFee;
    let baseShippingCost = 0;
    let ghnDetails = null;

    if (Number(MaPhi) === 2) {
      if (address.ToProvinceID !== 31)
        throw new ErrorHandler(
          "Giao hỏa tốc chỉ áp dụng trong nội thành!",
          400,
        );
      const baseExpressFee = 40000;
      const freeWeightLimit = 3000;
      let extraWeightFee = 0;
      if (totalWeight > freeWeightLimit) {
        extraWeightFee =
          Math.ceil((totalWeight - freeWeightLimit) / 1000) * 10000;
      }
      baseShippingCost = baseExpressFee + extraWeightFee;
    } else if (Number(MaPhi) === 1) {
      const ghnAPI = await axios.post(
        "https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/fee",
        {
          service_type_id: 2,
          from_district_id: 1587,
          from_ward_code: "30308",
          to_district_id: Number(address.ToDistrictID),
          to_ward_code: String(address.ToWardID),
          weight: Math.round(totalWeight) || 1000,
          insurance_value: totalInsuranceValue,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Token: process.env.GHN_API_TOKEN,
            ShopId: process.env.GHN_SHOP_ID,
          },
        },
      );
      baseShippingCost = ghnAPI.data.data.total;
      ghnDetails = ghnAPI.data.data;
    } else {
      throw new ErrorHandler("Loại phí vận chuyển không hợp lệ");
    }

    return {
      success: true,
      data: {
        baseCost: baseShippingCost,
        surcharge: totalSurcharge,
        total: baseShippingCost + totalSurcharge,
        ghnDetails,
      },
    };
  } catch (err) {
    if (err.statusCode) throw err;
    throw new ErrorHandler("Lỗi server! Không thể tính phí vận chuyển", 500);
  }
};

export default calculateShippingFee;
