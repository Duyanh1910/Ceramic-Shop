import { CustomerModel, OrderModel } from "../../models/index.js";
import { Op } from "sequelize";
import {
  buildReportHeader,
  createReportWorkbook,
  createReportWorksheet,
  formatDateOnlyVN,
  formatDateTimeVN,
  styleDataRow,
  styleHeaderRow,
} from "../../utils/excelReport.js";

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

  const workbook = createReportWorkbook();

  const dateRangeText = `Thời gian dữ liệu: Từ ${formatDateOnlyVN(
    startDate,
  )} đến ${formatDateOnlyVN(endDate)}`;

  const summarySheet = createReportWorksheet(workbook, "Tổng hợp doanh thu", {
    columnWidths: [31, 27, 35, 24, 27, 31, 26],
    rowHeights: [24, 24, 24, 24, 36, 24, 24, 24],
    zoomScale: 100,
    margins: {
      left: 0.25,
      right: 0.25,
      top: 0.45,
      bottom: 0.45,
      header: 0.2,
      footer: 0.2,
    },
  });

  await buildReportHeader({
    workbook,
    worksheet: summarySheet,
    lastColumn: "G",
    title: "BÁO CÁO DOANH THU CỬA HÀNG",
    subtitle: dateRangeText,
    brandEndColumn: "D",
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
