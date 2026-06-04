import {
    InventoryHistoryModel,
    ProductModel,
    ReceivedNoteDetailModel,
    ReceivedNoteModel,
    sequelize,
    StaffModel,
    SupplierModel,
    VariantImageModel,
    VariantModel,
} from "../../models/index.js";
import {Op} from "sequelize";
import ErrorHandler from "../../utils/error_handler.js";
import { bcThemSanPham } from "../../utils/blockchain.js";

export const NOTE_STATUS = {
  PENDING: 0,
  COMPLETED: 1,
  CANCELED: 2,
};

const syncReceivedNoteProductsToBlockchain = async (idNote) => {
  const note = await ReceivedNoteModel.findByPk(idNote, {
    include: [
      {
        model: SupplierModel,
      },
      {
        model: ReceivedNoteDetailModel,
        include: [
          {
            model: VariantModel,
            include: [
              {
                model: ProductModel,
              },
            ],
          },
        ],
      },
    ],
  });

  if (!note?.NhaCungCap) {
    throw new Error(`Không tìm thấy nhà cung cấp của phiếu nhập #${idNote}`);
  }

  const productsById = new Map();

  for (const detail of note.ChiTietPhieuNhaps || []) {
    const product = detail.BienTheSanPham?.SanPham;

    if (product) {
      productsById.set(product.MaSanPham, product);
    }
  }

  for (const product of productsById.values()) {
    const txHash = await bcThemSanPham(product, note.NhaCungCap);

    await ProductModel.update(
      {
        MaNhaCC: note.NhaCungCap.MaNhaCC,
        BlockchainTxHash: txHash,
      },
      {
        where: {
          MaSanPham: product.MaSanPham,
        },
      },
    );
  }
};

export const getAllReceivedNotesService = async (
  page = 1,
  limit = 10,
  search = "",
  order = "DESC",
  status,
) => {
  const offset = (page - 1) * limit;
  let whereCondition = {};
  if (search) {
    whereCondition[Op.or] = [
      {
        "$NhaCungCap.TenNhaCC$": {
          [Op.like]: `%${search}%`,
        },
      },
      {
        MaPhieuNhap: {
          [Op.like]: `%${search}%`,
        },
      },
    ];
  }
  if (status !== undefined) {
    whereCondition.TrangThai = status;
  }
  const orderUpper = String(order || "").toUpperCase();
  const orderCondition = ["DESC", "ASC"].includes(orderUpper)
    ? orderUpper
    : "DESC";
  const { rows: notes, count: total } = await ReceivedNoteModel.findAndCountAll(
    {
      where: whereCondition,
      distinct: true,
      include: [
        {
          model: SupplierModel,
        },
        {
          model: ReceivedNoteDetailModel,
        },
      ],

      limit: limit,
      offset: offset,
      order: [["MaPhieuNhap", orderCondition]],
    },
  );

  return {
    data: notes,
    total: total,
    totalPage: Math.ceil(total / limit),
    page: page,
  };
};

export const getReceivedNoteService = async (idNotes) => {
  return await ReceivedNoteModel.findByPk(idNotes, {
    include: [
      {
        model: SupplierModel,
      },
      {
        model: StaffModel,
        attributes: ["TenNhanVien"],
      },
      {
        model: ReceivedNoteDetailModel,
        include: [
          {
            model: VariantModel,
            include: [
              {
                model: ProductModel,
                attributes: ["TenSanPham", "Thumbnail"],
              },
              {
                model: VariantImageModel,
                attributes: ["DuongDan"],
                limit: 1,
                separate: true,
              },
            ],
          },
        ],
      },
    ],
  });
};

export const createReceivedNoteService = async (
  idSupplier,
  idAccount,
  items,
  GhiChu,
) => {
  const transaction = await sequelize.transaction();
  try {
    const staff = await StaffModel.findOne({
      where: {
        MaTaiKhoan: idAccount,
      },
      transaction: transaction,
    });
    if (!staff) {
      throw new ErrorHandler("Nhân viên này không tồn tại!", 404);
    }
    const supplier = await SupplierModel.findByPk(idSupplier, {
      transaction: transaction,
    });
    if (!supplier) {
      throw new ErrorHandler("Nhà cung cấp này không tồn tại!", 404);
    }
    const note_details = [];
    let totalCost = 0;
    for (const item of items) {
      const variant = await VariantModel.findByPk(item.MaBienThe, {
        transaction: transaction,
      });
      if (!variant) {
        throw new ErrorHandler("Biến thể sản phẩm không tồn tại!", 404);
      }
      const quantity = item.SoLuong;
      let cost = quantity * item.GiaNhap;
      note_details.push({
        MaBienThe: item.MaBienThe,
        SoLuong: item.SoLuong,
        GiaNhap: item.GiaNhap,
        ThanhTien: cost,
      });
      totalCost += cost;
    }
    const notes = await ReceivedNoteModel.create(
      {
        MaNhanVien: staff.MaNhanVien,
        MaNhaCC: idSupplier,
        NgayNhap: new Date(),
        TongTien: totalCost,
        GhiChu: GhiChu,
        TrangThai: NOTE_STATUS.PENDING,
      },
      {
        transaction: transaction,
      },
    );
    const insertDetails = note_details.map((detail) => ({
      MaPhieuNhap: notes.MaPhieuNhap,
      MaBienThe: detail.MaBienThe,
      SoLuong: detail.SoLuong,
      GiaNhap: detail.GiaNhap,
      ThanhTien: detail.ThanhTien,
    }));
    await ReceivedNoteDetailModel.bulkCreate(insertDetails, {
      transaction: transaction,
    });
    await transaction.commit();
    return await getReceivedNoteService(notes.MaPhieuNhap);
  } catch (err) {
    await transaction.rollback();
    console.error(err);
    if (err.statusCode) throw err;
    throw new ErrorHandler("Lỗi server! Không thể tạo mới phiếu nhập!", 500);
  }
};

export const updateReceivedNoteService = async (idNote, data) => {
  const transaction = await sequelize.transaction();

  try {
    const note = await ReceivedNoteModel.findByPk(idNote, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!note) {
      throw new ErrorHandler("Phiếu nhập không tồn tại!", 404);
    }

    if (note.TrangThai !== NOTE_STATUS.PENDING) {
      throw new ErrorHandler(
        "Chỉ được cập nhật phiếu nhập đang chờ xử lý!",
        400,
      );
    }

    const { MaNhaCC, GhiChu, items } = data;

    if (MaNhaCC !== undefined) {
      const supplier = await SupplierModel.findByPk(Number(MaNhaCC), {
        transaction,
      });

      if (!supplier) {
        throw new ErrorHandler("Nhà cung cấp không tồn tại!", 404);
      }

      note.MaNhaCC = Number(MaNhaCC);
    }

    if (GhiChu !== undefined) {
      note.GhiChu = GhiChu;
    }

    if (items !== undefined) {
      let totalCost = 0;

      await ReceivedNoteDetailModel.destroy({
        where: {
          MaPhieuNhap: idNote,
        },
        transaction,
      });

      for (const item of items) {
        const idVariant = Number(item.MaBienThe);
        const quantity = Number(item.SoLuong);
        const price = Number(item.GiaNhap);

        const variant = await VariantModel.findByPk(idVariant, {
          transaction,
        });

        if (!variant) {
          throw new ErrorHandler("Biến thể sản phẩm không tồn tại!", 404);
        }

        const cost = quantity * price;
        totalCost += cost;

        await ReceivedNoteDetailModel.create(
          {
            MaPhieuNhap: idNote,
            MaBienThe: idVariant,
            SoLuong: quantity,
            GiaNhap: price,
            ThanhTien: cost,
          },
          {
            transaction,
          },
        );
      }

      note.TongTien = totalCost;
    }

    await note.save({ transaction });

    await transaction.commit();


    return await getReceivedNoteService(idNote);
  } catch (err) {
    await transaction.rollback();

    if (err.statusCode) {
      throw err;
    }

    console.error(err);
    throw new ErrorHandler("Lỗi server! Không thể cập nhật phiếu nhập!", 500);
  }
};

export const completeReceivedNoteService = async (idNote) => {
  const transaction = await sequelize.transaction();

  try {
    const note = await ReceivedNoteModel.findByPk(idNote, {
      include: [
        {
          model: ReceivedNoteDetailModel,
        },
      ],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!note) {
      throw new ErrorHandler("Phiếu nhập không tồn tại!", 404);
    }

    if (note.TrangThai === NOTE_STATUS.COMPLETED) {
      throw new ErrorHandler("Phiếu nhập đã được xác nhận trước đó!", 400);
    }

    if (note.TrangThai === NOTE_STATUS.CANCELED) {
      throw new ErrorHandler("Phiếu nhập đã bị hủy, không thể xác nhận!", 400);
    }

    const details = note.ChiTietPhieuNhaps || [];

    if (details.length === 0) {
      throw new ErrorHandler("Phiếu nhập không có chi tiết sản phẩm!", 400);
    }

    for (const detail of details) {
      const variant = await VariantModel.findByPk(detail.MaBienThe, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!variant) {
        throw new ErrorHandler("Biến thể sản phẩm không tồn tại!", 404);
      }

      const oldStock = Number(variant.SoLuong || 0);
      const importQuantity = Number(detail.SoLuong);
      const newStock = oldStock + importQuantity;

      await variant.update(
        {
          SoLuong: newStock,
        },
        {
          transaction,
        },
      );

      await InventoryHistoryModel.create(
        {
          MaBienThe: detail.MaBienThe,
          LoaiGiaoDich: "Nhập Kho",
          SoLuongThayDoi: importQuantity,
          TonKhoHienTai: newStock,
          LoaiThamChieu: "Phiếu Nhập",
          MaThamChieu: note.MaPhieuNhap,
          NgayTao: new Date(),
          GhiChu: `Nhập kho từ phiếu nhập #${note.MaPhieuNhap}`,
        },
        {
          transaction,
        },
      );
    }

    note.TrangThai = NOTE_STATUS.COMPLETED;

    await note.save({ transaction });

    await transaction.commit();

    try {
      await syncReceivedNoteProductsToBlockchain(idNote);
    } catch (error) {
      console.error(
        "Lỗi ghi Blockchain từ phiếu nhập (không ảnh hưởng nhập kho):",
        error,
      );
    }

    return await getReceivedNoteService(idNote);
  } catch (err) {
    await transaction.rollback();

    if (err.statusCode) {
      throw err;
    }

    console.error(err);
    throw new ErrorHandler("Lỗi server! Không thể xác nhận phiếu nhập!", 500);
  }
};

export const cancelReceivedNoteService = async (idNote) => {
  const transaction = await sequelize.transaction();

  try {
    const note = await ReceivedNoteModel.findByPk(idNote, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!note) {
      throw new ErrorHandler("Phiếu nhập không tồn tại!", 404);
    }

    if (note.TrangThai === NOTE_STATUS.COMPLETED) {
      throw new ErrorHandler("Phiếu nhập đã hoàn thành, không thể hủy!", 400);
    }

    if (note.TrangThai === NOTE_STATUS.CANCELED) {
      throw new ErrorHandler("Phiếu nhập đã bị hủy trước đó!", 400);
    }

    note.TrangThai = NOTE_STATUS.CANCELED;

    await note.save({ transaction });

    await transaction.commit();

    return await getReceivedNoteService(idNote);
  } catch (err) {
    await transaction.rollback();

    if (err.statusCode) {
      throw err;
    }

    console.error(err);
    throw new ErrorHandler("Lỗi server! Không thể hủy phiếu nhập!", 500);
  }
};
