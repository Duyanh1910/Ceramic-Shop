import { CategoryModel, ProductModel } from "../../models/index.js";
import ExcelJS from "exceljs";
import axios from "axios";

const VIETNAM_TIME_ZONE = "Asia/Ho_Chi_Minh";
const LOGO_URL =
  "https://res.cloudinary.com/dcmwz0uis/image/upload/v1773973973/logo_otxplb.png";

const REPORT_LAST_COLUMN = 6;
const EXCEL_LAST_COLUMN = 16384;
const PRODUCT_IMAGE_SIZE = { width: 52, height: 52 };

const formatDateTimeVN = (value = new Date()) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: VIETNAM_TIME_ZONE,
    hour12: false,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
};

const normalizeSortOrder = (order) =>
  String(order).toUpperCase() === "ASC" ? "ASC" : "DESC";

const getExcelSupportedImageUrl = (url = "") => {
  if (!url.includes("res.cloudinary.com") || !url.includes("/image/upload/")) {
    return url;
  }

  if (url.includes("/image/upload/f_png/")) {
    return url;
  }

  return url.replace("/image/upload/", "/image/upload/f_png/");
};

const getImageExtension = (url = "", contentType = "") => {
  const normalizedContentType = String(contentType).toLowerCase();
  const normalizedUrl = String(url).split("?")[0].toLowerCase();

  if (normalizedContentType.includes("png") || normalizedUrl.endsWith(".png")) {
    return "png";
  }

  if (
    normalizedContentType.includes("jpeg") ||
    normalizedContentType.includes("jpg") ||
    normalizedUrl.endsWith(".jpeg") ||
    normalizedUrl.endsWith(".jpg")
  ) {
    return "jpeg";
  }

  return null;
};

const addRemoteImage = async (workbook, worksheet, url, imageRange, size) => {
  if (!url) return;

  try {
    const imageUrl = getExcelSupportedImageUrl(url);

    const response = await axios.get(imageUrl, {
      responseType: "arraybuffer",
      timeout: 10000,
    });

    const extension = getImageExtension(
      imageUrl,
      response.headers?.["content-type"],
    );

    if (!extension) return;

    const imageId = workbook.addImage({
      buffer: Buffer.from(response.data),
      extension,
    });

    worksheet.addImage(imageId, {
      ...imageRange,
      ext: size,
      editAs: "oneCell",
    });
  } catch (error) {
    console.error("Không tải được hình ảnh:", error.message);
  }
};

export const getMostViewedProductsService = async ({ order = "DESC" } = {}) => {
  const limit = 10;
  const sortOrder = normalizeSortOrder(order);

  const mostViewed = await ProductModel.findAll({
    attributes: [
      "MaSanPham",
      "TenSanPham",
      "ThuongHieu",
      "LuotXem",
      "Thumbnail",
    ],
    order: [["LuotXem", sortOrder]],
    limit,
    raw: true,
  });

  return mostViewed;
};

export const exportMostViewedProductsXlsxService = async ({
  order = "DESC",
} = {}) => {
  const sortOrder = normalizeSortOrder(order);

  const products = await ProductModel.findAll({
    attributes: [
      "MaSanPham",
      "TenSanPham",
      "ThuongHieu",
      "LuotXem",
      "Thumbnail",
      "MoTa",
    ],
    order: [["LuotXem", sortOrder]],
    include: [
      {
        model: CategoryModel,
        attributes: ["TenDanhMuc"],
      },
    ],
  });

  const workbook = new ExcelJS.Workbook();

  workbook.creator = "CERAMIC-SHOP";
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet("Lượt xem sản phẩm", {
    properties: {
      defaultRowHeight: 24,
    },
    pageSetup: {
      paperSize: 9,
      orientation: "landscape",
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      horizontalCentered: true,
      margins: {
        left: 0.3,
        right: 0.3,
        top: 0.5,
        bottom: 0.5,
        header: 0.2,
        footer: 0.2,
      },
    },
  });

  worksheet.views = [
    {
      state: "frozen",
      ySplit: 9,
      showGridLines: false,
      zoomScale: 90,
    },
  ];

  const colWidths = [18, 62, 28, 34, 18, 78];

  colWidths.forEach((width, index) => {
    worksheet.getColumn(index + 1).width = width;
  });

  worksheet.getRow(1).height = 28;
  worksheet.getRow(2).height = 28;
  worksheet.getRow(3).height = 26;
  worksheet.getRow(4).height = 14;
  worksheet.getRow(5).height = 34;
  worksheet.getRow(6).height = 22;
  worksheet.getRow(7).height = 22;
  worksheet.getRow(8).height = 14;

  for (let row = 1; row <= 8; row += 1) {
    for (let colNumber = 1; colNumber <= 6; colNumber += 1) {
      worksheet.getCell(row, colNumber).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFFFFFFF" },
      };
    }
  }

  worksheet.mergeCells("A1:A3");
  worksheet.mergeCells("B1:D2");
  worksheet.mergeCells("B3:D3");

  await addRemoteImage(
    workbook,
    worksheet,
    LOGO_URL,
    { tl: { col: 0.15, row: 0.32 } },
    { width: 100, height: 100 },
  );

  const shopNameCell = worksheet.getCell("B1");
  shopNameCell.value = "CERAMIC-SHOP";
  shopNameCell.font = {
    name: "Times New Roman",
    size: 22,
    bold: true,
    color: { argb: "FF173B63" },
  };
  shopNameCell.alignment = {
    vertical: "bottom",
    horizontal: "left",
  };

  const sloganCell = worksheet.getCell("B3");
  sloganCell.value = "Tinh hoa gốm sứ Việt";
  sloganCell.font = {
    name: "Arial",
    size: 11,
    italic: true,
    color: { argb: "FFC28A5D" },
  };
  sloganCell.alignment = {
    vertical: "top",
    horizontal: "left",
  };

  worksheet.mergeCells("A4:F4");
  worksheet.getCell("A4").border = {
    bottom: {
      style: "medium",
      color: { argb: "FF2F6B3F" },
    },
  };

  worksheet.mergeCells("A5:F5");
  const reportTitleCell = worksheet.getCell("A5");
  reportTitleCell.value = "BÁO CÁO LƯỢT XEM SẢN PHẨM CỦA KHÁCH HÀNG";
  reportTitleCell.font = {
    name: "Arial",
    size: 18,
    bold: true,
    color: { argb: "FF173B63" },
  };
  reportTitleCell.alignment = {
    vertical: "middle",
    horizontal: "center",
  };

  worksheet.mergeCells("A6:F6");
  const exportDateCell = worksheet.getCell("A6");
  exportDateCell.value = `Ngày xuất: ${formatDateTimeVN(new Date())}`;
  exportDateCell.font = {
    name: "Arial",
    size: 11,
    italic: true,
    color: { argb: "FF666666" },
  };
  exportDateCell.alignment = {
    vertical: "middle",
    horizontal: "center",
  };

  worksheet.mergeCells("A7:F7");
  const sortCell = worksheet.getCell("A7");
  sortCell.value = `Sắp xếp theo lượt xem: ${
    sortOrder === "ASC" ? "Tăng dần" : "Giảm dần"
  }`;
  sortCell.font = {
    name: "Arial",
    size: 11,
    italic: true,
    color: { argb: "FF666666" },
  };
  sortCell.alignment = {
    vertical: "middle",
    horizontal: "center",
  };

  const headers = [
    "Mã sản phẩm",
    "Sản phẩm",
    "Thương hiệu",
    "Danh mục sản phẩm",
    "Lượt xem",
    "Mô tả",
  ];

  const headerRow = worksheet.getRow(9);
  headerRow.values = headers;
  headerRow.height = 32;

  headerRow.eachCell((cell) => {
    cell.font = {
      name: "Arial",
      size: 11,
      bold: true,
      color: { argb: "FFFFFFFF" },
    };

    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF1F4E78" },
    };

    cell.alignment = {
      vertical: "middle",
      horizontal: "center",
      wrapText: true,
    };

    cell.border = {
      top: { style: "thin", color: { argb: "FFD9E2F3" } },
      left: { style: "thin", color: { argb: "FFD9E2F3" } },
      bottom: { style: "thin", color: { argb: "FFD9E2F3" } },
      right: { style: "thin", color: { argb: "FFD9E2F3" } },
    };
  });

  for (const [index, productInstance] of products.entries()) {
    const product = productInstance.get({ plain: true });
    const rowNumber = 10 + index;
    const row = worksheet.getRow(rowNumber);

    row.values = [
      product.MaSanPham,
      product.TenSanPham || "",
      product.ThuongHieu || "",
      product.DanhMucSanPham?.TenDanhMuc || "",
      Number(product.LuotXem) || 0,
      product.MoTa || "",
    ];

    row.height = 72;

    row.eachCell((cell, colNumber) => {
      cell.font = {
        name: "Arial",
        size: 11,
      };

      cell.alignment = {
        vertical: "middle",
        horizontal: [1, 5].includes(colNumber) ? "center" : "left",
        wrapText: true,
      };

      cell.border = {
        top: { style: "thin", color: { argb: "FFD9E2F3" } },
        left: { style: "thin", color: { argb: "FFD9E2F3" } },
        bottom: { style: "thin", color: { argb: "FFD9E2F3" } },
        right: { style: "thin", color: { argb: "FFD9E2F3" } },
      };
    });

    const productCell = row.getCell(2);
    productCell.alignment = {
      vertical: "middle",
      horizontal: "left",
      wrapText: true,
      indent: product.Thumbnail ? 7 : 0,
    };
    productCell.font = {
      name: "Arial",
      size: 11,
      bold: true,
      color: { argb: "FF173B63" },
    };

    await addRemoteImage(
      workbook,
      worksheet,
      product.Thumbnail,
      {
        tl: { col: 1.08, row: rowNumber - 0.82 },
      },
      PRODUCT_IMAGE_SIZE,
    );
  }

  worksheet.getColumn(5).numFmt = "0";
  worksheet.autoFilter = "A9:F9";

  const lastDataRow = 9 + products.length;

  worksheet.mergeCells(`A${lastDataRow + 2}:F${lastDataRow + 2}`);
  const totalCell = worksheet.getCell(`A${lastDataRow + 2}`);
  totalCell.value = `Tổng số sản phẩm: ${products.length}`;
  totalCell.font = {
    name: "Arial",
    size: 12,
    bold: true,
    color: { argb: "FF173B63" },
  };
  totalCell.alignment = {
    vertical: "middle",
    horizontal: "right",
  };

  const footerRow = lastDataRow + 2;

  for (
    let colNumber = REPORT_LAST_COLUMN + 1;
    colNumber <= EXCEL_LAST_COLUMN;
    colNumber += 1
  ) {
    worksheet.getColumn(colNumber).hidden = true;
  }

  const minVisibleRows = Math.max(footerRow, 25);

  for (let rowNumber = minVisibleRows + 1; rowNumber <= 300; rowNumber += 1) {
    worksheet.getRow(rowNumber).hidden = true;
  }

  worksheet.pageSetup.printArea = `A1:F${Math.max(footerRow, 9)}`;

  const buffer = await workbook.xlsx.writeBuffer();

  return buffer;
};
