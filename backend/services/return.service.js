import {
  CustomerModel,
  InventoryHistoryModel,
  OrderDetailModel,
  OrderModel,
  PaymentTransactionModel,
  ProductModel,
  ReturnModel,
  ReturnProcessModel,
  RiskModel,
  sequelize,
  VariantModel,
} from "../models/index.js";
import ErrorHandler from "../utils/error_handler.js";
import { Op } from "sequelize";
import {
  NOTIFICATION_TYPES,
  safeCreateAdminNotificationService,
} from "./adminNotifications.service.js";
import {
  buildDateRangeText,
  buildReportHeader,
  createReportWorkbook,
  createReportWorksheet,
  formatDateTimeVN,
  styleDataRow,
  styleHeaderRow,
} from "../utils/excelReport.js";

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

const RISK_STATUS = {
  UNHANDLED: 0,
  RESOLVED: 1,
  PROCESSING: 2,
  IGNORED: 3,
};

const validRequestTypes = Object.values(RETURN_REQUEST_TYPE);
const validConditions = Object.values(RETURN_CONDITION);
const validCompleteProcessTypes = Object.values(RETURN_PROCESS_TYPE);

const evidenceRequiredTypes = [
  RETURN_REQUEST_TYPE.VO_HONG_VAN_CHUYEN,
  RETURN_REQUEST_TYPE.THIEU_HANG,
  RETURN_REQUEST_TYPE.SAI_SAN_PHAM,
];

const riskTypeMap = {
  [RETURN_REQUEST_TYPE.DOI_HANG]: {
    LoaiRuiRo: "Yêu cầu đổi hàng",
    MucDo: "BINH_THUONG",
    NguonPhatHien: "KHACH_HANG",
  },
  [RETURN_REQUEST_TYPE.TRA_HANG]: {
    LoaiRuiRo: "Yêu cầu trả hàng",
    MucDo: "BINH_THUONG",
    NguonPhatHien: "KHACH_HANG",
  },
  [RETURN_REQUEST_TYPE.HOAN_TIEN]: {
    LoaiRuiRo: "Yêu cầu hoàn tiền",
    MucDo: "CAO",
    NguonPhatHien: "KHACH_HANG",
  },
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

const getReturnStatusText = (value) => {
  const statusNumber = Number(value);

  if (statusNumber === RETURN_STATUS.WAITING) return "Chờ xử lý";
  if (statusNumber === RETURN_STATUS.APPROVED) return "Đã duyệt";
  if (statusNumber === RETURN_STATUS.REJECTED) return "Từ chối";
  if (statusNumber === RETURN_STATUS.PROCESSING) return "Đang xử lý";
  if (statusNumber === RETURN_STATUS.COMPLETED) return "Hoàn tất";
  if (statusNumber === RETURN_STATUS.CUSTOMER_CANCELED) return "Khách hủy";

  return "Không rõ";
};

const getReturnRequestTypeText = (value) => {
  const typeMap = {
    [RETURN_REQUEST_TYPE.DOI_HANG]: "Đổi hàng",
    [RETURN_REQUEST_TYPE.TRA_HANG]: "Trả hàng",
    [RETURN_REQUEST_TYPE.HOAN_TIEN]: "Hoàn tiền",
    [RETURN_REQUEST_TYPE.VO_HONG_VAN_CHUYEN]: "Vỡ/hỏng vận chuyển",
    [RETURN_REQUEST_TYPE.THIEU_HANG]: "Thiếu hàng",
    [RETURN_REQUEST_TYPE.SAI_SAN_PHAM]: "Sai sản phẩm",
  };

  return typeMap[value] || value || "";
};

const getReturnConditionText = (value) => {
  const conditionMap = {
    [RETURN_CONDITION.CON_NGUYEN]: "Còn nguyên",
    [RETURN_CONDITION.DA_SU_DUNG]: "Đã sử dụng",
    [RETURN_CONDITION.VO_HONG]: "Vỡ/hỏng",
    [RETURN_CONDITION.LOI_SAN_XUAT]: "Lỗi sản xuất",
    [RETURN_CONDITION.KHONG_NHAN_LAI]: "Không nhận lại hàng",
  };

  return conditionMap[value] || value || "";
};

const getReturnProcessTypeText = (value) => {
  const processMap = {
    [RETURN_PROCESS_TYPE.DOI_SAN_PHAM]: "Đổi sản phẩm",
    [RETURN_PROCESS_TYPE.GUI_BO_SUNG]: "Gửi bổ sung",
    [RETURN_PROCESS_TYPE.HOAN_TIEN_MOT_PHAN]: "Hoàn tiền một phần",
    [RETURN_PROCESS_TYPE.HOAN_TIEN_TOAN_PHAN]: "Hoàn tiền toàn phần",
  };

  return processMap[value] || value || "";
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
    return {
      risk: null,
      created: false,
    };
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
    return {
      risk: existed,
      created: false,
    };
  }

  const risk = await RiskModel.create(
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

  return {
    risk,
    created: true,
  };
};

const getReturnRiskStatus = (status) => {
  const statusNumber = Number(status);

  if (statusNumber === RETURN_STATUS.WAITING) return RISK_STATUS.UNHANDLED;
  if (
    statusNumber === RETURN_STATUS.APPROVED ||
    statusNumber === RETURN_STATUS.PROCESSING
  ) {
    return RISK_STATUS.PROCESSING;
  }
  if (statusNumber === RETURN_STATUS.COMPLETED) return RISK_STATUS.RESOLVED;
  if (
    statusNumber === RETURN_STATUS.REJECTED ||
    statusNumber === RETURN_STATUS.CUSTOMER_CANCELED
  ) {
    return RISK_STATUS.IGNORED;
  }

  return RISK_STATUS.UNHANDLED;
};

const applyRiskResolutionTime = (risk, status) => {
  if (status === RISK_STATUS.RESOLVED || status === RISK_STATUS.IGNORED) {
    if (!risk.NgayXuLy) risk.NgayXuLy = new Date();
    return;
  }

  risk.NgayXuLy = null;
};

const buildReturnRiskMarker = (MaDoiTra) => `[DoiTra#${MaDoiTra}]`;

const syncReturnRisk = async ({
  returnRequest,
  order,
  note,
  staffId,
  status,
  transaction,
}) => {
  const riskInfo = riskTypeMap[returnRequest.LoaiYeuCau];

  if (!riskInfo || !order) {
    return { risk: null, created: false };
  }

  const marker = buildReturnRiskMarker(returnRequest.MaDoiTra);
  const nextStatus = getReturnRiskStatus(status ?? returnRequest.TrangThai);

  let existed = await RiskModel.findOne({
    where: {
      MaDonHang: order.MaDonHang,
      LoaiRuiRo: riskInfo.LoaiRuiRo,
      GhiChu: { [Op.like]: `%${marker}%` },
    },
    transaction,
  });

  if (!existed) {
    existed = await RiskModel.findOne({
      where: {
        MaDonHang: order.MaDonHang,
        LoaiRuiRo: riskInfo.LoaiRuiRo,
        GhiChu: { [Op.like]: `%#${returnRequest.MaDoiTra}%` },
      },
      transaction,
    });
  }

  if (existed) {
    existed.MucDo = riskInfo.MucDo;
    existed.NguonPhatHien = riskInfo.NguonPhatHien;
    existed.TrangThai = nextStatus;
    existed.MoTa =
      note ||
      existed.MoTa ||
      `Phát sinh từ yêu cầu đổi trả #${returnRequest.MaDoiTra}`;

    if (staffId || returnRequest.MaNhanVienXuLy) {
      existed.MaNhanVienPhuTrach =
        staffId || returnRequest.MaNhanVienXuLy || existed.MaNhanVienPhuTrach;
    }
    if (!String(existed.GhiChu || "").includes(marker)) {
      existed.GhiChu = `${marker} ${existed.GhiChu || ""}`.trim();
    }

    applyRiskResolutionTime(existed, nextStatus);
    await existed.save({ transaction });

    return { risk: existed, created: false };
  }

  const risk = await RiskModel.create(
    {
      MaDonHang: order.MaDonHang,
      LoaiRuiRo: riskInfo.LoaiRuiRo,
      MucDo: riskInfo.MucDo,
      NguonPhatHien: riskInfo.NguonPhatHien,
      MoTa: note || `Phát sinh từ yêu cầu đổi trả #${returnRequest.MaDoiTra}`,
      TrangThai: nextStatus,
      GhiChu: `${marker} Tự động đồng bộ từ yêu cầu đổi trả #${returnRequest.MaDoiTra}`,
      MaNhanVienPhuTrach: staffId || returnRequest.MaNhanVienXuLy || null,
    },
    { transaction },
  );

  applyRiskResolutionTime(risk, nextStatus);
  await risk.save({ transaction });

  return { risk, created: true };
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

    const riskResult = await syncReturnRisk({
      returnRequest,
      order,
      note: payload.LyDo || "Khách hàng tạo yêu cầu đổi trả",
      status: RETURN_STATUS.WAITING,
      transaction,
    });

    await transaction.commit();

    await safeCreateAdminNotificationService({
      LoaiThongBao: NOTIFICATION_TYPES.RETURN_REQUESTED,
      TieuDe: "Yêu cầu đổi trả mới",
      NoiDung: `Yêu cầu đổi trả #${returnRequest.MaDoiTra} của đơn ${order.MaHienThi} vừa được tạo`,
      DuongDan: `/admin/returns?returnId=${returnRequest.MaDoiTra}`,
    });

    if (riskResult.created && riskResult.risk) {
      await safeCreateAdminNotificationService({
        LoaiThongBao: NOTIFICATION_TYPES.RISK_CREATED,
        MaNhanVien: riskResult.risk.MaNhanVienPhuTrach,
        TieuDe: "Rủi ro mới",
        NoiDung: `Rủi ro #${riskResult.risk.MaRuiRo} được tạo từ đổi trả #${returnRequest.MaDoiTra}`,
        DuongDan: `/admin/risks?riskId=${riskResult.risk.MaRuiRo}`,
      });
    }

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

export const cancelReturnRequestService = async (
  idAccount,
  MaDoiTra,
  reason,
) => {
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
      throw new ErrorHandler(
        "Bạn không có quyền hủy yêu cầu đổi trả này!",
        403,
      );
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

    await syncReturnRisk({
      returnRequest,
      order,
      note: reason || "Khách hàng hủy yêu cầu đổi trả",
      status: RETURN_STATUS.CUSTOMER_CANCELED,
      transaction,
    });

    await transaction.commit();

    await safeCreateAdminNotificationService({
      LoaiThongBao: NOTIFICATION_TYPES.RETURN_STATUS_UPDATED,
      TieuDe: "Đổi trả đã cập nhật",
      NoiDung: `Yêu cầu đổi trả #${MaDoiTra} đã được khách hàng hủy`,
      DuongDan: `/admin/returns?returnId=${MaDoiTra}`,
    });

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

  if (
    status !== "all" &&
    status !== undefined &&
    status !== null &&
    status !== ""
  ) {
    returnWhere.TrangThai = Number(status);
  }

  if (type) {
    returnWhere.LoaiYeuCau = type;
  }

  const keyword = String(search || "").trim();

  if (keyword) {
    const numericKeyword = /^\d+$/.test(keyword) ? Number(keyword) : null;

    returnWhere[Op.or] = [
      ...(numericKeyword !== null ? [{ MaDoiTra: numericKeyword }] : []),
      { "$ChiTietDonHang.DonHang.MaHienThi$": { [Op.like]: `%${keyword}%` } },
      {
        "$ChiTietDonHang.DonHang.TenNguoiNhan$": { [Op.like]: `%${keyword}%` },
      },
      { "$ChiTietDonHang.DonHang.SDT$": { [Op.like]: `%${keyword}%` } },
    ];
  }

  const returns = await ReturnModel.findAndCountAll({
    where: returnWhere,
    limit: pageSize,
    offset,
    distinct: true,
    subQuery: false,
    order: [["NgayYeuCau", sortOrder]],
    include: [
      {
        model: OrderDetailModel,
        required: true,
        include: [
          {
            model: OrderModel,
            required: false,
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
  const keyword = String(search || "")
    .trim()
    .toLowerCase();

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

    const orderDetail = await OrderDetailModel.findByPk(returnRequest.MaCTDH, {
      include: [{ model: OrderModel, required: true }],
      transaction,
    });
    const order = orderDetail?.DonHang;

    if (!order) {
      throw new ErrorHandler("Không tìm thấy đơn hàng của yêu cầu đổi trả!", 404);
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
    returnRequest.MaNhanVienXuLy =
      staffId || returnRequest.MaNhanVienXuLy || null;

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

    await syncReturnRisk({
      returnRequest,
      order,
      note: note || "Admin cập nhật trạng thái yêu cầu đổi trả",
      staffId,
      status: normalizedNextStatus,
      transaction,
    });

    await transaction.commit();

    await safeCreateAdminNotificationService({
      LoaiThongBao: NOTIFICATION_TYPES.RETURN_STATUS_UPDATED,
      MaNhanVien: returnRequest.MaNhanVienXuLy,
      TieuDe: "Đổi trả đã cập nhật",
      NoiDung: `Yêu cầu đổi trả #${MaDoiTra} đã chuyển trạng thái`,
      DuongDan: `/admin/returns?returnId=${MaDoiTra}`,
    });

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
        throw new ErrorHandler(
          "Không tìm thấy biến thể cũ để nhập lại kho!",
          404,
        );
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
        throw new ErrorHandler(
          "Không đủ tồn kho để gửi sản phẩm cho khách!",
          400,
        );
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

    let riskResult = { risk: null, created: false };

    returnRequest.HinhThucXuLy = HinhThucXuLy;
    returnRequest.CoNhapLaiKho = CoNhapLaiKho;
    returnRequest.SoTienHoan = refundAmount;
    returnRequest.MaNhanVienXuLy =
      staffId || returnRequest.MaNhanVienXuLy || null;

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

    riskResult = await syncReturnRisk({
      returnRequest,
      order,
      note,
      staffId,
      status: returnRequest.TrangThai,
      transaction,
    });

    await transaction.commit();

    await safeCreateAdminNotificationService({
      LoaiThongBao: NOTIFICATION_TYPES.RETURN_STATUS_UPDATED,
      MaNhanVien: returnRequest.MaNhanVienXuLy,
      TieuDe: "Đổi trả đã xử lý",
      NoiDung: `Yêu cầu đổi trả #${MaDoiTra} đã được xử lý`,
      DuongDan: `/admin/returns?returnId=${MaDoiTra}`,
    });

    if (riskResult.created && riskResult.risk) {
      await safeCreateAdminNotificationService({
        LoaiThongBao: NOTIFICATION_TYPES.RISK_CREATED,
        MaNhanVien: riskResult.risk.MaNhanVienPhuTrach,
        TieuDe: "Rủi ro mới",
        NoiDung: `Rủi ro #${riskResult.risk.MaRuiRo} được tạo từ đổi trả #${MaDoiTra}`,
        DuongDan: `/admin/risks?riskId=${riskResult.risk.MaRuiRo}`,
      });
    }

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
      include: [
        {
          model: OrderDetailModel,
          required: true,
          include: [{ model: OrderModel, required: true }],
        },
      ],
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

    const order = returnRequest.ChiTietDonHang?.DonHang;

    if (!order) {
      throw new ErrorHandler("Không tìm thấy đơn hàng của yêu cầu đổi trả!", 404);
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
    returnRequest.MaNhanVienXuLy =
      staffId || returnRequest.MaNhanVienXuLy || null;
    returnRequest.NgayHoanTat = new Date();

    await returnRequest.save({ transaction });

    await syncReturnRisk({
      returnRequest,
      order,
      note: note || "Admin xác nhận hoàn tiền cho khách",
      staffId,
      status: RETURN_STATUS.COMPLETED,
      transaction,
    });

    await createReturnProcess(
      MaDoiTra,
      "XAC_NHAN_HOAN_TIEN",
      note || "Admin xác nhận đã hoàn tiền cho khách",
      transaction,
    );

    await transaction.commit();

    await safeCreateAdminNotificationService({
      LoaiThongBao: NOTIFICATION_TYPES.RETURN_STATUS_UPDATED,
      MaNhanVien: returnRequest.MaNhanVienXuLy,
      TieuDe: "Hoàn tiền đổi trả đã xác nhận",
      NoiDung: `Yêu cầu đổi trả #${MaDoiTra} đã hoàn tất hoàn tiền`,
      DuongDan: `/admin/returns?returnId=${MaDoiTra}`,
    });

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

export const exportReturnXLSXService = async ({
  search = "",
  status = "",
  type = "",
  order = "DESC",
  startDate,
  endDate,
} = {}) => {
  const sortOrder = String(order).toUpperCase() === "ASC" ? "ASC" : "DESC";
  const keyword = String(search || "").trim();
  const returnWhere = {};

  if (
    status !== "all" &&
    status !== undefined &&
    status !== null &&
    status !== ""
  ) {
    returnWhere.TrangThai = Number(status);
  }

  if (type && type !== "all") {
    returnWhere.LoaiYeuCau = type;
  }

  if (startDate || endDate) {
    returnWhere.NgayYeuCau = {};

    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      returnWhere.NgayYeuCau[Op.gte] = start;
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      returnWhere.NgayYeuCau[Op.lte] = end;
    }
  }

  if (keyword) {
    const numericKeyword = /^\d+$/.test(keyword) ? Number(keyword) : null;

    returnWhere[Op.or] = [
      ...(numericKeyword !== null ? [{ MaDoiTra: numericKeyword }] : []),
      { "$ChiTietDonHang.DonHang.MaHienThi$": { [Op.like]: `%${keyword}%` } },
      {
        "$ChiTietDonHang.DonHang.TenNguoiNhan$": {
          [Op.like]: `%${keyword}%`,
        },
      },
      { "$ChiTietDonHang.DonHang.SDT$": { [Op.like]: `%${keyword}%` } },
    ];
  }

  const returns = await ReturnModel.findAll({
    where: returnWhere,
    distinct: true,
    subQuery: false,
    order: [["NgayYeuCau", sortOrder]],
    include: [
      {
        model: OrderDetailModel,
        required: true,
        include: [
          {
            model: OrderModel,
            required: false,
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

  const workbook = createReportWorkbook();
  const worksheet = createReportWorksheet(workbook, "Danh sách đổi trả", {
    columnWidths: [14, 20, 24, 18, 34, 28, 16, 22, 22, 18, 24, 24, 24, 42],
    rowHeights: [28, 28, 26, 14, 34, 22, 22, 14],
  });

  await buildReportHeader({
    workbook,
    worksheet,
    lastColumn: "N",
    title: "BÁO CÁO DANH SÁCH ĐỔI TRẢ",
    subtitle: buildDateRangeText(startDate, endDate),
  });

  const headers = [
    "Mã đổi trả",
    "Mã đơn hàng",
    "Khách hàng",
    "Số điện thoại",
    "Sản phẩm",
    "Phân loại",
    "Số lượng",
    "Loại yêu cầu",
    "Tình trạng hàng",
    "Trạng thái",
    "Hình thức xử lý",
    "Số tiền hoàn",
    "Ngày yêu cầu",
    "Lý do",
  ];

  const headerRow = worksheet.getRow(9);
  headerRow.values = headers;
  styleHeaderRow(headerRow, 32);

  returns.forEach((item, index) => {
    const data = item.get({ plain: true });
    const orderDetail = data.ChiTietDonHang || {};
    const order = orderDetail.DonHang || {};
    const variant = orderDetail.BienTheSanPham || {};
    const product = variant.SanPham || {};
    const row = worksheet.getRow(10 + index);

    row.values = [
      data.MaDoiTra,
      order.MaHienThi || order.MaDonHang || "",
      order.TenNguoiNhan || "",
      order.SDT || "",
      product.TenSanPham || "Sản phẩm không xác định",
      variant.TenBienThe || "",
      data.SoLuongDoiTra || 0,
      getReturnRequestTypeText(data.LoaiYeuCau),
      getReturnConditionText(data.TinhTrangHangTra),
      getReturnStatusText(data.TrangThai),
      getReturnProcessTypeText(data.HinhThucXuLy),
      Number(data.SoTienHoan || 0),
      data.NgayYeuCau ? formatDateTimeVN(data.NgayYeuCau) : "",
      data.LyDo || "",
    ];

    row.height = 36;
    styleDataRow(row, [1, 2, 4, 7, 8, 9, 10, 11, 12, 13]);
  });

  worksheet.getColumn(12).numFmt = '#,##0" VNĐ"';
  worksheet.autoFilter = "A9:N9";

  const lastRow = worksheet.lastRow?.number || 9;
  worksheet.mergeCells(`A${lastRow + 2}:N${lastRow + 2}`);
  const totalCell = worksheet.getCell(`A${lastRow + 2}`);
  totalCell.value = `Tổng số yêu cầu đổi trả: ${returns.length}`;
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

  return await workbook.xlsx.writeBuffer();
};
