import {
  cancelReceivedNoteService,
  completeReceivedNoteService,
  createReceivedNoteService,
  getAllReceivedNotesService,
  getReceivedNoteService,
  NOTE_STATUS,
  updateReceivedNoteService
} from "../../../services/supply/received_note.service.js";
import ErrorHandler from "../../../utils/error_handler.js";

export const getAllReceivedNotes = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      order = "DESC",
      status,
    } = req.query;

    let statusFilter;

    if (status !== undefined && status !== null && status !== "") {
      const statusNumber = Number(status);

      if (Object.values(NOTE_STATUS).includes(statusNumber)) {
        statusFilter = statusNumber;
      }
    }

    const notes = await getAllReceivedNotesService(
      Number(page),
      Number(limit),
      search,
      order,
      statusFilter,
    );

    res.status(200).json({
      success: true,
      message: "Lấy thông tin danh sách phiếu nhập thành công!",
      result: notes,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};
export const getReceivedNoteInfo = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return next(new ErrorHandler("ID không hợp lệ!", 400));
    }
    const note = await getReceivedNoteService(id);
    if (!note) {
      return next(new ErrorHandler("ID không tồn tại!", 404));
    }
    res.status(200).json({
      success: true,
      message: "Lấy thông tin phiếu nhập thành công!",
      result: note,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export const createReceivedNote = async (req, res, next) => {
  try {
    const MaTaiKhoan = Number(req.user.id);
    const { MaNhaCC, items, GhiChu } = req.body;

    const idSupplier = Number(MaNhaCC);

    if (!Number.isInteger(idSupplier) || idSupplier <= 0) {
      return next(new ErrorHandler("Mã nhà cung cấp không hợp lệ!", 422));
    }

    if (!Number.isInteger(MaTaiKhoan) || MaTaiKhoan <= 0) {
      return next(new ErrorHandler("Mã tài khoản không hợp lệ!", 422));
    }

    if (!Array.isArray(items) || items.length === 0) {
      return next(
        new ErrorHandler("Danh sách sản phẩm trống hoặc không hợp lệ!", 422),
      );
    }

    for (const item of items) {
      const idVariant = Number(item.MaBienThe);
      const quantity = Number(item.SoLuong);
      const price = Number(item.GiaNhap);

      if (!Number.isInteger(idVariant) || idVariant <= 0) {
        return next(new ErrorHandler("Mã biến thể không hợp lệ!", 422));
      }

      if (!Number.isInteger(quantity) || quantity <= 0) {
        return next(new ErrorHandler("Số lượng không hợp lệ!", 422));
      }

      if (!Number.isFinite(price) || price <= 0) {
        return next(new ErrorHandler("Giá nhập không hợp lệ!", 422));
      }
    }

    const note = await createReceivedNoteService(
      idSupplier,
      MaTaiKhoan,
      items,
      GhiChu,
    );

    return res.status(201).json({
      success: true,
      message: "Thêm mới phiếu nhập thành công!",
      result: note,
    });
  } catch (err) {
    next(err);
  }
};
export const updateReceivedNote = async (req, res, next) => {
  try {
    const idNote = Number(req.params.id);

    if (!Number.isInteger(idNote) || idNote <= 0) {
      return next(new ErrorHandler("Mã phiếu nhập không hợp lệ!", 422));
    }

    const { MaNhaCC, GhiChu, items } = req.body;

    if (MaNhaCC !== undefined) {
      const idSupplier = Number(MaNhaCC);

      if (!Number.isInteger(idSupplier) || idSupplier <= 0) {
        return next(new ErrorHandler("Mã nhà cung cấp không hợp lệ!", 422));
      }
    }

    if (items !== undefined) {
      if (!Array.isArray(items) || items.length === 0) {
        return next(
          new ErrorHandler("Danh sách sản phẩm nhập không hợp lệ!", 422),
        );
      }

      for (const item of items) {
        const idVariant = Number(item.MaBienThe);
        const quantity = Number(item.SoLuong);
        const price = Number(item.GiaNhap);

        if (!Number.isInteger(idVariant) || idVariant <= 0) {
          return next(new ErrorHandler("Mã biến thể không hợp lệ!", 422));
        }

        if (!Number.isInteger(quantity) || quantity <= 0) {
          return next(new ErrorHandler("Số lượng không hợp lệ!", 422));
        }

        if (!Number.isFinite(price) || price <= 0) {
          return next(new ErrorHandler("Giá nhập không hợp lệ!", 422));
        }
      }
    }

    const note = await updateReceivedNoteService(idNote, {
      MaNhaCC,
      GhiChu,
      items,
    });

    return res.status(200).json({
      success: true,
      message: "Cập nhật phiếu nhập thành công!",
      result: note,
    });
  } catch (err) {
    next(err);
  }
};

export const completeReceivedNote = async (req, res, next) => {
  try {
    const idNote = Number(req.params.id);

    if (!Number.isInteger(idNote) || idNote <= 0) {
      return next(new ErrorHandler("Mã phiếu nhập không hợp lệ!", 422));
    }

    const note = await completeReceivedNoteService(idNote);

    return res.status(200).json({
      success: true,
      message: "Xác nhận nhập kho thành công!",
      result: note,
    });
  } catch (err) {
    next(err);
  }
};

export const cancelReceivedNote = async (req, res, next) => {
  try {
    const idNote = Number(req.params.id);

    if (!Number.isInteger(idNote) || idNote <= 0) {
      return next(new ErrorHandler("Mã phiếu nhập không hợp lệ!", 422));
    }

    const note = await cancelReceivedNoteService(idNote);

    return res.status(200).json({
      success: true,
      message: "Hủy phiếu nhập thành công!",
      result: note,
    });
  } catch (err) {
    next(err);
  }
};
