
INSERT INTO PhanQuyen (TenPhanQuyen) VALUES
('Admin'),
('Staff'),
('Customer');

INSERT INTO TaiKhoan (Username, Email, Password, MaPhanQuyen)
VALUES ('admin', 'admin@ceramicshop.vn', '$2a$12$aSFyRPFhsl9iTtCSjfSh/.MfIJm2CFpvmMH3jZoexgOMaZy4gHV9W', 1);

-- Lưu thông tin cá nhân của Admin vào bảng NhanVien
INSERT INTO NhanVien (MaTaiKhoan, TenNhanVien, SDT, NgaySinh, DiaChi)
VALUES (LAST_INSERT_ID(), 'Trần Quản Trị', '0901234567', '1990-05-15', '123 Đường Gốm Bát Tràng, Hà Nội');

-- ==========================================
-- 2. TẠO TÀI KHOẢN STAFF (MaPhanQuyen = 2)
-- 2. TẠO TÀI KHOẢN STAFF (MaPhanQuyen = 2)
-- ==========================================
INSERT INTO TaiKhoan (Username, Email, Password, MaPhanQuyen)
VALUES ('staff01', 'staff01@ceramicshop.vn', '$2a$12$aSFyRPFhsl9iTtCSjfSh/.MfIJm2CFpvmMH3jZoexgOMaZy4gHV9W', 2);

INSERT INTO TaiKhoan (Username, Email, Password, MaPhanQuyen)
VALUES ('staff007', 'anh95693@st.vimaru.edu.vn', '$2a$12$aSFyRPFhsl9iTtCSjfSh/.MfIJm2CFpvmMH3jZoexgOMaZy4gHV9W', 2);

select * from taikhoan
where username = 'staff007';
-- Lưu thông tin cá nhân của Staff vào bảng NhanVien
INSERT INTO NhanVien (MaTaiKhoan, TenNhanVien, SDT, NgaySinh, DiaChi)
VALUES (LAST_INSERT_ID(), 'Nguyễn Thị Bán Hàng', '0912345678', '1998-10-20', '456 Phố Sứ, TP.HCM');


-- ==========================================
-- 3. TẠO TÀI KHOẢN CUSTOMER (MaPhanQuyen = 3)
-- 3. TẠO TÀI KHOẢN CUSTOMER (MaPhanQuyen = 3)
-- ==========================================
INSERT INTO TaiKhoan (Username, Email, Password, MaPhanQuyen)
VALUES ('khachhang1', 'khachhang1@gmail.com', '$2a$12$aSFyRPFhsl9iTtCSjfSh/.MfIJm2CFpvmMH3jZoexgOMaZy4gHV9W', 3);

-- Lưu thông tin cá nhân của Khách hàng vào bảng KhachHang
INSERT INTO KhachHang (MaTaiKhoan, TenKhachHang, SDT, Diachi, Avatar)
VALUES (LAST_INSERT_ID(), 'Lê Khách Mua', '0987654321', '789 Ngõ Đất Nung, Đà Nẵng', 'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773107213/default_avatar_gojcul.png');

-- ==========================================
-- Khách hàng 2
INSERT INTO TaiKhoan (Username, Email, Password, MaPhanQuyen) VALUES ('khachhang2', 'khachhang2@gmail.com', '$2a$12$aSFyRPFhsl9iTtCSjfSh/.MfIJm2CFpvmMH3jZoexgOMaZy4gHV9W', 3);
INSERT INTO KhachHang (MaTaiKhoan, TenKhachHang, SDT, Diachi, Avatar) VALUES (LAST_INSERT_ID(), 'Nguyễn Văn An', '0987654002', '12 Lê Lợi, TP.HCM', 'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773107213/default_avatar_gojcul.png');

-- Khách hàng 3
INSERT INTO TaiKhoan (Username, Email, Password, MaPhanQuyen) VALUES ('khachhang3', 'khachhang3@gmail.com', '$2a$12$aSFyRPFhsl9iTtCSjfSh/.MfIJm2CFpvmMH3jZoexgOMaZy4gHV9W', 3);
INSERT INTO KhachHang (MaTaiKhoan, TenKhachHang, SDT, Diachi, Avatar) VALUES (LAST_INSERT_ID(), 'Trần Thị Bình', '0987654003', '34 Quang Trung, Hà Nội', 'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773107213/default_avatar_gojcul.png');

-- Khách hàng 4
INSERT INTO TaiKhoan (Username, Email, Password, MaPhanQuyen) VALUES ('khachhang4', 'khachhang4@gmail.com', '$2a$12$aSFyRPFhsl9iTtCSjfSh/.MfIJm2CFpvmMH3jZoexgOMaZy4gHV9W', 3);
INSERT INTO KhachHang (MaTaiKhoan, TenKhachHang, SDT, Diachi, Avatar) VALUES (LAST_INSERT_ID(), 'Lê Văn Cường', '0987654004', '56 Nguyễn Văn Linh, Đà Nẵng', 'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773107213/default_avatar_gojcul.png');

-- Khách hàng 5
INSERT INTO TaiKhoan (Username, Email, Password, MaPhanQuyen) VALUES ('khachhang5', 'khachhang5@gmail.com', '$2a$12$aSFyRPFhsl9iTtCSjfSh/.MfIJm2CFpvmMH3jZoexgOMaZy4gHV9W', 3);
INSERT INTO KhachHang (MaTaiKhoan, TenKhachHang, SDT, Diachi, Avatar) VALUES (LAST_INSERT_ID(), 'Phạm Thị Dung', '0987654005', '78 Trần Hưng Đạo, Cần Thơ', 'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773107213/default_avatar_gojcul.png');

-- Khách hàng 6
INSERT INTO TaiKhoan (Username, Email, Password, MaPhanQuyen) VALUES ('khachhang6', 'khachhang6@gmail.com', '$2a$12$aSFyRPFhsl9iTtCSjfSh/.MfIJm2CFpvmMH3jZoexgOMaZy4gHV9W', 3);
INSERT INTO KhachHang (MaTaiKhoan, TenKhachHang, SDT, Diachi, Avatar) VALUES (LAST_INSERT_ID(), 'Hoàng Văn Em', '0987654006', '90 Hai Bà Trưng, TP.HCM', 'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773107213/default_avatar_gojcul.png');

-- Khách hàng 7
INSERT INTO TaiKhoan (Username, Email, Password, MaPhanQuyen) VALUES ('khachhang7', 'khachhang7@gmail.com', '$2a$12$aSFyRPFhsl9iTtCSjfSh/.MfIJm2CFpvmMH3jZoexgOMaZy4gHV9W', 3);
INSERT INTO KhachHang (MaTaiKhoan, TenKhachHang, SDT, Diachi, Avatar) VALUES (LAST_INSERT_ID(), 'Vũ Thị Giang', '0987654007', '11 Đống Đa, Hà Nội', 'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773107213/default_avatar_gojcul.png');

-- Khách hàng 8
INSERT INTO TaiKhoan (Username, Email, Password, MaPhanQuyen) VALUES ('khachhang8', 'khachhang8@gmail.com', '$2a$12$aSFyRPFhsl9iTtCSjfSh/.MfIJm2CFpvmMH3jZoexgOMaZy4gHV9W', 3);
INSERT INTO KhachHang (MaTaiKhoan, TenKhachHang, SDT, Diachi, Avatar) VALUES (LAST_INSERT_ID(), 'Đặng Văn Hải', '0987654008', '22 Ngô Quyền, Hải Phòng', 'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773107213/default_avatar_gojcul.png');

-- Khách hàng 9
INSERT INTO TaiKhoan (Username, Email, Password, MaPhanQuyen) VALUES ('khachhang9', 'khachhang9@gmail.com', '$2a$12$aSFyRPFhsl9iTtCSjfSh/.MfIJm2CFpvmMH3jZoexgOMaZy4gHV9W', 3);
INSERT INTO KhachHang (MaTaiKhoan, TenKhachHang, SDT, Diachi, Avatar) VALUES (LAST_INSERT_ID(), 'Bùi Thị Hạnh', '0987654009', '33 Tôn Đức Thắng, TP.HCM', 'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773107213/default_avatar_gojcul.png');

-- Khách hàng 10
INSERT INTO TaiKhoan (Username, Email, Password, MaPhanQuyen) VALUES ('khachhang10', 'khachhang10@gmail.com', '$2a$12$aSFyRPFhsl9iTtCSjfSh/.MfIJm2CFpvmMH3jZoexgOMaZy4gHV9W', 3);
INSERT INTO KhachHang (MaTaiKhoan, TenKhachHang, SDT, Diachi, Avatar) VALUES (LAST_INSERT_ID(), 'Đỗ Văn Hùng', '0987654010', '44 Kim Mã, Hà Nội', 'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773107213/default_avatar_gojcul.png');

-- Khách hàng 11
INSERT INTO TaiKhoan (Username, Email, Password, MaPhanQuyen) VALUES ('khachhang11', 'khachhang11@gmail.com', '$2a$12$aSFyRPFhsl9iTtCSjfSh/.MfIJm2CFpvmMH3jZoexgOMaZy4gHV9W', 3);
INSERT INTO KhachHang (MaTaiKhoan, TenKhachHang, SDT, Diachi, Avatar) VALUES (LAST_INSERT_ID(), 'Hồ Thị Kiều', '0987654011', '55 Cầu Giấy, Hà Nội', 'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773107213/default_avatar_gojcul.png');

-- Khách hàng 12
INSERT INTO TaiKhoan (Username, Email, Password, MaPhanQuyen) VALUES ('khachhang12', 'khachhang12@gmail.com', '$2a$12$aSFyRPFhsl9iTtCSjfSh/.MfIJm2CFpvmMH3jZoexgOMaZy4gHV9W', 3);
INSERT INTO KhachHang (MaTaiKhoan, TenKhachHang, SDT, Diachi, Avatar) VALUES (LAST_INSERT_ID(), 'Ngô Văn Lâm', '0987654012', '66 Lê Duẩn, Đà Nẵng', 'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773107213/default_avatar_gojcul.png');

-- Khách hàng 13
INSERT INTO TaiKhoan (Username, Email, Password, MaPhanQuyen) VALUES ('khachhang13', 'khachhang13@gmail.com', '$2a$12$aSFyRPFhsl9iTtCSjfSh/.MfIJm2CFpvmMH3jZoexgOMaZy4gHV9W', 3);
INSERT INTO KhachHang (MaTaiKhoan, TenKhachHang, SDT, Diachi, Avatar) VALUES (LAST_INSERT_ID(), 'Dương Thị Mai', '0987654013', '77 Nguyễn Thái Học, TP.HCM', 'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773107213/default_avatar_gojcul.png');

-- Khách hàng 14
INSERT INTO TaiKhoan (Username, Email, Password, MaPhanQuyen) VALUES ('khachhang14', 'khachhang14@gmail.com', '$2a$12$aSFyRPFhsl9iTtCSjfSh/.MfIJm2CFpvmMH3jZoexgOMaZy4gHV9W', 3);
INSERT INTO KhachHang (MaTaiKhoan, TenKhachHang, SDT, Diachi, Avatar) VALUES (LAST_INSERT_ID(), 'Lý Văn Nam', '0987654014', '88 Phạm Văn Đồng, Hà Nội', 'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773107213/default_avatar_gojcul.png');

-- Khách hàng 15
INSERT INTO TaiKhoan (Username, Email, Password, MaPhanQuyen) VALUES ('khachhang15', 'khachhang15@gmail.com', '$2a$12$aSFyRPFhsl9iTtCSjfSh/.MfIJm2CFpvmMH3jZoexgOMaZy4gHV9W', 3);
INSERT INTO KhachHang (MaTaiKhoan, TenKhachHang, SDT, Diachi, Avatar) VALUES (LAST_INSERT_ID(), 'Đào Thị Oanh', '0987654015', '99 Hoàng Sa, Đà Nẵng', 'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773107213/default_avatar_gojcul.png');

-- Khách hàng 16
INSERT INTO TaiKhoan (Username, Email, Password, MaPhanQuyen) VALUES ('khachhang16', 'khachhang16@gmail.com', '$2a$12$aSFyRPFhsl9iTtCSjfSh/.MfIJm2CFpvmMH3jZoexgOMaZy4gHV9W', 3);
INSERT INTO KhachHang (MaTaiKhoan, TenKhachHang, SDT, Diachi, Avatar) VALUES (LAST_INSERT_ID(), 'Đoàn Văn Phong', '0987654016', '101 Võ Văn Kiệt, TP.HCM', 'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773107213/default_avatar_gojcul.png');

-- Khách hàng 17
INSERT INTO TaiKhoan (Username, Email, Password, MaPhanQuyen) VALUES ('khachhang17', 'khachhang17@gmail.com', '$2a$12$aSFyRPFhsl9iTtCSjfSh/.MfIJm2CFpvmMH3jZoexgOMaZy4gHV9W', 3);
INSERT INTO KhachHang (MaTaiKhoan, TenKhachHang, SDT, Diachi, Avatar) VALUES (LAST_INSERT_ID(), 'Trịnh Thị Quỳnh', '0987654017', '202 Giải Phóng, Hà Nội', 'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773107213/default_avatar_gojcul.png');

-- Khách hàng 18
INSERT INTO TaiKhoan (Username, Email, Password, MaPhanQuyen) VALUES ('khachhang18', 'khachhang18@gmail.com', '$2a$12$aSFyRPFhsl9iTtCSjfSh/.MfIJm2CFpvmMH3jZoexgOMaZy4gHV9W', 3);
INSERT INTO KhachHang (MaTaiKhoan, TenKhachHang, SDT, Diachi, Avatar) VALUES (LAST_INSERT_ID(), 'Nguyễn Văn Quân', '0987654018', '303 Hùng Vương, Cần Thơ', 'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773107213/default_avatar_gojcul.png');

-- Khách hàng 19
INSERT INTO TaiKhoan (Username, Email, Password, MaPhanQuyen) VALUES ('khachhang19', 'khachhang19@gmail.com', '$2a$12$aSFyRPFhsl9iTtCSjfSh/.MfIJm2CFpvmMH3jZoexgOMaZy4gHV9W', 3);
INSERT INTO KhachHang (MaTaiKhoan, TenKhachHang, SDT, Diachi, Avatar) VALUES (LAST_INSERT_ID(), 'Trần Thị Rạng', '0987654019', '404 Lạch Tray, Hải Phòng', 'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773107213/default_avatar_gojcul.png');

-- Khách hàng 20
INSERT INTO TaiKhoan (Username, Email, Password, MaPhanQuyen) VALUES ('khachhang20', 'khachhang20@gmail.com', '$2a$12$aSFyRPFhsl9iTtCSjfSh/.MfIJm2CFpvmMH3jZoexgOMaZy4gHV9W', 3);
INSERT INTO KhachHang (MaTaiKhoan, TenKhachHang, SDT, Diachi, Avatar) VALUES (LAST_INSERT_ID(), 'Lê Văn Sơn', '0987654020', '505 Nguyễn Trãi, TP.HCM', 'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773107213/default_avatar_gojcul.png');

-- Khách hàng 21
INSERT INTO TaiKhoan (Username, Email, Password, MaPhanQuyen) VALUES ('khachhang21', 'khachhang21@gmail.com', '$2a$12$aSFyRPFhsl9iTtCSjfSh/.MfIJm2CFpvmMH3jZoexgOMaZy4gHV9W', 3);
INSERT INTO KhachHang (MaTaiKhoan, TenKhachHang, SDT, Diachi, Avatar) VALUES (LAST_INSERT_ID(), 'Phạm Thị Thảo', '0987654021', '606 Trường Chinh, Hà Nội', 'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773107213/default_avatar_gojcul.png');

-- Khách hàng 22
INSERT INTO TaiKhoan (Username, Email, Password, MaPhanQuyen) VALUES ('khachhang22', 'khachhang22@gmail.com', '$2a$12$aSFyRPFhsl9iTtCSjfSh/.MfIJm2CFpvmMH3jZoexgOMaZy4gHV9W', 3);
INSERT INTO KhachHang (MaTaiKhoan, TenKhachHang, SDT, Diachi, Avatar) VALUES (LAST_INSERT_ID(), 'Hoàng Văn Tuấn', '0987654022', '707 Bà Triệu, Hà Nội', 'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773107213/default_avatar_gojcul.png');

-- Khách hàng 23
INSERT INTO TaiKhoan (Username, Email, Password, MaPhanQuyen) VALUES ('khachhang23', 'khachhang23@gmail.com', '$2a$12$aSFyRPFhsl9iTtCSjfSh/.MfIJm2CFpvmMH3jZoexgOMaZy4gHV9W', 3);
INSERT INTO KhachHang (MaTaiKhoan, TenKhachHang, SDT, Diachi, Avatar) VALUES (LAST_INSERT_ID(), 'Vũ Thị Uyên', '0987654023', '808 Điện Biên Phủ, Bình Thạnh', 'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773107213/default_avatar_gojcul.png');

-- Khách hàng 24
INSERT INTO TaiKhoan (Username, Email, Password, MaPhanQuyen) VALUES ('khachhang24', 'khachhang24@gmail.com', '$2a$12$aSFyRPFhsl9iTtCSjfSh/.MfIJm2CFpvmMH3jZoexgOMaZy4gHV9W', 3);
INSERT INTO KhachHang (MaTaiKhoan, TenKhachHang, SDT, Diachi, Avatar) VALUES (LAST_INSERT_ID(), 'Đặng Văn Việt', '0987654024', '909 Phạm Ngọc Thạch, Quận 3', 'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773107213/default_avatar_gojcul.png');

-- Khách hàng 25
INSERT INTO TaiKhoan (Username, Email, Password, MaPhanQuyen) VALUES ('khachhang25', 'khachhang25@gmail.com', '$2a$12$aSFyRPFhsl9iTtCSjfSh/.MfIJm2CFpvmMH3jZoexgOMaZy4gHV9W', 3);
INSERT INTO KhachHang (MaTaiKhoan, TenKhachHang, SDT, Diachi, Avatar) VALUES (LAST_INSERT_ID(), 'Bùi Thị Xoan', '0987654025', '111 Nguyễn Đình Chiểu, Quận 1', 'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773107213/default_avatar_gojcul.png');

-- Khách hàng 26
INSERT INTO TaiKhoan (Username, Email, Password, MaPhanQuyen) VALUES ('khachhang26', 'khachhang26@gmail.com', '$2a$12$aSFyRPFhsl9iTtCSjfSh/.MfIJm2CFpvmMH3jZoexgOMaZy4gHV9W', 3);
INSERT INTO KhachHang (MaTaiKhoan, TenKhachHang, SDT, Diachi, Avatar) VALUES (LAST_INSERT_ID(), 'Đỗ Văn Y', '0987654026', '222 Trần Phú, Nha Trang', 'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773107213/default_avatar_gojcul.png');

-- Khách hàng 27
INSERT INTO TaiKhoan (Username, Email, Password, MaPhanQuyen) VALUES ('khachhang27', 'khachhang27@gmail.com', '$2a$12$aSFyRPFhsl9iTtCSjfSh/.MfIJm2CFpvmMH3jZoexgOMaZy4gHV9W', 3);
INSERT INTO KhachHang (MaTaiKhoan, TenKhachHang, SDT, Diachi, Avatar) VALUES (LAST_INSERT_ID(), 'Hồ Thị Anh', '0987654027', '333 Nguyễn Tất Thành, Vũng Tàu', 'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773107213/default_avatar_gojcul.png');

-- Khách hàng 28
INSERT INTO TaiKhoan (Username, Email, Password, MaPhanQuyen) VALUES ('khachhang28', 'khachhang28@gmail.com', '$2a$12$aSFyRPFhsl9iTtCSjfSh/.MfIJm2CFpvmMH3jZoexgOMaZy4gHV9W', 3);
INSERT INTO KhachHang (MaTaiKhoan, TenKhachHang, SDT, Diachi, Avatar) VALUES (LAST_INSERT_ID(), 'Ngô Văn Bảo', '0987654028', '444 Hùng Vương, Huế', 'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773107213/default_avatar_gojcul.png');

-- Khách hàng 29
INSERT INTO TaiKhoan (Username, Email, Password, MaPhanQuyen) VALUES ('khachhang29', 'khachhang29@gmail.com', '$2a$12$aSFyRPFhsl9iTtCSjfSh/.MfIJm2CFpvmMH3jZoexgOMaZy4gHV9W', 3);
INSERT INTO KhachHang (MaTaiKhoan, TenKhachHang, SDT, Diachi, Avatar) VALUES (LAST_INSERT_ID(), 'Dương Thị Cẩm', '0987654029', '555 Lê Lợi, Thanh Hóa', 'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773107213/default_avatar_gojcul.png');

-- Khách hàng 30
INSERT INTO TaiKhoan (Username, Email, Password, MaPhanQuyen) VALUES ('khachhang30', 'khachhang30@gmail.com', '$2a$12$aSFyRPFhsl9iTtCSjfSh/.MfIJm2CFpvmMH3jZoexgOMaZy4gHV9W', 3);
INSERT INTO KhachHang (MaTaiKhoan, TenKhachHang, SDT, Diachi, Avatar) VALUES (LAST_INSERT_ID(), 'Lý Văn Đạt', '0987654030', '666 Hai Bà Trưng, Nam Định', 'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773107213/default_avatar_gojcul.png');

-- Khách hàng 31
INSERT INTO TaiKhoan (Username, Email, Password, MaPhanQuyen) VALUES ('khachhang31', 'khachhang31@gmail.com', '$2a$12$aSFyRPFhsl9iTtCSjfSh/.MfIJm2CFpvmMH3jZoexgOMaZy4gHV9W', 3);
INSERT INTO KhachHang (MaTaiKhoan, TenKhachHang, SDT, Diachi, Avatar) VALUES (LAST_INSERT_ID(), 'Đào Thị Giao', '0987654031', '777 Trần Hưng Đạo, Ninh Bình', 'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773107213/default_avatar_gojcul.png');

-- Khách hàng 32
INSERT INTO TaiKhoan (Username, Email, Password, MaPhanQuyen) VALUES ('khachhang32', 'khachhang32@gmail.com', '$2a$12$aSFyRPFhsl9iTtCSjfSh/.MfIJm2CFpvmMH3jZoexgOMaZy4gHV9W', 3);
INSERT INTO KhachHang (MaTaiKhoan, TenKhachHang, SDT, Diachi, Avatar) VALUES (LAST_INSERT_ID(), 'Đoàn Văn Hòa', '0987654032', '888 Quang Trung, Gò Vấp', 'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773107213/default_avatar_gojcul.png');

-- Khách hàng 33
INSERT INTO TaiKhoan (Username, Email, Password, MaPhanQuyen) VALUES ('khachhang33', 'khachhang33@gmail.com', '$2a$12$aSFyRPFhsl9iTtCSjfSh/.MfIJm2CFpvmMH3jZoexgOMaZy4gHV9W', 3);
INSERT INTO KhachHang (MaTaiKhoan, TenKhachHang, SDT, Diachi, Avatar) VALUES (LAST_INSERT_ID(), 'Trịnh Thị Hằng', '0987654033', '999 Xa Lộ Hà Nội, Thủ Đức', 'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773107213/default_avatar_gojcul.png');

-- Khách hàng 34
INSERT INTO TaiKhoan (Username, Email, Password, MaPhanQuyen) VALUES ('khachhang34', 'khachhang34@gmail.com', '$2a$12$aSFyRPFhsl9iTtCSjfSh/.MfIJm2CFpvmMH3jZoexgOMaZy4gHV9W', 3);
INSERT INTO KhachHang (MaTaiKhoan, TenKhachHang, SDT, Diachi, Avatar) VALUES (LAST_INSERT_ID(), 'Nguyễn Văn Khanh', '0987654034', '123 Mai Chí Thọ, Quận 2', 'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773107213/default_avatar_gojcul.png');

-- Khách hàng 35
INSERT INTO TaiKhoan (Username, Email, Password, MaPhanQuyen) VALUES ('khachhang35', 'khachhang35@gmail.com', '$2a$12$aSFyRPFhsl9iTtCSjfSh/.MfIJm2CFpvmMH3jZoexgOMaZy4gHV9W', 3);
INSERT INTO KhachHang (MaTaiKhoan, TenKhachHang, SDT, Diachi, Avatar) VALUES (LAST_INSERT_ID(), 'Trần Thị Lan', '0987654035', '234 Nguyễn Văn Cừ, Quận 5', 'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773107213/default_avatar_gojcul.png');

-- Khách hàng 36
INSERT INTO TaiKhoan (Username, Email, Password, MaPhanQuyen) VALUES ('khachhang36', 'khachhang36@gmail.com', '$2a$12$aSFyRPFhsl9iTtCSjfSh/.MfIJm2CFpvmMH3jZoexgOMaZy4gHV9W', 3);
INSERT INTO KhachHang (MaTaiKhoan, TenKhachHang, SDT, Diachi, Avatar) VALUES (LAST_INSERT_ID(), 'Lê Văn Minh', '0987654036', '345 Hậu Giang, Quận 6', 'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773107213/default_avatar_gojcul.png');

-- Khách hàng 37
INSERT INTO TaiKhoan (Username, Email, Password, MaPhanQuyen) VALUES ('khachhang37', 'khachhang37@gmail.com', '$2a$12$aSFyRPFhsl9iTtCSjfSh/.MfIJm2CFpvmMH3jZoexgOMaZy4gHV9W', 3);
INSERT INTO KhachHang (MaTaiKhoan, TenKhachHang, SDT, Diachi, Avatar) VALUES (LAST_INSERT_ID(), 'Phạm Thị Nga', '0987654037', '456 Lê Trọng Tấn, Tân Phú', 'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773107213/default_avatar_gojcul.png');

-- Khách hàng 38
INSERT INTO TaiKhoan (Username, Email, Password, MaPhanQuyen) VALUES ('khachhang38', 'khachhang38@gmail.com', '$2a$12$aSFyRPFhsl9iTtCSjfSh/.MfIJm2CFpvmMH3jZoexgOMaZy4gHV9W', 3);
INSERT INTO KhachHang (MaTaiKhoan, TenKhachHang, SDT, Diachi, Avatar) VALUES (LAST_INSERT_ID(), 'Hoàng Văn Phú', '0987654038', '567 Lũy Bán Bích, Tân Phú', 'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773107213/default_avatar_gojcul.png');

-- Khách hàng 39
INSERT INTO TaiKhoan (Username, Email, Password, MaPhanQuyen) VALUES ('khachhang39', 'khachhang39@gmail.com', '$2a$12$aSFyRPFhsl9iTtCSjfSh/.MfIJm2CFpvmMH3jZoexgOMaZy4gHV9W', 3);
INSERT INTO KhachHang (MaTaiKhoan, TenKhachHang, SDT, Diachi, Avatar) VALUES (LAST_INSERT_ID(), 'Vũ Thị Quyên', '0987654039', '678 Âu Cơ, Tân Bình', 'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773107213/default_avatar_gojcul.png');

-- Khách hàng 40
INSERT INTO TaiKhoan (Username, Email, Password, MaPhanQuyen) VALUES ('khachhang40', 'khachhang40@gmail.com', '$2a$12$aSFyRPFhsl9iTtCSjfSh/.MfIJm2CFpvmMH3jZoexgOMaZy4gHV9W', 3);
INSERT INTO KhachHang (MaTaiKhoan, TenKhachHang, SDT, Diachi, Avatar) VALUES (LAST_INSERT_ID(), 'Đặng Văn Sang', '0987654040', '789 Cộng Hòa, Tân Bình', 'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773107213/default_avatar_gojcul.png');

-- Khách hàng 41
INSERT INTO TaiKhoan (Username, Email, Password, MaPhanQuyen) VALUES ('khachhang41', 'khachhang41@gmail.com', '$2a$12$aSFyRPFhsl9iTtCSjfSh/.MfIJm2CFpvmMH3jZoexgOMaZy4gHV9W', 3);
INSERT INTO KhachHang (MaTaiKhoan, TenKhachHang, SDT, Diachi, Avatar) VALUES (LAST_INSERT_ID(), 'Bùi Thị Tâm', '0987654041', '890 Phan Đăng Lưu, Phú Nhuận', 'https://res.cloudinary.com/dcmwz0uis/image/upload/v1773107213/default_avatar_gojcul.png');

