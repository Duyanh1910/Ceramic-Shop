INSERT INTO DanhMucSanPham (MaDanhMuc, TenDanhMuc, MoTa, ParentID) VALUES
(1, 'Đồ phòng bếp', 'Các sản phẩm gốm sứ dùng cho nhà bếp và bàn ăn', NULL),
(2, 'Đồ phòng khách', 'Gốm sứ tiếp khách và trưng bày', NULL),
(3, 'Đồ thờ', 'Vật phẩm thờ cúng tâm linh', NULL),
(4, 'Đồ phong thủy', 'Vật phẩm phong thủy tài lộc', NULL),
(5, 'Đồ trang trí', 'Các sản phẩm trang trí nội thất', NULL);


INSERT INTO DanhMucSanPham (MaDanhMuc, TenDanhMuc, MoTa, ParentID) VALUES
(6, 'Bộ đồ ăn', 'Bát đĩa tô chén trọn bộ', 1),
(7, 'Bát / Chén lẻ', 'Các loại bát chén bán lẻ', 1),
(8, 'Sứ dưỡng sinh', 'Nồi chảo ấm bằng sứ chịu nhiệt', 1),

(9, 'Bộ ấm trà', 'Bộ ấm chén tiếp khách', 2),

(10, 'Bát hương', 'Bát hương thờ cúng', 3),
(11, 'Mâm bồng', 'Mâm bồng thờ', 3),

(12, 'Lục bình', 'Cặp lục bình phong thủy', 4),
(13, 'Tượng phong thủy', 'Tượng phong thủy', 4),

(14, 'Tượng gốm', 'Tượng gốm trang trí', 5),
(15, 'Bình hoa', 'Bình hoa trang trí', 5);

INSERT INTO SanPham (MaSanPham, MaDanhMuc, TenSanPham, MoTa) VALUES

(1, 9, 'Bộ trà Camellia',
 'Kỹ lưỡng từ khâu nguyên liệu đến quy trình sản xuất, trau chuốt từ kiểu dáng đến màu sắc hoa văn, bộ bàn ăn Camellia mang phong cách sang trọng, hiện đại mà hiếm sản phẩm nào có được.'),
(2, 9, 'Bộ trà Anna',
 'Không họa tiết rườm rà hay kiểu cách cầu kỳ nhưng Anna vẫn toát lên sự sang trọng, tinh tế cần có của một bộ trà. Anna đa dạng dòng sản phẩm, từ trắng ngà và chỉ vàng đến họa tiết sen quen thuộc nhằm đáp ứng đa dạng sở thích của khách hàng mà vẫn đảm bảo hoàn hảo về kỹ thuật và mỹ thuật, lưu giữ trọn vẹn hương-vị-sắc của trà và là cầu nối gắn kết những mối tình thâm... '),
(3, 9, 'Bộ trà Đài Các',
 'Bộ trà Đài Các toát lên vẻ đẹp kiêu sa, lộng lẫy theo phong cách quyền quý hoàng gia. Bộ sản phẩm có kiểu dáng sang trọng, nhiều đường nét được cách điệu, uốn lượn với dáng điệu mềm mại, mảnh mai.'),

(4, 6, 'Bộ đồ ăn Jasmine',
 'Bức tranh làng quê hiện ra sống động như gom hết thảy không gian, cảnh vật, con người… trên những cánh đồng, những mái nhà tranh, bến nước, chợ quê … vào trong từng sản phẩm của bộ đồ ăn Jasmine'),
(5, 6, 'Bộ đồ ăn Daisy',
 'Mỗi chiếc đĩa, tô, chén… của nhà Daisy đều được tạo hình cân đối, tròn đều, không một vết trầy xước. Sản phẩm được nung ở nhiệt độ cao theo công nghệ của Đức, không chì, camidium, an toàn tuyệt đối cho người sử dụng.'),
(6, 6, 'Bộ đồ ăn Tulip',
 '
Tulip là loài hoa biểu tượng của xứ sở Hà Lan nhưng ngày nay đã được phụ nữ khắp nơi trên thế giới yêu thích bởi nét đẹp vừa giản dị nhưng lại vừa kiêu sa, vừa gần gũi mà cũng có phần xa cách.'),

(7, 15, 'Bình hoa Lộc Phát',
 'Khoác lên vẻ truyền thống, nền nã của loài hoa Á Đông nhưng lại không kém phần tinh tế hiện đại, những cánh sen bung tròn, phúc hậu ôm lấy nhụy đã được tái hiện sống động bằng màu sắc đặc trưng của cung đình Huế.'),
(8, 15, 'Bình hoa Sen',
 'Bình hoa Sen với thiết kế thanh thoát và họa tiết hoa sen tinh tế, được chế tác từ sứ cao cấp với lớp men mịn đẹp mắt. Sản phẩm thích hợp để cắm hoa hoặc trang trí không gian phòng khách, phòng làm việc, mang lại vẻ đẹp trang nhã và cảm giác thanh bình cho ngôi nhà.'),
(9, 15, 'Bình hoa Kim Ngọc',
 'Bình hoa Kim Ngọc được chế tác từ sứ cao cấp với thiết kế thanh lịch và lớp men sáng bóng. Sản phẩm phù hợp để cắm hoa hoặc trang trí không gian phòng khách, mang lại vẻ đẹp sang trọng và tinh tế cho ngôi nhà.'),

(10, 8, 'Nồi sứ Vesta',
 'ĐẶC TÍNH SẢN PHẨM:
- Nấu thực phẩm không cần nước mà vẫn giữ màu sắc rau củ tươi như ban đầu (dưỡng chất còn lại 70 -80%).
- Chiên ở nhiệt độ thấp mà vẫn chín sâu, giòn lâu.
- Nấu chín thức ăn bằng cơ chế phát ra tia hồng ngoại nên hầm nhanh mềm, tạo rất ít váng bọt nên nước trong và thơm hơn, giúp tiết kiệm thời gian và nhiên liệu.
- Sản phẩm được nung ở nhiệt độ cao 1280 độ C giúp sản phẩm không bị rạn men, bung men trong quá trình sử dụng lâu dài.'),
(11, 8, 'Chảo sứ dưỡng sinh',
 'Với chất liệu tinh tuyển từ đất hiếm thiên nhiên, lành tính, không chứa các chất độc hại, Healthycook sở hữu nhiều tính năng nổi bật góp phần đem lại những bữa ăn ngon – lành cho gia đình.'),
(12, 8, 'Ấm nước dưỡng sinh',
 'Với chất liệu tinh tuyển từ đất hiếm thiên nhiên, lành tính, không chứa các chất độc hại, Healthycook sở hữu nhiều tính năng nổi bật góp phần đem lại những bữa ăn ngon – lành cho gia đình.'),

-- Tượng gốm (MaDanhMuc = 14)
(13, 14, 'Tượng cô gái gốm', 'Tượng trang trí mang vẻ đẹp dịu dàng và tinh tế'),
(14, 14, 'Tượng cá chép gốm', 'Biểu tượng may mắn và thịnh vượng'),
(15, 14, 'Tượng thiên nga gốm', 'Biểu tượng của sự thanh lịch và tình yêu'),

-- Bát hương (MaDanhMuc = 10)
(16, 10, 'Bát hương men lam', 'Bát hương họa tiết truyền thống'),
(17, 10, 'Bát hương rồng nổi', 'Chạm khắc rồng nổi tinh xảo'),
(18, 10, 'Bát hương men rạn', 'Men rạn cổ điển'),

-- Mâm bồng (MaDanhMuc = 11)
(19, 11, 'Mâm bồng men lam', 'Mâm bồng họa tiết truyền thống'),
(20, 11, 'Mâm bồng vẽ vàng', 'Mâm bồng trang trí vàng sang trọng'),
(21, 11, 'Mâm bồng họa tiết sen', 'Mâm bồng trang trí hoa sen'),

-- Lục bình (MaDanhMuc = 12)
(22, 12, 'Lục bình Phúc Lộc Thọ', 'Biểu tượng phúc lộc thọ'),
(23, 12, 'Lục bình Tứ quý', 'Trang trí tứ quý bốn mùa'),
(24, 12, 'Lục bình Công đào', 'Họa tiết chim công và hoa đào'),

-- Tượng phong thủy (MaDanhMuc = 13)
(25, 13, 'Tượng Di Lặc', 'Mang lại niềm vui và tài lộc'),
(26, 13, 'Tượng Thần Tài', 'Biểu tượng tài lộc'),
(27, 13, 'Tượng Cá chép hóa rồng', 'Biểu tượng thành công và thăng tiến');

INSERT INTO BienTheSanPham (MaBienThe, MaSanPham, TenBienThe, Gia, SoLuong, TrangThai) VALUES

(1,1,'0.5L Trắng',450000,100,1),
(2,1,'0.5L Chỉ vàng',500000,90,1),
(3,1,'0.8L Trắng',720000,50,1),
(4,1,'0.8L Chỉ vàng',720000,50,1),
(5,1,'1.1L Hương biển',2800000,30,1),

(6,2,'0.47L Trắng ngà',550000,80,1),
(7,2,'0.47L An nhiên',1400000,40,1),

(8,3,'0.8L Chỉ vàng',2500000,20,1),
(9,3,'1.3L Chỉ vàng',8600000,20,1),

(10,4,'10 món',1134000,200,1),
(11,4,'23 món',2450000,150,1),

(12,5,'22 món',1400000,60,1),
(13,5,'10 món',800000,30,1),

(14,6,'30 món',4800000,45,1),

(15,7,'20 cm',420000,30,1),
(16,7,'30 cm',1850000,15,1),

(17,8,'25 cm xanh',650000,25,1),
(18,8,'25 cm đỏ',650000,25,1),

(19,9,'15 cm vàng',550000,50,1),
(20,9,'30 cm tứ linh',3840000,50,1),

(21,10,'1L',380000,100,1),
(22,10,'2L',650000,80,1),
(23,10,'3L',890000,50,1),

(24,11,'24 cm',520000,70,1),
(25,11,'28 cm',780000,60,1),

(26,12,'1.5L',450000,45,1),

-- Tượng gốm
(27,13,'30 cm men trắng',350000,40,1),
(28,13,'40 cm men trắng',520000,30,1),

(29,14,'25 cm men xanh',420000,35,1),
(30,14,'35 cm men xanh',650000,20,1),

(31,15,'30 cm men trắng',380000,40,1),
(32,15,'45 cm men trắng',720000,20,1),

-- Bát hương
(33,16,'20 cm',550000,30,1),
(34,16,'25 cm',720000,25,1),

(35,17,'22 cm',820000,20,1),
(36,17,'28 cm',1200000,15,1),

(37,18,'20 cm',600000,25,1),
(38,18,'26 cm',880000,20,1),

-- Mâm bồng
(39,19,'30 cm',650000,30,1),
(40,19,'35 cm',880000,20,1),

(41,20,'30 cm vẽ vàng',1200000,15,1),
(42,20,'40 cm vẽ vàng',1800000,10,1),

(43,21,'30 cm họa tiết sen',720000,20,1),
(44,21,'40 cm họa tiết sen',980000,15,1),

-- Lục bình
(45,22,'60 cm',4500000,10,1),
(46,22,'80 cm',7800000,6,1),

(47,23,'60 cm',4200000,10,1),
(48,23,'80 cm',7600000,6,1),

(49,24,'60 cm',5000000,8,1),
(50,24,'90 cm',9500000,5,1),

-- Tượng phong thủy
(51,25,'25 cm',680000,20,1),
(52,25,'35 cm',1200000,15,1),

(53,26,'20 cm',550000,25,1),
(54,26,'30 cm',950000,20,1),

(55,27,'30 cm',850000,15,1),
(56,27,'45 cm',1400000,10,1);

INSERT INTO ThuocTinh VALUES
(1,'Dung tích / Kích thước'),
(2,'Màu sắc / Họa tiết'),
(3,'Chất liệu');

INSERT INTO GiaTriThuocTinh VALUES

(1,1,'0.5L'),
(2,1,'0.8L'),
(3,1,'1.1L'),
(4,1,'0.47L'),
(5,1,'1.3L'),
(6,1,'10 món'),
(7,1,'23 món'),
(8,1,'22 món'),
(9,1,'30 món'),
(10,1,'20 cm'),
(11,1,'25 cm'),
(12,1,'30 cm'),
(13,1,'1L'),
(14,1,'2L'),
(15,1,'3L'),
(16,1,'24 cm'),
(17,1,'28 cm'),
(18,1,'1.5L'),

(19,2,'Trắng'),
(20,2,'Chỉ vàng'),
(21,2,'Hương biển'),
(22,2,'Trắng ngà'),
(23,2,'An nhiên'),
(24,2,'Xanh'),
(25,2,'Đỏ'),
(26,2,'Vàng'),
(27,2,'Tứ linh'),

(28,3,'Sứ cao cấp'),
(29,3,'Sứ dưỡng sinh'),

(30,1,'22 cm'),
(31,1,'26 cm'),
(32,1,'35 cm'),
(33,1,'45 cm'),
(34,1,'40 cm'),
(35,1,'60 cm'),
(36,1,'80 cm'),
(37,1,'90 cm'),

(38,2,'Men trắng'),
(39,2,'Men xanh'),
(40,2,'Men lam'),
(41,2,'Men rạn'),
(42,2,'Vẽ vàng'),
(43,2,'Họa tiết sen'),
(44,2,'Phúc Lộc Thọ'),
(45,2,'Tứ quý'),
(46,2,'Công đào');

INSERT INTO GiaTriThuocTinh (MaGiaTri, MaThuocTinh, GiaTri) VALUES
(47, 2, 'Sen vàng nền trắng'),
(48, 2, 'Sen vàng nền vàng'),
(49, 2, 'Sen vàng nền xanh ngọc');

INSERT INTO ChiTietBienThe VALUES

-- Bộ trà Camellia
(1,1),(1,19),(1,28),
(2,1),(2,20),(2,28),
(3,2),(3,19),(3,28),
(4,2),(4,20),(4,28),
(5,3),(5,21),(5,28),

-- Bộ trà Anna
(6,4),(6,22),(6,28),
(7,4),(7,23),(7,28),

-- Bộ trà Đài Các
(8,2),(8,20),(8,28),
(9,5),(9,20),(9,28),

-- Bộ đồ ăn Jasmine
(10,6),(10,28),
(11,7),(11,28),

-- Bộ đồ ăn Daisy
(12,8),(12,28),
(13,6),(13,28),

-- Bộ đồ ăn Tulip
(14,9),(14,28),

-- Bình hoa Lộc Phát
(15,10),(15,19),(15,28),
(16,12),(16,20),(16,28),

-- Bình hoa Sen
(17,11),(17,24),(17,28),
(18,11),(18,25),(18,28),

-- Bình hoa Kim Ngọc
(19,10),(19,26),(19,28),
(20,12),(20,27),(20,28),

-- Nồi sứ Vesta
(21,13),(21,29),
(22,14),(22,29),
(23,15),(23,29),

-- Chảo sứ dưỡng sinh
(24,16),(24,29),
(25,17),(25,29),

-- Ấm nước dưỡng sinh
(26,18),(26,29),

-- Tượng cô gái gốm
(27,12),(27,38),
(28,34),(28,38),

-- Tượng cá chép gốm
(29,11),(29,39),
(30,32),(30,39),

-- Tượng thiên nga gốm
(31,12),(31,38),
(32,33),(32,38),

-- Bát hương men lam
(33,10),(33,40),
(34,11),(34,40),

-- Bát hương rồng nổi
(35,30),(35,40),
(36,17),(36,40),

-- Bát hương men rạn
(37,10),(37,41),
(38,31),(38,41),

-- Mâm bồng men lam
(39,12),(39,40),
(40,32),(40,40),

-- Mâm bồng vẽ vàng
(41,12),(41,42),
(42,34),(42,42),

-- Mâm bồng họa tiết sen
(43,12),(43,43),
(44,34),(44,43),

-- Lục bình Phúc Lộc Thọ
(45,35),(45,44),
(46,36),(46,44),

-- Lục bình Tứ quý
(47,35),(47,45),
(48,36),(48,45),

-- Lục bình Công đào
(49,35),(49,46),
(50,37),(50,46),

-- Tượng Di Lặc
(51,11),(51,38),
(52,32),(52,38),

-- Tượng Thần Tài
(53,10),(53,38),
(54,12),(54,38),

-- Tượng Cá chép hóa rồng
(55,12),(55,39),
(56,33),(56,39);

-- =========================================================
-- 1. XÓA HOÀN TOÀN 2 BIẾN THỂ CŨ (MÃ 15 VÀ 16)
-- =========================================================
-- Xóa ở bảng ChiTietBienThe trước
DELETE FROM ChiTietBienThe WHERE MaBienThe IN (15, 16);

-- Xóa ở bảng HinhAnhBienThe
DELETE FROM HinhAnhBienThe WHERE MaBienThe IN (15, 16);

-- Cuối cùng mới xóa ở bảng BienTheSanPham
DELETE FROM BienTheSanPham WHERE MaBienThe IN (15, 16);


-- =========================================================
-- 2. THÊM GIÁ TRỊ THUỘC TÍNH MỚI VÀO BẢNG (HỌA TIẾT)
-- =========================================================
-- MaThuocTinh = 2 là 'Màu sắc / Họa tiết'
INSERT INTO GiaTriThuocTinh (MaGiaTri, MaThuocTinh, GiaTri) VALUES
(47, 2, 'Sen vàng nền trắng'),
(48, 2, 'Sen vàng nền vàng'),
(49, 2, 'Sen vàng nền xanh ngọc');


-- =========================================================
-- 3. THÊM 6 BIẾN THỂ SẢN PHẨM MỚI (SIZE 20CM VÀ 30CM)
-- =========================================================
-- MaSanPham = 7 (Bình hoa Lộc Phát). Giá đang lấy theo mức giá gốc ban đầu.
INSERT INTO BienTheSanPham (MaBienThe, MaSanPham, TenBienThe, Gia, SoLuong, TrangThai) VALUES
(57, 7, '20 cm - Sen vàng nền trắng', 420000, 20, 1),
(58, 7, '20 cm - Sen vàng nền vàng', 420000, 20, 1),
(59, 7, '20 cm - Sen vàng nền xanh ngọc', 420000, 20, 1),

(60, 7, '30 cm - Sen vàng nền trắng', 1850000, 15, 1),
(61, 7, '30 cm - Sen vàng nền vàng', 1850000, 15, 1),
(62, 7, '30 cm - Sen vàng nền xanh ngọc', 1850000, 15, 1);
-- =========================================================
-- 4. GẮN CHI TIẾT THUỘC TÍNH CHO CÁC BIẾN THỂ MỚI
-- =========================================================
INSERT INTO ChiTietBienThe (MaBienThe, MaGiaTri) VALUES
-- Size 20cm: Map với Kích thước 20cm (10) + Họa tiết tương ứng + Sứ cao cấp (28)
(57, 10), (57, 47), (57, 28),
(58, 10), (58, 48), (58, 28),
(59, 10), (59, 49), (59, 28),

-- Size 30cm: Map với Kích thước 30cm (12) + Họa tiết tương ứng + Sứ cao cấp (28)
(60, 12), (60, 47), (60, 28),
(61, 12), (61, 48), (61, 28),
(62, 12), (62, 49), (62, 28);

INSERT INTO HinhAnhBienThe (MaBienThe, DuongDan) VALUES

-- Bộ trà Camellia
(1,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773323991/camellia_0.5_white_vfuikh.png'), -- bộ trà Camellia 0.5L sứ trắng
(2,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773324099/camellia_0.5_gold_p0dlb6.jpg'), -- bộ trà Camellia 0.5L viền chỉ vàng
(3,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773323991/camellia_0.5_white_vfuikh.png'), -- bộ trà Camellia 0.8L sứ trắng
(4,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773324099/camellia_0.5_gold_p0dlb6.jpg'), -- bộ trà Camellia 0.8L chỉ vàng
(5,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773324329/camellia_sea_jks1hc.png'), -- bộ trà Camellia họa tiết hương biển

-- Bộ trà Anna
(6,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773324715/anna_0.47_trang_nga_fnm3ly.jpg'), -- bộ trà Anna trắng ngà
(7,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773324807/anna_0.47_an_nhien_1_nfiimp.png'), -- bộ trà Anna họa tiết an nhiên
(7,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773324953/anna_0.47_an_nhien_2_c37nbd.jpg'), -- bộ trà Anna họa tiết an nhiên

-- Bộ trà Đài Các
(8,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773325418/dai_cac_08_gold_1_pobwmu.jpg'), -- bộ trà Đài Các 0.8L chỉ vàng
(8,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773325437/dai_cac_08_gold_2_wacuwb.jpg'), -- bộ trà Đài Các 0.8L chỉ vàng
(9,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773325418/dai_cac_08_gold_1_pobwmu.jpg'), -- bộ trà Đài Các 1.3L chỉ vàng
(9,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773325437/dai_cac_08_gold_2_wacuwb.jpg'), -- bộ trà Đài Các 1.3L chỉ vàng

-- Bộ đồ ăn Jasmine
(10,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773326162/jasmine_10_mon_1_n9ajkq.png'), -- bộ đồ ăn Jasmine 10 món
(10,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773326162/jasmine_10_mon_2_nqlfaa.png'), -- bộ đồ ăn Jasmine 10 món
(11,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773326162/jasmine_10_mon_1_n9ajkq.png'), -- bộ đồ ăn Jasmine 23 món
(11,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773326162/jasmine_10_mon_2_nqlfaa.png'), -- bộ đồ ăn Jasmine 23 món

-- Bộ đồ ăn Daisy
(12,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773326694/daisy_22_mon_2_xu0qs0.jpg'), -- bộ đồ ăn Daisy 22 món
(12,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773326694/daisy_22_mon_3_htw5h6.jpg'), -- bộ đồ ăn Daisy 22 món
(13,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773326694/daisy_22_mon_1_nmpwep.jpg'), -- bộ đồ ăn Daisy 10 món
(13,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773326697/daisy_22_mon_4_ihlvuy.png'), -- bộ đồ ăn Daisy 10 món

-- Bộ đồ ăn Tulip
(14,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773355322/tulip_30_mon_1_arasad.jpg'), -- bộ đồ ăn Tulip 30 món

-- Bình hoa Lộc Phát
(57,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773356384/loc_phat_sen_vang_nen_trang_1_ypmd2c.png'), -- bình hoa Lộc Phát 20cm Sen Vàng nền Trắng
(57,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773356384/loc_phat_sen_vang_nen_trang_2_afqqot.png'), -- bình hoa Lộc Phát 20cm Sen Vàng nền Trắng
(57,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773356385/loc_phat_sen_vang_nen_trang_3_nxayrw.png'), -- bình hoa Lộc Phát 20cm Sen Vàng nền Trắng

(58,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773357684/loc_phat_sen_vang_nen_vang_1_kh939i.png'), -- bình hoa Lộc Phát 20cm Sen Vàng nền Vàng
(58,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773357686/loc_phat_sen_vang_nen_vang_2_gotdfo.png'), -- bình hoa Lộc Phát 20cm Sen Vàng nền Vàng
(58,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773357686/loc_phat_sen_vang_nen_vang_3_w51se7.png'), -- bình hoa Lộc Phát 20cm Sen Vàng nền Vàng

(59,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773358025/loc_phat_sen_vang_nen_xanh_ngoc_1_znl1lj.png'), -- bình hoa Lộc Phát 20cm Sen vàng nền xanh ngọc

(60,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773356384/loc_phat_sen_vang_nen_trang_1_ypmd2c.png'), -- bình hoa Lộc Phát 30cm Sen Vàng nền Trắng
(60,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773356384/loc_phat_sen_vang_nen_trang_2_afqqot.png'), -- bình hoa Lộc Phát 30cm Sen Vàng nền Trắng
(60,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773356385/loc_phat_sen_vang_nen_trang_3_nxayrw.png'), -- bình hoa Lộc Phát 30cm Sen Vàng nền Trắng

(61,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773357684/loc_phat_sen_vang_nen_vang_1_kh939i.png'), -- bình hoa Lộc Phát 30cm Sen Vàng nền Vàng
(61,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773357686/loc_phat_sen_vang_nen_vang_2_gotdfo.png'), -- bình hoa Lộc Phát 30cm Sen Vàng nền Vàng
(61,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773357686/loc_phat_sen_vang_nen_vang_3_w51se7.png'), -- bình hoa Lộc Phát 30cm Sen Vàng nền Vàng

(62,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773358025/loc_phat_sen_vang_nen_xanh_ngoc_1_znl1lj.png'), -- bình hoa Lộc Phát 30cm Sen vàng nền xanh ngọc
-- Bình hoa Sen
(17,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773358226/binh_hoa_sen_xanh_1_x3sdpf.jpg'), -- bình hoa sen 25cm màu xanh
(17,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773358225/binh_hoa_sen_xanh_2_l5dtfm.jpg'), -- bình hoa sen 25cm màu xanh
(17,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773358224/binh_hoa_sen_xanh_3_mbvx11.jpg'), -- bình hoa sen 25cm màu xanh
(18,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773358408/binh_hoa_sen_do_1_cqzxja.jpg'), -- bình hoa sen 25cm màu đỏ
(18,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773358407/binh_hoa_sen_do_2_msssbk.jpg'), -- bình hoa sen 25cm màu đỏ
(18,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773358409/binh_hoa_sen_do_3_iuzcnf.jpg'), -- bình hoa sen 25cm màu đỏ
(18,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773358408/binh_hoa_sen_do_4_tmjbw5.jpg'), -- bình hoa sen 25cm màu đỏ

-- Bình hoa Kim Ngọc
(19,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773359160/kim_ngoc_vang_1_hryuub.jpg'), -- bình hoa Kim Ngọc 15cm họa tiết vàng
(19,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773359159/kim_ngoc_vang_2_qdweab.jpg'), -- bình hoa Kim Ngọc 15cm họa tiết vàng
(20,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773359330/kim_ngoc_tu_linh_1_wa75qi.png'), -- bình hoa Kim Ngọc họa tiết tứ linh

-- Nồi sứ Vesta
(21,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773359627/vesta_1L_1_qwffnj.png'), -- nồi sứ dưỡng sinh Vesta 1L
(21,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773359648/vesta_1L_2_m4vayt.png'), -- nồi sứ dưỡng sinh Vesta 1L
(21,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773359629/vesta_1L_3_pa1jpr.png'), -- nồi sứ dưỡng sinh Vesta 1L
(22,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773362920/vesta_2L_1_dv56zl.png'), -- nồi sứ dưỡng sinh Vesta 2L
(23,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773362921/vesta_2L_2_vvbeuz.png'), -- nồi sứ dưỡng sinh Vesta 3L

-- Chảo sứ dưỡng sinh
(24,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773363089/chao_duong_sinh_24_1_hb5a9j.png'), -- chảo sứ dưỡng sinh 24cm
(24,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773363090/chao_duong_sinh_24_2_g6tobe.png'), -- chảo sứ dưỡng sinh 24cm
(25,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773363215/chao_duong_sinh_28_1_q560cl.png'), -- chảo sứ dưỡng sinh 28cm
(25,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773363215/chao_duong_sinh_28_2_jfihi9.jpg'), -- chảo sứ dưỡng sinh 28cm

-- Ấm nước dưỡng sinh
(26,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773363408/am_duong_sinh_cobe9g.png'), -- ấm nước dưỡng sinh 1.5L
(26,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773363408/am_duong_sinh_1_wyjhqm.png'), -- ấm nước dưỡng sinh 1.5L

-- Tượng cô gái gốm
(27,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773363736/co_gai_gom_30_1_pqsjg3.jpg'), -- tượng cô gái gốm 30cm
(28,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773363736/co_gai_gom_30_1_pqsjg3.jpg'), -- tượng cô gái gốm 40cm

-- Tượng cá chép gốm
(29,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773363876/ca_chep_gom_eb03io.jpg'), -- tượng cá chép gốm 25cm
(30,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773363876/ca_chep_gom_eb03io.jpg'), -- tượng cá chép gốm 35cm

-- Tượng thiên nga
(31,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773367496/thien_nga_1_zpg6rm.jpg'), -- tượng thiên nga gốm 30cm
(32,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773367496/thien_nga_1_zpg6rm.jpg'), -- tượng thiên nga gốm 45cm

-- Bát hương men lam
(33,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773367814/bat_huong_men_lam_1_fplubb.jpg'), -- bát hương men lam 20cm
(34,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773367814/bat_huong_men_lam_1_fplubb.jpg'), -- bát hương men lam 25cm

-- Bát hương rồng nổi
(35,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773368010/bat_huong_rong_noi_1_j1wtyr.jpg'), -- bát hương rồng nổi 22cm
(35,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773368010/bat_huong_rong_noi_2_pisemx.jpg'), -- bát hương rồng nổi 22cm
(35,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773368010/bat_huong_rong_noi_3_ovfwev.jpg'), -- bát hương rồng nổi 22cm
(36,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773368010/bat_huong_rong_noi_1_j1wtyr.jpg'), -- bát hương rồng nổi 28cm
(36,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773368010/bat_huong_rong_noi_2_pisemx.jpg'), -- bát hương rồng nổi 28cm
(36,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773368010/bat_huong_rong_noi_3_ovfwev.jpg'), -- bát hương rồng nổi 28cm

-- Bát hương men rạn
(37,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773368247/bat_huong_men_ran_2_ddbcxe.jpg'), -- bát hương men rạn 20cm
(37,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773368248/bat_huong_men_ran_1_hjma9t.jpg'), -- bát hương men rạn 20cm
(37,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773368247/bat_huong_men_ran_3_t3lyfa.jpg'), -- bát hương men rạn 20cm
(38,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773368247/bat_huong_men_ran_2_ddbcxe.jpg'), -- bát hương men rạn 26cm
(38,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773368248/bat_huong_men_ran_1_hjma9t.jpg'), -- bát hương men rạn 26cm
(38,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773368247/bat_huong_men_ran_3_t3lyfa.jpg'), -- bát hương men rạn 26cm

-- Mâm bồng men lam
(39,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773368660/mam_bong_1_wiibuz.png'), -- mâm bồng men lam 30cm
(40,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773368660/mam_bong_1_wiibuz.png'), -- mâm bồng men lam 35cm

-- Mâm bồng vẽ vàng
(41,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773368756/mam_bong_vang_1_a9xuhc.jpg'), -- mâm bồng vẽ vàng 30cm
(42,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773368756/mam_bong_vang_1_a9xuhc.jpg'), -- mâm bồng vẽ vàng 40cm

-- Mâm bồng họa tiết sen
(43,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773368915/mam_bong_sen_1_cxggat.jpg'), -- mâm bồng họa tiết sen 30cm
(44,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773368915/mam_bong_sen_1_cxggat.jpg'), -- mâm bồng họa tiết sen 40cm

-- Lục bình
(45,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773369077/luc_binh_phuc_loc_tho_1_tz1wga.jpg'), -- lục bình Phúc Lộc Thọ 60cm
(46,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773369077/luc_binh_phuc_loc_tho_1_tz1wga.jpg'), -- lục bình Phúc Lộc Thọ 80cm
(47,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773369259/luc_binh_tu_quy_1_oagyg2.jpg'), -- lục bình Tứ quý 60cm
(48,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773369259/luc_binh_tu_quy_1_oagyg2.jpg'), -- lục bình Tứ quý 80cm
(49,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773369371/luc_binh_cong_dao_1_tq0p51.jpg'), -- lục bình Công đào 60cm
(50,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773369371/luc_binh_cong_dao_1_tq0p51.jpg'), -- lục bình Công đào 90cm

-- Tượng phong thủy
(51,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773369991/di_lac_1_w2hy7r.jpg'), -- tượng Di Lặc 25cm
(51,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773369989/di_lac_2_spz5kc.jpg'), -- tượng Di Lặc 25cm
(52,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773369991/di_lac_1_w2hy7r.jpg'), -- tượng Di Lặc 35cm
(52,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773369989/di_lac_2_spz5kc.jpg'), -- tượng Di Lặc 35cm
(53,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773370053/than_tai_1_jvvsff.jpg'), -- tượng Thần Tài 20cm
(54,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773370053/than_tai_1_jvvsff.jpg'), -- tượng Thần Tài 30cm
(55,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773370680/ca_chep_hoa_rong_1_qgbxrl.jpg'), -- tượng cá chép hóa rồng 30cm
(56,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773370680/ca_chep_hoa_rong_1_qgbxrl.jpg'); -- tượng cá chép hóa rồng 45cm



