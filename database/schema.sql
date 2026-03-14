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
    Username VARCHAR(100) NOT NULL UNIQUE,
    Email VARCHAR(100) NOT NULL UNIQUE,
    Password VARCHAR(255) NOT NULL,
    MaPhanQuyen INT,
    FOREIGN KEY (MaPhanQuyen) REFERENCES PhanQuyen(MaPhanQuyen)
);

CREATE TABLE SanPham (
    MaSanPham INT AUTO_INCREMENT PRIMARY KEY,
    MaDanhMuc INT,
    TenSanPham VARCHAR(100) NOT NULL,
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
    Diachi VARCHAR(255),
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



CREATE TABLE ChiTietDonHang (
    MaCTDH INT AUTO_INCREMENT PRIMARY KEY,
    MaDonHang INT NOT NULL,
    MaBienThe INT NOT NULL,
    SoLuong INT NOT NULL,
    GiaBan DECIMAL(15,2) NOT NULL,
    ThanhTien DECIMAL(15,2) NOT NULL,
    FOREIGN KEY (MaDonHang) REFERENCES DonHang(MaDonHang),
    FOREIGN KEY (MaBienThe) REFERENCES BienTheSanPham(MaBienThe)
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
