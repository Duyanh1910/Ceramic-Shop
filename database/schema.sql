-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: gateway01.ap-southeast-1.prod.aws.tidbcloud.com    Database: test
-- ------------------------------------------------------
-- Server version	8.0.11-TiDB-v7.5.6-serverless

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `BaoHanh`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `BaoHanh` (
  `MaBaoHanh` int NOT NULL AUTO_INCREMENT,
  `MaCTDH` int NOT NULL,
  `NgayBatDau` datetime NOT NULL,
  `NgayKetThuc` datetime NOT NULL,
  `TrangThai` tinyint DEFAULT '1',
  `GhiChu` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`MaBaoHanh`) /*T![clustered_index] CLUSTERED */,
  KEY `fk_1` (`MaCTDH`),
  CONSTRAINT `fk_1` FOREIGN KEY (`MaCTDH`) REFERENCES `ChiTietDonHang` (`MaCTDH`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=30002;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `BienTheSanPham`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `BienTheSanPham` (
  `MaBienThe` int NOT NULL AUTO_INCREMENT,
  `MaSanPham` int NOT NULL,
  `TenBienThe` varchar(100) NOT NULL,
  `Gia` decimal(15,2) NOT NULL,
  `SoLuong` int DEFAULT '0',
  `TrangThai` tinyint DEFAULT '1',
  `MoTa` varchar(255) DEFAULT NULL,
  `KhoiLuong` decimal(10,2) DEFAULT '0.00' COMMENT 'Khối lượng tính bằng kg',
  `ChieuDai` decimal(10,2) DEFAULT '0.00' COMMENT 'Chiều dài hộp Gross (cm)',
  `ChieuRong` decimal(10,2) DEFAULT '0.00' COMMENT 'Chiều rộng hộp Gross (cm)',
  `ChieuCao` decimal(10,2) DEFAULT '0.00' COMMENT 'Chiều cao hộp Gross (cm)',
  PRIMARY KEY (`MaBienThe`) /*T![clustered_index] CLUSTERED */,
  KEY `fk_1` (`MaSanPham`),
  KEY `idx_variant_product` (`MaSanPham`),
  KEY `idx_variant_status` (`TrangThai`),
  KEY `idx_variant_price` (`Gia`),
  CONSTRAINT `fk_1` FOREIGN KEY (`MaSanPham`) REFERENCES `SanPham` (`MaSanPham`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=60002;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `CauHinhHeThong`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `CauHinhHeThong` (
  `MaCauHinh` varchar(50) NOT NULL COMMENT 'Khóa cấu hình (Key)',
  `GiaTri` decimal(15,2) NOT NULL COMMENT 'Giá trị cấu hình (Value)',
  `MoTa` varchar(255) DEFAULT NULL COMMENT 'Mô tả cho Admin',
  PRIMARY KEY (`MaCauHinh`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ChiTietBienThe`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ChiTietBienThe` (
  `MaBienThe` int NOT NULL,
  `MaGiaTri` int NOT NULL,
  PRIMARY KEY (`MaBienThe`,`MaGiaTri`) /*T![clustered_index] CLUSTERED */,
  KEY `fk_2` (`MaGiaTri`),
  CONSTRAINT `fk_1` FOREIGN KEY (`MaBienThe`) REFERENCES `BienTheSanPham` (`MaBienThe`),
  CONSTRAINT `fk_2` FOREIGN KEY (`MaGiaTri`) REFERENCES `GiaTriThuocTinh` (`MaGiaTri`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ChiTietDonHang`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ChiTietDonHang` (
  `MaCTDH` int NOT NULL AUTO_INCREMENT,
  `MaDonHang` int NOT NULL,
  `MaBienThe` int NOT NULL,
  `SoLuong` int NOT NULL,
  `GiaBan` decimal(15,2) NOT NULL,
  `ThanhTien` decimal(15,2) NOT NULL,
  PRIMARY KEY (`MaCTDH`) /*T![clustered_index] CLUSTERED */,
  KEY `fk_1` (`MaDonHang`),
  KEY `fk_2` (`MaBienThe`),
  KEY `idx_order_detail_order` (`MaDonHang`),
  KEY `idx_order_detail_variant` (`MaBienThe`),
  CONSTRAINT `fk_1` FOREIGN KEY (`MaDonHang`) REFERENCES `DonHang` (`MaDonHang`),
  CONSTRAINT `fk_2` FOREIGN KEY (`MaBienThe`) REFERENCES `BienTheSanPham` (`MaBienThe`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=900002;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ChiTietGioHang`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ChiTietGioHang` (
  `MaChiTietGH` int NOT NULL AUTO_INCREMENT,
  `MaGioHang` int NOT NULL,
  `MaBienThe` int NOT NULL,
  `SoLuong` int NOT NULL,
  PRIMARY KEY (`MaChiTietGH`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `MaGioHang` (`MaGioHang`,`MaBienThe`),
  KEY `fk_2` (`MaBienThe`),
  KEY `idx_cart_detail_cart` (`MaGioHang`),
  KEY `idx_cart_detail_variant` (`MaBienThe`),
  CONSTRAINT `fk_1` FOREIGN KEY (`MaGioHang`) REFERENCES `GioHang` (`MaGioHang`),
  CONSTRAINT `fk_2` FOREIGN KEY (`MaBienThe`) REFERENCES `BienTheSanPham` (`MaBienThe`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=1350002;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ChiTietKhuyenMaiDonHang`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ChiTietKhuyenMaiDonHang` (
  `MaDonHang` int NOT NULL,
  `MaKhuyenMai` int NOT NULL,
  `SoTienChietKhau` decimal(15,2) NOT NULL,
  PRIMARY KEY (`MaDonHang`,`MaKhuyenMai`) /*T![clustered_index] CLUSTERED */,
  KEY `fk_2` (`MaKhuyenMai`),
  CONSTRAINT `fk_1` FOREIGN KEY (`MaDonHang`) REFERENCES `DonHang` (`MaDonHang`),
  CONSTRAINT `fk_2` FOREIGN KEY (`MaKhuyenMai`) REFERENCES `KhuyenMai` (`MaKhuyenMai`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ChiTietPhieuNhap`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ChiTietPhieuNhap` (
  `MaChiTietPhieu` int NOT NULL AUTO_INCREMENT,
  `MaPhieuNhap` int DEFAULT NULL,
  `MaBienThe` int DEFAULT NULL,
  `SoLuong` int NOT NULL,
  `GiaNhap` decimal(15,2) NOT NULL,
  `ThanhTien` decimal(15,2) NOT NULL,
  PRIMARY KEY (`MaChiTietPhieu`) /*T![clustered_index] CLUSTERED */,
  KEY `fk_1` (`MaPhieuNhap`),
  KEY `fk_2` (`MaBienThe`),
  KEY `idx_import_detail_import` (`MaPhieuNhap`),
  KEY `idx_import_detail_variant` (`MaBienThe`),
  CONSTRAINT `fk_1` FOREIGN KEY (`MaPhieuNhap`) REFERENCES `PhieuNhap` (`MaPhieuNhap`),
  CONSTRAINT `fk_2` FOREIGN KEY (`MaBienThe`) REFERENCES `BienTheSanPham` (`MaBienThe`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=30002;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `DanhGia`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `DanhGia` (
  `MaDanhGia` int NOT NULL AUTO_INCREMENT,
  `MaKhachHang` int DEFAULT NULL,
  `MaCTDH` int DEFAULT NULL,
  `DiemDanhGia` int DEFAULT NULL,
  `NoiDung` varchar(255) DEFAULT NULL,
  `NgayGui` datetime DEFAULT CURRENT_TIMESTAMP,
  `TrangThai` tinyint DEFAULT '1',
  PRIMARY KEY (`MaDanhGia`) /*T![clustered_index] CLUSTERED */,
  KEY `fk_1` (`MaKhachHang`),
  KEY `fk_2` (`MaCTDH`),
  KEY `idx_review_customer` (`MaKhachHang`),
  KEY `idx_review_order_detail` (`MaCTDH`),
  CONSTRAINT `fk_1` FOREIGN KEY (`MaKhachHang`) REFERENCES `KhachHang` (`MaKhachHang`),
  CONSTRAINT `fk_2` FOREIGN KEY (`MaCTDH`) REFERENCES `ChiTietDonHang` (`MaCTDH`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=310002;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `DanhMucSanPham`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `DanhMucSanPham` (
  `MaDanhMuc` int NOT NULL AUTO_INCREMENT,
  `TenDanhMuc` varchar(100) NOT NULL,
  `MoTa` varchar(255) DEFAULT NULL,
  `ParentID` int DEFAULT NULL,
  PRIMARY KEY (`MaDanhMuc`) /*T![clustered_index] CLUSTERED */,
  KEY `fk_1` (`ParentID`),
  KEY `idx_category_parent` (`ParentID`),
  CONSTRAINT `fk_1` FOREIGN KEY (`ParentID`) REFERENCES `DanhMucSanPham` (`MaDanhMuc`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=30002;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `DoiTra`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `DoiTra` (
  `MaDoiTra` int NOT NULL AUTO_INCREMENT,
  `MaCTDH` int NOT NULL,
  `SoLuongDoiTra` int NOT NULL,
  `LyDo` varchar(255) DEFAULT NULL,
  `TrangThai` tinyint DEFAULT '0',
  `NgayYeuCau` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`MaDoiTra`) /*T![clustered_index] CLUSTERED */,
  KEY `fk_1` (`MaCTDH`),
  CONSTRAINT `fk_1` FOREIGN KEY (`MaCTDH`) REFERENCES `ChiTietDonHang` (`MaCTDH`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=30002;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `DonHang`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `DonHang` (
  `MaDonHang` int NOT NULL AUTO_INCREMENT,
  `MaKhachHang` int NOT NULL,
  `NgayDat` datetime DEFAULT CURRENT_TIMESTAMP,
  `TongTienHang` decimal(15,2) DEFAULT '0',
  `TongPhiVanChuyen` decimal(15,2) DEFAULT '0',
  `TongGiamGia` decimal(15,2) DEFAULT '0',
  `TongThanhToan` decimal(15,2) DEFAULT '0',
  `DiaChiGiaoHang` varchar(255) DEFAULT NULL,
  `TenNguoiNhan` varchar(100) DEFAULT NULL,
  `SDT` varchar(10) DEFAULT NULL,
  `TrangThaiDonHang` tinyint DEFAULT '0',
  `TrangThaiThanhToan` tinyint DEFAULT '0',
  `MaPhuongThuc` int DEFAULT NULL,
  `GhiChu` varchar(255) DEFAULT NULL,
  `MaHienThi` varchar(30) DEFAULT NULL,
  `MaLoaiPhi` int DEFAULT '1',
  PRIMARY KEY (`MaDonHang`) /*T![clustered_index] CLUSTERED */,
  KEY `fk_1` (`MaKhachHang`),
  KEY `fk_2` (`MaPhuongThuc`),
  KEY `idx_order_customer` (`MaKhachHang`),
  KEY `idx_order_status` (`TrangThaiDonHang`),
  KEY `idx_order_date` (`NgayDat`),
  UNIQUE KEY `idx_ma_hien_thi` (`MaHienThi`),
  KEY `fk_donhang_vanchuyen` (`MaLoaiPhi`),
  CONSTRAINT `fk_1` FOREIGN KEY (`MaKhachHang`) REFERENCES `KhachHang` (`MaKhachHang`),
  CONSTRAINT `fk_2` FOREIGN KEY (`MaPhuongThuc`) REFERENCES `PhuongThucThanhToan` (`MaPhuongThuc`),
  CONSTRAINT `fk_donhang_vanchuyen` FOREIGN KEY (`MaLoaiPhi`) REFERENCES `LoaiPhiVanChuyen` (`MaLoaiPhi`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=900002;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `GiaTriThuocTinh`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `GiaTriThuocTinh` (
  `MaGiaTri` int NOT NULL AUTO_INCREMENT,
  `MaThuocTinh` int NOT NULL,
  `GiaTri` varchar(100) NOT NULL,
  PRIMARY KEY (`MaGiaTri`) /*T![clustered_index] CLUSTERED */,
  KEY `fk_1` (`MaThuocTinh`),
  CONSTRAINT `fk_1` FOREIGN KEY (`MaThuocTinh`) REFERENCES `ThuocTinh` (`MaThuocTinh`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=30002;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `GiaoDichThanhToan`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `GiaoDichThanhToan` (
  `MaGiaoDich` int NOT NULL AUTO_INCREMENT,
  `MaDonHang` int NOT NULL,
  `MaPhuongThuc` int NOT NULL,
  `MaThamChieu` varchar(100) NOT NULL,
  `MaGiaoDichDoiTac` varchar(100) DEFAULT NULL,
  `SoTien` decimal(15,2) NOT NULL,
  `TrangThai` varchar(20) NOT NULL,
  `MaLoi` varchar(50) DEFAULT NULL,
  `DuLieuPhanHoi` json DEFAULT NULL,
  `ThoiGianGiaoDich` datetime DEFAULT CURRENT_TIMESTAMP,
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`MaGiaoDich`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `unique_txn_ref` (`MaThamChieu`),
  UNIQUE KEY `unique_partner_txn` (`MaGiaoDichDoiTac`),
  KEY `idx_donhang` (`MaDonHang`),
  KEY `idx_status` (`TrangThai`),
  KEY `fk_2` (`MaPhuongThuc`),
  CONSTRAINT `fk_1` FOREIGN KEY (`MaDonHang`) REFERENCES `DonHang` (`MaDonHang`),
  CONSTRAINT `fk_2` FOREIGN KEY (`MaPhuongThuc`) REFERENCES `PhuongThucThanhToan` (`MaPhuongThuc`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=1170001;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `GioHang`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `GioHang` (
  `MaGioHang` int NOT NULL AUTO_INCREMENT,
  `MaKhachHang` int NOT NULL,
  PRIMARY KEY (`MaGioHang`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `MaKhachHang` (`MaKhachHang`),
  KEY `idx_cart_customer` (`MaKhachHang`),
  CONSTRAINT `fk_1` FOREIGN KEY (`MaKhachHang`) REFERENCES `KhachHang` (`MaKhachHang`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=180002;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `HinhAnhBienThe`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `HinhAnhBienThe` (
  `MaHinhAnh` int NOT NULL AUTO_INCREMENT,
  `MaBienThe` int DEFAULT NULL,
  `DuongDan` varchar(255) NOT NULL,
  PRIMARY KEY (`MaHinhAnh`) /*T![clustered_index] CLUSTERED */,
  KEY `fk_1` (`MaBienThe`),
  KEY `idx_variant_image_variant` (`MaBienThe`),
  CONSTRAINT `fk_1` FOREIGN KEY (`MaBienThe`) REFERENCES `BienTheSanPham` (`MaBienThe`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=30001;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `KhachHang`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `KhachHang` (
  `MaKhachHang` int NOT NULL AUTO_INCREMENT,
  `MaTaiKhoan` int DEFAULT NULL,
  `TenKhachHang` varchar(100) NOT NULL,
  `SDT` varchar(10) DEFAULT NULL,
  `DiaChi` varchar(255) DEFAULT NULL,
  `Avatar` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`MaKhachHang`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `MaTaiKhoan` (`MaTaiKhoan`),
  CONSTRAINT `fk_1` FOREIGN KEY (`MaTaiKhoan`) REFERENCES `TaiKhoan` (`MaTaiKhoan`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=300001;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `KhuyenMai`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `KhuyenMai` (
  `MaKhuyenMai` int NOT NULL AUTO_INCREMENT,
  `MaLoaiKM` int NOT NULL,
  `TenKhuyenMai` varchar(255) NOT NULL,
  `GiaTri` decimal(15,2) NOT NULL,
  `GiaTriToiThieu` decimal(15,2) DEFAULT NULL,
  `GiamToiDa` decimal(15,2) DEFAULT NULL,
  `NgayBatDau` datetime DEFAULT NULL,
  `NgayKetThuc` datetime DEFAULT NULL,
  `TrangThai` tinyint DEFAULT '1',
  `MaCode` varchar(50) DEFAULT NULL COMMENT 'Mã nhập voucher',
  `SoLuong` int DEFAULT '0' COMMENT 'Giới hạn số lượng mã',
  `LoaiVoucher` tinyint DEFAULT '1' COMMENT '1: Khuyến mãi đơn hàng, 2: Khuyến mãi phí ship',
  `MaDanhMuc` int DEFAULT NULL COMMENT 'NULL = Toàn shop, Có ID = Chỉ áp dụng danh mục đó',
  PRIMARY KEY (`MaKhuyenMai`) /*T![clustered_index] CLUSTERED */,
  KEY `fk_1` (`MaLoaiKM`),
  UNIQUE KEY `idx_ma_code` (`MaCode`),
  KEY `FK_KhuyenMai_DanhMuc` (`MaDanhMuc`),
  CONSTRAINT `fk_1` FOREIGN KEY (`MaLoaiKM`) REFERENCES `LoaiKhuyenMai` (`MaLoaiKM`),
  CONSTRAINT `FK_KhuyenMai_DanhMuc` FOREIGN KEY (`MaDanhMuc`) REFERENCES `DanhMucSanPham` (`MaDanhMuc`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=90002;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `LichSuBaoHanh`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `LichSuBaoHanh` (
  `MaLichSuBH` int NOT NULL AUTO_INCREMENT,
  `MaBaoHanh` int DEFAULT NULL,
  `NgayXuLy` datetime DEFAULT CURRENT_TIMESTAMP,
  `NoiDungXuLy` varchar(255) DEFAULT NULL,
  `TrangThai` tinyint DEFAULT NULL,
  PRIMARY KEY (`MaLichSuBH`) /*T![clustered_index] CLUSTERED */,
  KEY `fk_1` (`MaBaoHanh`),
  CONSTRAINT `fk_1` FOREIGN KEY (`MaBaoHanh`) REFERENCES `BaoHanh` (`MaBaoHanh`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=30002;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `LichSuTonKho`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `LichSuTonKho` (
  `MaLichSu` int NOT NULL AUTO_INCREMENT,
  `MaBienThe` int DEFAULT NULL,
  `LoaiGiaoDich` varchar(100) DEFAULT NULL,
  `SoLuongThayDoi` int NOT NULL,
  `TonKhoHienTai` int NOT NULL,
  `LoaiThamChieu` varchar(100) DEFAULT NULL,
  `MaThamChieu` int DEFAULT NULL,
  `NgayTao` datetime DEFAULT CURRENT_TIMESTAMP,
  `GhiChu` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`MaLichSu`) /*T![clustered_index] CLUSTERED */,
  KEY `fk_1` (`MaBienThe`),
  KEY `idx_inventory_variant` (`MaBienThe`),
  KEY `idx_inventory_reference` (`MaThamChieu`),
  CONSTRAINT `fk_1` FOREIGN KEY (`MaBienThe`) REFERENCES `BienTheSanPham` (`MaBienThe`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=930002;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `LoaiKhuyenMai`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `LoaiKhuyenMai` (
  `MaLoaiKM` int NOT NULL AUTO_INCREMENT,
  `TenLoaiKM` varchar(100) NOT NULL,
  `MoTa` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`MaLoaiKM`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=30002;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `LoaiPhiVanChuyen`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `LoaiPhiVanChuyen` (
  `MaLoaiPhi` int NOT NULL AUTO_INCREMENT,
  `TenLoaiPhi` varchar(100) NOT NULL,
  `MoTa` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`MaLoaiPhi`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=30002;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `NhaCungCap`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `NhaCungCap` (
  `MaNhaCC` int NOT NULL AUTO_INCREMENT,
  `TenNhaCC` varchar(100) NOT NULL,
  `Diachi` varchar(255) DEFAULT NULL,
  `SDT` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`MaNhaCC`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=30002;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `NhanVien`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `NhanVien` (
  `MaNhanVien` int NOT NULL AUTO_INCREMENT,
  `MaTaiKhoan` int DEFAULT NULL,
  `TenNhanVien` varchar(100) NOT NULL,
  `SDT` varchar(10) NOT NULL,
  `NgaySinh` date NOT NULL,
  `DiaChi` varchar(255) NOT NULL,
  PRIMARY KEY (`MaNhanVien`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `MaTaiKhoan` (`MaTaiKhoan`),
  CONSTRAINT `fk_1` FOREIGN KEY (`MaTaiKhoan`) REFERENCES `TaiKhoan` (`MaTaiKhoan`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=60001;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `PhanQuyen`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `PhanQuyen` (
  `MaPhanQuyen` int NOT NULL AUTO_INCREMENT,
  `TenPhanQuyen` varchar(50) NOT NULL,
  PRIMARY KEY (`MaPhanQuyen`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=30001;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `PhieuNhap`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `PhieuNhap` (
  `MaPhieuNhap` int NOT NULL AUTO_INCREMENT,
  `MaNhaCC` int DEFAULT NULL,
  `MaNhanVien` int DEFAULT NULL,
  `NgayNhap` datetime DEFAULT CURRENT_TIMESTAMP,
  `TongTien` decimal(15,2) DEFAULT '0',
  `GhiChu` varchar(255) DEFAULT NULL,
  `TrangThai` tinyint DEFAULT '0',
  PRIMARY KEY (`MaPhieuNhap`) /*T![clustered_index] CLUSTERED */,
  KEY `fk_1` (`MaNhaCC`),
  KEY `fk_2` (`MaNhanVien`),
  KEY `idx_import_supplier` (`MaNhaCC`),
  KEY `idx_import_employee` (`MaNhanVien`),
  CONSTRAINT `fk_1` FOREIGN KEY (`MaNhaCC`) REFERENCES `NhaCungCap` (`MaNhaCC`),
  CONSTRAINT `fk_2` FOREIGN KEY (`MaNhanVien`) REFERENCES `NhanVien` (`MaNhanVien`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=30002;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `PhuongThucThanhToan`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `PhuongThucThanhToan` (
  `MaPhuongThuc` int NOT NULL AUTO_INCREMENT,
  `TenPhuongThuc` varchar(100) NOT NULL,
  `MoTa` varchar(255) DEFAULT NULL,
  `TrangThai` tinyint DEFAULT '1',
  PRIMARY KEY (`MaPhuongThuc`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=30002;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `RuiRo`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `RuiRo` (
  `MaRuiRo` int NOT NULL AUTO_INCREMENT,
  `MaDonHang` int NOT NULL,
  `LoaiRuiRo` varchar(100) DEFAULT NULL,
  `MoTa` varchar(255) DEFAULT NULL,
  `TrangThai` tinyint DEFAULT '0',
  `NgayPhatHien` datetime DEFAULT CURRENT_TIMESTAMP,
  `GhiChu` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`MaRuiRo`) /*T![clustered_index] CLUSTERED */,
  KEY `fk_1` (`MaDonHang`),
  CONSTRAINT `fk_1` FOREIGN KEY (`MaDonHang`) REFERENCES `DonHang` (`MaDonHang`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=30002;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `SanPham`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `SanPham` (
  `MaSanPham` int NOT NULL AUTO_INCREMENT,
  `MaDanhMuc` int DEFAULT NULL,
  `TenSanPham` varchar(100) NOT NULL,
  `Thumbnail` varchar(255) DEFAULT NULL,
  `ThuongHieu` varchar(100) DEFAULT NULL,
  `LuotXem` int DEFAULT '0',
  `MoTa` text DEFAULT NULL,
  `TrangThai` tinyint DEFAULT '1',
  PRIMARY KEY (`MaSanPham`) /*T![clustered_index] CLUSTERED */,
  KEY `fk_1` (`MaDanhMuc`),
  KEY `idx_product_category` (`MaDanhMuc`),
  KEY `idx_product_status` (`TrangThai`),
  KEY `idx_product_category_status` (`MaDanhMuc`,`TrangThai`),
  KEY `idx_product_name` (`TenSanPham`),
  CONSTRAINT `fk_1` FOREIGN KEY (`MaDanhMuc`) REFERENCES `DanhMucSanPham` (`MaDanhMuc`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=60002;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `TaiKhoan`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `TaiKhoan` (
  `MaTaiKhoan` int NOT NULL AUTO_INCREMENT,
  `Username` varchar(100) DEFAULT NULL,
  `Email` varchar(100) DEFAULT NULL,
  `Password` varchar(255) DEFAULT NULL,
  `MaPhanQuyen` int DEFAULT NULL,
  `TrangThai` tinyint DEFAULT '1',
  PRIMARY KEY (`MaTaiKhoan`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `Username` (`Username`),
  UNIQUE KEY `Email` (`Email`),
  KEY `fk_1` (`MaPhanQuyen`),
  CONSTRAINT `fk_1` FOREIGN KEY (`MaPhanQuyen`) REFERENCES `PhanQuyen` (`MaPhanQuyen`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=330001;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `TaiKhoanProvider`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `TaiKhoanProvider` (
  `MaProvider` int NOT NULL AUTO_INCREMENT,
  `MaTaiKhoan` int NOT NULL,
  `Provider` varchar(50) NOT NULL,
  `ProviderID` varchar(255) NOT NULL,
  `CreatedAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`MaProvider`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `Provider` (`Provider`,`ProviderID`),
  KEY `fk_1` (`MaTaiKhoan`),
  CONSTRAINT `fk_1` FOREIGN KEY (`MaTaiKhoan`) REFERENCES `TaiKhoan` (`MaTaiKhoan`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=150001;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ThuocTinh`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ThuocTinh` (
  `MaThuocTinh` int NOT NULL AUTO_INCREMENT,
  `TenThuocTinh` varchar(100) NOT NULL,
  PRIMARY KEY (`MaThuocTinh`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=30002;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `TinTuc`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `TinTuc` (
  `MaTinTuc` int NOT NULL AUTO_INCREMENT,
  `MaNhanVien` int DEFAULT NULL,
  `TieuDe` varchar(255) NOT NULL,
  `NoiDung` longtext DEFAULT NULL,
  `HinhAnh` varchar(255) DEFAULT NULL,
  `NgayTao` datetime DEFAULT CURRENT_TIMESTAMP,
  `TrangThai` tinyint DEFAULT '1',
  PRIMARY KEY (`MaTinTuc`) /*T![clustered_index] CLUSTERED */,
  KEY `fk_1` (`MaNhanVien`),
  CONSTRAINT `fk_1` FOREIGN KEY (`MaNhanVien`) REFERENCES `NhanVien` (`MaNhanVien`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=60002;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ViKhuyenMai`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ViKhuyenMai` (
  `MaVi` int NOT NULL AUTO_INCREMENT,
  `MaKhachHang` int NOT NULL,
  `MaKhuyenMai` int NOT NULL,
  `NgayLuu` datetime DEFAULT CURRENT_TIMESTAMP,
  `TrangThaiSuDung` tinyint DEFAULT '0' COMMENT '0: Chưa dùng, 1: Đã dùng, 2: Hết hạn',
  PRIMARY KEY (`MaVi`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `MaKhachHang` (`MaKhachHang`,`MaKhuyenMai`),
  KEY `fk_2` (`MaKhuyenMai`),
  CONSTRAINT `fk_1` FOREIGN KEY (`MaKhachHang`) REFERENCES `KhachHang` (`MaKhachHang`),
  CONSTRAINT `fk_2` FOREIGN KEY (`MaKhuyenMai`) REFERENCES `KhuyenMai` (`MaKhuyenMai`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=180001;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `XuLyDoiTra`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `XuLyDoiTra` (
  `MaXuLy` int NOT NULL AUTO_INCREMENT,
  `MaDoiTra` int DEFAULT NULL,
  `HanhDong` varchar(100) DEFAULT NULL,
  `GhiChu` varchar(255) DEFAULT NULL,
  `NgayXuLy` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`MaXuLy`) /*T![clustered_index] CLUSTERED */,
  KEY `fk_1` (`MaDoiTra`),
  CONSTRAINT `fk_1` FOREIGN KEY (`MaDoiTra`) REFERENCES `DoiTra` (`MaDoiTra`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=30002;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-18 20:40:06
