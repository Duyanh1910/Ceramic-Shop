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

DROP TABLE IF EXISTS `BaoHanh`;
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
-- Dumping data for table `BaoHanh`
--

LOCK TABLES `BaoHanh` WRITE;
INSERT INTO `BaoHanh` (`MaBaoHanh`, `MaCTDH`, `NgayBatDau`, `NgayKetThuc`, `TrangThai`, `GhiChu`) VALUES (1,1,'2026-03-01 00:00:00','2027-03-01 00:00:00',1,'Bảo hành men 1 năm'),(2,2,'2026-03-02 00:00:00','2027-03-02 00:00:00',1,'Bảo hành men 1 năm'),(3,3,'2026-03-03 00:00:00','2026-09-03 00:00:00',1,'Bảo hành sứt mẻ 6 tháng'),(4,4,'2026-03-04 00:00:00','2028-03-04 00:00:00',1,'Bảo hành 2 năm cao cấp'),(5,5,'2026-03-05 00:00:00','2027-03-05 00:00:00',1,'Bảo hành nứt vỡ do nhiệt'),(6,6,'2026-03-10 00:00:00','2027-03-10 00:00:00',1,'Bảo hành 1 năm'),(7,7,'2026-03-12 00:00:00','2027-03-12 00:00:00',1,'Bảo hành 1 năm'),(8,8,'2026-03-15 00:00:00','2026-09-15 00:00:00',1,'Bảo hành 6 tháng'),(9,9,'2026-03-16 00:00:00','2028-03-16 00:00:00',1,'Bảo hành 2 năm'),(10,10,'2026-03-17 00:00:00','2027-03-17 00:00:00',1,'Bảo hành 1 năm');
UNLOCK TABLES;

--
-- Table structure for table `BienTheSanPham`
--

DROP TABLE IF EXISTS `BienTheSanPham`;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=30002;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `BienTheSanPham`
--

LOCK TABLES `BienTheSanPham` WRITE;
INSERT INTO `BienTheSanPham` (`MaBienThe`, `MaSanPham`, `TenBienThe`, `Gia`, `SoLuong`, `TrangThai`, `MoTa`, `KhoiLuong`, `ChieuDai`, `ChieuRong`, `ChieuCao`) VALUES (1,1,'Trắng - Bộ 9 món',469800.00,50,1,'',2.50,35.00,30.00,22.00),(2,1,'Đại dương - Bộ 9 món',874800.00,30,1,'',2.50,35.00,30.00,22.00),(3,1,'Vườn nhà sương mờ - Bộ 9 món',974800.00,20,1,'',2.50,35.00,30.00,22.00),(4,1,'Trắng - Bộ 6 món',369800.00,40,1,'',1.50,30.00,25.00,18.00),(5,1,'Đại dương - Bộ 6 món',774800.00,25,1,'',1.50,30.00,25.00,18.00),(6,1,'Vườn nhà sương mờ - Bộ 6 món',874800.00,15,1,'',1.50,30.00,25.00,18.00),(7,2,'Tiệp dạ yến thảo - Bộ 9 món',659800.00,40,1,'',2.50,35.00,30.00,22.00),(8,2,'Chỉ vàng - Bộ 9 món',759800.00,30,1,'',2.50,35.00,30.00,22.00),(9,2,'Tiệp dạ yến thảo - Bộ 6 món',559800.00,35,1,'',1.50,30.00,25.00,18.00),(10,2,'Chỉ vàng - Bộ 6 món',659800.00,25,1,'',1.50,30.00,25.00,18.00),(11,3,'Cá cơm sương mờ - Bộ 9',2133000.00,35,1,'',2.50,35.00,30.00,22.00),(12,3,'Trắng - Bộ 9',589800.00,40,1,'',2.50,35.00,30.00,22.00),(15,4,'Bóng bay - Bộ 13',1799800.00,30,1,'',3.50,45.00,35.00,28.00),(16,4,'Loa kèn hồng - Bộ 13',2829800.00,25,1,'',3.50,45.00,35.00,28.00),(17,5,'Lạc Hồng - Bộ 13',3299800.00,20,1,'',3.50,45.00,35.00,28.00),(18,5,'Hồn Việt - Bộ 13',4399800.00,15,1,'',3.50,45.00,35.00,28.00),(19,6,'Trắng',45000.00,100,1,'',0.20,15.00,15.00,10.00),(20,6,'Đại dương',55000.00,80,1,'',0.20,15.00,15.00,10.00),(21,7,'Tiệp dạ yến thảo - 18cm',80000.00,30,1,'',0.30,22.00,22.00,5.00),(22,7,'Tiệp dạ yến thảo - 20cm',95000.00,25,1,'',0.40,25.00,25.00,5.00),(23,7,'Chỉ vàng - 18cm',85000.00,30,1,'',0.30,22.00,22.00,5.00),(24,7,'Chỉ vàng - 20cm',100000.00,25,1,'',0.40,25.00,25.00,5.00),(25,8,'Cá cơm sương mờ - 18cm',70000.00,40,1,'',0.50,25.00,25.00,12.00),(26,8,'Cá cơm sương mờ - 20cm',85000.00,30,1,'',0.60,25.00,25.00,12.00),(27,9,'Bóng bay - 18cm',95000.00,35,1,'',0.30,22.00,22.00,5.00),(28,9,'Loa kèn hồng - 18cm',100000.00,30,1,'',0.30,22.00,22.00,5.00),(29,10,'Lạc Hồng',60000.00,50,1,'',0.10,15.00,15.00,10.00),(30,10,'Hồn Việt',70000.00,40,1,'',0.10,15.00,15.00,10.00),(31,11,'Xanh rêu - 1L',250000.00,30,1,'',1.20,25.00,25.00,20.00),(32,11,'Xanh rêu - 2L',320000.00,25,1,'',1.80,30.00,30.00,22.00),(33,11,'Xanh rêu - 3L',390000.00,20,1,'',2.50,35.00,35.00,25.00),(34,11,'Đỏ - 1L',250000.00,30,1,'',1.20,25.00,25.00,20.00),(35,11,'Đỏ - 2L',320000.00,25,1,'',1.80,30.00,30.00,22.00),(36,11,'Đỏ - 3L',390000.00,20,1,'',2.50,35.00,35.00,25.00),(37,12,'Tiêu chuẩn',120000.00,100,1,'',0.10,28.00,8.00,4.00),(38,13,'Tiêu chuẩn',165000.00,100,1,'',0.10,28.00,8.00,4.00),(39,14,'Tiêu chuẩn',30000.00,150,1,'',0.05,28.00,8.00,4.00),(40,15,'Tiêu chuẩn',27000.00,120,1,'',0.05,28.00,8.00,4.00),(41,16,'Trắng',59400.00,100,1,'',0.05,28.00,8.00,4.00),(42,16,'Hoa đào',50000.00,80,1,'',0.05,28.00,8.00,4.00),(43,16,'Sen ngọc bích',55000.00,70,1,'',0.05,28.00,8.00,4.00),(44,17,'Hồn Việt',330000.00,90,1,'',0.05,28.00,8.00,4.00),(45,18,'Trắng - 0.8L',150000.00,20,1,'',1.20,28.00,22.00,18.00),(46,18,'Hoa đào - 0.8L',1500000.00,15,1,'',1.20,28.00,22.00,18.00),(47,18,'Sen ngọc bích - 0.8L',11550000.00,15,1,'',1.20,28.00,22.00,18.00),(48,18,'Trắng - 1.1L',2520000.00,20,1,'',1.50,32.00,26.00,20.00),(49,18,'Hoa đào - 1.1L',2580000.00,15,1,'',1.50,32.00,26.00,20.00),(50,18,'Sen ngọc bích - 1.1L',22630000.00,15,1,'',1.50,32.00,26.00,20.00),(51,19,'Lạc Hồng - 0.8L',7750000.00,10,1,'',1.50,28.00,22.00,18.00),(52,19,'Hồn Việt - 0.8L',7780000.00,10,1,'',1.50,28.00,22.00,18.00),(53,19,'Lạc Hồng - 1.1L',7820000.00,8,1,'',1.80,32.00,26.00,20.00),(54,19,'Hồn Việt - 1.1L',7850000.00,8,1,'',1.80,32.00,26.00,20.00),(55,19,'Hoàng Liên - 0.8L',17790000.00,10,1,'',1.50,28.00,22.00,18.00),(56,19,'Hoàng Liên - 1.1L',19760000.00,8,1,'',1.80,32.00,26.00,20.00),(57,20,'Đại dương - 0.8L',480000.00,20,1,'',1.20,28.00,22.00,18.00),(58,20,'Vườn nhà sương mờ - 0.8L',500000.00,18,1,'',1.20,28.00,22.00,18.00),(59,20,'Đại dương - 1.1L',550000.00,20,1,'',1.50,32.00,26.00,20.00),(60,20,'Vườn nhà sương mờ - 1.1L',580000.00,18,1,'',1.50,32.00,26.00,20.00),(61,21,'Tứ Linh',3350000.00,10,1,'',1.50,32.00,26.00,20.00),(62,22,'Đài Các - 0.8L',5820000.00,12,1,'',1.50,28.00,22.00,18.00),(63,22,'Đài Các - 1.1L',6890000.00,10,1,'',1.80,32.00,26.00,20.00),(64,23,'Tiêu chuẩn',320000.00,20,1,'',1.80,28.00,28.00,15.00),(65,24,'Tiêu chuẩn',1350000.00,18,1,'',1.80,28.00,28.00,15.00),(66,25,'Tiêu chuẩn',7520000.00,15,1,'',1.80,36.00,36.00,18.00),(67,26,'Tiêu chuẩn',5600000.00,10,1,'',1.80,28.00,28.00,15.00),(68,27,'Tiêu chuẩn',9480000.00,12,1,'',1.80,36.00,36.00,18.00),(69,28,'Tiêu chuẩn',1450000.00,20,1,'',1.50,25.00,25.00,25.00),(70,29,'Tiêu chuẩn',430000.00,18,1,'',1.50,25.00,25.00,25.00),(71,30,'Tiêu chuẩn',1480000.00,15,1,'',1.50,25.00,25.00,25.00),(72,31,'Tiêu chuẩn',2500000.00,12,1,'',1.50,25.00,25.00,25.00),(73,32,'Tiêu chuẩn',1520000.00,10,1,'',1.50,25.00,25.00,25.00),(74,33,'18cm',1480000.00,20,1,'',0.80,22.00,22.00,12.00),(75,33,'20cm',3320000.00,18,1,'',1.00,22.00,22.00,12.00),(76,34,'18cm',270000.00,20,1,'',0.80,22.00,22.00,12.00),(77,34,'20cm',310000.00,18,1,'',1.00,22.00,22.00,12.00),(78,35,'18cm',1300000.00,15,1,'',0.80,22.00,22.00,12.00),(79,35,'20cm',1340000.00,12,1,'',1.00,22.00,22.00,12.00),(80,36,'130cm',11200000.00,5,1,'',30.00,45.00,45.00,135.00),(81,36,'140cm',11800000.00,4,1,'',35.00,48.00,48.00,145.00),(82,36,'150cm',12500000.00,3,1,'',40.00,50.00,50.00,155.00),(83,37,'130cm',11300000.00,5,1,'',30.00,45.00,45.00,135.00),(84,37,'140cm',11900000.00,4,1,'',35.00,48.00,48.00,145.00),(85,37,'150cm',12600000.00,3,1,'',40.00,50.00,50.00,155.00),(86,38,'130cm',11350000.00,5,1,'',30.00,45.00,45.00,135.00),(87,38,'140cm',11950000.00,4,1,'',35.00,48.00,48.00,145.00),(88,38,'150cm',12700000.00,3,1,'',40.00,50.00,50.00,155.00),(89,39,'130cm',11400000.00,5,1,'',30.00,45.00,45.00,135.00),(90,39,'140cm',12000000.00,4,1,'',35.00,48.00,48.00,145.00),(91,39,'150cm',12800000.00,3,1,'',40.00,50.00,50.00,155.00),(92,40,'130cm',11450000.00,5,1,'',30.00,45.00,45.00,135.00),(93,40,'140cm',12100000.00,4,1,'',35.00,48.00,48.00,145.00),(94,40,'150cm',12900000.00,3,1,'',40.00,50.00,50.00,155.00),(95,41,'Tiêu chuẩn',167820000.00,10,1,'',5.00,45.00,35.00,70.00),(96,42,'Tiêu chuẩn',1480000.00,12,1,'',1.00,20.00,15.00,25.00),(97,43,'Tiêu chuẩn',520000.00,10,1,'',0.80,20.00,15.00,25.00),(98,44,'Tiêu chuẩn',11700000.00,8,1,'',3.00,0.00,0.00,0.00),(99,45,'Tiêu chuẩn',850000.00,8,1,'',2.00,0.00,0.00,0.00),(100,46,'Tiêu chuẩn',320000.00,15,1,'',1.00,20.00,15.00,25.00),(101,47,'Tiêu chuẩn',280000.00,20,1,'',0.50,20.00,15.00,25.00),(102,48,'Tiêu chuẩn',350000.00,12,1,'',1.20,20.00,15.00,25.00),(103,49,'Tiêu chuẩn',260000.00,18,1,'',1.00,20.00,15.00,25.00),(104,50,'Tiêu chuẩn',420000.00,15,1,'',2.50,30.00,30.00,46.00),(105,51,'Size 18cm',111260000.00,20,1,'',0.80,20.00,15.00,25.00),(106,51,'Size 20cm',121260000.00,15,1,'',1.00,20.00,15.00,25.00),(107,52,'Hoa sen cổ điển',420000.00,12,1,'',1.50,20.00,15.00,25.00);
UNLOCK TABLES;

--
-- Table structure for table `CauHinhHeThong`
--

DROP TABLE IF EXISTS `CauHinhHeThong`;
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
-- Dumping data for table `CauHinhHeThong`
--

LOCK TABLES `CauHinhHeThong` WRITE;
INSERT INTO `CauHinhHeThong` (`MaCauHinh`, `GiaTri`, `MoTa`) VALUES ('KG_THUE_BAN_TAI',30.00,'Mức kg thuê bán tải'),('MUC_KG_TIEU_CHUAN',3.00,'Mức kg miễn phí vượt trọng lượng'),('PHI_THUE_XE_BAN_TAI',150000.00,'Phụ phí thuê xe bán tải cho đơn Hỏa tốc quá nặng'),('PHI_VUOT_KG_HOA_TOC',10000.00,'Phí cộng thêm mỗi kg hỏa tốc (vượt 3kg)'),('PHI_VUOT_KG_LIEN_TINH',10000.00,'Phí cộng thêm mỗi kg vượt mức liên tỉnh'),('PHI_VUOT_KG_NOI_THANH',5000.00,'Phí cộng thêm mỗi kg vượt mức nội thành'),('PHI_VUOT_KG_QUOC_TE',200000.00,'Phí cộng thêm mỗi kg vượt mức quốc tế'),('PHU_PHI_BOC_XOP_1',5000.00,'Bọc xốp hàng lẻ, nhẹ (chén, bát, đĩa, đũa)'),('PHU_PHI_BOC_XOP_2',15000.00,'Bọc xốp hàng nguyên bộ vừa (ấm trà, bộ 6 món)'),('PHU_PHI_BOC_XOP_3',30000.00,'Bọc xốp bộ lớn, nhiều chi tiết (bộ 13 món, khay mứt to)'),('PHU_PHI_CONG_KENH',20000.00,'Phụ phí đóng thùng xốp/sản phẩm (Gốm 1-20kg)'),('PHU_PHI_DONG_THUNG_1',50000.00,'Đóng thùng xốp/carton 5 lớp (Chiều dài >= 40cm)'),('PHU_PHI_DONG_THUNG_2',150000.00,'Đóng kiện gỗ vừa (Chiều dài >= 60cm)'),('PHU_PHI_DONG_THUNG_3',500000.00,'Đóng kiện gỗ lớn chống sốc Lục Bình (Chiều dài >= 100cm)'),('PHU_PHI_SIEU_CONG_KENH',100000.00,'Phụ phí đóng kiện gỗ/sản phẩm (Gốm > 20kg)');
UNLOCK TABLES;

--
-- Table structure for table `ChiTietBienThe`
--

DROP TABLE IF EXISTS `ChiTietBienThe`;
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
-- Dumping data for table `ChiTietBienThe`
--

LOCK TABLES `ChiTietBienThe` WRITE;
INSERT INTO `ChiTietBienThe` (`MaBienThe`, `MaGiaTri`) VALUES (1,1),(1,4),(1,6),(1,11),(1,12),(2,2),(2,4),(2,7),(2,9),(2,12),(3,3),(3,4),(3,8),(3,10),(3,12),(4,1),(4,4),(4,6),(4,11),(4,13),(5,2),(5,4),(5,7),(5,9),(5,13),(6,3),(6,4),(6,8),(6,10),(6,13),(7,4),(7,12),(7,14),(8,4),(8,12),(8,15),(9,4),(9,13),(9,14),(10,4),(10,13),(10,15),(11,4),(11,12),(11,17),(12,1),(12,4),(12,12),(15,4),(15,18),(15,20),(16,4),(16,19),(16,20),(17,4),(17,20),(17,21),(18,4),(18,20),(18,22),(19,1),(19,4),(19,6),(19,23),(20,2),(20,4),(20,7),(20,23),(21,4),(21,14),(21,25),(21,26),(22,4),(22,14),(22,25),(22,27),(23,4),(23,15),(23,25),(23,26),(24,4),(24,15),(24,25),(24,27),(25,4),(25,17),(25,23),(25,26),(26,4),(26,17),(26,23),(26,27),(27,4),(27,18),(27,25),(27,26),(28,4),(28,19),(28,25),(28,26),(29,4),(29,21),(29,24),(30,4),(30,22),(30,24),(31,4),(31,28),(31,30),(32,4),(32,28),(32,31),(33,4),(33,28),(33,32),(34,4),(34,29),(34,30),(35,4),(35,29),(35,31),(36,4),(36,29),(36,32),(37,4),(37,11),(38,4),(38,11),(39,4),(39,6),(39,11),(40,4),(40,8),(40,9),(41,1),(41,4),(41,11),(42,4),(42,9),(42,33),(43,4),(43,9),(43,34),(44,4),(44,10),(44,22),(45,1),(45,4),(45,11),(45,35),(46,4),(46,9),(46,33),(46,35),(47,4),(47,9),(47,34),(47,35),(48,1),(48,4),(48,11),(48,36),(49,4),(49,9),(49,33),(49,36),(50,4),(50,9),(50,34),(50,36),(51,4),(51,10),(51,21),(51,35),(52,4),(52,10),(52,22),(52,35),(53,4),(53,10),(53,21),(53,36),(54,4),(54,10),(54,22),(54,36),(55,4),(55,10),(55,35),(55,37),(56,4),(56,10),(56,36),(56,37),(57,2),(57,4),(57,9),(57,35),(58,3),(58,4),(58,9),(58,35),(59,2),(59,4),(59,9),(59,36),(60,3),(60,4),(60,9),(60,36),(61,4),(61,10),(61,16),(62,4),(62,10),(62,35),(63,4),(63,10),(63,36),(64,2),(64,4),(64,9),(65,3),(65,4),(65,9),(66,4),(66,10),(66,16),(67,4),(67,10),(67,16),(68,4),(68,10),(69,5),(69,7),(69,10),(70,5),(70,6),(70,10),(71,5),(71,8),(71,10),(72,5),(72,7),(72,10),(73,5),(73,8),(73,10),(74,5),(74,7),(74,10),(74,18),(75,5),(75,7),(75,10),(75,19),(76,5),(76,6),(76,10),(76,18),(77,5),(77,6),(77,10),(77,19),(78,5),(78,8),(78,10),(78,18),(79,5),(79,8),(79,10),(79,19),(80,5),(80,7),(80,10),(80,38),(81,5),(81,7),(81,10),(81,39),(82,5),(82,7),(82,10),(82,40),(83,5),(83,7),(83,10),(83,38),(84,5),(84,7),(84,10),(84,39),(85,5),(85,7),(85,10),(85,40),(86,5),(86,7),(86,10),(86,38),(87,5),(87,7),(87,10),(87,39),(88,5),(88,7),(88,10),(88,40),(89,5),(89,7),(89,10),(89,38),(90,5),(90,7),(90,10),(90,39),(91,5),(91,7),(91,10),(91,40),(92,5),(92,7),(92,10),(92,38),(93,5),(93,7),(93,10),(93,39),(94,5),(94,7),(94,10),(94,40),(95,5),(95,7),(95,10),(96,5),(96,6),(96,10),(97,5),(97,7),(97,10),(98,5),(98,8),(98,10),(99,5),(99,7),(99,10),(100,5),(100,6),(100,11),(101,5),(101,7),(101,9),(102,5),(102,8),(102,9),(103,5),(103,6),(103,11),(104,5),(104,8),(104,10),(105,1),(105,6),(105,11),(106,1),(106,6),(106,11),(107,7),(107,10);
UNLOCK TABLES;

--
-- Table structure for table `ChiTietDonHang`
--

DROP TABLE IF EXISTS `ChiTietDonHang`;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=60002;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ChiTietDonHang`
--

LOCK TABLES `ChiTietDonHang` WRITE;
INSERT INTO `ChiTietDonHang` (`MaCTDH`, `MaDonHang`, `MaBienThe`, `SoLuong`, `GiaBan`, `ThanhTien`) VALUES (1,1,1,1,500000.00,500000.00),(2,2,4,2,600000.00,1200000.00),(3,3,19,10,80000.00,800000.00),(4,4,61,1,3500000.00,3500000.00),(5,5,31,1,450000.00,450000.00),(6,6,45,2,450000.00,900000.00),(7,7,70,1,2100000.00,2100000.00),(8,8,21,6,100000.00,600000.00),(9,9,37,10,150000.00,1500000.00),(10,10,80,1,5000000.00,5000000.00),(30002,30002,1,10,469800.00,4698000.00),(30003,30002,5,1,774800.00,774800.00);
UNLOCK TABLES;

--
-- Table structure for table `ChiTietGioHang`
--

DROP TABLE IF EXISTS `ChiTietGioHang`;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=240002;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ChiTietGioHang`
--

LOCK TABLES `ChiTietGioHang` WRITE;
INSERT INTO `ChiTietGioHang` (`MaChiTietGH`, `MaGioHang`, `MaBienThe`, `SoLuong`) VALUES (3,3,7,3),(4,4,11,1),(5,5,15,2),(6,6,19,5),(7,7,21,6),(8,8,31,1),(9,9,37,10),(10,10,41,1),(60007,1,107,12),(120002,1,105,1),(180002,30002,105,1),(210002,30002,104,1);
UNLOCK TABLES;

--
-- Table structure for table `ChiTietKhuyenMaiDonHang`
--

DROP TABLE IF EXISTS `ChiTietKhuyenMaiDonHang`;
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
-- Dumping data for table `ChiTietKhuyenMaiDonHang`
--

LOCK TABLES `ChiTietKhuyenMaiDonHang` WRITE;
INSERT INTO `ChiTietKhuyenMaiDonHang` (`MaDonHang`, `MaKhuyenMai`, `SoTienChietKhau`) VALUES (2,2,50000.00),(4,1,100000.00),(7,2,100000.00),(9,2,50000.00),(10,1,200000.00),(30002,1,100000.00);
UNLOCK TABLES;

--
-- Table structure for table `ChiTietPhieuNhap`
--

DROP TABLE IF EXISTS `ChiTietPhieuNhap`;
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
-- Dumping data for table `ChiTietPhieuNhap`
--

LOCK TABLES `ChiTietPhieuNhap` WRITE;
INSERT INTO `ChiTietPhieuNhap` (`MaChiTietPhieu`, `MaPhieuNhap`, `MaBienThe`, `SoLuong`, `GiaNhap`, `ThanhTien`) VALUES (1,1,1,100,300000.00,30000000.00),(2,1,4,50,200000.00,10000000.00),(3,2,19,200,30000.00,6000000.00),(4,2,21,100,50000.00,5000000.00),(5,3,31,50,150000.00,7500000.00),(6,3,34,50,150000.00,7500000.00),(7,4,41,200,30000.00,6000000.00),(8,4,45,100,50000.00,5000000.00),(9,5,61,20,1500000.00,30000000.00),(10,6,70,50,200000.00,10000000.00);
UNLOCK TABLES;

--
-- Table structure for table `DanhGia`
--

DROP TABLE IF EXISTS `DanhGia`;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=30002;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `DanhGia`
--

LOCK TABLES `DanhGia` WRITE;
INSERT INTO `DanhGia` (`MaDanhGia`, `MaKhachHang`, `MaCTDH`, `DiemDanhGia`, `NoiDung`, `NgayGui`, `TrangThai`) VALUES (1,1,1,5,'Bát đĩa rất đẹp, đóng gói chống sốc cực kỳ cẩn thận','2026-03-05 00:00:00',1),(2,2,2,4,'Hàng y hình nhưng chờ giao hàng hơi lâu','2026-03-06 00:00:00',1),(3,3,3,5,'Bộ ấm trà sang trọng, làm quà biếu đối tác khen nức nở','2026-03-07 00:00:00',1),(4,4,4,5,'Gốm Chu Đậu đỉnh cao, màu men lam sâu thẳm','2026-03-08 00:00:00',1),(5,5,5,4,'Nồi đun giữ nhiệt tốt, nấu cháo nhanh nhừ','2026-03-09 00:00:00',1),(6,6,6,5,'Mua thêm lần 2 vẫn ưng ý cách phục vụ của shop','2026-03-10 00:00:00',1),(7,7,7,3,'Giao chậm mất 1 ngày so với dự kiến','2026-03-11 00:00:00',1),(8,8,8,5,'Lục bình đẹp, nét vẽ tinh xảo','2026-03-12 00:00:00',1),(9,9,9,5,'Giá hợp lý, chất lượng Minh Long không phải bàn','2026-03-13 00:00:00',1),(10,10,10,4,'Đẹp nhưng khâu đóng gói nhìn hơi lộn xộn','2026-03-14 00:00:00',1);
UNLOCK TABLES;

--
-- Table structure for table `DanhMucSanPham`
--

DROP TABLE IF EXISTS `DanhMucSanPham`;
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
-- Dumping data for table `DanhMucSanPham`
--

LOCK TABLES `DanhMucSanPham` WRITE;
INSERT INTO `DanhMucSanPham` (`MaDanhMuc`, `TenDanhMuc`, `MoTa`, `ParentID`) VALUES (1,'Đồ phòng bếp','Các sản phẩm gốm sứ dùng cho nhà bếp và bàn ăn',NULL),(2,'Đồ phòng khách','Gốm sứ tiếp khách và trưng bày',NULL),(3,'Đồ thờ','Vật phẩm thờ cúng tâm linh',NULL),(4,'Đồ phong thủy','Vật phẩm phong thủy tài lộc',NULL),(5,'Đồ trang trí','Các sản phẩm trang trí nội thất',NULL),(6,'Bộ đồ ăn','Bát đĩa tô chén trọn bộ',1),(7,'Bát / Chén / Đĩa lẻ','Các loại bát chén đĩa bán lẻ',1),(8,'Nồi sứ / Chảo sứ','Nồi chảo ấm bằng sứ chịu nhiệt',1),(9,'Muỗng sứ / Đũa sứ','Muỗng và đũa bằng sứ chịu nhiệt',1),(10,'Bộ ấm trà','Bộ ấm chén tiếp khách',2),(11,'Khay mứt','Khay mứt tiếp khách',2),(12,'Bát hương','Bát hương thờ cúng',3),(13,'Mâm bồng','Mâm bồng thờ',3),(14,'Lục bình','Cặp lục bình phong thủy',4),(15,'Tượng phong thủy','Tượng phong thủy',4),(16,'Tượng gốm','Tượng gốm trang trí',5),(17,'Bình hoa','Bình hoa trang trí',5);
UNLOCK TABLES;

--
-- Table structure for table `DoiTra`
--

DROP TABLE IF EXISTS `DoiTra`;
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
-- Dumping data for table `DoiTra`
--

LOCK TABLES `DoiTra` WRITE;
INSERT INTO `DoiTra` (`MaDoiTra`, `MaCTDH`, `SoLuongDoiTra`, `LyDo`, `TrangThai`, `NgayYeuCau`) VALUES (1,1,1,'Hàng thực tế màu nhạt hơn so với hình trên web',1,'2026-03-05 00:00:00'),(2,2,1,'Móp méo vỏ hộp và sứt mẻ góc bát do vận chuyển',1,'2026-03-06 00:00:00'),(3,3,2,'Giao sai họa tiết (Đặt hoa đào giao hoa sen)',0,'2026-03-10 00:00:00'),(4,4,1,'Kiểm tra hàng thấy có một vết nứt nhỏ dọc thân',0,'2026-03-12 00:00:00'),(5,5,1,'Khách đổi ý muốn mua nồi dung tích to hơn (đổi từ 1L lên 2L)',1,'2026-03-15 00:00:00'),(6,6,1,'Bát bị mẻ nhẹ phần viền',1,'2026-03-12 00:00:00'),(7,7,1,'Men sứ có dấu hiệu bị lỗi chân kim',0,'2026-03-13 00:00:00'),(8,8,1,'Thiếu đĩa lót của bộ ấm chén',1,'2026-03-16 00:00:00'),(9,9,1,'Hộp quà tặng bị rách nát không thể đem biếu',0,'2026-03-17 00:00:00'),(10,10,1,'Tượng gốm bị gãy một chi tiết nhỏ',0,'2026-03-18 00:00:00');
UNLOCK TABLES;

--
-- Table structure for table `DonHang`
--

DROP TABLE IF EXISTS `DonHang`;
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
  PRIMARY KEY (`MaDonHang`) /*T![clustered_index] CLUSTERED */,
  KEY `fk_1` (`MaKhachHang`),
  KEY `fk_2` (`MaPhuongThuc`),
  KEY `idx_order_customer` (`MaKhachHang`),
  KEY `idx_order_status` (`TrangThaiDonHang`),
  KEY `idx_order_date` (`NgayDat`),
  UNIQUE KEY `idx_ma_hien_thi` (`MaHienThi`),
  CONSTRAINT `fk_1` FOREIGN KEY (`MaKhachHang`) REFERENCES `KhachHang` (`MaKhachHang`),
  CONSTRAINT `fk_2` FOREIGN KEY (`MaPhuongThuc`) REFERENCES `PhuongThucThanhToan` (`MaPhuongThuc`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=60002;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `DonHang`
--

LOCK TABLES `DonHang` WRITE;
INSERT INTO `DonHang` (`MaDonHang`, `MaKhachHang`, `NgayDat`, `TongTienHang`, `TongPhiVanChuyen`, `TongGiamGia`, `TongThanhToan`, `DiaChiGiaoHang`, `TenNguoiNhan`, `SDT`, `TrangThaiDonHang`, `TrangThaiThanhToan`, `MaPhuongThuc`, `GhiChu`, `MaHienThi`) VALUES (1,1,'2026-03-01 00:00:00',500000.00,30000.00,0.00,530000.00,'789 Ngõ Đất Nung, Đà Nẵng','Lê Khách Mua','0987654321',3,1,1,NULL,NULL),(2,2,'2026-03-02 00:00:00',1200000.00,30000.00,50000.00,1180000.00,'12 Lê Lợi, TP.HCM','Nguyễn Văn An','0987654002',3,1,2,NULL,NULL),(3,3,'2026-03-03 00:00:00',800000.00,50000.00,0.00,850000.00,'34 Quang Trung, Hà Nội','Trần Thị Bình','0987654003',2,1,3,NULL,NULL),(4,4,'2026-03-04 00:00:00',3500000.00,70000.00,100000.00,3470000.00,'56 Nguyễn Văn Linh, Đà Nẵng','Lê Văn Cường','0987654004',2,1,4,NULL,NULL),(5,5,'2026-03-05 00:00:00',450000.00,30000.00,0.00,480000.00,'78 Trần Hưng Đạo, Cần Thơ','Phạm Thị Dung','0987654005',1,1,1,NULL,NULL),(6,6,'2026-03-10 00:00:00',900000.00,40000.00,0.00,940000.00,'90 Hai Bà Trưng, TP.HCM','Hoàng Văn Em','0987654006',1,0,1,NULL,NULL),(7,7,'2026-03-12 00:00:00',2100000.00,50000.00,100000.00,2050000.00,'11 Đống Đa, Hà Nội','Vũ Thị Giang','0987654007',0,0,2,NULL,NULL),(8,8,'2026-03-15 00:00:00',600000.00,30000.00,0.00,630000.00,'22 Ngô Quyền, Hải Phòng','Đặng Văn Hải','0987654008',0,0,3,NULL,NULL),(9,9,'2026-03-16 00:00:00',1500000.00,60000.00,50000.00,1510000.00,'33 Tôn Đức Thắng, TP.HCM','Bùi Thị Hạnh','0987654009',0,0,4,NULL,NULL),(10,10,'2026-03-17 00:00:00',5000000.00,200000.00,200000.00,5000000.00,'44 Kim Mã, Hà Nội','Đỗ Văn Hùng','0987654010',4,0,2,NULL,NULL),(30002,2,'2026-03-29 09:35:22',5472800.00,628975.00,100000.00,6001775.00,'123 Đường Số 1, Phường An Phú, Quận 2, TP.HCM','Phùng Thanh Độ','0987654321',4,0,1,'Giao hàng trong giờ hành chính giúp mình nhé. | Khách tự hủy: Mình đổi ý muốn mua màu khác nên hủy đặt lại.','DH260329XWS9');
UNLOCK TABLES;

--
-- Table structure for table `GiaTriThuocTinh`
--

DROP TABLE IF EXISTS `GiaTriThuocTinh`;
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
-- Dumping data for table `GiaTriThuocTinh`
--

LOCK TABLES `GiaTriThuocTinh` WRITE;
INSERT INTO `GiaTriThuocTinh` (`MaGiaTri`, `MaThuocTinh`, `GiaTri`) VALUES (1,2,'Trắng'),(2,2,'Đại dương'),(3,2,'Vườn nhà sương mờ'),(4,3,'Sứ chất lượng cao'),(5,3,'Gốm chất lượng cao'),(6,4,'Trơn'),(7,4,'Vẽ tay'),(8,4,'In decal'),(9,5,'Hiện đại'),(10,5,'Cổ điển'),(11,5,'Tối giản'),(12,1,'Bộ 9 món'),(13,1,'Bộ 6 món'),(14,2,'Tiệp dạ yến thảo'),(15,2,'Chỉ vàng'),(16,2,'Tứ linh'),(17,2,'Cá cơm sương mờ'),(18,2,'Bóng bay'),(19,2,'Loa kèn hồng'),(20,1,'Bộ 13 món'),(21,2,'Lạc Hồng'),(22,2,'Hồn Việt'),(23,6,'Bát cơm'),(24,6,'Chén nước chấm'),(25,6,'Đĩa tròn'),(26,1,'18cm'),(27,1,'20cm'),(28,2,'Xanh rêu'),(29,2,'Đỏ'),(30,1,'1L'),(31,1,'2L'),(32,1,'3L'),(33,2,'Hoa đào'),(34,2,'Sen ngọc bích'),(35,1,'0.8L'),(36,1,'1.1L'),(37,2,'Hoàng Liên'),(38,1,'130cm'),(39,1,'140cm'),(40,1,'150cm');
UNLOCK TABLES;

--
-- Table structure for table `GioHang`
--

DROP TABLE IF EXISTS `GioHang`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `GioHang` (
  `MaGioHang` int NOT NULL AUTO_INCREMENT,
  `MaKhachHang` int NOT NULL,
  PRIMARY KEY (`MaGioHang`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `MaKhachHang` (`MaKhachHang`),
  KEY `idx_cart_customer` (`MaKhachHang`),
  CONSTRAINT `fk_1` FOREIGN KEY (`MaKhachHang`) REFERENCES `KhachHang` (`MaKhachHang`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=60002;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `GioHang`
--

LOCK TABLES `GioHang` WRITE;
INSERT INTO `GioHang` (`MaGioHang`, `MaKhachHang`) VALUES (1,1),(2,2),(3,3),(4,4),(5,5),(6,6),(7,7),(8,8),(9,9),(10,10),(30002,120001);
UNLOCK TABLES;

--
-- Table structure for table `HinhAnhBienThe`
--

DROP TABLE IF EXISTS `HinhAnhBienThe`;
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
-- Dumping data for table `HinhAnhBienThe`
--

LOCK TABLES `HinhAnhBienThe` WRITE;
INSERT INTO `HinhAnhBienThe` (`MaHinhAnh`, `MaBienThe`, `DuongDan`) VALUES (1,1,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773735977/timeless_trang_1_lqd3ba.png'),(2,1,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773735977/timeless_trang_2_udvmkr.jpg'),(3,1,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773735976/timeless_trang_3_b59but.webp'),(4,2,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773735977/timeless_daiduong_1_ve6aqp.webp'),(5,2,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773735978/timeless_daiduong_2_y4cqvl.png'),(6,2,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773735978/timeless_daiduong_3_qsgrms.webp'),(7,3,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773735976/timeless_vuonnha_1_bpxpu2.webp'),(8,3,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773735977/timeless_vuonnha_2_y8hty4.webp'),(9,3,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773735977/timeless_vuonnha_3_o3ac6i.webp'),(10,4,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773735977/timeless_trang_1_lqd3ba.png'),(11,4,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773735977/timeless_trang_2_udvmkr.jpg'),(12,4,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773735976/timeless_trang_3_b59but.webp'),(13,5,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773735977/timeless_daiduong_1_ve6aqp.webp'),(14,5,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773735978/timeless_daiduong_2_y4cqvl.png'),(15,5,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773735978/timeless_daiduong_3_qsgrms.webp'),(16,6,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773735976/timeless_vuonnha_1_bpxpu2.webp'),(17,6,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773735977/timeless_vuonnha_2_y8hty4.webp'),(18,6,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773735977/timeless_vuonnha_3_o3ac6i.webp'),(19,7,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773740415/tiepda_2_zqtbpa.webp'),(20,8,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773740412/chivang_1_gssuqv.webp'),(21,8,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773740412/chivang_2_nzw8qw.jpg'),(22,9,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773740415/tiepda_2_zqtbpa.webp'),(23,10,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773740412/chivang_1_gssuqv.webp'),(24,10,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773740412/chivang_2_nzw8qw.jpg'),(25,11,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773741518/bo-do-an-10-san-pham-jasmine-ca-com-suong-mo_hjk5h1.webp'),(26,11,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773741520/10jas519bg_baquku.png'),(27,11,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773741518/10jas519nen_cheppy.png'),(28,12,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773741521/470928000-bg02_sqdvbv.png'),(29,12,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773741520/470928000-bg_mfgjws.png'),(30,15,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773742529/bo-do-an-9-san-pham-daisy-bong-bay_xr8kyc.webp'),(31,15,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773742528/bo-do-an-9-san-pham-daisy-bong-bay-a001-09312-2_d6karu.webp'),(32,15,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773742526/thanh-phan-bb-03-03_hrqf5n.jpg'),(33,16,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773742525/0_m4fnu8.webp'),(34,16,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773742531/1_husm8b.webp'),(35,16,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773742532/2_lq1wjw.webp'),(36,17,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773743992/bo-do-an-30-san-pham-hoang-cung-lac-hong-30208-00_e5vorj.webp'),(37,17,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773743994/bo-do-an-30-san-pham-hoang-cung-lac-hong-30208-1_swu3ta.webp'),(38,17,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773743996/bo-do-an-30-san-pham-hoang-cung-lac-hong-30208-2_pmwx7v.webp'),(39,18,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773743999/bo-do-an-30-san-pham-hoang-cung-hon-viet-30038-00_kke6i9.png'),(40,18,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773743989/bo-do-an-30-san-pham-hoang-cung-hon-viet-30038-1_sisnfw.webp'),(41,18,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773743989/bo-do-an-30-san-pham-hoang-cung-hon-viet-30038-2_liorqq.webp'),(42,19,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773752428/chen-com-kl-timeless-trang-gom-su-minh-long-a001-591166000-0_xfa37j.webp'),(43,19,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773752430/chen-com-kl-timeless-trang-gom-su-minh-long-a001-591166000-2_kz0nwn.webp'),(44,19,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773752433/chen-com-kl-timeless-trang-gom-su-minh-long-a001-591166000-1_fseapa.jpg'),(45,20,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773752780/006154e0-e756-4d84-a9fc-065707565d05-96d49aac-7f78-4372-ae58-0a37e4373a73_qmvy8w.png'),(46,21,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773753279/11390-png_lyd4sq.png'),(47,22,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773753279/11390-png_lyd4sq.png'),(48,23,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773753280/041813014-e7c232fe903a458f93e78bfa4be3a244-grande-d4808e03-9d85-46fc-abae-d54dfe48f376_uydhbu.png'),(49,24,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773753280/041813014-e7c232fe903a458f93e78bfa4be3a244-grande-d4808e03-9d85-46fc-abae-d54dfe48f376_uydhbu.png'),(50,25,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773753748/ca-com-xuon-mo_gbyuvw.png'),(51,26,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773753750/ca-com-xuon-mo-02_xrxkmz.webp'),(52,26,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773753753/ca-com-xuon-m03_xdovty.webp'),(53,27,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773754137/dia-tron-ao-28-cm-daisy-bong-bay-042821312-sm-01-93a4d2e97c9b45e2b4058ec0156c2084-grande-708256cf-fd68-4282-909f-a33bc05897ac_kgbcem.png'),(54,28,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773754139/avatar_dda58839be5348029a0752b1bf62a0fe_gkrpcr.png'),(55,29,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773754536/chen-cham-9-cm-camellia-lac-hong_040976208-1-sm_5725bdb043d243c79330e79518c1339c_gujrc3.png'),(56,30,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773754534/avatar__6__34a6f2e2653f4a8fafbb347069ac0a8a_qwn9qo.png'),(57,34,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773755380/Noi-duong-sinh-Vesta-3.0L-nap-Healthycook-Hong-Anh-Kim1_mmyagw.png'),(58,34,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773755384/Noi-duong-sinh-Vesta-3.0L-nap-Healthycook-Hong-Anh-Kim2_fsv5i1.png'),(59,34,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773755755/661028464-5-sm-59257d336c3647648efce171d73da346-grande_estsrf.webp'),(60,37,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773756333/5cb2-8d05e38ba55f4517890c19b5ab13007b-e8822221fd3b49dc94eadac67f6703db-fe52fdbad9964f8ca6124a1a91516529-grande-47424398-546d-47c7-82b0-993882f55bf5_ygygqx.png'),(61,37,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773756322/73fe-a53c7922bbc74d1f9103287294223fba-de73c3eb31354cdfbef906c228bc68e3-24c767294b3643588fb113c4f494ab08-grande-b263b424-4b04-48e3-9a05-4016cf5341c2_t9nkdh.png'),(62,38,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773756579/dua-su-duong-sinh-24-4-cm-2doihq-duong-sinh-ifp-mau-do-pastel-a001-212478dop02q-2_qunif8.webp'),(63,38,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773756583/dua-su-duong-sinh-24-4-cm-2doihq-duong-sinh-ifp-mau-do-pastel-a001-212478dop02q-1_d3kmrb.webp'),(64,39,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773756925/image-removebg-preview-1_rw2xqi.png'),(65,40,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773787161/gac_dua_ca_hjmqyf.png'),(66,41,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773787787/f4cd4c8d12fecea097ef_b59ee5c8c3db4aab8a1943e47eda8b67_66a0b61d72344c14b7f2ad880614f1ad_hnjjlx.png'),(67,42,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773787787/avatar__10__a23e5bfb2aa54db2a224e207812c7897_tjldou.png'),(68,43,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773787787/avatar_868d6b3aac604d27bb216a378ca67873_ffh5jn.png'),(69,44,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773788271/muong-hoang-cung-kim-ngoc-a001-140429488_jzjjdy.webp'),(70,44,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773788272/muong-hoang-cung-kim-ngoc-a001-140429488-2_lxcgkk.jpg'),(71,44,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773788273/muong-hoang-cung-kim-ngoc-a001-140429488-1_ayerd0.jpg'),(72,45,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773789802/45421211212121_g7iefo.webp'),(73,45,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773789802/454122_difkl4.webp'),(74,46,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773789803/untitled-1-b965f520-f51b-4b45-abb6-a9f8682467a6_epolzp.webp'),(75,47,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773789800/sn_0.8l_cae74893e7b646dc97a116b7f44429b8_kstqax.png'),(76,48,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773789802/454122_difkl4.webp'),(77,49,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773789803/gemini-generated-image-kuo8jakuo8jakuo8_zmur2c.webp'),(78,49,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773789799/04-01803848003-camellia-min-4183753512374967a74e5c63eb9e84df-grande_kv7osv.webp'),(79,50,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773789800/sn3_422dbf7d19ac4100896823e8a48e8843_zxwvm2.png'),(80,51,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773798498/untitled-1-59db384d-4faf-4f9c-9496-d77c82c4cf2a_yqtqr6.webp'),(81,52,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773798497/untitled-1-8b83c5e4-64a2-4375-bd69-36775c7d545a_rqrdzy.webp'),(82,53,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773798497/untitled-1-47c6afc9-b2d4-41a4-b8bf-27f5b77e31dd_tubbdx.webp'),(83,54,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773798496/222-c06e27a4-16ec-4688-a92a-750662570c0f_cto7ji.webp'),(84,55,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773798497/00-a05b9b75-aade-4e62-9b50-70167aab967d_a1crjk.webp'),(85,56,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773798497/untitled-1-1e4474bf-aee4-4175-af0c-2d16491ac4fd_veahwq.webp'),(86,57,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773799162/daiduong2_wn1bmx.webp'),(87,58,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773799161/suongmo1_l6pe0x.webp'),(88,59,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773799162/daiduong2_wn1bmx.webp'),(89,60,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773799162/suongmo2_pvy0q9.webp'),(90,61,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773799426/55656_dowbx2.webp'),(91,61,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773799427/tulinh_z8eovd.webp'),(92,62,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773799895/daicac2_sivoaw.webp'),(93,62,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773799893/daicac3_ggpn9e.webp'),(94,63,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773799899/daicac4_bzeqeu.webp'),(95,64,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773800244/3-04a55a02-b8b9-45d2-bf30-0fba94bc3339_vcjp2r.webp'),(96,64,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773800243/2-dff4e376-d7ab-4462-a965-0c7f269551b9_g5tchw.webp'),(97,65,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773800476/1-08529619-6869-4b80-8331-89256a2ec9ea_dkv0vc.png'),(98,65,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773800473/2-0f1307b8-78c4-4dbd-a1d5-964ab79e39e8_pa1tql.png'),(99,66,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773800738/hc3_ufoldz.webp'),(100,66,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773800739/hc2_r9lbps.png'),(101,67,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773800922/c371e4ef-bc7f-49fa-9a8b-f8750bbd3d03_qej65r.webp'),(102,67,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773800924/gemini-generated-image-hyr3i6hyr3i6hyr3_zwi3vx.png'),(103,68,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773801104/dc2_wmlhvt.png'),(104,68,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773801106/dc3_sn7onq.png'),(105,69,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773801851/RD060723-2-removebg-preview_vnbzkb.png'),(106,69,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773801851/250500-17_o6m68x.jpg'),(107,70,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773802048/bat-huong-vuot-tay-ve-sen-bat-trang-14-removebg-preview_m665rp.png'),(108,70,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773802049/bat-huong-vuot-tay-ve-sen-bat-trang-13_fy1gxf.jpg'),(109,71,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773804534/16_oclfhw.png'),(110,71,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773804533/4_tmej86.png'),(111,72,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773804774/hi_w1zoxk.png'),(112,73,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773805039/1h_wtadu2.png'),(113,73,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773805038/bat-huong-bat-trang-mau-xanh-5_jna3zc.jpg'),(114,74,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773805677/1_pnrsfd.png'),(115,75,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773805677/mam-bong-su-bat-trang-ve-vang-4-7_wsaiu7.jpg'),(116,76,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773817113/th_d3fk3p.png'),(117,77,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773817112/bat-huong-mau-xanh-ngoc-luc-bao-NNND-tran-do-5_ysg9tk.jpg'),(118,78,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773817113/th_d3fk3p.png'),(119,79,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773817509/th2_mhxlqp.webp'),(120,80,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773818260/thum-removebg-preview_f0xndm.png'),(121,81,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773818263/lo-loc-binh-bat-trang-men-lam-tu-quy-ve-ky-1m4_3__05042024083734_dp4oak.jpg'),(122,82,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773818263/lo-loc-binh-bat-trang-men-lam-tu-quy-ve-ky-1m4_3__05042024083734_dp4oak.jpg'),(123,83,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773818673/thum1-removebg-preview_gqxsgp.png'),(124,84,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773818677/tung_b6ptoj.jpg'),(125,85,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773818675/tum_tts1va.jpg'),(126,86,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773819006/thumm-removebg-preview_tz1uck.png'),(127,87,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773819011/1_w7ppen.jpg'),(128,88,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773819012/2_tzxlcb.jpg'),(129,89,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773819294/tmh-removebg-preview_lsobgf.png'),(130,90,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773819299/2_szhl4s.jpg'),(131,91,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773819302/1_lmpqm2.jpg'),(132,92,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773819660/tmhhh-removebg-preview_xue0e4.png'),(133,93,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773819658/lo-loc-binh-bat-trang-men-lam-vinh-quy-bai-to-ve-ky-1m6-2_21112020070906_tjva15.jpg'),(134,94,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773819656/lo-loc-binh-bat-trang-men-lam-vinh-quy-bai-to-ve-ky-1m6-1_21112020070906_q9zrqh.jpg'),(135,95,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773820304/0003200403_277520591fa24bd4bbeec9bb01ac06cd_afla1d.jpg'),(136,96,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773820414/tmhun_ympmgn.png'),(137,97,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773820584/ran1_vgqqxu.png'),(138,97,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773820587/ran3_zahiez.png'),(139,98,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773820771/th11_iuziq8.png'),(140,98,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773820778/bao-ma-10-5-background_miqhyg.png'),(141,98,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773820775/7fe580d7-e65f-43d5-8224-b59fba93e5f6_ppeiyd.png'),(142,99,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773821091/tai-xuong-90-edd3af80-c18a-4cdf-a915-cd018685d692_fatup3.png'),(143,99,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773821094/tmmtt_iugrg7.png'),(144,99,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773821089/rong-white-b3a1698c-6087-4b10-ac1e-c285fa61c369_jgnxou.png'),(145,100,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773821674/thutm-removebg-preview_puu3ht.png'),(146,100,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773821669/sg-11134201-81zuq-mivqnglnhd6r59_zwemyy.webp'),(147,100,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773821666/sg-11134201-81zti-mivqngl6mi9t88_khl9et.webp'),(148,101,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773821872/mtmtm_vvk8i5.jpg'),(149,102,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773822145/voi_tht_izauqu.webp'),(150,102,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773822149/vn-11134201-7ras8-mbvj2cg2r14i5e_resize_w900_nl_bxavp5.webp'),(151,102,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773822141/vn-11134201-7ras8-mbvj2bwni3md42_resize_w900_nl_s26ann.webp'),(152,103,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773822733/ga_kiv27f.png'),(153,104,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773823016/mtmt_ayvor6.webp'),(154,104,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773823016/gemini-generated-image-j8mf14j8mf14j8mf-copy_esqit4.webp'),(155,104,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773823016/gemini-generated-image-xoqexaxoqexaxoqe-copy_f5lcpq.webp'),(156,105,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773823151/gemini-generated-image-o36hnuo36hnuo36h-copy_rnjcih.webp'),(157,106,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773823150/gemini-generated-image-rghgu1rghgu1rghg-copy_f8antj.webp'),(158,107,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773823508/df2a9909-ae76-4afc-aefb-234a24770e1f_vellon.webp'),(159,107,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773823508/14f53a9f-2cd4-4881-9045-e96ccafe5bf0_tzc5zy.webp');
UNLOCK TABLES;

--
-- Table structure for table `KhachHang`
--

DROP TABLE IF EXISTS `KhachHang`;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=180001;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `KhachHang`
--

LOCK TABLES `KhachHang` WRITE;
INSERT INTO `KhachHang` (`MaKhachHang`, `MaTaiKhoan`, `TenKhachHang`, `SDT`, `DiaChi`, `Avatar`) VALUES (1,4,'Trần Dài Japan','0987654321','789 Ngõ Đất Nung, Đà Nẵng','https://res.cloudinary.com/dcmwz0uis/image/upload/v1774453921/Screenshot_2026-03-20_093855_psewfv.png'),(2,5,'Nguyễn Văn An','0987654002','12 Lê Lợi, TP.HCM','https://res.cloudinary.com/dcmwz0uis/image/upload/v1773839961/Sample_User_Icon_v7pq94.png'),(3,6,'Trần Thị Bình','0987654003','34 Quang Trung, Hà Nội','https://res.cloudinary.com/dcmwz0uis/image/upload/v1773839961/Sample_User_Icon_v7pq94.png'),(4,7,'Lê Văn Cường','0987654004','56 Nguyễn Văn Linh, Đà Nẵng','https://res.cloudinary.com/dcmwz0uis/image/upload/v1773839961/Sample_User_Icon_v7pq94.png'),(5,8,'Phạm Thị Dung','0987654005','78 Trần Hưng Đạo, Cần Thơ','https://res.cloudinary.com/dcmwz0uis/image/upload/v1773839961/Sample_User_Icon_v7pq94.png'),(6,9,'Hoàng Văn Em','0987654006','90 Hai Bà Trưng, TP.HCM','https://res.cloudinary.com/dcmwz0uis/image/upload/v1773839961/Sample_User_Icon_v7pq94.png'),(7,10,'Vũ Thị Giang','0987654007','11 Đống Đa, Hà Nội','https://res.cloudinary.com/dcmwz0uis/image/upload/v1773839961/Sample_User_Icon_v7pq94.png'),(8,11,'Đặng Văn Hải','0987654008','22 Ngô Quyền, Hải Phòng','https://res.cloudinary.com/dcmwz0uis/image/upload/v1773839961/Sample_User_Icon_v7pq94.png'),(9,12,'Bùi Thị Hạnh','0987654009','33 Tôn Đức Thắng, TP.HCM','https://res.cloudinary.com/dcmwz0uis/image/upload/v1773839961/Sample_User_Icon_v7pq94.png'),(10,13,'Đỗ Văn Hùng','0987654010','44 Kim Mã, Hà Nội','https://res.cloudinary.com/dcmwz0uis/image/upload/v1773839961/Sample_User_Icon_v7pq94.png'),(11,14,'Hồ Thị Kiều','0987654011','55 Cầu Giấy, Hà Nội','https://res.cloudinary.com/dcmwz0uis/image/upload/v1773839961/Sample_User_Icon_v7pq94.png'),(12,15,'Ngô Văn Lâm','0987654012','66 Lê Duẩn, Đà Nẵng','https://res.cloudinary.com/dcmwz0uis/image/upload/v1773839961/Sample_User_Icon_v7pq94.png'),(13,16,'Dương Thị Mai','0987654013','77 Nguyễn Thái Học, TP.HCM','https://res.cloudinary.com/dcmwz0uis/image/upload/v1773839961/Sample_User_Icon_v7pq94.png'),(14,17,'Lý Văn Nam','0987654014','88 Phạm Văn Đồng, Hà Nội','https://res.cloudinary.com/dcmwz0uis/image/upload/v1773839961/Sample_User_Icon_v7pq94.png'),(15,18,'Đào Thị Oanh','0987654015','99 Hoàng Sa, Đà Nẵng','https://res.cloudinary.com/dcmwz0uis/image/upload/v1773839961/Sample_User_Icon_v7pq94.png'),(16,19,'Đoàn Văn Phong','0987654016','101 Võ Văn Kiệt, TP.HCM','https://res.cloudinary.com/dcmwz0uis/image/upload/v1773839961/Sample_User_Icon_v7pq94.png'),(17,20,'Trịnh Thị Quỳnh','0987654017','202 Giải Phóng, Hà Nội','https://res.cloudinary.com/dcmwz0uis/image/upload/v1773839961/Sample_User_Icon_v7pq94.png'),(18,21,'Nguyễn Văn Quân','0987654018','303 Hùng Vương, Cần Thơ','https://res.cloudinary.com/dcmwz0uis/image/upload/v1773839961/Sample_User_Icon_v7pq94.png'),(19,22,'Trần Thị Rạng','0987654019','404 Lạch Tray, Hải Phòng','https://res.cloudinary.com/dcmwz0uis/image/upload/v1773839961/Sample_User_Icon_v7pq94.png'),(20,23,'Lê Văn Sơn','0987654020','505 Nguyễn Trãi, TP.HCM','https://res.cloudinary.com/dcmwz0uis/image/upload/v1773839961/Sample_User_Icon_v7pq94.png'),(21,24,'Phạm Thị Thảo','0987654021','606 Trường Chinh, Hà Nội','https://res.cloudinary.com/dcmwz0uis/image/upload/v1773839961/Sample_User_Icon_v7pq94.png'),(22,25,'Hoàng Văn Tuấn','0987654022','707 Bà Triệu, Hà Nội','https://res.cloudinary.com/dcmwz0uis/image/upload/v1773839961/Sample_User_Icon_v7pq94.png'),(23,26,'Vũ Thị Uyên','0987654023','808 Điện Biên Phủ, Bình Thạnh','https://res.cloudinary.com/dcmwz0uis/image/upload/v1773839961/Sample_User_Icon_v7pq94.png'),(24,27,'Đặng Văn Việt','0987654024','909 Phạm Ngọc Thạch, Quận 3','https://res.cloudinary.com/dcmwz0uis/image/upload/v1773839961/Sample_User_Icon_v7pq94.png'),(25,28,'Bùi Thị Xoan','0987654025','111 Nguyễn Đình Chiểu, Quận 1','https://res.cloudinary.com/dcmwz0uis/image/upload/v1773839961/Sample_User_Icon_v7pq94.png'),(26,29,'Đỗ Văn Y','0987654026','222 Trần Phú, Nha Trang','https://res.cloudinary.com/dcmwz0uis/image/upload/v1773839961/Sample_User_Icon_v7pq94.png'),(27,30,'Hồ Thị Anh','0987654027','333 Nguyễn Tất Thành, Vũng Tàu','https://res.cloudinary.com/dcmwz0uis/image/upload/v1773839961/Sample_User_Icon_v7pq94.png'),(28,31,'Ngô Văn Bảo','0987654028','444 Hùng Vương, Huế','https://res.cloudinary.com/dcmwz0uis/image/upload/v1773839961/Sample_User_Icon_v7pq94.png'),(29,32,'Dương Thị Cẩm','0987654029','555 Lê Lợi, Thanh Hóa','https://res.cloudinary.com/dcmwz0uis/image/upload/v1773839961/Sample_User_Icon_v7pq94.png'),(30,33,'Lý Văn Đạt','0987654030','666 Hai Bà Trưng, Nam Định','https://res.cloudinary.com/dcmwz0uis/image/upload/v1773839961/Sample_User_Icon_v7pq94.png'),(31,34,'Đào Thị Giao','0987654031','777 Trần Hưng Đạo, Ninh Bình','https://res.cloudinary.com/dcmwz0uis/image/upload/v1773839961/Sample_User_Icon_v7pq94.png'),(32,35,'Đoàn Văn Hòa','0987654032','888 Quang Trung, Gò Vấp','https://res.cloudinary.com/dcmwz0uis/image/upload/v1773839961/Sample_User_Icon_v7pq94.png'),(33,36,'Trịnh Thị Hằng','0987654033','999 Xa Lộ Hà Nội, Thủ Đức','https://res.cloudinary.com/dcmwz0uis/image/upload/v1773839961/Sample_User_Icon_v7pq94.png'),(34,37,'Nguyễn Văn Khanh','0987654034','123 Mai Chí Thọ, Quận 2','https://res.cloudinary.com/dcmwz0uis/image/upload/v1773839961/Sample_User_Icon_v7pq94.png'),(35,38,'Trần Thị Lan','0987654035','234 Nguyễn Văn Cừ, Quận 5','https://res.cloudinary.com/dcmwz0uis/image/upload/v1773839961/Sample_User_Icon_v7pq94.png'),(36,39,'Lê Văn Minh','0987654036','345 Hậu Giang, Quận 6','https://res.cloudinary.com/dcmwz0uis/image/upload/v1773839961/Sample_User_Icon_v7pq94.png'),(37,40,'Phạm Thị Nga','0987654037','456 Lê Trọng Tấn, Tân Phú','https://res.cloudinary.com/dcmwz0uis/image/upload/v1773839961/Sample_User_Icon_v7pq94.png'),(38,41,'Hoàng Văn Phú','0987654038','567 Lũy Bán Bích, Tân Phú','https://res.cloudinary.com/dcmwz0uis/image/upload/v1773839961/Sample_User_Icon_v7pq94.png'),(39,42,'Vũ Thị Quyên','0987654039','678 Âu Cơ, Tân Bình','https://res.cloudinary.com/dcmwz0uis/image/upload/v1773839961/Sample_User_Icon_v7pq94.png'),(40,43,'Đặng Văn Sang','0987654040','789 Cộng Hòa, Tân Bình','https://res.cloudinary.com/dcmwz0uis/image/upload/v1773839961/Sample_User_Icon_v7pq94.png'),(41,44,'Bùi Thị Tâm','0987654041','890 Phan Đăng Lưu, Phú Nhuận','https://res.cloudinary.com/dcmwz0uis/image/upload/v1773839961/Sample_User_Icon_v7pq94.png'),(30001,30001,'duyanh','0329835725','120 yen lang','https://res.cloudinary.com/dcmwz0uis/image/upload/v1773839961/Sample_User_Icon_v7pq94.png'),(60001,60001,'duyanh',NULL,NULL,NULL),(90001,90001,'Trần Duy Anh',NULL,NULL,NULL),(120001,120001,'Pháp Vũ Quốc',NULL,NULL,NULL),(150001,150001,'Nam Vũ',NULL,NULL,'https://lh3.googleusercontent.com/a/ACg8ocLtDOGnAC4QJrEU51L2nWfE_ml1rmU_Vd5_obN-UZxFBRbFSw=s96-c');
UNLOCK TABLES;

--
-- Table structure for table `KhuyenMai`
--

DROP TABLE IF EXISTS `KhuyenMai`;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=60002;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `KhuyenMai`
--

LOCK TABLES `KhuyenMai` WRITE;
INSERT INTO `KhuyenMai` (`MaKhuyenMai`, `MaLoaiKM`, `TenKhuyenMai`, `GiaTri`, `GiaTriToiThieu`, `GiamToiDa`, `NgayBatDau`, `NgayKetThuc`, `TrangThai`, `MaCode`, `SoLuong`, `LoaiVoucher`, `MaDanhMuc`) VALUES (1,1,'Sale tháng 3/2026',10.00,500000.00,100000.00,'2026-03-01 00:00:00','2026-03-31 00:00:00',1,'SALE10',99,1,NULL),(2,2,'Tri ân khách hàng',50000.00,300000.00,50000.00,'2026-01-01 00:00:00','2026-12-31 00:00:00',1,'TRIAN50K',200,1,NULL),(3,3,'Freeship toàn quốc',30000.00,1000000.00,50000.00,'2026-03-15 00:00:00','2026-03-20 00:00:00',1,'FREESHIP',500,2,NULL),(4,1,'Giảm 15% Đồ phòng bếp',15.00,300000.00,100000.00,'2026-03-01 00:00:00','2026-12-31 00:00:00',1,'BEP15',50,1,1),(5,2,'Giảm 100K Đồ phong thủy',100000.00,2000000.00,100000.00,'2026-03-01 00:00:00','2026-12-31 00:00:00',1,'PHONGTHUY100',30,1,4),(6,3,'Freeship Extra',50000.00,2000000.00,50000.00,'2026-03-01 00:00:00','2026-12-31 00:00:00',1,'FSEXT50',100,2,NULL);
UNLOCK TABLES;

--
-- Table structure for table `LichSuBaoHanh`
--

DROP TABLE IF EXISTS `LichSuBaoHanh`;
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
-- Dumping data for table `LichSuBaoHanh`
--

LOCK TABLES `LichSuBaoHanh` WRITE;
INSERT INTO `LichSuBaoHanh` (`MaLichSuBH`, `MaBaoHanh`, `NgayXuLy`, `NoiDungXuLy`, `TrangThai`) VALUES (1,1,'2026-03-10 00:00:00','Khách báo lỗi men ố vàng, đã tiếp nhận yêu cầu.',0),(2,1,'2026-03-12 00:00:00','Đã đổi trả sản phẩm mới cùng loại cho khách.',1),(3,2,'2026-03-15 00:00:00','Tiếp nhận yêu cầu bảo hành do móp méo lúc nhận hàng.',0),(4,3,'2026-03-16 00:00:00','Từ chối bảo hành do lỗi người dùng đánh rơi (có camera xác nhận).',1),(5,4,'2026-03-17 00:00:00','Đang gửi sản phẩm về hãng Minh Long để thẩm định lỗi men.',0),(6,5,'2026-03-18 00:00:00','Tiếp nhận lỗi nồi sứ bị nứt khi nấu bếp từ.',0),(7,5,'2026-03-19 00:00:00','Đã xử lý xong, đổi nồi mới 100%.',1),(8,6,'2026-03-10 00:00:00','Khách gọi hỏi thông tin kích hoạt bảo hành điện tử.',1),(9,7,'2026-03-11 00:00:00','Nhân viên CSKH đã gọi điện xác nhận thời hạn bảo hành.',1),(10,8,'2026-03-15 00:00:00','Tiếp nhận lỗi sứt mẻ ở đế lục bình.',0);
UNLOCK TABLES;

--
-- Table structure for table `LichSuTonKho`
--

DROP TABLE IF EXISTS `LichSuTonKho`;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=60002;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `LichSuTonKho`
--

LOCK TABLES `LichSuTonKho` WRITE;
INSERT INTO `LichSuTonKho` (`MaLichSu`, `MaBienThe`, `LoaiGiaoDich`, `SoLuongThayDoi`, `TonKhoHienTai`, `LoaiThamChieu`, `MaThamChieu`, `NgayTao`, `GhiChu`) VALUES (1,1,'Nhập Kho',100,100,'Phiếu Nhập',1,'2026-01-10 00:00:00',NULL),(2,4,'Nhập Kho',50,50,'Phiếu Nhập',1,'2026-01-10 00:00:00',NULL),(3,1,'Xuất Bán',-1,99,'Đơn Hàng',1,'2026-03-01 00:00:00',NULL),(4,4,'Xuất Bán',-2,48,'Đơn Hàng',2,'2026-03-02 00:00:00',NULL),(5,19,'Nhập Kho',200,200,'Phiếu Nhập',2,'2026-01-15 00:00:00',NULL),(6,19,'Xuất Bán',-10,190,'Đơn Hàng',3,'2026-03-03 00:00:00',NULL),(7,31,'Nhập Kho',50,50,'Phiếu Nhập',3,'2026-02-01 00:00:00',NULL),(8,31,'Xuất Bán',-1,49,'Đơn Hàng',5,'2026-03-05 00:00:00',NULL),(9,61,'Nhập Kho',20,20,'Phiếu Nhập',5,'2026-02-20 00:00:00',NULL),(10,61,'Xuất Bán',-1,19,'Đơn Hàng',4,'2026-03-04 00:00:00',NULL),(30002,1,'Xuất Bán',-10,40,'Đơn Hàng',30002,'2026-03-29 09:35:22','Khách hàng đặt mua đơn DH260329XWS9'),(30003,5,'Xuất Bán',-1,24,'Đơn Hàng',30002,'2026-03-29 09:35:22','Khách hàng đặt mua đơn DH260329XWS9'),(30004,1,'Hoàn trả hàng / Hủy đơn',10,50,'Đơn Hàng',30002,'2026-03-29 09:44:55','Hoàn tồn kho do khách hủy đơn DH260329XWS9'),(30005,5,'Hoàn trả hàng / Hủy đơn',1,25,'Đơn Hàng',30002,'2026-03-29 09:44:55','Hoàn tồn kho do khách hủy đơn DH260329XWS9');
UNLOCK TABLES;

--
-- Table structure for table `LoaiKhuyenMai`
--

DROP TABLE IF EXISTS `LoaiKhuyenMai`;
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
-- Dumping data for table `LoaiKhuyenMai`
--

LOCK TABLES `LoaiKhuyenMai` WRITE;
INSERT INTO `LoaiKhuyenMai` (`MaLoaiKM`, `TenLoaiKM`, `MoTa`) VALUES (1,'Giảm giá theo %','Giảm theo phần trăm tổng đơn'),(2,'Giảm tiền mặt','Trừ thẳng tiền vào tổng đơn'),(3,'Freeship','Miễn phí vận chuyển');
UNLOCK TABLES;

--
-- Table structure for table `LoaiPhiVanChuyen`
--

DROP TABLE IF EXISTS `LoaiPhiVanChuyen`;
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
-- Dumping data for table `LoaiPhiVanChuyen`
--

LOCK TABLES `LoaiPhiVanChuyen` WRITE;
INSERT INTO `LoaiPhiVanChuyen` (`MaLoaiPhi`, `TenLoaiPhi`, `MoTa`) VALUES (1,'Giao tiết kiệm','Giao hàng tiêu chuẩn toàn quốc (GHN/GHTK)'),(2,'Hỏa tốc','Giao nhanh trong ngày (Áp dụng nội thành)'),(3,'Nhận tại cửa hàng','Khách hàng đến trực tiếp cửa hàng để lấy (Miễn phí)');
UNLOCK TABLES;

--
-- Table structure for table `NhaCungCap`
--

DROP TABLE IF EXISTS `NhaCungCap`;
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
-- Dumping data for table `NhaCungCap`
--

LOCK TABLES `NhaCungCap` WRITE;
INSERT INTO `NhaCungCap` (`MaNhaCC`, `TenNhaCC`, `Diachi`, `SDT`) VALUES (1,'Gốm Sứ Minh Long','Bình Dương','0274111111'),(2,'Gốm Sứ Bát Tràng','Hà Nội','0243222222'),(3,'Healthy Cook','Bình Dương','0274333333'),(4,'Gốm Chu Đậu','Hải Dương','0220444444'),(5,'Gốm Sứ Hải Long','Hà Nội','0243555555'),(6,'Xưởng Gốm Việt','Hà Nội','0243666666'),(7,'Gốm Sứ Thanh Hà','Quảng Nam','0235777777'),(8,'Gốm Sứ Bầu Trúc','Ninh Thuận','0259888888'),(9,'Gốm Donghwa','Đồng Nai','0251999999'),(10,'Gốm Sứ Phùng Gia','Hà Nội','0243000000');
UNLOCK TABLES;

--
-- Table structure for table `NhanVien`
--

DROP TABLE IF EXISTS `NhanVien`;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=30001;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `NhanVien`
--

LOCK TABLES `NhanVien` WRITE;
INSERT INTO `NhanVien` (`MaNhanVien`, `MaTaiKhoan`, `TenNhanVien`, `SDT`, `NgaySinh`, `DiaChi`) VALUES (1,1,'Trần Quản Trị','0901234567','1990-05-15','123 Đường Gốm Bát Tràng, Hà Nội'),(2,3,'Nguyễn Thị Bán Hàng','0912345678','1998-10-20','456 Phố Sứ, TP.HCM');
UNLOCK TABLES;

--
-- Table structure for table `PhanQuyen`
--

DROP TABLE IF EXISTS `PhanQuyen`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `PhanQuyen` (
  `MaPhanQuyen` int NOT NULL AUTO_INCREMENT,
  `TenPhanQuyen` varchar(50) NOT NULL,
  PRIMARY KEY (`MaPhanQuyen`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=30001;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `PhanQuyen`
--

LOCK TABLES `PhanQuyen` WRITE;
INSERT INTO `PhanQuyen` (`MaPhanQuyen`, `TenPhanQuyen`) VALUES (1,'Admin'),(2,'Staff'),(3,'Customer');
UNLOCK TABLES;

--
-- Table structure for table `PhieuNhap`
--

DROP TABLE IF EXISTS `PhieuNhap`;
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
-- Dumping data for table `PhieuNhap`
--

LOCK TABLES `PhieuNhap` WRITE;
INSERT INTO `PhieuNhap` (`MaPhieuNhap`, `MaNhaCC`, `MaNhanVien`, `NgayNhap`, `TongTien`, `GhiChu`, `TrangThai`) VALUES (1,1,1,'2026-01-10 00:00:00',50000000.00,'Nhập lô đầu năm Minh Long',1),(2,2,1,'2026-01-15 00:00:00',30000000.00,'Nhập bổ sung Bát Tràng',1),(3,3,2,'2026-02-01 00:00:00',20000000.00,'Nhập nồi sứ Healthy Cook',1),(4,4,2,'2026-02-10 00:00:00',15000000.00,'Nhập gốm trang trí',1),(5,5,1,'2026-02-20 00:00:00',40000000.00,'Nhập ấm trà',1),(6,6,2,'2026-03-01 00:00:00',25000000.00,'Nhập đầu tháng',1),(7,7,1,'2026-03-05 00:00:00',10000000.00,'Nhập lục bình Thanh Hà',0),(8,8,2,'2026-03-10 00:00:00',5000000.00,'Đang giao từ Ninh Thuận',0),(9,9,1,'2026-03-12 00:00:00',8000000.00,'Chờ duyệt',0),(10,10,2,'2026-03-15 00:00:00',12000000.00,'Chờ thanh toán Phùng Gia',0);
UNLOCK TABLES;

--
-- Table structure for table `PhuongThucThanhToan`
--

DROP TABLE IF EXISTS `PhuongThucThanhToan`;
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
-- Dumping data for table `PhuongThucThanhToan`
--

LOCK TABLES `PhuongThucThanhToan` WRITE;
INSERT INTO `PhuongThucThanhToan` (`MaPhuongThuc`, `TenPhuongThuc`, `MoTa`, `TrangThai`) VALUES (1,'COD','Thanh toán tiền mặt khi nhận hàng',1),(2,'VNPay','Thanh toán qua quét mã QR VNPay',1),(3,'MetaMask','Thanh toán bằng Crypto qua ví MetaMask',1),(4,'Momo','Thanh toán qua ví điện tử Momo',1),(5,'ZaloPay','Thanh toán qua ví điện tử ZaloPay',1);
UNLOCK TABLES;

--
-- Table structure for table `RuiRo`
--

DROP TABLE IF EXISTS `RuiRo`;
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
-- Dumping data for table `RuiRo`
--

LOCK TABLES `RuiRo` WRITE;
INSERT INTO `RuiRo` (`MaRuiRo`, `MaDonHang`, `LoaiRuiRo`, `MoTa`, `TrangThai`, `NgayPhatHien`, `GhiChu`) VALUES (1,1,'Vận chuyển','Shipper Giao Hàng Tiết Kiệm làm rơi vỡ 1 bát cơm trong bộ.',1,'2026-03-02 00:00:00',NULL),(2,2,'Thanh toán','Lỗi gateway VNPay, khách bị trừ tiền 2 lần nhưng hệ thống báo thất bại.',1,'2026-03-03 00:00:00',NULL),(3,3,'Gian lận','Phát hiện tài khoản dùng tool spam mã giảm giá tân thủ.',1,'2026-03-03 00:00:00',NULL),(4,4,'Hàng hóa','Lục bình xước dăm nhẹ do quy trình đóng gói dùng màng xốp nổ kém chất lượng.',0,'2026-03-05 00:00:00',NULL),(5,5,'Vận chuyển','Mất mã vận đơn, thất lạc kiện hàng nồi sứ tại bưu cục trung chuyển.',0,'2026-03-08 00:00:00',NULL),(6,6,'Khách hàng','Khách boom hàng, gọi điện thoại 10 cuộc không nghe máy, nhắn tin Zalo không rep.',1,'2026-03-12 00:00:00',NULL),(7,7,'Vận chuyển','Giao trễ 5 ngày do ảnh hưởng thời tiết mưa bão ở khu vực miền Trung.',0,'2026-03-17 00:00:00',NULL),(8,8,'Thanh toán','Thanh toán Crypto qua MetaMask bị pending lâu trên chuỗi do phí gas thấp.',0,'2026-03-16 00:00:00',NULL),(9,9,'Kho bãi','Nhân viên kho dán nhầm bill, lấy nhầm bộ ấm chén loại rẻ tiền thay vì hàng cao cấp.',1,'2026-03-17 00:00:00',NULL),(10,10,'Hệ thống','Lỗi đồng bộ API, đơn hàng đã thanh toán nhưng không nhảy vào hệ thống ERP để xử lý.',1,'2026-03-17 00:00:00',NULL);
UNLOCK TABLES;

--
-- Table structure for table `SanPham`
--

DROP TABLE IF EXISTS `SanPham`;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=30002;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `SanPham`
--

LOCK TABLES `SanPham` WRITE;
INSERT INTO `SanPham` (`MaSanPham`, `MaDanhMuc`, `TenSanPham`, `Thumbnail`, `ThuongHieu`, `LuotXem`, `MoTa`, `TrangThai`) VALUES (1,6,'Bộ đồ ăn Timeless IFP','https://res.cloudinary.com/dcmwz0uis/image/upload/v1773735976/9sp-time-kl-trang_bytubp.webp','Minh Long',3,'Bộ đồ ăn Timeless IFP là lựa chọn lý tưởng cho những ai yêu thích phong cách sống tối giản và tinh tế. Thiết kế theo triết lý \"Less is more\", bộ sản phẩm mang vẻ đẹp thanh thoát với màu trắng sứ tinh khiết, kết hợp cùng đường bo tròn mềm mại đặc trưng của dòng Timeless.\nSản phẩm được làm từ sứ cao cấp Minh Long, nung ở nhiệt độ trên 1380°C, không chứa chì, cadmium, an toàn cho sức khỏe, bền chắc, chống trầy xước và sử dụng được trong lò vi sóng, máy rửa chén.\nLý do nên chọn bộ này:\n- Tông trắng tinh tế – dễ kết hợp mọi kiểu không gian bàn ăn.\n- Thiết kế tối giản – hiện đại – tinh gọn.\n- 9 món tiện lợi – phù hợp cho cá nhân, cặp đôi, gia đình nhỏ.\n- Chất liệu sứ Minh Long cao cấp – không phai màu, không bám mùi, dễ vệ sinh.\nPhù hợp làm quà tặng hoặc dùng trong homestay, căn hộ studio.',1),(2,6,'Bộ đồ ăn Camellia','https://res.cloudinary.com/dcmwz0uis/image/upload/v1773740413/tiepda_1_e2v3pt.webp','Minh Long',0,'Bộ đồ ăn Camellia mang phong cách sang trọng với họa tiết hoa trà tinh tế. Sản phẩm sử dụng chất liệu sứ cao cấp, bền đẹp, phù hợp cho bàn ăn gia đình hoặc tiếp khách.\nVì sao nên chọn bộ đồ ăn này?\n- Thiết kế đơn sắc hiện đại, dễ kết hợp với mọi kiểu bàn ăn\n- Sứ cao cấp Minh Long – siêu bền, dễ vệ sinh, an toàn cho sức khỏe\n- Dùng được cho máy rửa chén, lò vi sóng – tiện lợi tối đa\n- Thích hợp làm quà tặng tân gia, cưới hỏi, doanh nghiệp, khách sạn',1),(3,6,'Bộ đồ ăn Jasmine','https://res.cloudinary.com/dcmwz0uis/image/upload/v1773741517/bo-9sp-jas-trang-nga_yla16y.png','Minh Long',4,'Bộ đồ ăn Jasmine mang phong cách nhẹ nhàng, tinh tế với họa tiết hoa nhài thanh thoát.\nSản phẩm được làm từ sứ cao cấp, phù hợp cho bữa ăn gia đình và không gian trang nhã.\nVì sao nên chọn bộ đồ ăn này?\n- Thiết kế đơn sắc hiện đại, dễ kết hợp với mọi kiểu bàn ăn\n- Sứ cao cấp Minh Long – siêu bền, dễ vệ sinh, an toàn cho sức khỏe\n- Dùng được cho máy rửa chén, lò vi sóng – tiện lợi tối đa\n- Thích hợp làm quà tặng tân gia, cưới hỏi, doanh nghiệp, khách sạn',1),(4,6,'Bộ đồ ăn Daisy','https://res.cloudinary.com/dcmwz0uis/image/upload/v1773742534/24312-sm-01_d807073456cb42ac9f0796710eb65c17_master_ou5wax.png','Minh Long',0,'Bộ đồ ăn Daisy sở hữu thiết kế thanh lịch với tông màu trắng tinh khôi, mang đến nét đẹp trang nhã và sang trọng cho bàn ăn.\nSản phẩm được chế tác từ chất liệu sứ cao cấp, đảm bảo an toàn cho sức khỏe, giúp bạn yên tâm sử dụng hàng ngày.\nĐặc Điểm Nổi Bật:\n- Chất liệu sứ cao cấp, không chứa chì, cadmium, an toàn cho sức khỏe.\n- Tông màu trắng tinh khôi, dễ dàng kết hợp với nhiều phong cách bày trí bàn ăn.\n- Bộ gồm 09 sản phẩm tiện dụng, đáp ứng nhu cầu sử dụng hàng ngày.\n- Khả năng chịu nhiệt tốt, an toàn khi sử dụng trong lò vi sóng và máy rửa chén.\n- Bề mặt sứ tráng men láng mịn, hạn chế bám bẩn, dễ dàng vệ sinh.\nBộ đồ ănDaisy Trắng không chỉ giúp bữa cơm gia đình thêm trọn vẹn mà còn là sự lựa chọn lý tưởng để làm quà tặng sang trọng cho người thân, bạn bè.',1),(5,6,'Bộ đồ ăn Hoàng Cung','https://res.cloudinary.com/dcmwz0uis/image/upload/v1773744001/bo-do-an-30-san-pham-hoang-cung-lac-hong-30208-00_z2uoxf.png','Minh Long I',0,'Bộ đồ ăn của sản phẩm Hoàng Cung là tuyệt tác gốm sứ cao cấp đến từ thương hiệu Minh Long I, mang đậm hơi thở truyền thống và tinh thần dân tộc. Lấy cảm hứng từ hoa văn cung đình và văn hóa Việt, bộ sản phẩm không chỉ là đồ dùng bàn ăn mà còn là biểu tượng của sự sang trọng, tinh tế và đẳng cấp.\n🌟 Đặc điểm nổi bật:\n✅ Chất liệu sứ ngọc cao cấp: Nung ở nhiệt độ trên 1.300°C, bền chắc, sáng bóng, không chứa chì – an toàn tuyệt đối cho sức khỏe người dùng.\n✅ Họa tiết độc đáo: Hoa văn vẽ vàng thủ công tinh xảo, kết hợp với sắc men trang nhã thể hiện tinh thần dân tộc, phù hợp trưng bày, tiếp khách hay làm quà tặng cao cấp.\n✅ Thiết kế sang trọng – Đậm chất hoàng cung: Từng đường nét đều được chăm chút, thể hiện đẳng cấp của người sử dụng.\n✅ Bộ sản phẩm 13 món đầy đủ: Gồm bát, đĩa, chén, tô… phục vụ bữa ăn hoàn chỉnh, thích hợp cho gia đình, nhà hàng cao cấp, khách sạn và quà tặng sự kiện.',1),(6,7,'Bát cơm Timeless','https://res.cloudinary.com/dcmwz0uis/image/upload/v1773752428/chen-com-kl-timeless-trang-gom-su-minh-long-a001-591166000-0_xfa37j.webp','Minh Long',0,'Bát cơm thuộc bộ Timeless, thiết kế tối giản, màu trắng tinh tế.',1),(7,7,'Đĩa tròn Camellia','https://res.cloudinary.com/dcmwz0uis/image/upload/v1773753280/041813014-e7c232fe903a458f93e78bfa4be3a244-grande-d4808e03-9d85-46fc-abae-d54dfe48f376_uydhbu.png','Minh Long I',0,'Đĩa tròn thuộc bộ Camellia, thiết kế sang trọng, phù hợp dùng trong bữa ăn gia đình hoặc tiếp khách.',1),(8,7,'Bát tô lớn Jasmine','https://res.cloudinary.com/dcmwz0uis/image/upload/v1773753748/ca-com-xuon-mo_gbyuvw.png','Minh Long',0,'Bát tô lớn thuộc bộ Jasmine, phù hợp đựng canh hoặc món nước.',1),(9,7,'Đĩa tròn Daisy','https://res.cloudinary.com/dcmwz0uis/image/upload/v1773754137/dia-tron-ao-28-cm-daisy-bong-bay-042821312-sm-01-93a4d2e97c9b45e2b4058ec0156c2084-grande-708256cf-fd68-4282-909f-a33bc05897ac_kgbcem.png','Minh Long I',2,'Đĩa tròn Daisy thiết kế hiện đại, phù hợp trang trí bàn ăn, thuộc bộ đồ ăn Daisy',1),(10,7,'Chén chấm Hoàng Cung','https://res.cloudinary.com/dcmwz0uis/image/upload/v1773754536/chen-cham-9-cm-camellia-lac-hong_040976208-1-sm_5725bdb043d243c79330e79518c1339c_gujrc3.png','Minh Long',0,'Chén chấm cao cấp thuộc dòng Hoàng Cung, họa tiết truyền thống.',1),(11,8,'Nồi sứ Vesta','https://res.cloudinary.com/dcmwz0uis/image/upload/v1773755380/Noi-duong-sinh-Vesta-3.0L-nap-Healthycook-Hong-Anh-Kim1_mmyagw.png','Healthy Cook',0,'Sứ dưỡng sinh Healthycook là dòng sản phẩm đột phá độc đáo, kết tinh của nhiều năm tâm huyết, nghiên cứu và thử nghiệm của nhà sáng lập Minh Long.\nVới chất liệu tinh tuyển từ đất hiếm thiên nhiên, lành tính, không chứa các chất độc hại, Healthycook sở hữu nhiều tính năng nổi bật góp phần đem lại những bữa ăn ngon – lành cho gia đình.\nĐẶC TÍNH SẢN PHẨM:\n- Nấu thực phẩm không cần nước mà vẫn giữ màu sắc rau củ tươi như ban đầu (dưỡng chất còn lại 70 -80%).\n- Chiên ở nhiệt độ thấp mà vẫn chín sâu, giòn lâu.\n- Nấu chín thức ăn bằng cơ chế phát ra tia hồng ngoại nên hầm nhanh mềm, tạo rất ít váng bọt nên nước trong và thơm hơn, giúp tiết kiệm thời gian và nhiên liệu.\n- Sản phẩm được nung ở nhiệt độ cao 1280 độ C giúp sản phẩm không bị rạn men, bung men trong quá trình sử dụng lâu dài\n- Bảo hành 1 năm',1),(12,9,'Đũa sứ Jasmine Lys','https://res.cloudinary.com/dcmwz0uis/image/upload/v1773756333/5cb2-8d05e38ba55f4517890c19b5ab13007b-e8822221fd3b49dc94eadac67f6703db-fe52fdbad9964f8ca6124a1a91516529-grande-47424398-546d-47c7-82b0-993882f55bf5_ygygqx.png','Minh Long LYS',0,'Được làm từ nguyên liệu sứ tinh tuyển, lành tính, an toàn cho sức khỏe.\nMặt đũa phủ men nano sáng bóng, không thấm hút gia vị, thức ăn.\nKhó bám bẩn, không bị ẩm mốc, dễ tẩy rửa, nhanh khô.\nNung ở nhiệt độ cao 1380oC đảm bảo độ cứng chắc.\nSứ cao cấp, chất lượng theo tiêu chuẩn châu Âu.\nPhù hợp để làm quà tặng; sử dụng trong gia đình, nhà hàng, khách sạn…\nHướng dẫn sử dụng và bảo quản:\n- Tránh làm rớt, va đập hoặc dùng lực tác động quá mạnh lên sản phẩm.\n- Vệ sinh sản phẩm bằng dung dịch hay các miếng tẩy rửa thông thường.\n- Bảo quản nơi khô thoáng, sạch sẽ, tránh những nơi có khả năng làm rơi vỡ sản phẩm.',1),(13,9,'Đũa sứ dưỡng sinh IFP','https://res.cloudinary.com/dcmwz0uis/image/upload/v1773756576/dua-do-4f5dada2641444ceb3cae14a24657c68-grande_ezs6ab.webp','Minh Long IFP',0,'Trong dáng vẻ mảnh mai mà bền bỉ của đôi đũa là hình ảnh đồng thuận, tương trợ nhau như cốt cách người Việt, nay có thêm diện mạo mới bằng sứ do Minh Long chế tác.\n\"Một đôi hoà thuận\nXa gần xuôi ngược chờ nhau\nChút tình nâng niu nồng ấm\nSẻ chia từ buổi sơ đầu\nĐất giữ ngọc qua đá vàng gửi lại\nMột-đôi-tình\nChung thuỷ đến ngày sau...\"\nTrong cái dáng vẻ mảnh mai mà bền bỉ của đôi đũa là hình ảnh của sự đồng thuận, tìm nhau, chờ nhau, xa gần, mặn ngọt cùng nhau. Cũng thấy trong cái dáng vẻ mong manh ấy, trời, đất và người giao hoà.\nMột chiếc linh hoạt, khéo léo, tựa trên một chiếc vững vàng giữa những ngón tay người nâng đỡ- một vũ khúc của sắc hương bát ngát chan hoà. Một đôi đũa, cũng mang vẻ đẹp của sự thuỷ chung. Hai chiếc song đôi, không rời nhau giữa dòng đời xuôi ngược. \"Một đôi\", với tất cả ý nghĩa đẹp đẽ của nó, nằm ngay trong bóng dáng của sự thuỷ chung ấy. Và khi chờ nhau để cùng nâng đũa trên tay, mời nhau miếng ngon, miếng lành đầu tiên là miếng của lòng tri ân, kính trên nhường dưới, là miếng ân cần chia sẻ yêu thương. Một đôi đũa đã mang trong nó hình ảnh một gia đình đầm ấm.\nĐất thuỷ chung với người, nghìn năm giữ ngọc, qua men lửa đá vàng, một đôi thắm thiết, xin trao.',1),(14,9,'Gác đũa muỗng Jasmine Lys','https://res.cloudinary.com/dcmwz0uis/image/upload/v1773756925/image-removebg-preview-1_rw2xqi.png','Minh Long LYS',0,'Gác đũa - Jasmine Lys có màu men sứ trắng ngà, đa dạng chủng loại từ chén, dĩa, tô, tách...có kiểu dáng thiết kế đồng nhất, đáp ứng đầy đủ nhu cầu sử dụng cho các loại bàn tiệc đa dạng và phong phú của khách hàng.\nGác đũa muỗng Lys giúp giữ vệ sinh bàn ăn, thiết kế nhỏ gọn, tinh tế, phù hợp với nhiều phong cách bày trí.',1),(15,9,'Gác đũa Misc Assortment','https://res.cloudinary.com/dcmwz0uis/image/upload/v1773787161/gac_dua_ca_hjmqyf.png','Misc Assortment',0,'Tuyển chọn từ những nguyên liệu quý hiếm mỗi sản phẩm của Misc Assortment đảm bảo những tiêu chí cao nhất về chất lượng. Sở hữu nhiều tính năng vượt trội siêu cứng chắc, mặt men sáng bóng, khó trầy xước. Misc Assortment được nhiều người ưa chuộng và lựa chọn bởi sự cao cấp, an toàn, bền đẹp và thân thiện với môi trường.',1),(16,9,'Muỗng Jasmine','https://res.cloudinary.com/dcmwz0uis/image/upload/v1773787787/f4cd4c8d12fecea097ef_b59ee5c8c3db4aab8a1943e47eda8b67_66a0b61d72344c14b7f2ad880614f1ad_hnjjlx.png','Minh Long',3,'Đặc tính sản phẩm:\n-Thân sứ siêu cứng với công nghệ phối liệu đặc biệt: Sử dụng bền lâu, hạn chế bể mẻ trong quá trình tẩy rửa.\n-Mặt men cứng, chắc: Khó trầy xước khi sử dụng dao, muỗng, nĩa thường xuyên, giữ sản phẩm luôn mới sau thời gian dài sử dụng.\n-Ứng dụng công nghệ Nano cho bề mặt men láng bóng: Giúp cho sản phẩm khó bám bẩn kể cả dầu mỡ, tiết kiệm thời gian.\n-Kiểu dáng đa dạng sang trọng phù hợp với nhiều không gian ăn uống khác nhau.\n-Độ sốc nhiệt cao (có thể sử dụng từ nóng sang lạnh và ngược lại với độ sốc nhiệt từ 0 đến 200 độ C).',1),(17,9,'Muỗng Hoàng Cung','https://res.cloudinary.com/dcmwz0uis/image/upload/v1773788271/muong-hoang-cung-kim-ngoc-a001-140429488_jzjjdy.webp','Gastroline',0,'Bộ sản phẩm Gastroline Kim Ngọc toát lên vẻ đẹp hiện đại và cuốn hút trong từng đường nét, tạo nên bức tranh sống động cho không gian ẩm thực. Với gam màu hiện đại, kiểu dáng thanh thoát phù hợp nhiều phong cách ẩm thực, Gastroline Kim Ngọc là nguồn cảm hứng bất tận cho đầu bếp thỏa thức sáng tạo và biến tấu món ăn thành một tác phẩm nghệ thuật.\nĐặc biệt, Gastroline là một trong những dòng sản phẩm trứ danh của Minh Long cùng nhà thiết kế Hans Wilhelm Seitz (nhà thiết kế đẳng cấp của Đức) từng được vinh danh là thiết kế có “ý tưởng thiết kế sản phẩm xuất sắc” tại giải Red Dot Design Award 2019 - Cuộc thi thiết kế quy mô và uy tín nhất toàn cầu.',1),(18,10,'Bộ trà Jasmine','https://res.cloudinary.com/dcmwz0uis/image/upload/v1773789799/00-e044fa84-cb8f-4cfd-acbd-89b434624698_alvzg2.webp','LYS',0,'Bộ ấm trà Jasmine thiết kế thanh lịch, họa tiết tinh tế, phù hợp tiếp khách và sử dụng hàng ngày.',1),(19,10,'Bộ ấm trà Hoàng Cung','https://res.cloudinary.com/dcmwz0uis/image/upload/v1773798497/00-f5e6732e-77c1-489d-9972-0804386f0860_nsci6h.webp','Minh Long I',0,'Đặc điểm nổi bật:\n- Chất liệu sứ cao cấp: Được chế tác từ nguồn nguyên liệu tinh tuyển, nung ở nhiệt độ trên 1.380°C, sản phẩm có độ bền cao, bề mặt men sáng bóng, láng mịn, chống bám bẩn và dễ dàng vệ sinh.\n- Thiết kế nhỏ gọn, tinh tế: Dung tích 0.8L vừa vặn cho những buổi thưởng trà từ 2–4 người, kiểu dáng mềm mại, cân đối, giúp giữ nhiệt tốt và thuận tiện khi sử dụng.\n- Hoa văn \"Hoàng Liên\" sang trọng: Lấy cảm hứng từ hoa sen vàng – biểu tượng của sự cao quý, thuần khiết và phú quý. Họa tiết được vẽ tay tỉ mỉ với sắc vàng kim óng ánh, mang vẻ đẹp trang nhã, quý phái.\n- An toàn tuyệt đối: Không chứa chì, cadmium; an toàn khi sử dụng trong lò vi sóng và máy rửa chén mà không ảnh hưởng đến chất lượng sản phẩm.\nBộ sản phẩm bao gồm:\n- 1 ấm trà (dung tích 0.8 lít)\n- 6 tách trà\n- 6 dĩa lót tách\n- 1 bình lọc trà (nếu có)\nỨng dụng:\n- Thích hợp cho không gian thưởng trà tại gia, văn phòng hoặc những buổi trà đạo nhẹ nhàng, ấm cúng.\n- Là món quà tặng ý nghĩa, cao cấp trong các dịp lễ tết, tân gia, mừng thọ, tri ân đối tác và khách hàng.',1),(20,10,'Bộ ấm trà Camellia','https://res.cloudinary.com/dcmwz0uis/image/upload/v1773799161/daiduong1_jb2t49.webp','Minh Long',6,'ĐẶC TÍNH SẢN PHẨM:\n• Sản phẩm được sản xuất từ nguyên liệu đất sét tinh tuyển, được chọn lọc và qua các quy trình sản xuất chuyên nghiệp, kỹ thuật cao, cùng với sự tâm huyết của các nghệ nhân, đảm bảo độ bền vững cao và sử dụng lâu dài.\n• Sản phẩm được nung ở nhiệt độ cao (từ 1260℃ đến 1380℃) giúp loại bỏ tạp chất, đảm bảo an toàn cho sức khoẻ người tiêu dùng.\n• Bề mặt sản phẩm trắng sáng và không bị ố vàng sau một thời gian sử dụng. Điều này làm cho sản phẩm sứ Minh Long trở thành lựa chọn hàng đầu cho các gia đình và doanh nghiệp khi muốn trang trí không gian sống hoặc sử dụng trong các bữa tiệc quan trọng.\n• Sản phẩm được sản xuất với độ chính xác cao, tinh tế trong từng chi tiết, đảm bảo độ hoàn hảo tuyệt đối.\n• Công nghệ Nano giúp bề mặt sứ mịn, bền đẹp, kháng khuẩn, chống bám bẩn giúp dễ dàng vệ sinh.',1),(21,10,'Bộ ấm trà Timeless IFP','https://res.cloudinary.com/dcmwz0uis/image/upload/v1773799426/untitled-2-33fcb174-b370-4fff-9d41-74b4ab26cd71_gukw9m.webp','Minh Long IFP',0,'Bộ trà Timeless IFP là sự kết hợp độc đáo giữa nghệ thuật gốm sứ truyền thống và biểu tượng phong thủy thiêng liêng trong văn hóa Việt Nam. Với họa tiết Tứ Linh – Long, Lân, Quy, Phụng – được thể hiện tinh xảo trên nền men trắng ngà cao cấp, điểm xuyết bằng sắc xanh dương hài hòa và viền vàng 24k sang trọng, sản phẩm không chỉ là vật phẩm thưởng trà mà còn là biểu tượng cho sức mạnh, tài lộc và phúc khí.\nBộ sản phẩm thiết kế theo phong cách cổ điển pha lẫn hiện đại, với các chi tiết được chăm chút tỉ mỉ từ bình trà, tách, dĩa lót đến chén đường và rót sữa. Đây là lựa chọn lý tưởng cho các buổi trà chiều tao nhã, những buổi tiếp khách đẳng cấp hay làm quà biếu trang trọng, ý nghĩa.',1),(22,10,'Bộ ấm trà Đài Các','https://res.cloudinary.com/dcmwz0uis/image/upload/v1773799897/daicac1_n6eurh.webp','Minh Long',0,'Đặc điểm nổi bật:\n- Chất liệu sứ cao cấp từ Minh Long I – sáng bóng, bền đẹp, chịu sốc nhiệt tốt.\n- Họa tiết bạch kim tinh xảo, sang trọng, không phai màu theo thời gian.\n- Thiết kế hiện đại, phù hợp với phong cách sống thanh lịch, trang nhã.\n- An toàn cho sức khỏe, không chứa chì hay kim loại nặng độc hại.\nPhong cách:\n- Hiện đại – Sang trọng – Trang nhã – Đẳng cấp\n- Bộ trà Đài Các Bạch Kim là lựa chọn lý tưởng cho các buổi tiếp khách, thưởng trà hay làm quà tặng cao cấp trong các dịp đặc biệt như lễ Tết, tân gia, cưới hỏi.',1),(23,11,'Khay mứt Jasmine','https://res.cloudinary.com/dcmwz0uis/image/upload/v1773800243/imgi-64-avatar-9-f417d222913545108853c332a00c0779_fefars.png','Minh Long',0,'Khay mứt 5 ngăn tròn Misc Assortment viền chỉ vàng là sự kết hợp hoàn hảo giữa thiết kế tinh tế và chất liệu cao cấp, mang đến vẻ sang trọng cho không gian tiếp khách trong mỗi dịp lễ Tết. Sản phẩm được chế tác từ gốm sứ cao cấp, phủ men sáng bóng, giúp dễ dàng vệ sinh và an toàn cho sức khỏe.\nPhần nắp đậy có tay cầm hình bông hoa cách điệu, điểm xuyết viền vàng ánh kim tôn lên vẻ thanh lịch và đẳng cấp. Thiết kế 5 ngăn riêng biệt giúp bạn sắp xếp nhiều loại mứt, hạt, bánh kẹo một cách gọn gàng và thẩm mỹ.\nĐặc điểm nổi bật:\n- Chất liệu: Gốm sứ cao cấp, phủ men bóng mịn.\n- Thiết kế: Tròn 5 ngăn tiện lợi, có nắp đậy kín.\n- Họa tiết: Tay cầm hình hoa, viền chỉ vàng sang trọng.\n- Màu sắc: Trắng tinh khôi, viền vàng ánh kim nổi bật.\nPhù hợp sử dụng trong dịp Tết, lễ hội, hoặc làm quà tặng ý nghĩa.',1),(24,11,'Khay mứt Camellia','https://res.cloudinary.com/dcmwz0uis/image/upload/v1773800475/ca_c2qqqk.png','Minh Long',0,'🌸 Đặc điểm nổi bật:\nThiết kế 5 ngăn tiện lợi: Giúp phân loại mứt, bánh kẹo, hạt khô một cách gọn gàng, tinh tế.\nHọa tiết hoa đào viền vàng: Từng nhánh hoa đào được vẽ tỉ mỉ trên nền sứ hồng phấn trang nhã, kết hợp viền vàng ánh kim cao cấp, tạo điểm nhấn sang trọng.\nChất liệu: Gốm sứ cao cấp, phủ men bóng mịn, bền đẹp, an toàn cho sức khỏe.\nNắp đậy kín, tay cầm hoa mạ vàng: Vừa tiện dụng vừa làm nổi bật sự quý phái của sản phẩm.\nKích thước: Đường kính 24 cm, phù hợp trưng bày bàn trà, bàn tiếp khách hoặc làm quà biếu cao cấp.\n🎁 Công dụng:\nĐựng mứt, bánh kẹo, hạt dưa, hạt điều, trái cây sấy hoặc các loại hạt khô khác.\nDùng làm vật phẩm trang trí Tết hoặc quà tặng sang trọng cho người thân, đối tác.\nGóp phần làm nổi bật không gian Tết truyền thống, mang đến vẻ đẹp ấm cúng và thịnh vượng.',1),(25,11,'Khay mứt Hoàng Cung','https://res.cloudinary.com/dcmwz0uis/image/upload/v1773800736/hc1_qxx3po.png','Minh Long IFP',0,'Bộ khay mứt cao cấp với thiết kế tinh xảo, mang đậm phong cách sang trọng và hiện đại. Sản phẩm gồm 5 hũ gốm có nắp, được sắp xếp gọn gàng trên đĩa tròn đường kính 31.5 cm, thuận tiện cho việc trưng bày và sử dụng trong các dịp lễ Tết hay tiếp khách.\nChất liệu: Gốm sứ cao cấp IFP, phủ men sáng bóng, bền màu theo thời gian.\nHọa tiết: Trang trí hoa văn Thiên Kim tinh tế, phối màu đỏ - vàng kim sang trọng, điểm nhấn bằng viền chỉ vàng thủ công.\nCông dụng: Dùng để đựng mứt, bánh kẹo, hạt hoặc các món ăn vặt, thích hợp cho phòng khách, bàn trà, quà biếu cao cấp.',1),(26,11,'Khay mứt IFP','https://res.cloudinary.com/dcmwz0uis/image/upload/v1773800921/imgi-37-khay-mut-tron-5-ngan-24cm-nap-misc-assortment-sen-ngoc-212471456h-1-sm-4f2cfa9f4fb544d181dc12c356124c6f_rfgpsx.webp','Minh Long',11,'💎 Đặc điểm nổi bật:\nThiết kế 5 ngăn tiện dụng: Các ngăn được sắp xếp khéo léo bên trong khay tròn, giúp phân chia mứt, bánh kẹo hoặc hạt khô gọn gàng, đẹp mắt.\nHoa văn Sen Ngọc: Họa tiết hoa sen màu xanh lam kết hợp viền vàng sang trọng, tạo nên vẻ đẹp thanh lịch và quý phái.\nChất liệu: Gốm sứ cao cấp Misc Assortment, tráng men sáng bóng, an toàn cho sức khỏe, không phai màu theo thời gian.\nNắp đậy tinh xảo: Tay cầm hình hoa sen mạ vàng, điểm nhấn độc đáo cho tổng thể thiết kế.\nKích thước: Đường kính 24 cm, phù hợp trưng bày trên bàn trà, bàn khách hoặc làm quà tặng cao cấp.',1),(27,11,'Khay mứt Đài Các','https://res.cloudinary.com/dcmwz0uis/image/upload/v1773801102/dc1_sm774c.png','Minh Long',0,'🌸 Đặc điểm nổi bật:\nThiết kế Ngũ Sắc tượng trưng cho ngũ hành – Kim, Mộc, Thủy, Hỏa, Thổ, mang ý nghĩa may mắn và thịnh vượng cho gia chủ.\nHọa tiết hoa nổi bật: Mỗi hũ được trang trí một loài hoa khác nhau như hoa hồng, hướng dương, lan, mai, cúc, tượng trưng cho sự tươi mới, tài lộc và hạnh phúc.\nChất liệu: Gốm sứ cao cấp IFP, phủ men sáng bóng, an toàn cho sức khỏe, bền màu theo thời gian.\nKích thước: Khay tròn đường kính 31.5 cm.\n🎁 Công dụng:\nDùng để đựng mứt, bánh kẹo, hạt khô, trái cây sấy hoặc các món ăn vặt.\nPhù hợp trưng bày trong phòng khách, bàn trà, bàn tiệc hay làm quà tặng sang trọng cho người thân, đối tác, khách hàng vào các dịp lễ Tết.\n💫 Ưu điểm:\nHoa văn in men cao cấp, không phai, không bong tróc.\nDễ vệ sinh, chịu được nhiệt độ cao.\nVẻ đẹp nghệ thuật tinh xảo, thích hợp với nhiều không gian nội thất khác nhau.',1),(28,12,'Bát hương Phúc Lộc','https://res.cloudinary.com/dcmwz0uis/image/upload/v1773801851/RD060723-2-removebg-preview_vnbzkb.png','Thiên Long',0,'Nguyên liệu chính để tạo nên bát hương hay một vật phẩm linh thiêng khác cho ban thờ được nhiều người tin dùng đó chính là gốm chất lượng cao.\nChỉ với những cục đất sét, những người thợ gốm lành nghề có thể tạo nên những bát hương vừa sang trọng vừa uy nghiêm.\nVì được sản xuất bởi những những bàn tay điêu luyện của các nghệ nhân nên sản phẩm sở hữu độ bền rất cao, không dễ bị phai màu hay sứt mẻ.',1),(29,12,'Bát hương An Khang','https://res.cloudinary.com/dcmwz0uis/image/upload/v1773802048/bat-huong-vuot-tay-ve-sen-bat-trang-14-removebg-preview_m665rp.png','Thiên Long',0,'Bát hương An Khang mang ý nghĩa bình an, sức khỏe và thuận hòa.',1),(30,12,'Bát hương Tài Lộc','https://res.cloudinary.com/dcmwz0uis/image/upload/v1773804534/16_oclfhw.png','Thiên Long',0,'Bát hương màu vàng vẽ ánh kim 030723 có thiết kế khá nổi bật và gây ấn tượng với nhiều người nhờ màu men vàng sang trọng và vẽ tay ánh kim siêu tinh tế.\nNhững họa tiết hoa văn như rồng bay được vẽ ánh kim vừa mềm mại vừa tăng thêm vẻ sang trọng, cao cấp cho bát hương.\nĐể có thể tạo nên một sản phẩm đẹp hoàn hảo tới vô thực như vậy đòi hỏi tay nghề của người nghệ nhân phải chắc chắn, điêu luyện qua nhiều năm rèn luyện.',1),(31,12,'Bát hương Thiên Phúc','https://res.cloudinary.com/dcmwz0uis/image/upload/v1773804774/hi_w1zoxk.png','Thiên Long',2,'Bát hương Thiên Phúc mang ý nghĩa phúc lành từ trời, phù hợp không gian thờ cúng trang nghiêm.',1),(32,12,'Bát hương Hưng Thịnh','https://res.cloudinary.com/dcmwz0uis/image/upload/v1773805039/1h_wtadu2.png','Minh Long',0,'Bát hương Hưng Thịnh tượng trưng cho sự phát triển bền vững và thịnh vượng lâu dài.',1),(33,13,'Mâm bồng Men Xanh Tím Đắp Nổi Vẽ Vàng Sen Cá ','https://res.cloudinary.com/dcmwz0uis/image/upload/v1773805677/1_pnrsfd.png','Bát Tràng',0,'Mâm bồng sứ Bát Tràng men xanh tím đắp nổi vẽ vàng sen cá là một sản phẩm đồ thờ gốm sứ truyền thống của làng nghề Bát Tràng.\nMâm bồng sứ Bát Tràng là một vật phẩm không thể thiếu trong bộ đồ thờ cúng của người Việt.\nMâm bồng có tác dụng đựng hoa quả, trầu cau, bánh kẹo,… để dâng lên bàn thờ gia tiên, thần linh,… thể hiện lòng thành kính, hiếu thảo của con cháu đối với ông bà, tổ tiên.',1),(34,13,'Mâm bồng Lục bảo','https://res.cloudinary.com/dcmwz0uis/image/upload/v1773817113/th_d3fk3p.png','Bát Tràng',0,'Mâm bồng sứ men xanh ngọc lục bảo rồng phượng là một sản phẩm cao cấp, thể hiện sự sang trọng và đẳng cấp của gia chủ.\nBằng việc lựa chọn loại nguyên liệu chế tác cao cấp, kỹ thuật làm gốm gia truyền và tài năng thiết kế, vẽ hoạ tiết của các nghệ nhân Bát Tràng, đây sẽ là vật phẩm lý tưởng mà gia chủ không nên bỏ qua.',1),(35,13,'Mâm bồng Tài Lộc','https://res.cloudinary.com/dcmwz0uis/image/upload/v1773817512/th-removebg-preview_xewyew.png','Bát Tràng',0,'Mâm bồng trên bàn thờ không chỉ là nơi bày lễ vật mà còn là biểu tượng của lòng hiếu thảo và biết ơn, nhắc nhở con cháu luôn gìn giữ truyền thống “Uống nước nhớ nguồn”. Việc dâng hoa quả, bánh trái lên mâm bồng thể hiện mong ước bình an, phúc lộc và sự phù hộ của tổ tiên cho gia đình.\nĐồng thời, mâm bồng còn mang ý nghĩa đầy đủ và viên mãn, thu hút tài lộc và may mắn đến với gia chủ.',1),(36,14,'Lục bình Phúc Lộc','https://res.cloudinary.com/dcmwz0uis/image/upload/v1773818260/thum-removebg-preview_f0xndm.png','Bát Tràng',0,'Nổi bật ở phần thân lọ là 4 bức tranh miêu tả về 4 mùa Xuân Hạ Thu Đông với những hình ảnh về loài hoa, loài cây, loài vật tương ứng của mỗi mùa.\nMùa xuân là mùa của những sự khởi đầu, hi vọng tốt đẹp về tương lai, tài lộc, hạnh phúc lứa đôi được thể hiện bằng hình ảnh của loài hoa mai và đôi công với bộ lông trải dài lộng lẫy.\nMùa hạ là hình ảnh của loài trúc xanh mướt quanh năm biểu tượng của phẩm chất con người: kiên cường, rắn rỏi đồng thời cũng mang ý nghĩa về sức khỏe, về sự may mắn, trường thọ.\nMùa thu với hình ảnh ấm áp rực rỡ của loài hoa cúc biểu tượng của sự cao sang quyền quý với ý nghĩa về sự cát tường, tài lộc và thịnh vượng.\nMùa đông là mùa của sự khắc nghiệt, nổi bật lên hình ảnh của loài Tùng mạnh mẽ, khỏe khoắn biểu tượng của khí tiết và sự trường thọ.   ',1),(37,14,'Lục bình Tùng Hạc Ngũ Phúc ','https://res.cloudinary.com/dcmwz0uis/image/upload/v1773818673/thum1-removebg-preview_gqxsgp.png','Bát Tràng',0,' Đáng được chú ý nhất chính là họa tiết Tùng Hạc Ngũ Phúc được vẽ rất tỉ mỉ, khéo léo từ đôi tay những nghệ nhân Bát Tràng.\nChi tiết Tùng Hạc Ngũ Phúc  được vẽ lên trên thân lọ là  hình ảnh rất tinh tế.\nÝ nghĩa ngũ phúc là tượng trưng cho 5 điều tốt lành may mắn trong cuộc sống Lộc bình bát tràng ngũ phúc có là tượng trưng cho sự mới mẻ, mang lại may mắn, phát tài phát lộc cho gia chủ, đồng thời cũng có ý nghĩa là sự bảo quản tài sản cho gia chủ.',1),(38,14,'Lục bình Bát Tràng men lam Đức Phúc','https://res.cloudinary.com/dcmwz0uis/image/upload/v1773819006/thumm-removebg-preview_tz1uck.png','Bát Tràng',0,'Lọ lộc bình Bát Tràng này nổi bật lên hình ảnh hai chữ Đức Phúc được vẽ tay cách điệu theo lối viết thư pháp lồng vào cuốn thư tạo cảm giác trang trọng và truyền thống.\nTrên cổ lọ lộc bình là 2 câu đối:\n‘’ Đức thừa tiên tổ thiên niên thịnh\n  Phúc ấm nhi tôn bách thế vinh’’\nCâu đối là lời răn dạy của tổ tiên về giá trị của đạo đức, răn dạy con cháu lễ nghĩa làm người, biết ơn thành kính với tổ tiên cha mẹ.\nPhúc Đức đời trước đi liền với hiếu hạnh đời sau sẽ hưởng vinh hoa phú quý to lớn muôn đời cho cả dòng họ. ',1),(39,14,'Lục bình Tùng Hạc Diên Niên','https://res.cloudinary.com/dcmwz0uis/image/upload/v1773819294/tmh-removebg-preview_lsobgf.png','Bát Tràng',0,'Lục bình Tùng Hạc Diên Niên tượng trưng cho trường thọ, sức khỏe và sự bền vững.',1),(40,14,'Lục bình Vinh Quy Bái Tổ ','https://res.cloudinary.com/dcmwz0uis/image/upload/v1773819660/tmhhh-removebg-preview_xue0e4.png','Bát Tràng',0,'Lọ Lộc bình Bát Tràng men lam Vinh Quy Bái Tổ có ý nghĩa sâu sắc như đạo lý ‘’Uống nước nhớ nguồn’’ nhắc nhở những người con đi học, đi làm xa quê hương khi khi thành danh phải luôn nhớ và thể hiện lòng thành kính, biết ơn quê hương đất tổ, nơi mình đã sinh ra và lớn lên.',1),(41,15,'Tượng Cặp Kỳ Lân','https://res.cloudinary.com/dcmwz0uis/image/upload/v1773820271/kilan_thumb_uq3cmb.png','Minh Long I',5,'Kỳ lân là một trong tứ linh (long, lân, quy, phụng), vốn được xem là linh vật xua đuổi tà ma, hóa giải tam sát và mang đến điềm lành, được người phương Đông đặc biệt trân quý.\nTượng kỳ lân tám màu của Minh Long I là tác phẩm mỹ nghệ hiện thực hóa sinh động nét văn hóa dân gian vốn có nhưng không kém phần vương giả, hiện đại.',1),(42,15,'Tượng Chuột Phong Thủy','https://res.cloudinary.com/dcmwz0uis/image/upload/v1773820414/tmhun_ympmgn.png','Minh Long II',2,'Tượng Chuột tượng trưng cho sự thông minh, nhanh nhẹn và khả năng tích lũy tài lộc.',1),(43,15,'Tượng Rắn Thanh Xà','https://res.cloudinary.com/dcmwz0uis/image/upload/v1773820584/ran1_vgqqxu.png','Minh Long I',2,'Tượng Rắn biểu tượng cho trí tuệ, sự khéo léo và khả năng thích nghi trong cuộc sống.',1),(44,15,'Tượng Bảo Mã Phong Thủy','https://res.cloudinary.com/dcmwz0uis/image/upload/v1773820771/th11_iuziq8.png','Minh Long II',0,'Từ thuở xa xưa, Ngựa là biểu tượng của ý chí, sức mạnh, trí tuệ và lòng trung thành.\nKhông chỉ đồng hành cùng các bậc quân vương, tráng sĩ xông pha trận mạc, Ngựa còn gắn bó với con người trên hành trình khai phá và mở mang bờ cõi.\nỞ loài vật này, hội tụ sức mạnh của thể lực, sự bền bỉ của ý chí cũng như vẻ đẹp khôi ngô tuấn tú.\nBởi thế, trong sử thi nhân loại, duy chỉ Ngựa mới được gọi là “tuấn mã”. ',1),(45,15,'Tượng Rồng Long Phù Đại Khánh','https://res.cloudinary.com/dcmwz0uis/image/upload/v1773821091/tai-xuong-90-edd3af80-c18a-4cdf-a915-cd018685d692_fatup3.png','Minh Long I',0,'Long Phù Đại Khánh kết hợp dáng đứng uy phong của Rồng thần cùng dáng hình thiêng liêng của đất nước.\nVới tư thế hiên ngang, lớp vảy long lanh rực rỡ, Rồng thần mang theo sứ mệnh cao cả và nhân văn: bảo vệ giang sơn, giữ vững cơ đồ, mang lại phúc lành cùng sự thịnh vượng.\nChế tác còn nổi bật với chi tiết mỏ vàng tượng trưng cho báu vật thiên nhiên đã ban tặng cho đất nước, cũng là kết tinh lao động sáng tạo của con người Việt Nam.\nDưới đôi tay tài hoa của các nghệ nhân Minh Long giàu kinh nghiệm, tượng Rồng Long Phù Đại Khánh còn tái hiện vẻ đẹp thiên nhiên hùng vĩ, nên thơ.\nGiữa nắng vàng rực rỡ và biển cả bao la, Rồng mang nguồn năng lượng dồi dào của đất trời, trao truyền sức mạnh để tiếp tục gìn giữ, phát huy những giá trị tinh hoa của văn hóa, con người và đất nước.',1),(46,16,'Tượng cô gái gốm','https://res.cloudinary.com/dcmwz0uis/image/upload/v1773821674/thutm-removebg-preview_puu3ht.png','Fixory',10,'Tượng cô gái gốm mang vẻ đẹp nhẹ nhàng, thanh lịch, phù hợp trang trí phòng khách, kệ sách hoặc bàn làm việc.',1),(47,16,'Tượng chim gốm nghệ thuật','https://res.cloudinary.com/dcmwz0uis/image/upload/v1773821875/mtmtm-removebg-preview_iyllo2.png','Bát Tràng',4,'Tượng chim gốm mang ý nghĩa tự do và nhẹ nhàng, phù hợp decor không gian sống hiện đại.',1),(48,16,'Tượng voi gốm decor','https://res.cloudinary.com/dcmwz0uis/image/upload/v1773822165/voi_tht-removebg-preview_iowdft.png','Bát Tràng',5,'Tượng voi gốm mang phong cách trang trí hiện đại, biểu tượng cho sự bền bỉ và may mắn.',1),(49,16,'Tượng Gà Đại Các','https://res.cloudinary.com/dcmwz0uis/image/upload/v1773822733/ga_kiv27f.png','Bát Tràng',5,'Tượng gà gốm mang phong cách tối giản, tạo điểm nhấn tinh tế cho không gian sống.',1),(50,17,'Bình hoa Đại Các','https://res.cloudinary.com/dcmwz0uis/image/upload/v1773823016/mtmt_ayvor6.webp','Bát Tràng',14,'Ưu điểm nổi bật\n✔️ Chất lượng gốm sứ cao cấp: Được nung ở nhiệt độ cao, đảm bảo độ bền, không dễ nứt vỡ, an toàn với môi trường.\n✔️ Hoa văn vẽ tay tinh xảo: Mỗi sản phẩm là một tác phẩm nghệ thuật độc nhất, không trùng lặp.\n✔️ Kích thước 41 cm cân đối: Phù hợp cho nhiều không gian trang trí khác nhau từ phòng khách, phòng làm việc đến sảnh lễ tân.\n✔️ Phù hợp làm quà tặng cao cấp: Gửi gắm giá trị thẩm mỹ và sang trọng cho người nhận.',1),(51,17,'Bình hoa trang trí - Hoa Đào','https://res.cloudinary.com/dcmwz0uis/image/upload/v1773823151/haha_cdbbmz.webp','Bát Tràng',90,'• Sản phẩm được sản xuất từ nguyên liệu đất sét tinh tuyển, được chọn lọc và qua các quy trình sản xuất chuyên nghiệp, kỹ thuật cao, cùng với sự tâm huyết của các nghệ nhân, đảm bảo độ bền vững cao và sử dụng lâu dài.\n• Sản phẩm được nung ở nhiệt độ cao (từ 1260℃ đến 1380℃) giúp loại bỏ tạp chất, đảm bảo an toàn cho sức khoẻ người tiêu dùng.\n• Bề mặt sản phẩm trắng sáng và không bị ố vàng sau một thời gian sử dụng. Điều này làm cho sản phẩm sứ Minh Long trở thành lựa chọn hàng đầu cho các gia đình và doanh nghiệp khi muốn trang trí không gian sống hoặc sử dụng trong các bữa tiệc quan trọng.\n• Sản phẩm được sản xuất với độ chính xác cao, tinh tế trong từng chi tiết, đảm bảo độ hoàn hảo tuyệt đối.\n• Công nghệ Nano giúp bề mặt sứ mịn, bền đẹp, kháng khuẩn, chống bám bẩn giúp dễ dàng vệ sinh.',1),(52,17,'Bình hoa - Hoa sen nền Vàng','https://res.cloudinary.com/dcmwz0uis/image/upload/v1773823508/sen_xqxoi8.webp','Bát Tràng',83,'Bình hoa họa tiết hoa sen mang đậm nét truyền thống Việt.\nLƯU Ý SỬ DỤNG BẢO QUẢN:\n• Sản phẩm có thể được sử dụng trong nhiều mục đích khác nhau, từ trang trí nhà cửa, phòng khách, phòng ngủ, phòng ăn cho đến các không gian công cộng, khách sạn, nhà hàng, quán cà phê.\n• Sản phẩm được thiết kế đa dạng về kiểu dáng và mẫu mã, phù hợp với nhiều phong cách trang trí khác nhau.\n• Sản phẩm không sử dụng trong lò vi sóng, lò nướng, máy rửa chén.\n• Không dùng sản phẩm để đựng các loại thực phẩm có tính ăn mòn cao như chanh, giấm, muối mặn…, giữ những thực phẩm này không tiếp xúc trực tiếp với những vùng sản phẩm được trang trí bằng kim loại quý (vàng, bạch kim)\n• Không nung trực tiếp sản phẩm trên lửa.\n• Làm sạch sản phẩm bằng vải mềm, miếng tẩy rửa và dung dịch tẩy rửa thông thường',1);
UNLOCK TABLES;

--
-- Table structure for table `TaiKhoan`
--

DROP TABLE IF EXISTS `TaiKhoan`;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=180001;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `TaiKhoan`
--

LOCK TABLES `TaiKhoan` WRITE;
INSERT INTO `TaiKhoan` (`MaTaiKhoan`, `Username`, `Email`, `Password`, `MaPhanQuyen`, `TrangThai`) VALUES (1,'admin','admin@ceramicshop.vn','$2a$12$aSFyRPFhsl9iTtCSjfSh/.MfIJm2CFpvmMH3jZoexgOMaZy4gHV9W',1,1),(2,'staff01','staff01@ceramicshop.vn','$2a$12$aSFyRPFhsl9iTtCSjfSh/.MfIJm2CFpvmMH3jZoexgOMaZy4gHV9W',2,1),(3,'staff007','anh95693@st.vimaru.edu.vn','$2a$12$aSFyRPFhsl9iTtCSjfSh/.MfIJm2CFpvmMH3jZoexgOMaZy4gHV9W',2,1),(4,'khachhang1','tranduy7281@gmail.com','$2b$12$funWBM39MLyRflfoKtw/ie6rD0ey4TEI2HoQGPhgwtv3Z5dQXYIxC',3,1),(5,'khachhang2','khachhang2@gmail.com','$2a$12$aSFyRPFhsl9iTtCSjfSh/.MfIJm2CFpvmMH3jZoexgOMaZy4gHV9W',3,1),(6,'khachhang3','khachhang3@gmail.com','$2a$12$aSFyRPFhsl9iTtCSjfSh/.MfIJm2CFpvmMH3jZoexgOMaZy4gHV9W',3,1),(7,'khachhang4','khachhang4@gmail.com','$2a$12$aSFyRPFhsl9iTtCSjfSh/.MfIJm2CFpvmMH3jZoexgOMaZy4gHV9W',3,1),(8,'khachhang5','khachhang5@gmail.com','$2a$12$aSFyRPFhsl9iTtCSjfSh/.MfIJm2CFpvmMH3jZoexgOMaZy4gHV9W',3,1),(9,'khachhang6','khachhang6@gmail.com','$2a$12$aSFyRPFhsl9iTtCSjfSh/.MfIJm2CFpvmMH3jZoexgOMaZy4gHV9W',3,1),(10,'khachhang7','khachhang7@gmail.com','$2a$12$aSFyRPFhsl9iTtCSjfSh/.MfIJm2CFpvmMH3jZoexgOMaZy4gHV9W',3,1),(11,'khachhang8','khachhang8@gmail.com','$2a$12$aSFyRPFhsl9iTtCSjfSh/.MfIJm2CFpvmMH3jZoexgOMaZy4gHV9W',3,1),(12,'khachhang9','khachhang9@gmail.com','$2a$12$aSFyRPFhsl9iTtCSjfSh/.MfIJm2CFpvmMH3jZoexgOMaZy4gHV9W',3,1),(13,'khachhang10','khachhang10@gmail.com','$2a$12$aSFyRPFhsl9iTtCSjfSh/.MfIJm2CFpvmMH3jZoexgOMaZy4gHV9W',3,1),(14,'khachhang11','khachhang11@gmail.com','$2a$12$aSFyRPFhsl9iTtCSjfSh/.MfIJm2CFpvmMH3jZoexgOMaZy4gHV9W',3,1),(15,'khachhang12','khachhang12@gmail.com','$2a$12$aSFyRPFhsl9iTtCSjfSh/.MfIJm2CFpvmMH3jZoexgOMaZy4gHV9W',3,1),(16,'khachhang13','khachhang13@gmail.com','$2a$12$aSFyRPFhsl9iTtCSjfSh/.MfIJm2CFpvmMH3jZoexgOMaZy4gHV9W',3,1),(17,'khachhang14','khachhang14@gmail.com','$2a$12$aSFyRPFhsl9iTtCSjfSh/.MfIJm2CFpvmMH3jZoexgOMaZy4gHV9W',3,1),(18,'khachhang15','khachhang15@gmail.com','$2a$12$aSFyRPFhsl9iTtCSjfSh/.MfIJm2CFpvmMH3jZoexgOMaZy4gHV9W',3,1),(19,'khachhang16','khachhang16@gmail.com','$2a$12$aSFyRPFhsl9iTtCSjfSh/.MfIJm2CFpvmMH3jZoexgOMaZy4gHV9W',3,1),(20,'khachhang17','khachhang17@gmail.com','$2a$12$aSFyRPFhsl9iTtCSjfSh/.MfIJm2CFpvmMH3jZoexgOMaZy4gHV9W',3,1),(21,'khachhang18','khachhang18@gmail.com','$2a$12$aSFyRPFhsl9iTtCSjfSh/.MfIJm2CFpvmMH3jZoexgOMaZy4gHV9W',3,1),(22,'khachhang19','khachhang19@gmail.com','$2a$12$aSFyRPFhsl9iTtCSjfSh/.MfIJm2CFpvmMH3jZoexgOMaZy4gHV9W',3,1),(23,'khachhang20','khachhang20@gmail.com','$2a$12$aSFyRPFhsl9iTtCSjfSh/.MfIJm2CFpvmMH3jZoexgOMaZy4gHV9W',3,1),(24,'khachhang21','khachhang21@gmail.com','$2a$12$aSFyRPFhsl9iTtCSjfSh/.MfIJm2CFpvmMH3jZoexgOMaZy4gHV9W',3,1),(25,'khachhang22','khachhang22@gmail.com','$2a$12$aSFyRPFhsl9iTtCSjfSh/.MfIJm2CFpvmMH3jZoexgOMaZy4gHV9W',3,1),(26,'khachhang23','khachhang23@gmail.com','$2a$12$aSFyRPFhsl9iTtCSjfSh/.MfIJm2CFpvmMH3jZoexgOMaZy4gHV9W',3,1),(27,'khachhang24','khachhang24@gmail.com','$2a$12$aSFyRPFhsl9iTtCSjfSh/.MfIJm2CFpvmMH3jZoexgOMaZy4gHV9W',3,1),(28,'khachhang25','khachhang25@gmail.com','$2a$12$aSFyRPFhsl9iTtCSjfSh/.MfIJm2CFpvmMH3jZoexgOMaZy4gHV9W',3,1),(29,'khachhang26','khachhang26@gmail.com','$2a$12$aSFyRPFhsl9iTtCSjfSh/.MfIJm2CFpvmMH3jZoexgOMaZy4gHV9W',3,1),(30,'khachhang27','khachhang27@gmail.com','$2a$12$aSFyRPFhsl9iTtCSjfSh/.MfIJm2CFpvmMH3jZoexgOMaZy4gHV9W',3,1),(31,'khachhang28','khachhang28@gmail.com','$2a$12$aSFyRPFhsl9iTtCSjfSh/.MfIJm2CFpvmMH3jZoexgOMaZy4gHV9W',3,1),(32,'khachhang29','khachhang29@gmail.com','$2a$12$aSFyRPFhsl9iTtCSjfSh/.MfIJm2CFpvmMH3jZoexgOMaZy4gHV9W',3,1),(33,'khachhang30','khachhang30@gmail.com','$2a$12$aSFyRPFhsl9iTtCSjfSh/.MfIJm2CFpvmMH3jZoexgOMaZy4gHV9W',3,1),(34,'khachhang31','khachhang31@gmail.com','$2a$12$aSFyRPFhsl9iTtCSjfSh/.MfIJm2CFpvmMH3jZoexgOMaZy4gHV9W',3,1),(35,'khachhang32','khachhang32@gmail.com','$2a$12$aSFyRPFhsl9iTtCSjfSh/.MfIJm2CFpvmMH3jZoexgOMaZy4gHV9W',3,1),(36,'khachhang33','khachhang33@gmail.com','$2a$12$aSFyRPFhsl9iTtCSjfSh/.MfIJm2CFpvmMH3jZoexgOMaZy4gHV9W',3,1),(37,'khachhang34','khachhang34@gmail.com','$2a$12$aSFyRPFhsl9iTtCSjfSh/.MfIJm2CFpvmMH3jZoexgOMaZy4gHV9W',3,1),(38,'khachhang35','khachhang35@gmail.com','$2a$12$aSFyRPFhsl9iTtCSjfSh/.MfIJm2CFpvmMH3jZoexgOMaZy4gHV9W',3,1),(39,'khachhang36','khachhang36@gmail.com','$2a$12$aSFyRPFhsl9iTtCSjfSh/.MfIJm2CFpvmMH3jZoexgOMaZy4gHV9W',3,1),(40,'khachhang37','khachhang37@gmail.com','$2a$12$aSFyRPFhsl9iTtCSjfSh/.MfIJm2CFpvmMH3jZoexgOMaZy4gHV9W',3,1),(41,'khachhang38','khachhang38@gmail.com','$2a$12$aSFyRPFhsl9iTtCSjfSh/.MfIJm2CFpvmMH3jZoexgOMaZy4gHV9W',3,1),(42,'khachhang39','khachhang39@gmail.com','$2a$12$aSFyRPFhsl9iTtCSjfSh/.MfIJm2CFpvmMH3jZoexgOMaZy4gHV9W',3,1),(43,'khachhang40','khachhang40@gmail.com','$2a$12$aSFyRPFhsl9iTtCSjfSh/.MfIJm2CFpvmMH3jZoexgOMaZy4gHV9W',3,1),(44,'khachhang41','khachhang41@gmail.com','$2a$12$aSFyRPFhsl9iTtCSjfSh/.MfIJm2CFpvmMH3jZoexgOMaZy4gHV9W',3,1),(30001,'customer_testing7','duyanh123456@gmail.com','$2b$12$a5ES9ttdzN2eTI7ngoZ9GOvZV6GJRxLyu6xo1/1GeZNJA7HriRsoa',3,1),(60001,'duyanh','phap96130@st.vimaru.edu.vn','$2b$12$quR3ODhzl5.ZN8s5hpxuS.5vbD4vSFGzxXYAS3XZc5G4q1Jr/QqFq',3,1),(90001,'laptopprocenter_2942','laptopprocenter@gmail.com',NULL,3,1),(120001,'vuquocphap10082004_6443','vuquocphap10082004@gmail.com','$2b$12$uqZuZfOkx3ALjg9bxsJHIeqnsWbwbspQReJqpch/kc99iwcuvtUDy',3,1),(150001,'vunam10082004_9652','vunam10082004@gmail.com',NULL,3,1);
UNLOCK TABLES;

--
-- Table structure for table `TaiKhoanProvider`
--

DROP TABLE IF EXISTS `TaiKhoanProvider`;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=30001;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `TaiKhoanProvider`
--

LOCK TABLES `TaiKhoanProvider` WRITE;
INSERT INTO `TaiKhoanProvider` (`MaProvider`, `MaTaiKhoan`, `Provider`, `ProviderID`, `CreatedAt`) VALUES (1,120001,'google','114542695358679210614','2026-03-30 17:03:49');
UNLOCK TABLES;

--
-- Table structure for table `ThuocTinh`
--

DROP TABLE IF EXISTS `ThuocTinh`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ThuocTinh` (
  `MaThuocTinh` int NOT NULL AUTO_INCREMENT,
  `TenThuocTinh` varchar(100) NOT NULL,
  PRIMARY KEY (`MaThuocTinh`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=30002;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ThuocTinh`
--

LOCK TABLES `ThuocTinh` WRITE;
INSERT INTO `ThuocTinh` (`MaThuocTinh`, `TenThuocTinh`) VALUES (1,'Dung tích / Kích thước'),(2,'Màu sắc / Họa tiết'),(3,'Chất liệu'),(4,'Hoa văn'),(5,'Phong cách'),(6,'Loại sản phẩm');
UNLOCK TABLES;

--
-- Table structure for table `TinTuc`
--

DROP TABLE IF EXISTS `TinTuc`;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=30002;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `TinTuc`
--

LOCK TABLES `TinTuc` WRITE;
INSERT INTO `TinTuc` (`MaTinTuc`, `MaNhanVien`, `TieuDe`, `NoiDung`, `HinhAnh`, `NgayTao`, `TrangThai`) VALUES (1,2,'Hướng Dẫn Toàn Tập: Cách Phân Biệt Gốm Sứ Bát Tràng Thật Và Giả Chuẩn Xác Nhất 2026','<p>Gốm sứ Bát Tràng từ lâu đã nổi danh với độ bền bỉ, nước men sâu thẳm và hoa văn tinh xảo mang đậm hồn cốt văn hóa Việt. Tuy nhiên, sự phát triển của thị trường đã kéo theo hệ lụy là hàng giả, hàng nhái, hàng Trung Quốc kém chất lượng \"đội lốt\" gốm Bát Tràng tràn lan. Để bảo vệ sức khỏe gia đình và tránh cảnh \"tiền mất tật mang\", CeramicShop gửi đến bạn cẩm nang phân biệt gốm sứ Bát Tràng thật - giả chuẩn xác nhất.</p>\n\n<h3>1. Nghe Âm Thanh Phản Hồi Từ Gốm</h3>\n<p>Một trong những đặc trưng nổi bật nhất của gốm Bát Tràng chính là nhiệt độ nung. Đất sét được tuyển chọn kỹ lưỡng và nung ở nhiệt độ rất cao (thường từ 1200°C đến 1380°C). Quá trình này giúp cốt gốm nóng chảy, liên kết chặt chẽ và loại bỏ hoàn toàn các tạp chất, kim loại nặng (như chì, cadmium).\nCách thử: Bạn dùng ngón tay hoặc một thanh gỗ nhỏ gõ nhẹ vào thành bát, đĩa. Nếu là gốm Bát Tràng chuẩn, âm thanh phát ra sẽ rất đanh, vang và thanh mảnh như tiếng kim loại (keng keng). Ngược lại, hàng giả nung ở nhiệt độ thấp sẽ phát ra âm thanh đục, trầm và nặng.</p>\n\n<h3>2. Quan Sát Lớp Men Sứ</h3>\n<p>Nước men là linh hồn của sản phẩm. Người nghệ nhân Bát Tràng phủ men trước khi đưa vào lò nung, khiến lớp men tan chảy và bao bọc lấy hoa văn. Do đó, men gốm Bát Tràng thật sờ vào luôn có cảm giác nhẵn thính, căng bóng và có chiều sâu. Dù sử dụng nhiều năm, lớp men vẫn không bị ngả màu hay trầy xước dễ dàng. Hàng Trung Quốc thường dán decal hoa văn rồi phủ men bóng lạnh nhẹ, sờ vào có thể thấy gợn tay, dùng một thời gian sẽ bị xỉn màu và ố vàng.</p>\n\n<h3>3. Chi Tiết Hoa Văn: Sự Bất Hoàn Hảo Hoàn Mỹ</h3>\n<p>Điểm giá trị nhất của gốm Bát Tràng là họa tiết được vẽ thủ công 100% bằng tay bởi các nghệ nhân lão luyện. Dù cùng một mẫu thiết kế (ví dụ họa tiết hoa sen, tùng cúc trúc mai), nhưng khi bạn so sánh hai chiếc bát cùng loại, các nét vẽ sẽ không bao giờ giống nhau hoàn toàn 100%. Nét vẽ có độ thanh đậm, nhấn nhá đậm chất nghệ thuật. Trái lại, gốm in decal công nghiệp sẽ có hoa văn giống hệt nhau như đúc, đường nét cứng nhắc, đôi khi màu sắc lại sặc sỡ đến mức thiếu tự nhiên.</p>\n\n<h3>4. Độ Dày Và Trọng Lượng</h3>\n<p>Hãy cầm sản phẩm lên tay! Gốm Bát Tràng được làm thủ công, vuốt tay nên cốt đất rất dày dặn. Khi cầm, bạn sẽ thấy đầm tay, nặng và vô cùng chắc chắn. Độ dày này cũng là yếu tố giúp bát đĩa Bát Tràng giữ nhiệt tốt hơn và khó bị mẻ khi va đập nhẹ. Hàng công nghiệp đúc khuôn thường rất mỏng, nhẹ và mong manh.</p>\n<p>Hi vọng với những bí quyết trên, quý khách hàng có thể tự tin lựa chọn cho gia đình những bộ đồ ăn, ấm chén Bát Tràng chính hãng. CeramicShop cam kết 100% sản phẩm tại cửa hàng đều có nguồn gốc rõ ràng, bảo hành men sứ chính hãng.</p>','https://res.cloudinary.com/dcmwz0uis/image/upload/v1773823508/14f53a9f-2cd4-4881-9045-e96ccafe5bf0_tzc5zy.webp','2026-01-15 09:30:00',1),(2,2,'Tuyệt Chiêu Xử Lý Và Bảo Quản Nồi Sứ Dưỡng Sinh HealthyCook Đúng Cách Lần Đầu Sử Dụng','<p>Nồi sứ dưỡng sinh HealthyCook là cuộc cách mạng trong gian bếp hiện đại, mang lại những bữa ăn ngon khỏe nhờ cơ chế phát tia hồng ngoại làm chín thực phẩm từ bên trong. Để chiếc nồi \"thần thánh\" này luôn bền đẹp, không nứt vỡ và phát huy tối đa công dụng, việc \"tôi nồi\" (xử lý lần đầu) và bảo quản đúng cách là vô cùng quan trọng.</p>\n\n<h3>Bước 1: \"Tôi Nồi\" Sứ - Nghi Thức Bắt Buộc Lần Đầu Tiên</h3>\n<p>Khác với nồi kim loại, nồi sứ có những lỗ chân lông siêu nhỏ trên bề mặt mà mắt thường không thấy được. Việc \"tôi nồi\" giúp lấp đầy các mao mạch này, tăng khả năng chịu nhiệt và chống nứt vỡ cục bộ.\n- <b>Cách thực hiện:</b> Khi mới mua về, rửa sạch nồi bằng nước rửa chén pha loãng. Sau đó, đổ nước vo gạo (hoặc pha một chút bột năng/bột mì vào nước) vào khoảng 2/3 nồi. Đun sôi hỗn hợp trên lửa nhỏ liu riu trong khoảng 10-15 phút. Tắt bếp, để nồi nguội hoàn toàn tự nhiên rồi mới đổ bỏ nước và rửa lại. Lớp tinh bột sẽ tạo thành một lớp màng bảo vệ vững chắc cho nồi.</p>\n\n<h3>Bước 2: Nguyên Tắc \"Sốc Nhiệt\" - Kẻ Thù Số 1 Của Nồi Sứ</h3>\n<p>Dù HealthyCook chịu nhiệt rất tốt, nhưng sự thay đổi nhiệt độ đột ngột (sốc nhiệt) vẫn là điều tối kỵ.\n- <b>Không bao giờ</b> đặt nồi vừa lấy ra từ tủ lạnh lên bếp đang đỏ lửa. Hãy để nồi ra ngoài khoảng 15 phút cho hạ nhiệt độ về mức phòng.\n- <b>Không bao giờ</b> đổ nước lạnh buốt vào nồi khi nồi đang nóng rực trên bếp. Nếu cần châm thêm nước khi đang nấu canh/hầm, hãy dùng nước ấm hoặc nước sôi.\n- Khi nấu xong, hãy đặt nồi lên một chiếc rế lót nồi bằng gỗ hoặc vải, tránh đặt trực tiếp xuống mặt bàn đá granite hoặc nền gạch hoa lạnh lẽo.</p>\n\n<h3>Bước 3: Điều Chỉnh Ngọn Lửa \"Vừa Đủ\"</h3>\n<p>Nồi sứ dưỡng sinh giữ nhiệt cực kỳ khủng khiếp. Bạn không cần thiết phải dùng lửa quá to như nấu bằng nồi nhôm/inox. Hãy bắt đầu với mức lửa vừa, khi nước trong nồi bắt đầu sôi, hãy vặn lửa về mức nhỏ nhất. Thức ăn sẽ tự chín mềm từ bên trong, nước dùng trong vắt, không sủi bọt trào ra ngoài và đặc biệt tiết kiệm gas/điện đáng kể.</p>\n\n<h3>Bước 4: Vệ Sinh Chăm Sóc Đúng Chuẩn</h3>\n<p>Tuyệt đối không dùng búi sắt cọ nồi cứng để chà xát. Lớp men nano của Minh Long rất láng mịn, thức ăn hầu như không bị cháy khét bám dính. Nếu có vết cháy nhỏ, bạn chỉ cần ngâm nồi với nước ấm và một ít baking soda trong 30 phút, vết bẩn sẽ tự bong ra và bạn lau nhẹ bằng miếng bọt biển là sạch bóng.\nChúc các chị em nội trợ có những trải nghiệm tuyệt vời và những bữa cơm đầm ấm bên gia đình cùng nồi sứ HealthyCook!</p>','https://res.cloudinary.com/dcmwz0uis/image/upload/v1773755755/661028464-5-sm-59257d336c3647648efce171d73da346-grande_estsrf.webp','2026-02-05 14:00:00',1),(3,2,'Giải Mã Ý Nghĩa Phong Thủy Của Cặp Lục Bình Tùng Hạc Diên Niên Mang Lại Tài Lộc Cho Gia Chủ','<p>Trong thế giới vật phẩm phong thủy, \"Lục bình\" (hay Lộc bình) luôn chiếm vị trí độc tôn trong việc chiêu tài, giữ lộc. Hình dáng lục bình với phần miệng loe rộng (hút vượng khí), cổ thắt lại (giữ tài lộc không bị thất thoát) và thân phình to (nơi cất giữ của cải) mang ý nghĩa phong thủy vô cùng sâu sắc. Nhưng giá trị thực sự của một cặp lục bình còn nằm ở họa tiết vẽ trên thân bình, và \"Tùng Hạc Diên Niên\" chính là một trong những tuyệt tác mang ý nghĩa tốt lành nhất.</p>\n\n<h3>Hình Ảnh Cây Tùng - Biểu Tượng Của Đấng Quân Tử Và Sự Trường Tồn</h3>\n<p>Cây Tùng thường mọc ở những vùng núi cao, nơi đất đai cằn cỗi và khí hậu khắc nghiệt, hứng chịu sương gió, bão tuyết. Thế nhưng, Tùng vẫn vươn mình xanh tốt, rễ bám sâu vào vách đá. Trong phong thủy, Tùng đại diện cho khí tiết của người quân tử, kiên cường, bất khuất vượt qua mọi gian nan thử thách. Trưng Lục bình Tùng Hạc trong nhà giúp mang lại năng lượng dương mạnh mẽ, xua đuổi tà khí, giúp gia chủ luôn giữ vững tinh thần thép trên con đường lập nghiệp.</p>\n\n<h3>Chim Hạc - Linh Vật Của Sự Bất Tử Và Thanh Cao</h3>\n<p>Theo truyền thuyết phương Đông, Hạc là loài chim tiên, biểu tượng của sự thanh cao, thuần khiết và trường thọ vô lượng (sống hàng ngàn năm). Hình dáng chim Hạc vươn cổ cất tiếng gáy lên bầu trời tượng trưng cho ý chí vươn lên, sự thăng tiến vượt bậc trong công danh sự nghiệp. Khi Hạc bay vút lên bầu trời, đó là khát vọng tự do và thành đạt.</p>\n\n<h3>Sự Kết Hợp \"Tùng Hạc Diên Niên\"</h3>\n<p>Hai hình ảnh Tùng và Hạc hòa quyện vào nhau tạo nên bức tranh \"Tùng Hạc Diên Niên\" (Tùng Hạc sống thọ cùng năm tháng). Ý nghĩa trọn vẹn của họa tiết này là mong ước về một cuộc sống gia đình bình an, trường thọ, sức khỏe dồi dào, con cháu thảo hiền, tài lộc vĩnh cửu. Sự vững chãi của cây Tùng làm nền tảng cho cánh Hạc bay cao, giống như một gia đạo êm ấm sẽ là hậu phương vững chắc cho sự nghiệp thăng hoa.</p>\n\n<h3>Cách Bài Trí Lục Bình Phong Thủy Chuẩn Nhất</h3>\n<p>Để Lục bình phát huy tối đa công năng, gia chủ nên đặt cặp bình ở những vị trí trang trọng nhất trong nhà như phòng khách, phòng thờ, sảnh lớn công ty.\n- <b>Đặt ở phòng khách:</b> Hai bình được đặt đối xứng hai bên kệ tivi hoặc hai bên cửa chính, mặt hoa văn chính hướng ra ngoài đón sinh khí.\n- <b>Đặt ở phòng thờ:</b> Cặp bình được đặt hai bên bàn thờ gia tiên, vừa tạo sự uy nghiêm, bề thế, vừa thể hiện tấm lòng hiếu kính, mong ông bà phù hộ độ trì cho gia tộc hưng vượng.\n- <b>Lưu ý:</b> Tuyệt đối không đặt Lục bình trong phòng bếp hoặc gần nhà vệ sinh, những nơi ẩm thấp sẽ làm uế tạp nguồn năng lượng của vật phẩm.</p>\n<p>Tại CeramicShop, các dòng Lục bình Tùng Hạc được chế tác thủ công bởi các nghệ nhân Bát Tràng, nung khử ở nhiệt độ cao mang lại nước men lam sâu thẳm, hoa văn đắp nổi sống động như thật. Đây chắc chắn là món quà biếu tân gia, mừng thọ ý nghĩa và đẳng cấp nhất!</p>','https://res.cloudinary.com/dcmwz0uis/image/upload/v1773818677/tung_b6ptoj.jpg','2026-03-10 10:20:00',1);
UNLOCK TABLES;

--
-- Table structure for table `ViKhuyenMai`
--

DROP TABLE IF EXISTS `ViKhuyenMai`;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=90001;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ViKhuyenMai`
--

LOCK TABLES `ViKhuyenMai` WRITE;
INSERT INTO `ViKhuyenMai` (`MaVi`, `MaKhachHang`, `MaKhuyenMai`, `NgayLuu`, `TrangThaiSuDung`) VALUES (1,1,1,'2026-03-26 23:32:42',0),(2,1,3,'2026-03-26 23:32:42',0),(5,3,5,'2026-03-26 23:32:43',0),(60007,2,1,'2026-03-29 09:14:43',1),(60008,2,2,'2026-03-29 09:14:43',0),(60009,2,3,'2026-03-29 09:14:43',0),(60010,2,4,'2026-03-29 09:14:43',0),(60011,2,5,'2026-03-29 09:14:43',0),(60012,2,6,'2026-03-29 09:14:43',0);
UNLOCK TABLES;

--
-- Table structure for table `XuLyDoiTra`
--

DROP TABLE IF EXISTS `XuLyDoiTra`;
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

--
-- Dumping data for table `XuLyDoiTra`
--

LOCK TABLES `XuLyDoiTra` WRITE;
INSERT INTO `XuLyDoiTra` (`MaXuLy`, `MaDoiTra`, `HanhDong`, `GhiChu`, `NgayXuLy`) VALUES (1,1,'Hoàn tiền','Khách gửi trả hàng qua bưu điện, kế toán đã chuyển khoản hoàn 100%.','2026-03-06 00:00:00'),(2,2,'Đổi mới','Đã tạo đơn ship lại sản phẩm mới hoàn toàn miễn phí cho khách.','2026-03-07 00:00:00'),(3,5,'Đổi hàng bù tiền','Khách mang trực tiếp qua cửa hàng để đổi size lớn hơn, thu thêm phụ phí.','2026-03-16 00:00:00'),(4,6,'Hoàn tiền một phần','Thỏa thuận hoàn 20% giá trị, khách giữ lại bát mẻ để trồng cây.','2026-03-13 00:00:00'),(5,8,'Giao bổ sung','Xin lỗi khách và đã tạo mã vận đơn ship hỏa tốc đĩa lót bù.','2026-03-16 00:00:00'),(6,1,'Tiếp nhận','Đang chờ bưu cục hoàn hàng về kho để kiểm định.','2026-03-05 00:00:00'),(7,2,'Xác nhận','Xác nhận lỗi do J&T Express quăng quật hàng hóa.','2026-03-06 00:00:00'),(8,5,'Tiếp nhận','NV tại quầy đã nhận hàng hoàn của khách.','2026-03-15 00:00:00'),(9,6,'Xác nhận','Khách gửi video quay rõ quá trình bóc hộp, xác nhận lỗi.','2026-03-12 00:00:00'),(10,8,'Kiểm tra','Check lại camera khâu đóng gói xác nhận nhân viên bỏ sót.','2026-03-16 00:00:00');
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-31  0:12:48
