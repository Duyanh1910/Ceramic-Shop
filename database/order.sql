-- =========================================================================
-- PHẦN 1: DỮ LIỆU ĐỐI TÁC VÀ CẤU HÌNH THANH TOÁN, VẬN CHUYỂN
-- =========================================================================

INSERT INTO NhaCungCap (MaNhaCC, TenNhaCC, Diachi, SDT) VALUES
(1, 'Gốm Sứ Minh Long', 'Bình Dương', '0274111111'),
(2, 'Gốm Sứ Bát Tràng', 'Hà Nội', '0243222222'),
(3, 'Healthy Cook', 'Bình Dương', '0274333333'),
(4, 'Gốm Chu Đậu', 'Hải Dương', '0220444444'),
(5, 'Gốm Sứ Hải Long', 'Hà Nội', '0243555555'),
(6, 'Xưởng Gốm Việt', 'Hà Nội', '0243666666'),
(7, 'Gốm Sứ Thanh Hà', 'Quảng Nam', '0235777777'),
(8, 'Gốm Sứ Bầu Trúc', 'Ninh Thuận', '0259888888'),
(9, 'Gốm Donghwa', 'Đồng Nai', '0251999999'),
(10, 'Gốm Sứ Phùng Gia', 'Hà Nội', '0243000000');

INSERT INTO PhuongThucThanhToan (MaPhuongThuc, TenPhuongThuc, MoTa, TrangThai) VALUES
(1, 'COD', 'Thanh toán tiền mặt khi nhận hàng', 1),
(2, 'VNPay', 'Thanh toán qua quét mã QR VNPay', 1),
(3, 'MetaMask', 'Thanh toán bằng Crypto qua ví MetaMask', 1),
(4, 'Momo', 'Thanh toán qua ví điện tử Momo', 1),
(5, 'ZaloPay', 'Thanh toán qua ví điện tử ZaloPay', 1);

INSERT INTO LoaiPhiVanChuyen (MaLoaiPhi, TenLoaiPhi, MoTa) VALUES
(1, 'Nội thành Hải Phòng', 'Giao trong nội thành HP'),
(2, 'Ngoại thành Hải Phòng', 'Giao các nơi ngoại thành HP'),
(3, 'Miền Bắc', 'Giao các tỉnh phía Bắc'),
(4, 'Miền Trung', 'Giao các tỉnh miền Trung'),
(5, 'Miền Nam', 'Giao các tỉnh phía Nam'),
(6, 'Hỏa tốc', 'Giao trong 2H nội thành HN'),
(7, 'Giao tiết kiệm', 'Giao chậm toàn quốc'),
(8, 'Hàng cồng kềnh', 'Phí cho hàng gốm sứ lớn (lục bình)'),
(9, 'Giao quốc tế', 'Giao hàng ra nước ngoài'),
(10, 'Nhận tại cửa hàng', 'Khách đến lấy trực tiếp (Miễn phí)');

INSERT INTO PhiVanChuyen (MaPhi, MaLoaiPhi, GiaTri) VALUES
(1, 1, 30000), (2, 2, 40000), (3, 3, 50000), (4, 4, 60000), (5, 5, 70000),
(6, 6, 100000), (7, 7, 35000), (8, 8, 200000), (9, 9, 500000), (10, 10, 0);

INSERT INTO LoaiKhuyenMai (MaLoaiKM, TenLoaiKM, MoTa) VALUES
(1, 'Giảm giá theo %', 'Giảm theo phần trăm tổng đơn'),
(2, 'Giảm tiền mặt', 'Trừ thẳng tiền vào tổng đơn'),
(3, 'Freeship', 'Miễn phí vận chuyển');

INSERT INTO KhuyenMai (MaKhuyenMai, MaLoaiKM, TenKhuyenMai, GiaTri, GiaTriToiThieu, GiamToiDa, NgayBatDau, NgayKetThuc, TrangThai) VALUES
(1, 1, 'Sale tháng 3/2026', 10, 500000, 100000, '2026-03-01', '2026-03-31', 1),
(2, 2, 'Tri ân khách hàng', 50000, 300000, 50000, '2026-01-01', '2026-12-31', 1),
(3, 3, 'Freeship toàn quốc', 30000, 1000000, 50000, '2026-03-15', '2026-03-20', 1);

-- =========================================================================
-- PHẦN 2: DỮ LIỆU GIỎ HÀNG VÀ ĐƠN HÀNG (Map với Khách hàng ID từ 1 đến 10)
-- =========================================================================

INSERT INTO GioHang (MaGioHang, MaKhachHang) VALUES
(1, 1), (2, 2), (3, 3), (4, 4), (5, 5), (6, 6), (7, 7), (8, 8), (9, 9), (10, 10);

INSERT INTO ChiTietGioHang (MaChiTietGH, MaGioHang, MaBienThe, SoLuong) VALUES
(1, 1, 1, 2), (2, 2, 4, 1), (3, 3, 7, 3), (4, 4, 11, 1), (5, 5, 15, 2),
(6, 6, 19, 5), (7, 7, 21, 6), (8, 8, 31, 1), (9, 9, 37, 10), (10, 10, 41, 1);

INSERT INTO DonHang (MaDonHang, MaKhachHang, NgayDat, TongTienHang, TongPhiVanChuyen, TongGiamGia, TongThanhToan, DiaChiGiaoHang, TenNguoiNhan, SDT, TrangThaiDonHang, TrangThaiThanhToan, MaPhuongThuc) VALUES
(1, 1, '2026-03-01', 500000, 30000, 0, 530000, '789 Ngõ Đất Nung, Đà Nẵng', 'Lê Khách Mua', '0987654321', 2, 1, 1),
(2, 2, '2026-03-02', 1200000, 30000, 50000, 1180000, '12 Lê Lợi, TP.HCM', 'Nguyễn Văn An', '0987654002', 2, 1, 2),
(3, 3, '2026-03-03', 800000, 50000, 0, 850000, '34 Quang Trung, Hà Nội', 'Trần Thị Bình', '0987654003', 2, 1, 3),
(4, 4, '2026-03-04', 3500000, 70000, 100000, 3470000, '56 Nguyễn Văn Linh, Đà Nẵng', 'Lê Văn Cường', '0987654004', 2, 1, 4),
(5, 5, '2026-03-05', 450000, 30000, 0, 480000, '78 Trần Hưng Đạo, Cần Thơ', 'Phạm Thị Dung', '0987654005', 1, 1, 1),
(6, 6, '2026-03-10', 900000, 40000, 0, 940000, '90 Hai Bà Trưng, TP.HCM', 'Hoàng Văn Em', '0987654006', 1, 0, 1),
(7, 7, '2026-03-12', 2100000, 50000, 100000, 2050000, '11 Đống Đa, Hà Nội', 'Vũ Thị Giang', '0987654007', 0, 0, 2),
(8, 8, '2026-03-15', 600000, 30000, 0, 630000, '22 Ngô Quyền, Hải Phòng', 'Đặng Văn Hải', '0987654008', 0, 0, 3),
(9, 9, '2026-03-16', 1500000, 60000, 50000, 1510000, '33 Tôn Đức Thắng, TP.HCM', 'Bùi Thị Hạnh', '0987654009', 0, 0, 4),
(10, 10, '2026-03-17', 5000000, 200000, 200000, 5000000, '44 Kim Mã, Hà Nội', 'Đỗ Văn Hùng', '0987654010', 0, 0, 2);

INSERT INTO ChiTietDonHang (MaCTDH, MaDonHang, MaBienThe, SoLuong, GiaBan, ThanhTien) VALUES
(1, 1, 1, 1, 500000, 500000), (2, 2, 4, 2, 600000, 1200000),
(3, 3, 19, 10, 80000, 800000), (4, 4, 61, 1, 3500000, 3500000),
(5, 5, 31, 1, 450000, 450000), (6, 6, 45, 2, 450000, 900000),
(7, 7, 70, 1, 2100000, 2100000), (8, 8, 21, 6, 100000, 600000),
(9, 9, 37, 10, 150000, 1500000), (10, 10, 80, 1, 5000000, 5000000);

INSERT INTO ChiTietKhuyenMaiDonHang (MaDonHang, MaKhuyenMai, SoTienChietKhau) VALUES
(2, 2, 50000), (4, 1, 100000), (7, 2, 100000), (9, 2, 50000), (10, 1, 200000);

INSERT INTO ChiTietPhiVanChuyenDonHang (MaDonHang, MaPhi, SoTienPhi) VALUES
(1, 1, 30000), (2, 1, 30000), (3, 3, 50000), (4, 5, 70000), (5, 1, 30000),
(6, 2, 40000), (7, 3, 50000), (8, 1, 30000), (9, 4, 60000), (10, 8, 200000);

INSERT INTO DanhGia (MaDanhGia, MaKhachHang, MaCTDH, DiemDanhGia, NoiDung, NgayGui, TrangThai) VALUES
(1, 1, 1, 5, 'Bát đĩa rất đẹp, đóng gói chống sốc cực kỳ cẩn thận', '2026-03-05', 1),
(2, 2, 2, 4, 'Hàng y hình nhưng chờ giao hàng hơi lâu', '2026-03-06', 1),
(3, 3, 3, 5, 'Bộ ấm trà sang trọng, làm quà biếu đối tác khen nức nở', '2026-03-07', 1),
(4, 4, 4, 5, 'Gốm Chu Đậu đỉnh cao, màu men lam sâu thẳm', '2026-03-08', 1),
(5, 5, 5, 4, 'Nồi đun giữ nhiệt tốt, nấu cháo nhanh nhừ', '2026-03-09', 1),
(6, 6, 6, 5, 'Mua thêm lần 2 vẫn ưng ý cách phục vụ của shop', '2026-03-10', 1),
(7, 7, 7, 3, 'Giao chậm mất 1 ngày so với dự kiến', '2026-03-11', 1),
(8, 8, 8, 5, 'Lục bình đẹp, nét vẽ tinh xảo', '2026-03-12', 1),
(9, 9, 9, 5, 'Giá hợp lý, chất lượng Minh Long không phải bàn', '2026-03-13', 1),
(10, 10, 10, 4, 'Đẹp nhưng khâu đóng gói nhìn hơi lộn xộn', '2026-03-14', 1);

-- =========================================================================
-- PHẦN 3: KHO HÀNG, LỊCH SỬ TỒN, HẬU MÃI (Map với Admin/Staff)
-- =========================================================================

-- Admin (MaNhanVien = 1) duyệt nhập lô lớn, Staff (MaNhanVien = 2) duyệt nhập lặt vặt
INSERT INTO PhieuNhap (MaPhieuNhap, MaNhaCC, MaNhanVien, NgayNhap, TongTien, GhiChu, TrangThai) VALUES
(1, 1, 1, '2026-01-10', 50000000, 'Nhập lô đầu năm Minh Long', 1),
(2, 2, 1, '2026-01-15', 30000000, 'Nhập bổ sung Bát Tràng', 1),
(3, 3, 2, '2026-02-01', 20000000, 'Nhập nồi sứ Healthy Cook', 1),
(4, 4, 2, '2026-02-10', 15000000, 'Nhập gốm trang trí', 1),
(5, 5, 1, '2026-02-20', 40000000, 'Nhập ấm trà', 1),
(6, 6, 2, '2026-03-01', 25000000, 'Nhập đầu tháng', 1),
(7, 7, 1, '2026-03-05', 10000000, 'Nhập lục bình Thanh Hà', 0),
(8, 8, 2, '2026-03-10', 5000000, 'Đang giao từ Ninh Thuận', 0),
(9, 9, 1, '2026-03-12', 8000000, 'Chờ duyệt', 0),
(10, 10, 2, '2026-03-15', 12000000, 'Chờ thanh toán Phùng Gia', 0);

INSERT INTO ChiTietPhieuNhap (MaChiTietPhieu, MaPhieuNhap, MaBienThe, SoLuong, GiaNhap, ThanhTien) VALUES
(1, 1, 1, 100, 300000, 30000000), (2, 1, 4, 50, 200000, 10000000),
(3, 2, 19, 200, 30000, 6000000), (4, 2, 21, 100, 50000, 5000000),
(5, 3, 31, 50, 150000, 7500000), (6, 3, 34, 50, 150000, 7500000),
(7, 4, 41, 200, 30000, 6000000), (8, 4, 45, 100, 50000, 5000000),
(9, 5, 61, 20, 1500000, 30000000), (10, 6, 70, 50, 200000, 10000000);

INSERT INTO LichSuTonKho (MaLichSu, MaBienThe, LoaiGiaoDich, SoLuongThayDoi, TonKhoHienTai, LoaiThamChieu, MaThamChieu, NgayTao) VALUES
(1, 1, 'Nhập Kho', 100, 100, 'Phiếu Nhập', 1, '2026-01-10'),
(2, 4, 'Nhập Kho', 50, 50, 'Phiếu Nhập', 1, '2026-01-10'),
(3, 1, 'Xuất Bán', -1, 99, 'Đơn Hàng', 1, '2026-03-01'),
(4, 4, 'Xuất Bán', -2, 48, 'Đơn Hàng', 2, '2026-03-02'),
(5, 19, 'Nhập Kho', 200, 200, 'Phiếu Nhập', 2, '2026-01-15'),
(6, 19, 'Xuất Bán', -10, 190, 'Đơn Hàng', 3, '2026-03-03'),
(7, 31, 'Nhập Kho', 50, 50, 'Phiếu Nhập', 3, '2026-02-01'),
(8, 31, 'Xuất Bán', -1, 49, 'Đơn Hàng', 5, '2026-03-05'),
(9, 61, 'Nhập Kho', 20, 20, 'Phiếu Nhập', 5, '2026-02-20'),
(10, 61, 'Xuất Bán', -1, 19, 'Đơn Hàng', 4, '2026-03-04');

INSERT INTO BaoHanh (MaBaoHanh, MaCTDH, NgayBatDau, NgayKetThuc, TrangThai, GhiChu) VALUES
(1, 1, '2026-03-01', '2027-03-01', 1, 'Bảo hành men 1 năm'), (2, 2, '2026-03-02', '2027-03-02', 1, 'Bảo hành men 1 năm'),
(3, 3, '2026-03-03', '2026-09-03', 1, 'Bảo hành sứt mẻ 6 tháng'), (4, 4, '2026-03-04', '2028-03-04', 1, 'Bảo hành 2 năm cao cấp'),
(5, 5, '2026-03-05', '2027-03-05', 1, 'Bảo hành nứt vỡ do nhiệt'), (6, 6, '2026-03-10', '2027-03-10', 1, 'Bảo hành 1 năm'),
(7, 7, '2026-03-12', '2027-03-12', 1, 'Bảo hành 1 năm'), (8, 8, '2026-03-15', '2026-09-15', 1, 'Bảo hành 6 tháng'),
(9, 9, '2026-03-16', '2028-03-16', 1, 'Bảo hành 2 năm'), (10, 10, '2026-03-17', '2027-03-17', 1, 'Bảo hành 1 năm');

INSERT INTO LichSuBaoHanh (MaLichSuBH, MaBaoHanh, NgayXuLy, NoiDungXuLy, TrangThai) VALUES
(1, 1, '2026-03-10', 'Khách báo lỗi men ố vàng, đã tiếp nhận yêu cầu.', 0),
(2, 1, '2026-03-12', 'Đã đổi trả sản phẩm mới cùng loại cho khách.', 1),
(3, 2, '2026-03-15', 'Tiếp nhận yêu cầu bảo hành do móp méo lúc nhận hàng.', 0),
(4, 3, '2026-03-16', 'Từ chối bảo hành do lỗi người dùng đánh rơi (có camera xác nhận).', 1),
(5, 4, '2026-03-17', 'Đang gửi sản phẩm về hãng Minh Long để thẩm định lỗi men.', 0),
(6, 5, '2026-03-18', 'Tiếp nhận lỗi nồi sứ bị nứt khi nấu bếp từ.', 0),
(7, 5, '2026-03-19', 'Đã xử lý xong, đổi nồi mới 100%.', 1),
(8, 6, '2026-03-10', 'Khách gọi hỏi thông tin kích hoạt bảo hành điện tử.', 1),
(9, 7, '2026-03-11', 'Nhân viên CSKH đã gọi điện xác nhận thời hạn bảo hành.', 1),
(10, 8, '2026-03-15', 'Tiếp nhận lỗi sứt mẻ ở đế lục bình.', 0);

INSERT INTO DoiTra (MaDoiTra, MaCTDH, SoLuongDoiTra, LyDo, TrangThai, NgayYeuCau) VALUES
(1, 1, 1, 'Hàng thực tế màu nhạt hơn so với hình trên web', 1, '2026-03-05'),
(2, 2, 1, 'Móp méo vỏ hộp và sứt mẻ góc bát do vận chuyển', 1, '2026-03-06'),
(3, 3, 2, 'Giao sai họa tiết (Đặt hoa đào giao hoa sen)', 0, '2026-03-10'),
(4, 4, 1, 'Kiểm tra hàng thấy có một vết nứt nhỏ dọc thân', 0, '2026-03-12'),
(5, 5, 1, 'Khách đổi ý muốn mua nồi dung tích to hơn (đổi từ 1L lên 2L)', 1, '2026-03-15'),
(6, 6, 1, 'Bát bị mẻ nhẹ phần viền', 1, '2026-03-12'),
(7, 7, 1, 'Men sứ có dấu hiệu bị lỗi chân kim', 0, '2026-03-13'),
(8, 8, 1, 'Thiếu đĩa lót của bộ ấm chén', 1, '2026-03-16'),
(9, 9, 1, 'Hộp quà tặng bị rách nát không thể đem biếu', 0, '2026-03-17'),
(10, 10, 1, 'Tượng gốm bị gãy một chi tiết nhỏ', 0, '2026-03-18');

INSERT INTO XuLyDoiTra (MaXuLy, MaDoiTra, HanhDong, GhiChu, NgayXuLy) VALUES
(1, 1, 'Hoàn tiền', 'Khách gửi trả hàng qua bưu điện, kế toán đã chuyển khoản hoàn 100%.', '2026-03-06'),
(2, 2, 'Đổi mới', 'Đã tạo đơn ship lại sản phẩm mới hoàn toàn miễn phí cho khách.', '2026-03-07'),
(3, 5, 'Đổi hàng bù tiền', 'Khách mang trực tiếp qua cửa hàng để đổi size lớn hơn, thu thêm phụ phí.', '2026-03-16'),
(4, 6, 'Hoàn tiền một phần', 'Thỏa thuận hoàn 20% giá trị, khách giữ lại bát mẻ để trồng cây.', '2026-03-13'),
(5, 8, 'Giao bổ sung', 'Xin lỗi khách và đã tạo mã vận đơn ship hỏa tốc đĩa lót bù.', '2026-03-16'),
(6, 1, 'Tiếp nhận', 'Đang chờ bưu cục hoàn hàng về kho để kiểm định.', '2026-03-05'),
(7, 2, 'Xác nhận', 'Xác nhận lỗi do J&T Express quăng quật hàng hóa.', '2026-03-06'),
(8, 5, 'Tiếp nhận', 'NV tại quầy đã nhận hàng hoàn của khách.', '2026-03-15'),
(9, 6, 'Xác nhận', 'Khách gửi video quay rõ quá trình bóc hộp, xác nhận lỗi.', '2026-03-12'),
(10, 8, 'Kiểm tra', 'Check lại camera khâu đóng gói xác nhận nhân viên bỏ sót.', '2026-03-16');

INSERT INTO RuiRo (MaRuiRo, MaDonHang, LoaiRuiRo, MoTa, TrangThai, NgayPhatHien) VALUES
(1, 1, 'Vận chuyển', 'Shipper Giao Hàng Tiết Kiệm làm rơi vỡ 1 bát cơm trong bộ.', 1, '2026-03-02'),
(2, 2, 'Thanh toán', 'Lỗi gateway VNPay, khách bị trừ tiền 2 lần nhưng hệ thống báo thất bại.', 1, '2026-03-03'),
(3, 3, 'Gian lận', 'Phát hiện tài khoản dùng tool spam mã giảm giá tân thủ.', 1, '2026-03-03'),
(4, 4, 'Hàng hóa', 'Lục bình xước dăm nhẹ do quy trình đóng gói dùng màng xốp nổ kém chất lượng.', 0, '2026-03-05'),
(5, 5, 'Vận chuyển', 'Mất mã vận đơn, thất lạc kiện hàng nồi sứ tại bưu cục trung chuyển.', 0, '2026-03-08'),
(6, 6, 'Khách hàng', 'Khách boom hàng, gọi điện thoại 10 cuộc không nghe máy, nhắn tin Zalo không rep.', 1, '2026-03-12'),
(7, 7, 'Vận chuyển', 'Giao trễ 5 ngày do ảnh hưởng thời tiết mưa bão ở khu vực miền Trung.', 0, '2026-03-17'),
(8, 8, 'Thanh toán', 'Thanh toán Crypto qua MetaMask bị pending lâu trên chuỗi do phí gas thấp.', 0, '2026-03-16'),
(9, 9, 'Kho bãi', 'Nhân viên kho dán nhầm bill, lấy nhầm bộ ấm chén loại rẻ tiền thay vì hàng cao cấp.', 1, '2026-03-17'),
(10, 10, 'Hệ thống', 'Lỗi đồng bộ API, đơn hàng đã thanh toán nhưng không nhảy vào hệ thống ERP để xử lý.', 1, '2026-03-17');

-- =========================================================================
-- PHẦN 4: TIN TỨC / BLOG (Viết rất dài chuẩn SEO)
-- Map với nhân viên Staff (MaNhanVien = 2) - Cô Nguyễn Thị Bán Hàng
-- =========================================================================

INSERT INTO TinTuc (MaTinTuc, MaNhanVien, TieuDe, NoiDung, HinhAnh, NgayTao) VALUES
(1, 2, 'Hướng Dẫn Toàn Tập: Cách Phân Biệt Gốm Sứ Bát Tràng Thật Và Giả Chuẩn Xác Nhất 2026',
'<p>Gốm sứ Bát Tràng từ lâu đã nổi danh với độ bền bỉ, nước men sâu thẳm và hoa văn tinh xảo mang đậm hồn cốt văn hóa Việt. Tuy nhiên, sự phát triển của thị trường đã kéo theo hệ lụy là hàng giả, hàng nhái, hàng Trung Quốc kém chất lượng "đội lốt" gốm Bát Tràng tràn lan. Để bảo vệ sức khỏe gia đình và tránh cảnh "tiền mất tật mang", CeramicShop gửi đến bạn cẩm nang phân biệt gốm sứ Bát Tràng thật - giả chuẩn xác nhất.</p>

<h3>1. Nghe Âm Thanh Phản Hồi Từ Gốm</h3>
<p>Một trong những đặc trưng nổi bật nhất của gốm Bát Tràng chính là nhiệt độ nung. Đất sét được tuyển chọn kỹ lưỡng và nung ở nhiệt độ rất cao (thường từ 1200°C đến 1380°C). Quá trình này giúp cốt gốm nóng chảy, liên kết chặt chẽ và loại bỏ hoàn toàn các tạp chất, kim loại nặng (như chì, cadmium).
Cách thử: Bạn dùng ngón tay hoặc một thanh gỗ nhỏ gõ nhẹ vào thành bát, đĩa. Nếu là gốm Bát Tràng chuẩn, âm thanh phát ra sẽ rất đanh, vang và thanh mảnh như tiếng kim loại (keng keng). Ngược lại, hàng giả nung ở nhiệt độ thấp sẽ phát ra âm thanh đục, trầm và nặng.</p>

<h3>2. Quan Sát Lớp Men Sứ</h3>
<p>Nước men là linh hồn của sản phẩm. Người nghệ nhân Bát Tràng phủ men trước khi đưa vào lò nung, khiến lớp men tan chảy và bao bọc lấy hoa văn. Do đó, men gốm Bát Tràng thật sờ vào luôn có cảm giác nhẵn thính, căng bóng và có chiều sâu. Dù sử dụng nhiều năm, lớp men vẫn không bị ngả màu hay trầy xước dễ dàng. Hàng Trung Quốc thường dán decal hoa văn rồi phủ men bóng lạnh nhẹ, sờ vào có thể thấy gợn tay, dùng một thời gian sẽ bị xỉn màu và ố vàng.</p>

<h3>3. Chi Tiết Hoa Văn: Sự Bất Hoàn Hảo Hoàn Mỹ</h3>
<p>Điểm giá trị nhất của gốm Bát Tràng là họa tiết được vẽ thủ công 100% bằng tay bởi các nghệ nhân lão luyện. Dù cùng một mẫu thiết kế (ví dụ họa tiết hoa sen, tùng cúc trúc mai), nhưng khi bạn so sánh hai chiếc bát cùng loại, các nét vẽ sẽ không bao giờ giống nhau hoàn toàn 100%. Nét vẽ có độ thanh đậm, nhấn nhá đậm chất nghệ thuật. Trái lại, gốm in decal công nghiệp sẽ có hoa văn giống hệt nhau như đúc, đường nét cứng nhắc, đôi khi màu sắc lại sặc sỡ đến mức thiếu tự nhiên.</p>

<h3>4. Độ Dày Và Trọng Lượng</h3>
<p>Hãy cầm sản phẩm lên tay! Gốm Bát Tràng được làm thủ công, vuốt tay nên cốt đất rất dày dặn. Khi cầm, bạn sẽ thấy đầm tay, nặng và vô cùng chắc chắn. Độ dày này cũng là yếu tố giúp bát đĩa Bát Tràng giữ nhiệt tốt hơn và khó bị mẻ khi va đập nhẹ. Hàng công nghiệp đúc khuôn thường rất mỏng, nhẹ và mong manh.</p>
<p>Hi vọng với những bí quyết trên, quý khách hàng có thể tự tin lựa chọn cho gia đình những bộ đồ ăn, ấm chén Bát Tràng chính hãng. CeramicShop cam kết 100% sản phẩm tại cửa hàng đều có nguồn gốc rõ ràng, bảo hành men sứ chính hãng.</p>',
'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773823508/14f53a9f-2cd4-4881-9045-e96ccafe5bf0_tzc5zy.webp', '2026-01-15 09:30:00'),

(2, 2, 'Tuyệt Chiêu Xử Lý Và Bảo Quản Nồi Sứ Dưỡng Sinh HealthyCook Đúng Cách Lần Đầu Sử Dụng',
'<p>Nồi sứ dưỡng sinh HealthyCook là cuộc cách mạng trong gian bếp hiện đại, mang lại những bữa ăn ngon khỏe nhờ cơ chế phát tia hồng ngoại làm chín thực phẩm từ bên trong. Để chiếc nồi "thần thánh" này luôn bền đẹp, không nứt vỡ và phát huy tối đa công dụng, việc "tôi nồi" (xử lý lần đầu) và bảo quản đúng cách là vô cùng quan trọng.</p>

<h3>Bước 1: "Tôi Nồi" Sứ - Nghi Thức Bắt Buộc Lần Đầu Tiên</h3>
<p>Khác với nồi kim loại, nồi sứ có những lỗ chân lông siêu nhỏ trên bề mặt mà mắt thường không thấy được. Việc "tôi nồi" giúp lấp đầy các mao mạch này, tăng khả năng chịu nhiệt và chống nứt vỡ cục bộ.
- <b>Cách thực hiện:</b> Khi mới mua về, rửa sạch nồi bằng nước rửa chén pha loãng. Sau đó, đổ nước vo gạo (hoặc pha một chút bột năng/bột mì vào nước) vào khoảng 2/3 nồi. Đun sôi hỗn hợp trên lửa nhỏ liu riu trong khoảng 10-15 phút. Tắt bếp, để nồi nguội hoàn toàn tự nhiên rồi mới đổ bỏ nước và rửa lại. Lớp tinh bột sẽ tạo thành một lớp màng bảo vệ vững chắc cho nồi.</p>

<h3>Bước 2: Nguyên Tắc "Sốc Nhiệt" - Kẻ Thù Số 1 Của Nồi Sứ</h3>
<p>Dù HealthyCook chịu nhiệt rất tốt, nhưng sự thay đổi nhiệt độ đột ngột (sốc nhiệt) vẫn là điều tối kỵ.
- <b>Không bao giờ</b> đặt nồi vừa lấy ra từ tủ lạnh lên bếp đang đỏ lửa. Hãy để nồi ra ngoài khoảng 15 phút cho hạ nhiệt độ về mức phòng.
- <b>Không bao giờ</b> đổ nước lạnh buốt vào nồi khi nồi đang nóng rực trên bếp. Nếu cần châm thêm nước khi đang nấu canh/hầm, hãy dùng nước ấm hoặc nước sôi.
- Khi nấu xong, hãy đặt nồi lên một chiếc rế lót nồi bằng gỗ hoặc vải, tránh đặt trực tiếp xuống mặt bàn đá granite hoặc nền gạch hoa lạnh lẽo.</p>

<h3>Bước 3: Điều Chỉnh Ngọn Lửa "Vừa Đủ"</h3>
<p>Nồi sứ dưỡng sinh giữ nhiệt cực kỳ khủng khiếp. Bạn không cần thiết phải dùng lửa quá to như nấu bằng nồi nhôm/inox. Hãy bắt đầu với mức lửa vừa, khi nước trong nồi bắt đầu sôi, hãy vặn lửa về mức nhỏ nhất. Thức ăn sẽ tự chín mềm từ bên trong, nước dùng trong vắt, không sủi bọt trào ra ngoài và đặc biệt tiết kiệm gas/điện đáng kể.</p>

<h3>Bước 4: Vệ Sinh Chăm Sóc Đúng Chuẩn</h3>
<p>Tuyệt đối không dùng búi sắt cọ nồi cứng để chà xát. Lớp men nano của Minh Long rất láng mịn, thức ăn hầu như không bị cháy khét bám dính. Nếu có vết cháy nhỏ, bạn chỉ cần ngâm nồi với nước ấm và một ít baking soda trong 30 phút, vết bẩn sẽ tự bong ra và bạn lau nhẹ bằng miếng bọt biển là sạch bóng.
Chúc các chị em nội trợ có những trải nghiệm tuyệt vời và những bữa cơm đầm ấm bên gia đình cùng nồi sứ HealthyCook!</p>',
'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773755755/661028464-5-sm-59257d336c3647648efce171d73da346-grande_estsrf.webp', '2026-02-05 14:00:00'),

(3, 2, 'Giải Mã Ý Nghĩa Phong Thủy Của Cặp Lục Bình Tùng Hạc Diên Niên Mang Lại Tài Lộc Cho Gia Chủ',
'<p>Trong thế giới vật phẩm phong thủy, "Lục bình" (hay Lộc bình) luôn chiếm vị trí độc tôn trong việc chiêu tài, giữ lộc. Hình dáng lục bình với phần miệng loe rộng (hút vượng khí), cổ thắt lại (giữ tài lộc không bị thất thoát) và thân phình to (nơi cất giữ của cải) mang ý nghĩa phong thủy vô cùng sâu sắc. Nhưng giá trị thực sự của một cặp lục bình còn nằm ở họa tiết vẽ trên thân bình, và "Tùng Hạc Diên Niên" chính là một trong những tuyệt tác mang ý nghĩa tốt lành nhất.</p>

<h3>Hình Ảnh Cây Tùng - Biểu Tượng Của Đấng Quân Tử Và Sự Trường Tồn</h3>
<p>Cây Tùng thường mọc ở những vùng núi cao, nơi đất đai cằn cỗi và khí hậu khắc nghiệt, hứng chịu sương gió, bão tuyết. Thế nhưng, Tùng vẫn vươn mình xanh tốt, rễ bám sâu vào vách đá. Trong phong thủy, Tùng đại diện cho khí tiết của người quân tử, kiên cường, bất khuất vượt qua mọi gian nan thử thách. Trưng Lục bình Tùng Hạc trong nhà giúp mang lại năng lượng dương mạnh mẽ, xua đuổi tà khí, giúp gia chủ luôn giữ vững tinh thần thép trên con đường lập nghiệp.</p>

<h3>Chim Hạc - Linh Vật Của Sự Bất Tử Và Thanh Cao</h3>
<p>Theo truyền thuyết phương Đông, Hạc là loài chim tiên, biểu tượng của sự thanh cao, thuần khiết và trường thọ vô lượng (sống hàng ngàn năm). Hình dáng chim Hạc vươn cổ cất tiếng gáy lên bầu trời tượng trưng cho ý chí vươn lên, sự thăng tiến vượt bậc trong công danh sự nghiệp. Khi Hạc bay vút lên bầu trời, đó là khát vọng tự do và thành đạt.</p>

<h3>Sự Kết Hợp "Tùng Hạc Diên Niên"</h3>
<p>Hai hình ảnh Tùng và Hạc hòa quyện vào nhau tạo nên bức tranh "Tùng Hạc Diên Niên" (Tùng Hạc sống thọ cùng năm tháng). Ý nghĩa trọn vẹn của họa tiết này là mong ước về một cuộc sống gia đình bình an, trường thọ, sức khỏe dồi dào, con cháu thảo hiền, tài lộc vĩnh cửu. Sự vững chãi của cây Tùng làm nền tảng cho cánh Hạc bay cao, giống như một gia đạo êm ấm sẽ là hậu phương vững chắc cho sự nghiệp thăng hoa.</p>

<h3>Cách Bài Trí Lục Bình Phong Thủy Chuẩn Nhất</h3>
<p>Để Lục bình phát huy tối đa công năng, gia chủ nên đặt cặp bình ở những vị trí trang trọng nhất trong nhà như phòng khách, phòng thờ, sảnh lớn công ty.
- <b>Đặt ở phòng khách:</b> Hai bình được đặt đối xứng hai bên kệ tivi hoặc hai bên cửa chính, mặt hoa văn chính hướng ra ngoài đón sinh khí.
- <b>Đặt ở phòng thờ:</b> Cặp bình được đặt hai bên bàn thờ gia tiên, vừa tạo sự uy nghiêm, bề thế, vừa thể hiện tấm lòng hiếu kính, mong ông bà phù hộ độ trì cho gia tộc hưng vượng.
- <b>Lưu ý:</b> Tuyệt đối không đặt Lục bình trong phòng bếp hoặc gần nhà vệ sinh, những nơi ẩm thấp sẽ làm uế tạp nguồn năng lượng của vật phẩm.</p>
<p>Tại CeramicShop, các dòng Lục bình Tùng Hạc được chế tác thủ công bởi các nghệ nhân Bát Tràng, nung khử ở nhiệt độ cao mang lại nước men lam sâu thẳm, hoa văn đắp nổi sống động như thật. Đây chắc chắn là món quà biếu tân gia, mừng thọ ý nghĩa và đẳng cấp nhất!</p>',
'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773818677/tung_b6ptoj.jpg', '2026-03-10 10:20:00');