import {
  getAllInventoryHistoryService,
  showInventoryHistoryService,
  exportInventoryHistoryXlsxService,
} from "../../../services/inventory.service.js";

export const ListInventoryHistoryController = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      order = "DESC",
      startDate,
      endDate,
    } = req.query;

    const histories = await getAllInventoryHistoryService(
      Number(page),
      Number(limit),
      search,
      order,
      startDate,
      endDate,
    );

    return res.status(200).json({
      success: true,
      message: "Lấy thông tin danh sách tồn kho thành công!",
      result: histories,
    });
  } catch (error) {
    next(error);
  }
};

export const ShowInventoryHistoryController = async (req, res, next) => {
  try {
    const { id } = req.params;

    const history = await showInventoryHistoryService(id);

    return res.status(200).json({
      success: true,
      message: "Lấy chi tiết lịch sử tồn kho thành công!",
      result: history,
    });
  } catch (error) {
    next(error);
  }
};

export const ExportInventoryHistoryXlsxController = async (req, res, next) => {
  try {
    const { search = "", order = "DESC", startDate, endDate } = req.query;

    const buffer = await exportInventoryHistoryXlsxService(
      search,
      order,
      startDate,
      endDate,
    );

    const fileName = `lich-su-ton-kho-${Date.now()}.xlsx`;

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
