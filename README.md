# Pottery Shop Management System

Pottery Shop Management System là hệ thống quản lý và bán hàng gốm sứ theo mô hình full-stack. Dự án gồm website khách hàng, trang quản trị nội bộ, REST API, cơ sở dữ liệu MySQL/TiDB, tích hợp thanh toán, bảo hành, đổi trả, ví voucher, thống kê, chatbot và thông báo realtime.

## Tính năng chính

- Khách hàng: xem danh mục, tìm kiếm/lọc sản phẩm, xem chi tiết biến thể, giỏ hàng, đặt hàng, theo dõi đơn, đánh giá sản phẩm.
- Tài khoản: đăng ký, đăng nhập, đăng xuất, đổi mật khẩu, quên mật khẩu OTP, xác thực email, đăng nhập Google/Facebook.
- Khuyến mãi: danh sách voucher, lưu voucher vào ví, áp dụng giảm giá đơn hàng và phí vận chuyển.
- Thanh toán: COD, MoMo, ZaloPay, kiểm tra trạng thái giao dịch và IPN/callback.
- Hậu mãi: bảo hành sản phẩm, yêu cầu đổi trả, hoàn tiền, quản lý rủi ro phát sinh.
- Quản trị: quản lý sản phẩm, danh mục, khách hàng, nhân viên, đơn hàng, tồn kho, tin tức, đánh giá, khuyến mãi, nhà cung cấp, thanh toán.
- Báo cáo: doanh thu, tổng quan, sản phẩm bán chạy, sản phẩm xem nhiều, đánh giá.
- Realtime: Socket.IO gửi sự kiện đơn hàng cho admin/khách hàng.
- Chatbot: webhook cho Dialogflow, tra cứu sản phẩm/đơn hàng/bảo hành và tư vấn khách hàng.

## Công nghệ

| Phần | Công nghệ |
| --- | --- |
| Frontend | React 19, Vite 7, React Router 7, Ant Design 6, Recharts, Axios, Socket.IO Client |
| Backend | Node.js, Express 5, Sequelize 6, MySQL2, Socket.IO, Passport, JWT, Helmet, CORS |
| Database | MySQL/TiDB, SQL schema và seed trong `database/` |
| Auth | JWT qua cookie `accessToken` hoặc `Authorization: Bearer <token>` |
| Payment | MoMo, ZaloPay |
| Email | Brevo API |
| Deploy tham chiếu | Frontend Vercel, Backend Render |

## Cấu trúc thư mục

```text
.
├── backend/              # Express API, controllers, services, models, routes
│   ├── app.js            # Backend entrypoint
│   ├── config/           # Database, Passport, Redis, Socket.IO, chatbot
│   ├── controllers/      # HTTP controllers
│   ├── middlewares/      # JWT, role authorization, error handler
│   ├── models/           # Sequelize models và associations
│   ├── routes/           # API route definitions
│   ├── services/         # Business logic
│   └── utils/            # Helpers, order calculators
├── frontend/             # React/Vite application
│   ├── public/           # Assets, GLB models, images
│   └── src/
│       ├── Admin/        # Admin dashboard pages
│       ├── Auth/         # Login/register/profile/password pages
│       ├── Customer/     # Customer storefront pages
│       └── Utility/      # Shared UI, chatbot, payment, order tracking
├── database/
│   ├── script.sql        # Database schema
│   └── seed.sql          # Seed/sample data
├── frontend_testing/     # Static HTML prototypes/testing pages
└── docs/
    ├── .vitepress/       # VitePress config and Swagger UI component
    ├── public/openapi.yaml
    ├── api.md            # Swagger UI page
    ├── index.md          # Docs homepage
    └── DEVELOPMENT.md    # Developer documentation
```

## Chạy local

Yêu cầu:

- Node.js 18+ hoặc 20+
- npm
- MySQL/TiDB database đã import `database/script.sql`
- File `backend/isrgrootx1.pem` có sẵn trong repo để kết nối SSL database

### 1. Cài dependencies

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 2. Cấu hình backend

Tạo file `backend/.env`:

```env
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3000

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_DATABASE=ceramic_shop
DB_CONN=

COOKIE_NAME=ceramic_shop_sid
COOKIE_SECRET=replace_me
JWT_SECRET=replace_me
JWT_EXPIRES_IN=1d
REMEMBER_ME_EXPIRES_IN=30d
SALT_ROUNDS=10

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=

BREVO_API_KEY=
BREVO_SENDER_EMAIL=
BREVO_SENDER_NAME=The Ceramic Shop

GHN_API_TOKEN=
GHN_SHOP_ID=

UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

### 3. Import database

```bash
mysql -u root -p ceramic_shop < database/script.sql
mysql -u root -p ceramic_shop < database/seed.sql
```

Nếu dùng TiDB Cloud hoặc MySQL bắt buộc SSL, giữ cấu hình SSL hiện tại trong `backend/config/database.js`.

### 4. Start backend và frontend

```bash
cd backend
npm run dev
```

Backend mặc định chạy ở:

```text
http://localhost:3000/api/v1
```

```bash
cd frontend
npm run dev
```

Frontend mặc định chạy ở:

```text
http://localhost:5173
```

Lưu ý: frontend dùng chung `frontend/src/config/api.js` để cấu hình API. Có thể override bằng `VITE_API_BASE_URL` hoặc backend origin `VITE_API_URL`.

## Scripts

Backend:

```bash
npm run dev      # nodemon app.js
npm start        # node app.js
npm test         # hiện chưa có test thật, script đang exit 1
```

Frontend:

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

Documentation site:

```bash
cd docs
npm install
npm run dev
npm run build
npm run preview
```

## Tài liệu

- Dev document dùng VitePress: `docs/DEVELOPMENT.md`
- API document dùng Swagger/OpenAPI: `backend/docs/swagger.yaml`
- VitePress Swagger page: `docs/api.md`
- Khi chạy `npm run dev` hoặc `npm run build` trong `docs/`, script sẽ đồng bộ `backend/docs/swagger.yaml` sang `docs/public/openapi.yaml`.

## Ghi chú kỹ thuật quan trọng

- API prefix thực tế là `/api/v1`; Swagger spec đã dùng server `http://localhost:3000/api/v1`.
- Auth hỗ trợ cookie HTTP-only `accessToken` và Bearer token.
- `checkRole("Staff", "Admin")` bảo vệ phần lớn route quản trị; một số route chỉ cho `Admin`.
- Frontend lưu trạng thái phiên ở `localStorage` để điều hướng UI, nhưng backend vẫn là nguồn phân quyền chính.
- Database schema dùng tên bảng/cột tiếng Việt như `SanPham`, `BienTheSanPham`, `DonHang`, `KhachHang`.
- Một số tích hợp phụ thuộc dịch vụ ngoài: Brevo, GHN, MoMo, ZaloPay, Google OAuth, Facebook OAuth, Upstash Redis, Cloudinary.
