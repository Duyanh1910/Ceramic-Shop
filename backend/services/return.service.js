import {
  sequelize,
  CustomerModel,
  OrderModel,
  OrderDetailModel,
  VariantModel,
  ProductModel,
  ReturnModel,
  ReturnProcessModel,
  InventoryHistoryModel,
  PaymentTransactionModel,
  RiskModel,
} from "../models/index.js";
import ErrorHandler from "../utils/error_handler.js";
import { Op } from "sequelize";

export const RETURN_STATUS = {
  WAITING: 0,
  APPROVED: 1,
  REJECTED: 2,
  PROCESSING: 3,
  COMPLETED: 4,
  CUSTOMER_CANCELED: 5,
};

export const RETURN_REQUEST_TYPE = {
  DOI_HANG: "DOI_HANG",
  TRA_HANG: "TRA_HANG",
  HOAN_TIEN: "HOAN_TIEN",
  VO_HONG_VAN_CHUYEN: "VO_HONG_VAN_CHUYEN",
  THIEU_HANG: "THIEU_HANG",
  SAI_SAN_PHAM: "SAI_SAN_PHAM",
};

export const RETURN_CONDITION = {
  CON_NGUYEN: "CON_NGUYEN",
  DA_SU_DUNG: "DA_SU_DUNG",
  VO_HONG: "VO_HONG",
  LOI_SAN_XUAT: "LOI_SAN_XUAT",
  KHONG_NHAN_LAI: "KHONG_NHAN_LAI",
};

export const RETURN_PROCESS_TYPE = {
  DOI_SAN_PHAM: "DOI_SAN_PHAM",
  GUI_BO_SUNG: "GUI_BO_SUNG",
  HOAN_TIEN_MOT_PHAN: "HOAN_TIEN_MOT_PHAN",
  HOAN_TIEN_TOAN_PHAN: "HOAN_TIEN_TOAN_PHAN",
};

const ORDER_STATUS_COMPLETED = 3;
const PAYMENT_STATUS_PAID = 1;

const validRequestTypes = Object.values(RETURN_REQUEST_TYPE);
const validConditions = Object.values(RETURN_CONDITION);
const validCompleteProcessTypes = Object.values(RETURN_PROCESS_TYPE);

const evidenceRequiredTypes = [
  RETURN_REQUEST_TYPE.VO_HONG_VAN_CHUYEN,
  RETURN_REQUEST_TYPE.THIEU_HANG,
  RETURN_REQUEST_TYPE.SAI_SAN_PHAM,
];

const riskTypeMap = {
  [RETURN_REQUEST_TYPE.VO_HONG_VAN_CHUYEN]: {
    LoaiRuiRo: "Vỡ hỏng do vận chuyển",
    MucDo: "CAO",
    NguonPhatHien: "VAN_CHUYEN",
  },
  [RETURN_REQUEST_TYPE.THIEU_HANG]: {
    LoaiRuiRo: "Giao thiếu hàng",
    MucDo: "BINH_THUONG",
    NguonPhatHien: "KHACH_HANG",
  },
  [RETURN_REQUEST_TYPE.SAI_SAN_PHAM]: {
    LoaiRuiRo: "Sai sản phẩm",
    MucDo: "BINH_THUONG",
    NguonPhatHien: "KHACH_HANG",
  },
};

const buildReturnInclude = () => [
  {
    model: ReturnProcessModel,
    separate: true,
    order: [["NgayXuLy", "DESC"]],
  },
  {
    model: OrderDetailModel,
    required: true,
    include: [
      {
        model: OrderModel,
        required: true,
      },
      {
        model: VariantModel,
        include: [{ model: ProductModel }],
      },
    ],
  },
  {
    model: VariantModel,
    as: "BienTheDoi",
    required: false,
    include: [{ model: ProductModel }],
  },
  {
    model: PaymentTransactionModel,
    required: false,
    separate: true,
    order: [["ThoiGianGiaoDich", "DESC"]],
  },
];

const parsePositiveInteger = (value, message) => {
  const numberValue = Number(value);

  if (!Number.isInteger(numberValue) || numberValue <= 0) {
    throw new ErrorHandler(message, 422);
  }

  return numberValue;
};

const parseNullablePositiveInteger = (value, message) => {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  return parsePositiveInteger(value, message);
};

const normalizeMoney = (value) => {
  if (value === undefined || value === null || value === "") {
    return 0;
  }

  const numberValue = Number(value);

  if (Number.isNaN(numberValue) || numberValue < 0) {
    throw new ErrorHandler("Số tiền hoàn không hợp lệ!", 422);
  }

  return numberValue;
};

const getCustomerByAccount = async (idAccount, options = {}) => {
  const customer = await CustomerModel.findOne({
    where: { MaTaiKhoan: idAccount },
    ...options,
  });

  if (!customer) {
    throw new ErrorHandler("Không tìm thấy khách hàng này!", 404);
  }

  return customer;
};

const createReturnProcess = async (MaDoiTra, HanhDong, GhiChu, transaction) => {
  return await ReturnProcessModel.create(
    {
      MaDoiTra,
      HanhDong,
      GhiChu,
    },
    { transaction },
  );
};

const findReturnById = async (MaDoiTra, options = {}) => {
  const returnRequest = await ReturnModel.findByPk(MaDoiTra, {
    include: buildReturnInclude(),
    ...options,
  });

  if (!returnRequest) {
    throw new ErrorHandler("Không tìm thấy yêu cầu đổi trả!", 404);
  }

  return returnRequest;
};

const assertCanUpdateReturn = (returnRequest) => {
  const status = Number(returnRequest.TrangThai);

  if (
    status === RETURN_STATUS.REJECTED ||
    status === RETURN_STATUS.COMPLETED ||
    status === RETURN_STATUS.CUSTOMER_CANCELED
  ) {
    throw new ErrorHandler(
      "Yêu cầu đổi trả đã kết thúc, không thể cập nhật!",
      400,
    );
  }
};

const getOrderDetailForCustomer = async (MaCTDH, MaKhachHang, options = {}) => {
  const orderDetail = await OrderDetailModel.findByPk(MaCTDH, {
    include: [
      {
        model: OrderModel,
        required: true,
        where: { MaKhachHang },
      },
      {
        model: VariantModel,
        include: [{ model: ProductModel }],
      },
    ],
    ...options,
  });

  if (!orderDetail) {
    throw new ErrorHandler(
      "Sản phẩm trong đơn hàng không tồn tại hoặc không thuộc về bạn!",
      404,
    );
  }

  return orderDetail;
};

const getActiveReturnedQuantity = async (MaCTDH, transaction) => {
  const rows = await ReturnModel.findAll({
    where: {
      MaCTDH,
      TrangThai: {
        [Op.notIn]: [RETURN_STATUS.REJECTED, RETURN_STATUS.CUSTOMER_CANCELED],
      },
    },
    transaction,
  });

  return rows.reduce((sum, item) => sum + Number(item.SoLuongDoiTra || 0), 0);
};

const createInventoryHistory = async ({
  MaBienThe,
  LoaiGiaoDich,
  SoLuongThayDoi,
  TonKhoHienTai,
  MaThamChieu,
  GhiChu,
  transaction,
}) => {
  return await InventoryHistoryModel.create(
    {
      MaBienThe,
      LoaiGiaoDich,
      SoLuongThayDoi,
      TonKhoHienTai,
      LoaiThamChieu: "DoiTra",
      MaThamChieu,
      GhiChu,
    },
    { transaction },
  );
};

const findOriginalSuccessfulPayment = async (MaDonHang, transaction) => {
  return await PaymentTransactionModel.findOne({
    where: {
      MaDonHang,
      LoaiGiaoDich: "THANH_TOAN",
      TrangThai: "SUCCESS",
    },
    order: [["ThoiGianGiaoDich", "DESC"]],
    transaction,
  });
};

const createRefundTransaction = async ({
  order,
  returnRequest,
  amount,
  transaction,
}) => {
  if (Number(order.TrangThaiThanhToan) !== PAYMENT_STATUS_PAID) {
    throw new ErrorHandler(
      "Đơn hàng chưa thanh toán thành công nên không thể hoàn tiền!",
      400,
    );
  }

  const originalPayment = await findOriginalSuccessfulPayment(
    order.MaDonHang,
    transaction,
  );

  if (!originalPayment) {
    throw new ErrorHandler(
      "Không tìm thấy giao dịch thanh toán gốc thành công để hoàn tiền!",
      400,
    );
  }

  return await PaymentTransactionModel.create(
    {
      MaDonHang: order.MaDonHang,
      MaPhuongThuc: order.MaPhuongThuc || originalPayment.MaPhuongThuc || 1,
      LoaiGiaoDich: "HOAN_TIEN",
      MaGiaoDichGoc: originalPayment.MaGiaoDich,
      MaDoiTra: returnRequest.MaDoiTra,
      MaThamChieu: `REFUND_${returnRequest.MaDoiTra}_${Date.now()}`,
      MaGiaoDichDoiTac: null,
      SoTien: amount,
      TrangThai: "PENDING",
      MaLoi: null,
      DuLieuPhanHoi: {
        message:
          "Đã tạo giao dịch hoàn tiền, chờ admin xác nhận đã thanh toán cho khách.",
      },
      ThoiGianGiaoDich: new Date(),
    },
    { transaction },
  );
};

const createRiskIfNeeded = async ({
  returnRequest,
  order,
  note,
  staffId,
  transaction,
}) => {
  const riskInfo = riskTypeMap[returnRequest.LoaiYeuCau];

  if (!riskInfo) {
    return null;
  }

  const existed = await RiskModel.findOne({
    where: {
      MaDonHang: order.MaDonHang,
      LoaiRuiRo: riskInfo.LoaiRuiRo,
      TrangThai: {
        [Op.in]: [0, 2],
      },
    },
    transaction,
  });

  if (existed) {
    return existed;
  }

  return await RiskModel.create(
    {
      MaDonHang: order.MaDonHang,
      LoaiRuiRo: riskInfo.LoaiRuiRo,
      MucDo: riskInfo.MucDo,
      NguonPhatHien: riskInfo.NguonPhatHien,
      MoTa: note || `Phát sinh từ yêu cầu đổi trả #${returnRequest.MaDoiTra}`,
      TrangThai: 0,
      GhiChu: `Tự động tạo từ yêu cầu đổi trả #${returnRequest.MaDoiTra}`,
      MaNhanVienPhuTrach: staffId || returnRequest.MaNhanVienXuLy || null,
    },
    { transaction },
  );
};

export const getMyReturnsService = async (idAccount) => {
  const customer = await getCustomerByAccount(idAccount);

  return await ReturnModel.findAll({
    order: [["NgayYeuCau", "DESC"]],
    include: [
      {
        model: ReturnProcessModel,
        separate: true,
        order: [["NgayXuLy", "DESC"]],
      },
      {
        model: OrderDetailModel,
        required: true,
        include: [
          {
            model: OrderModel,
            required: true,
            where: { MaKhachHang: customer.MaKhachHang },
          },
          {
            model: VariantModel,
            include: [{ model: ProductModel }],
          },
        ],
      },
      {
        model: VariantModel,
        as: "BienTheDoi",
        required: false,
        include: [{ model: ProductModel }],
      },
    ],
  });
};

export const getMyReturnByIdService = async (idAccount, MaDoiTra) => {
  const customer = await getCustomerByAccount(idAccount);

  const returnRequest = await ReturnModel.findByPk(MaDoiTra, {
    include: buildReturnInclude(),
  });

  if (!returnRequest) {
    throw new ErrorHandler("Không tìm thấy yêu cầu đổi trả!", 404);
  }

  const order = returnRequest.ChiTietDonHang?.DonHang;

  if (!order || Number(order.MaKhachHang) !== Number(customer.MaKhachHang)) {
    throw new ErrorHandler("Bạn không có quyền xem yêu cầu đổi trả này!", 403);
  }

  return returnRequest;
};

export const createReturnRequestService = async (idAccount, payload) => {
  const transaction = await sequelize.transaction();

  try {
    const customer = await getCustomerByAccount(idAccount, { transaction });

    const MaCTDH = parsePositiveInteger(
      payload.MaCTDH,
      "Sản phẩm trong đơn hàng không hợp lệ!",
    );

    const LoaiYeuCau = payload.LoaiYeuCau || RETURN_REQUEST_TYPE.TRA_HANG;

    if (!validRequestTypes.includes(LoaiYeuCau)) {
      throw new ErrorHandler("Loại yêu cầu đổi trả không hợp lệ!", 422);
    }

    const TinhTrangHangTra = payload.TinhTrangHangTra || null;

    if (TinhTrangHangTra && !validConditions.includes(TinhTrangHangTra)) {
      throw new ErrorHandler("Tình trạng hàng trả không hợp lệ!", 422);
    }

    const SoLuongDoiTra = parsePositiveInteger(
      payload.SoLuongDoiTra,
      "Số lượng đổi trả không hợp lệ!",
    );

    if (evidenceRequiredTypes.includes(LoaiYeuCau) && !payload.AnhMinhChung) {
      throw new ErrorHandler(
        "Vui lòng cung cấp ảnh minh chứng cho yêu cầu này!",
        422,
      );
    }

    const orderDetail = await getOrderDetailForCustomer(
      MaCTDH,
      customer.MaKhachHang,
      { transaction },
    );

    const order = orderDetail.DonHang;

    if (Number(order.TrangThaiDonHang) !== ORDER_STATUS_COMPLETED) {
      throw new ErrorHandler(
        "Chỉ có thể tạo yêu cầu đổi trả cho đơn hàng đã hoàn thành!",
        400,
      );
    }

    const activeReturnedQuantity = await getActiveReturnedQuantity(
      MaCTDH,
      transaction,
    );

    const remainingQuantity =
      Number(orderDetail.SoLuong) - activeReturnedQuantity;

    if (SoLuongDoiTra > remainingQuantity) {
      throw new ErrorHandler(
        `Số lượng yêu cầu vượt quá số lượng còn có thể đổi trả (${remainingQuantity})!`,
        400,
      );
    }

    const returnRequest = await ReturnModel.create(
      {
        MaCTDH,
        LoaiYeuCau,
        SoLuongDoiTra,
        LyDo: payload.LyDo || null,
        TinhTrangHangTra,
        CoNhapLaiKho: 0,
        HinhThucXuLy: null,
        SoTienHoan: 0,
        AnhMinhChung: payload.AnhMinhChung || null,
        TrangThai: RETURN_STATUS.WAITING,
      },
      { transaction },
    );

    await createReturnProcess(
      returnRequest.MaDoiTra,
      "TAO_YEU_CAU",
      payload.LyDo || "Khách hàng tạo yêu cầu đổi trả",
      transaction,
    );

    await transaction.commit();

    return await getMyReturnByIdService(idAccount, returnRequest.MaDoiTra);
  } catch (err) {
    if (!transaction.finished) {
      await transaction.rollback();
    }

    if (err.statusCode) {
      throw err;
    }

    throw new ErrorHandler("Lỗi server! Không thể tạo yêu cầu đổi trả!", 500);
  }
};

export const cancelReturnRequestService = async (idAccount, MaDoiTra, reason) => {
  const transaction = await sequelize.transaction();

  try {
    const customer = await getCustomerByAccount(idAccount, { transaction });

    const returnRequest = await ReturnModel.findByPk(MaDoiTra, {
      include: [
        {
          model: OrderDetailModel,
          required: true,
          include: [
            {
              model: OrderModel,
              required: true,
            },
          ],
        },
      ],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!returnRequest) {
      throw new ErrorHandler("Không tìm thấy yêu cầu đổi trả!", 404);
    }

    const order = returnRequest.ChiTietDonHang?.DonHang;

    if (!order || Number(order.MaKhachHang) !== Number(customer.MaKhachHang)) {
      throw new ErrorHandler("Bạn không có quyền hủy yêu cầu đổi trả này!", 403);
    }

    if (Number(returnRequest.TrangThai) !== RETURN_STATUS.WAITING) {
      throw new ErrorHandler("Chỉ có thể hủy yêu cầu đang chờ xử lý!", 400);
    }

    returnRequest.TrangThai = RETURN_STATUS.CUSTOMER_CANCELED;
    returnRequest.NgayHoanTat = new Date();
    await returnRequest.save({ transaction });

    await createReturnProcess(
      returnRequest.MaDoiTra,
      "KHACH_HUY",
      reason || "Khách hàng hủy yêu cầu đổi trả",
      transaction,
    );

    await transaction.commit();

    return await getMyReturnByIdService(idAccount, MaDoiTra);
  } catch (err) {
    if (!transaction.finished) {
      await transaction.rollback();
    }

    if (err.statusCode) {
      throw err;
    }

    throw new ErrorHandler("Lỗi server! Không thể hủy yêu cầu đổi trả!", 500);
  }
};

export const getAllReturnsAdminService = async (
  page = 1,
  limit = 10,
  search = "",
  order = "DESC",
  status,
  type,
) => {
  const currentPage = Number(page) > 0 ? Number(page) : 1;
  const pageSize = Number(limit) > 0 ? Number(limit) : 10;
  const offset = (currentPage - 1) * pageSize;
  const sortOrder = ["ASC", "DESC"].includes(String(order).toUpperCase())
    ? String(order).toUpperCase()
    : "DESC";

  const returnWhere = {};

  if (status !== undefined && status !== null && status !== "") {
    returnWhere.TrangThai = Number(status);
  }

  if (type) {
    returnWhere.LoaiYeuCau = type;
  }

  const orderWhere = {};

  if (search) {
    orderWhere[Op.or] = [
      { MaHienThi: { [Op.like]: `%${search}%` } },
      { TenNguoiNhan: { [Op.like]: `%${search}%` } },
      { SDT: { [Op.like]: `%${search}%` } },
    ];
  }

  const returns = await ReturnModel.findAndCountAll({
    where: returnWhere,
    limit: pageSize,
    offset,
    distinct: true,
    order: [["NgayYeuCau", sortOrder]],
    include: [
      {
        model: OrderDetailModel,
        required: true,
        include: [
          {
            model: OrderModel,
            required: Boolean(search),
            where: orderWhere,
          },
          {
            model: VariantModel,
            include: [{ model: ProductModel }],
          },
        ],
      },
      {
        model: VariantModel,
        as: "BienTheDoi",
        required: false,
        include: [{ model: ProductModel }],
      },
    ],
  });

  return {
    totalItems: returns.count,
    totalPages: Math.ceil(returns.count / pageSize),
    currentPage,
    data: returns.rows,
  };
};

export const getReturnByIdAdminService = async (MaDoiTra) => {
  return await findReturnById(MaDoiTra);
};

export const getReturnVariantOptionsAdminService = async (search = "") => {
  const keyword = String(search || "").trim().toLowerCase();

  const variants = await VariantModel.findAll({
    where: {
      SoLuong: {
        [Op.gt]: 0,
      },
    },
    include: [
      {
        model: ProductModel,
        required: false,
      },
    ],
    order: [["MaBienThe", "DESC"]],
    limit: 200,
  });

  return variants
    .map((variant) => {
      const plain = variant.get({ plain: true });
      const product = plain.SanPham || plain.Product || {};

      return {
        MaBienThe: plain.MaBienThe,
        TenBienThe: plain.TenBienThe,
        SoLuong: plain.SoLuong,
        Gia: plain.Gia,
        MaSanPham: product.MaSanPham || plain.MaSanPham,
        TenSanPham: product.TenSanPham || "Sản phẩm",
        Thumbnail: product.Thumbnail || null,
        label: `${product.TenSanPham || "Sản phẩm"} - ${plain.TenBienThe} | Kho: ${plain.SoLuong}`,
        value: plain.MaBienThe,
      };
    })
    .filter((item) => {
      if (!keyword) return true;

      return (
        item.TenSanPham.toLowerCase().includes(keyword) ||
        item.TenBienThe.toLowerCase().includes(keyword) ||
        String(item.MaBienThe).includes(keyword)
      );
    })
    .slice(0, 50);
};

export const updateReturnStatusAdminService = async (
  MaDoiTra,
  nextStatus,
  note,
  staffId,
) => {
  const transaction = await sequelize.transaction();

  try {
    if (!Object.values(RETURN_STATUS).includes(Number(nextStatus))) {
      throw new ErrorHandler("Trạng thái đổi trả không hợp lệ!", 422);
    }

    const returnRequest = await ReturnModel.findByPk(MaDoiTra, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!returnRequest) {
      throw new ErrorHandler("Không tìm thấy yêu cầu đổi trả!", 404);
    }

    assertCanUpdateReturn(returnRequest);

    const currentStatus = Number(returnRequest.TrangThai);
    const normalizedNextStatus = Number(nextStatus);

    const validTransitions = {
      [RETURN_STATUS.WAITING]: [
        RETURN_STATUS.APPROVED,
        RETURN_STATUS.REJECTED,
        RETURN_STATUS.PROCESSING,
      ],
      [RETURN_STATUS.APPROVED]: [
        RETURN_STATUS.PROCESSING,
        RETURN_STATUS.REJECTED,
      ],
      [RETURN_STATUS.PROCESSING]: [RETURN_STATUS.REJECTED],
    };

    const allowed = validTransitions[currentStatus] || [];

    if (!allowed.includes(normalizedNextStatus)) {
      throw new ErrorHandler(
        "Không thể chuyển trạng thái đổi trả theo luồng này!",
        400,
      );
    }

    if (normalizedNextStatus === RETURN_STATUS.REJECTED) {
      const pendingRefund = await PaymentTransactionModel.findOne({
        where: {
          MaDoiTra,
          LoaiGiaoDich: "HOAN_TIEN",
          TrangThai: "PENDING",
        },
        transaction,
      });

      if (pendingRefund) {
        throw new ErrorHandler(
          "Yêu cầu này đã có giao dịch hoàn tiền đang chờ xác nhận, không thể từ chối!",
          400,
        );
      }
    }

    returnRequest.TrangThai = normalizedNextStatus;
    returnRequest.MaNhanVienXuLy = staffId || returnRequest.MaNhanVienXuLy || null;

    if (normalizedNextStatus === RETURN_STATUS.REJECTED) {
      returnRequest.NgayHoanTat = new Date();
    }

    await returnRequest.save({ transaction });

    const actionMap = {
      [RETURN_STATUS.APPROVED]: "DUYET",
      [RETURN_STATUS.REJECTED]: "TU_CHOI",
      [RETURN_STATUS.PROCESSING]: "CHUYEN_XU_LY",
    };

    await createReturnProcess(
      MaDoiTra,
      actionMap[normalizedNextStatus] || "CAP_NHAT_TRANG_THAI",
      note || "Admin cập nhật trạng thái yêu cầu đổi trả",
      transaction,
    );

    await transaction.commit();

    return await getReturnByIdAdminService(MaDoiTra);
  } catch (err) {
    if (!transaction.finished) {
      await transaction.rollback();
    }

    if (err.statusCode) {
      throw err;
    }

    throw new ErrorHandler(
      "Lỗi server! Không thể cập nhật yêu cầu đổi trả!",
      500,
    );
  }
};

export const processReturnAdminService = async (MaDoiTra, payload) => {
  const transaction = await sequelize.transaction();

  try {
    const returnRequest = await ReturnModel.findByPk(MaDoiTra, {
      include: [
        {
          model: OrderDetailModel,
          required: true,
          include: [
            {
              model: OrderModel,
              required: true,
            },
            {
              model: VariantModel,
              include: [{ model: ProductModel }],
            },
          ],
        },
      ],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!returnRequest) {
      throw new ErrorHandler("Không tìm thấy yêu cầu đổi trả!", 404);
    }

    assertCanUpdateReturn(returnRequest);

    if (Number(returnRequest.TrangThai) !== RETURN_STATUS.PROCESSING) {
      throw new ErrorHandler(
        "Chỉ có thể hoàn tất xử lý khi yêu cầu đang ở trạng thái Đang xử lý!",
        400,
      );
    }

    const pendingRefundTransaction = await PaymentTransactionModel.findOne({
      where: {
        MaDoiTra,
        LoaiGiaoDich: "HOAN_TIEN",
        TrangThai: "PENDING",
      },
      transaction,
    });

    if (pendingRefundTransaction) {
      throw new ErrorHandler(
        "Yêu cầu này đã có giao dịch hoàn tiền đang chờ xác nhận!",
        400,
      );
    }

    const HinhThucXuLy = payload.HinhThucXuLy;

    if (!validCompleteProcessTypes.includes(HinhThucXuLy)) {
      throw new ErrorHandler("Hình thức xử lý đổi trả không hợp lệ!", 422);
    }

    const orderDetail = returnRequest.ChiTietDonHang;
    const order = orderDetail?.DonHang;

    if (!order) {
      throw new ErrorHandler(
        "Không tìm thấy đơn hàng gốc của yêu cầu đổi trả!",
        404,
      );
    }

    const quantity = parsePositiveInteger(
      payload.SoLuongDoiTra || returnRequest.SoLuongDoiTra,
      "Số lượng xử lý không hợp lệ!",
    );

    if (quantity > Number(returnRequest.SoLuongDoiTra)) {
      throw new ErrorHandler(
        "Số lượng xử lý không được vượt quá số lượng khách yêu cầu!",
        400,
      );
    }

    const staffId = parseNullablePositiveInteger(
      payload.MaNhanVienXuLy,
      "Nhân viên xử lý không hợp lệ!",
    );

    const note = payload.NoiDungXuLy || "Admin xử lý yêu cầu đổi trả";
    const CoNhapLaiKho = payload.CoNhapLaiKho ? 1 : 0;

    const isRefundProcess =
      HinhThucXuLy === RETURN_PROCESS_TYPE.HOAN_TIEN_MOT_PHAN ||
      HinhThucXuLy === RETURN_PROCESS_TYPE.HOAN_TIEN_TOAN_PHAN;

    const maxRefundAmount = Number(orderDetail.GiaBan || 0) * quantity;

    let refundAmount =
      HinhThucXuLy === RETURN_PROCESS_TYPE.HOAN_TIEN_TOAN_PHAN
        ? maxRefundAmount
        : normalizeMoney(payload.SoTienHoan);

    if (!isRefundProcess) {
      refundAmount = 0;
    }

    const cannotRestock =
      returnRequest.LoaiYeuCau === RETURN_REQUEST_TYPE.VO_HONG_VAN_CHUYEN ||
      returnRequest.LoaiYeuCau === RETURN_REQUEST_TYPE.THIEU_HANG ||
      returnRequest.TinhTrangHangTra === RETURN_CONDITION.VO_HONG ||
      returnRequest.TinhTrangHangTra === RETURN_CONDITION.LOI_SAN_XUAT ||
      returnRequest.TinhTrangHangTra === RETURN_CONDITION.KHONG_NHAN_LAI;

    if (CoNhapLaiKho && cannotRestock) {
      throw new ErrorHandler(
        "Trường hợp này không được nhập lại hàng vào kho!",
        400,
      );
    }

    if (refundAmount > maxRefundAmount) {
      throw new ErrorHandler(
        `Số tiền hoàn không được vượt quá ${maxRefundAmount.toLocaleString()}đ!`,
        400,
      );
    }

    if (isRefundProcess && refundAmount <= 0) {
      throw new ErrorHandler("Vui lòng nhập số tiền hoàn lớn hơn 0!", 422);
    }

    if (CoNhapLaiKho) {
      const oldVariant = await VariantModel.findByPk(orderDetail.MaBienThe, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!oldVariant) {
        throw new ErrorHandler("Không tìm thấy biến thể cũ để nhập lại kho!", 404);
      }

      const oldStock = Number(oldVariant.SoLuong) + quantity;
      oldVariant.SoLuong = oldStock;
      await oldVariant.save({ transaction });

      await createInventoryHistory({
        MaBienThe: oldVariant.MaBienThe,
        LoaiGiaoDich: "NHAP_LAI_DOI_TRA",
        SoLuongThayDoi: quantity,
        TonKhoHienTai: oldStock,
        MaThamChieu: MaDoiTra,
        GhiChu: `Nhập lại hàng cũ từ yêu cầu đổi trả #${MaDoiTra}`,
        transaction,
      });
    }

    if (
      HinhThucXuLy === RETURN_PROCESS_TYPE.DOI_SAN_PHAM ||
      HinhThucXuLy === RETURN_PROCESS_TYPE.GUI_BO_SUNG
    ) {
      const replacementVariantId = parsePositiveInteger(
        payload.MaBienTheDoi || returnRequest.MaBienTheDoi,
        "Vui lòng chọn biến thể sản phẩm gửi cho khách!",
      );

      const replacementVariant = await VariantModel.findByPk(
        replacementVariantId,
        {
          transaction,
          lock: transaction.LOCK.UPDATE,
        },
      );

      if (!replacementVariant) {
        throw new ErrorHandler(
          "Không tìm thấy biến thể sản phẩm gửi cho khách!",
          404,
        );
      }

      if (Number(replacementVariant.SoLuong) < quantity) {
        throw new ErrorHandler("Không đủ tồn kho để gửi sản phẩm cho khách!", 400);
      }

      const newStock = Number(replacementVariant.SoLuong) - quantity;
      replacementVariant.SoLuong = newStock;
      await replacementVariant.save({ transaction });

      await createInventoryHistory({
        MaBienThe: replacementVariant.MaBienThe,
        LoaiGiaoDich:
          HinhThucXuLy === RETURN_PROCESS_TYPE.DOI_SAN_PHAM
            ? "XUAT_DOI_HANG"
            : "XUAT_GUI_BO_SUNG",
        SoLuongThayDoi: -quantity,
        TonKhoHienTai: newStock,
        MaThamChieu: MaDoiTra,
        GhiChu: `Xuất hàng xử lý yêu cầu đổi trả #${MaDoiTra}`,
        transaction,
      });

      returnRequest.MaBienTheDoi = replacementVariantId;
    }

    if (isRefundProcess) {
      await createRefundTransaction({
        order,
        returnRequest,
        amount: refundAmount,
        transaction,
      });
    }

    await createRiskIfNeeded({
      returnRequest,
      order,
      note,
      staffId,
      transaction,
    });

    returnRequest.HinhThucXuLy = HinhThucXuLy;
    returnRequest.CoNhapLaiKho = CoNhapLaiKho;
    returnRequest.SoTienHoan = refundAmount;
    returnRequest.MaNhanVienXuLy = staffId || returnRequest.MaNhanVienXuLy || null;

    if (isRefundProcess) {
      returnRequest.TrangThai = RETURN_STATUS.PROCESSING;
      returnRequest.NgayHoanTat = null;

      await returnRequest.save({ transaction });

      await createReturnProcess(
        MaDoiTra,
        "TAO_GIAO_DICH_HOAN_TIEN",
        `${note}. Đã tạo giao dịch hoàn tiền chờ xác nhận.`,
        transaction,
      );
    } else {
      returnRequest.TrangThai = RETURN_STATUS.COMPLETED;
      returnRequest.NgayHoanTat = new Date();

      await returnRequest.save({ transaction });

      await createReturnProcess(MaDoiTra, HinhThucXuLy, note, transaction);
    }

    await transaction.commit();

    return await getReturnByIdAdminService(MaDoiTra);
  } catch (err) {
    if (!transaction.finished) {
      await transaction.rollback();
    }

    if (err.statusCode) {
      throw err;
    }

    console.error(err);
    throw new ErrorHandler("Lỗi server! Không thể xử lý yêu cầu đổi trả!", 500);
  }
};

export const confirmReturnRefundAdminService = async (
  MaDoiTra,
  note,
  staffId,
) => {
  const transaction = await sequelize.transaction();

  try {
    const returnRequest = await ReturnModel.findByPk(MaDoiTra, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!returnRequest) {
      throw new ErrorHandler("Không tìm thấy yêu cầu đổi trả!", 404);
    }

    if (Number(returnRequest.TrangThai) !== RETURN_STATUS.PROCESSING) {
      throw new ErrorHandler(
        "Chỉ có thể xác nhận hoàn tiền khi yêu cầu đang ở trạng thái Đang xử lý!",
        400,
      );
    }

    const refundTransaction = await PaymentTransactionModel.findOne({
      where: {
        MaDoiTra,
        LoaiGiaoDich: "HOAN_TIEN",
        TrangThai: "PENDING",
      },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!refundTransaction) {
      throw new ErrorHandler(
        "Không tìm thấy giao dịch hoàn tiền đang chờ xác nhận!",
        404,
      );
    }

    refundTransaction.TrangThai = "SUCCESS";
    refundTransaction.ThoiGianGiaoDich = new Date();
    refundTransaction.DuLieuPhanHoi = {
      message: note || "Admin xác nhận đã hoàn tiền cho khách.",
      confirmedAt: new Date(),
      confirmedBy: staffId || null,
    };

    await refundTransaction.save({ transaction });

    returnRequest.TrangThai = RETURN_STATUS.COMPLETED;
    returnRequest.MaNhanVienXuLy = staffId || returnRequest.MaNhanVienXuLy || null;
    returnRequest.NgayHoanTat = new Date();

    await returnRequest.save({ transaction });

    await createReturnProcess(
      MaDoiTra,
      "XAC_NHAN_HOAN_TIEN",
      note || "Admin xác nhận đã hoàn tiền cho khách",
      transaction,
    );

    await transaction.commit();

    return await getReturnByIdAdminService(MaDoiTra);
  } catch (err) {
    if (!transaction.finished) {
      await transaction.rollback();
    }

    if (err.statusCode) {
      throw err;
    }

    console.error(err);
    throw new ErrorHandler("Lỗi server! Không thể xác nhận hoàn tiền!", 500);
  }
};