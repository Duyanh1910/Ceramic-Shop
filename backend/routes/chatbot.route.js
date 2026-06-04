import express from "express";
import { pool, CHATBOT_LINKS } from "../config/chatbot.config.js";
import {
  toArray,
  mergeUniqueTextList,
  buildVariantAttributeFilter,
  buildCategorySearchCondition,
  extractCapacityAttributes,
  getMenhByBirthYear,
  extractBirthYear,
  extractBudgetAmount,
  resolveProductNeedSearch,
} from "../utils/chatbotAttributeFilter.helper.js";
const router = express.Router();

const extractOrderCode = (value) => {
  if (!value) return null;

  const normalizedValue = String(value).toUpperCase().trim();

  const newOrderCodeMatch = normalizedValue.match(
    /D\s*H\s*(\d{6})\s*([A-Z0-9])\s*([A-Z0-9])\s*([A-Z0-9])\s*([A-Z0-9])\b/,
  );

  if (newOrderCodeMatch) {
    return `DH${newOrderCodeMatch[1]}${newOrderCodeMatch[2]}${newOrderCodeMatch[3]}${newOrderCodeMatch[4]}${newOrderCodeMatch[5]}`;
  }

  const oldOrderCodeMatch = normalizedValue.match(/D\s*H\s*(\d{6})\b/);

  if (oldOrderCodeMatch) {
    return `DH${oldOrderCodeMatch[1]}`;
  }

  return null;
};

const domainFromConfig = () => {
  return String(CHATBOT_LINKS.domainWeb || "").replace(/\/+$/, "");
};

const buildWebLink = (path = "") => {
  const normalizedDomain = domainFromConfig();

  if (!path) return normalizedDomain;

  const normalizedPath = String(path).startsWith("/")
    ? String(path)
    : `/${path}`;

  return `${normalizedDomain}${normalizedPath}`;
};

const findCategoryByKeyword = async (categoryKeyword) => {
  const keyword = String(categoryKeyword || "").trim();

  if (!keyword) return null;

  const likeKeyword = `%${keyword.replace(/\s+/g, "%")}%`;

  const [rows] = await pool.execute(
    `
      SELECT MaDanhMuc, TenDanhMuc, ParentID
      FROM DanhMucSanPham
      WHERE TenDanhMuc = ?
         OR TenDanhMuc LIKE ?
      ORDER BY
        CASE
          WHEN TenDanhMuc = ? THEN 0
          WHEN TenDanhMuc LIKE ? THEN 1
          ELSE 2
        END,
        ParentID IS NULL DESC,
        MaDanhMuc ASC
      LIMIT 1
    `,
    [keyword, likeKeyword, keyword, likeKeyword],
  );

  return rows[0] || null;
};

const getPromotionCategoryScope = async ({ tenSanPham = "", danhMuc = "" }) => {
  const categoryIds = new Set();
  let displayText = "";

  const cleanTenSanPham = String(tenSanPham || "").trim();
  const cleanDanhMuc = String(danhMuc || "").trim();

  if (cleanTenSanPham) {
    const searchTenSP = `%${cleanTenSanPham.replace(/\s+/g, "%")}%`;

    const [productRows] = await pool.execute(
      `
        SELECT
          sp.MaDanhMuc,
          dm.TenDanhMuc,
          dm.ParentID
        FROM SanPham sp
        LEFT JOIN DanhMucSanPham dm ON sp.MaDanhMuc = dm.MaDanhMuc
        WHERE sp.TenSanPham LIKE ?
          AND sp.TrangThai = 1
          AND sp.deleted_at IS NULL
        ORDER BY
          CASE WHEN sp.TenSanPham = ? THEN 0 ELSE 1 END,
          sp.MaSanPham ASC
        LIMIT 1
      `,
      [searchTenSP, cleanTenSanPham],
    );

    const productCategory = productRows[0];

    if (productCategory?.MaDanhMuc) {
      categoryIds.add(productCategory.MaDanhMuc);
      displayText = cleanTenSanPham;

      if (productCategory.ParentID) {
        categoryIds.add(productCategory.ParentID);
      }
    }
  }

  if (!categoryIds.size && cleanDanhMuc) {
    const category = await findCategoryByKeyword(cleanDanhMuc);

    if (category?.MaDanhMuc) {
      categoryIds.add(category.MaDanhMuc);
      displayText = category.TenDanhMuc;

      if (category.ParentID) {
        categoryIds.add(category.ParentID);
      }

      const [childRows] = await pool.execute(
        `
          SELECT MaDanhMuc
          FROM DanhMucSanPham
          WHERE ParentID = ?
        `,
        [category.MaDanhMuc],
      );

      childRows.forEach((child) => {
        categoryIds.add(child.MaDanhMuc);
      });
    }
  }

  return {
    categoryIds: [...categoryIds],
    displayText,
  };
};

const buildHomeCategoryOrSearchLink = async ({
  categoryKeywords = [],
  fallbackSearchKeyword = "",
}) => {
  const keywords = [
    ...new Set(
      toArray(categoryKeywords)
        .map((keyword) => String(keyword || "").trim())
        .filter(Boolean),
    ),
  ];

  for (const keyword of keywords) {
    const category = await findCategoryByKeyword(keyword);

    if (category) {
      return buildWebLink(`/home/?category=${category.MaDanhMuc}`);
    }
  }

  const fallbackKeyword = String(
    fallbackSearchKeyword || keywords[0] || "",
  ).trim();

  if (!fallbackKeyword) {
    return buildWebLink("/home");
  }

  return buildWebLink(`/home/?search=${encodeURIComponent(fallbackKeyword)}`);
};

router.post("/webhook", async (req, res) => {
  const intentName = req.body.queryResult.intent.displayName;
  const parameters = req.body.queryResult.parameters;

  const originalPayload = req.body.originalDetectIntentRequest?.payload || {};
  const webhookPayload = req.body.queryResult?.webhookPayload || {};
  let maKhachHang = originalPayload.maKhachHang || webhookPayload.maKhachHang || originalPayload.userId || webhookPayload.userId || null;
  if (maKhachHang === "null" || maKhachHang === "undefined" || maKhachHang === "") maKhachHang = null;

  const domainWeb = domainFromConfig();
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

    const thuocTinhList = mergeUniqueTextList(
      parameters.Thuoc_Tinh,
      extractCapacityAttributes(req.body.queryResult.queryText),
    );
    const menhList = toArray(parameters.Menh);

    const tenSanPham = rawTenSP.trim();

    try {
        let sqlQuery = `
          SELECT
            sp.MaSanPham,
            bt.MaBienThe,
            bt.TenBienThe,
            bt.Gia,
            bt.SoLuong,
            MIN(ha.DuongDan) as DuongDan,
            sp.TenSanPham
          FROM BienTheSanPham bt
          JOIN SanPham sp ON bt.MaSanPham = sp.MaSanPham
          LEFT JOIN HinhAnhBienThe ha ON bt.MaBienThe = ha.MaBienThe
          WHERE sp.TenSanPham LIKE ?
            AND sp.TrangThai = 1
            AND sp.deleted_at IS NULL
            AND bt.TrangThai = 1
        `;

        const searchTenSP = `%${tenSanPham.replace(/\s+/g, "%")}%`;
        let queryParams = [searchTenSP];

        const attributeFilter = buildVariantAttributeFilter({
          thuocTinhList,
          menhList,
        });

        sqlQuery += attributeFilter.sql;
        queryParams.push(...attributeFilter.params);

        sqlQuery += `
          GROUP BY
            sp.MaSanPham,
            bt.MaBienThe,
            bt.TenBienThe,
            bt.Gia,
            bt.SoLuong,
            sp.TenSanPham
        `;

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
          cauTraLoi += `Bên em đang sẵn hàng (${sp.SoLuong} sản phẩm/phân loại) ạ. Bạn có thể xem chi tiết và đặt mua ngay tại link dưới đây nhé!`;
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
    const requestedAttributes = [...thuocTinhList, ...menhList].filter(Boolean);

    if (requestedAttributes.length > 0) {
      const fallbackQuery = `
        SELECT
          sp.MaSanPham,
          sp.TenSanPham,
          bt.TenBienThe,
          bt.Gia,
          bt.SoLuong
        FROM BienTheSanPham bt
        JOIN SanPham sp ON bt.MaSanPham = sp.MaSanPham
        WHERE sp.TenSanPham LIKE ?
          AND sp.TrangThai = 1
          AND sp.deleted_at IS NULL
          AND bt.TrangThai = 1
        GROUP BY
          sp.MaSanPham,
          sp.TenSanPham,
          bt.MaBienThe,
          bt.TenBienThe,
          bt.Gia,
          bt.SoLuong
        LIMIT 5
      `;

      const [availableRows] = await pool.execute(fallbackQuery, [searchTenSP]);

      if (availableRows.length > 0) {
        const availableVariants = availableRows.map((variant) => {
          const giaFormat = new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(variant.Gia);

          const tonKhoText =
            variant.SoLuong > 0 ? `còn ${variant.SoLuong} sản phẩm` : "tạm hết hàng";

          return `🔸 ${variant.TenBienThe}: ${giaFormat} (${tonKhoText})`;
        });

        return res.json({
          fulfillmentMessages: [
            {
              text: {
                text: [
                  `Dạ em có sản phẩm ${availableRows[0].TenSanPham}, nhưng chưa tìm thấy phân loại khớp với thuộc tính ${requestedAttributes.join(", ")}. Em gửi bạn các phân loại hiện có để tham khảo nhé:`,
                ],
              },
            },
            {
              payload: {
                richContent: [
                  [
                    {
                      type: "description",
                      title: "💰 Phân loại hiện có",
                      text: availableVariants,
                    },
                    {
                      type: "button",
                      icon: { type: "touch_app", color: "#C06E52" },
                      text: "Xem chi tiết & Chọn mẫu",
                      link: `${domainWeb}/product/${availableRows[0].MaSanPham}`,
                    },
                  ],
                ],
              },
            },
          ],
        });
      }
    }

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

    const maDonReal = extractOrderCode(maDonHang);

    if (!maDonReal) {
      return res.json({
        fulfillmentMessages: [{ text: { text: [`Dạ mã đơn hàng bên em bắt đầu bằng chữ "DH" kèm theo các số và chữ cái (ví dụ: DH26040211X6). Bạn vui lòng kiểm tra và cung cấp lại mã chính xác nhé!`] } }],
      });
    }

    try {
      const sqlQuery = `
        SELECT dh.TrangThaiDonHang, dh.NgayDat, dh.TongThanhToan, dh.MaKhachHang, kh.MaTaiKhoan 
        FROM DonHang dh 
        LEFT JOIN KhachHang kh ON dh.MaKhachHang = kh.MaKhachHang 
        WHERE dh.MaHienThi = ?
      `;
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

        let displayInfo = [];
        let richContentBlock = [];
        const isOwner = maKhachHang && (String(donHang.MaKhachHang) === String(maKhachHang) || String(donHang.MaTaiKhoan) === String(maKhachHang));

        if (isOwner) {
          const ngayDat = new Date(donHang.NgayDat).toLocaleDateString("vi-VN");
          const tongTien = new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(donHang.TongThanhToan);

          displayInfo = [
            `• Ngày đặt: ${ngayDat}`,
            `• Tổng hóa đơn: ${tongTien}`,
            `• Trạng thái: ${trangThaiText}`,
          ];

          richContentBlock = [
            {
              type: "info",
              title: `Đơn hàng ${maDonReal}`,
              subtitle: "Trạng thái vận chuyển",
            },
            {
              type: "description",
              title: "",
              text: displayInfo,
            },
            {
              type: "button",
              icon: { type: "receipt", color: "#1b437c" },
              text: "Xem chi tiết Đơn hàng",
              link: `${domainWeb}/orders`
            }
          ];
        } else {
          displayInfo = [
            `• Trạng thái: ${trangThaiText}`,
            `(Bạn đăng nhập đúng tài khoản trên website để xem chi tiết hóa đơn)`
          ];

          richContentBlock = [
            {
              type: "info",
              title: `Đơn hàng ${maDonReal}`,
              subtitle: "Trạng thái vận chuyển",
            },
            {
              type: "description",
              title: "",
              text: displayInfo,
            }
          ];
        }

        return res.json({
          fulfillmentMessages: [
            {
              text: {
                text: [
                  `Dạ, em gửi bạn thông tin tra cứu của đơn hàng ${maDonReal} ạ:`,
                ],
              },
            },
            {
              payload: {
                richContent: [ richContentBlock ],
              },
            },
          ],
        });
      } else {
        return res.json({
          fulfillmentText: `Dạ em không tìm thấy thông tin của đơn hàng ${maDonReal}. Bạn vui lòng kiểm tra lại mã giúp em nhé.`,
        });
      }
    } catch (error) {
      console.error(error);
      return res.json({
        fulfillmentText:
          "Hệ thống đang bảo trì, bạn vui lòng tra cứu lại sau nhé.",
      });
    }
  } else if (intentName === "Kiem_Tra_Bao_Hanh_Don_Hang") {
    if (!maKhachHang) {
      const loginText =
        "Dạ, để bảo mật thông tin bảo hành, bạn vui lòng đăng nhập vào tài khoản trên website trước khi kiểm tra bảo hành đơn hàng nhé ạ.";

      return res.json({
        fulfillmentMessages: [
          { text: { text: [loginText] } },
          {
            payload: {
              richContent: [
                [
                  {
                    type: "button",
                    icon: { type: "login", color: "#1b437c" },
                    text: "Đăng nhập tài khoản",
                    link: `${domainWeb}/login`,
                  },
                ],
              ],
            },
          },
        ],
      });
    }
    const maDonHang = parameters.ma_don_hang || null;

    if (!maDonHang) {
      return res.json({
        fulfillmentText:
          "Dạ bạn cho mình xin mã đơn hàng (ví dụ: DH26040211X6) để kiểm tra bảo hành nhé.",
      });
    }

    const maDonReal = extractOrderCode(maDonHang);

    if (!maDonReal) {
      return res.json({
        fulfillmentMessages: [{ text: { text: [`Dạ mã đơn hàng bên em bắt đầu bằng chữ "DH" kèm theo các số và chữ cái (ví dụ: DH26040211X6). Bạn vui lòng kiểm tra và cung cấp lại mã chính xác nhé!`] } }],
      });
    }

    try {
      const checkOrder = `
        SELECT dh.MaKhachHang, kh.MaTaiKhoan
        FROM DonHang dh
        LEFT JOIN KhachHang kh ON dh.MaKhachHang = kh.MaKhachHang
        WHERE dh.MaHienThi = ?
      `;
      const [orderRows] = await pool.execute(checkOrder, [maDonReal]);

      if (orderRows.length === 0) {
        return res.json({
          fulfillmentText: `Dạ em không tìm thấy đơn hàng ${maDonReal} trên hệ thống. Bạn kiểm tra lại mã giúp em nhé.`,
        });
      }
      const donHang = orderRows[0];
      const isOwner =
        String(donHang.MaKhachHang) === String(maKhachHang) ||
        String(donHang.MaTaiKhoan) === String(maKhachHang);

      if (!isOwner) {
        return res.json({
          fulfillmentText: `Dạ, mình không thể hiển thị thông tin bảo hành của đơn hàng ${maDonReal} vì đơn hàng này không thuộc tài khoản của bạn. Bạn vui lòng đăng nhập đúng tài khoản đã đặt đơn để kiểm tra nhé ạ.`,
        });
      }
      const sqlQuery = `
        SELECT
          bh.MaBaoHanh,
          sp.TenSanPham,
          bt.TenBienThe,
          bh.NgayBatDau,
          bh.NgayKetThuc,
          bh.TrangThai
        FROM DonHang dh
        JOIN ChiTietDonHang ctdh ON dh.MaDonHang = ctdh.MaDonHang
        JOIN BienTheSanPham bt ON ctdh.MaBienThe = bt.MaBienThe
        JOIN SanPham sp ON bt.MaSanPham = sp.MaSanPham
        JOIN BaoHanh bh ON ctdh.MaCTDH = bh.MaCTDH
        WHERE dh.MaHienThi = ?
      `;

      const [rows] = await pool.execute(sqlQuery, [maDonReal]);

      if (rows.length > 0) {
        const WARRANTY_STATUS = {
          EXPIRED: 0,
          ACTIVE: 1,
          REQUESTED: 2,
          PROCESSING: 3,
          COMPLETED: 4,
          REJECTED: 5,
        };

        const isActiveWarrantyExpired = (item) => {
          if (!item.NgayKetThuc) return false;

          return (
            Number(item.TrangThai) === WARRANTY_STATUS.ACTIVE &&
            new Date(item.NgayKetThuc) < new Date()
          );
        };

        const getEffectiveWarrantyStatus = (item) => {
          if (isActiveWarrantyExpired(item)) {
            return WARRANTY_STATUS.EXPIRED;
          }

          return Number(item.TrangThai);
        };

        const getWarrantyStatusText = (status) => {
          switch (Number(status)) {
            case WARRANTY_STATUS.EXPIRED:
              return "❌ Hết hạn";
            case WARRANTY_STATUS.ACTIVE:
              return "✅ Còn hiệu lực";
            case WARRANTY_STATUS.REQUESTED:
              return "🟡 Đang yêu cầu bảo hành";
            case WARRANTY_STATUS.PROCESSING:
              return "🔵 Đang xử lý bảo hành";
            case WARRANTY_STATUS.COMPLETED:
              return "✅ Đã hoàn tất bảo hành";
            case WARRANTY_STATUS.REJECTED:
              return "❌ Từ chối bảo hành";
            default:
              return "Không xác định";
          }
        };

        const textArray = [];
        let canRequestWarranty = false;
        let canTrackWarranty = false;

        rows.forEach((item) => {
          const ngayBD = new Date(item.NgayBatDau);
          const ngayKT = new Date(item.NgayKetThuc);

          const ngayBDStr = ngayBD.toLocaleDateString("vi-VN");
          const ngayKTStr = ngayKT.toLocaleDateString("vi-VN");

          const effectiveStatus = getEffectiveWarrantyStatus(item);

          if (effectiveStatus === WARRANTY_STATUS.ACTIVE) {
            canRequestWarranty = true;
          }

          if (
            effectiveStatus === WARRANTY_STATUS.REQUESTED ||
            effectiveStatus === WARRANTY_STATUS.PROCESSING ||
            effectiveStatus === WARRANTY_STATUS.COMPLETED ||
            effectiveStatus === WARRANTY_STATUS.REJECTED
          ) {
            canTrackWarranty = true;
          }

          textArray.push(
            `🔸 ${item.TenSanPham} (${item.TenBienThe})\n   Thời hạn: ${ngayBDStr} - ${ngayKTStr}\n   Trạng thái: ${getWarrantyStatusText(effectiveStatus)}`,
          );
        });

        const warrantyRichContent = [
          {
            type: "description",
            title: "🛡️ Trạng thái bảo hành",
            text: textArray,
          },
        ];

        if (canRequestWarranty) {
          warrantyRichContent.push({
            type: "button",
            icon: { type: "verified_user", color: "#1b437c" },
            text: "Gửi yêu cầu bảo hành",
            link: `${domainWeb}/warranties`,
          });
        } else if (canTrackWarranty) {
          warrantyRichContent.push({
            type: "button",
            icon: { type: "receipt_long", color: "#1b437c" },
            text: "Theo dõi bảo hành",
            link: `${domainWeb}/warranties`,
          });
        }

        return res.json({
          fulfillmentMessages: [
            {
              text: {
                text: [
                  `Dạ đây là thông tin bảo hành các sản phẩm thuộc đơn hàng ${maDonReal}:`,
                ],
              },
            },
            {
              payload: {
                richContent: [warrantyRichContent],
              },
            },
          ],
        });
      } else {
        return res.json({
          fulfillmentText: `Dạ em không tìm thấy gói bảo hành nào cho đơn hàng ${maDonReal}. Với các lỗi nứt vỡ do vận chuyển, shop áp dụng chính sách đổi trả ngay lúc nhận hàng. Bạn cần hỗ trợ thêm gì không ạ?`,
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
    if (!maKhachHang) {
      const loginText =
        "Dạ, để bảo mật thông tin, bạn vui lòng đăng nhập vào tài khoản trên website trước khi yêu cầu hủy đơn nhé ạ.";

      return res.json({
        fulfillmentMessages: [
          { text: { text: [loginText] } },
          {
            payload: {
              richContent: [
                [
                  {
                    type: "button",
                    icon: { type: "login", color: "#1b437c" },
                    text: "Đăng nhập tài khoản",
                    link: `${domainWeb}/login`,
                  },
                ],
              ],
            },
          },
        ],
      });
    }

    const maDonHang = parameters.ma_don_hang || null;

    if (!maDonHang) {
      return res.json({
        fulfillmentText:
          "Dạ bạn cho mình xin mã đơn hàng (ví dụ: DH26040211X6) để mình kiểm tra điều kiện hỗ trợ hủy nhé.",
      });
    }

    const maDonReal = extractOrderCode(maDonHang);

    if (!maDonReal) {
      return res.json({
        fulfillmentMessages: [{ text: { text: [`Dạ mã đơn hàng bên em bắt đầu bằng chữ "DH" kèm theo các số và chữ cái (ví dụ: DH26040211X6). Bạn vui lòng kiểm tra và cung cấp lại mã chính xác nhé!`] } }],
      });
    }

    try {
      const checkQuery = `
        SELECT dh.TrangThaiDonHang, dh.MaKhachHang, kh.MaTaiKhoan 
        FROM DonHang dh 
        LEFT JOIN KhachHang kh ON dh.MaKhachHang = kh.MaKhachHang 
        WHERE dh.MaHienThi = ?
      `;
      const [rows] = await pool.execute(checkQuery, [maDonReal]);

      if (rows.length > 0) {
        if (String(rows[0].MaKhachHang) !== String(maKhachHang) && String(rows[0].MaTaiKhoan) !== String(maKhachHang)) {
          return res.json({
            fulfillmentText: `Dạ, bạn không có quyền hủy đơn hàng ${maDonReal} do đơn hàng này không thuộc về tài khoản của bạn.`,
          });
        }

        const trangThai = rows[0].TrangThaiDonHang;

        if (trangThai === 0) {
          const guideText = `Dạ đơn hàng ${maDonReal} hiện đang chờ shop xác nhận nên bạn có thể gửi yêu cầu hủy trên website. Bạn vui lòng vào mục Đơn hàng > Chi tiết đơn hàng > Hủy đơn để hệ thống xử lý đúng tồn kho, voucher và thanh toán nhé ạ.`;

          return res.json({
            fulfillmentMessages: [
              { text: { text: [guideText] } },
              {
                payload: {
                  richContent: [
                    [
                      {
                        type: "button",
                        icon: { type: "receipt", color: "#1b437c" },
                        text: "Vào trang đơn hàng",
                        link: `${domainWeb}/orders`,
                      },
                      {
                        type: "button",
                        icon: { type: "chat", color: "#0068FF" },
                        text: "Cần hỗ trợ qua Zalo",
                        link: zaloLink,
                      },
                    ],
                  ],
                },
              },
            ],
          });
        } else if (trangThai === 4) {
          return res.json({
            fulfillmentText: `Dạ đơn hàng ${maDonReal} này đã được hủy từ trước rồi ạ.`,
          });
        } else {
          const errText = `❌ Dạ rất tiếc, đơn hàng ${maDonReal} đã được xác nhận hoặc đang trong quá trình xử lý/giao hàng nên chatbot không thể gửi yêu cầu hủy trực tiếp. Bạn vui lòng liên hệ CSKH để được hỗ trợ nhanh nhất nhé.`;
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
          fulfillmentText: `Dạ em không tìm thấy đơn hàng ${maDonReal}. Bạn kiểm tra lại mã giúp em nhé.`,
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

    if (!maKhachHang) {
      return res.json({
        fulfillmentText:
          "Dạ, để bảo mật thông tin, bạn vui lòng đăng nhập vào tài khoản trên website trước khi yêu cầu thay đổi thông tin đơn nhé ạ.",
      });
    }

    if (!maDonHang) {
      return res.json({
        fulfillmentText:
          "Dạ bạn cho mình xin mã đơn hàng (ví dụ: DH26040211X6) để hệ thống kiểm tra và hỗ trợ thay đổi thông tin nhé.",
      });
    }

    const maDonReal = extractOrderCode(maDonHang);

    if (!maDonReal) {
      return res.json({
        fulfillmentMessages: [{ text: { text: [`Dạ mã đơn hàng bên em bắt đầu bằng chữ "DH" kèm theo các số và chữ cái (ví dụ: DH26040211X6). Bạn vui lòng kiểm tra và cung cấp lại mã chính xác nhé!`] } }],
      });
    }

    try {
      const checkQuery = `
        SELECT dh.TrangThaiDonHang, dh.MaKhachHang, kh.MaTaiKhoan 
        FROM DonHang dh 
        LEFT JOIN KhachHang kh ON dh.MaKhachHang = kh.MaKhachHang 
        WHERE dh.MaHienThi = ?
      `;
      const [rows] = await pool.execute(checkQuery, [maDonReal]);

      if (rows.length > 0) {
        if (String(rows[0].MaKhachHang) !== String(maKhachHang) && String(rows[0].MaTaiKhoan) !== String(maKhachHang)) {
          return res.json({
            fulfillmentText: `Dạ, bạn không có quyền thay đổi thông tin của đơn hàng ${maDonReal} do đơn hàng này không thuộc về tài khoản của bạn.`,
          });
        }

        const trangThai = rows[0].TrangThaiDonHang;

        if (trangThai === 0 || trangThai === 1) {
          const processText = `Dạ đơn hàng ${maDonReal} đang trong quá trình xử lý. Để thay đổi thông tin, bạn vui lòng liên hệ Zalo, Fanpage Facebook hoặc Gọi trực tiếp cho CSKH để cập nhật gấp nhé ạ!`;
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
            fulfillmentText: `Dạ đơn hàng ${maDonReal} này đã bị hủy từ trước rồi ạ. Bạn có thể lên website để đặt lại một đơn hàng mới với thông tin chính xác nhé.`,
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
          fulfillmentText: `Dạ em không tìm thấy đơn hàng ${maDonReal} trên hệ thống. Bạn kiểm tra lại mã giúp em nhé.`,
        });
      }
    } catch (error) {
      console.error(error);
      return res.json({
        fulfillmentText: "Dạ hệ thống đang bận, bạn vui lòng thử lại sau nhé.",
      });
    }
  } else if (intentName === "Hoi_Khuyen_Mai") {
  const queryText = String(req.body.queryResult.queryText || "");

  const normalizedQueryText = queryText
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");

  const isShippingVoucherQuestion =
  /(freeship|free\s*ship|mien\s*phi\s*ship|mien\s*phi\s*giao\s*hang|ma\s*free\s*ship|ma\s*freeship|phi\s*ship|phi\s*giao\s*hang|van\s*chuyen|giao\s*hang)/i.test(
    normalizedQueryText,
  );

  const isOrderDiscountQuestion =
    /(ma\s*giam\s*gia|voucher\s*giam|coupon|ma\s*khuyen\s*mai|giam\s*tien|giam\s*don|giam\s*gia\s*don|voucher\s*mua\s*hang|voucher\s*don\s*hang)/i.test(
      normalizedQueryText,
    );

  const requestedVoucherType = isShippingVoucherQuestion
    ? 2
    : isOrderDiscountQuestion
      ? 1
      : null;

  try {
    let sqlQuery = `
      SELECT
        km.MaKhuyenMai,
        km.MaLoaiKM,
        km.TenKhuyenMai,
        km.GiaTri,
        km.GiaTriToiThieu,
        km.GiamToiDa,
        km.NgayBatDau,
        km.NgayKetThuc,
        km.TrangThai,
        km.MaCode,
        km.SoLuong,
        km.LoaiVoucher,
        km.MaDanhMuc,
        lkm.TenLoaiKM,
        dm.TenDanhMuc
      FROM KhuyenMai km
      LEFT JOIN LoaiKhuyenMai lkm ON km.MaLoaiKM = lkm.MaLoaiKM
      LEFT JOIN DanhMucSanPham dm ON km.MaDanhMuc = dm.MaDanhMuc
      WHERE km.TrangThai = 1
        AND (km.NgayBatDau IS NULL OR km.NgayBatDau <= NOW())
        AND (km.NgayKetThuc IS NULL OR km.NgayKetThuc >= NOW())
        AND km.SoLuong > 0
    `;

    const queryParams = [];

    if (requestedVoucherType) {
      sqlQuery += ` AND km.LoaiVoucher = ?`;
      queryParams.push(requestedVoucherType);
    }

    let tenSPRaw = parameters.Ten_San_Pham || "";
    if (Array.isArray(tenSPRaw)) tenSPRaw = tenSPRaw[0] || "";

    let danhMucRaw = parameters.Danh_Muc_San_Pham || "";
    if (Array.isArray(danhMucRaw)) danhMucRaw = danhMucRaw[0] || "";

    const promotionScope = await getPromotionCategoryScope({
      tenSanPham: tenSPRaw,
      danhMuc: danhMucRaw,
    });

    if (promotionScope.categoryIds.length > 0) {
      const placeholders = promotionScope.categoryIds.map(() => "?").join(", ");

      sqlQuery += `
        AND (
          km.MaDanhMuc IS NULL
          OR km.MaDanhMuc IN (${placeholders})
        )
      `;

      queryParams.push(...promotionScope.categoryIds);
    }

    sqlQuery += `
      ORDER BY
        km.NgayKetThuc IS NULL ASC,
        km.NgayKetThuc ASC,
        km.MaKhuyenMai ASC
      LIMIT 10
    `;

    const [rows] = await pool.execute(sqlQuery, queryParams);

    const formatCurrency = (value) =>
      new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(Number(value || 0));

    const isPercentPromotion = (km) => {
      const tenLoaiKM = String(km.TenLoaiKM || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

      return (
        Number(km.MaLoaiKM) === 1 ||
        tenLoaiKM.includes("phan tram") ||
        tenLoaiKM.includes("%")
      );
    };

    const formatDiscountValue = (km) => {
      const value = Number(km.GiaTri || 0);

      if (isPercentPromotion(km)) {
        return `${value}%`;
      }

      return formatCurrency(value);
    };

    const getVoucherTypeText = (loaiVoucher) => {
      if (Number(loaiVoucher) === 2) {
        return "Freeship / giảm phí vận chuyển";
      }

      return "Giảm giá đơn hàng";
    };

    const getAppliedScopeText = (km) => {
      if (km.MaDanhMuc && km.TenDanhMuc) {
        return `Áp dụng: ${km.TenDanhMuc}`;
      }

      return "Áp dụng: Toàn shop";
    };

    const getMinimumOrderText = (value) => {
      const minValue = Number(value || 0);

      if (minValue <= 0) {
        return "Không yêu cầu đơn tối thiểu";
      }

      return `Đơn tối thiểu: ${formatCurrency(minValue)}`;
    };

    const getMaxDiscountText = (km) => {
      const maxDiscount = Number(km.GiamToiDa || 0);
      const discountValue = Number(km.GiaTri || 0);

      if (maxDiscount <= 0) return "";

      if (!isPercentPromotion(km) && maxDiscount === discountValue) {
        return "";
      }

      return ` | Giảm tối đa: ${formatCurrency(maxDiscount)}`;
    };

    const scopeText = promotionScope.displayText
      ? ` cho ${promotionScope.displayText}`
      : "";

    const title = requestedVoucherType === 2
      ? `🚚 Mã freeship đang hoạt động${scopeText}`
      : requestedVoucherType === 1
        ? `🎁 Mã giảm giá đang hoạt động${scopeText}`
        : `🎉 Khuyến mãi đang hoạt động${scopeText}`;

    if (rows.length > 0) {
    const introText = promotionScope.displayText
      ? `Dạ, với ${promotionScope.displayText}, shop đang có các ưu đãi phù hợp sau ạ:`
      : requestedVoucherType === 2
        ? "Dạ, hiện tại shop đang có các mã freeship/giảm phí vận chuyển còn hiệu lực sau ạ:"
        : requestedVoucherType === 1
          ? "Dạ, hiện tại shop đang có các mã giảm giá đơn hàng còn hiệu lực sau ạ:"
          : "Dạ, hiện tại shop đang có các chương trình khuyến mãi còn hiệu lực sau ạ:";

    const textArray = [introText];

      rows.forEach((km, index) => {
        const ngayKT = km.NgayKetThuc
          ? new Date(km.NgayKetThuc).toLocaleDateString("vi-VN")
          : "Không giới hạn";

        const maCodeText = km.MaCode ? ` | Mã: ${km.MaCode}` : "";
        const minimumOrderText = getMinimumOrderText(km.GiaTriToiThieu);
        const maxDiscountText = getMaxDiscountText(km);
        const appliedScopeText = getAppliedScopeText(km);
        const voucherTypeText = getVoucherTypeText(km.LoaiVoucher);

        textArray.push(
          `🎁 ${index + 1}. ${km.TenKhuyenMai}${maCodeText}: Giảm ${formatDiscountValue(km)} | ${minimumOrderText}${maxDiscountText} | ${appliedScopeText} | Loại: ${voucherTypeText} | Còn: ${km.SoLuong} lượt | HSD: ${ngayKT}.`,
        );
      });

      if (maKhachHang) {
        textArray.push(
          "Bạn đã đăng nhập nên có thể vào ví voucher để xem voucher đang có, đã dùng và hết hạn nhé ạ."
        );
      } else {
        textArray.push(
          "Bạn có thể đăng nhập tài khoản để lưu voucher vào ví và chọn mã khi thanh toán nhé ạ.",
        );
      }

      const promotionShopLink = promotionScope.categoryIds.length > 0
        ? buildWebLink(`/home/?category=${promotionScope.categoryIds[0]}`)
        : promotionScope.displayText
          ? buildWebLink(`/home/?search=${encodeURIComponent(promotionScope.displayText)}`)
          : buildWebLink("/home");

      const richContent = [
        {
          type: "description",
          title,
          text: textArray,
        },
        {
          type: "button",
          icon: { type: "storefront", color: "#C06E52" },
          text: promotionScope.displayText
            ? `Xem sản phẩm ${promotionScope.displayText}`
            : "Xem gian hàng",
          link: promotionShopLink,
        },
      ];

      if (maKhachHang) {
        richContent.push({
          type: "button",
          icon: { type: "local_offer", color: "#1b437c" },
          text: "Xem ví voucher của tôi",
          link: buildWebLink("/vouchers"),
        });
      }

      return res.json({
        fulfillmentMessages: [
          {
            payload: {
              richContent: [richContent],
            },
          },
        ],
      });
    }

    const emptyScopeText = promotionScope.displayText
      ? ` cho ${promotionScope.displayText}`
      : "";

    const emptyMessage = requestedVoucherType === 2
      ? `Dạ, hiện tại shop chưa có mã freeship còn hiệu lực${emptyScopeText} hoặc mã freeship đã hết lượt sử dụng. Bạn theo dõi thêm trên website để cập nhật ưu đãi mới nhé ạ.`
      : requestedVoucherType === 1
        ? `Dạ, hiện tại shop chưa có mã giảm giá đơn hàng còn hiệu lực${emptyScopeText} hoặc mã đã hết lượt sử dụng. Bạn theo dõi thêm trên website để cập nhật ưu đãi mới nhé ạ.`
        : `Dạ, hiện tại shop chưa có chương trình khuyến mãi còn hiệu lực${emptyScopeText} hoặc các mã đã hết lượt sử dụng. Bạn theo dõi website để cập nhật đợt sale sắp tới nhé ạ.`;
        return res.json({ fulfillmentText: emptyMessage });
  } catch (error) {
    console.error(error);
    return res.json({
      fulfillmentText:
        "Dạ hệ thống kiểm tra khuyến mãi đang bận một chút, bạn thử lại sau ít phút nhé.",
    });
  }
    } else if (intentName === "Tu_Van_Theo_Danh_Muc") {
    const queryText = req.body.queryResult.queryText || "";

    let danhMuc = parameters.Danh_Muc_San_Pham || "";
    if (Array.isArray(danhMuc)) danhMuc = danhMuc[0] || "";

    const categorySearch = resolveProductNeedSearch({
      danhMucRaw: danhMuc,
      queryText,
    });

    if (categorySearch.searchKeywords.length === 0) {
      return res.json({
        fulfillmentText:
          "Dạ bạn đang quan tâm đến dòng sản phẩm hoặc nhu cầu nào ạ? Ví dụ: đồ phòng bếp, đồ thờ, đồ trang trí, quà tân gia, quà biếu sếp...",
      });
    }

    try {
      let responsePrefix = "";

      if (categorySearch.isNeed) {
        responsePrefix = `Dạ với ${categorySearch.displayText}, em gợi ý một số dòng gốm sứ phù hợp bên em nhé:`;
      } else {
        responsePrefix = `Dạ em gửi bạn tham khảo một số mẫu ${categorySearch.displayText} nổi bật bên em nhé:`;
      }

      let sqlQuery = `
        SELECT
          sp.MaSanPham,
          sp.TenSanPham,
          MIN(bt.Gia) AS GiaTu,
          MIN(ha.DuongDan) AS DuongDan
        FROM SanPham sp
        JOIN DanhMucSanPham dm ON sp.MaDanhMuc = dm.MaDanhMuc
        LEFT JOIN DanhMucSanPham dm_parent ON dm.ParentID = dm_parent.MaDanhMuc
        JOIN BienTheSanPham bt ON sp.MaSanPham = bt.MaSanPham
        LEFT JOIN HinhAnhBienThe ha ON bt.MaBienThe = ha.MaBienThe
        WHERE sp.TrangThai = 1
          AND sp.deleted_at IS NULL
          AND bt.TrangThai = 1
          AND bt.SoLuong > 0
      `;

      const categoryFilter = buildCategorySearchCondition({
        searchKeywords: categorySearch.searchKeywords,
      });

      sqlQuery += categoryFilter.sql;
      const queryParams = [...categoryFilter.params];

      sqlQuery += `
        GROUP BY sp.MaSanPham, sp.TenSanPham
        ORDER BY GiaTu ASC
        LIMIT 5
      `;

      const [rows] = await pool.execute(sqlQuery, queryParams);

      if (rows.length > 0) {
        const listRichContent = [];

        rows.forEach((sp) => {
          const giaFormat = new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(sp.GiaTu);

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
              link: `${domainWeb}/product/${sp.MaSanPham}`,
            },
          ]);
        });

        const searchKeyword =
          categorySearch.searchKeyword || categorySearch.displayText;

        if (searchKeyword) {
          const categoryLink = await buildHomeCategoryOrSearchLink({
            categoryKeywords: categorySearch.searchKeywords || [searchKeyword],
            fallbackSearchKeyword: searchKeyword,
          });

          listRichContent.push([
            {
              type: "button",
              icon: { type: "search", color: "#34A853" },
              text: `Xem thêm ${categorySearch.displayText || searchKeyword}`,
              link: categoryLink,
            },
          ]);
        }

        return res.json({
          fulfillmentMessages: [
            { text: { text: [responsePrefix] } },
            { payload: { richContent: listRichContent } },
          ],
        });
      }

      return res.json({
        fulfillmentText: `Dạ hiện tại shop chưa tìm thấy mẫu phù hợp với ${categorySearch.displayText}. Bạn có thể thử nhu cầu khác như quà tân gia, đồ phong thủy, bình hoa hoặc bộ ấm trà nhé ạ.`,
      });
    } catch (error) {
      console.error(error);
      return res.json({
        fulfillmentText: "Dạ hệ thống đang tải danh mục, bạn chờ chút xíu nhé.",
      });
    }
      } else if (intentName === "Tu_Van_Theo_Menh") {
      const queryText = req.body.queryResult.queryText || "";

      const birthYear = extractBirthYear({
        namSinh: parameters.Nam_Sinh,
        queryText,
      });

      const menhList = toArray(parameters.Menh).filter(Boolean);
      const menhFromBirthYear = getMenhByBirthYear(birthYear);
      const resolvedMenhList =
        menhList.length > 0 ? menhList : toArray(menhFromBirthYear);

      if (resolvedMenhList.length === 0) {
        return res.json({
          fulfillmentText:
            "Dạ để tư vấn phong thủy chính xác hơn, bạn cho shop biết mệnh của mình hoặc năm sinh nhé. Ví dụ: mệnh Kim hoặc sinh năm 2004 ạ.",
        });
      }

      let danhMucRaw = parameters.Danh_Muc_San_Pham || "";
      if (Array.isArray(danhMucRaw)) danhMucRaw = danhMucRaw[0] || "";

      let nganSachRaw = parameters.ngan_sach;
      if (Array.isArray(nganSachRaw)) nganSachRaw = nganSachRaw[0];

      const thuocTinhList = mergeUniqueTextList(
        parameters.Thuoc_Tinh,
        extractCapacityAttributes(queryText),
      );

      const nganSach = extractBudgetAmount({
        nganSachRaw,
        queryText,
        birthYear,
      });

      const categorySearch = resolveProductNeedSearch({
        danhMucRaw,
        queryText,
      });

      try {
        let sqlQuery = `
          SELECT
            sp.MaSanPham,
            sp.TenSanPham,
            MIN(bt.Gia) AS GiaTu,
            COUNT(DISTINCT bt.MaBienThe) AS SoPhanLoai,
            MIN(ha.DuongDan) AS DuongDan
          FROM BienTheSanPham bt
          JOIN SanPham sp ON bt.MaSanPham = sp.MaSanPham
          LEFT JOIN HinhAnhBienThe ha ON bt.MaBienThe = ha.MaBienThe
          LEFT JOIN DanhMucSanPham dm ON sp.MaDanhMuc = dm.MaDanhMuc
          LEFT JOIN DanhMucSanPham dm_parent ON dm.ParentID = dm_parent.MaDanhMuc
          WHERE sp.TrangThai = 1
            AND sp.deleted_at IS NULL
            AND bt.TrangThai = 1
            AND bt.SoLuong > 0
        `;

        const queryParams = [];

        const attributeFilter = buildVariantAttributeFilter({
          thuocTinhList,
          menhList: resolvedMenhList,
        });

        sqlQuery += attributeFilter.sql;
        queryParams.push(...attributeFilter.params);

        const categoryFilter = buildCategorySearchCondition({
          searchKeywords: categorySearch.searchKeywords,
        });

        sqlQuery += categoryFilter.sql;
        queryParams.push(...categoryFilter.params);

        if (nganSach > 0) {
          sqlQuery += ` AND bt.Gia <= ?`;
          queryParams.push(nganSach);
        }

        sqlQuery += `
          GROUP BY sp.MaSanPham, sp.TenSanPham
          ORDER BY SoPhanLoai DESC, GiaTu ASC
          LIMIT 5
        `;

        const [rows] = await pool.execute(sqlQuery, queryParams);

        const menhText = resolvedMenhList.join(", ");
        const categoryText = categorySearch.displayText
          ? `, ${categorySearch.displayText}`
          : "";
        const nganSachText =
          nganSach > 0
            ? ` trong tầm ${new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(nganSach)}`
            : "";

        const birthYearText =
          birthYear && menhList.length === 0
            ? ` Theo năm sinh ${birthYear}, shop tạm xác định bạn thuộc mệnh ${menhText}. Nếu bạn sinh sát Tết âm lịch thì mệnh có thể cần kiểm tra lại theo năm âm lịch.`
            : "";

        if (rows.length > 0) {
          const richContentData = [];

          rows.forEach((sp) => {
            const giaFormat = new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(sp.GiaTu);

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
                subtitle: `Hợp mệnh: ${menhText} | Giá từ: ${giaFormat} | Có ${sp.SoPhanLoai} phân loại phù hợp`,
              },
              {
                type: "button",
                icon: { type: "touch_app", color: "#C06E52" },
                text: "Xem chi tiết",
                link: `${domainWeb}/product/${sp.MaSanPham}`,
              },
            ]);
          });

          if (categorySearch.searchKeyword) {
            const categoryLink = await buildHomeCategoryOrSearchLink({
              categoryKeywords: categorySearch.searchKeywords || [
                categorySearch.searchKeyword,
              ],
              fallbackSearchKeyword: categorySearch.searchKeyword,
            });

            richContentData.push([
              {
                type: "button",
                icon: { type: "search", color: "#34A853" },
                text: `Xem thêm ${categorySearch.displayText || categorySearch.searchKeyword}`,
                link: categoryLink,
              },
            ]);
          }

          return res.json({
            fulfillmentMessages: [
              {
                text: {
                  text: [
                    `Dạ${birthYearText} Với mệnh ${menhText}${categoryText}${nganSachText}, shop gợi ý bạn một số mẫu phù hợp và đang còn hàng sau ạ:`,
                  ],
                },
              },
              {
                payload: {
                  richContent: richContentData,
                },
              },
            ],
          });
        }

        return res.json({
          fulfillmentText: `Dạ hiện tại shop chưa tìm thấy mẫu còn hàng khớp với mệnh ${menhText}${categoryText}${nganSachText}. Bạn có thể thử bỏ bớt điều kiện lọc hoặc tham khảo thêm các dòng phong thủy khác trên website nhé ạ.`,
        });
      } catch (error) {
        console.error(error);
        return res.json({
          fulfillmentText:
            "Dạ hệ thống đang tư vấn sản phẩm theo mệnh hơi bận, bạn vui lòng thử lại sau nhé.",
        });
      }
  } else if (intentName === "Hoi_Tinh_Trang_Ton_Kho") {
    const rawTenSP = parameters.Ten_San_Pham || null;

    if (!rawTenSP) {
      return res.json({
        fulfillmentText: "Dạ bạn muốn kiểm tra tồn kho của sản phẩm nào ạ?",
      });
    }

    const thuocTinhList = mergeUniqueTextList(
      parameters.Thuoc_Tinh,
      extractCapacityAttributes(req.body.queryResult.queryText),
    );
    const menhList = toArray(parameters.Menh);

    const tenSanPham = rawTenSP.trim();

    try {
      let sqlQuery = `
        SELECT
          sp.MaSanPham,
          bt.MaBienThe,
          bt.TenBienThe,
          bt.SoLuong,
          sp.TenSanPham
        FROM BienTheSanPham bt
        JOIN SanPham sp ON bt.MaSanPham = sp.MaSanPham
        WHERE sp.TenSanPham LIKE ?
          AND sp.TrangThai = 1
          AND sp.deleted_at IS NULL
          AND bt.TrangThai = 1
      `;

      const searchTenSP = `%${tenSanPham.replace(/\s+/g, "%")}%`;
      let queryParams = [searchTenSP];

      const attributeFilter = buildVariantAttributeFilter({
        thuocTinhList,
        menhList,
      });

      sqlQuery += attributeFilter.sql;
      queryParams.push(...attributeFilter.params);

      sqlQuery += `
        ORDER BY bt.SoLuong > 0 DESC, bt.SoLuong DESC, bt.MaBienThe ASC
      `;

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
            r.SoLuong > 0 ? `Còn ${r.SoLuong} sản phẩm` : "Tạm hết hàng";
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
  } else if (intentName === "Khieu_Nai_Bao_Loi") {
    const queryText = String(req.body.queryResult.queryText || "");

    const normalizedQueryText = queryText
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d");

    const isReturnIssueQuestion =
      /(doi\s*tra|tra\s*hang|doi\s*hang|hoan\s*tien|giao\s*sai|sai\s*mau|sai\s*san\s*pham|nham\s*san\s*pham|thieu\s*hang|giao\s*thieu|khong\s*du\s*hang|\b(vo|be)\b|hong\s*(khi\s*(nhan|giao|mo)|do\s*van\s*chuyen|luc\s*nhan)|van\s*chuyen.*\b(hong|vo|be|nut|ran)\b|\b(hong|vo|be|nut|ran)\b.*(van\s*chuyen|giao|nhan)|\b(nut|ran)\b.*(khi\s*(giao|nhan|mo)|do\s*van\s*chuyen|luc\s*nhan))/i.test(
        normalizedQueryText,
      );

    const isWarrantyLikeQuestion =
      /(bao\s*hanh|loi\s*men|loi\s*nha\s*san\s*xuat|loi\s*san\s*xuat|loi\s*nung|soc\s*nhiet)/i.test(
        normalizedQueryText,
      );

    const textResponse = maKhachHang
      ? isWarrantyLikeQuestion && !isReturnIssueQuestion
        ? "Dạ CeramicShop rất xin lỗi bạn về trải nghiệm chưa tốt này. Với lỗi men, lỗi sản xuất, lỗi nung hoặc trường hợp cần bảo hành, bạn có thể gửi yêu cầu bảo hành trên website để shop kiểm tra đúng quy trình ạ."
        : "Dạ CeramicShop rất xin lỗi bạn về trải nghiệm chưa tốt này. Với trường hợp vỡ/hỏng khi giao, giao sai mẫu, thiếu hàng, đổi trả hoặc hoàn tiền, bạn nên tạo yêu cầu đổi trả/hoàn tiền trên website để admin kiểm tra và xử lý đúng quy trình ạ."
      : "Dạ CeramicShop rất xin lỗi bạn về trải nghiệm chưa tốt này. Để tạo yêu cầu đổi trả/hoàn tiền hoặc gửi yêu cầu bảo hành, bạn vui lòng đăng nhập tài khoản đã đặt hàng trên website trước nhé ạ.";

    const guideText = [
      "📌 Bạn nên chuẩn bị ảnh/video minh chứng tình trạng sản phẩm, đặc biệt với trường hợp vỡ hỏng khi vận chuyển, giao sai mẫu hoặc thiếu hàng.",
    ];

    if (isReturnIssueQuestion) {
      guideText.push(
        "🔁 Với vỡ/hỏng khi giao, giao sai mẫu, thiếu hàng hoặc cần hoàn tiền: bạn ưu tiên vào mục Đổi trả / Hoàn tiền để chọn đơn hàng đã hoàn thành và gửi yêu cầu.",
      );
    } else {
      guideText.push(
        "🔁 Nếu muốn đổi/trả hàng hoặc hoàn tiền, bạn vào mục Đổi trả / Hoàn tiền để chọn đơn hàng đã hoàn thành và gửi yêu cầu.",
      );
    }

    if (isWarrantyLikeQuestion) {
      guideText.push(
        "🛡️ Với lỗi men, lỗi sản xuất, lỗi nung, sốc nhiệt hoặc yêu cầu bảo hành: bạn có thể vào mục Bảo hành của tôi để gửi/theo dõi yêu cầu bảo hành.",
      );
    }

    guideText.push(
      "Lưu ý: Chatbot chỉ hướng dẫn thao tác, không tự tạo phiếu đổi trả, không hoàn tiền và không cập nhật tồn kho trực tiếp ạ.",
    );

    const richContent = [
      {
        type: "description",
        title: "Hướng xử lý khiếu nại / báo lỗi",
        text: guideText,
      },
    ];

    if (maKhachHang) {
      if (isWarrantyLikeQuestion && !isReturnIssueQuestion) {
        richContent.push({
          type: "button",
          icon: { type: "verified_user", color: "#34A853" },
          text: "Gửi yêu cầu bảo hành",
          link: buildWebLink("/warranties"),
        });
      }

      richContent.push({
        type: "button",
        icon: { type: "assignment_return", color: "#1b437c" },
        text: "Tạo yêu cầu đổi trả / hoàn tiền",
        link: buildWebLink("/returns"),
      });

      if (isWarrantyLikeQuestion && isReturnIssueQuestion) {
        richContent.push({
          type: "button",
          icon: { type: "verified_user", color: "#34A853" },
          text: "Gửi yêu cầu bảo hành",
          link: buildWebLink("/warranties"),
        });
      }
    } else {
      richContent.push({
        type: "button",
        icon: { type: "login", color: "#1b437c" },
        text: "Đăng nhập để tạo yêu cầu",
        link: buildWebLink("/login"),
      });
    }

    richContent.push(
      {
        type: "button",
        icon: { type: "assignment", color: "#C06E52" },
        text: "Xem chính sách đổi trả",
        link: buildWebLink("/support/chinh-sach-doi-tra"),
      },
      {
        type: "button",
        icon: { type: "chat", color: "#0068FF" },
        text: "Gửi ảnh/video qua Zalo",
        link: zaloLink,
      },
      {
        type: "button",
        icon: { type: "phone", color: "#34A853" },
        text: "Gọi CSKH",
        link: phoneLink,
      },
    );

    return res.json({
      fulfillmentMessages: [
        { text: { text: [textResponse] } },
        {
          payload: {
            richContent: [richContent],
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

    const capacityAttributes = extractCapacityAttributes(queryText);

    const thuocTinhList = mergeUniqueTextList(
      parameters.Thuoc_Tinh,
      capacityAttributes,
    );

    const menhList = toArray(parameters.Menh);

    const hasExplicitMoneyUnit =
      /(\d+(?:[\.,]\d+)*)\s*(triệu|tr|củ|k|ngàn|nghìn|đ|₫|vnd|vnđ|đồng|dong)(?=$|[\s,.!?;:])/i.test(
        queryText,
      );

    const hasCapacityButNoMoneyUnit =
      capacityAttributes.length > 0 && !hasExplicitMoneyUnit;

    if (hasCapacityButNoMoneyUnit) {
      return res.json({
        fulfillmentText:
          `Dạ "${capacityAttributes.join(", ")}" là dung tích sản phẩm, chưa phải ngân sách ạ. Bạn muốn tìm dòng sản phẩm nào và khoảng giá bao nhiêu để em tư vấn chính xác hơn nhé?`,
      });
    }

    const nganSach = extractBudgetAmount({
      nganSachRaw,
      queryText,
      birthYear: null,
    });

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
                WHERE sp.TrangThai = 1
                  AND sp.deleted_at IS NULL
                  AND bt.TrangThai = 1
                  AND bt.SoLuong > 0
                  AND bt.Gia <= ?
            `;

      let queryParams = [nganSach];

      const ignoreWords = [
        "lít",
        "lit",
        "l",
        "củ",
        "k",
        "tr",
        "triệu",
        "ngàn",
        "nghìn",
        "đ",
        "₫",
        "vnd",
        "vnđ",
        "đồng",
        "dong",
      ];
      if (tenSPRaw && ignoreWords.includes(tenSPRaw.toLowerCase().trim())) {
        tenSPRaw = "";
      }
      if (danhMucRaw && ignoreWords.includes(danhMucRaw.toLowerCase().trim())) {
        danhMucRaw = "";
      }

      let searchKeyword = tenSPRaw || danhMucRaw;

      const categorySearch = resolveProductNeedSearch({
        danhMucRaw: searchKeyword,
        queryText,
      });

      if (categorySearch.searchKeywords.length > 0) {
        const categoryFilter = buildCategorySearchCondition({
          searchKeywords: categorySearch.searchKeywords,
        });

        sqlQuery += categoryFilter.sql;
        queryParams.push(...categoryFilter.params);

        searchKeyword = categorySearch.displayText || searchKeyword;
      }

      const attributeFilter = buildVariantAttributeFilter({
        thuocTinhList,
        menhList,
      });

      sqlQuery += attributeFilter.sql;
      queryParams.push(...attributeFilter.params);

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
          const searchLink = await buildHomeCategoryOrSearchLink({
            categoryKeywords: categorySearch.searchKeywords || [searchKeyword],
            fallbackSearchKeyword: searchKeyword,
          });

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
      const queryText = String(req.body.queryResult.queryText || "");

      const normalizedQueryText = queryText
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d");

      const isBestSellerQuestion =
        /(ban\s*chay|mua\s*nhieu|duoc\s*mua\s*nhieu|khach\s*mua\s*nhieu|mat\s*hang\s*duoc\s*mua|top\s*ban|best\s*seller)/i.test(
          normalizedQueryText,
        );

      const isMostViewedQuestion =
        /(xem\s*nhieu|truy\s*cap\s*nhieu|duoc\s*xem\s*nhieu|nhieu\s*nguoi\s*xem|quan\s*tam\s*nhieu)/i.test(
          normalizedQueryText,
        );

      const orderBy = isBestSellerQuestion
        ? "TongDaBan DESC, SoDonDaMua DESC, sp.LuotXem DESC, GiaTu ASC"
        : isMostViewedQuestion
          ? "sp.LuotXem DESC, TongDaBan DESC, GiaTu ASC"
          : "DiemNoiBat DESC, TongDaBan DESC, sp.LuotXem DESC, GiaTu ASC";

      const bestSellerOnlyCondition = isBestSellerQuestion
        ? "AND COALESCE(soldAgg.TongDaBan, 0) > 0"
        : "";

      const introText = isBestSellerQuestion
        ? "Dạ, đây là các mẫu được khách hàng mua nhiều trong các đơn đã giao thành công và hiện còn hàng tại shop ạ:"
        : isMostViewedQuestion
          ? "Dạ, đây là các mẫu được nhiều khách hàng xem và quan tâm nhất tại CeramicShop hiện nay ạ:"
          : "Dạ, đây là các mẫu nổi bật, được khách hàng quan tâm và mua nhiều tại CeramicShop hiện nay ạ:";

      try {
        const sqlQuery = `
          SELECT
            sp.MaSanPham,
            sp.TenSanPham,
            sp.LuotXem,
            priceAgg.GiaTu,
            COALESCE(imageAgg.DuongDan, sp.Thumbnail) AS DuongDan,
            COALESCE(soldAgg.TongDaBan, 0) AS TongDaBan,
            COALESCE(soldAgg.SoDonDaMua, 0) AS SoDonDaMua,
            (
              COALESCE(soldAgg.TongDaBan, 0) * 20
              + COALESCE(sp.LuotXem, 0)
            ) AS DiemNoiBat
          FROM SanPham sp
          JOIN (
            SELECT
              MaSanPham,
              MIN(Gia) AS GiaTu,
              SUM(SoLuong) AS TongTonKho
            FROM BienTheSanPham
            WHERE TrangThai = 1
              AND SoLuong > 0
            GROUP BY MaSanPham
          ) priceAgg ON priceAgg.MaSanPham = sp.MaSanPham
          LEFT JOIN (
            SELECT
              bt.MaSanPham,
              SUM(ctdh.SoLuong) AS TongDaBan,
              COUNT(DISTINCT dh.MaDonHang) AS SoDonDaMua
            FROM ChiTietDonHang ctdh
            JOIN DonHang dh ON dh.MaDonHang = ctdh.MaDonHang
            JOIN BienTheSanPham bt ON bt.MaBienThe = ctdh.MaBienThe
            WHERE dh.TrangThaiDonHang = 3
            GROUP BY bt.MaSanPham
          ) soldAgg ON soldAgg.MaSanPham = sp.MaSanPham
          LEFT JOIN (
            SELECT
              bt.MaSanPham,
              MIN(ha.DuongDan) AS DuongDan
            FROM BienTheSanPham bt
            LEFT JOIN HinhAnhBienThe ha ON ha.MaBienThe = bt.MaBienThe
            WHERE bt.TrangThai = 1
            AND bt.SoLuong > 0
            GROUP BY bt.MaSanPham
          ) imageAgg ON imageAgg.MaSanPham = sp.MaSanPham
          WHERE sp.TrangThai = 1
            AND sp.deleted_at IS NULL
            ${bestSellerOnlyCondition}
          ORDER BY ${orderBy}
          LIMIT 5
        `;

        const [rows] = await pool.execute(sqlQuery);

        if (rows.length > 0) {
          const listRichContent = [];

          rows.forEach((sp) => {
            const giaFormat = new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(sp.GiaTu);

            const tongDaBan = Number(sp.TongDaBan || 0);
            const luotXem = Number(sp.LuotXem || 0);

            const popularityText =
              tongDaBan > 0
                ? `Đã mua: ${tongDaBan} sản phẩm | Lượt xem: ${luotXem}`
                : `Lượt xem: ${luotXem} | Đang được quan tâm`;

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
                subtitle: `Giá tham khảo từ: ${giaFormat} | ${popularityText}`,
              },
              {
                type: "button",
                icon: { type: "local_fire_department", color: "#FF5722" },
                text: "Xem chi tiết",
                link: linkSanPham,
              },
            ]);
          });

          listRichContent.push([
            {
              type: "button",
              icon: { type: "storefront", color: "#34A853" },
              text: "Xem thêm sản phẩm tại gian hàng",
              link: buildWebLink("/home"),
            },
          ]);

          return res.json({
            fulfillmentMessages: [
              {
                text: {
                  text: [introText],
                },
              },
              {
                payload: {
                  richContent: listRichContent,
                },
              },
            ],
          });
        }

        return res.json({
          fulfillmentText:
            "Dạ hiện tại hệ thống đang cập nhật danh sách sản phẩm nổi bật. Bạn có thể vào gian hàng để xem thêm các mẫu gốm sứ đang có nhé ạ.",
        });
      } catch (error) {
        console.error(error);
        return res.json({
          fulfillmentText:
            "Dạ hệ thống đang tải dữ liệu sản phẩm nổi bật, bạn chờ chút xíu rồi thử lại nhé.",
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
                  link: buildWebLink("/home"),
                },
                {
                  type: "button",
                  icon: { type: "local_fire_department", color: "#FF5722" },
                  text: "Xem mẫu được quan tâm & mua nhiều",
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
                      "💳 Thanh toán: Tiền mặt khi nhận hàng, MoMo và ZaloPay.",
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
    } else if (intentName === "Hoi_San_Pham_Dat_Nhat") {
    try {
      const sqlQuery = `
        SELECT
          sp.MaSanPham,
          sp.TenSanPham,
          priceAgg.GiaCaoNhat,
          COALESCE(imageAgg.DuongDan, sp.Thumbnail) AS DuongDan
        FROM SanPham sp
        JOIN (
          SELECT
            MaSanPham,
            MAX(Gia) AS GiaCaoNhat
          FROM BienTheSanPham
          WHERE TrangThai = 1
            AND SoLuong > 0
          GROUP BY MaSanPham
        ) priceAgg ON priceAgg.MaSanPham = sp.MaSanPham
        LEFT JOIN (
          SELECT
            bt.MaSanPham,
            MIN(ha.DuongDan) AS DuongDan
          FROM BienTheSanPham bt
          LEFT JOIN HinhAnhBienThe ha ON ha.MaBienThe = bt.MaBienThe
          WHERE bt.TrangThai = 1
            AND bt.SoLuong > 0
          GROUP BY bt.MaSanPham
        ) imageAgg ON imageAgg.MaSanPham = sp.MaSanPham
        WHERE sp.TrangThai = 1
          AND sp.deleted_at IS NULL
        ORDER BY priceAgg.GiaCaoNhat DESC
        LIMIT 3
      `;

      const [rows] = await pool.execute(sqlQuery);

      if (rows.length > 0) {
        const listRichContent = [];

        rows.forEach((sp) => {
          const giaFormat = new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(sp.GiaCaoNhat);

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
              subtitle: `Mức giá cao nhất đang bán: ${giaFormat}`,
            },
            {
              type: "button",
              icon: { type: "diamond", color: "#E91E63" },
              text: "Xem chi tiết mẫu cao cấp",
              link: linkSanPham,
            },
          ]);
        });

        return res.json({
          fulfillmentMessages: [
            {
              text: {
                text: [
                  "Dạ, đây là những mẫu sản phẩm cao cấp, còn hàng và có mức giá cao nhất tại CeramicShop hiện nay. Rất phù hợp để làm quà biếu tặng sang trọng ạ:",
                ],
              },
            },
            { payload: { richContent: listRichContent } },
          ],
        });
      }

      return res.json({
        fulfillmentText:
          "Dạ hiện tại shop chưa có mẫu cao cấp còn hàng để gợi ý. Bạn có thể xem thêm trên gian hàng nhé ạ.",
      });
    } catch (error) {
      console.error(error);
      return res.json({
        fulfillmentText:
          "Dạ hệ thống đang tải dữ liệu, bạn chờ chút xíu nhé.",
      });
    }
  } else if (intentName === "Hoi_San_Pham_Re_Nhat") {
    try {
      const sqlQuery = `
        SELECT
          sp.MaSanPham,
          sp.TenSanPham,
          priceAgg.GiaThapNhat,
          COALESCE(imageAgg.DuongDan, sp.Thumbnail) AS DuongDan
        FROM SanPham sp
        JOIN (
          SELECT
            MaSanPham,
            MIN(Gia) AS GiaThapNhat
          FROM BienTheSanPham
          WHERE TrangThai = 1
            AND SoLuong > 0
          GROUP BY MaSanPham
        ) priceAgg ON priceAgg.MaSanPham = sp.MaSanPham
        LEFT JOIN (
          SELECT
            bt.MaSanPham,
            MIN(ha.DuongDan) AS DuongDan
          FROM BienTheSanPham bt
          LEFT JOIN HinhAnhBienThe ha ON ha.MaBienThe = bt.MaBienThe
          WHERE bt.TrangThai = 1
            AND bt.SoLuong > 0
          GROUP BY bt.MaSanPham
        ) imageAgg ON imageAgg.MaSanPham = sp.MaSanPham
        WHERE sp.TrangThai = 1
          AND sp.deleted_at IS NULL
        ORDER BY priceAgg.GiaThapNhat ASC
        LIMIT 3
      `;

      const [rows] = await pool.execute(sqlQuery);

      if (rows.length > 0) {
        const listRichContent = [];

        rows.forEach((sp) => {
          const giaFormat = new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(sp.GiaThapNhat);

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
              subtitle: `Giá đang bán chỉ từ: ${giaFormat}`,
            },
            {
              type: "button",
              icon: { type: "local_offer", color: "#4CAF50" },
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
                  "Dạ, shop gửi bạn những mẫu còn hàng có mức giá mềm và dễ tiếp cận nhất nhưng chất lượng vẫn đảm bảo nhé:",
                ],
              },
            },
            { payload: { richContent: listRichContent } },
          ],
        });
      }

      return res.json({
        fulfillmentText:
          "Dạ hiện tại shop chưa có mẫu giá mềm còn hàng để gợi ý. Bạn có thể xem thêm trên gian hàng nhé ạ.",
      });
    } catch (error) {
      console.error(error);
      return res.json({
        fulfillmentText:
          "Dạ hệ thống đang tải dữ liệu, bạn chờ chút xíu nhé.",
      });
    }
  } else if (intentName === "Gap_Nhan_Vien_Tu_Van") {
  const textResponse =
    "Dạ được ạ, bạn có thể liên hệ trực tiếp nhân viên CeramicShop qua các kênh dưới đây để được hỗ trợ nhanh nhất nhé.";

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
                text: "Gọi Hotline",
                link: phoneLink,
              },
              {
                type: "button",
                icon: { type: "chat", color: "#0068FF" },
                text: "Chat Zalo",
                link: zaloLink,
              },
              {
                type: "button",
                icon: { type: "facebook", color: "#0866FF" },
                text: "Nhắn Fanpage",
                link: fbLink,
              },
              {
                type: "button",
                icon: { type: "mail", color: "#EA4335" },
                text: "Gửi Email",
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
