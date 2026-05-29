import ExcelJS from "exceljs";
import axios from "axios";

export const VIETNAM_TIME_ZONE = "Asia/Ho_Chi_Minh";
export const SHOP_NAME = "CERAMIC-SHOP";
export const SHOP_SLOGAN = "Tinh hoa gốm sứ Việt";
export const REPORT_LOGO_URL =
  "https://res.cloudinary.com/dcmwz0uis/image/upload/v1773973973/logo_otxplb.png";

const DEFAULT_PAGE_MARGINS = {
  left: 0.3,
  right: 0.3,
  top: 0.5,
  bottom: 0.5,
  header: 0.2,
  footer: 0.2,
};

const TABLE_BORDER = {
  top: { style: "thin", color: { argb: "FFD9E2F3" } },
  left: { style: "thin", color: { argb: "FFD9E2F3" } },
  bottom: { style: "thin", color: { argb: "FFD9E2F3" } },
  right: { style: "thin", color: { argb: "FFD9E2F3" } },
};

export const formatDateTimeVN = (value = new Date()) => {
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

export const formatDateOnlyVN = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: VIETNAM_TIME_ZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

export const buildDateRangeText = (startDate, endDate) => {
  if (startDate && endDate) {
    return `Thời gian dữ liệu: Từ ${formatDateOnlyVN(
      startDate,
    )} đến ${formatDateOnlyVN(endDate)}`;
  }

  if (startDate) {
    return `Thời gian dữ liệu: Từ ${formatDateOnlyVN(startDate)}`;
  }

  if (endDate) {
    return `Thời gian dữ liệu: Đến ${formatDateOnlyVN(endDate)}`;
  }

  return "Thời gian dữ liệu: Tất cả";
};

export const createReportWorkbook = () => {
  const workbook = new ExcelJS.Workbook();

  workbook.creator = SHOP_NAME;
  workbook.created = new Date();

  return workbook;
};

export const createReportWorksheet = (
  workbook,
  name,
  {
    columnWidths = [],
    rowHeights = [24, 24, 22, 14, 34, 22, 22, 14],
    zoomScale = 90,
    margins = DEFAULT_PAGE_MARGINS,
    lastColumnNumber = columnWidths.length,
  } = {},
) => {
  const worksheet = workbook.addWorksheet(name, {
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
      margins,
    },
  });

  worksheet.views = [
    {
      state: "frozen",
      ySplit: 9,
      showGridLines: false,
      zoomScale,
    },
  ];

  columnWidths.forEach((width, index) => {
    worksheet.getColumn(index + 1).width = width;
  });

  rowHeights.forEach((height, index) => {
    worksheet.getRow(index + 1).height = height;
  });

  for (let row = 1; row <= 8; row += 1) {
    for (let colNumber = 1; colNumber <= lastColumnNumber; colNumber += 1) {
      worksheet.getCell(row, colNumber).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFFFFFFF" },
      };
    }
  }

  return worksheet;
};

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

export const addRemoteImage = async (
  workbook,
  worksheet,
  url,
  imageRange,
  size,
) => {
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

export const buildReportHeader = async ({
  workbook,
  worksheet,
  lastColumn,
  title,
  subtitle,
  brandEndColumn = "E",
}) => {
  worksheet.mergeCells("A1:A3");
  worksheet.mergeCells(`B1:${brandEndColumn}2`);
  worksheet.mergeCells(`B3:${brandEndColumn}3`);

  await addRemoteImage(
    workbook,
    worksheet,
    REPORT_LOGO_URL,
    { tl: { col: 0.15, row: 0.32 } },
    { width: 100, height: 100 },
  );

  const shopNameCell = worksheet.getCell("B1");
  shopNameCell.value = SHOP_NAME;
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
  sloganCell.value = SHOP_SLOGAN;
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

  worksheet.mergeCells(`A4:${lastColumn}4`);
  worksheet.getCell("A4").border = {
    bottom: { style: "medium", color: { argb: "FF2F6B3F" } },
  };

  worksheet.mergeCells(`A5:${lastColumn}5`);
  const reportTitleCell = worksheet.getCell("A5");
  reportTitleCell.value = title;
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

  worksheet.mergeCells(`A6:${lastColumn}6`);
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

  if (subtitle) {
    worksheet.mergeCells(`A7:${lastColumn}7`);
    const subtitleCell = worksheet.getCell("A7");
    subtitleCell.value = subtitle;
    subtitleCell.font = {
      name: "Arial",
      size: 11,
      italic: true,
      color: { argb: "FF666666" },
    };
    subtitleCell.alignment = {
      vertical: "middle",
      horizontal: "center",
    };
  }
};

export const styleHeaderRow = (row, height = 32) => {
  row.height = height;
  row.eachCell((cell) => {
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
    cell.border = TABLE_BORDER;
  });
};

export const styleDataRow = (row, centerColumns = []) => {
  row.eachCell((cell, colNumber) => {
    cell.font = {
      name: "Arial",
      size: 11,
    };
    cell.alignment = {
      vertical: "middle",
      horizontal: centerColumns.includes(colNumber) ? "center" : "left",
      wrapText: true,
    };
    cell.border = TABLE_BORDER;
  });
};

export const hideRowsAfter = (worksheet, rowNumber, maxRow = 300) => {
  for (let currentRow = rowNumber + 1; currentRow <= maxRow; currentRow += 1) {
    worksheet.getRow(currentRow).hidden = true;
  }
};

export const hideColumnsAfter = (worksheet, columnNumber, maxColumn = 30) => {
  for (
    let currentColumn = columnNumber + 1;
    currentColumn <= maxColumn;
    currentColumn += 1
  ) {
    worksheet.getColumn(currentColumn).hidden = true;
  }
};
