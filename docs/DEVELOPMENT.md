# Developer Documentation

Tài liệu này mô tả cách phát triển, vận hành và mở rộng Pottery Shop Management System dựa trên code hiện tại trong repo.

## 1. Tổng quan kiến trúc

```text
React/Vite frontend
        |
        | Axios, cookie credentials, optional Bearer token
        v
Express REST API (/api/v1)
        |
        | Sequelize ORM + raw mysql2 pool cho chatbot
        v
MySQL/TiDB database

Express server cũng khởi tạo Socket.IO để phát realtime events cho admin và khách hàng.
```

Backend được chia theo lớp:

- `routes/`: khai báo URL, HTTP method, middleware auth/role.
- `controllers/`: đọc `req`, validate cơ bản, gọi service, chuẩn hóa response.
- `services/`: business logic, transaction, inventory, promotion, warranty, return, payment.
- `models/`: Sequelize model và association trong `models/index.js`.
- `middlewares/`: JWT, phân quyền role, error middleware.
- `utils/`: helper validate và các hàm tính đơn hàng.

Frontend được chia theo nhóm màn hình:

- `src/Customer`: storefront và self-service của khách hàng.
- `src/Admin`: dashboard và các màn hình quản trị.
- `src/Auth`: đăng nhập, đăng ký, profile, quên/đổi mật khẩu.
- `src/Utility`: component dùng chung, chatbot, thanh toán, theo dõi đơn.

## 2. Runtime và dependencies

Backend:

- `express@5`
- `sequelize@6`
- `mysql2`
- `jsonwebtoken`
- `passport`, `passport-google-oauth20`, `passport-facebook`
- `socket.io`
- `exceljs`
- `axios`
- `bcrypt`
- `helmet`, `cors`, `cookie-parser`, `express-session`, `express-mysql-session`

Frontend:

- `react@19`
- `vite@7`
- `react-router-dom@7`
- `antd@6`
- `axios`
- `socket.io-client`
- `recharts`
- `react-helmet-async`
- `@react-oauth/google`

## 3. Biến môi trường backend

Backend đọc `.env` qua `dotenv/config` trong `backend/config/app_config.js`.

| Biến | Bắt buộc | Mục đích |
| --- | --- | --- |
| `PORT` | Có | Port Express, mặc định code fallback `3000` |
| `NODE_ENV` | Có | `production` bật secure cookie và `sameSite=none` |
| `FRONTEND_URL` | Có | CORS, Socket.IO và redirect lỗi OAuth |
| `BACKEND_URL` | Có nếu dùng OAuth | Base URL để tạo OAuth callback |
| `DB_HOST` | Có | Host MySQL/TiDB |
| `DB_PORT` | Có | Port database |
| `DB_USER` | Có | User database |
| `DB_PASSWORD` | Có | Password database |
| `DB_DATABASE` | Có | Database/schema name |
| `DB_CONN` | Không thấy dùng trực tiếp | Được export trong `dbConfig.conn` |
| `COOKIE_NAME` | Có | Tên session cookie Express |
| `COOKIE_SECRET` | Có | Secret session |
| `JWT_SECRET` | Có | Ký và verify JWT |
| `JWT_EXPIRES_IN` | Có | Hạn JWT thường |
| `REMEMBER_ME_EXPIRES_IN` | Có | Hạn JWT khi remember me |
| `SALT_ROUNDS` | Có | Bcrypt salt rounds |
| `GOOGLE_CLIENT_ID` | Nếu OAuth Google | Google OAuth |
| `GOOGLE_CLIENT_SECRET` | Nếu OAuth Google | Google OAuth |
| `FACEBOOK_APP_ID` | Nếu OAuth Facebook | Facebook OAuth |
| `FACEBOOK_APP_SECRET` | Nếu OAuth Facebook | Facebook OAuth |
| `BREVO_API_KEY` | Nếu gửi mail | Brevo email API |
| `BREVO_SENDER_EMAIL` | Nếu gửi mail | Sender email |
| `BREVO_SENDER_NAME` | Không bắt buộc | Sender name, fallback `The Ceramic Shop` |
| `GHN_API_TOKEN` | Nếu tính phí ship GHN | GHN API |
| `GHN_SHOP_ID` | Nếu tính phí ship GHN | GHN shop id |
| `UPSTASH_REDIS_REST_URL` | Nếu dùng Redis | Upstash Redis |
| `UPSTASH_REDIS_REST_TOKEN` | Nếu dùng Redis | Upstash Redis |

## 4. Database

Schema chính nằm ở `database/script.sql`, seed/sample data nằm ở `database/seed.sql`.

Các nhóm bảng chính:

- Tài khoản và phân quyền: `TaiKhoan`, `PhanQuyen`, `KhachHang`, `NhanVien`, `TaiKhoanProvider`.
- Sản phẩm: `DanhMucSanPham`, `SanPham`, `BienTheSanPham`, `HinhAnhBienThe`, `ThuocTinh`, `GiaTriThuocTinh`, `ChiTietBienThe`.
- Giỏ hàng: `GioHang`, `ChiTietGioHang`.
- Đơn hàng: `DonHang`, `ChiTietDonHang`, `LoaiPhiVanChuyen`.
- Khuyến mãi: `LoaiKhuyenMai`, `KhuyenMai`, `ViKhuyenMai`, `ChiTietKhuyenMaiDonHang`.
- Thanh toán: `PhuongThucThanhToan`, `GiaoDichThanhToan`.
- Hậu mãi: `BaoHanh`, `LichSuBaoHanh`, `DoiTra`, `XuLyDoiTra`, `RuiRo`.
- Tồn kho/nhập hàng: `LichSuTonKho`, `NhaCungCap`, `PhieuNhap`, `ChiTietPhieuNhap`.
- Nội dung: `TinTuc`.
- Cấu hình: `CauHinhHeThong`.

Sequelize associations được gom trong `backend/models/index.js`. Khi thêm model mới, cần:

1. Tạo file model trong `backend/models/...`.
2. Import vào `models/index.js`.
3. Khai báo association.
4. Export model.
5. Tạo migration SQL hoặc cập nhật `database/script.sql`.

## 5. Auth và phân quyền

Login flow:

1. Client gọi `POST /api/v1/auth/login`.
2. Backend verify username/password qua `auth.services.js`.
3. Backend set cookie HTTP-only `accessToken`.
4. Client gọi API với `withCredentials: true`; middleware cũng hỗ trợ `Authorization: Bearer <token>`.

JWT middleware:

- File: `backend/middlewares/jwt.middlewares.js`
- Đọc token từ `req.cookies.accessToken` trước, sau đó `Authorization: Bearer`.
- Verify bằng `JWT_SECRET`.
- Gán decoded payload vào `req.user`.

Role middleware:

- File: `backend/middlewares/authorize.middlewares.js`
- Dùng `checkRole("Admin", "Staff", ...)`.
- Role hiện dùng trong code: `Customer`, `Staff`, `Admin`.

Frontend route guard:

- `frontend/src/main.jsx` dùng `localStorage` keys:
  - `customer_session_active`
  - `customer_role`
  - `admin_session_active`
  - `admin_role`
- Đây chỉ là điều hướng UI. Bảo mật thật nằm ở backend JWT + role middleware.

## 6. Response và error convention

Thành công thường có dạng:

```json
{
  "success": true,
  "message": "Mô tả kết quả",
  "result": {}
}
```

Một số endpoint dùng key khác như `user`, `feeResult`, `total`.

Lỗi đi qua `backend/middlewares/error.middlewares.js`:

```json
{
  "success": false,
  "message": "Nội dung lỗi"
}
```

Controller/service ném `ErrorHandler(message, statusCode, data)`.

## 7. Các enum nghiệp vụ

### Đơn hàng

`ORDER_STATUS` trong `backend/services/order.services.js`:

| Giá trị | Ý nghĩa |
| --- | --- |
| `0` | Chờ xác nhận |
| `1` | Đang chuẩn bị |
| `2` | Đang giao |
| `3` | Hoàn thành |
| `4` | Đã hủy |

Luồng chuyển trạng thái hợp lệ:

- `0 -> 1` hoặc `0 -> 4`
- `1 -> 2` hoặc `1 -> 4`
- `2 -> 3`

Khi chuyển sang hoàn thành, backend tạo bảo hành mặc định 12 tháng cho từng dòng đơn hàng. Đơn COD chỉ được hoàn thành khi `TrangThaiThanhToan = 1`.

### Thanh toán

Trong code hiện dùng:

- `MaPhuongThuc = 1`: COD
- `MaPhuongThuc = 4`: MoMo
- `MaPhuongThuc = 5`: ZaloPay
- `TrangThaiThanhToan = 0`: chưa thanh toán
- `TrangThaiThanhToan = 1`: đã thanh toán

`GiaoDichThanhToan.TrangThai` dùng chuỗi như `PENDING`, `SUCCESS`, `FAILED`.

### Bảo hành

`WARRANTY_STATUS` trong `backend/services/warranty.service.js`:

| Giá trị | Ý nghĩa |
| --- | --- |
| `0` | Hết hạn |
| `1` | Còn hiệu lực |
| `2` | Khách đã gửi yêu cầu |
| `3` | Đang xử lý |
| `4` | Hoàn tất |
| `5` | Từ chối |

Luồng hợp lệ:

- `2 -> 3` hoặc `2 -> 5`
- `3 -> 4` hoặc `3 -> 5`

### Đổi trả

`RETURN_STATUS` trong `backend/services/return.service.js`:

| Giá trị | Ý nghĩa |
| --- | --- |
| `0` | Chờ xử lý |
| `1` | Đã duyệt |
| `2` | Từ chối |
| `3` | Đang xử lý |
| `4` | Hoàn tất |
| `5` | Khách hủy |

Loại yêu cầu:

- `DOI_HANG`
- `TRA_HANG`
- `HOAN_TIEN`
- `VO_HONG_VAN_CHUYEN`
- `THIEU_HANG`
- `SAI_SAN_PHAM`

Tình trạng hàng:

- `CON_NGUYEN`
- `DA_SU_DUNG`
- `VO_HONG`
- `LOI_SAN_XUAT`
- `KHONG_NHAN_LAI`

Hình thức xử lý:

- `DOI_SAN_PHAM`
- `GUI_BO_SUNG`
- `HOAN_TIEN_MOT_PHAN`
- `HOAN_TIEN_TOAN_PHAN`

## 8. Realtime Socket.IO

Server khởi tạo trong `backend/config/socketIO.js`.

Client phải gửi token ở handshake:

```js
io(API_ORIGIN, {
  auth: { token },
  withCredentials: true,
});
```

Room:

- Admin/Staff join `admin_room`.
- Customer join `customer_room:<MaKhachHang>`.

Events backend đang emit:

- `admin:order_created`
- `admin:order_canceled`
- `admin:order_updated`
- `customer:order_canceled`
- `customer:order_updated`

## 9. Frontend routing

Public/customer routes chính:

- `/`
- `/home`
- `/product/:id`
- `/news/:id`
- `/login`
- `/register`
- `/forgot-password`
- `/cart`
- `/checkout`
- `/profile`
- `/vouchers`
- `/warranties`
- `/returns`
- `/orders`
- `/support/:slug`
- `/payment-result`

Admin routes nằm dưới `/admin`:

- `/admin`
- `/admin/products`
- `/admin/categories`
- `/admin/adminprofile`
- `/admin/reports`
- `/admin/suppliers`
- `/admin/customers`
- `/admin/inventories`
- `/admin/reviews`
- `/admin/staffs`
- `/admin/warranties`
- `/admin/risks`
- `/admin/returns`
- `/admin/payments`
- `/admin/promotions`
- `/admin/news`

## 10. Quy ước phát triển backend

Khi thêm một API mới:

1. Thêm service trong `backend/services`.
2. Thêm controller trong `backend/controllers`.
3. Thêm route trong `backend/routes`.
4. Nếu cần auth, gắn `jwtMiddleware` và `checkRole`.
5. Nếu có transaction, dùng `sequelize.transaction()` và rollback trong catch.
6. Trả lỗi bằng `ErrorHandler` để middleware chuẩn hóa response.
7. Cập nhật OpenAPI spec ở `backend/docs/swagger.yaml`.

Ví dụ skeleton:

```js
router.post("/", jwtMiddleware, checkRole("Admin"), createSomething);
```

```js
export const createSomething = async (req, res, next) => {
  try {
    const result = await createSomethingService(req.body);
    return res.status(201).json({
      success: true,
      message: "Tạo thành công!",
      result,
    });
  } catch (err) {
    next(err);
  }
};
```

## 11. Quy ước phát triển frontend

- Dùng React component theo nhóm màn hình sẵn có: `Admin`, `Auth`, `Customer`, `Utility`.
- API call hiện đang rải trực tiếp trong component bằng Axios.
- Khi chỉnh lớn, nên gom API base URL về một module dùng chung, ví dụ `src/api/client.js`.
- Gửi cookie bằng `withCredentials: true`.
- Với upload ảnh, frontend đang dùng Cloudinary unsigned/direct upload ở `Auth/Profile.jsx`, `Admin/AdminProfile.jsx`, `Admin/AdminNews.jsx`.

Khuyến nghị refactor kỹ thuật:

- Thay hard-code `https://ceramic-shop-u8ak.onrender.com/api/v1` bằng `import.meta.env.VITE_API_BASE_URL`.
- Tạo Axios instance chung:

```js
import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1",
  withCredentials: true,
});
```

## 12. Tích hợp bên ngoài

### GHN

`backend/utils/orders/calculate_shipping_fee.js` dùng:

- `GHN_API_TOKEN`
- `GHN_SHOP_ID`

Frontend `AddressSelector.jsx` gọi trực tiếp GHN address API.

### Email/Brevo

`backend/services/email.services.js` dùng Brevo API để gửi OTP xác thực email/quên mật khẩu.

### OAuth

`backend/config/passport.js` cấu hình:

- Google callback: `${BACKEND_URL}/api/v1/auth/google/callback`
- Facebook callback: `${BACKEND_URL}/api/v1/auth/facebook/callback`

### Payment

- MoMo: `backend/services/payment/momo.services.js`
- ZaloPay: `backend/services/payment/zalopay.services.js`
- Admin refund confirmation: `backend/services/payment/admin_payment_transaction.services.js`

### Chatbot

`backend/routes/chatbot.route.js` là Dialogflow webhook. File này dùng raw MySQL pool trong `backend/config/chatbot.config.js`, không đi qua Sequelize service.

## 13. Build và deploy

Frontend:

```bash
cd frontend
npm run build
```

Vercel SPA rewrite nằm ở `frontend/vercel.json`.

Backend:

```bash
cd backend
npm start
```

Khi deploy production cần:

- `NODE_ENV=production`
- `FRONTEND_URL` đúng domain frontend
- `BACKEND_URL` đúng domain backend
- CORS cho frontend domain
- Cookie `sameSite=none`, `secure=true`
- OAuth provider callback URL trùng domain backend
- Database SSL hoạt động với `isrgrootx1.pem`

## 14. Kiểm thử hiện trạng

Repo hiện chưa có test tự động thật:

- `backend/package.json` có `npm test` nhưng luôn báo `Error: no test specified` và exit `1`.
- `frontend` có `npm run lint`.
- `frontend_testing/` chứa các HTML prototype/testing page thủ công.

Khuyến nghị bổ sung:

- Backend integration test cho auth, cart, order, payment callback, warranty/return.
- Unit test cho `calculate_product_fee`, `calculate_shipping_fee`, `calculate_order_discount`.
- Frontend component test cho checkout/admin order update.

## 15. Các điểm cần chú ý trong code hiện tại

- `backend/docs/swagger.yaml` là nguồn API document chính. VitePress sync file này sang `docs/public/openapi.yaml` để render bằng Swagger UI.
- Frontend có nhiều API URL production hard-code.
- Route `backend/routes/admin/adminProduct.route.js` khai báo `router.delete("/:id")` trước `router.delete("/variant/images")`; trong Express, route động có thể bắt nhầm `/variant/images`. Nên đặt route cụ thể trước route `/:id`.
- `checkRole` trả status code `401` cho case forbidden; về chuẩn HTTP nên là `403`.
- Nhiều message trong source có dấu tiếng Việt bị mojibake do encoding, nên thống nhất UTF-8 khi chỉnh sửa.
