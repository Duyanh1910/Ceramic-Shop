export const PAGE_TITLES = {
  "/": "Ceramic Shop",
  "/home": "Trang chủ | Ceramic Shop",
  "/login": "Đăng nhập | Ceramic Shop",
  "/register": "Đăng ký | Ceramic Shop",
  "/forgot-password": "Quên mật khẩu | Ceramic Shop",
  "/login-success": "Đang xác thực | Ceramic Shop",
  "/cart": "Giỏ hàng | Ceramic Shop",
  "/checkout": "Thanh toán | Ceramic Shop",
  "/payment-result": "Kết quả thanh toán | Ceramic Shop",
  "/profile": "Hồ sơ của tôi | Ceramic Shop",
  "/vouchers": "Ví voucher | Ceramic Shop",
  "/warranties": "Bảo hành của tôi | Ceramic Shop",
  "/returns": "Đổi trả của tôi | Ceramic Shop",
  "/orders": "Đơn hàng của tôi | Ceramic Shop",
  "/admin": "Quản lý đơn hàng | Ceramic Shop",
  "/admin/products": "Quản lý sản phẩm | Ceramic Shop",
  "/admin/categories": "Quản lý danh mục | Ceramic Shop",
  "/admin/adminprofile": "Hồ sơ quản trị | Ceramic Shop",
  "/admin/reports": "Báo cáo thống kê | Ceramic Shop",
  "/admin/customers": "Quản lý khách hàng | Ceramic Shop",
  "/admin/inventories": "Lịch sử tồn kho | Ceramic Shop",
  "/admin/reviews": "Quản lý đánh giá | Ceramic Shop",
  "/admin/staffs": "Quản lý nhân viên | Ceramic Shop",
  "/admin/warranties": "Quản lý bảo hành | Ceramic Shop",
  "/admin/risks": "Quản lý rủi ro | Ceramic Shop",
  "/admin/returns": "Quản lý đổi trả | Ceramic Shop",
  "/admin/promotions": "Quản lý khuyến mãi | Ceramic Shop",
  "/admin/news": "Quản lý tin tức | Ceramic Shop",
};

export const getPageTitle = (pathname) => {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  if (pathname.startsWith("/product/")) {
    return "Chi tiết sản phẩm | Ceramic Shop";
  }
  if (pathname.startsWith("/news/")) {
    return "Chi tiết tin tức | Ceramic Shop";
  }
  if (pathname.startsWith("/support/")) {
    return "Hỗ trợ khách hàng | Ceramic Shop";
  }
  return "Ceramic Shop";
};
