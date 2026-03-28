import express from "express";
import { pool, CHATBOT_LINKS } from "../config/chatbot.config.js";

const router = express.Router();

router.post("/webhook", async (req, res) => {
  const intentName = req.body.queryResult.intent.displayName;
  const parameters = req.body.queryResult.parameters;

  const domainWeb = CHATBOT_LINKS.domainWeb;
  const zaloLink = CHATBOT_LINKS.zaloLink;
  const emailLink = CHATBOT_LINKS.emailLink;
  const phoneLink = CHATBOT_LINKS.phoneLink;
  const fbLink = CHATBOT_LINKS.fbLink;

  if (intentName === "Hoi_Gia_San_Pham") {
    const rawTenSP = parameters.Ten_San_Pham || null;

    if (!rawTenSP) {
      return res.json({
        fulfillmentText:
          "Bạn muốn xem giá của sản phẩm nào ạ? Cho mình xin tên sản phẩm nhé.",
      });
    }

    let thuocTinhList = parameters.Thuoc_Tinh || [];
    if (!Array.isArray(thuocTinhList)) {
      thuocTinhList = [thuocTinhList];
    }

    const tenSanPham = rawTenSP.trim();

    try {
      let sqlQuery = `
                SELECT sp.MaSanPham, bt.MaBienThe, bt.TenBienThe, bt.Gia, bt.SoLuong, MIN(ha.DuongDan) as DuongDan, sp.TenSanPham
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

      sqlQuery += ` GROUP BY sp.MaSanPham, bt.MaBienThe, bt.TenBienThe, bt.Gia, bt.SoLuong, sp.TenSanPham`;

      const [rows] = await pool.execute(sqlQuery, queryParams);

      if (rows.length === 1) {
        const sp = rows[0];
        const giaFormat = new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(sp.Gia);
        const linkSanPham = `${domainWeb}/product/${sp.MaSanPham}`;

        let cauTraLoi = `Dạ, mẫu ${sp.TenBienThe} hiện đang có giá là ${giaFormat}. `;
        if (sp.SoLuong > 0) {
          cauTraLoi += `Bên em đang sẵn hàng (${sp.SoLuong} bộ) ạ.`;
        } else {
          cauTraLoi += `Tiếc quá, mẫu này đang tạm hết hàng ạ.`;
        }

        let richContentArray = [
          {
            type: "image",
            rawUrl:
              sp.DuongDan ||
              "https://via.placeholder.com/300?text=Chua+co+hinh",
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

        return res.json({
          fulfillmentText: cauTraLoi,
          fulfillmentMessages: [
            { text: { text: [cauTraLoi] } },
            { payload: { richContent: [richContentArray] } },
          ],
        });
      } else if (rows.length > 1) {
        let danhSachGia = [];
        const linkSanPham = `${domainWeb}/product/${rows[0].MaSanPham}`;

        rows.forEach((r) => {
          const giaFormat = new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(r.Gia);
          let trangThai = r.SoLuong > 0 ? "(Sẵn hàng)" : "(Hết hàng)";
          danhSachGia.push(`🔸 ${r.TenBienThe}: ${giaFormat} ${trangThai}`);
        });

        return res.json({
          fulfillmentMessages: [
            {
              text: {
                text: [
                  `Dạ mẫu ${rows[0].TenSanPham} có nhiều phân loại với các mức giá khác nhau, em gửi bạn bảng giá tham khảo nhé:`,
                ],
              },
            },
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
        });
      } else {
        return res.json({
          fulfillmentText: `Dạ em chưa tìm thấy sản phẩm khớp với yêu cầu của bạn trong kho. Bạn kiểm tra lại tên giúp em nhé.`,
        });
      }
    } catch (error) {
      console.error(error);
      return res.json({
        fulfillmentText:
          "Dạ hệ thống CSDL đang bận, bạn vui lòng thử lại sau nhé.",
      });
    }
  } else if (intentName === "Tra_Cuu_Don_Hang") {
    const maDonHang = parameters.ma_don_hang || null;

    if (!maDonHang) {
      return res.json({
        fulfillmentText:
          "Dạ, bạn vui lòng cho mình xin mã đơn hàng để mình kiểm tra nhé.",
      });
    }

    let cleanMaDon = maDonHang
      .toString()
      .replace(/số|mã|so|ma|đơn|don/gi, "")
      .trim();

    if (/[a-zA-Z]/.test(cleanMaDon)) {
      const errText = `Dạ "${maDonHang}" có vẻ là Mã vận đơn của bên giao hàng rồi ạ. Để em tra cứu được hệ thống, bạn vui lòng cung cấp "Mã đơn hàng" của CeramicShop (chỉ bao gồm các con số, ví dụ: 1024) nhé!`;
      return res.json({
        fulfillmentMessages: [{ text: { text: [errText] } }],
      });
    }

    const maDonReal = cleanMaDon.replace(/\D/g, "");

    try {
      const sqlQuery =
        "SELECT TrangThaiDonHang, NgayDat, TongThanhToan FROM DonHang WHERE MaDonHang = ?";
      const [rows] = await pool.execute(sqlQuery, [maDonReal]);

      if (rows.length > 0) {
        const donHang = rows[0];
        const trangThaiCode = donHang.TrangThaiDonHang;
        let trangThaiText = "";

        switch (trangThaiCode) {
          case 0:
            trangThaiText = "⏳ Đang chờ shop xác nhận";
            break;
          case 1:
            trangThaiText = "📦 Đã xác nhận & Đang chuẩn bị hàng";
            break;
          case 2:
            trangThaiText = "🚚 Đang giao cho đơn vị vận chuyển";
            break;
          case 3:
            trangThaiText = "✅ Đã giao hàng thành công";
            break;
          case 4:
            trangThaiText = "❌ Đã bị hủy";
            break;
          default:
            trangThaiText = "Đang được xử lý";
        }

        const ngayDat = new Date(donHang.NgayDat).toLocaleDateString("vi-VN");
        const tongTien = new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(donHang.TongThanhToan);

        let displayInfo = [
          `• Ngày đặt: ${ngayDat}`,
          `• Tổng hóa đơn: ${tongTien}`,
          `• Trạng thái: ${trangThaiText}`,
        ];

        return res.json({
          fulfillmentMessages: [
            {
              text: {
                text: [
                  `Dạ, em gửi bạn thông tự tra cứu của đơn hàng #${maDonReal} ạ:`,
                ],
              },
            },
            {
              payload: {
                richContent: [
                  [
                    {
                      type: "info",
                      title: `Đơn hàng #${maDonReal}`,
                      subtitle: "Trạng thái vận chuyển",
                    },
                    {
                      type: "description",
                      title: "",
                      text: displayInfo,
                    },
                  ],
                ],
              },
            },
          ],
        });
      } else {
        return res.json({
          fulfillmentText: `Dạ em không tìm thấy thông tin của đơn hàng số ${maDonReal}. Bạn vui lòng kiểm tra lại mã giúp em nhé.`,
        });
      }
    } catch (error) {
      console.error(error);
      return res.json({
        fulfillmentText:
          "Hệ thống đang bảo trì, bạn vui lòng tra cứu lại sau nhé.",
      });
    }
  } else if (intentName === "Hoi_Khuyen_Mai") {
    try {
      const sqlQuery = `
                SELECT TenKhuyenMai, GiaTri, GiaTriToiThieu, NgayKetThuc 
                FROM KhuyenMai 
                WHERE TrangThai = 1 AND NgayKetThuc >= NOW()
                ORDER BY NgayKetThuc ASC
            `;
      const [rows] = await pool.execute(sqlQuery);

      if (rows.length > 0) {
        let textArray = [
          "Dạ, hiện tại cửa hàng đang có các chương trình ưu đãi cực kỳ hấp dẫn sau ạ:",
        ];

        rows.forEach((km, index) => {
          const ngayKT = new Date(km.NgayKetThuc).toLocaleDateString("vi-VN");
          let giaTriKM = km.GiaTri;

          if (giaTriKM <= 100) {
            giaTriKM = parseFloat(giaTriKM) + "%";
          } else {
            giaTriKM = new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(giaTriKM);
          }

          const toiThieu = new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(km.GiaTriToiThieu);

          textArray.push(
            `🎁 ${index + 1}. ${km.TenKhuyenMai}: Giảm ${giaTriKM} (Áp dụng đơn từ ${toiThieu}) - Hạn: ${ngayKT}.`,
          );
        });

        textArray.push("Bạn nhanh tay chốt đơn để được áp dụng ưu đãi nhé! 🥰");

        return res.json({
          fulfillmentMessages: [
            {
              payload: {
                richContent: [
                  [
                    {
                      type: "description",
                      title: "🎉 Chương trình Khuyến Mãi",
                      text: textArray,
                    },
                  ],
                ],
              },
            },
          ],
        });
      } else {
        return res.json({
          fulfillmentText:
            "Dạ, tiếc quá hiện tại các chương trình khuyến mãi của shop vừa mới kết thúc. Bạn theo dõi để cập nhật đợt sale sắp tới nha!",
        });
      }
    } catch (error) {
      console.error(error);
      return res.json({
        fulfillmentText:
          "Dạ hệ thống kiểm tra khuyến mãi đang bận một chút, bạn thử lại sau ít phút nhé.",
      });
    }
  } else if (intentName === "Tu_Van_Theo_Danh_Muc") {
    let danhMuc = parameters.Danh_Muc_San_Pham || null;

    if (!danhMuc) {
      return res.json({
        fulfillmentText:
          "Dạ bạn đang quan tâm đến dòng sản phẩm nào ạ? (Ví dụ: Đồ phòng bếp, Đồ thờ, hay tìm Quà tặng tân gia...)",
      });
    }

    try {
      let danhMucLower = danhMuc.toLowerCase();
      let searchParam = `%${danhMuc.trim()}%`;
      let responsePrefix = `Dạ em gửi bạn tham khảo một số mẫu ${danhMuc} nổi bật bên em nhé:`;

      if (
        danhMucLower.includes("quà") ||
        danhMucLower.includes("biếu") ||
        danhMucLower.includes("tân gia")
      ) {
        searchParam = "%Bộ ấm trà%";
        responsePrefix = `Dạ để làm quà tặng , các mẫu Bộ ấm trà cao cấp bên em là lựa chọn sang trọng và ý nghĩa nhất ạ. Bạn tham khảo nhé:`;
      } else if (
        danhMucLower.includes("phòng khách") ||
        danhMucLower.includes("decor") ||
        danhMucLower.includes("trang trí")
      ) {
        searchParam = "%Bình hoa%";
        responsePrefix = `Dạ để trang trí không gian phòng khách, các mẫu bình hoa phong thủy bên em đang rất được săn đón. Em gửi bạn xem thử nhé:`;
      } else if (
        danhMucLower.includes("bếp") ||
        danhMucLower.includes("nấu") ||
        danhMucLower.includes("ăn")
      ) {
        searchParam = "%Bộ đồ ăn%";
        responsePrefix = `Dạ với không gian bếp, những bộ bát đĩa gốm sứ cao cấp, an toàn sức khỏe bên em là tuyệt vời nhất ạ. Bạn xem qua nhé:`;
      }

      const sqlQuery = `
                SELECT sp.MaSanPham, sp.TenSanPham, MIN(bt.Gia) as GiaTu, MIN(ha.DuongDan) as DuongDan
                FROM SanPham sp
                JOIN DanhMucSanPham dm ON sp.MaDanhMuc = dm.MaDanhMuc
                LEFT JOIN DanhMucSanPham dm_parent ON dm.ParentID = dm_parent.MaDanhMuc
                JOIN BienTheSanPham bt ON sp.MaSanPham = bt.MaSanPham
                LEFT JOIN HinhAnhBienThe ha ON bt.MaBienThe = ha.MaBienThe
                WHERE (dm.TenDanhMuc LIKE ? OR dm_parent.TenDanhMuc LIKE ? OR sp.TenSanPham LIKE ?) 
                  AND sp.TrangThai = 1 AND bt.TrangThai = 1
                GROUP BY sp.MaSanPham, sp.TenSanPham
                LIMIT 3
            `;

      const [rows] = await pool.execute(sqlQuery, [
        searchParam,
        searchParam,
        searchParam,
      ]);

      if (rows.length > 0) {
        let listRichContent = [];

        rows.forEach((sp) => {
          const giaFormat = new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(sp.GiaTu);
          const linkSanPham = `${domainWeb}/product/${sp.MaSanPham}`;

          listRichContent.push([
            {
              type: "image",
              rawUrl:
                sp.DuongDan ||
                "https://via.placeholder.com/300?text=Chua+co+hinh",
              accessibilityText: sp.TenSanPham,
            },
            {
              type: "info",
              title: sp.TenSanPham,
              subtitle: `Giá tham khảo từ: ${giaFormat}`,
            },
            {
              type: "button",
              icon: { type: "touch_app", color: "#C06E52" },
              text: "Xem chi tiết",
              link: linkSanPham,
            },
          ]);
        });

        const linkSearch = `${domainWeb}?search=${encodeURIComponent(danhMuc.trim())}`;
        listRichContent.push([
          {
            type: "button",
            icon: { type: "search", color: "#34A853" },
            text: `Xem tất cả ${danhMuc}`,
            link: linkSearch,
          },
        ]);

        return res.json({
          fulfillmentMessages: [
            { text: { text: [responsePrefix] } },
            { payload: { richContent: listRichContent } },
          ],
        });
      } else {
        return res.json({
          fulfillmentText: `Dạ hiện tại dòng sản phẩm ${danhMuc} bên em đang cập nhật thêm mẫu mới. Bạn tham khảo các danh mục khác giúp em nhé.`,
        });
      }
    } catch (error) {
      console.error(error);
      return res.json({
        fulfillmentText: "Dạ hệ thống đang tải danh mục, bạn chờ chút xíu nhé.",
      });
    }
  } else if (intentName === "Hoi_Tinh_Trang_Ton_Kho") {
    const rawTenSP = parameters.Ten_San_Pham || null;

    if (!rawTenSP) {
      return res.json({
        fulfillmentText: "Dạ bạn muốn kiểm tra tồn kho của sản phẩm nào ạ?",
      });
    }

    let thuocTinhList = parameters.Thuoc_Tinh || [];
    if (!Array.isArray(thuocTinhList)) {
      thuocTinhList = [thuocTinhList];
    }

    const tenSanPham = rawTenSP.trim();

    try {
      let sqlQuery = `
                SELECT sp.MaSanPham, bt.TenBienThe, bt.SoLuong, sp.TenSanPham 
                FROM BienTheSanPham bt
                JOIN SanPham sp ON bt.MaSanPham = sp.MaSanPham
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

      const [rows] = await pool.execute(sqlQuery, queryParams);

      if (rows.length === 1) {
        const sp = rows[0];
        const linkSanPham = `${domainWeb}/product/${sp.MaSanPham}`;

        if (sp.SoLuong > 0) {
          return res.json({
            fulfillmentMessages: [
              {
                text: {
                  text: [
                    `Tin vui cho bạn! Mẫu ${sp.TenBienThe} hiện đang có sẵn ${sp.SoLuong} sản phẩm tại kho.`,
                  ],
                },
              },
              {
                payload: {
                  richContent: [
                    [
                      {
                        type: "info",
                        title: sp.TenBienThe,
                        subtitle: "Trạng thái: Còn hàng - Sẵn sàng giao",
                      },
                      {
                        type: "button",
                        icon: { type: "shopping_cart", color: "#C06E52" },
                        text: "Xem chi tiết & Mua ngay",
                        link: linkSanPham,
                      },
                    ],
                  ],
                },
              },
            ],
          });
        } else {
          return res.json({
            fulfillmentText: `Dạ tiếc quá, mẫu ${sp.TenBienThe} hiện đang tạm hết hàng. Bạn tham khảo sang các mẫu khác hoặc để lại SĐT khi nào hàng về em báo nhé!`,
          });
        }
      } else if (rows.length > 1) {
        let danhSachTonKho = [];
        const linkSanPham = `${domainWeb}/product/${rows[0].MaSanPham}`;

        rows.forEach((r) => {
          let trangThai =
            r.SoLuong > 0 ? `Còn ${r.SoLuong} bộ` : "Tạm hết hàng";
          danhSachTonKho.push(`🔸 ${r.TenBienThe}: ${trangThai}`);
        });

        return res.json({
          fulfillmentMessages: [
            {
              text: {
                text: [
                  `Dạ mẫu ${rows[0].TenSanPham} bên em đang có các phân loại sau:`,
                ],
              },
            },
            {
              payload: {
                richContent: [
                  [
                    {
                      type: "description",
                      title: "📦 Trạng thái kho hàng",
                      text: danhSachTonKho,
                    },
                    {
                      type: "button",
                      icon: { type: "touch_app", color: "#C06E52" },
                      text: "Tới trang chọn phân loại & Mua",
                      link: linkSanPham,
                    },
                  ],
                ],
              },
            },
          ],
        });
      } else {
        return res.json({
          fulfillmentText: `Dạ em chưa tìm thấy mã sản phẩm này trong hệ thống kho. Bạn kiểm tra lại tên giúp em nhé.`,
        });
      }
    } catch (error) {
      console.error(error);
      return res.json({
        fulfillmentText:
          "Dạ hệ thống kho đang bận cập nhật dữ liệu, bạn vui lòng đợi chút rồi hỏi lại em nha.",
      });
    }
  } else if (intentName === "Kiem_Tra_Bao_Hanh_Don_Hang") {
    const maDonHang = parameters.ma_don_hang || null;

    if (!maDonHang) {
      return res.json({
        fulfillmentText:
          "Dạ bạn cho mình xin mã đơn hàng (ví dụ: 1024) để kiểm tra bảo hành nhé.",
      });
    }

    let cleanMaDon = maDonHang
      .toString()
      .replace(/số|mã|so|ma|đơn|don/gi, "")
      .trim();

    if (/[a-zA-Z]/.test(cleanMaDon)) {
      const errText = `Dạ "${maDonHang}" có vẻ là Mã vận đơn của bên giao hàng rồi ạ. Để em tra cứu được hệ thống, bạn vui lòng cung cấp "Mã đơn hàng" của CeramicShop (chỉ bao gồm các con số, ví dụ: 1024) nhé!`;
      return res.json({
        fulfillmentMessages: [{ text: { text: [errText] } }],
      });
    }

    const maDonReal = cleanMaDon.replace(/\D/g, "");

    try {
      const sqlQuery = `
                SELECT sp.TenSanPham, bt.TenBienThe, bh.NgayKetThuc, bh.TrangThai
                FROM DonHang dh
                JOIN ChiTietDonHang ctdh ON dh.MaDonHang = ctdh.MaDonHang
                JOIN BienTheSanPham bt ON ctdh.MaBienThe = bt.MaBienThe
                JOIN SanPham sp ON bt.MaSanPham = sp.MaSanPham
                JOIN BaoHanh bh ON ctdh.MaCTDH = bh.MaCTDH
                WHERE dh.MaDonHang = ?
            `;

      const [rows] = await pool.execute(sqlQuery, [maDonReal]);

      if (rows.length > 0) {
        let textArray = [];
        const currentDate = new Date();

        rows.forEach((item) => {
          const ngayKT = new Date(item.NgayKetThuc);
          const ngayKTStr = ngayKT.toLocaleDateString("vi-VN");
          let statusStr = "";

          if (item.TrangThai === 1 && ngayKT >= currentDate) {
            statusStr = "✅ Còn hạn bảo hành";
          } else {
            statusStr = "❌ Hết hạn";
          }

          textArray.push(
            `🔸 ${item.TenSanPham} (${item.TenBienThe})\n   Hạn: ${ngayKTStr} - ${statusStr}`,
          );
        });

        return res.json({
          fulfillmentMessages: [
            {
              text: {
                text: [
                  `Dạ đây là thông bảo hành các sản phẩm thuộc đơn hàng #${maDonReal}:`,
                ],
              },
            },
            {
              payload: {
                richContent: [
                  [
                    {
                      type: "description",
                      title: "🛡️ Trạng thái bảo hành",
                      text: textArray,
                    },
                  ],
                ],
              },
            },
          ],
        });
      } else {
        return res.json({
          fulfillmentText: `Dạ em không tìm thấy gói bảo hành nào cho đơn hàng số ${maDonReal}. Với các lỗi nứt vỡ do vận chuyển, shop áp dụng chính sách đổi trả ngay lúc nhận hàng. Bạn cần hỗ trợ thêm gì không ạ?`,
        });
      }
    } catch (error) {
      console.error(error);
      return res.json({
        fulfillmentText:
          "Dạ hệ thống kiểm tra bảo hành đang bận, bạn vui lòng thử lại sau nhé.",
      });
    }
  } else if (intentName === "Yeu_Cau_Huy_Don_Hang") {
    const maDonHang = parameters.ma_don_hang || null;

    if (!maDonHang) {
      return res.json({
        fulfillmentText:
          "Dạ bạn cho mình xin mã đơn hàng (ví dụ: 1024) để tiến hành hủy nhé.",
      });
    }

    let cleanMaDon = maDonHang
      .toString()
      .replace(/số|mã|so|ma|đơn|don/gi, "")
      .trim();

    if (/[a-zA-Z]/.test(cleanMaDon)) {
      const errText = `Dạ "${maDonHang}" có vẻ là Mã vận đơn của bên giao hàng rồi ạ. Để em xử lý được trên hệ thống, bạn vui lòng cung cấp "Mã đơn hàng" của CeramicShop (chỉ bao gồm các con số, ví dụ: 1024) nhé!`;
      return res.json({
        fulfillmentMessages: [{ text: { text: [errText] } }],
      });
    }

    const maDonReal = cleanMaDon.replace(/\D/g, "");

    try {
      const checkQuery =
        "SELECT TrangThaiDonHang FROM DonHang WHERE MaDonHang = ?";
      const [rows] = await pool.execute(checkQuery, [maDonReal]);

      if (rows.length > 0) {
        const trangThai = rows[0].TrangThaiDonHang;

        if (trangThai === 0) {
          const updateQuery =
            "UPDATE DonHang SET TrangThaiDonHang = 4 WHERE MaDonHang = ?";
          await pool.execute(updateQuery, [maDonReal]);
          return res.json({
            fulfillmentText: `✅ Dạ thành công! Đơn hàng số ${maDonReal} của bạn đã được hủy trên hệ thống.`,
          });
        } else if (trangThai === 4) {
          return res.json({
            fulfillmentText: `Dạ đơn hàng số ${maDonReal} này đã được hủy từ trước rồi ạ.`,
          });
        } else {
          const errText = `❌ Dạ rất tiếc, đơn hàng ${maDonReal} đã được xác nhận và đang trong quá trình xử lý/giao hàng nên không thể hủy tự động. Bạn vui lòng liên hệ CSKH để được hỗ trợ nhé.`;
          return res.json({
            fulfillmentMessages: [
              { text: { text: [errText] } },
              {
                payload: {
                  richContent: [
                    [
                      {
                        type: "button",
                        icon: { type: "phone", color: "#34A853" },
                        text: "Gọi điện khẩn cấp",
                        link: phoneLink,
                      },
                      {
                        type: "button",
                        icon: { type: "chat", color: "#0068FF" },
                        text: "Hỗ trợ hủy đơn qua Zalo",
                        link: zaloLink,
                      },
                      {
                        type: "button",
                        icon: { type: "facebook", color: "#0866FF" },
                        text: "Hỗ trợ qua Fanpage Facebook",
                        link: fbLink,
                      },
                      {
                        type: "button",
                        icon: { type: "mail", color: "#EA4335" },
                        text: "Gửi Email yêu cầu hủy",
                        link: emailLink,
                      },
                    ],
                  ],
                },
              },
            ],
          });
        }
      } else {
        return res.json({
          fulfillmentText: `Dạ em không tìm thấy đơn hàng số ${maDonReal}. Bạn kiểm tra lại mã giúp em nhé.`,
        });
      }
    } catch (error) {
      console.error(error);
      return res.json({
        fulfillmentText: "Dạ hệ thống đang bận, bạn vui lòng thử lại sau nhé.",
      });
    }
  } else if (intentName === "Yeu_Cau_Doi_Thong_Tin_Don") {
    const maDonHang = parameters.ma_don_hang || null;

    if (!maDonHang) {
      return res.json({
        fulfillmentText:
          "Dạ bạn cho mình xin mã đơn hàng (ví dụ: 1024) để hệ thống kiểm tra và hỗ trợ thay đổi thông vị nhé.",
      });
    }

    let cleanMaDon = maDonHang
      .toString()
      .replace(/số|mã|so|ma|đơn|don/gi, "")
      .trim();

    if (/[a-zA-Z]/.test(cleanMaDon)) {
      const errText = `Dạ "${maDonHang}" có vẻ là Mã vận đơn của bên giao hàng rồi ạ. Để em cập nhật được trên hệ thống, bạn vui lòng cung cấp "Mã đơn hàng" của CeramicShop (chỉ bao gồm các con số, ví dụ: 1024) nhé!`;
      return res.json({
        fulfillmentMessages: [{ text: { text: [errText] } }],
      });
    }

    const maDonReal = cleanMaDon.replace(/\D/g, "");

    try {
      const checkQuery =
        "SELECT TrangThaiDonHang FROM DonHang WHERE MaDonHang = ?";
      const [rows] = await pool.execute(checkQuery, [maDonReal]);

      if (rows.length > 0) {
        const trangThai = rows[0].TrangThaiDonHang;

        if (trangThai === 0 || trangThai === 1) {
          const processText = `Dạ đơn hàng số ${maDonReal} đang trong quá trình xử lý. Để thay đổi thông tin, bạn vui lòng liên hệ Zalo, Fanpage Facebook hoặc Gọi trực tiếp cho CSKH để cập nhật gấp nhé ạ!`;
          return res.json({
            fulfillmentMessages: [
              { text: { text: [processText] } },
              {
                payload: {
                  richContent: [
                    [
                      {
                        type: "button",
                        icon: { type: "phone", color: "#34A853" },
                        text: "Gọi điện báo thay đổi",
                        link: phoneLink,
                      },
                      {
                        type: "button",
                        icon: { type: "chat", color: "#0068FF" },
                        text: "Cập nhật qua Zalo",
                        link: zaloLink,
                      },
                      {
                        type: "button",
                        icon: { type: "facebook", color: "#0866FF" },
                        text: "Cập nhật qua Fanpage Facebook",
                        link: fbLink,
                      },
                      {
                        type: "button",
                        icon: { type: "mail", color: "#EA4335" },
                        text: "Gửi Email báo thay đổi",
                        link: emailLink,
                      },
                    ],
                  ],
                },
              },
            ],
          });
        } else if (trangThai === 4) {
          return res.json({
            fulfillmentText: `Dạ đơn hàng số ${maDonReal} này đã bị hủy từ trước rồi ạ. Bạn có thể lên website để đặt lại một đơn hàng mới với thông tin chính xác nhé.`,
          });
        } else {
          const denyText = `❌ Dạ rất tiếc, đơn hàng ${maDonReal} đã được bàn giao cho đơn vị vận chuyển nên hệ thống không thể tự động thay đổi thông tin nữa. Bạn vui lòng liên hệ gấp các kênh dưới đây để bên em gọi bưu tá hỗ trợ nhé ạ.`;
          return res.json({
            fulfillmentMessages: [
              { text: { text: [denyText] } },
              {
                payload: {
                  richContent: [
                    [
                      {
                        type: "button",
                        icon: { type: "phone", color: "#34A853" },
                        text: "Gọi Hotline khẩn cấp",
                        link: phoneLink,
                      },
                      {
                        type: "button",
                        icon: { type: "chat", color: "#0068FF" },
                        text: "Báo CSKH hỗ trợ (Zalo)",
                        link: zaloLink,
                      },
                      {
                        type: "button",
                        icon: { type: "facebook", color: "#0866FF" },
                        text: "Báo CSKH hỗ trợ (Fanpage)",
                        link: fbLink,
                      },
                    ],
                  ],
                },
              },
            ],
          });
        }
      } else {
        return res.json({
          fulfillmentText: `Dạ em không tìm thấy đơn hàng số ${maDonReal} trên hệ thống. Bạn kiểm tra lại mã giúp em nhé.`,
        });
      }
    } catch (error) {
      console.error(error);
      return res.json({
        fulfillmentText: "Dạ hệ thống đang bận, bạn vui lòng thử lại sau nhé.",
      });
    }
  } else if (intentName === "Khieu_Nai_Bao_Loi") {
    const textResponse =
      "Dạ CeramicShop vô cùng xin lỗi bạn về trải nghiệm không tốt này. Để shop xử lý đền bù/đổi trả ngay lập tức, bạn vui lòng liên hệ ngay qua Hotline, Zalo, Fanpage Facebook hoặc Email để bộ phận CSKH giải quyết ngay nhé ạ.";

    return res.json({
      fulfillmentMessages: [
        { text: { text: [textResponse] } },
        {
          payload: {
            richContent: [
              [
                {
                  type: "button",
                  icon: { type: "phone", color: "#34A853" },
                  text: "Gọi ngay để khiếu nại",
                  link: phoneLink,
                },
                {
                  type: "button",
                  icon: { type: "chat", color: "#0068FF" },
                  text: "Gửi ảnh/video qua Zalo",
                  link: zaloLink,
                },
                {
                  type: "button",
                  icon: { type: "facebook", color: "#0866FF" },
                  text: "Gửi ảnh/video qua Fanpage",
                  link: fbLink,
                },
                {
                  type: "button",
                  icon: { type: "mail", color: "#EA4335" },
                  text: "Gửi ảnh/video qua Email",
                  link: emailLink,
                },
              ],
            ],
          },
        },
      ],
    });
  } else if (intentName === "Gap_Nhan_Vien_Tu_Van") {
    const textResponse =
      "Dạ, bạn có thể gọi trực tiếp, nhắn Zalo, Fanpage Facebook hoặc gửi Email để chuyên viên gốm sứ bên em hỗ trợ bạn chu đáo nhất nhé ạ!";

    return res.json({
      fulfillmentMessages: [
        { text: { text: [textResponse] } },
        {
          payload: {
            richContent: [
              [
                {
                  type: "button",
                  icon: { type: "phone", color: "#34A853" },
                  text: "Gọi trực tiếp Hotline",
                  link: phoneLink,
                },
                {
                  type: "button",
                  icon: { type: "chat", color: "#0068FF" },
                  text: "Chat Zalo với CSKH ngay",
                  link: zaloLink,
                },
                {
                  type: "button",
                  icon: { type: "facebook", color: "#0866FF" },
                  text: "Chat với CSKH qua Fanpage",
                  link: fbLink,
                },
                {
                  type: "button",
                  icon: { type: "mail", color: "#EA4335" },
                  text: "Gửi Email cho CSKH",
                  link: emailLink,
                },
              ],
            ],
          },
        },
      ],
    });
  } else if (intentName === "Tu_Van_Theo_Ngan_Sach") {
    const queryText = req.body.queryResult.queryText.toLowerCase();
    let nganSachRaw = parameters.ngan_sach;

    let tenSPRaw = parameters.Ten_San_Pham || "";
    if (Array.isArray(tenSPRaw)) tenSPRaw = tenSPRaw[0];

    let danhMucRaw = parameters.Danh_Muc_San_Pham || "";
    if (Array.isArray(danhMucRaw)) danhMucRaw = danhMucRaw[0];

    let nganSach = 0;

    const regexTrieu = /(\d+(?:[\.,]\d+)?)\s*(triệu|tr|củ)/i;
    const regexNgan = /(\d+(?:[\.,]\d+)?)\s*(k|ngàn|nghìn)/i;
    const regexLit = /(\d+(?:[\.,]\d+)?)\s*(lít|lit|l)/i;

    let matchTrieu = queryText.match(regexTrieu);
    let matchNgan = queryText.match(regexNgan);
    let matchLit = queryText.match(regexLit);

    if (matchTrieu) {
      let so = parseFloat(matchTrieu[1].replace(",", "."));
      nganSach = so * 1000000;
    } else if (matchLit) {
      let so = parseFloat(matchLit[1].replace(",", "."));
      nganSach = so * 100000;
    } else if (matchNgan) {
      let so = parseFloat(matchNgan[1].replace(",", "."));
      nganSach = so * 1000;
    } else if (nganSachRaw) {
      let so = Number(nganSachRaw);
      if (so < 30) {
        nganSach = so * 1000000;
      } else if (so >= 30 && so <= 10000) {
        nganSach = so * 1000;
      } else {
        nganSach = so;
      }
    }

    if (nganSach === 0) {
      return res.json({
        fulfillmentText:
          "Dạ bạn định dành khoảng ngân sách bao nhiêu để mình tư vấn ạ? (Ví dụ: 500k, 1.5 triệu...)",
      });
    }

    try {
      let sqlQuery = `
                SELECT sp.MaSanPham, sp.TenSanPham, MIN(bt.Gia) as GiaTu, MIN(ha.DuongDan) as DuongDan
                FROM SanPham sp
                JOIN BienTheSanPham bt ON sp.MaSanPham = bt.MaSanPham
                LEFT JOIN HinhAnhBienThe ha ON bt.MaBienThe = ha.MaBienThe
                LEFT JOIN DanhMucSanPham dm ON sp.MaDanhMuc = dm.MaDanhMuc
                LEFT JOIN DanhMucSanPham dm_parent ON dm.ParentID = dm_parent.MaDanhMuc
                WHERE sp.TrangThai = 1 AND bt.TrangThai = 1 AND bt.Gia <= ?
            `;

      let queryParams = [nganSach];

      const ignoreWords = [
        "lít",
        "lit",
        "củ",
        "k",
        "tr",
        "triệu",
        "ngàn",
        "nghìn",
        "đ",
        "vnd",
        "đồng",
      ];
      if (tenSPRaw && ignoreWords.includes(tenSPRaw.toLowerCase().trim())) {
        tenSPRaw = "";
      }
      if (danhMucRaw && ignoreWords.includes(danhMucRaw.toLowerCase().trim())) {
        danhMucRaw = "";
      }

      let searchKeyword = tenSPRaw || danhMucRaw;

      if (searchKeyword) {
        if (searchKeyword.toLowerCase().includes("quà tặng")) {
          sqlQuery += ` AND (dm.TenDanhMuc LIKE ? OR dm_parent.TenDanhMuc LIKE ? OR sp.TenSanPham LIKE ?)`;
          queryParams.push("%Bộ ấm trà%", "%Bộ ấm trà%", "%Bộ ấm trà%");
        } else {
          let cleanSearch = searchKeyword.replace(/bộ |bo /gi, "").trim();
          if (!cleanSearch) cleanSearch = searchKeyword;

          sqlQuery += ` AND (dm.TenDanhMuc LIKE ? OR dm_parent.TenDanhMuc LIKE ? OR sp.TenSanPham LIKE ?)`;
          queryParams.push(
            `%${cleanSearch}%`,
            `%${cleanSearch}%`,
            `%${cleanSearch}%`,
          );
        }
      }

      sqlQuery += ` GROUP BY sp.MaSanPham, sp.TenSanPham ORDER BY GiaTu DESC LIMIT 3`;

      const [rows] = await pool.execute(sqlQuery, queryParams);

      const nganSachFormat = new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(nganSach);

      let txtIntro = `Dạ với mức tài chính khoảng ${nganSachFormat}, em thấy các mẫu sau đây là phù hợp và đẹp nhất ạ:`;
      let txtNotFound = `Dạ hiện tại với mức ngân sách ${nganSachFormat}, shop em đang tạm hết các mẫu tương ứng. Bạn có muốn tham khảo thêm các dòng sản phẩm khác không ạ?`;

      if (searchKeyword) {
        txtIntro = `Dạ với ngân sách khoảng ${nganSachFormat}, em gửi bạn các mẫu ${searchKeyword} xuất sắc nhất bên em nhé:`;
        txtNotFound = `Dạ tiếc quá, các mẫu ${searchKeyword} trong tầm giá ${nganSachFormat} hiện đang hết hàng. Bạn có muốn tham khảo sang mức giá hoặc dòng sản phẩm khác không ạ?`;
      }

      if (rows.length > 0) {
        let richContentData = [];

        rows.forEach((sp) => {
          const giaFormat = new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(sp.GiaTu);
          const linkSanPham = `${domainWeb}/product/${sp.MaSanPham}`;

          richContentData.push([
            {
              type: "image",
              rawUrl:
                sp.DuongDan ||
                "https://via.placeholder.com/300?text=Chua+co+hinh",
              accessibilityText: sp.TenSanPham,
            },
            {
              type: "info",
              title: sp.TenSanPham,
              subtitle: `Giá tham khảo: ${giaFormat}`,
            },
            {
              type: "button",
              icon: { type: "touch_app", color: "#C06E52" },
              text: "Xem chi tiết",
              link: linkSanPham,
            },
          ]);
        });

        if (searchKeyword) {
          const searchLink = `${domainWeb}?search=${encodeURIComponent(searchKeyword.trim())}`;
          richContentData.push([
            {
              type: "button",
              icon: { type: "search", color: "#34A853" },
              text: `Xem tất cả ${searchKeyword}`,
              link: searchLink,
            },
          ]);
        }

        return res.json({
          fulfillmentMessages: [
            { text: { text: [txtIntro] } },
            { payload: { richContent: richContentData } },
          ],
        });
      } else {
        return res.json({ fulfillmentText: txtNotFound });
      }
    } catch (error) {
      console.error(error);
      return res.json({
        fulfillmentText:
          "Dạ hệ thống đang tải dữ liệu sản phẩm, bạn chờ chút xíu nhé.",
      });
    }
  } else if (intentName === "San_Pham_Pho_Bien") {
    try {
      const sqlQuery = `
                SELECT sp.MaSanPham, sp.TenSanPham, sp.LuotXem, MIN(bt.Gia) as GiaTu, MIN(ha.DuongDan) as DuongDan
                FROM SanPham sp
                JOIN BienTheSanPham bt ON sp.MaSanPham = bt.MaSanPham
                LEFT JOIN HinhAnhBienThe ha ON bt.MaBienThe = ha.MaBienThe
                WHERE sp.TrangThai = 1 AND bt.TrangThai = 1
                GROUP BY sp.MaSanPham, sp.TenSanPham, sp.LuotXem
                ORDER BY sp.LuotXem DESC
                LIMIT 3
            `;

      const [rows] = await pool.execute(sqlQuery);

      if (rows.length > 0) {
        let listRichContent = [];

        rows.forEach((sp) => {
          const giaFormat = new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(sp.GiaTu);
          const linkSanPham = `${domainWeb}/product/${sp.MaSanPham}`;

          listRichContent.push([
            {
              type: "image",
              rawUrl:
                sp.DuongDan ||
                "https://via.placeholder.com/300?text=Chua+co+hinh",
              accessibilityText: sp.TenSanPham,
            },
            {
              type: "info",
              title: sp.TenSanPham,
              subtitle: `Giá tham khảo từ: ${giaFormat}`,
            },
            {
              type: "button",
              icon: { type: "local_fire_department", color: "#FF5722" },
              text: "Xem chi tiết",
              link: linkSanPham,
            },
          ]);
        });

        return res.json({
          fulfillmentMessages: [
            {
              text: {
                text: [
                  "Dạ, đây là các mẫu sản phẩm đang Hot và được nhiều khách hàng săn đón nhất tại CeramicShop hiện nay ạ:",
                ],
              },
            },
            { payload: { richContent: listRichContent } },
          ],
        });
      } else {
        return res.json({
          fulfillmentText:
            "Dạ hiện tại hệ thống đang cập nhật danh sách sản phẩm hot, bạn vui lòng tham khảo theo danh mục nhé ạ.",
        });
      }
    } catch (error) {
      console.error(error);
      return res.json({
        fulfillmentText:
          "Dạ hệ thống đang tải dữ liệu sản phẩm, bạn chờ chút xíu nhé.",
      });
    }
  } else if (intentName === "Xem_Tat_Ca_San_Pham") {
    const textResponse =
      "Dạ, hiện tại CeramicShop tự hào cung cấp hàng chục mẫu mã gốm sứ cao cấp đa dạng: từ Bộ đồ ăn, Ấm trà tiếp khách, Đồ thờ cúng tâm linh cho đến các vật phẩm Phong thủy, Trang trí. \n\nVì danh sách rất dài nên để tiện xem chi tiết hình ảnh và so sánh giá cả, mời bạn ghé thăm gian hàng trực tuyến của bên em nhé ạ:";

    return res.json({
      fulfillmentMessages: [
        { text: { text: [textResponse] } },
        {
          payload: {
            richContent: [
              [
                {
                  type: "button",
                  icon: { type: "storefront", color: "#34A853" },
                  text: "Đi tới Gian hàng (Xem tất cả)",
                  link: `${domainWeb}`,
                },
                {
                  type: "button",
                  icon: { type: "local_fire_department", color: "#FF5722" },
                  text: "Xem ngay tại đây các mẫu Bán Chạy",
                  event: {
                    name: "San_Pham_Pho_Bien",
                    languageCode: "vi",
                    parameters: {},
                  },
                },
              ],
            ],
          },
        },
      ],
    });
  } else if (intentName === "Thong_Tin_Lien_He_Shop") {
    const mapLink = CHATBOT_LINKS.mapLink;

    return res.json({
      fulfillmentMessages: [
        {
          text: {
            text: [
              "Dạ, chào mừng bạn đến với CeramicShop. Dưới đây là thông tin chi tiết để bạn dễ dàng ghé thăm và liên hệ với tụi mình nhé:",
            ],
          },
        },
        {
          payload: {
            richContent: [
              [
                {
                  type: "description",
                  title: "🏡 CeramicShop - Gốm Sứ Cao Cấp",
                  text: [
                    "📍 Địa chỉ: 484 Lạch Tray, Lê Chân, Hải Phòng",
                    "⏰ Giờ mở cửa: 08:00 - 22:00 (Từ Thứ 2 - Thứ 7)",
                    "📞 Hotline: 0329.835.725",
                    "✉️ Email: theceramicshop24@gmail.com",
                    "🅿️ Chỗ để xe: Có bãi đậu xe ô tô rộng rãi, nhân viên hỗ trợ bê đồ gốm ra tận xe an toàn.",
                    "💳 Thanh toán: Tiền mặt, Chuyển khoản (QR Code), Quẹt thẻ và VNPay.",
                  ],
                },
                {
                  type: "button",
                  icon: { type: "map", color: "#EA4335" },
                  text: "Xem đường đi trên Bản đồ",
                  link: mapLink,
                },
                {
                  type: "button",
                  icon: { type: "facebook", color: "#0866FF" },
                  text: "Ghé thăm Fanpage của Shop",
                  link: fbLink,
                },
                {
                  type: "button",
                  icon: { type: "chat", color: "#0068FF" },
                  text: "Chat Zalo với nhân viên",
                  link: zaloLink,
                },
                {
                  type: "button",
                  icon: { type: "phone", color: "#34A853" },
                  text: "Gọi Hotline ngay",
                  link: phoneLink,
                },
                {
                  type: "button",
                  icon: { type: "mail", color: "#EA4335" },
                  text: "Gửi Email cho Shop",
                  link: emailLink,
                },
              ],
            ],
          },
        },
      ],
    });
  }

  return res.json({
    fulfillmentText: "Dạ hệ thống đang kiểm tra thông tin này...",
  });
});

export default router;
