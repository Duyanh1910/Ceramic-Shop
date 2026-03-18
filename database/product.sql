INSERT INTO DanhMucSanPham (MaDanhMuc, TenDanhMuc, MoTa, ParentID) VALUES
(1, 'Đồ phòng bếp', 'Các sản phẩm gốm sứ dùng cho nhà bếp và bàn ăn', NULL),
(2, 'Đồ phòng khách', 'Gốm sứ tiếp khách và trưng bày', NULL),
(3, 'Đồ thờ', 'Vật phẩm thờ cúng tâm linh', NULL),
(4, 'Đồ phong thủy', 'Vật phẩm phong thủy tài lộc', NULL),
(5, 'Đồ trang trí', 'Các sản phẩm trang trí nội thất', NULL);

INSERT INTO DanhMucSanPham (MaDanhMuc, TenDanhMuc, MoTa, ParentID) VALUES
(6, 'Bộ đồ ăn', 'Bát đĩa tô chén trọn bộ', 1),
(7, 'Bát / Chén / Đĩa lẻ', 'Các loại bát chén đĩa bán lẻ', 1),
(8, 'Nồi sứ / Chảo sứ', 'Nồi chảo ấm bằng sứ chịu nhiệt', 1),
(9, 'Muỗng sứ / Đũa sứ', 'Muỗng và đũa bằng sứ chịu nhiệt', 1),

(10, 'Bộ ấm trà', 'Bộ ấm chén tiếp khách', 2),
(11, 'Khay mứt', 'Khay mứt tiếp khách', 2),

(12, 'Bát hương', 'Bát hương thờ cúng', 3),
(13, 'Mâm bồng', 'Mâm bồng thờ', 3),

(14, 'Lục bình', 'Cặp lục bình phong thủy', 4),
(15, 'Tượng phong thủy', 'Tượng phong thủy', 4),

(16, 'Tượng gốm', 'Tượng gốm trang trí', 5),
(17, 'Bình hoa', 'Bình hoa trang trí', 5);


INSERT INTO ThuocTinh VALUES
(1,'Dung tích / Kích thước'),
(2,'Màu sắc / Họa tiết'),
(3,'Chất liệu'),
(4,'Hoa văn'),
(5,'Phong cách'),
(6,'Loại sản phẩm');

INSERT INTO GiaTriThuocTinh(MaGiaTri, MaThuocTinh, GiaTri) VALUES
(1, 2,'Trắng'),
(2, 2,'Đại dương'),
(3, 2,'Vườn nhà sương mờ'),
(4, 3,'Sứ chất lượng cao'),
(5, 3,'Gốm chất lượng cao'),
(6, 4, 'Trơn'),
(7, 4, 'Vẽ tay'),
(8, 4, 'In decal'),

-- Phong cách
(9, 5, 'Hiện đại'),
(10, 5, 'Cổ điển'),
(11, 5, 'Tối giản'),

(12, 1, 'Bộ 9 món'),
(13, 1, 'Bộ 6 món'),
(14, 2, 'Tiệp dạ yến thảo'),
(15, 2, 'Chỉ vàng'),
(16 ,2, 'Tứ linh'),
(17 ,2, 'Cá cơm sương mờ'),
(18, 2, 'Bóng bay'),
(19, 2, 'Loa kèn hồng'),
(20, 1, 'Bộ 13 món'),
(21, 2, 'Lạc Hồng'),
(22, 2, 'Hồn Việt'),
(23,6,'Bát cơm'),
(24,6,'Chén nước chấm'),
(25,6,'Đĩa tròn'),
(26, 1, '18cm'),
(27, 1, '20cm'),

(28,2,'Xanh rêu'),
(29,2,'Đỏ'),
(30,1,'1L'),
(31,1,'2L'),
(32,1,'3L'),
(33,2,'Hoa đào'),
(34,2,'Sen ngọc bích'),
(35,1,'0.8L'),
(36,1,'1.1L'),
(37,2,'Hoàng Liên'),
(38,1,'130cm'),
(39,1,'140cm'),
(40,1,'150cm');

INSERT INTO sanpham(MaSanPham, MaDanhMuc, TenSanPham, Thumbnail, ThuongHieu,LuotXem, MoTa, TrangThai) VALUES
(1,6,'Bộ đồ ăn Timeless IFP',
 'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773735976/9sp-time-kl-trang_bytubp.webp',
 'Minh Long',
 0,
 'Bộ đồ ăn Timeless IFP là lựa chọn lý tưởng cho những ai yêu thích phong cách sống tối giản và tinh tế. Thiết kế theo triết lý "Less is more", bộ sản phẩm mang vẻ đẹp thanh thoát với màu trắng sứ tinh khiết, kết hợp cùng đường bo tròn mềm mại đặc trưng của dòng Timeless.
Sản phẩm được làm từ sứ cao cấp Minh Long, nung ở nhiệt độ trên 1380°C, không chứa chì, cadmium, an toàn cho sức khỏe, bền chắc, chống trầy xước và sử dụng được trong lò vi sóng, máy rửa chén.
Lý do nên chọn bộ này:
- Tông trắng tinh tế – dễ kết hợp mọi kiểu không gian bàn ăn.
- Thiết kế tối giản – hiện đại – tinh gọn.
- 9 món tiện lợi – phù hợp cho cá nhân, cặp đôi, gia đình nhỏ.
- Chất liệu sứ Minh Long cao cấp – không phai màu, không bám mùi, dễ vệ sinh.
Phù hợp làm quà tặng hoặc dùng trong homestay, căn hộ studio.',
 1);

INSERT INTO BienTheSanPham (MaBienThe, MaSanPham, TenBienThe, Gia, SoLuong, TrangThai, MoTa) VALUES
-- Bộ 9
(1,1,'Trắng - Bộ 9 món',469800,50,1,''),
(2,1,'Đại dương - Bộ 9 món',874800,30,1,''),
(3,1,'Vườn nhà sương mờ - Bộ 9 món',974800,20,1,''),

-- Bộ 6
(4,1,'Trắng - Bộ 6 món',369800,40,1,''),
(5,1,'Đại dương - Bộ 6 món',774800,25,1,''),
(6,1,'Vườn nhà sương mờ - Bộ 6 món',874800,15,1,'');

INSERT INTO ChiTietBienThe (MaBienThe, MaGiaTri) VALUES
-- 🔹 1. Trắng - Bộ 9
(1,1),(1,4),(1,6),(1,11),(1,12),
-- 🔹 2. Đại dương - Bộ 9
(2,2),(2,4),(2,7),(2,9),(2,12),
-- 🔹 3. Vườn nhà - Bộ 9
(3,3),(3,4),(3,8),(3,10),(3,12),
-- 🔹 4. Trắng - Bộ 6
(4,1),(4,4),(4,6),(4,11),(4,13),
-- 🔹 5. Đại dương - Bộ 6
(5,2),(5,4),(5,7),(5,9),(5,13),
-- 🔹 6. Vườn nhà - Bộ 6
(6,3),(6,4),(6,8),(6,10),(6,13);

INSERT INTO hinhanhbienthe( MaBienThe, DuongDan) VALUES
(1,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773735977/timeless_trang_1_lqd3ba.png'),
(1,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773735977/timeless_trang_2_udvmkr.jpg'),
(1,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773735976/timeless_trang_3_b59but.webp'),

(2,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773735977/timeless_daiduong_1_ve6aqp.webp'),
(2,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773735978/timeless_daiduong_2_y4cqvl.png'),
(2,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773735978/timeless_daiduong_3_qsgrms.webp'),

(3,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773735976/timeless_vuonnha_1_bpxpu2.webp'),
(3,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773735977/timeless_vuonnha_2_y8hty4.webp'),
(3,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773735977/timeless_vuonnha_3_o3ac6i.webp'),

(4,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773735977/timeless_trang_1_lqd3ba.png'),
(4,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773735977/timeless_trang_2_udvmkr.jpg'),
(4,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773735976/timeless_trang_3_b59but.webp'),

(5,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773735977/timeless_daiduong_1_ve6aqp.webp'),
(5,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773735978/timeless_daiduong_2_y4cqvl.png'),
(5,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773735978/timeless_daiduong_3_qsgrms.webp'),

(6,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773735976/timeless_vuonnha_1_bpxpu2.webp'),
(6,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773735977/timeless_vuonnha_2_y8hty4.webp'),
(6,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773735977/timeless_vuonnha_3_o3ac6i.webp');


INSERT INTO SanPham (MaSanPham, MaDanhMuc, TenSanPham, Thumbnail, ThuongHieu, LuotXem, MoTa, TrangThai) VALUES
(2,6,'Bộ đồ ăn Camellia',
 'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773740413/tiepda_1_e2v3pt.webp',
 'Minh Long',
 0,
 'Bộ đồ ăn Camellia mang phong cách sang trọng với họa tiết hoa trà tinh tế. Sản phẩm sử dụng chất liệu sứ cao cấp, bền đẹp, phù hợp cho bàn ăn gia đình hoặc tiếp khách.
Vì sao nên chọn bộ đồ ăn này?
- Thiết kế đơn sắc hiện đại, dễ kết hợp với mọi kiểu bàn ăn
- Sứ cao cấp Minh Long – siêu bền, dễ vệ sinh, an toàn cho sức khỏe
- Dùng được cho máy rửa chén, lò vi sóng – tiện lợi tối đa
- Thích hợp làm quà tặng tân gia, cưới hỏi, doanh nghiệp, khách sạn',
 1);

INSERT INTO BienTheSanPham (MaBienThe, MaSanPham, TenBienThe, Gia, SoLuong, TrangThai, MoTa) VALUES

-- Bộ 9
(7,2,'Tiệp dạ yến thảo - Bộ 9 món',659800,40,1,''),
(8,2,'Chỉ vàng - Bộ 9 món',759800,30,1,''),

-- Bộ 6
(9,2,'Tiệp dạ yến thảo - Bộ 6 món',559800,35,1,''),
(10,2,'Chỉ vàng - Bộ 6 món',659800,25,1,'');

INSERT INTO ChiTietBienThe (MaBienThe, MaGiaTri) VALUES
-- 🔹 Tiệp dạ yến thảo - Bộ 9
(7,14),(7,4),(7,12),
-- 🔹 Chỉ vàng - Bộ 9
(8,15),(8,4),(8,12),
-- 🔹 Tiệp dạ yến thảo - Bộ 6
(9,14),(9,4),(9,13),
-- 🔹 Chỉ vàng - Bộ 6
(10,15),(10,4),(10,13);

INSERT INTO hinhanhbienthe( MaBienThe, DuongDan) VALUES
(7,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773740415/tiepda_2_zqtbpa.webp'),

(8,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773740412/chivang_1_gssuqv.webp'),
(8,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773740412/chivang_2_nzw8qw.jpg'),

(9,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773740415/tiepda_2_zqtbpa.webp'),

(10,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773740412/chivang_1_gssuqv.webp'),
(10,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773740412/chivang_2_nzw8qw.jpg');

INSERT INTO SanPham
(MaSanPham, MaDanhMuc, TenSanPham, Thumbnail, ThuongHieu, LuotXem, MoTa, TrangThai)
VALUES
(3,6,'Bộ đồ ăn Jasmine',
 'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773741517/bo-9sp-jas-trang-nga_yla16y.png',
 'Minh Long',
 0,
 'Bộ đồ ăn Jasmine mang phong cách nhẹ nhàng, tinh tế với họa tiết hoa nhài thanh thoát.
Sản phẩm được làm từ sứ cao cấp, phù hợp cho bữa ăn gia đình và không gian trang nhã.
Vì sao nên chọn bộ đồ ăn này?
- Thiết kế đơn sắc hiện đại, dễ kết hợp với mọi kiểu bàn ăn
- Sứ cao cấp Minh Long – siêu bền, dễ vệ sinh, an toàn cho sức khỏe
- Dùng được cho máy rửa chén, lò vi sóng – tiện lợi tối đa
- Thích hợp làm quà tặng tân gia, cưới hỏi, doanh nghiệp, khách sạn',
 1);

INSERT INTO BienTheSanPham
(MaBienThe, MaSanPham, TenBienThe, Gia, SoLuong, TrangThai, MoTa)
VALUES
-- Chỉ có bộ 9
(11,3,'Cá cơm sương mờ - Bộ 9',2133000,35,1,''),
(12,3,'Trắng - Bộ 9',589800,40,1,'');

INSERT INTO ChiTietBienThe (MaBienThe, MaGiaTri) VALUES
-- Cá cơm sương mờ - Bộ 9
(11,17),(11,4),(11,12),
-- Trắng - Bộ 9
(12,1),(12,4),(12,12);

INSERT INTO hinhanhbienthe( MaBienThe, DuongDan) VALUES
(11,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773741518/bo-do-an-10-san-pham-jasmine-ca-com-suong-mo_hjk5h1.webp'),
(11,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773741520/10jas519bg_baquku.png'),
(11,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773741518/10jas519nen_cheppy.png'),

(12,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773741521/470928000-bg02_sqdvbv.png'),
(12,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773741520/470928000-bg_mfgjws.png');

INSERT INTO SanPham
(MaSanPham, MaDanhMuc, TenSanPham, Thumbnail, ThuongHieu, LuotXem, MoTa, TrangThai)
VALUES
(4,6,'Bộ đồ ăn Daisy',
 'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773742534/24312-sm-01_d807073456cb42ac9f0796710eb65c17_master_ou5wax.png',
 'Minh Long',
 0,
 'Bộ đồ ăn Daisy sở hữu thiết kế thanh lịch với tông màu trắng tinh khôi, mang đến nét đẹp trang nhã và sang trọng cho bàn ăn.
Sản phẩm được chế tác từ chất liệu sứ cao cấp, đảm bảo an toàn cho sức khỏe, giúp bạn yên tâm sử dụng hàng ngày.
Đặc Điểm Nổi Bật:
- Chất liệu sứ cao cấp, không chứa chì, cadmium, an toàn cho sức khỏe.
- Tông màu trắng tinh khôi, dễ dàng kết hợp với nhiều phong cách bày trí bàn ăn.
- Bộ gồm 09 sản phẩm tiện dụng, đáp ứng nhu cầu sử dụng hàng ngày.
- Khả năng chịu nhiệt tốt, an toàn khi sử dụng trong lò vi sóng và máy rửa chén.
- Bề mặt sứ tráng men láng mịn, hạn chế bám bẩn, dễ dàng vệ sinh.
Bộ đồ ănDaisy Trắng không chỉ giúp bữa cơm gia đình thêm trọn vẹn mà còn là sự lựa chọn lý tưởng để làm quà tặng sang trọng cho người thân, bạn bè.',
 1);

INSERT INTO BienTheSanPham
(MaBienThe, MaSanPham, TenBienThe, Gia, SoLuong, TrangThai, MoTa)
VALUES
(15,4,'Bóng bay - Bộ 13',1799800,30,1,''),
(16,4,'Loa kèn hồng - Bộ 13',2829800,25,1,'');

INSERT INTO ChiTietBienThe (MaBienThe, MaGiaTri) VALUES
-- Bóng bay - Bộ 13
(15,18),(15,4),(15,20),
-- Loa kèn hồng - Bộ 13
(16,19),(16,4),(16,20);

INSERT INTO hinhanhbienthe( MaBienThe, DuongDan) VALUES
(15,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773742529/bo-do-an-9-san-pham-daisy-bong-bay_xr8kyc.webp'),
(15,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773742528/bo-do-an-9-san-pham-daisy-bong-bay-a001-09312-2_d6karu.webp'),
(15,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773742526/thanh-phan-bb-03-03_hrqf5n.jpg'),

(16,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773742525/0_m4fnu8.webp'),
(16,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773742531/1_husm8b.webp'),
(16,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773742532/2_lq1wjw.webp');

INSERT INTO SanPham
(MaSanPham, MaDanhMuc, TenSanPham, Thumbnail, ThuongHieu, LuotXem, MoTa, TrangThai)
VALUES
(5,6,'Bộ đồ ăn Hoàng Cung',
 'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773744001/bo-do-an-30-san-pham-hoang-cung-lac-hong-30208-00_z2uoxf.png',
 'Minh Long I',
 0,
 'Bộ đồ ăn của sản phẩm Hoàng Cung là tuyệt tác gốm sứ cao cấp đến từ thương hiệu Minh Long I, mang đậm hơi thở truyền thống và tinh thần dân tộc. Lấy cảm hứng từ hoa văn cung đình và văn hóa Việt, bộ sản phẩm không chỉ là đồ dùng bàn ăn mà còn là biểu tượng của sự sang trọng, tinh tế và đẳng cấp.
🌟 Đặc điểm nổi bật:
✅ Chất liệu sứ ngọc cao cấp: Nung ở nhiệt độ trên 1.300°C, bền chắc, sáng bóng, không chứa chì – an toàn tuyệt đối cho sức khỏe người dùng.
✅ Họa tiết độc đáo: Hoa văn vẽ vàng thủ công tinh xảo, kết hợp với sắc men trang nhã thể hiện tinh thần dân tộc, phù hợp trưng bày, tiếp khách hay làm quà tặng cao cấp.
✅ Thiết kế sang trọng – Đậm chất hoàng cung: Từng đường nét đều được chăm chút, thể hiện đẳng cấp của người sử dụng.
✅ Bộ sản phẩm 13 món đầy đủ: Gồm bát, đĩa, chén, tô… phục vụ bữa ăn hoàn chỉnh, thích hợp cho gia đình, nhà hàng cao cấp, khách sạn và quà tặng sự kiện.',
 1);

INSERT INTO BienTheSanPham
(MaBienThe, MaSanPham, TenBienThe, Gia, SoLuong, TrangThai, MoTa)
VALUES
(17,5,'Lạc Hồng - Bộ 13',3299800,20,1,''),
(18,5,'Hồn Việt - Bộ 13',4399800,15,1,'');

INSERT INTO ChiTietBienThe (MaBienThe, MaGiaTri) VALUES
-- Lạc Hồng - Bộ 13
(17,21),(17,4),(17,20),
-- Hồn Việt - Bộ 13
(18,22),(18,4),(18,20);

INSERT INTO hinhanhbienthe( MaBienThe, DuongDan) VALUES
(17,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773743992/bo-do-an-30-san-pham-hoang-cung-lac-hong-30208-00_e5vorj.webp'),
(17,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773743994/bo-do-an-30-san-pham-hoang-cung-lac-hong-30208-1_swu3ta.webp'),
(17,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773743996/bo-do-an-30-san-pham-hoang-cung-lac-hong-30208-2_pmwx7v.webp'),

(18,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773743999/bo-do-an-30-san-pham-hoang-cung-hon-viet-30038-00_kke6i9.png'),
(18,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773743989/bo-do-an-30-san-pham-hoang-cung-hon-viet-30038-1_sisnfw.webp'),
(18,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773743989/bo-do-an-30-san-pham-hoang-cung-hon-viet-30038-2_liorqq.webp');

INSERT INTO SanPham
(MaSanPham, MaDanhMuc, TenSanPham, Thumbnail, ThuongHieu, LuotXem, MoTa, TrangThai)
VALUES
(6,7,'Bát cơm Timeless',
 'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773752428/chen-com-kl-timeless-trang-gom-su-minh-long-a001-591166000-0_xfa37j.webp',
 'Minh Long',
 0,
 'Bát cơm thuộc bộ Timeless, thiết kế tối giản, màu trắng tinh tế.',
 1);

INSERT INTO BienTheSanPham
(MaBienThe, MaSanPham, TenBienThe, Gia, SoLuong, TrangThai, MoTa)
VALUES
(19,6,'Trắng',45000,100,1,''),
(20,6,'Đại dương',55000,80,1,'');

INSERT INTO ChiTietBienThe (MaBienThe, MaGiaTri) VALUES
-- Trắng
(19,1),(19,4),(19,6),(19,23),
-- Đại dương
(20,2),(20,4),(20,7),(20,23);

INSERT INTO hinhanhbienthe( MaBienThe, DuongDan) VALUES
(19,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773752428/chen-com-kl-timeless-trang-gom-su-minh-long-a001-591166000-0_xfa37j.webp'),
(19,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773752430/chen-com-kl-timeless-trang-gom-su-minh-long-a001-591166000-2_kz0nwn.webp'),
(19,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773752433/chen-com-kl-timeless-trang-gom-su-minh-long-a001-591166000-1_fseapa.jpg'),

(20,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773752780/006154e0-e756-4d84-a9fc-065707565d05-96d49aac-7f78-4372-ae58-0a37e4373a73_qmvy8w.png');

INSERT INTO SanPham
(MaSanPham, MaDanhMuc, TenSanPham, Thumbnail, ThuongHieu, LuotXem, MoTa, TrangThai)
VALUES
(7,7,'Đĩa tròn Camellia',
 'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773753280/041813014-e7c232fe903a458f93e78bfa4be3a244-grande-d4808e03-9d85-46fc-abae-d54dfe48f376_uydhbu.png',
 'Minh Long I',
 0,
 'Đĩa tròn thuộc bộ Camellia, thiết kế sang trọng, phù hợp dùng trong bữa ăn gia đình hoặc tiếp khách.',
 1);

INSERT INTO BienTheSanPham
(MaBienThe, MaSanPham, TenBienThe, Gia, SoLuong, TrangThai, MoTa)
VALUES

-- Tiệp dạ yến thảo
(21,7,'Tiệp dạ yến thảo - 18cm',80000,30,1,''),
(22,7,'Tiệp dạ yến thảo - 20cm',95000,25,1,''),

-- Chỉ vàng
(23,7,'Chỉ vàng - 18cm',85000,30,1,''),
(24,7,'Chỉ vàng - 20cm',100000,25,1,'');

INSERT INTO ChiTietBienThe (MaBienThe, MaGiaTri) VALUES
-- Tiệp dạ yến thảo - 18cm
(21,14),(21,4),(21,25),(21,26),
-- Tiệp dạ yến thảo - 20cm
(22,14),(22,4),(22,25),(22,27),
-- Chỉ vàng - 18cm
(23,15),(23,4),(23,25),(23,26),
-- Chỉ vàng - 20cm
(24,15),(24,4),(24,25),(24,27);

INSERT INTO hinhanhbienthe( MaBienThe, DuongDan) VALUES
(21,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773753279/11390-png_lyd4sq.png'),
(22,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773753279/11390-png_lyd4sq.png'),
(23,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773753280/041813014-e7c232fe903a458f93e78bfa4be3a244-grande-d4808e03-9d85-46fc-abae-d54dfe48f376_uydhbu.png'),
(24,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773753280/041813014-e7c232fe903a458f93e78bfa4be3a244-grande-d4808e03-9d85-46fc-abae-d54dfe48f376_uydhbu.png');

INSERT INTO SanPham VALUES
(8,7,'Bát tô lớn Jasmine',
 'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773753748/ca-com-xuon-mo_gbyuvw.png',
 'Minh Long',0,
 'Bát tô lớn thuộc bộ Jasmine, phù hợp đựng canh hoặc món nước.',
 1);

INSERT INTO BienTheSanPham VALUES
(25,8,'Cá cơm sương mờ - 18cm',70000,40,1,''),
(26,8,'Cá cơm sương mờ - 20cm',85000,30,1,'');

INSERT INTO ChiTietBienThe VALUES
(25,17),(25,4),(25,23),(25,26),
(26,17),(26,4),(26,23),(26,27);

INSERT INTO hinhanhbienthe( MaBienThe, DuongDan) VALUES
(25,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773753748/ca-com-xuon-mo_gbyuvw.png'),
(26,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773753750/ca-com-xuon-mo-02_xrxkmz.webp'),
(26,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773753753/ca-com-xuon-m03_xdovty.webp');

INSERT INTO SanPham VALUES
(9,7,'Đĩa tròn Daisy',
 'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773754137/dia-tron-ao-28-cm-daisy-bong-bay-042821312-sm-01-93a4d2e97c9b45e2b4058ec0156c2084-grande-708256cf-fd68-4282-909f-a33bc05897ac_kgbcem.png',
 'Minh Long I',0,
 'Đĩa tròn Daisy thiết kế hiện đại, phù hợp trang trí bàn ăn, thuộc bộ đồ ăn Daisy',
 1);

INSERT INTO BienTheSanPham VALUES
(27,9,'Bóng bay - 18cm',95000,35,1,''),
(28,9,'Loa kèn hồng - 18cm',100000,30,1,'');

INSERT INTO ChiTietBienThe VALUES
(27,18),(27,4),(27,25),(27,26),
(28,19),(28,4),(28,25),(28,26);

INSERT INTO hinhanhbienthe( MaBienThe, DuongDan) VALUES
(27,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773754137/dia-tron-ao-28-cm-daisy-bong-bay-042821312-sm-01-93a4d2e97c9b45e2b4058ec0156c2084-grande-708256cf-fd68-4282-909f-a33bc05897ac_kgbcem.png'),
(28,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773754139/avatar_dda58839be5348029a0752b1bf62a0fe_gkrpcr.png');

INSERT INTO SanPham VALUES
(10,7,'Chén chấm Hoàng Cung',
 'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773754536/chen-cham-9-cm-camellia-lac-hong_040976208-1-sm_5725bdb043d243c79330e79518c1339c_gujrc3.png',
 'Minh Long',0,
 'Chén chấm cao cấp thuộc dòng Hoàng Cung, họa tiết truyền thống.',
 1);
INSERT INTO BienTheSanPham VALUES
(29,10,'Lạc Hồng',60000,50,1,''),
(30,10,'Hồn Việt',70000,40,1,'');

INSERT INTO ChiTietBienThe VALUES
(29,21),(29,4),(29,24),
(30,22),(30,4),(30,24);

INSERT INTO hinhanhbienthe( MaBienThe, DuongDan) VALUES
(29,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773754536/chen-cham-9-cm-camellia-lac-hong_040976208-1-sm_5725bdb043d243c79330e79518c1339c_gujrc3.png'),
(30,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773754534/avatar__6__34a6f2e2653f4a8fafbb347069ac0a8a_qwn9qo.png');

INSERT INTO SanPham VALUES
(11,8,'Nồi sứ Vesta',
 'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773755380/Noi-duong-sinh-Vesta-3.0L-nap-Healthycook-Hong-Anh-Kim1_mmyagw.png',
 'Healthy Cook',0,
 'Sứ dưỡng sinh Healthycook là dòng sản phẩm đột phá độc đáo, kết tinh của nhiều năm tâm huyết, nghiên cứu và thử nghiệm của nhà sáng lập Minh Long.
Với chất liệu tinh tuyển từ đất hiếm thiên nhiên, lành tính, không chứa các chất độc hại, Healthycook sở hữu nhiều tính năng nổi bật góp phần đem lại những bữa ăn ngon – lành cho gia đình.
ĐẶC TÍNH SẢN PHẨM:
- Nấu thực phẩm không cần nước mà vẫn giữ màu sắc rau củ tươi như ban đầu (dưỡng chất còn lại 70 -80%).
- Chiên ở nhiệt độ thấp mà vẫn chín sâu, giòn lâu.
- Nấu chín thức ăn bằng cơ chế phát ra tia hồng ngoại nên hầm nhanh mềm, tạo rất ít váng bọt nên nước trong và thơm hơn, giúp tiết kiệm thời gian và nhiên liệu.
- Sản phẩm được nung ở nhiệt độ cao 1280 độ C giúp sản phẩm không bị rạn men, bung men trong quá trình sử dụng lâu dài
- Bảo hành 1 năm',
 1);

INSERT INTO BienTheSanPham VALUES
(31,11,'Xanh rêu - 1L',250000,30,1,''),
(32,11,'Xanh rêu - 2L',320000,25,1,''),
(33,11,'Xanh rêu - 3L',390000,20,1,''),

(34,11,'Đỏ - 1L',250000,30,1,''),
(35,11,'Đỏ - 2L',320000,25,1,''),
(36,11,'Đỏ - 3L',390000,20,1,'');

INSERT INTO ChiTietBienThe VALUES
(31,28),(31,4),(31,30),
(32,28),(32,4),(32,31),
(33,28),(33,4),(33,32),
(34,29),(34,4),(34,30),
(35,29),(35,4),(35,31),
(36,29),(36,4),(36,32);

INSERT INTO hinhanhbienthe( MaBienThe, DuongDan) VALUES
(34,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773755380/Noi-duong-sinh-Vesta-3.0L-nap-Healthycook-Hong-Anh-Kim1_mmyagw.png'),
(34,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773755384/Noi-duong-sinh-Vesta-3.0L-nap-Healthycook-Hong-Anh-Kim2_fsv5i1.png'),
(34,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773755755/661028464-5-sm-59257d336c3647648efce171d73da346-grande_estsrf.webp');

INSERT INTO SanPham VALUES
(12,9,'Đũa sứ Jasmine Lys',
 'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773756333/5cb2-8d05e38ba55f4517890c19b5ab13007b-e8822221fd3b49dc94eadac67f6703db-fe52fdbad9964f8ca6124a1a91516529-grande-47424398-546d-47c7-82b0-993882f55bf5_ygygqx.png',
 'Minh Long LYS',0,
 'Được làm từ nguyên liệu sứ tinh tuyển, lành tính, an toàn cho sức khỏe.
Mặt đũa phủ men nano sáng bóng, không thấm hút gia vị, thức ăn.
Khó bám bẩn, không bị ẩm mốc, dễ tẩy rửa, nhanh khô.
Nung ở nhiệt độ cao 1380oC đảm bảo độ cứng chắc.
Sứ cao cấp, chất lượng theo tiêu chuẩn châu Âu.
Phù hợp để làm quà tặng; sử dụng trong gia đình, nhà hàng, khách sạn…
Hướng dẫn sử dụng và bảo quản:
- Tránh làm rớt, va đập hoặc dùng lực tác động quá mạnh lên sản phẩm.
- Vệ sinh sản phẩm bằng dung dịch hay các miếng tẩy rửa thông thường.
- Bảo quản nơi khô thoáng, sạch sẽ, tránh những nơi có khả năng làm rơi vỡ sản phẩm.',
 1);

INSERT INTO BienTheSanPham VALUES
(37,12,'Tiêu chuẩn',120000,100,1,'');

INSERT INTO ChiTietBienThe VALUES
(37,4),(37,11);

INSERT INTO hinhanhbienthe( MaBienThe, DuongDan) VALUES
(37,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773756333/5cb2-8d05e38ba55f4517890c19b5ab13007b-e8822221fd3b49dc94eadac67f6703db-fe52fdbad9964f8ca6124a1a91516529-grande-47424398-546d-47c7-82b0-993882f55bf5_ygygqx.png'),
(37,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773756322/73fe-a53c7922bbc74d1f9103287294223fba-de73c3eb31354cdfbef906c228bc68e3-24c767294b3643588fb113c4f494ab08-grande-b263b424-4b04-48e3-9a05-4016cf5341c2_t9nkdh.png');

INSERT INTO SanPham VALUES
(13,9,'Đũa sứ dưỡng sinh IFP',
 'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773756576/dua-do-4f5dada2641444ceb3cae14a24657c68-grande_ezs6ab.webp',
 'Minh Long IFP',0,
 'Trong dáng vẻ mảnh mai mà bền bỉ của đôi đũa là hình ảnh đồng thuận, tương trợ nhau như cốt cách người Việt, nay có thêm diện mạo mới bằng sứ do Minh Long chế tác.
"Một đôi hoà thuận
Xa gần xuôi ngược chờ nhau
Chút tình nâng niu nồng ấm
Sẻ chia từ buổi sơ đầu
Đất giữ ngọc qua đá vàng gửi lại
Một-đôi-tình
Chung thuỷ đến ngày sau..."
Trong cái dáng vẻ mảnh mai mà bền bỉ của đôi đũa là hình ảnh của sự đồng thuận, tìm nhau, chờ nhau, xa gần, mặn ngọt cùng nhau. Cũng thấy trong cái dáng vẻ mong manh ấy, trời, đất và người giao hoà.
Một chiếc linh hoạt, khéo léo, tựa trên một chiếc vững vàng giữa những ngón tay người nâng đỡ- một vũ khúc của sắc hương bát ngát chan hoà. Một đôi đũa, cũng mang vẻ đẹp của sự thuỷ chung. Hai chiếc song đôi, không rời nhau giữa dòng đời xuôi ngược. "Một đôi", với tất cả ý nghĩa đẹp đẽ của nó, nằm ngay trong bóng dáng của sự thuỷ chung ấy. Và khi chờ nhau để cùng nâng đũa trên tay, mời nhau miếng ngon, miếng lành đầu tiên là miếng của lòng tri ân, kính trên nhường dưới, là miếng ân cần chia sẻ yêu thương. Một đôi đũa đã mang trong nó hình ảnh một gia đình đầm ấm.
Đất thuỷ chung với người, nghìn năm giữ ngọc, qua men lửa đá vàng, một đôi thắm thiết, xin trao.',
 1);

INSERT INTO BienTheSanPham VALUES
(38,13,'Tiêu chuẩn',165000,100,1,'');

INSERT INTO ChiTietBienThe VALUES
(38,4),(38,11);

INSERT INTO hinhanhbienthe( MaBienThe, DuongDan) VALUES
(38,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773756579/dua-su-duong-sinh-24-4-cm-2doihq-duong-sinh-ifp-mau-do-pastel-a001-212478dop02q-2_qunif8.webp'),
(38,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773756583/dua-su-duong-sinh-24-4-cm-2doihq-duong-sinh-ifp-mau-do-pastel-a001-212478dop02q-1_d3kmrb.webp');

INSERT INTO SanPham VALUES
(14,9,'Gác đũa muỗng Jasmine Lys',
 'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773756925/image-removebg-preview-1_rw2xqi.png',
 'Minh Long LYS',0,
 'Gác đũa - Jasmine Lys có màu men sứ trắng ngà, đa dạng chủng loại từ chén, dĩa, tô, tách...có kiểu dáng thiết kế đồng nhất, đáp ứng đầy đủ nhu cầu sử dụng cho các loại bàn tiệc đa dạng và phong phú của khách hàng.
Gác đũa muỗng Lys giúp giữ vệ sinh bàn ăn, thiết kế nhỏ gọn, tinh tế, phù hợp với nhiều phong cách bày trí.',
 1);

INSERT INTO BienTheSanPham VALUES
(39,14,'Tiêu chuẩn',30000,150,1,'');

INSERT INTO ChiTietBienThe VALUES
(39,4),(39,6),(39,11);

INSERT INTO hinhanhbienthe( MaBienThe, DuongDan) VALUES
(39,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773756925/image-removebg-preview-1_rw2xqi.png');

INSERT INTO SanPham VALUES
(15,9,'Gác đũa Misc Assortment',
 'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773787161/gac_dua_ca_hjmqyf.png',
 'Misc Assortment',0,
 'Tuyển chọn từ những nguyên liệu quý hiếm mỗi sản phẩm của Misc Assortment đảm bảo những tiêu chí cao nhất về chất lượng. Sở hữu nhiều tính năng vượt trội siêu cứng chắc, mặt men sáng bóng, khó trầy xước. Misc Assortment được nhiều người ưa chuộng và lựa chọn bởi sự cao cấp, an toàn, bền đẹp và thân thiện với môi trường.',
 1);

INSERT INTO BienTheSanPham VALUES
(40,15,'Tiêu chuẩn',27000,120,1,'');

INSERT INTO ChiTietBienThe VALUES
(40,4),(40,8),(40,9);

INSERT INTO hinhanhbienthe( MaBienThe, DuongDan) VALUES
(40,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773787161/gac_dua_ca_hjmqyf.png');

INSERT INTO SanPham VALUES
(16,9,'Muỗng Jasmine',
 'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773787787/f4cd4c8d12fecea097ef_b59ee5c8c3db4aab8a1943e47eda8b67_66a0b61d72344c14b7f2ad880614f1ad_hnjjlx.png',
 'Minh Long',0,
 'Đặc tính sản phẩm:
-Thân sứ siêu cứng với công nghệ phối liệu đặc biệt: Sử dụng bền lâu, hạn chế bể mẻ trong quá trình tẩy rửa.
-Mặt men cứng, chắc: Khó trầy xước khi sử dụng dao, muỗng, nĩa thường xuyên, giữ sản phẩm luôn mới sau thời gian dài sử dụng.
-Ứng dụng công nghệ Nano cho bề mặt men láng bóng: Giúp cho sản phẩm khó bám bẩn kể cả dầu mỡ, tiết kiệm thời gian.
-Kiểu dáng đa dạng sang trọng phù hợp với nhiều không gian ăn uống khác nhau.
-Độ sốc nhiệt cao (có thể sử dụng từ nóng sang lạnh và ngược lại với độ sốc nhiệt từ 0 đến 200 độ C).',
 1);

INSERT INTO BienTheSanPham VALUES
(41,16,'Trắng',59400,100,1,''),
(42,16,'Hoa đào',50000,80,1,''),
(43,16,'Sen ngọc bích',55000,70,1,'');

INSERT INTO ChiTietBienThe VALUES
(41,1),(41,4),(41,11),
(42,33),(42,4),(42,9),
(43,34),(43,4),(43,9);

INSERT INTO hinhanhbienthe( MaBienThe, DuongDan) VALUES
(41,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773787787/f4cd4c8d12fecea097ef_b59ee5c8c3db4aab8a1943e47eda8b67_66a0b61d72344c14b7f2ad880614f1ad_hnjjlx.png'),
(42,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773787787/avatar__10__a23e5bfb2aa54db2a224e207812c7897_tjldou.png'),
(43,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773787787/avatar_868d6b3aac604d27bb216a378ca67873_ffh5jn.png');

INSERT INTO SanPham VALUES
(17,9,'Muỗng Hoàng Cung',
 'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773788271/muong-hoang-cung-kim-ngoc-a001-140429488_jzjjdy.webp',
 'Gastroline',0,
 'Bộ sản phẩm Gastroline Kim Ngọc toát lên vẻ đẹp hiện đại và cuốn hút trong từng đường nét, tạo nên bức tranh sống động cho không gian ẩm thực. Với gam màu hiện đại, kiểu dáng thanh thoát phù hợp nhiều phong cách ẩm thực, Gastroline Kim Ngọc là nguồn cảm hứng bất tận cho đầu bếp thỏa thức sáng tạo và biến tấu món ăn thành một tác phẩm nghệ thuật.
Đặc biệt, Gastroline là một trong những dòng sản phẩm trứ danh của Minh Long cùng nhà thiết kế Hans Wilhelm Seitz (nhà thiết kế đẳng cấp của Đức) từng được vinh danh là thiết kế có “ý tưởng thiết kế sản phẩm xuất sắc” tại giải Red Dot Design Award 2019 - Cuộc thi thiết kế quy mô và uy tín nhất toàn cầu.',
 1);

INSERT INTO BienTheSanPham VALUES
(44,17,'Hồn Việt',330000,90,1,'');
INSERT INTO ChiTietBienThe VALUES
(44,22),(44,4),(44,10);

INSERT INTO hinhanhbienthe( MaBienThe, DuongDan) VALUES
(44,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773788271/muong-hoang-cung-kim-ngoc-a001-140429488_jzjjdy.webp'),
(44,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773788272/muong-hoang-cung-kim-ngoc-a001-140429488-2_lxcgkk.jpg'),
(44,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773788273/muong-hoang-cung-kim-ngoc-a001-140429488-1_ayerd0.jpg');

INSERT INTO SanPham VALUES
(18,10,'Bộ trà Jasmine',
 'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773789799/00-e044fa84-cb8f-4cfd-acbd-89b434624698_alvzg2.webp',
 'LYS',0,
 'Bộ ấm trà Jasmine thiết kế thanh lịch, họa tiết tinh tế, phù hợp tiếp khách và sử dụng hàng ngày.',
 1);

INSERT INTO BienTheSanPham VALUES
-- 0.8L
(45,18,'Trắng - 0.8L',150000,20,1,''),
(46,18,'Hoa đào - 0.8L',1500000,15,1,''),
(47,18,'Sen ngọc bích - 0.8L',11550000,15,1,''),

-- 1.1L
(48,18,'Trắng - 1.1L',2520000,20,1,''),
(49,18,'Hoa đào - 1.1L',2580000,15,1,''),
(50,18,'Sen ngọc bích - 1.1L',22630000,15,1,'');

INSERT INTO ChiTietBienThe VALUES
(45,1),(45,4),(45,35),(45,11),
(46,33),(46,4),(46,35),(46,9),
(47,34),(47,4),(47,35),(47,9),
(48,1),(48,4),(48,36),(48,11),
(49,33),(49,4),(49,36),(49,9),
(50,34),(50,4),(50,36),(50,9);

INSERT INTO hinhanhbienthe( MaBienThe, DuongDan) VALUES
(45,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773789802/45421211212121_g7iefo.webp'),
(45,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773789802/454122_difkl4.webp'),

(46,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773789803/untitled-1-b965f520-f51b-4b45-abb6-a9f8682467a6_epolzp.webp'),

(47,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773789800/sn_0.8l_cae74893e7b646dc97a116b7f44429b8_kstqax.png'),

(48,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773789802/454122_difkl4.webp'),

(49,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773789803/gemini-generated-image-kuo8jakuo8jakuo8_zmur2c.webp'),
(49,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773789799/04-01803848003-camellia-min-4183753512374967a74e5c63eb9e84df-grande_kv7osv.webp'),

(50,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773789800/sn3_422dbf7d19ac4100896823e8a48e8843_zxwvm2.png');

INSERT INTO SanPham VALUES
(19,10,'Bộ ấm trà Hoàng Cung',
 'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773798497/00-f5e6732e-77c1-489d-9972-0804386f0860_nsci6h.webp',
 'Minh Long I',0,
 'Đặc điểm nổi bật:
- Chất liệu sứ cao cấp: Được chế tác từ nguồn nguyên liệu tinh tuyển, nung ở nhiệt độ trên 1.380°C, sản phẩm có độ bền cao, bề mặt men sáng bóng, láng mịn, chống bám bẩn và dễ dàng vệ sinh.
- Thiết kế nhỏ gọn, tinh tế: Dung tích 0.8L vừa vặn cho những buổi thưởng trà từ 2–4 người, kiểu dáng mềm mại, cân đối, giúp giữ nhiệt tốt và thuận tiện khi sử dụng.
- Hoa văn "Hoàng Liên" sang trọng: Lấy cảm hứng từ hoa sen vàng – biểu tượng của sự cao quý, thuần khiết và phú quý. Họa tiết được vẽ tay tỉ mỉ với sắc vàng kim óng ánh, mang vẻ đẹp trang nhã, quý phái.
- An toàn tuyệt đối: Không chứa chì, cadmium; an toàn khi sử dụng trong lò vi sóng và máy rửa chén mà không ảnh hưởng đến chất lượng sản phẩm.
Bộ sản phẩm bao gồm:
- 1 ấm trà (dung tích 0.8 lít)
- 6 tách trà
- 6 dĩa lót tách
- 1 bình lọc trà (nếu có)
Ứng dụng:
- Thích hợp cho không gian thưởng trà tại gia, văn phòng hoặc những buổi trà đạo nhẹ nhàng, ấm cúng.
- Là món quà tặng ý nghĩa, cao cấp trong các dịp lễ tết, tân gia, mừng thọ, tri ân đối tác và khách hàng.',
 1);

INSERT INTO BienTheSanPham VALUES
(51,19,'Lạc Hồng - 0.8L',7750000,10,1,''),
(52,19,'Hồn Việt - 0.8L',7780000,10,1,''),
(53,19,'Lạc Hồng - 1.1L',7820000,8,1,''),
(54,19,'Hồn Việt - 1.1L',7850000,8,1,''),
(55,19,'Hoàng Liên - 0.8L',17790000,10,1,''),
(56,19,'Hoàng Liên - 1.1L',19760000,8,1,'');

INSERT INTO ChiTietBienThe VALUES
(51,21),(51,4),(51,35),(51,10),
(52,22),(52,4),(52,35),(52,10),
(53,21),(53,4),(53,36),(53,10),
(54,22),(54,4),(54,36),(54,10),
(55,37),(55,4),(55,35),(55,10),
(56,37),(56,4),(56,36),(56,10);

INSERT INTO hinhanhbienthe( MaBienThe, DuongDan) VALUES
(51,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773798498/untitled-1-59db384d-4faf-4f9c-9496-d77c82c4cf2a_yqtqr6.webp'),

(52,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773798497/untitled-1-8b83c5e4-64a2-4375-bd69-36775c7d545a_rqrdzy.webp'),

(53,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773798497/untitled-1-47c6afc9-b2d4-41a4-b8bf-27f5b77e31dd_tubbdx.webp'),

(54,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773798496/222-c06e27a4-16ec-4688-a92a-750662570c0f_cto7ji.webp'),

(55,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773798497/00-a05b9b75-aade-4e62-9b50-70167aab967d_a1crjk.webp'),

(56,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773798497/untitled-1-1e4474bf-aee4-4175-af0c-2d16491ac4fd_veahwq.webp');

INSERT INTO SanPham VALUES
(20,10,'Bộ ấm trà Camellia',
 'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773799161/daiduong1_jb2t49.webp',
 'Minh Long',0,
 'ĐẶC TÍNH SẢN PHẨM:
• Sản phẩm được sản xuất từ nguyên liệu đất sét tinh tuyển, được chọn lọc và qua các quy trình sản xuất chuyên nghiệp, kỹ thuật cao, cùng với sự tâm huyết của các nghệ nhân, đảm bảo độ bền vững cao và sử dụng lâu dài.
• Sản phẩm được nung ở nhiệt độ cao (từ 1260℃ đến 1380℃) giúp loại bỏ tạp chất, đảm bảo an toàn cho sức khoẻ người tiêu dùng.
• Bề mặt sản phẩm trắng sáng và không bị ố vàng sau một thời gian sử dụng. Điều này làm cho sản phẩm sứ Minh Long trở thành lựa chọn hàng đầu cho các gia đình và doanh nghiệp khi muốn trang trí không gian sống hoặc sử dụng trong các bữa tiệc quan trọng.
• Sản phẩm được sản xuất với độ chính xác cao, tinh tế trong từng chi tiết, đảm bảo độ hoàn hảo tuyệt đối.
• Công nghệ Nano giúp bề mặt sứ mịn, bền đẹp, kháng khuẩn, chống bám bẩn giúp dễ dàng vệ sinh.',
 1);

INSERT INTO BienTheSanPham VALUES
(57,20,'Đại dương - 0.8L',480000,20,1,''),
(58,20,'Vườn nhà sương mờ - 0.8L',500000,18,1,''),
(59,20,'Đại dương - 1.1L',550000,20,1,''),
(60,20,'Vườn nhà sương mờ - 1.1L',580000,18,1,'');

INSERT INTO ChiTietBienThe VALUES
(57,2),(57,4),(57,35),(57,9),
(58,3),(58,4),(58,35),(58,9),
(59,2),(59,4),(59,36),(59,9),
(60,3),(60,4),(60,36),(60,9);

INSERT INTO hinhanhbienthe( MaBienThe, DuongDan) VALUES
(57,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773799162/daiduong2_wn1bmx.webp'),

(58,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773799161/suongmo1_l6pe0x.webp'),

(59,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773799162/daiduong2_wn1bmx.webp'),

(60,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773799162/suongmo2_pvy0q9.webp');

INSERT INTO SanPham VALUES
(21,10,'Bộ ấm trà Timeless IFP',
 'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773799426/untitled-2-33fcb174-b370-4fff-9d41-74b4ab26cd71_gukw9m.webp',
 'Minh Long IFP',0,
 'Bộ trà Timeless IFP là sự kết hợp độc đáo giữa nghệ thuật gốm sứ truyền thống và biểu tượng phong thủy thiêng liêng trong văn hóa Việt Nam. Với họa tiết Tứ Linh – Long, Lân, Quy, Phụng – được thể hiện tinh xảo trên nền men trắng ngà cao cấp, điểm xuyết bằng sắc xanh dương hài hòa và viền vàng 24k sang trọng, sản phẩm không chỉ là vật phẩm thưởng trà mà còn là biểu tượng cho sức mạnh, tài lộc và phúc khí.
Bộ sản phẩm thiết kế theo phong cách cổ điển pha lẫn hiện đại, với các chi tiết được chăm chút tỉ mỉ từ bình trà, tách, dĩa lót đến chén đường và rót sữa. Đây là lựa chọn lý tưởng cho các buổi trà chiều tao nhã, những buổi tiếp khách đẳng cấp hay làm quà biếu trang trọng, ý nghĩa.',
 1);

INSERT INTO BienTheSanPham VALUES
(61,21,'Tứ Linh',3350000,10,1,'');

INSERT INTO ChiTietBienThe VALUES
(61,16),(61,4),(61,10);

INSERT INTO hinhanhbienthe( MaBienThe, DuongDan) VALUES
(61,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773799426/55656_dowbx2.webp'),

(61,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773799427/tulinh_z8eovd.webp');

INSERT INTO SanPham VALUES
(22,10,'Bộ ấm trà Đài Các',
 'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773799897/daicac1_n6eurh.webp',
 'Minh Long',0,
 'Đặc điểm nổi bật:
- Chất liệu sứ cao cấp từ Minh Long I – sáng bóng, bền đẹp, chịu sốc nhiệt tốt.
- Họa tiết bạch kim tinh xảo, sang trọng, không phai màu theo thời gian.
- Thiết kế hiện đại, phù hợp với phong cách sống thanh lịch, trang nhã.
- An toàn cho sức khỏe, không chứa chì hay kim loại nặng độc hại.
Phong cách:
- Hiện đại – Sang trọng – Trang nhã – Đẳng cấp
- Bộ trà Đài Các Bạch Kim là lựa chọn lý tưởng cho các buổi tiếp khách, thưởng trà hay làm quà tặng cao cấp trong các dịp đặc biệt như lễ Tết, tân gia, cưới hỏi.',
 1);

INSERT INTO BienTheSanPham VALUES
(62,22,'Đài Các - 0.8L',5820000,12,1,''),
(63,22,'Đài Các - 1.1L',6890000,10,1,'');

INSERT INTO ChiTietBienThe VALUES
(62,4),(62,35),(62,10),
(63,4),(63,36),(63,10);

INSERT INTO hinhanhbienthe( MaBienThe, DuongDan) VALUES
(62,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773799895/daicac2_sivoaw.webp'),
(62,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773799893/daicac3_ggpn9e.webp'),
(63,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773799899/daicac4_bzeqeu.webp');

INSERT INTO SanPham VALUES
(23,11,'Khay mứt Jasmine',
 'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773800243/imgi-64-avatar-9-f417d222913545108853c332a00c0779_fefars.png',
 'Minh Long',0,
 'Khay mứt 5 ngăn tròn Misc Assortment viền chỉ vàng là sự kết hợp hoàn hảo giữa thiết kế tinh tế và chất liệu cao cấp, mang đến vẻ sang trọng cho không gian tiếp khách trong mỗi dịp lễ Tết. Sản phẩm được chế tác từ gốm sứ cao cấp, phủ men sáng bóng, giúp dễ dàng vệ sinh và an toàn cho sức khỏe.
Phần nắp đậy có tay cầm hình bông hoa cách điệu, điểm xuyết viền vàng ánh kim tôn lên vẻ thanh lịch và đẳng cấp. Thiết kế 5 ngăn riêng biệt giúp bạn sắp xếp nhiều loại mứt, hạt, bánh kẹo một cách gọn gàng và thẩm mỹ.
Đặc điểm nổi bật:
- Chất liệu: Gốm sứ cao cấp, phủ men bóng mịn.
- Thiết kế: Tròn 5 ngăn tiện lợi, có nắp đậy kín.
- Họa tiết: Tay cầm hình hoa, viền chỉ vàng sang trọng.
- Màu sắc: Trắng tinh khôi, viền vàng ánh kim nổi bật.
Phù hợp sử dụng trong dịp Tết, lễ hội, hoặc làm quà tặng ý nghĩa.',
 1);

INSERT INTO BienTheSanPham VALUES
(64,23,'Tiêu chuẩn',320000,20,1,'');

INSERT INTO ChiTietBienThe VALUES
(64,2),(64,4),(64,9);

INSERT INTO hinhanhbienthe( MaBienThe, DuongDan) VALUES
(64,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773800244/3-04a55a02-b8b9-45d2-bf30-0fba94bc3339_vcjp2r.webp'),
(64,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773800243/2-dff4e376-d7ab-4462-a965-0c7f269551b9_g5tchw.webp');

INSERT INTO SanPham VALUES
(24,11,'Khay mứt Camellia',
 'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773800475/ca_c2qqqk.png',
 'Minh Long',0,
 '🌸 Đặc điểm nổi bật:
Thiết kế 5 ngăn tiện lợi: Giúp phân loại mứt, bánh kẹo, hạt khô một cách gọn gàng, tinh tế.
Họa tiết hoa đào viền vàng: Từng nhánh hoa đào được vẽ tỉ mỉ trên nền sứ hồng phấn trang nhã, kết hợp viền vàng ánh kim cao cấp, tạo điểm nhấn sang trọng.
Chất liệu: Gốm sứ cao cấp, phủ men bóng mịn, bền đẹp, an toàn cho sức khỏe.
Nắp đậy kín, tay cầm hoa mạ vàng: Vừa tiện dụng vừa làm nổi bật sự quý phái của sản phẩm.
Kích thước: Đường kính 24 cm, phù hợp trưng bày bàn trà, bàn tiếp khách hoặc làm quà biếu cao cấp.
🎁 Công dụng:
Đựng mứt, bánh kẹo, hạt dưa, hạt điều, trái cây sấy hoặc các loại hạt khô khác.
Dùng làm vật phẩm trang trí Tết hoặc quà tặng sang trọng cho người thân, đối tác.
Góp phần làm nổi bật không gian Tết truyền thống, mang đến vẻ đẹp ấm cúng và thịnh vượng.',
 1);

INSERT INTO BienTheSanPham VALUES
(65,24,'Tiêu chuẩn',1350000,18,1,'');

INSERT INTO ChiTietBienThe VALUES
(65,3),(65,4),(65,9);

INSERT INTO hinhanhbienthe( MaBienThe, DuongDan) VALUES
(65,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773800476/1-08529619-6869-4b80-8331-89256a2ec9ea_dkv0vc.png'),
(65,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773800473/2-0f1307b8-78c4-4dbd-a1d5-964ab79e39e8_pa1tql.png');

INSERT INTO SanPham VALUES
(25,11,'Khay mứt Hoàng Cung',
 'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773800736/hc1_qxx3po.png',
 'Minh Long IFP',0,
 'Bộ khay mứt cao cấp với thiết kế tinh xảo, mang đậm phong cách sang trọng và hiện đại. Sản phẩm gồm 5 hũ gốm có nắp, được sắp xếp gọn gàng trên đĩa tròn đường kính 31.5 cm, thuận tiện cho việc trưng bày và sử dụng trong các dịp lễ Tết hay tiếp khách.
Chất liệu: Gốm sứ cao cấp IFP, phủ men sáng bóng, bền màu theo thời gian.
Họa tiết: Trang trí hoa văn Thiên Kim tinh tế, phối màu đỏ - vàng kim sang trọng, điểm nhấn bằng viền chỉ vàng thủ công.
Công dụng: Dùng để đựng mứt, bánh kẹo, hạt hoặc các món ăn vặt, thích hợp cho phòng khách, bàn trà, quà biếu cao cấp.',
 1);

INSERT INTO BienTheSanPham VALUES
(66,25,'Tiêu chuẩn',7520000,15,1,'');

INSERT INTO ChiTietBienThe VALUES
(66,16),(66,4),(66,10);

INSERT INTO hinhanhbienthe( MaBienThe, DuongDan) VALUES
(66,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773800738/hc3_ufoldz.webp'),
(66,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773800739/hc2_r9lbps.png');

INSERT INTO SanPham VALUES
(26,11,'Khay mứt IFP',
 'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773800921/imgi-37-khay-mut-tron-5-ngan-24cm-nap-misc-assortment-sen-ngoc-212471456h-1-sm-4f2cfa9f4fb544d181dc12c356124c6f_rfgpsx.webp',
 'Minh Long',0,
 '💎 Đặc điểm nổi bật:
Thiết kế 5 ngăn tiện dụng: Các ngăn được sắp xếp khéo léo bên trong khay tròn, giúp phân chia mứt, bánh kẹo hoặc hạt khô gọn gàng, đẹp mắt.
Hoa văn Sen Ngọc: Họa tiết hoa sen màu xanh lam kết hợp viền vàng sang trọng, tạo nên vẻ đẹp thanh lịch và quý phái.
Chất liệu: Gốm sứ cao cấp Misc Assortment, tráng men sáng bóng, an toàn cho sức khỏe, không phai màu theo thời gian.
Nắp đậy tinh xảo: Tay cầm hình hoa sen mạ vàng, điểm nhấn độc đáo cho tổng thể thiết kế.
Kích thước: Đường kính 24 cm, phù hợp trưng bày trên bàn trà, bàn khách hoặc làm quà tặng cao cấp.',
 1);

INSERT INTO BienTheSanPham VALUES
(67,26,'Tiêu chuẩn',5600000,10,1,'');

INSERT INTO ChiTietBienThe VALUES
(67,16),(67,4),(67,10);

INSERT INTO hinhanhbienthe( MaBienThe, DuongDan) VALUES
(67,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773800922/c371e4ef-bc7f-49fa-9a8b-f8750bbd3d03_qej65r.webp'),
(67,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773800924/gemini-generated-image-hyr3i6hyr3i6hyr3_zwi3vx.png');

INSERT INTO SanPham VALUES
(27,11,'Khay mứt Đài Các',
 'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773801102/dc1_sm774c.png',
 'Minh Long',0,
 '🌸 Đặc điểm nổi bật:
Thiết kế Ngũ Sắc tượng trưng cho ngũ hành – Kim, Mộc, Thủy, Hỏa, Thổ, mang ý nghĩa may mắn và thịnh vượng cho gia chủ.
Họa tiết hoa nổi bật: Mỗi hũ được trang trí một loài hoa khác nhau như hoa hồng, hướng dương, lan, mai, cúc, tượng trưng cho sự tươi mới, tài lộc và hạnh phúc.
Chất liệu: Gốm sứ cao cấp IFP, phủ men sáng bóng, an toàn cho sức khỏe, bền màu theo thời gian.
Kích thước: Khay tròn đường kính 31.5 cm.
🎁 Công dụng:
Dùng để đựng mứt, bánh kẹo, hạt khô, trái cây sấy hoặc các món ăn vặt.
Phù hợp trưng bày trong phòng khách, bàn trà, bàn tiệc hay làm quà tặng sang trọng cho người thân, đối tác, khách hàng vào các dịp lễ Tết.
💫 Ưu điểm:
Hoa văn in men cao cấp, không phai, không bong tróc.
Dễ vệ sinh, chịu được nhiệt độ cao.
Vẻ đẹp nghệ thuật tinh xảo, thích hợp với nhiều không gian nội thất khác nhau.',
 1);

INSERT INTO BienTheSanPham VALUES
(68,27,'Tiêu chuẩn',9480000,12,1,'');

INSERT INTO ChiTietBienThe VALUES
(68,4),(68,10);

INSERT INTO hinhanhbienthe( MaBienThe, DuongDan) VALUES
(68,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773801104/dc2_wmlhvt.png'),
(68,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773801106/dc3_sn7onq.png');

INSERT INTO SanPham VALUES
(28,12,'Bát hương Phúc Lộc',
 'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773801851/RD060723-2-removebg-preview_vnbzkb.png',
 'Thiên Long',0,
 'Nguyên liệu chính để tạo nên bát hương hay một vật phẩm linh thiêng khác cho ban thờ được nhiều người tin dùng đó chính là gốm chất lượng cao.
Chỉ với những cục đất sét, những người thợ gốm lành nghề có thể tạo nên những bát hương vừa sang trọng vừa uy nghiêm.
Vì được sản xuất bởi những những bàn tay điêu luyện của các nghệ nhân nên sản phẩm sở hữu độ bền rất cao, không dễ bị phai màu hay sứt mẻ.',
 1);

INSERT INTO BienTheSanPham VALUES
(69,28,'Tiêu chuẩn',1450000,20,1,'');

INSERT INTO ChiTietBienThe VALUES
(69,5),(69,7),(69,10);

INSERT INTO hinhanhbienthe( MaBienThe, DuongDan) VALUES
(69,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773801851/RD060723-2-removebg-preview_vnbzkb.png'),
(69,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773801851/250500-17_o6m68x.jpg');

INSERT INTO SanPham VALUES
(29,12,'Bát hương An Khang',
 'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773802048/bat-huong-vuot-tay-ve-sen-bat-trang-14-removebg-preview_m665rp.png',
 'Thiên Long',0,
 'Bát hương An Khang mang ý nghĩa bình an, sức khỏe và thuận hòa.',
 1);

INSERT INTO BienTheSanPham VALUES
(70,29,'Tiêu chuẩn',430000,18,1,'');

INSERT INTO ChiTietBienThe VALUES
(70,5),(70,6),(70,10);

INSERT INTO hinhanhbienthe( MaBienThe, DuongDan) VALUES
(70,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773802048/bat-huong-vuot-tay-ve-sen-bat-trang-14-removebg-preview_m665rp.png'),
(70,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773802049/bat-huong-vuot-tay-ve-sen-bat-trang-13_fy1gxf.jpg');

INSERT INTO SanPham VALUES
(30,12,'Bát hương Tài Lộc',
 'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773804534/16_oclfhw.png',
 'Thiên Long',0,
 'Bát hương màu vàng vẽ ánh kim 030723 có thiết kế khá nổi bật và gây ấn tượng với nhiều người nhờ màu men vàng sang trọng và vẽ tay ánh kim siêu tinh tế.
Những họa tiết hoa văn như rồng bay được vẽ ánh kim vừa mềm mại vừa tăng thêm vẻ sang trọng, cao cấp cho bát hương.
Để có thể tạo nên một sản phẩm đẹp hoàn hảo tới vô thực như vậy đòi hỏi tay nghề của người nghệ nhân phải chắc chắn, điêu luyện qua nhiều năm rèn luyện.',
 1);

INSERT INTO BienTheSanPham VALUES
(71,30,'Tiêu chuẩn',1480000,15,1,'');

INSERT INTO ChiTietBienThe VALUES
(71,5),(71,8),(71,10);

INSERT INTO hinhanhbienthe( MaBienThe, DuongDan) VALUES
(71,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773804534/16_oclfhw.png'),
(71,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773804533/4_tmej86.png');

INSERT INTO SanPham VALUES
(31,12,'Bát hương Thiên Phúc',
 'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773804774/hi_w1zoxk.png',
 'Thiên Long',0,
 'Bát hương Thiên Phúc mang ý nghĩa phúc lành từ trời, phù hợp không gian thờ cúng trang nghiêm.',
 1);

INSERT INTO BienTheSanPham VALUES
(72,31,'Tiêu chuẩn',2500000,12,1,'');

INSERT INTO ChiTietBienThe VALUES
(72,5),(72,7),(72,10);

INSERT INTO hinhanhbienthe( MaBienThe, DuongDan) VALUES
(72,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773804774/hi_w1zoxk.png');

INSERT INTO SanPham VALUES
(32,12,'Bát hương Hưng Thịnh',
 'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773805039/1h_wtadu2.png',
 'Minh Long',0,
 'Bát hương Hưng Thịnh tượng trưng cho sự phát triển bền vững và thịnh vượng lâu dài.',
 1);

INSERT INTO BienTheSanPham VALUES
(73,32,'Tiêu chuẩn',1520000,10,1,'');

INSERT INTO ChiTietBienThe VALUES
(73,5),(73,8),(73,10);

INSERT INTO hinhanhbienthe( MaBienThe, DuongDan) VALUES
(73,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773805039/1h_wtadu2.png'),
(73,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773805038/bat-huong-bat-trang-mau-xanh-5_jna3zc.jpg');

INSERT INTO SanPham VALUES
(33,13,'Mâm bồng Men Xanh Tím Đắp Nổi Vẽ Vàng Sen Cá ',
 'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773805677/1_pnrsfd.png',
 'Bát Tràng',0,
 'Mâm bồng sứ Bát Tràng men xanh tím đắp nổi vẽ vàng sen cá là một sản phẩm đồ thờ gốm sứ truyền thống của làng nghề Bát Tràng.
Mâm bồng sứ Bát Tràng là một vật phẩm không thể thiếu trong bộ đồ thờ cúng của người Việt.
Mâm bồng có tác dụng đựng hoa quả, trầu cau, bánh kẹo,… để dâng lên bàn thờ gia tiên, thần linh,… thể hiện lòng thành kính, hiếu thảo của con cháu đối với ông bà, tổ tiên.',
 1);

INSERT INTO BienTheSanPham VALUES
(74,33,'18cm',1480000,20,1,''),
(75,33,'20cm',3320000,18,1,'');

INSERT INTO ChiTietBienThe VALUES
(74,5),(74,7),(74,10),(74,18),
(75,5),(75,7),(75,10),(75,19);

INSERT INTO hinhanhbienthe( MaBienThe, DuongDan) VALUES
(74,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773805677/1_pnrsfd.png'),
(75,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773805677/mam-bong-su-bat-trang-ve-vang-4-7_wsaiu7.jpg');

INSERT INTO SanPham VALUES
(34,13,'Mâm bồng Lục bảo',
 'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773817113/th_d3fk3p.png',
 'Bát Tràng',0,
 'Mâm bồng sứ men xanh ngọc lục bảo rồng phượng là một sản phẩm cao cấp, thể hiện sự sang trọng và đẳng cấp của gia chủ.
Bằng việc lựa chọn loại nguyên liệu chế tác cao cấp, kỹ thuật làm gốm gia truyền và tài năng thiết kế, vẽ hoạ tiết của các nghệ nhân Bát Tràng, đây sẽ là vật phẩm lý tưởng mà gia chủ không nên bỏ qua.',
 1);

INSERT INTO BienTheSanPham VALUES
(76,34,'18cm',270000,20,1,''),
(77,34,'20cm',310000,18,1,'');

INSERT INTO ChiTietBienThe VALUES
(76,5),(76,6),(76,10),(76,18),
(77,5),(77,6),(77,10),(77,19);

INSERT INTO hinhanhbienthe( MaBienThe, DuongDan) VALUES
(76,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773817113/th_d3fk3p.png'),
(77,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773817112/bat-huong-mau-xanh-ngoc-luc-bao-NNND-tran-do-5_ysg9tk.jpg');

INSERT INTO SanPham VALUES
(35,13,'Mâm bồng Tài Lộc',
 'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773817512/th-removebg-preview_xewyew.png',
 'Bát Tràng',0,
 'Mâm bồng trên bàn thờ không chỉ là nơi bày lễ vật mà còn là biểu tượng của lòng hiếu thảo và biết ơn, nhắc nhở con cháu luôn gìn giữ truyền thống “Uống nước nhớ nguồn”. Việc dâng hoa quả, bánh trái lên mâm bồng thể hiện mong ước bình an, phúc lộc và sự phù hộ của tổ tiên cho gia đình.
Đồng thời, mâm bồng còn mang ý nghĩa đầy đủ và viên mãn, thu hút tài lộc và may mắn đến với gia chủ.',
 1);

INSERT INTO BienTheSanPham VALUES
(78,35,'18cm',1300000,15,1,''),
(79,35,'20cm',1340000,12,1,'');

INSERT INTO ChiTietBienThe VALUES
(78,5),(78,8),(78,10),(78,18),
(79,5),(79,8),(79,10),(79,19);

INSERT INTO hinhanhbienthe( MaBienThe, DuongDan) VALUES
(78,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773817113/th_d3fk3p.png'),
(79,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773817509/th2_mhxlqp.webp');

INSERT INTO SanPham VALUES
(36,14,'Lục bình Phúc Lộc',
 'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773818260/thum-removebg-preview_f0xndm.png',
 'Bát Tràng',0,
 'Nổi bật ở phần thân lọ là 4 bức tranh miêu tả về 4 mùa Xuân Hạ Thu Đông với những hình ảnh về loài hoa, loài cây, loài vật tương ứng của mỗi mùa.
Mùa xuân là mùa của những sự khởi đầu, hi vọng tốt đẹp về tương lai, tài lộc, hạnh phúc lứa đôi được thể hiện bằng hình ảnh của loài hoa mai và đôi công với bộ lông trải dài lộng lẫy.
Mùa hạ là hình ảnh của loài trúc xanh mướt quanh năm biểu tượng của phẩm chất con người: kiên cường, rắn rỏi đồng thời cũng mang ý nghĩa về sức khỏe, về sự may mắn, trường thọ.
Mùa thu với hình ảnh ấm áp rực rỡ của loài hoa cúc biểu tượng của sự cao sang quyền quý với ý nghĩa về sự cát tường, tài lộc và thịnh vượng.
Mùa đông là mùa của sự khắc nghiệt, nổi bật lên hình ảnh của loài Tùng mạnh mẽ, khỏe khoắn biểu tượng của khí tiết và sự trường thọ.   ',
 1);

INSERT INTO BienTheSanPham VALUES
(80,36,'130cm',11200000,5,1,''),
(81,36,'140cm',11800000,4,1,''),
(82,36,'150cm',12500000,3,1,'');

INSERT INTO ChiTietBienThe VALUES
(80,5),(80,7),(80,10),(80,38),
(81,5),(81,7),(81,10),(81,39),
(82,5),(82,7),(82,10),(82,40);

INSERT INTO hinhanhbienthe( MaBienThe, DuongDan) VALUES
(80,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773818260/thum-removebg-preview_f0xndm.png'),
(81,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773818263/lo-loc-binh-bat-trang-men-lam-tu-quy-ve-ky-1m4_3__05042024083734_dp4oak.jpg'),
(82,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773818263/lo-loc-binh-bat-trang-men-lam-tu-quy-ve-ky-1m4_3__05042024083734_dp4oak.jpg');

INSERT INTO SanPham VALUES
(37,14,'Lục bình Tùng Hạc Ngũ Phúc ',
 'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773818673/thum1-removebg-preview_gqxsgp.png',
 'Bát Tràng',0,
 ' Đáng được chú ý nhất chính là họa tiết Tùng Hạc Ngũ Phúc được vẽ rất tỉ mỉ, khéo léo từ đôi tay những nghệ nhân Bát Tràng.
Chi tiết Tùng Hạc Ngũ Phúc  được vẽ lên trên thân lọ là  hình ảnh rất tinh tế.
Ý nghĩa ngũ phúc là tượng trưng cho 5 điều tốt lành may mắn trong cuộc sống Lộc bình bát tràng ngũ phúc có là tượng trưng cho sự mới mẻ, mang lại may mắn, phát tài phát lộc cho gia chủ, đồng thời cũng có ý nghĩa là sự bảo quản tài sản cho gia chủ.',
 1);

INSERT INTO BienTheSanPham VALUES
(83,37,'130cm',11300000,5,1,''),
(84,37,'140cm',11900000,4,1,''),
(85,37,'150cm',12600000,3,1,'');

INSERT INTO ChiTietBienThe VALUES
(83,5),(83,7),(83,10),(83,38),
(84,5),(84,7),(84,10),(84,39),
(85,5),(85,7),(85,10),(85,40);

INSERT INTO hinhanhbienthe( MaBienThe, DuongDan) VALUES
(83,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773818673/thum1-removebg-preview_gqxsgp.png'),
(84,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773818677/tung_b6ptoj.jpg'),
(85,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773818675/tum_tts1va.jpg');

INSERT INTO SanPham VALUES
(38,14,'Lục bình Bát Tràng men lam Đức Phúc',
 'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773819006/thumm-removebg-preview_tz1uck.png',
 'Bát Tràng',0,
 'Lọ lộc bình Bát Tràng này nổi bật lên hình ảnh hai chữ Đức Phúc được vẽ tay cách điệu theo lối viết thư pháp lồng vào cuốn thư tạo cảm giác trang trọng và truyền thống.
Trên cổ lọ lộc bình là 2 câu đối:
‘’ Đức thừa tiên tổ thiên niên thịnh
  Phúc ấm nhi tôn bách thế vinh’’
Câu đối là lời răn dạy của tổ tiên về giá trị của đạo đức, răn dạy con cháu lễ nghĩa làm người, biết ơn thành kính với tổ tiên cha mẹ.
Phúc Đức đời trước đi liền với hiếu hạnh đời sau sẽ hưởng vinh hoa phú quý to lớn muôn đời cho cả dòng họ. ',
 1);

INSERT INTO BienTheSanPham VALUES
(86,38,'130cm',11350000,5,1,''),
(87,38,'140cm',11950000,4,1,''),
(88,38,'150cm',12700000,3,1,'');

INSERT INTO ChiTietBienThe VALUES
(86,5),(86,7),(86,10),(86,38),
(87,5),(87,7),(87,10),(87,39),
(88,5),(88,7),(88,10),(88,40);

INSERT INTO hinhanhbienthe( MaBienThe, DuongDan) VALUES
(86,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773819006/thumm-removebg-preview_tz1uck.png'),
(87,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773819011/1_w7ppen.jpg'),
(88,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773819012/2_tzxlcb.jpg');

INSERT INTO SanPham VALUES
(39,14,'Lục bình Tùng Hạc Diên Niên',
 'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773819294/tmh-removebg-preview_lsobgf.png',
 'Bát Tràng',0,
 'Lục bình Tùng Hạc Diên Niên tượng trưng cho trường thọ, sức khỏe và sự bền vững.',
 1);

INSERT INTO BienTheSanPham VALUES
(89,39,'130cm',11400000,5,1,''),
(90,39,'140cm',12000000,4,1,''),
(91,39,'150cm',12800000,3,1,'');

INSERT INTO ChiTietBienThe VALUES
(89,5),(89,7),(89,10),(89,38),
(90,5),(90,7),(90,10),(90,39),
(91,5),(91,7),(91,10),(91,40);

INSERT INTO hinhanhbienthe( MaBienThe, DuongDan) VALUES
(89,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773819294/tmh-removebg-preview_lsobgf.png'),
(90,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773819299/2_szhl4s.jpg'),
(91,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773819302/1_lmpqm2.jpg');

INSERT INTO SanPham VALUES
(40,14,'Lục bình Vinh Quy Bái Tổ ',
 'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773819660/tmhhh-removebg-preview_xue0e4.png',
 'Bát Tràng',0,
 'Lọ Lộc bình Bát Tràng men lam Vinh Quy Bái Tổ có ý nghĩa sâu sắc như đạo lý ‘’Uống nước nhớ nguồn’’ nhắc nhở những người con đi học, đi làm xa quê hương khi khi thành danh phải luôn nhớ và thể hiện lòng thành kính, biết ơn quê hương đất tổ, nơi mình đã sinh ra và lớn lên.',
 1);

INSERT INTO BienTheSanPham VALUES
(92,40,'130cm',11450000,5,1,''),
(93,40,'140cm',12100000,4,1,''),
(94,40,'150cm',12900000,3,1,'');

INSERT INTO ChiTietBienThe VALUES
(92,5),(92,7),(92,10),(92,38),
(93,5),(93,7),(93,10),(93,39),
(94,5),(94,7),(94,10),(94,40);

INSERT INTO hinhanhbienthe( MaBienThe, DuongDan) VALUES
(92,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773819660/tmhhh-removebg-preview_xue0e4.png'),
(93,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773819658/lo-loc-binh-bat-trang-men-lam-vinh-quy-bai-to-ve-ky-1m6-2_21112020070906_tjva15.jpg'),
(94,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773819656/lo-loc-binh-bat-trang-men-lam-vinh-quy-bai-to-ve-ky-1m6-1_21112020070906_q9zrqh.jpg');

INSERT INTO SanPham VALUES
(41,15,'Tượng Cặp Kỳ Lân',
 'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773820271/kilan_thumb_uq3cmb.png',
 'Minh Long I',0,
 'Kỳ lân là một trong tứ linh (long, lân, quy, phụng), vốn được xem là linh vật xua đuổi tà ma, hóa giải tam sát và mang đến điềm lành, được người phương Đông đặc biệt trân quý.
Tượng kỳ lân tám màu của Minh Long I là tác phẩm mỹ nghệ hiện thực hóa sinh động nét văn hóa dân gian vốn có nhưng không kém phần vương giả, hiện đại.',
 1);

INSERT INTO BienTheSanPham VALUES
(95,41,'Tiêu chuẩn',167820000,10,1,'');

INSERT INTO ChiTietBienThe VALUES
(95,5),(95,7),(95,10);

INSERT INTO hinhanhbienthe( MaBienThe, DuongDan) VALUES
(95,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773820304/0003200403_277520591fa24bd4bbeec9bb01ac06cd_afla1d.jpg');

INSERT INTO SanPham VALUES
(42,15,'Tượng Chuột Phong Thủy',
 'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773820414/tmhun_ympmgn.png',
 'Minh Long II',0,
 'Tượng Chuột tượng trưng cho sự thông minh, nhanh nhẹn và khả năng tích lũy tài lộc.',
 1);

INSERT INTO BienTheSanPham VALUES
(96,42,'Tiêu chuẩn',1480000,12,1,'');

INSERT INTO ChiTietBienThe VALUES
(96,5),(96,6),(96,10);

INSERT INTO hinhanhbienthe( MaBienThe, DuongDan) VALUES
(96,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773820414/tmhun_ympmgn.png');

INSERT INTO SanPham VALUES
(43,15,'Tượng Rắn Thanh Xà',
 'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773820584/ran1_vgqqxu.png',
 'Minh Long I',0,
 'Tượng Rắn biểu tượng cho trí tuệ, sự khéo léo và khả năng thích nghi trong cuộc sống.',
 1);

INSERT INTO BienTheSanPham VALUES
(97,43,'Tiêu chuẩn',520000,10,1,'');

INSERT INTO ChiTietBienThe VALUES
(97,5),(97,7),(97,10);

INSERT INTO hinhanhbienthe( MaBienThe, DuongDan) VALUES
(97,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773820584/ran1_vgqqxu.png'),
(97,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773820587/ran3_zahiez.png');

INSERT INTO SanPham VALUES
(44,15,'Tượng Bảo Mã Phong Thủy',
 'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773820771/th11_iuziq8.png',
 'Minh Long II',0,
 'Từ thuở xa xưa, Ngựa là biểu tượng của ý chí, sức mạnh, trí tuệ và lòng trung thành.
Không chỉ đồng hành cùng các bậc quân vương, tráng sĩ xông pha trận mạc, Ngựa còn gắn bó với con người trên hành trình khai phá và mở mang bờ cõi.
Ở loài vật này, hội tụ sức mạnh của thể lực, sự bền bỉ của ý chí cũng như vẻ đẹp khôi ngô tuấn tú.
Bởi thế, trong sử thi nhân loại, duy chỉ Ngựa mới được gọi là “tuấn mã”. ',
 1);

INSERT INTO BienTheSanPham VALUES
(98,44,'Tiêu chuẩn',11700000,8,1,'');

INSERT INTO ChiTietBienThe VALUES
(98,5),(98,8),(98,10);

INSERT INTO hinhanhbienthe( MaBienThe, DuongDan) VALUES
(98,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773820771/th11_iuziq8.png'),
(98,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773820778/bao-ma-10-5-background_miqhyg.png'),
(98,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773820775/7fe580d7-e65f-43d5-8224-b59fba93e5f6_ppeiyd.png');

INSERT INTO SanPham VALUES
(45,15,'Tượng Rồng Long Phù Đại Khánh',
 'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773821091/tai-xuong-90-edd3af80-c18a-4cdf-a915-cd018685d692_fatup3.png',
 'Minh Long I',0,
 'Long Phù Đại Khánh kết hợp dáng đứng uy phong của Rồng thần cùng dáng hình thiêng liêng của đất nước.
Với tư thế hiên ngang, lớp vảy long lanh rực rỡ, Rồng thần mang theo sứ mệnh cao cả và nhân văn: bảo vệ giang sơn, giữ vững cơ đồ, mang lại phúc lành cùng sự thịnh vượng.
Chế tác còn nổi bật với chi tiết mỏ vàng tượng trưng cho báu vật thiên nhiên đã ban tặng cho đất nước, cũng là kết tinh lao động sáng tạo của con người Việt Nam.
Dưới đôi tay tài hoa của các nghệ nhân Minh Long giàu kinh nghiệm, tượng Rồng Long Phù Đại Khánh còn tái hiện vẻ đẹp thiên nhiên hùng vĩ, nên thơ.
Giữa nắng vàng rực rỡ và biển cả bao la, Rồng mang nguồn năng lượng dồi dào của đất trời, trao truyền sức mạnh để tiếp tục gìn giữ, phát huy những giá trị tinh hoa của văn hóa, con người và đất nước.',
 1);

INSERT INTO BienTheSanPham VALUES
(99,45,'Tiêu chuẩn',850000,8,1,'');

INSERT INTO ChiTietBienThe VALUES
(99,5),(99,7),(99,10);

INSERT INTO hinhanhbienthe( MaBienThe, DuongDan) VALUES
(99,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773821091/tai-xuong-90-edd3af80-c18a-4cdf-a915-cd018685d692_fatup3.png'),
(99,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773821094/tmmtt_iugrg7.png'),
(99,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773821089/rong-white-b3a1698c-6087-4b10-ac1e-c285fa61c369_jgnxou.png');

INSERT INTO SanPham VALUES
(46,16,'Tượng cô gái gốm',
 'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773821674/thutm-removebg-preview_puu3ht.png',
 'Fixory',0,
 'Tượng cô gái gốm mang vẻ đẹp nhẹ nhàng, thanh lịch, phù hợp trang trí phòng khách, kệ sách hoặc bàn làm việc.',
 1);

INSERT INTO BienTheSanPham VALUES
(100,46,'Tiêu chuẩn',320000,15,1,'');

INSERT INTO ChiTietBienThe VALUES
(100,5),(100,6),(100,11);

INSERT INTO hinhanhbienthe( MaBienThe, DuongDan) VALUES
(100,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773821674/thutm-removebg-preview_puu3ht.png'),
(100,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773821669/sg-11134201-81zuq-mivqnglnhd6r59_zwemyy.webp'),
(100,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773821666/sg-11134201-81zti-mivqngl6mi9t88_khl9et.webp');

INSERT INTO SanPham VALUES
(47,16,'Tượng chim gốm nghệ thuật',
 'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773821875/mtmtm-removebg-preview_iyllo2.png',
 'Bát Tràng',0,
 'Tượng chim gốm mang ý nghĩa tự do và nhẹ nhàng, phù hợp decor không gian sống hiện đại.',
 1);

INSERT INTO BienTheSanPham VALUES
(101,47,'Tiêu chuẩn',280000,20,1,'');

INSERT INTO ChiTietBienThe VALUES
(101,5),(101,7),(101,9);

INSERT INTO hinhanhbienthe( MaBienThe, DuongDan) VALUES
(101,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773821872/mtmtm_vvk8i5.jpg');

INSERT INTO SanPham VALUES
(48,16,'Tượng voi gốm decor',
 'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773822165/voi_tht-removebg-preview_iowdft.png',
 'Bát Tràng',0,
 'Tượng voi gốm mang phong cách trang trí hiện đại, biểu tượng cho sự bền bỉ và may mắn.',
 1);

INSERT INTO BienTheSanPham VALUES
(102,48,'Tiêu chuẩn',350000,12,1,'');

INSERT INTO ChiTietBienThe VALUES
(102,5),(102,8),(102,9);

INSERT INTO hinhanhbienthe( MaBienThe, DuongDan) VALUES
(102,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773822145/voi_tht_izauqu.webp'),
(102,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773822149/vn-11134201-7ras8-mbvj2cg2r14i5e_resize_w900_nl_bxavp5.webp'),
(102,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773822141/vn-11134201-7ras8-mbvj2bwni3md42_resize_w900_nl_s26ann.webp');

INSERT INTO SanPham VALUES
(49,16,'Tượng Gà Đại Các',
 'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773822733/ga_kiv27f.png',
 'Bát Tràng',0,
 'Tượng gà gốm mang phong cách tối giản, tạo điểm nhấn tinh tế cho không gian sống.',
 1);

INSERT INTO BienTheSanPham VALUES
(103,49,'Tiêu chuẩn',260000,18,1,'');

INSERT INTO ChiTietBienThe VALUES
(103,5),(103,6),(103,11);

INSERT INTO hinhanhbienthe( MaBienThe, DuongDan) VALUES
(103,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773822733/ga_kiv27f.png');

INSERT INTO SanPham VALUES
(50,17,'Bình hoa Đại Các',
 'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773823016/mtmt_ayvor6.webp',
 'Bát Tràng',0,
 'Ưu điểm nổi bật
✔️ Chất lượng gốm sứ cao cấp: Được nung ở nhiệt độ cao, đảm bảo độ bền, không dễ nứt vỡ, an toàn với môi trường.
✔️ Hoa văn vẽ tay tinh xảo: Mỗi sản phẩm là một tác phẩm nghệ thuật độc nhất, không trùng lặp.
✔️ Kích thước 41 cm cân đối: Phù hợp cho nhiều không gian trang trí khác nhau từ phòng khách, phòng làm việc đến sảnh lễ tân.
✔️ Phù hợp làm quà tặng cao cấp: Gửi gắm giá trị thẩm mỹ và sang trọng cho người nhận.',
 1);
INSERT INTO BienTheSanPham VALUES
(104,50,'Tiêu chuẩn',420000,15,1,'');

INSERT INTO ChiTietBienThe VALUES
(104,5),(104,8),(104,10);

INSERT INTO hinhanhbienthe(MaBienThe, DuongDan) VALUES
(104,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773823016/mtmt_ayvor6.webp'),
(104,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773823016/gemini-generated-image-j8mf14j8mf14j8mf-copy_esqit4.webp'),
(104,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773823016/gemini-generated-image-xoqexaxoqexaxoqe-copy_f5lcpq.webp');

INSERT INTO SanPham VALUES
(51,17,'Bình hoa trang trí - Hoa Đào',
 'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773823151/haha_cdbbmz.webp',
 'Bát Tràng',0,
 '• Sản phẩm được sản xuất từ nguyên liệu đất sét tinh tuyển, được chọn lọc và qua các quy trình sản xuất chuyên nghiệp, kỹ thuật cao, cùng với sự tâm huyết của các nghệ nhân, đảm bảo độ bền vững cao và sử dụng lâu dài.
• Sản phẩm được nung ở nhiệt độ cao (từ 1260℃ đến 1380℃) giúp loại bỏ tạp chất, đảm bảo an toàn cho sức khoẻ người tiêu dùng.
• Bề mặt sản phẩm trắng sáng và không bị ố vàng sau một thời gian sử dụng. Điều này làm cho sản phẩm sứ Minh Long trở thành lựa chọn hàng đầu cho các gia đình và doanh nghiệp khi muốn trang trí không gian sống hoặc sử dụng trong các bữa tiệc quan trọng.
• Sản phẩm được sản xuất với độ chính xác cao, tinh tế trong từng chi tiết, đảm bảo độ hoàn hảo tuyệt đối.
• Công nghệ Nano giúp bề mặt sứ mịn, bền đẹp, kháng khuẩn, chống bám bẩn giúp dễ dàng vệ sinh.',
 1);

INSERT INTO BienTheSanPham VALUES
(105,51,'Size 18cm',111260000,20,1,''),
(106,51,'Size 20cm',121260000,15,1,'');

INSERT INTO ChiTietBienThe VALUES
(105,1),(105,6),(105,11),
(106,1),(106,6),(106,11);

INSERT INTO hinhanhbienthe(MaBienThe, DuongDan) VALUES
(105,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773823151/gemini-generated-image-o36hnuo36hnuo36h-copy_rnjcih.webp'),
(106,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773823150/gemini-generated-image-rghgu1rghgu1rghg-copy_f8antj.webp');

INSERT INTO SanPham VALUES
(52,17,'Bình hoa - Hoa sen nền Vàng',
 'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773823508/sen_xqxoi8.webp',
 'Bát Tràng',0,
 'Bình hoa họa tiết hoa sen mang đậm nét truyền thống Việt.
LƯU Ý SỬ DỤNG BẢO QUẢN:
• Sản phẩm có thể được sử dụng trong nhiều mục đích khác nhau, từ trang trí nhà cửa, phòng khách, phòng ngủ, phòng ăn cho đến các không gian công cộng, khách sạn, nhà hàng, quán cà phê.
• Sản phẩm được thiết kế đa dạng về kiểu dáng và mẫu mã, phù hợp với nhiều phong cách trang trí khác nhau.
• Sản phẩm không sử dụng trong lò vi sóng, lò nướng, máy rửa chén.
• Không dùng sản phẩm để đựng các loại thực phẩm có tính ăn mòn cao như chanh, giấm, muối mặn…, giữ những thực phẩm này không tiếp xúc trực tiếp với những vùng sản phẩm được trang trí bằng kim loại quý (vàng, bạch kim)
• Không nung trực tiếp sản phẩm trên lửa.
• Làm sạch sản phẩm bằng vải mềm, miếng tẩy rửa và dung dịch tẩy rửa thông thường',
 1);

INSERT INTO BienTheSanPham VALUES
(107,52,'Hoa sen cổ điển',420000,12,1,'');

INSERT INTO ChiTietBienThe VALUES
(107,7),(107,10);

INSERT INTO hinhanhbienthe(MaBienThe, DuongDan) VALUES
(107,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773823508/df2a9909-ae76-4afc-aefb-234a24770e1f_vellon.webp'),
(107,'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773823508/14f53a9f-2cd4-4881-9045-e96ccafe5bf0_tzc5zy.webp');