import {
  exportMostViewedProductsXlsxService,
  getMostViewedProductsService,
} from "../../services/statistics/most_viewed_product.services.js";

const getMostViewedProducts = async (req, res, next) => {
  try {
    const result = await getMostViewedProductsService(req.query);
    return res.status(200).json({
      success: true,
      message: "Thống kê sản phẩm có lượt xem cao nhất thành công!",
      result: result,
    });
  } catch (err) {
    next(err);
  }
};

export const exportMostViewedProductsXlsxController = async (
  req,
  res,
  next,
) => {
  try {
    const buffer = await exportMostViewedProductsXlsxService(req.query);
    const fileName = `bao-cao-luot-xem-san-pham-${Date.now()}.xlsx`;

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

    return res.status(200).send(buffer);
  } catch (error) {
    next(error);
  }
};

export default getMostViewedProducts;
