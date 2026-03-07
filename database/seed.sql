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
-- 2. TẠO TÀI KHOẢN STAFF (MaQuyen = 2)
-- ==========================================
INSERT INTO TaiKhoan (Username, Email, Password, MaPhanQuyen)
VALUES ('staff01', 'staff01@ceramicshop.vn', '$2a$12$aSFyRPFhsl9iTtCSjfSh/.MfIJm2CFpvmMH3jZoexgOMaZy4gHV9W', 2);

-- Lưu thông tin cá nhân của Staff vào bảng NhanVien
INSERT INTO NhanVien (MaTaiKhoan, TenNhanVien, SDT, NgaySinh, DiaChi)
VALUES (LAST_INSERT_ID(), 'Nguyễn Thị Bán Hàng', '0912345678', '1998-10-20', '456 Phố Sứ, TP.HCM');


-- ==========================================
-- 3. TẠO TÀI KHOẢN CUSTOMER (MaQuyen = 3)
-- ==========================================
INSERT INTO TaiKhoan (Username, Email, Password, MaPhanQuyen)
VALUES ('khachhang1', 'khachhang1@gmail.com', '$2a$12$aSFyRPFhsl9iTtCSjfSh/.MfIJm2CFpvmMH3jZoexgOMaZy4gHV9W', 3);

-- Lưu thông tin cá nhân của Khách hàng vào bảng KhachHang
INSERT INTO KhachHang (MaTaiKhoan, TenKhachHang, SDT, Diachi, Avatar)
VALUES (LAST_INSERT_ID(), 'Lê Khách Mua', '0987654321', '789 Ngõ Đất Nung, Đà Nẵng', 'default_avatar.jpg');

