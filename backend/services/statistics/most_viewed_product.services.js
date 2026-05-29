import { CategoryModel, ProductModel } from "../../models/index.js";
import {
  addRemoteImage,
  buildReportHeader,
  createReportWorkbook,
  createReportWorksheet,
  styleDataRow,
  styleHeaderRow,
} from "../../utils/excelReport.js";

const REPORT_LAST_COLUMN = 6;
const EXCEL_LAST_COLUMN = 16384;
const PRODUCT_IMAGE_SIZE = { width: 52, height: 52 };

const normalizeSortOrder = (order) =>
  String(order).toUpperCase() === "ASC" ? "ASC" : "DESC";

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

  const workbook = createReportWorkbook();
  const worksheet = createReportWorksheet(workbook, "Lượt xem sản phẩm", {
    columnWidths: [18, 62, 28, 34, 18, 78],
    rowHeights: [28, 28, 26, 14, 34, 22, 22, 14],
  });

  await buildReportHeader({
    workbook,
    worksheet,
    lastColumn: "F",
    title: "BÁO CÁO LƯỢT XEM SẢN PHẨM CỦA KHÁCH HÀNG",
    subtitle: `Sắp xếp theo lượt xem: ${
      sortOrder === "ASC" ? "Tăng dần" : "Giảm dần"
    }`,
    brandEndColumn: "D",
  });

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
  styleHeaderRow(headerRow, 32);

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
    styleDataRow(row, [1, 5]);

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
