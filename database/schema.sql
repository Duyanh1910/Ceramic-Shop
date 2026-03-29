create database CeramicShop;
use CeramicShop;


CREATE TABLE PhanQuyen (
    MaPhanQuyen INT AUTO_INCREMENT PRIMARY KEY,
    TenPhanQuyen VARCHAR(50) NOT NULL
);

CREATE TABLE DanhMucSanPham (
    MaDanhMuc INT AUTO_INCREMENT PRIMARY KEY,
    TenDanhMuc VARCHAR(100) NOT NULL,
    MoTa VARCHAR(255),
    ParentID INT,
    FOREIGN KEY (ParentID) REFERENCES DanhMucSanPham(MaDanhMuc)
);

CREATE TABLE ThuocTinh (
    MaThuocTinh INT AUTO_INCREMENT PRIMARY KEY,
    TenThuocTinh VARCHAR(100) NOT NULL
);

CREATE TABLE NhaCungCap (
    MaNhaCC INT AUTO_INCREMENT PRIMARY KEY,
    TenNhaCC VARCHAR(100) NOT NULL,
    Diachi VARCHAR(255),
    SDT VARCHAR(10)
);

CREATE TABLE PhuongThucThanhToan (
    MaPhuongThuc INT AUTO_INCREMENT PRIMARY KEY,
    TenPhuongThuc VARCHAR(100) NOT NULL,
    MoTa VARCHAR(255),
    TrangThai TINYINT DEFAULT 1
);

CREATE TABLE LoaiKhuyenMai (
    MaLoaiKM INT AUTO_INCREMENT PRIMARY KEY,
    TenLoaiKM VARCHAR(100) NOT NULL,
    MoTa VARCHAR(255)
);

CREATE TABLE LoaiPhiVanChuyen (
    MaLoaiPhi INT AUTO_INCREMENT PRIMARY KEY,
    TenLoaiPhi VARCHAR(100) NOT NULL,
    MoTa VARCHAR(255)
);

CREATE TABLE TaiKhoan (
    MaTaiKhoan INT AUTO_INCREMENT PRIMARY KEY,
    Username VARCHAR(100) NULL UNIQUE,
    Email VARCHAR(100) NULL UNIQUE,
    Password VARCHAR(255) NULL,
    MaPhanQuyen INT,
    TrangThai TINYINT DEFAULT 1,
    FOREIGN KEY (MaPhanQuyen) REFERENCES PhanQuyen(MaPhanQuyen)
);

CREATE TABLE SanPham (
    MaSanPham INT AUTO_INCREMENT PRIMARY KEY,
    MaDanhMuc INT,
    TenSanPham VARCHAR(100) NOT NULL,
    Thumbnail VARCHAR(255),
    ThuongHieu VARCHAR(100),
    LuotXem INT DEFAULT 0,
    MoTa TEXT,
    TrangThai TINYINT DEFAULT 1,
    FOREIGN KEY (MaDanhMuc) REFERENCES DanhMucSanPham(MaDanhMuc)
);

CREATE TABLE GiaTriThuocTinh (
    MaGiaTri INT AUTO_INCREMENT PRIMARY KEY,
    MaThuocTinh INT NOT NULL,
    GiaTri VARCHAR(100) NOT NULL,
    FOREIGN KEY (MaThuocTinh) REFERENCES ThuocTinh(MaThuocTinh)
);

CREATE TABLE KhuyenMai (
    MaKhuyenMai INT AUTO_INCREMENT PRIMARY KEY,
    MaLoaiKM INT NOT NULL,
    TenKhuyenMai VARCHAR(255) NOT NULL,
    GiaTri DECIMAL(15,2) NOT NULL,
    GiaTriToiThieu DECIMAL(15,2),
    GiamToiDa DECIMAL(15,2),
    NgayBatDau DATETIME,
    NgayKetThuc DATETIME,
    TrangThai TINYINT DEFAULT 1,
    FOREIGN KEY (MaLoaiKM) REFERENCES LoaiKhuyenMai(MaLoaiKM)
);

CREATE TABLE PhiVanChuyen (
    MaPhi INT AUTO_INCREMENT PRIMARY KEY,
    MaLoaiPhi INT NOT NULL,
    GiaTri DECIMAL(15,2) NOT NULL,
    FOREIGN KEY (MaLoaiPhi) REFERENCES LoaiPhiVanChuyen(MaLoaiPhi)
);


CREATE TABLE NhanVien (
    MaNhanVien INT AUTO_INCREMENT PRIMARY KEY,
    MaTaiKhoan INT UNIQUE,
    TenNhanVien VARCHAR(100) NOT NULL,
    SDT VARCHAR(10) NOT NULL ,
    NgaySinh DATE NOT NULL ,
    DiaChi VARCHAR(255) NOT NULL ,
    FOREIGN KEY (MaTaiKhoan) REFERENCES TaiKhoan(MaTaiKhoan)
);

CREATE TABLE KhachHang (
    MaKhachHang INT AUTO_INCREMENT PRIMARY KEY,
    MaTaiKhoan INT UNIQUE,
    TenKhachHang VARCHAR(100) NOT NULL,
    SDT VARCHAR(10),
    DiaChi VARCHAR(255),
    Avatar VARCHAR(255),
    FOREIGN KEY (MaTaiKhoan) REFERENCES TaiKhoan(MaTaiKhoan)
);

CREATE TABLE BienTheSanPham (
    MaBienThe INT AUTO_INCREMENT PRIMARY KEY,
    MaSanPham INT NOT NULL,
    TenBienThe VARCHAR(100) NOT NULL,
    Gia DECIMAL(15,2) NOT NULL,
    SoLuong INT DEFAULT 0,
    TrangThai TINYINT DEFAULT 1,
    MoTa VARCHAR(255),
    FOREIGN KEY (MaSanPham) REFERENCES SanPham(MaSanPham)
);

CREATE TABLE TinTuc (
    MaTinTuc INT AUTO_INCREMENT PRIMARY KEY,
    MaNhanVien INT,
    TieuDe VARCHAR(255) NOT NULL,
    NoiDung LONGTEXT,
    HinhAnh VARCHAR(255),
    NgayTao DATETIME DEFAULT CURRENT_TIMESTAMP,
    TrangThai TINYINT DEFAULT 1,
    FOREIGN KEY (MaNhanVien) REFERENCES NhanVien(MaNhanVien)
);

CREATE TABLE HinhAnhBienThe (
    MaHinhAnh INT AUTO_INCREMENT PRIMARY KEY,
    MaBienThe INT,
    DuongDan VARCHAR(255) NOT NULL,
    FOREIGN KEY (MaBienThe) REFERENCES BienTheSanPham(MaBienThe)
);

CREATE TABLE ChiTietBienThe (
    MaBienThe INT,
    MaGiaTri INT,
    PRIMARY KEY (MaBienThe, MaGiaTri),
    FOREIGN KEY (MaBienThe) REFERENCES BienTheSanPham(MaBienThe),
    FOREIGN KEY (MaGiaTri) REFERENCES GiaTriThuocTinh(MaGiaTri)
);

CREATE TABLE GioHang (
    MaGioHang INT AUTO_INCREMENT PRIMARY KEY,
    MaKhachHang INT NOT NULL UNIQUE,
    FOREIGN KEY (MaKhachHang) REFERENCES KhachHang(MaKhachHang)
);

CREATE TABLE ChiTietGioHang (
    MaChiTietGH INT AUTO_INCREMENT PRIMARY KEY,
    MaGioHang INT NOT NULL,
    MaBienThe INT NOT NULL,
    SoLuong INT NOT NULL,
    FOREIGN KEY (MaGioHang) REFERENCES GioHang(MaGioHang),
    FOREIGN KEY (MaBienThe) REFERENCES BienTheSanPham(MaBienThe),
    UNIQUE (MaGioHang, MaBienThe)
);

CREATE TABLE DonHang (
    MaDonHang INT AUTO_INCREMENT PRIMARY KEY,
    MaKhachHang INT NOT NULL,
    NgayDat DATETIME DEFAULT CURRENT_TIMESTAMP,
    TongTienHang DECIMAL(15,2) DEFAULT 0,
    TongPhiVanChuyen DECIMAL(15,2) DEFAULT 0,
    TongGiamGia DECIMAL(15,2) DEFAULT 0,
    TongThanhToan DECIMAL(15,2) DEFAULT 0,
    DiaChiGiaoHang VARCHAR(255),
    TenNguoiNhan VARCHAR(100),
    SDT VARCHAR(10),
    TrangThaiDonHang TINYINT DEFAULT 0,
    TrangThaiThanhToan TINYINT DEFAULT 0,
    MaPhuongThuc INT,
    GhiChu VARCHAR(255),
    FOREIGN KEY (MaKhachHang) REFERENCES KhachHang(MaKhachHang),
    FOREIGN KEY (MaPhuongThuc) REFERENCES PhuongThucThanhToan(MaPhuongThuc)
);
ALTER TABLE DonHang
ADD MaHienThi VARCHAR(30) UNIQUE;

CREATE TABLE PhieuNhap (
    MaPhieuNhap INT AUTO_INCREMENT PRIMARY KEY,
    MaNhaCC INT,
    MaNhanVien INT,
    NgayNhap DATETIME DEFAULT CURRENT_TIMESTAMP,
    TongTien DECIMAL(15,2) DEFAULT 0,
    GhiChu VARCHAR(255),
    TrangThai TINYINT DEFAULT 0,
    FOREIGN KEY (MaNhaCC) REFERENCES NhaCungCap(MaNhaCC),
    FOREIGN KEY (MaNhanVien) REFERENCES NhanVien(MaNhanVien)
);


CREATE TABLE ChiTietKhuyenMaiDonHang (
    MaDonHang INT,
    MaKhuyenMai INT,
    SoTienChietKhau DECIMAL(15,2) NOT NULL,
    PRIMARY KEY (MaDonHang, MaKhuyenMai),
    FOREIGN KEY (MaDonHang) REFERENCES DonHang(MaDonHang),
    FOREIGN KEY (MaKhuyenMai) REFERENCES KhuyenMai(MaKhuyenMai)
);

CREATE TABLE ChiTietPhiVanChuyenDonHang (
    MaDonHang INT,
    MaPhi  INT,
    SoTienPhi DECIMAL(15,2) NOT NULL,
    PRIMARY KEY (MaDonHang, MaPhi),
    FOREIGN KEY (MaDonHang) REFERENCES DonHang(MaDonHang),
    FOREIGN KEY (MaPhi) REFERENCES PhiVanChuyen(MaPhi)
);

CREATE TABLE ChiTietPhieuNhap (
    MaChiTietPhieu INT AUTO_INCREMENT PRIMARY KEY,
    MaPhieuNhap INT,
    MaBienThe INT,
    SoLuong INT NOT NULL,
    GiaNhap DECIMAL(15,2) NOT NULL,
    ThanhTien DECIMAL(15,2) NOT NULL,
    FOREIGN KEY (MaPhieuNhap) REFERENCES PhieuNhap(MaPhieuNhap),
    FOREIGN KEY (MaBienThe) REFERENCES BienTheSanPham(MaBienThe)
);

CREATE TABLE DanhGia (
    MaDanhGia INT AUTO_INCREMENT PRIMARY KEY,
    MaKhachHang INT,
    MaCTDH INT,
    DiemDanhGia INT CHECK (DiemDanhGia BETWEEN 1 AND 5),
    NoiDung VARCHAR(255),
    NgayGui DATETIME DEFAULT CURRENT_TIMESTAMP,
    TrangThai TINYINT DEFAULT 1,
    FOREIGN KEY (MaKhachHang) REFERENCES KhachHang(MaKhachHang),
    FOREIGN KEY (MaCTDH) REFERENCES ChiTietDonHang(MaCTDH)
);

CREATE TABLE LichSuTonKho (
    MaLichSu INT AUTO_INCREMENT PRIMARY KEY,
    MaBienThe INT,
    LoaiGiaoDich VARCHAR(100),
    SoLuongThayDoi INT NOT NULL,
    TonKhoHienTai INT NOT NULL,
    LoaiThamChieu VARCHAR(100),
    MaThamChieu INT,
    NgayTao DATETIME DEFAULT CURRENT_TIMESTAMP,
    GhiChu VARCHAR(255),
    FOREIGN KEY (MaBienThe) REFERENCES BienTheSanPham(MaBienThe)
);

CREATE TABLE BaoHanh (
    MaBaoHanh INT AUTO_INCREMENT PRIMARY KEY,
    MaCTDH INT NOT NULL,
    NgayBatDau DATETIME NOT NULL,
    NgayKetThuc DATETIME NOT NULL,
    TrangThai TINYINT DEFAULT 1,
    GhiChu VARCHAR(255),
    FOREIGN KEY (MaCTDH) REFERENCES ChiTietDonHang(MaCTDH)
);

CREATE TABLE LichSuBaoHanh (
    MaLichSuBH INT AUTO_INCREMENT PRIMARY KEY,
    MaBaoHanh INT,
    NgayXuLy DATETIME DEFAULT CURRENT_TIMESTAMP,
    NoiDungXuLy VARCHAR(255),
    TrangThai TINYINT,
    FOREIGN KEY (MaBaoHanh) REFERENCES BaoHanh(MaBaoHanh)
);

CREATE TABLE DoiTra (
    MaDoiTra INT AUTO_INCREMENT PRIMARY KEY,
    MaCTDH INT NOT NULL,
    SoLuongDoiTra INT NOT NULL,
    LyDo VARCHAR(255),
    TrangThai TINYINT DEFAULT 0,
    NgayYeuCau DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (MaCTDH) REFERENCES ChiTietDonHang(MaCTDH)
);

CREATE TABLE XuLyDoiTra (
    MaXuLy INT AUTO_INCREMENT PRIMARY KEY,
    MaDoiTra INT,
    HanhDong VARCHAR(100),
    GhiChu VARCHAR(255),
    NgayXuLy DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (MaDoiTra) REFERENCES DoiTra(MaDoiTra)
);

CREATE TABLE RuiRo (
    MaRuiRo INT AUTO_INCREMENT PRIMARY KEY,
    MaDonHang INT NOT NULL,
    LoaiRuiRo VARCHAR(100),
    MoTa VARCHAR(255),
    TrangThai TINYINT DEFAULT 0,
    NgayPhatHien DATETIME DEFAULT CURRENT_TIMESTAMP,
    GhiChu VARCHAR(255),
    FOREIGN KEY (MaDonHang) REFERENCES DonHang(MaDonHang)
);

CREATE INDEX idx_product_category ON SanPham (MaDanhMuc);
CREATE INDEX idx_product_status ON SanPham (TrangThai);
CREATE INDEX idx_product_category_status ON SanPham (MaDanhMuc, TrangThai);
CREATE INDEX idx_product_name ON SanPham (TenSanPham);

CREATE INDEX idx_variant_product ON BienTheSanPham (MaSanPham);
CREATE INDEX idx_variant_status ON BienTheSanPham (TrangThai);
CREATE INDEX idx_variant_price ON BienTheSanPham (Gia);

CREATE INDEX idx_category_parent ON DanhMucSanPham (ParentID);

CREATE INDEX idx_variant_image_variant ON HinhAnhBienThe (MaBienThe);

CREATE INDEX idx_cart_customer ON GioHang (MaKhachHang);

CREATE INDEX idx_cart_detail_cart ON ChiTietGioHang (MaGioHang);
CREATE INDEX idx_cart_detail_variant ON ChiTietGioHang (MaBienThe);

CREATE INDEX idx_order_customer ON DonHang (MaKhachHang);
CREATE INDEX idx_order_status ON DonHang (TrangThaiDonHang);
CREATE INDEX idx_order_date ON DonHang (NgayDat);

CREATE INDEX idx_order_detail_order ON ChiTietDonHang (MaDonHang);
CREATE INDEX idx_order_detail_variant ON ChiTietDonHang (MaBienThe);

CREATE INDEX idx_inventory_variant ON LichSuTonKho (MaBienThe);
CREATE INDEX idx_inventory_reference ON LichSuTonKho (MaThamChieu);

CREATE INDEX idx_review_customer ON DanhGia (MaKhachHang);
CREATE INDEX idx_review_order_detail ON DanhGia (MaCTDH);

CREATE INDEX idx_import_supplier ON PhieuNhap (MaNhaCC);
CREATE INDEX idx_import_employee ON PhieuNhap (MaNhanVien);

CREATE INDEX idx_import_detail_import ON ChiTietPhieuNhap (MaPhieuNhap);
CREATE INDEX idx_import_detail_variant ON ChiTietPhieuNhap (MaBienThe);

SET FOREIGN_KEY_CHECKS = 0;

-- =========================================================================
-- 1. TẠO BẢNG CẤU HÌNH HỆ THỐNG ĐỂ ADMIN QUẢN LÝ
-- =========================================================================
DROP TABLE IF EXISTS CauHinhHeThong;
CREATE TABLE CauHinhHeThong (
    MaCauHinh VARCHAR(50) PRIMARY KEY COMMENT 'Khóa cấu hình (Key)',
    GiaTri DECIMAL(15,2) NOT NULL COMMENT 'Giá trị cấu hình (Value)',
    MoTa VARCHAR(255) COMMENT 'Mô tả cho Admin'
);

INSERT INTO CauHinhHeThong (MaCauHinh, GiaTri, MoTa) VALUES
('MUC_KG_TIEU_CHUAN', 2.00, 'Mức kg miễn phí vượt trọng lượng'),
('PHI_VUOT_KG_NOI_THANH', 5000, 'Phí cộng thêm mỗi kg vượt mức nội thành'),
('PHI_VUOT_KG_LIEN_TINH', 10000, 'Phí cộng thêm mỗi kg vượt mức liên tỉnh'),
('PHI_VUOT_KG_HOA_TOC', 10000, 'Phí cộng thêm mỗi kg hỏa tốc (vượt 3kg)'),
('PHU_PHI_CONG_KENH', 20000, 'Phụ phí đóng thùng xốp/sản phẩm (Gốm 1-20kg)'),
('PHU_PHI_SIEU_CONG_KENH', 100000, 'Phụ phí đóng kiện gỗ/sản phẩm (Gốm > 20kg)'),
('PHI_THUE_XE_BAN_TAI', 150000, 'Phụ phí thuê xe bán tải cho đơn Hỏa tốc quá nặng');


-- =========================================================================
-- 2. CẬP NHẬT BẢNG KHUYẾN MÃI VÀ DỮ LIỆU
-- =========================================================================
-- Cập nhật cấu trúc bảng KhuyenMai
ALTER TABLE KhuyenMai
ADD COLUMN MaCode VARCHAR(50) UNIQUE COMMENT 'Mã nhập voucher',
ADD COLUMN SoLuong INT DEFAULT 0 COMMENT 'Giới hạn số lượng mã',
ADD COLUMN LoaiVoucher TINYINT DEFAULT 1 COMMENT '1: Khuyến mãi đơn hàng, 2: Khuyến mãi phí ship',
ADD COLUMN MaDanhMuc INT NULL COMMENT 'NULL = Toàn shop, Có ID = Chỉ áp dụng danh mục đó';

ALTER TABLE KhuyenMai
ADD CONSTRAINT FK_KhuyenMai_DanhMuc FOREIGN KEY (MaDanhMuc) REFERENCES DanhMucSanPham(MaDanhMuc);

-- CẬP NHẬT DỮ LIỆU CŨ (3 mã khuyến mãi đã có trong file order.sql của bạn)
UPDATE KhuyenMai SET MaCode = 'SALE10', SoLuong = 100, LoaiVoucher = 1, MaDanhMuc = NULL WHERE MaKhuyenMai = 1;
UPDATE KhuyenMai SET MaCode = 'TRIAN50K', SoLuong = 200, LoaiVoucher = 1, MaDanhMuc = NULL WHERE MaKhuyenMai = 2;
UPDATE KhuyenMai SET MaCode = 'FREESHIP', SoLuong = 500, LoaiVoucher = 2, MaDanhMuc = NULL WHERE MaKhuyenMai = 3;

-- THÊM MỘT SỐ MÃ KHUYẾN MÃI MỚI ĐỂ TEST LOGIC THEO DANH MỤC
INSERT INTO KhuyenMai (MaKhuyenMai, MaLoaiKM, TenKhuyenMai, GiaTri, GiaTriToiThieu, GiamToiDa, NgayBatDau, NgayKetThuc, TrangThai, MaCode, SoLuong, LoaiVoucher, MaDanhMuc) VALUES
(4, 1, 'Giảm 15% Đồ phòng bếp', 15, 300000, 100000, '2026-03-01', '2026-12-31', 1, 'BEP15', 50, 1, 1),
(5, 2, 'Giảm 100K Đồ phong thủy', 100000, 2000000, 100000, '2026-03-01', '2026-12-31', 1, 'PHONGTHUY100', 30, 1, 4),
(6, 3, 'Freeship Extra', 50000, 2000000, 50000, '2026-03-01', '2026-12-31', 1, 'FSEXT50', 100, 2, NULL);


-- =========================================================================
-- 3. TẠO BẢNG VÍ VOUCHER & THÊM DỮ LIỆU TEST CHO KHÁCH HÀNG
-- =========================================================================
DROP TABLE IF EXISTS ViKhuyenMai;
CREATE TABLE ViKhuyenMai (
    MaVi INT AUTO_INCREMENT PRIMARY KEY,
    MaKhachHang INT NOT NULL,
    MaKhuyenMai INT NOT NULL,
    NgayLuu DATETIME DEFAULT CURRENT_TIMESTAMP,
    TrangThaiSuDung TINYINT DEFAULT 0 COMMENT '0: Chưa dùng, 1: Đã dùng, 2: Hết hạn',
    FOREIGN KEY (MaKhachHang) REFERENCES KhachHang(MaKhachHang),
    FOREIGN KEY (MaKhuyenMai) REFERENCES KhuyenMai(MaKhuyenMai),
    UNIQUE(MaKhachHang, MaKhuyenMai)
);

-- Thêm sẵn mã vào ví để lúc bạn code Node.js có sẵn dữ liệu query ra
-- Khách hàng ID = 1 (Lê Khách Mua) có mã giảm toàn shop và Freeship
INSERT INTO ViKhuyenMai (MaKhachHang, MaKhuyenMai, TrangThaiSuDung) VALUES
(1, 1, 0),
(1, 3, 0);

-- Khách hàng ID = 2 (Nguyễn Văn An) có mã Đồ phòng bếp và Freeship Extra
INSERT INTO ViKhuyenMai (MaKhachHang, MaKhuyenMai, TrangThaiSuDung) VALUES
(2, 4, 0),
(2, 6, 0);

-- Khách hàng ID = 3 (Trần Thị Bình) có mã Đồ phong thủy
INSERT INTO ViKhuyenMai (MaKhachHang, MaKhuyenMai, TrangThaiSuDung) VALUES
(3, 5, 0);

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE TaiKhoanProvider (
MaProvider INT AUTO_INCREMENT PRIMARY KEY,
MaTaiKhoan INT NOT NULL,
Provider VARCHAR(50) NOT NULL, -- google, facebook
ProviderID VARCHAR(255) NOT NULL,
CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
UNIQUE (Provider, ProviderID),
FOREIGN KEY (MaTaiKhoan) REFERENCES TaiKhoan(MaTaiKhoan)
 ON DELETE CASCADE
);