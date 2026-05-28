import { CustomerModel, OrderModel } from "../../models/index.js";
import { Op } from "sequelize";
import ExcelJS from "exceljs";
import axios from "axios";

const VIETNAM_TIME_ZONE = "Asia/Ho_Chi_Minh";
const LOGO_URL =
  "https://res.cloudinary.com/dcmwz0uis/image/upload/v1773973973/logo_otxplb.png";

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

const formatDateOnlyVN = (value) => {
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

const getDateKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0",
  )}-${String(date.getDate()).padStart(2, "0")}`;

const getMonthKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

const getOrderStatusText = (status) => {
  const statusMap = {
    0: "Chờ xác nhận",
    1: "Đang chuẩn bị",
    2: "Đang giao",
    3: "Hoàn thành",
    4: "Đã hủy",
  };

  return statusMap[Number(status)] || "Không xác định";
};

const getDateRangeWhere = (startDate, endDate) => {
  const whereCondition = {
    TrangThaiThanhToan: 1,
  };

  if (startDate && endDate) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    whereCondition.NgayDat = {
      [Op.between]: [start, end],
    };
  }

  return whereCondition;
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

const getPeriodRows = ({ orders, mode, startDate, endDate }) => {
  const normalizedMode = ["month", "quarter", "year"].includes(mode)
    ? mode
    : "year";
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  const rowMap = new Map();

  if (normalizedMode === "month") {
    for (
      let date = new Date(start);
      date <= end;
      date.setDate(date.getDate() + 1)
    ) {
      const key = getDateKey(date);
      rowMap.set(key, {
        key,
        period: `Ngày ${formatDateOnlyVN(date)}`,
        orderCount: 0,
        goodsTotal: 0,
        shippingTotal: 0,
        discountTotal: 0,
        revenue: 0,
      });
    }
  } else {
    for (
      let date = new Date(start.getFullYear(), start.getMonth(), 1);
      date <= end;
      date.setMonth(date.getMonth() + 1)
    ) {
      const key = getMonthKey(date);
      rowMap.set(key, {
        key,
        period: `Tháng ${date.getMonth() + 1}/${date.getFullYear()}`,
        orderCount: 0,
        goodsTotal: 0,
        shippingTotal: 0,
        discountTotal: 0,
        revenue: 0,
      });
    }
  }

  orders.forEach((order) => {
    const orderDate = new Date(order.NgayDat);
    const key =
      normalizedMode === "month"
        ? getDateKey(orderDate)
        : getMonthKey(orderDate);
    const row = rowMap.get(key);

    if (!row) return;

    row.orderCount += 1;
    row.goodsTotal += Number(order.TongTienHang) || 0;
    row.shippingTotal += Number(order.TongPhiVanChuyen) || 0;
    row.discountTotal += Number(order.TongGiamGia) || 0;
    row.revenue += Number(order.TongThanhToan) || 0;
  });

  return Array.from(rowMap.values());
};

const styleHeaderRow = (row) => {
  row.height = 32;
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
    cell.border = {
      top: { style: "thin", color: { argb: "FFD9E2F3" } },
      left: { style: "thin", color: { argb: "FFD9E2F3" } },
      bottom: { style: "thin", color: { argb: "FFD9E2F3" } },
      right: { style: "thin", color: { argb: "FFD9E2F3" } },
    };
  });
};

const styleDataRow = (row, centerColumns = []) => {
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
    cell.border = {
      top: { style: "thin", color: { argb: "FFD9E2F3" } },
      left: { style: "thin", color: { argb: "FFD9E2F3" } },
      bottom: { style: "thin", color: { argb: "FFD9E2F3" } },
      right: { style: "thin", color: { argb: "FFD9E2F3" } },
    };
  });
};

const buildReportHeader = async ({
  workbook,
  worksheet,
  lastColumn,
  title,
  dateRangeText,
}) => {
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

  worksheet.getCell("B1").value = "CERAMIC-SHOP";
  worksheet.getCell("B1").font = {
    name: "Times New Roman",
    size: 22,
    bold: true,
    color: { argb: "FF173B63" },
  };
  worksheet.getCell("B1").alignment = {
    vertical: "bottom",
    horizontal: "left",
  };

  worksheet.getCell("B3").value = "Tinh hoa gốm sứ Việt";
  worksheet.getCell("B3").font = {
    name: "Arial",
    size: 11,
    italic: true,
    color: { argb: "FFC28A5D" },
  };

  worksheet.mergeCells(`A4:${lastColumn}4`);
  worksheet.getCell("A4").border = {
    bottom: { style: "medium", color: { argb: "FF2F6B3F" } },
  };

  worksheet.mergeCells(`A5:${lastColumn}5`);
  worksheet.getCell("A5").value = title;
  worksheet.getCell("A5").font = {
    name: "Arial",
    size: 18,
    bold: true,
    color: { argb: "FF173B63" },
  };
  worksheet.getCell("A5").alignment = {
    vertical: "middle",
    horizontal: "center",
  };

  worksheet.mergeCells(`A6:${lastColumn}6`);
  worksheet.getCell("A6").value = `Ngày xuất: ${formatDateTimeVN(new Date())}`;
  worksheet.getCell("A6").font = {
    name: "Arial",
    size: 11,
    italic: true,
    color: { argb: "FF666666" },
  };
  worksheet.getCell("A6").alignment = {
    vertical: "middle",
    horizontal: "center",
  };

  worksheet.mergeCells(`A7:${lastColumn}7`);
  worksheet.getCell("A7").value = dateRangeText;
  worksheet.getCell("A7").font = {
    name: "Arial",
    size: 11,
    italic: true,
    color: { argb: "FF666666" },
  };
  worksheet.getCell("A7").alignment = {
    vertical: "middle",
    horizontal: "center",
  };
};

export const getTotalRevenueService = async (startDate, endDate) => {
  const totalRevenue = await OrderModel.sum("TongThanhToan", {
    where: getDateRangeWhere(startDate, endDate),
  });

  return Number(totalRevenue) || 0;
};

export const exportRevenueXlsxService = async ({
  startDate,
  endDate,
  mode = "year",
} = {}) => {
  const whereCondition = getDateRangeWhere(startDate, endDate);
  const orders = await OrderModel.findAll({
    attributes: [
      "MaDonHang",
      "MaHienThi",
      "MaKhachHang",
      "NgayDat",
      "TongTienHang",
      "TongPhiVanChuyen",
      "TongGiamGia",
      "TongThanhToan",
      "TrangThaiDonHang",
      "TrangThaiThanhToan",
      "TenNguoiNhan",
      "SDT",
    ],
    where: whereCondition,
    include: [
      {
        model: CustomerModel,
        attributes: ["TenKhachHang", "SDT"],
      },
    ],
    order: [["NgayDat", "ASC"]],
  });

  const plainOrders = orders.map((order) => order.get({ plain: true }));
  const summaryRows = getPeriodRows({
    orders: plainOrders,
    mode,
    startDate,
    endDate,
  });
  const totals = summaryRows.reduce(
    (total, row) => ({
      orderCount: total.orderCount + row.orderCount,
      goodsTotal: total.goodsTotal + row.goodsTotal,
      shippingTotal: total.shippingTotal + row.shippingTotal,
      discountTotal: total.discountTotal + row.discountTotal,
      revenue: total.revenue + row.revenue,
    }),
    {
      orderCount: 0,
      goodsTotal: 0,
      shippingTotal: 0,
      discountTotal: 0,
      revenue: 0,
    },
  );

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "CERAMIC-SHOP";
  workbook.created = new Date();

  const dateRangeText = `Thời gian dữ liệu: Từ ${formatDateOnlyVN(
    startDate,
  )} đến ${formatDateOnlyVN(endDate)}`;

  const summarySheet = workbook.addWorksheet("Tổng hợp doanh thu", {
    properties: { defaultRowHeight: 24 },
    pageSetup: {
      paperSize: 9,
      orientation: "landscape",
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      horizontalCentered: true,
      margins: {
        left: 0.25,
        right: 0.25,
        top: 0.45,
        bottom: 0.45,
        header: 0.2,
        footer: 0.2,
      },
    },
  });

  summarySheet.views = [
    {
      state: "frozen",
      ySplit: 9,
      showGridLines: false,
      zoomScale: 100,
    },
  ];

  [31, 27, 35, 24, 27, 31, 26].forEach((width, index) => {
    summarySheet.getColumn(index + 1).width = width;
  });

  for (let row = 1; row <= 8; row += 1) {
    summarySheet.getRow(row).height = row === 5 ? 36 : 24;
    for (let colNumber = 1; colNumber <= 7; colNumber += 1) {
      summarySheet.getCell(row, colNumber).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFFFFFFF" },
      };
    }
  }

  await buildReportHeader({
    workbook,
    worksheet: summarySheet,
    lastColumn: "G",
    title: "BÁO CÁO DOANH THU CỬA HÀNG",
    dateRangeText,
  });

  const orderTableTitleRowNumber = 9;
  summarySheet.mergeCells(
    `A${orderTableTitleRowNumber}:G${orderTableTitleRowNumber}`,
  );
  const orderTableTitleCell = summarySheet.getCell(
    `A${orderTableTitleRowNumber}`,
  );
  orderTableTitleCell.value = "DANH SÁCH ĐƠN HÀNG ĐÃ THANH TOÁN";
  orderTableTitleCell.font = {
    name: "Arial",
    size: 13,
    bold: true,
    color: { argb: "FF173B63" },
  };
  orderTableTitleCell.alignment = {
    vertical: "middle",
    horizontal: "center",
  };

  const orderHeaderRowNumber = orderTableTitleRowNumber + 1;
  summarySheet.getRow(orderHeaderRowNumber).values = [
    "Mã đơn hàng",
    "Ngày đặt",
    "Khách hàng",
    "Số điện thoại",
    "Trạng thái đơn",
    "Tổng tiền",
    "Trạng thái TT",
  ];
  styleHeaderRow(summarySheet.getRow(orderHeaderRowNumber));

  plainOrders.forEach((order, index) => {
    const customer = order.KhachHang || {};
    const row = summarySheet.getRow(orderHeaderRowNumber + 1 + index);

    row.values = [
      order.MaHienThi || order.MaDonHang,
      formatDateTimeVN(order.NgayDat),
      order.TenNguoiNhan || customer.TenKhachHang || "",
      order.SDT || customer.SDT || "",
      getOrderStatusText(order.TrangThaiDonHang),
      Number(order.TongThanhToan) || 0,
      Number(order.TrangThaiThanhToan) === 1
        ? "Đã thanh toán"
        : "Chưa thanh toán",
    ];
    row.height = 32;
    styleDataRow(row, [1, 2, 4, 5, 7]);
  });

  const orderTotalRowNumber = orderHeaderRowNumber + plainOrders.length + 2;
  const orderTotalRow = summarySheet.getRow(orderTotalRowNumber);
  orderTotalRow.values = [
    `Tổng cộng (${plainOrders.length} đơn)`,
    "",
    "",
    "",
    "",
    totals.revenue,
    "",
  ];
  orderTotalRow.font = { name: "Arial", size: 11, bold: true };
  orderTotalRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFFFF2CC" },
  };
  styleDataRow(orderTotalRow, [1]);

  const summaryTitleRowNumber = orderTotalRowNumber + 3;
  summarySheet.mergeCells(
    `A${summaryTitleRowNumber}:G${summaryTitleRowNumber}`,
  );
  const summaryTitleCell = summarySheet.getCell(`A${summaryTitleRowNumber}`);
  summaryTitleCell.value = "TỔNG HỢP DOANH THU THEO KỲ";
  summaryTitleCell.font = {
    name: "Arial",
    size: 13,
    bold: true,
    color: { argb: "FF173B63" },
  };
  summaryTitleCell.alignment = {
    vertical: "middle",
    horizontal: "center",
  };

  const summaryHeaderRowNumber = summaryTitleRowNumber + 1;
  summarySheet.getRow(summaryHeaderRowNumber).values = [
    "Kỳ báo cáo",
    "Số đơn đã thanh toán",
    "Tiền hàng",
    "Phí vận chuyển",
    "Giảm giá",
    "Doanh thu",
    "Tỷ trọng",
  ];
  styleHeaderRow(summarySheet.getRow(summaryHeaderRowNumber));

  summaryRows.forEach((rowData, index) => {
    const row = summarySheet.getRow(summaryHeaderRowNumber + 1 + index);
    const percent = totals.revenue > 0 ? rowData.revenue / totals.revenue : 0;

    row.values = [
      rowData.period,
      rowData.orderCount,
      rowData.goodsTotal,
      rowData.shippingTotal,
      rowData.discountTotal,
      rowData.revenue,
      percent,
    ];
    row.height = 30;
    styleDataRow(row, [2, 7]);
  });

  const totalRowNumber = summaryHeaderRowNumber + summaryRows.length + 2;
  const totalRow = summarySheet.getRow(totalRowNumber);
  totalRow.values = [
    "Tổng cộng",
    totals.orderCount,
    totals.goodsTotal,
    totals.shippingTotal,
    totals.discountTotal,
    totals.revenue,
    1,
  ];
  totalRow.font = { name: "Arial", size: 11, bold: true };
  totalRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFFFF2CC" },
  };
  styleDataRow(totalRow, [2, 7]);

  [3, 4, 5, 6].forEach((colNumber) => {
    summarySheet.getColumn(colNumber).numFmt = '#,##0" VNĐ"';
  });
  summarySheet.getColumn(7).numFmt = "0.00%";
  summarySheet.getCell(`F${orderTotalRowNumber}`).numFmt = '#,##0" VNĐ"';
  summarySheet.autoFilter = `A${summaryHeaderRowNumber}:G${summaryHeaderRowNumber}`;
  summarySheet.pageSetup.printArea = `A1:G${totalRowNumber}`;

  return await workbook.xlsx.writeBuffer();
};
