import express from "express";
import { pool, CHATBOT_LINKS } from "../config/chatbot.config.js";

const router = express.Router();

router.post("/webhook", async (req, res) => {
  console.log(req.body);
  const intentName = req.body.queryResult.intent.displayName;
  const parameters = req.body.queryResult.parameters;
  
  const domainWeb = CHATBOT_LINKS.domainWeb;
  const zaloLink = CHATBOT_LINKS.zaloLink;
  const emailLink = CHATBOT_LINKS.emailLink;
  const phoneLink = CHATBOT_LINKS.phoneLink;
  const mesLink = CHATBOT_LINKS.mesLink;
  if (intentName === "Hoi_Gia_San_Pham") {
    const rawTenSP = parameters.Ten_San_Pham || null;
    if (!rawTenSP) return res.json({ fulfillmentText: "Bạn muốn xem giá của sản phẩm nào ạ? Cho mình xin tên sản phẩm nhé." });

    let thuocTinhList = parameters.Thuoc_Tinh || [];
    if (!Array.isArray(thuocTinhList)) thuocTinhList = [thuocTinhList];
    const tenSanPham = rawTenSP.trim();

    try {
      let sqlQuery = `
        SELECT bt.MaBienThe, bt.TenBienThe, bt.Gia, bt.SoLuong, MIN(ha.DuongDan) as DuongDan, sp.TenSanPham, sp.MaSanPham
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
          sqlQuery += ` AND bt.TenBienThe LIKE ?`;
          queryParams.push(`%${cleanTT.replace(/\s+/g, "%")}%`);
        }
      });

      sqlQuery += ` GROUP BY bt.MaBienThe, bt.TenBienThe, bt.Gia, bt.SoLuong, sp.TenSanPham, sp.MaSanPham`;
      const [rows] = await pool.execute(sqlQuery, queryParams);

      if (rows.length === 1) {
        const sp = rows[0];
        const giaFormat = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(sp.Gia);
        
        const linkSanPham = `${domainWeb}/product/${sp.MaSanPham}`;

        let cauTraLoi = `Dạ, mẫu ${sp.TenBienThe} hiện đang có giá là ${giaFormat}. `;
        cauTraLoi += sp.SoLuong > 0 ? `Bên em đang sẵn hàng (${sp.SoLuong} bộ) ạ.` : `Tiếc quá, mẫu này đang tạm hết hàng ạ.`;

        let richContentArray = [
          { type: "image", rawUrl: sp.DuongDan || "https://via.placeholder.com/300?text=Chua+co+hinh", accessibilityText: sp.TenBienThe },
          { type: "info", title: sp.TenBienThe, subtitle: `Giá: ${giaFormat} | Tồn kho: ${sp.SoLuong}` }
        ];

        if (sp.SoLuong > 0) {
          richContentArray.push({ type: "button", icon: { type: "shopping_cart", color: "#C06E52" }, text: "Xem chi tiết & Mua ngay", link: linkSanPham });
        }
        return res.json({ fulfillmentText: cauTraLoi, fulfillmentMessages: [{ text: { text: [cauTraLoi] } }, { payload: { richContent: [richContentArray] } }] });
      } else if (rows.length > 1) {
        let danhSachGia = [];
        const linkSanPham = `${domainWeb}/product/${rows[0].MaSanPham}`;

        rows.forEach((r) => {
          const giaFormat = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(r.Gia);
          danhSachGia.push(`🔸 ${r.TenBienThe}: ${giaFormat} ${r.SoLuong > 0 ? "(Sẵn hàng)" : "(Hết hàng)"}`);
        });

        return res.json({
          fulfillmentMessages: [
            { text: { text: [`Dạ mẫu ${rows[0].TenSanPham} có nhiều phân loại với các mức giá khác nhau, em gửi bạn bảng giá tham khảo nhé:`] } },
            { payload: { richContent: [[{ type: "description", title: "💰 Bảng giá chi tiết", text: danhSachGia }, { type: "button", icon: { type: "touch_app", color: "#C06E52" }, text: "Xem chi tiết & Chọn mẫu", link: linkSanPham }]] } }
          ]
        });
      } else {
        return res.json({ fulfillmentText: `Dạ em chưa tìm thấy sản phẩm khớp với yêu cầu của bạn. Bạn kiểm tra lại tên nhé.` });
      }
    } catch (error) {
      return res.json({ fulfillmentText: "Dạ hệ thống CSDL đang bận, bạn vui lòng thử lại sau nhé." });
    }
  } 
  
  else if (intentName === "Tu_Van_Theo_Danh_Muc") {
    let danhMuc = parameters.Danh_Muc_San_Pham || null;
    if (Array.isArray(danhMuc)) danhMuc = danhMuc[0]; 

    if (!danhMuc) return res.json({ fulfillmentText: "Dạ bạn đang quan tâm đến dòng sản phẩm nào ạ?" });

    try {
      let danhMucLower = danhMuc.toLowerCase();
      let searchParam = `%${danhMuc.trim()}%`;
      
      let keywordForLink = danhMuc.trim(); 
      let responsePrefix = `Dạ em gửi bạn tham khảo một số mẫu ${danhMuc} nổi bật bên em nhé:`;

      if (danhMucLower.includes("quà") || danhMucLower.includes("biếu") || danhMucLower.includes("tân gia")) {
        searchParam = "%Bộ ấm trà%";
        keywordForLink = "Bộ ấm trà";
        responsePrefix = `Dạ để làm quà tặng, các mẫu Bộ ấm trà cao cấp bên em là tuyệt vời nhất. Bạn tham khảo nhé:`;
      } else if (danhMucLower.includes("phòng khách") || danhMucLower.includes("decor") || danhMucLower.includes("trang trí")) {
        searchParam = "%Bình hoa%";
        keywordForLink = "Bình hoa";
        responsePrefix = `Dạ để trang trí không gian, các mẫu Bình hoa phong thủy bên em đang rất được săn đón. Em gửi bạn xem thử:`;
      } else if (danhMucLower.includes("bếp") || danhMucLower.includes("nấu") || danhMucLower.includes("ăn")) {
        searchParam = "%Bộ đồ ăn%";
        keywordForLink = "Bộ đồ ăn";
        responsePrefix = `Dạ với không gian bếp, những Bộ bát đĩa gốm sứ an toàn sức khỏe bên em là tuyệt vời nhất ạ. Bạn xem qua nhé:`;
      }

      const sqlQuery = `
        SELECT sp.TenSanPham, sp.MaSanPham, MIN(bt.Gia) as GiaTu, MIN(ha.DuongDan) as DuongDan
        FROM SanPham sp
        JOIN DanhMucSanPham dm ON sp.MaDanhMuc = dm.MaDanhMuc
        LEFT JOIN DanhMucSanPham dm_parent ON dm.ParentID = dm_parent.MaDanhMuc
        JOIN BienTheSanPham bt ON sp.MaSanPham = bt.MaSanPham
        LEFT JOIN HinhAnhBienThe ha ON bt.MaBienThe = ha.MaBienThe
        WHERE (dm.TenDanhMuc LIKE ? OR dm_parent.TenDanhMuc LIKE ? OR sp.TenSanPham LIKE ?) AND sp.TrangThai = 1 AND bt.TrangThai = 1
        GROUP BY sp.MaSanPham, sp.TenSanPham
        LIMIT 3
      `;

      const [rows] = await pool.execute(sqlQuery, [searchParam, searchParam, searchParam]);

      if (rows.length > 0) {
        let listRichContent = [];
        
        rows.forEach((sp) => {
          const giaFormat = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(sp.GiaTu);
          const linkSanPham = `${domainWeb}/product/${sp.MaSanPham}`;
          listRichContent.push([
            { type: "image", rawUrl: sp.DuongDan || "https://via.placeholder.com/300", accessibilityText: sp.TenSanPham },
            { type: "info", title: sp.TenSanPham, subtitle: `Giá tham khảo từ: ${giaFormat}` },
            { type: "button", icon: { type: "touch_app", color: "#C06E52" }, text: "Xem chi tiết", link: linkSanPham },
          ]);
        });

        const linkXemThem = `${domainWeb}?search=${encodeURIComponent(keywordForLink)}`;
        listRichContent.push([
          { type: "info", title: `Khám phá thêm`, subtitle: `Xem toàn bộ sản phẩm thuộc danh mục ${keywordForLink}` },
          { type: "button", icon: { type: "storefront", color: "#34A853" }, text: "Xem tất cả", link: linkXemThem }
        ]);

        return res.json({ fulfillmentMessages: [{ text: { text: [responsePrefix] } }, { payload: { richContent: listRichContent } }] });
      } else {
        return res.json({ fulfillmentText: `Dạ dòng sản phẩm ${danhMuc} bên em đang cập nhật mẫu mới.` });
      }
    } catch (error) {
      return res.json({ fulfillmentText: "Dạ hệ thống đang tải danh mục, bạn chờ chút xíu nhé." });
    }
  }
  
  else if (intentName === "Hoi_Tinh_Trang_Ton_Kho") {
    const rawTenSP = parameters.Ten_San_Pham || null;
    if (!rawTenSP) return res.json({ fulfillmentText: "Dạ bạn muốn kiểm tra tồn kho của sản phẩm nào ạ?" });
    const tenSanPham = rawTenSP.trim();

    try {
      let sqlQuery = `
        SELECT bt.TenBienThe, bt.SoLuong, sp.TenSanPham, sp.MaSanPham
        FROM BienTheSanPham bt
        JOIN SanPham sp ON bt.MaSanPham = sp.MaSanPham
        WHERE sp.TenSanPham LIKE ? AND bt.TrangThai = 1
      `;
      const [rows] = await pool.execute(sqlQuery, [`%${tenSanPham.replace(/\s+/g, "%")}%`]);

      if (rows.length === 1) {
        const sp = rows[0];
        const linkSanPham = `${domainWeb}/product/${sp.MaSanPham}`;

        if (sp.SoLuong > 0) {
          return res.json({
            fulfillmentMessages: [
              { text: { text: [`Mẫu ${sp.TenBienThe} hiện đang có sẵn ${sp.SoLuong} sản phẩm tại kho.`] } },
              { payload: { richContent: [[{ type: "info", title: sp.TenBienThe, subtitle: "Sẵn sàng giao" }, { type: "button", icon: { type: "shopping_cart", color: "#C06E52" }, text: "Mua ngay", link: linkSanPham }]] } }
            ]
          });
        }
      } else if (rows.length > 1) {
        const linkSanPham = `${domainWeb}/product/${rows[0].MaSanPham}`;
        let danhSachTonKho = rows.map(r => `🔸 ${r.TenBienThe}: ${r.SoLuong > 0 ? `Còn ${r.SoLuong} bộ` : "Tạm hết"}`);

        return res.json({
          fulfillmentMessages: [
            { text: { text: [`Dạ mẫu ${rows[0].TenSanPham} bên em đang có các phân loại sau:`] } },
            { payload: { richContent: [[{ type: "description", title: "📦 Kho hàng", text: danhSachTonKho }, { type: "button", icon: { type: "touch_app", color: "#C06E52" }, text: "Tới trang mua", link: linkSanPham }]] } }
          ]
        });
      } else {
        return res.json({ fulfillmentText: `Dạ em chưa tìm thấy mã sản phẩm này trong kho.` });
      }
    } catch (error) {
      return res.json({ fulfillmentText: "Dạ hệ thống kho đang bận, bạn đợi chút nhé." });
    }
  }

  else if (intentName === "Tu_Van_Theo_Ngan_Sach") {
    let nganSach = 500000;

    try {
      let sqlQuery = `
        SELECT sp.TenSanPham, sp.MaSanPham, MIN(bt.Gia) as GiaTu, MIN(ha.DuongDan) as DuongDan
        FROM SanPham sp
        JOIN BienTheSanPham bt ON sp.MaSanPham = bt.MaSanPham
        LEFT JOIN HinhAnhBienThe ha ON bt.MaBienThe = ha.MaBienThe
        WHERE sp.TrangThai = 1 AND bt.TrangThai = 1 AND bt.Gia <= ?
        GROUP BY sp.MaSanPham, sp.TenSanPham ORDER BY GiaTu DESC LIMIT 3
      `;
      const [rows] = await pool.execute(sqlQuery, [nganSach]);

      if (rows.length > 0) {
        let richContentData = rows.map((sp) => {
          const giaFormat = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(sp.GiaTu);
          const linkSanPham = `${domainWeb}/product/${sp.MaSanPham}`;
          return [
            { type: "image", rawUrl: sp.DuongDan || "https://via.placeholder.com/300", accessibilityText: sp.TenSanPham },
            { type: "info", title: sp.TenSanPham, subtitle: `Giá: ${giaFormat}` },
            { type: "button", icon: { type: "touch_app", color: "#C06E52" }, text: "Xem chi tiết", link: linkSanPham }
          ];
        });
        return res.json({ fulfillmentMessages: [{ text: { text: [`Dạ các mẫu phù hợp ngân sách đây ạ:`] } }, { payload: { richContent: richContentData } }] });
      }
    } catch (error) {
      return res.json({ fulfillmentText: "Dạ hệ thống đang tải, bạn chờ xíu nhé." });
    }
  }

  else if (intentName === "San_Pham_Pho_Bien") {
    try {
      const sqlQuery = `
        SELECT sp.TenSanPham, sp.MaSanPham, sp.LuotXem, MIN(bt.Gia) as GiaTu, MIN(ha.DuongDan) as DuongDan
        FROM SanPham sp
        JOIN BienTheSanPham bt ON sp.MaSanPham = bt.MaSanPham
        LEFT JOIN HinhAnhBienThe ha ON bt.MaBienThe = ha.MaBienThe
        WHERE sp.TrangThai = 1 AND bt.TrangThai = 1
        GROUP BY sp.MaSanPham, sp.TenSanPham, sp.LuotXem ORDER BY sp.LuotXem DESC LIMIT 3
      `;
      const [rows] = await pool.execute(sqlQuery);

      if (rows.length > 0) {
        let listRichContent = rows.map((sp) => {
          const giaFormat = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(sp.GiaTu);
          const linkSanPham = `${domainWeb}/product/${sp.MaSanPham}`;
          return [
            { type: "image", rawUrl: sp.DuongDan || "https://via.placeholder.com/300", accessibilityText: sp.TenSanPham },
            { type: "info", title: sp.TenSanPham, subtitle: `Giá từ: ${giaFormat}` },
            { type: "button", icon: { type: "local_fire_department", color: "#FF5722" }, text: "Xem chi tiết", link: linkSanPham }
          ];
        });
        return res.json({ fulfillmentMessages: [{ text: { text: ["Các mẫu Hot nhất bên em:"] } }, { payload: { richContent: listRichContent } }] });
      }
    } catch (error) {
      return res.json({ fulfillmentText: "Dạ hệ thống đang tải dữ liệu sản phẩm..." });
    }
  }

  else if (intentName === "Xem_Tat_Ca_San_Pham") {
    return res.json({
      fulfillmentMessages: [
        { text: { text: ["Mời bạn ghé thăm gian hàng trực tuyến của bên em nhé ạ:"] } },
        { payload: { richContent: [[
          { type: "button", icon: { type: "storefront", color: "#34A853" }, text: "Đi tới Gian hàng", link: domainWeb },
          { type: "button", icon: { type: "local_fire_department", color: "#FF5722" }, text: "Sản phẩm mới", link: domainWeb }
        ]]}}
      ]
    });
  }
  
  return res.json({ fulfillmentText: "Dạ hệ thống đang kiểm tra thông tin này..." });
});

export default router;