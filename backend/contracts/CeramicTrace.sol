// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CeramicTrace {

    address public admin;

    // ── Cấu trúc dữ liệu sản phẩm ──
    struct Product {
        string maSanPham;
        string tenSanPham;
        string tenNhaCungCap;    
        string diaChiNhaCungCap; 
        string chatLieu;
        string ngaySanXuat;
        address nguoiTao;
        uint256 thoiGianTao;
        bool tonTai;
    }

    // ── Lưu trữ ──
    mapping(string => Product) public products;
    string[] public allProductIds;

    // ── Events (để frontend lắng nghe) ──
    event SanPhamDaTao(string maSanPham, string tenSanPham, uint256 thoiGian);

    // ── Modifier chỉ Admin ──
    modifier chiAdmin() {
        require(msg.sender == admin, "Chi admin moi duoc thao tac");
        _;
    }

    constructor() {
        admin = msg.sender;  // Người deploy là admin
    }

    // ── Thêm/cập nhật thông tin sản phẩm ──
    function themSanPham(
        string memory _maSanPham,
        string memory _tenSanPham,
        string memory _tenNhaCungCap,    
        string memory _diaChiNhaCungCap, 
        string memory _chatLieu,
        string memory _ngaySanXuat
    ) public chiAdmin {
        if (!products[_maSanPham].tonTai) {
            allProductIds.push(_maSanPham);
        }

        products[_maSanPham] = Product({
            maSanPham:        _maSanPham,
            tenSanPham:       _tenSanPham,
            tenNhaCungCap:    _tenNhaCungCap,       
            diaChiNhaCungCap: _diaChiNhaCungCap, 
            chatLieu:         _chatLieu,
            ngaySanXuat:      _ngaySanXuat,
            nguoiTao:         msg.sender,
            thoiGianTao:      block.timestamp,
            tonTai:           true
        });

        emit SanPhamDaTao(_maSanPham, _tenSanPham, block.timestamp);
    }

    // ── Đọc thông tin sản phẩm (miễn phí) ──
    function xemSanPham(string memory _maSanPham)
        public view returns (Product memory)
    {
        require(products[_maSanPham].tonTai, "San pham khong ton tai");
        return products[_maSanPham];
    }

    // ── Đổi admin ──
    function doiAdmin(address _adminMoi) public chiAdmin {
        require(_adminMoi != address(0), "Dia chi khong hop le");
        admin = _adminMoi;
    }
}