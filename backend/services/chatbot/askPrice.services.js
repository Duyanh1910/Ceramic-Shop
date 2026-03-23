import { sequelize } from "../../models/index.js";
import { QueryTypes } from "sequelize";
import { CHATBOT_LINKS } from "../../config/chatbot.config.js";

export const askPriceService = async (parameters) => {
  const rawTenSP = parameters.Ten_San_Pham || null;
  if (!rawTenSP) {
    return {
      fulfillmentText:
        "Bạn muốn xem giá của sản phẩm nào ạ? Cho mình xin tên sản phẩm nhé.",
    };
  }

  let thuocTinhList = parameters.Thuoc_Tinh || [];
  if (!Array.isArray(thuocTinhList)) {
    thuocTinhList = [thuocTinhList];
  }
  const tenSanPham = rawTenSP.trim();

  try {
    let sqlQuery = `
            SELECT DISTINCT bt.TenBienThe, bt.Gia, bt.SoLuong, ha.DuongDan, sp.TenSanPham
            FROM BienTheSanPham bt
            JOIN SanPham sp ON bt.MaSanPham = sp.MaSanPham
            LEFT JOIN HinhAnhBienThe ha ON bt.MaBienThe = ha.MaBienThe
            WHERE sp.TenSanPham LIKE ? AND bt.TrangThai = 1
        `;

    const searchTenSP = `%${tenSanPham.replace(/\s+/g, "%")}%`;
    let queryParams = [searchTenSP];
    thuocTinhList.forEach((tt) => {
      let cleanTT = tt.replace(/màu/gi, "").replace(/cm/gi, " cm").trim();
      if (cleanTT) {
        const searchTT = `%${cleanTT.replace(/\s+/g, "%")}%`;
        sqlQuery += ` AND bt.TenBienThe LIKE ?`;
        queryParams.push(searchTT);
      }
    });

    const rows = await sequelize.query(sqlQuery, {
      replacements: queryParams,
      type: QueryTypes.SELECT,
    });
    if (rows.length === 1) {
      const sp = rows[0];
      const giaFormat = new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(sp.Gia);
      const linkSanPham = `${CHATBOT_LINKS.domainWeb}?name=${encodeURIComponent(sp.TenSanPham)}`;

      let cauTraLoi = `Dạ, mẫu ${sp.TenBienThe} hiện đang có giá là ${giaFormat}. `;
      cauTraLoi +=
        sp.SoLuong > 0
          ? `Bên em đang sẵn hàng (${sp.SoLuong} bộ) ạ.`
          : `Tiếc quá, mẫu này đang tạm hết hàng ạ.`;

      let richContentArray = [
        {
          type: "image",
          rawUrl:
            sp.DuongDan || "https://via.placeholder.com/300?text=Chua+co+hinh",
          accessibilityText: sp.TenBienThe,
        },
        {
          type: "info",
          title: sp.TenBienThe,
          subtitle: `Giá: ${giaFormat} | Tồn kho: ${sp.SoLuong}`,
        },
      ];

      if (sp.SoLuong > 0) {
        richContentArray.push({
          type: "button",
          icon: { type: "shopping_cart", color: "#C06E52" },
          text: "Xem chi tiết & Mua ngay",
          link: linkSanPham,
        });
      }

      return {
        fulfillmentText: cauTraLoi,
        fulfillmentMessages: [
          { text: { text: [cauTraLoi] } },
          { payload: { richContent: [richContentArray] } },
        ],
      };
    } else if (rows.length > 1) {
      let danhSachGia = [];
      const linkSanPham = `${CHATBOT_LINKS.domainWeb}?name=${encodeURIComponent(rows[0].TenSanPham)}`;

      rows.forEach((r) => {
        const giaFormat = new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(r.Gia);
        let trangThai = r.SoLuong > 0 ? "(Sẵn hàng)" : "(Hết hàng)";
        danhSachGia.push(`🔸 ${r.TenBienThe}: ${giaFormat} ${trangThai}`);
      });

      const cauTraLoi = `Dạ mẫu ${rows[0].TenSanPham} có nhiều phân loại với các mức giá khác nhau, em gửi anh/chị bảng giá tham khảo nhé:`;

      return {
        fulfillmentText: cauTraLoi,
        fulfillmentMessages: [
          { text: { text: [cauTraLoi] } },
          {
            payload: {
              richContent: [
                [
                  {
                    type: "description",
                    title: "💰 Bảng giá chi tiết",
                    text: danhSachGia,
                  },
                  {
                    type: "button",
                    icon: { type: "touch_app", color: "#C06E52" },
                    text: "Xem chi tiết & Chọn mẫu",
                    link: linkSanPham,
                  },
                ],
              ],
            },
          },
        ],
      };
    } else {
      return {
        fulfillmentText: `Dạ em chưa tìm thấy sản phẩm khớp với yêu cầu của bạn trong kho. Bạn kiểm tra lại tên giúp em nhé.`,
      };
    }
  } catch (error) {
    console.error("Lỗi tại hoiGiaSanPhamService:", error);
    return {
      fulfillmentText:
        "Dạ hệ thống tra cứu giá đang bận một chút, bạn vui lòng thử lại sau nhé.",
    };
  }
};
