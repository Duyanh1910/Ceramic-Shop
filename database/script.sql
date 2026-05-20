create table CauHinhHeThong
(
    MaCauHinh varchar(50)    not null comment 'Khóa cấu hình (Key)'
        primary key,
    GiaTri    decimal(15, 2) not null comment 'Giá trị cấu hình (Value)',
    MoTa      varchar(255)   null comment 'Mô tả cho Admin'
);

create table DanhMucSanPham
(
    MaDanhMuc  int auto_increment
        primary key,
    TenDanhMuc varchar(100) not null,
    MoTa       varchar(255) null,
    ParentID   int          null,
    constraint fk_1
        foreign key (ParentID) references DanhMucSanPham (MaDanhMuc)
)
    collate = utf8mb4_unicode_ci;

create index idx_category_parent
    on DanhMucSanPham (ParentID);

create table LoaiKhuyenMai
(
    MaLoaiKM  int auto_increment
        primary key,
    TenLoaiKM varchar(100) not null,
    MoTa      varchar(255) null
)
    collate = utf8mb4_unicode_ci;

create table KhuyenMai
(
    MaKhuyenMai    int auto_increment
        primary key,
    MaLoaiKM       int               not null,
    TenKhuyenMai   varchar(255)      not null,
    GiaTri         decimal(15, 2)    not null,
    GiaTriToiThieu decimal(15, 2)    null,
    GiamToiDa      decimal(15, 2)    null,
    NgayBatDau     datetime          null,
    NgayKetThuc    datetime          null,
    TrangThai      tinyint default 1 null,
    MaCode         varchar(50)       null comment 'Mã nhập voucher',
    SoLuong        int     default 0 null comment 'Giới hạn số lượng mã',
    LoaiVoucher    tinyint default 1 null comment '1: Khuyến mãi đơn hàng, 2: Khuyến mãi phí ship',
    MaDanhMuc      int               null comment 'NULL = Toàn shop, Có ID = Chỉ áp dụng danh mục đó',
    constraint idx_ma_code
        unique (MaCode),
    constraint FK_KhuyenMai_DanhMuc
        foreign key (MaDanhMuc) references DanhMucSanPham (MaDanhMuc),
    constraint fk_1
        foreign key (MaLoaiKM) references LoaiKhuyenMai (MaLoaiKM)
);

create table LoaiPhiVanChuyen
(
    MaLoaiPhi  int auto_increment
        primary key,
    TenLoaiPhi varchar(100) not null,
    MoTa       varchar(255) null
)
    collate = utf8mb4_unicode_ci;

create table NhaCungCap
(
    MaNhaCC  int auto_increment
        primary key,
    TenNhaCC varchar(100) not null,
    Diachi   varchar(255) null,
    SDT      varchar(10)  null
)
    collate = utf8mb4_unicode_ci;

create table PhanQuyen
(
    MaPhanQuyen  int auto_increment
        primary key,
    TenPhanQuyen varchar(50) not null
)
    collate = utf8mb4_unicode_ci;

create table PhuongThucThanhToan
(
    MaPhuongThuc  int auto_increment
        primary key,
    TenPhuongThuc varchar(100)      not null,
    MoTa          varchar(255)      null,
    TrangThai     tinyint default 1 null
)
    collate = utf8mb4_unicode_ci;

create table SanPham
(
    MaSanPham  int auto_increment
        primary key,
    MaDanhMuc  int               null,
    TenSanPham varchar(100)      not null,
    Thumbnail  varchar(255)      null,
    ThuongHieu varchar(100)      null,
    LuotXem    int     default 0 null,
    MoTa       text              null,
    TrangThai  tinyint default 1 null,
    deleted_at datetime          null,
    constraint fk_1
        foreign key (MaDanhMuc) references DanhMucSanPham (MaDanhMuc)
);

create table BienTheSanPham
(
    MaBienThe  int auto_increment
        primary key,
    MaSanPham  int                         not null,
    TenBienThe varchar(100)                not null,
    Gia        decimal(15, 2)              not null,
    SoLuong    int            default 0    null,
    TrangThai  tinyint        default 1    null,
    MoTa       varchar(255)                null,
    KhoiLuong  decimal(10, 2) default 0.00 null comment 'Khối lượng tính bằng kg',
    ChieuDai   decimal(10, 2) default 0.00 null comment 'Chiều dài hộp Gross (cm)',
    ChieuRong  decimal(10, 2) default 0.00 null comment 'Chiều rộng hộp Gross (cm)',
    ChieuCao   decimal(10, 2) default 0.00 null comment 'Chiều cao hộp Gross (cm)',
    constraint fk_1
        foreign key (MaSanPham) references SanPham (MaSanPham)
)
    collate = utf8mb4_unicode_ci;

create index idx_variant_price
    on BienTheSanPham (Gia);

create index idx_variant_product
    on BienTheSanPham (MaSanPham);

create index idx_variant_status
    on BienTheSanPham (TrangThai);

create table HinhAnhBienThe
(
    MaHinhAnh int auto_increment
        primary key,
    MaBienThe int          null,
    DuongDan  varchar(255) not null,
    constraint fk_1
        foreign key (MaBienThe) references BienTheSanPham (MaBienThe)
)
    collate = utf8mb4_unicode_ci;

create index idx_variant_image_variant
    on HinhAnhBienThe (MaBienThe);

create table LichSuTonKho
(
    MaLichSu       int auto_increment
        primary key,
    MaBienThe      int                                null,
    LoaiGiaoDich   varchar(100)                       null,
    SoLuongThayDoi int                                not null,
    TonKhoHienTai  int                                not null,
    LoaiThamChieu  varchar(100)                       null,
    MaThamChieu    int                                null,
    NgayTao        datetime default CURRENT_TIMESTAMP null,
    GhiChu         varchar(255)                       null,
    constraint fk_1
        foreign key (MaBienThe) references BienTheSanPham (MaBienThe)
)
    collate = utf8mb4_unicode_ci;

create index idx_inventory_reference
    on LichSuTonKho (MaThamChieu);

create index idx_inventory_variant
    on LichSuTonKho (MaBienThe);

create index idx_product_category
    on SanPham (MaDanhMuc);

create index idx_product_category_status
    on SanPham (MaDanhMuc, TrangThai);

create index idx_product_name
    on SanPham (TenSanPham);

create index idx_product_status
    on SanPham (TrangThai);

create table TaiKhoan
(
    MaTaiKhoan  int auto_increment
        primary key,
    Username    varchar(100)      null,
    Email       varchar(100)      null,
    Password    varchar(255)      null,
    MaPhanQuyen int               null,
    TrangThai   tinyint default 1 null,
    constraint Email
        unique (Email),
    constraint Username
        unique (Username),
    constraint fk_1
        foreign key (MaPhanQuyen) references PhanQuyen (MaPhanQuyen)
);

create table KhachHang
(
    MaKhachHang  int auto_increment
        primary key,
    MaTaiKhoan   int          null,
    TenKhachHang varchar(100) not null,
    SDT          varchar(10)  null,
    DiaChi       varchar(255) null,
    Avatar       varchar(255) null,
    constraint MaTaiKhoan
        unique (MaTaiKhoan),
    constraint fk_1
        foreign key (MaTaiKhoan) references TaiKhoan (MaTaiKhoan)
)
    collate = utf8mb4_unicode_ci;

create table DonHang
(
    MaDonHang          int auto_increment
        primary key,
    MaKhachHang        int                                      not null,
    NgayDat            datetime       default CURRENT_TIMESTAMP null,
    TongTienHang       decimal(15, 2) default 0                 null,
    TongPhiVanChuyen   decimal(15, 2) default 0                 null,
    TongGiamGia        decimal(15, 2) default 0                 null,
    TongThanhToan      decimal(15, 2) default 0                 null,
    DiaChiGiaoHang     varchar(255)                             null,
    TenNguoiNhan       varchar(100)                             null,
    SDT                varchar(10)                              null,
    TrangThaiDonHang   tinyint        default 0                 null,
    TrangThaiThanhToan tinyint        default 0                 null,
    MaPhuongThuc       int                                      null,
    GhiChu             varchar(255)                             null,
    MaHienThi          varchar(30)                              null,
    MaLoaiPhi          int            default 1                 null,
    constraint idx_ma_hien_thi
        unique (MaHienThi),
    constraint fk_1
        foreign key (MaKhachHang) references KhachHang (MaKhachHang),
    constraint fk_2
        foreign key (MaPhuongThuc) references PhuongThucThanhToan (MaPhuongThuc),
    constraint fk_donhang_vanchuyen
        foreign key (MaLoaiPhi) references LoaiPhiVanChuyen (MaLoaiPhi)
);

create table ChiTietDonHang
(
    MaCTDH    int auto_increment
        primary key,
    MaDonHang int            not null,
    MaBienThe int            not null,
    SoLuong   int            not null,
    GiaBan    decimal(15, 2) not null,
    ThanhTien decimal(15, 2) not null,
    constraint fk_1
        foreign key (MaDonHang) references DonHang (MaDonHang),
    constraint fk_2
        foreign key (MaBienThe) references BienTheSanPham (MaBienThe)
)
    collate = utf8mb4_unicode_ci;

create table BaoHanh
(
    MaBaoHanh   int auto_increment
        primary key,
    MaCTDH      int               not null,
    NgayBatDau  datetime          not null,
    NgayKetThuc datetime          not null,
    TrangThai   tinyint default 1 null,
    GhiChu      varchar(255)      null,
    constraint fk_1
        foreign key (MaCTDH) references ChiTietDonHang (MaCTDH)
)
    collate = utf8mb4_unicode_ci;

create index idx_order_detail_order
    on ChiTietDonHang (MaDonHang);

create index idx_order_detail_variant
    on ChiTietDonHang (MaBienThe);

create table ChiTietKhuyenMaiDonHang
(
    MaDonHang       int            not null,
    MaKhuyenMai     int            not null,
    SoTienChietKhau decimal(15, 2) not null,
    primary key (MaDonHang, MaKhuyenMai),
    constraint fk_1
        foreign key (MaDonHang) references DonHang (MaDonHang),
    constraint fk_2
        foreign key (MaKhuyenMai) references KhuyenMai (MaKhuyenMai)
)
    collate = utf8mb4_unicode_ci;

create table DanhGia
(
    MaDanhGia   int auto_increment
        primary key,
    MaKhachHang int                                null,
    MaCTDH      int                                null,
    DiemDanhGia int                                null,
    NoiDung     varchar(255)                       null,
    NgayGui     datetime default CURRENT_TIMESTAMP null,
    TrangThai   tinyint  default 1                 null,
    constraint fk_1
        foreign key (MaKhachHang) references KhachHang (MaKhachHang),
    constraint fk_2
        foreign key (MaCTDH) references ChiTietDonHang (MaCTDH)
)
    collate = utf8mb4_unicode_ci;

create index idx_review_customer
    on DanhGia (MaKhachHang);

create index idx_review_order_detail
    on DanhGia (MaCTDH);

create index idx_order_customer
    on DonHang (MaKhachHang);

create index idx_order_date
    on DonHang (NgayDat);

create index idx_order_status
    on DonHang (TrangThaiDonHang);

create table GioHang
(
    MaGioHang   int auto_increment
        primary key,
    MaKhachHang int not null,
    constraint MaKhachHang
        unique (MaKhachHang),
    constraint fk_1
        foreign key (MaKhachHang) references KhachHang (MaKhachHang)
)
    collate = utf8mb4_unicode_ci;

create table ChiTietGioHang
(
    MaChiTietGH int auto_increment
        primary key,
    MaGioHang   int not null,
    MaBienThe   int not null,
    SoLuong     int not null,
    constraint MaGioHang
        unique (MaGioHang, MaBienThe),
    constraint fk_1
        foreign key (MaGioHang) references GioHang (MaGioHang),
    constraint fk_2
        foreign key (MaBienThe) references BienTheSanPham (MaBienThe)
)
    collate = utf8mb4_unicode_ci;

create index idx_cart_detail_cart
    on ChiTietGioHang (MaGioHang);

create index idx_cart_detail_variant
    on ChiTietGioHang (MaBienThe);

create index idx_cart_customer
    on GioHang (MaKhachHang);

create table NhanVien
(
    MaNhanVien  int auto_increment
        primary key,
    MaTaiKhoan  int          null,
    TenNhanVien varchar(100) not null,
    SDT         varchar(10)  not null,
    NgaySinh    date         not null,
    DiaChi      varchar(255) not null,
    constraint MaTaiKhoan
        unique (MaTaiKhoan),
    constraint fk_1
        foreign key (MaTaiKhoan) references TaiKhoan (MaTaiKhoan)
)
    collate = utf8mb4_unicode_ci;

create table DoiTra
(
    MaDoiTra         int auto_increment
        primary key,
    MaCTDH           int                                      not null,
    LoaiYeuCau       varchar(50)    default 'DOI_TRA'         null,
    MaBienTheDoi     int                                      null,
    SoLuongDoiTra    int                                      not null,
    LyDo             varchar(255)                             null,
    TinhTrangHangTra varchar(50)                              null,
    CoNhapLaiKho     tinyint        default 0                 null,
    HinhThucXuLy     varchar(50)                              null,
    SoTienHoan       decimal(15, 2) default 0.00              null,
    AnhMinhChung     varchar(255)                             null,
    MaNhanVienXuLy   int                                      null,
    TrangThai        tinyint        default 0                 null,
    NgayYeuCau       datetime       default CURRENT_TIMESTAMP null,
    NgayHoanTat      datetime                                 null,
    constraint fk_1
        foreign key (MaCTDH) references ChiTietDonHang (MaCTDH),
    constraint fk_doitra_bienthe_doi
        foreign key (MaBienTheDoi) references BienTheSanPham (MaBienThe),
    constraint fk_doitra_nhanvien
        foreign key (MaNhanVienXuLy) references NhanVien (MaNhanVien)
)
    collate = utf8mb4_unicode_ci;

create index idx_doitra_bienthe_doi
    on DoiTra (MaBienTheDoi);

create index idx_doitra_loai_yeu_cau
    on DoiTra (LoaiYeuCau);

create index idx_doitra_nhanvien
    on DoiTra (MaNhanVienXuLy);

create index idx_doitra_trang_thai
    on DoiTra (TrangThai);

create table GiaoDichThanhToan
(
    MaGiaoDich       int auto_increment
        primary key,
    MaDonHang        int                                   not null,
    MaPhuongThuc     int                                   not null,
    LoaiGiaoDich     varchar(30) default 'THANH_TOAN'      null,
    MaGiaoDichGoc    int                                   null,
    MaDoiTra         int                                   null,
    MaThamChieu      varchar(100)                          not null,
    MaGiaoDichDoiTac varchar(100)                          null,
    SoTien           decimal(15, 2)                        not null,
    TrangThai        varchar(20)                           not null,
    MaLoi            varchar(50)                           null,
    DuLieuPhanHoi    json                                  null,
    ThoiGianGiaoDich datetime    default CURRENT_TIMESTAMP null,
    CreatedAt        datetime    default CURRENT_TIMESTAMP null,
    UpdatedAt        datetime    default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP,
    constraint unique_partner_txn
        unique (MaGiaoDichDoiTac),
    constraint unique_txn_ref
        unique (MaThamChieu),
    constraint fk_1
        foreign key (MaDonHang) references DonHang (MaDonHang),
    constraint fk_2
        foreign key (MaPhuongThuc) references PhuongThucThanhToan (MaPhuongThuc),
    constraint fk_gdtt_doitra
        foreign key (MaDoiTra) references DoiTra (MaDoiTra),
    constraint fk_gdtt_giaodich_goc
        foreign key (MaGiaoDichGoc) references GiaoDichThanhToan (MaGiaoDich)
);

create index idx_donhang
    on GiaoDichThanhToan (MaDonHang);

create index idx_gdtt_doitra
    on GiaoDichThanhToan (MaDoiTra);

create index idx_gdtt_giaodich_goc
    on GiaoDichThanhToan (MaGiaoDichGoc);

create index idx_gdtt_loai_giaodich
    on GiaoDichThanhToan (LoaiGiaoDich);

create index idx_status
    on GiaoDichThanhToan (TrangThai);

create table LichSuBaoHanh
(
    MaLichSuBH     int auto_increment
        primary key,
    MaBaoHanh      int                                null,
    HanhDong       varchar(100)                       null,
    NgayXuLy       datetime default CURRENT_TIMESTAMP null,
    NoiDungXuLy    varchar(255)                       null,
    AnhMinhChung   varchar(255)                       null,
    MaNhanVienXuLy int                                null,
    TrangThai      tinyint                            null,
    constraint fk_1
        foreign key (MaBaoHanh) references BaoHanh (MaBaoHanh),
    constraint fk_lsubh_nhanvien
        foreign key (MaNhanVienXuLy) references NhanVien (MaNhanVien)
)
    collate = utf8mb4_unicode_ci;

create index idx_lsubh_nhanvien
    on LichSuBaoHanh (MaNhanVienXuLy);

create table PhieuNhap
(
    MaPhieuNhap int auto_increment
        primary key,
    MaNhaCC     int                                      null,
    MaNhanVien  int                                      null,
    NgayNhap    datetime       default CURRENT_TIMESTAMP null,
    TongTien    decimal(15, 2) default 0                 null,
    GhiChu      varchar(255)                             null,
    TrangThai   tinyint        default 0                 null,
    constraint fk_1
        foreign key (MaNhaCC) references NhaCungCap (MaNhaCC),
    constraint fk_2
        foreign key (MaNhanVien) references NhanVien (MaNhanVien)
)
    collate = utf8mb4_unicode_ci;

create table ChiTietPhieuNhap
(
    MaChiTietPhieu int auto_increment
        primary key,
    MaPhieuNhap    int            null,
    MaBienThe      int            null,
    SoLuong        int            not null,
    GiaNhap        decimal(15, 2) not null,
    ThanhTien      decimal(15, 2) not null,
    constraint fk_1
        foreign key (MaPhieuNhap) references PhieuNhap (MaPhieuNhap),
    constraint fk_2
        foreign key (MaBienThe) references BienTheSanPham (MaBienThe)
)
    collate = utf8mb4_unicode_ci;

create index idx_import_detail_import
    on ChiTietPhieuNhap (MaPhieuNhap);

create index idx_import_detail_variant
    on ChiTietPhieuNhap (MaBienThe);

create index idx_import_employee
    on PhieuNhap (MaNhanVien);

create index idx_import_supplier
    on PhieuNhap (MaNhaCC);

create table RuiRo
(
    MaRuiRo            int auto_increment
        primary key,
    MaDonHang          int                                   not null,
    LoaiRuiRo          varchar(100)                          null,
    MucDo              varchar(20) default 'BINH_THUONG'     null,
    NguonPhatHien      varchar(50) default 'NHAN_VIEN'       null,
    MoTa               varchar(255)                          null,
    TrangThai          tinyint     default 0                 null,
    NgayPhatHien       datetime    default CURRENT_TIMESTAMP null,
    NgayXuLy           datetime                              null,
    GhiChu             varchar(255)                          null,
    MaNhanVienPhuTrach int                                   null,
    constraint fk_1
        foreign key (MaDonHang) references DonHang (MaDonHang),
    constraint fk_ruiro_nhanvien
        foreign key (MaNhanVienPhuTrach) references NhanVien (MaNhanVien)
)
    collate = utf8mb4_unicode_ci;

create index idx_ruiro_mucdo
    on RuiRo (MucDo);

create index idx_ruiro_nhanvien
    on RuiRo (MaNhanVienPhuTrach);

create index idx_ruiro_trangthai
    on RuiRo (TrangThai);

create table TaiKhoanProvider
(
    MaProvider int auto_increment
        primary key,
    MaTaiKhoan int                                 not null,
    Provider   varchar(50)                         not null,
    ProviderID varchar(255)                        not null,
    CreatedAt  timestamp default CURRENT_TIMESTAMP null,
    constraint Provider
        unique (Provider, ProviderID),
    constraint fk_1
        foreign key (MaTaiKhoan) references TaiKhoan (MaTaiKhoan)
);

create table ThuocTinh
(
    MaThuocTinh  int auto_increment
        primary key,
    TenThuocTinh varchar(100) not null
)
    collate = utf8mb4_unicode_ci;

create table GiaTriThuocTinh
(
    MaGiaTri    int auto_increment
        primary key,
    MaThuocTinh int          not null,
    GiaTri      varchar(100) not null,
    constraint fk_1
        foreign key (MaThuocTinh) references ThuocTinh (MaThuocTinh)
)
    collate = utf8mb4_unicode_ci;

create table ChiTietBienThe
(
    MaBienThe int not null,
    MaGiaTri  int not null,
    primary key (MaBienThe, MaGiaTri),
    constraint fk_1
        foreign key (MaBienThe) references BienTheSanPham (MaBienThe),
    constraint fk_2
        foreign key (MaGiaTri) references GiaTriThuocTinh (MaGiaTri)
)
    collate = utf8mb4_unicode_ci;

create table TinTuc
(
    MaTinTuc   int auto_increment
        primary key,
    MaNhanVien int                                null,
    TieuDe     varchar(255)                       not null,
    NoiDung    longtext                           null,
    HinhAnh    varchar(255)                       null,
    NgayTao    datetime default CURRENT_TIMESTAMP null,
    TrangThai  tinyint  default 1                 null,
    constraint fk_1
        foreign key (MaNhanVien) references NhanVien (MaNhanVien)
)
    collate = utf8mb4_unicode_ci;

create table ViKhuyenMai
(
    MaVi            int auto_increment
        primary key,
    MaKhachHang     int                                not null,
    MaKhuyenMai     int                                not null,
    NgayLuu         datetime default CURRENT_TIMESTAMP null,
    TrangThaiSuDung tinyint  default 0                 null comment '0: Chưa dùng, 1: Đã dùng, 2: Hết hạn',
    constraint MaKhachHang
        unique (MaKhachHang, MaKhuyenMai),
    constraint fk_1
        foreign key (MaKhachHang) references KhachHang (MaKhachHang),
    constraint fk_2
        foreign key (MaKhuyenMai) references KhuyenMai (MaKhuyenMai)
)
    collate = utf8mb4_unicode_ci;

create table XuLyDoiTra
(
    MaXuLy   int auto_increment
        primary key,
    MaDoiTra int                                null,
    HanhDong varchar(100)                       null,
    GhiChu   varchar(255)                       null,
    NgayXuLy datetime default CURRENT_TIMESTAMP null,
    constraint fk_1
        foreign key (MaDoiTra) references DoiTra (MaDoiTra)
)
    collate = utf8mb4_unicode_ci;


