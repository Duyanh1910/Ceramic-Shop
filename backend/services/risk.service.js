import {
  RiskModel,
  OrderModel,
  OrderDetailModel,
  VariantModel,
  ProductModel,
  VariantImageModel,
  StaffModel,
} from "../models/index.js";
import ErrorHandler from "../utils/error_handler.js";
import { Op } from "sequelize";

export const RISK_STATUS = {
  UNHANDLED: 0,
  RESOLVED: 1,
  PROCESSING: 2,
  IGNORED: 3,
};

export const RISK_LEVEL = {
  THAP: "THAP",
  BINH_THUONG: "BINH_THUONG",
  CAO: "CAO",
  KHAN_CAP: "KHAN_CAP",
};

export const RISK_SOURCE = {
  HE_THONG: "HE_THONG",
  NHAN_VIEN: "NHAN_VIEN",
  KHACH_HANG: "KHACH_HANG",
  THANH_TOAN: "THANH_TOAN",
  VAN_CHUYEN: "VAN_CHUYEN",
};

const VALID_RISK_STATUSES = Object.values(RISK_STATUS);
const VALID_RISK_LEVELS = Object.values(RISK_LEVEL);
const VALID_RISK_SOURCES = Object.values(RISK_SOURCE);

const normalizePositiveInteger = (value, message) => {
  const numberValue = Number(value);

  if (!Number.isInteger(numberValue) || numberValue <= 0) {
    throw new ErrorHandler(message, 422);
  }

  return numberValue;
};

const normalizeNullablePositiveInteger = (value, message) => {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  return normalizePositiveInteger(value, message);
};

const normalizeNullableText = (value) => {
  if (value === undefined || value === null) {
    return null;
  }

  const text = String(value).trim();

  return text || null;
};

const normalizeRiskStatus = (value) => {
  const numberValue = Number(value);

  if (!VALID_RISK_STATUSES.includes(numberValue)) {
    throw new ErrorHandler("Trạng thái rủi ro không hợp lệ!", 422);
  }

  return numberValue;
};

const normalizeRiskLevel = (value) => {
  if (value === undefined || value === null || value === "") {
    return RISK_LEVEL.BINH_THUONG;
  }

  const level = String(value).trim().toUpperCase();

  if (!VALID_RISK_LEVELS.includes(level)) {
    throw new ErrorHandler("Mức độ rủi ro không hợp lệ!", 422);
  }

  return level;
};

const normalizeRiskSource = (value) => {
  if (value === undefined || value === null || value === "") {
    return RISK_SOURCE.NHAN_VIEN;
  }

  const source = String(value).trim().toUpperCase();

  if (!VALID_RISK_SOURCES.includes(source)) {
    throw new ErrorHandler("Nguồn phát hiện rủi ro không hợp lệ!", 422);
  }

  return source;
};

const getRiskListInclude = () => [
  {
    model: OrderModel,
    required: false,
    attributes: [
      "MaDonHang",
      "MaHienThi",
      "TenNguoiNhan",
      "SDT",
      "DiaChiGiaoHang",
      "TongThanhToan",
      "TrangThaiDonHang",
      "TrangThaiThanhToan",
      "NgayDat",
    ],
  },
  {
    model: StaffModel,
    as: "NhanVienPhuTrach",
    required: false,
    attributes: ["MaNhanVien", "TenNhanVien", "SDT"],
  },
];

const getRiskDetailInclude = () => [
  {
    model: OrderModel,
    required: false,
    include: [
      {
        model: OrderDetailModel,
        required: false,
        include: [
          {
            model: VariantModel,
            required: false,
            include: [
              {
                model: ProductModel,
                required: false,
              },
              {
                model: VariantImageModel,
                required: false,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    model: StaffModel,
    as: "NhanVienPhuTrach",
    required: false,
    attributes: ["MaNhanVien", "TenNhanVien", "SDT"],
  },
];

const findRiskOrFail = async (MaRuiRo, options = {}) => {
  const risk = await RiskModel.findByPk(MaRuiRo, {
    include: getRiskDetailInclude(),
    ...options,
  });

  if (!risk) {
    throw new ErrorHandler("Không tìm thấy rủi ro này!", 404);
  }

  return risk;
};

const ensureOrderExists = async (MaDonHang) => {
  const order = await OrderModel.findByPk(MaDonHang);

  if (!order) {
    throw new ErrorHandler("Không tìm thấy đơn hàng liên quan!", 404);
  }

  return order;
};

const ensureStaffExistsIfNeeded = async (MaNhanVienPhuTrach) => {
  if (!MaNhanVienPhuTrach) {
    return null;
  }

  const staff = await StaffModel.findByPk(MaNhanVienPhuTrach);

  if (!staff) {
    throw new ErrorHandler("Không tìm thấy nhân viên phụ trách!", 404);
  }

  return staff;
};

const applyResolvedTimeByStatus = (risk, status) => {
  if (status === RISK_STATUS.RESOLVED || status === RISK_STATUS.IGNORED) {
    if (!risk.NgayXuLy) {
      risk.NgayXuLy = new Date();
    }

    return;
  }

  risk.NgayXuLy = null;
};

export const getAllRiskService = async (
  page = 1,
  limit = 10,
  search = "",
  status,
  order = "DESC",
  level,
  source,
) => {
  const currentPage = Math.max(Number(page) || 1, 1);
  const pageSize = Math.max(Number(limit) || 10, 1);
  const offset = (currentPage - 1) * pageSize;
  const sortOrder = String(order).toUpperCase() === "ASC" ? "ASC" : "DESC";

  const keyword = String(search || "").trim();
  const riskWhere = {};

  if (status !== undefined && status !== null && status !== "") {
    riskWhere.TrangThai = normalizeRiskStatus(status);
  }

  if (level && level !== "all") {
    riskWhere.MucDo = normalizeRiskLevel(level);
  }

  if (source && source !== "all") {
    riskWhere.NguonPhatHien = normalizeRiskSource(source);
  }

  if (keyword) {
    riskWhere[Op.or] = [
      { LoaiRuiRo: { [Op.like]: `%${keyword}%` } },
      { MucDo: { [Op.like]: `%${keyword}%` } },
      { NguonPhatHien: { [Op.like]: `%${keyword}%` } },
      { MoTa: { [Op.like]: `%${keyword}%` } },
      { GhiChu: { [Op.like]: `%${keyword}%` } },
      { "$DonHang.MaHienThi$": { [Op.like]: `%${keyword}%` } },
      { "$DonHang.TenNguoiNhan$": { [Op.like]: `%${keyword}%` } },
      { "$DonHang.SDT$": { [Op.like]: `%${keyword}%` } },
    ];
  }

  const risks = await RiskModel.findAndCountAll({
    where: riskWhere,
    limit: pageSize,
    offset,
    distinct: true,
    col: "MaRuiRo",
    subQuery: false,
    order: [["MaRuiRo", sortOrder]],
    include: getRiskListInclude(),
  });

  return {
    totalItems: risks.count,
    totalPages: Math.ceil(risks.count / pageSize),
    currentPage,
    data: risks.rows,
  };
};

export const getRiskByIdService = async (MaRuiRo) => {
  return await findRiskOrFail(MaRuiRo);
};

export const createRiskService = async (payload) => {
  const MaDonHang = normalizePositiveInteger(
    payload.MaDonHang,
    "Mã đơn hàng không hợp lệ!",
  );

  await ensureOrderExists(MaDonHang);

  const MaNhanVienPhuTrach = normalizeNullablePositiveInteger(
    payload.MaNhanVienPhuTrach,
    "Nhân viên phụ trách không hợp lệ!",
  );

  await ensureStaffExistsIfNeeded(MaNhanVienPhuTrach);

  const risk = await RiskModel.create({
    MaDonHang,
    LoaiRuiRo: normalizeNullableText(payload.LoaiRuiRo),
    MucDo: normalizeRiskLevel(payload.MucDo),
    NguonPhatHien: normalizeRiskSource(payload.NguonPhatHien),
    MoTa: normalizeNullableText(payload.MoTa),
    TrangThai:
      payload.TrangThai === undefined ||
      payload.TrangThai === null ||
      payload.TrangThai === ""
        ? RISK_STATUS.UNHANDLED
        : normalizeRiskStatus(payload.TrangThai),
    GhiChu: normalizeNullableText(payload.GhiChu),
    MaNhanVienPhuTrach,
  });

  return await getRiskByIdService(risk.MaRuiRo);
};

export const updateRiskService = async (MaRuiRo, payload) => {
  const risk = await RiskModel.findByPk(MaRuiRo);

  if (!risk) {
    throw new ErrorHandler("Không tìm thấy rủi ro này!", 404);
  }

  if (payload.MaDonHang !== undefined && payload.MaDonHang !== null) {
    const MaDonHang = normalizePositiveInteger(
      payload.MaDonHang,
      "Mã đơn hàng không hợp lệ!",
    );

    await ensureOrderExists(MaDonHang);
    risk.MaDonHang = MaDonHang;
  }

  if (payload.LoaiRuiRo !== undefined) {
    risk.LoaiRuiRo = normalizeNullableText(payload.LoaiRuiRo);
  }

  if (payload.MucDo !== undefined) {
    risk.MucDo = normalizeRiskLevel(payload.MucDo);
  }

  if (payload.NguonPhatHien !== undefined) {
    risk.NguonPhatHien = normalizeRiskSource(payload.NguonPhatHien);
  }

  if (payload.MoTa !== undefined) {
    risk.MoTa = normalizeNullableText(payload.MoTa);
  }

  if (payload.GhiChu !== undefined) {
    risk.GhiChu = normalizeNullableText(payload.GhiChu);
  }

  if (payload.MaNhanVienPhuTrach !== undefined) {
    const MaNhanVienPhuTrach = normalizeNullablePositiveInteger(
      payload.MaNhanVienPhuTrach,
      "Nhân viên phụ trách không hợp lệ!",
    );

    await ensureStaffExistsIfNeeded(MaNhanVienPhuTrach);
    risk.MaNhanVienPhuTrach = MaNhanVienPhuTrach;
  }

  if (payload.TrangThai !== undefined) {
    const nextStatus = normalizeRiskStatus(payload.TrangThai);
    risk.TrangThai = nextStatus;
    applyResolvedTimeByStatus(risk, nextStatus);
  }

  await risk.save();

  return await getRiskByIdService(MaRuiRo);
};

export const updateRiskStatusService = async (
  MaRuiRo,
  TrangThai,
  GhiChu,
  MaNhanVienPhuTrach,
) => {
  const risk = await RiskModel.findByPk(MaRuiRo);

  if (!risk) {
    throw new ErrorHandler("Không tìm thấy rủi ro này!", 404);
  }

  const nextStatus = normalizeRiskStatus(TrangThai);
  const staffId = normalizeNullablePositiveInteger(
    MaNhanVienPhuTrach,
    "Nhân viên phụ trách không hợp lệ!",
  );

  await ensureStaffExistsIfNeeded(staffId);

  risk.TrangThai = nextStatus;
  applyResolvedTimeByStatus(risk, nextStatus);

  if (GhiChu !== undefined) {
    risk.GhiChu = normalizeNullableText(GhiChu);
  }

  if (staffId !== null) {
    risk.MaNhanVienPhuTrach = staffId;
  }

  await risk.save();

  return await getRiskByIdService(MaRuiRo);
};