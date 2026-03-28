let tongKhoiLuong = 0;
    let soLuongCongKenh = 0;
    let soLuongSieuCongKenh = 0;

    cartItems.forEach((item) => {
      const itemTotalWeight = item.KhoiLuong * item.SoLuong;
      tongKhoiLuong += itemTotalWeight;

      if (item.KhoiLuong >= 20) {
        soLuongSieuCongKenh += item.SoLuong;
      } else if (item.KhoiLuong >= 1) {
        soLuongCongKenh += item.SoLuong;
      }
    });

    tongKhoiLuong = Math.ceil(tongKhoiLuong * 2) / 2;

    const maPhi = shippingMethod.MaLoaiPhi;
    let phiCoBan = parseFloat(shippingMethod.GiaTri) || 0;
    let phiVuotTrongLuong = 0;
    let phuPhiDongGoi = 0;
    const mucKgChuan = sysConfig["MUC_KG_TIEU_CHUAN"] || 2;
    phuPhiDongGoi +=
      soLuongSieuCongKenh * (sysConfig["PHU_PHI_SIEU_CONG_KENH"] || 0);
    phuPhiDongGoi += soLuongCongKenh * (sysConfig["PHU_PHI_CONG_KENH"] || 0);

    switch (maPhi) {
      case 1:
      case 2:
        if (tongKhoiLuong > mucKgChuan) {
          phiVuotTrongLuong =
            Math.ceil(tongKhoiLuong - mucKgChuan) *
            (sysConfig["PHI_VUOT_KG_NOI_THANH"] || 0);
        }
        break;

      case 3:
      case 4:
      case 5:
        if (tongKhoiLuong > mucKgChuan) {
          phiVuotTrongLuong =
            Math.ceil(tongKhoiLuong - mucKgChuan) *
            (sysConfig["PHI_VUOT_KG_LIEN_TINH"] || 0);
        }
        break;

      case 6:
        if (
          soLuongSieuCongKenh > 0 ||
          tongKhoiLuong > (sysConfig["KG_THUE_BAN_TAI"] || 30)
        ) {
          phiVuotTrongLuong = sysConfig["PHI_THUE_XE_BAN_TAI"] || 0;
        } else if (tongKhoiLuong > 3) {
          phiVuotTrongLuong =
            Math.ceil(tongKhoiLuong - 3) *
            (sysConfig["PHI_VUOT_KG_HOA_TOC"] || 0);
        }
        break;

      case 7:
        if (tongKhoiLuong > mucKgChuan) {
          phiVuotTrongLuong =
            Math.ceil(tongKhoiLuong - mucKgChuan) *
            ((sysConfig["PHI_VUOT_KG_LIEN_TINH"] || 0) / 2);
        }
        break;

      case 9:
        if (soLuongSieuCongKenh > 0) {
          throw new ErrorHandler(
            "Rất tiếc, chúng tôi chưa hỗ trợ vận chuyển quốc tế cho hàng Siêu Cồng Kềnh (>20kg/món)",
            400,
          );
        }
        if (tongKhoiLuong > 1) {
          const soNac05kg = Math.ceil((tongKhoiLuong - 1) / 0.5);
          phiVuotTrongLuong =
            soNac05kg * (sysConfig["PHI_VUOT_KG_QUOC_TE"] || 200000);
        }
        break;

      case 10:
        phiCoBan = 0;
        phiVuotTrongLuong = 0;
        phuPhiDongGoi = 0;
        break;
    }
    return {
      hopLe: true,
      tongPhiShip: phiCoBan + phiVuotTrongLuong + phuPhiDongGoi,
      chiTiet: {
        tongKhoiLuongTinhPhi: tongKhoiLuong,
        phiCoBan: phiCoBan,
        phiVuotTrongLuong: phiVuotTrongLuong,
        phuPhiDongGoi: phuPhiDongGoi,
      },
    };