import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { getPageTitle } from "./pageTitles.js";

// --- CUSTOMER ---
import LandingPage from "./Customer/LandingPage.jsx";
import Home from "./Customer/Home.jsx";
import ProductDetail from "./Customer/productDetail.jsx";
import Cart from "./Customer/Cart.jsx";
import Checkout from "./Customer/Checkout.jsx";
import VoucherWallet from "./Customer/VoucherWallet.jsx";
import CustomerWarranties from "./Customer/CustomerWarranties.jsx";
import SupportPage from "./Customer/Supportpage.jsx";
import NewsDetail from "./Customer/NewsDetails.jsx";
import CustomerReturns from "./Customer/CustomerReturns.jsx";

// --- AUTH ---
import Login from "./Auth/Login.jsx";
import Register from "./Auth/Register.jsx";
import Profile from "./Auth/Profile.jsx";
import ForgotPassword from "./Auth/ForgotPassword.jsx";
import LoginSuccess from "./Auth/LoginSuccess.jsx";

// --- UTILITY ---
import ChatBot from "./Utility/ChatBot.jsx";
import ContactIcons from "./Utility/ContactIcons.jsx";
import PaymentSuccess from "./Utility/PaymentSuccess.jsx";
import PaymentResult from "./Utility/PaymentResult.jsx";
import OrderTracking from "./Utility/OrderTracking.jsx";

// --- ADMIN ---
import AdminLayout from "./Admin/AdminLayout.jsx";
import AdminDashboard from "./Admin/AdminDashboard.jsx";
import AdminProducts from "./Admin/AdminProducts.jsx";
import AdminCustomers from "./Admin/AdminCustomers.jsx";
import AdminStaffs from "./Admin/AdminStaffs.jsx";
import AdminReports from "./Admin/AdminReports.jsx";
import AdminProfile from "./Admin/AdminProfile.jsx";
import AdminPromotions from "./Admin/AdminPromotions.jsx";
import AdminNews from "./Admin/AdminNews.jsx";
import AdminWarranties from "./Admin/AdminWarranties.jsx";
import AdminRisks from "./Admin/AdminRisks.jsx";
import AdminInventories from "./Admin/AdminInventories.jsx";
import AdminReviews from "./Admin/AdminReviews.jsx";
import AdminCategories from "./Admin/AdminCategory.jsx";
import AdminReturns from "./Admin/AdminReturns.jsx";
import AdminPayments from "./Admin/AdminPayments.jsx";
import AdminSuppliers from "./Admin/AdminSupplier.jsx";
import AdminReceivedNotes from "./Admin/AdminReceivedNote.jsx";
import AdminNotifications from "./Admin/AdminNotifications.jsx";

const PublicRoute = ({ children }) => {
  const isCustomerActive =
    localStorage.getItem("customer_session_active") === "true";

  if (isCustomerActive) {
    return <Navigate to="/home" replace />;
  }

  return children;
};

const ProtectedRoute = ({ children, allowedRoles }) => {
  const isCustomer = localStorage.getItem("customer_session_active") === "true";
  const isAdmin = localStorage.getItem("admin_session_active") === "true";

  if (!isCustomer && !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  let userRole = "Customer";
  if (isAdmin) userRole = localStorage.getItem("admin_role") || "Admin";
  else if (isCustomer)
    userRole = localStorage.getItem("customer_role") || "Customer";

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const ConditionalChatBot = () => {
  const location = useLocation();
  const allowedPaths = ["/", "/home"];
  const isAllowed =
    allowedPaths.includes(location.pathname) ||
    location.pathname.startsWith("/product/");

  return (
    <div style={{ display: isAllowed ? "block" : "none" }}>
      <ChatBot />
    </div>
  );
};

const ConditionalContactIcons = () => {
  const location = useLocation();
  const allowedPaths = ["/", "/home"];
  const isAllowed = allowedPaths.includes(location.pathname);

  return isAllowed ? <ContactIcons /> : null;
};

const RouteTitle = () => {
  const location = useLocation();

  return (
    <Helmet>
      <title>{getPageTitle(location.pathname)}</title>
    </Helmet>
  );
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <RouteTitle />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/news/:id" element={<NewsDetail />} />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />

          <Route path="/home" element={<Home />} />

          <Route path="/cart" element={<Cart />} />

          <Route
            path="/checkout"
            element={
              <ProtectedRoute allowedRoles={["Customer", "Admin", "Staff"]}>
                <Checkout />
              </ProtectedRoute>
            }
          />

          <Route path="/payment-result" element={<PaymentSuccess />} />

          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={["Customer", "Admin", "Staff"]}>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vouchers"
            element={
              <ProtectedRoute allowedRoles={["Customer", "Admin", "Staff"]}>
                <VoucherWallet />
              </ProtectedRoute>
            }
          />
          <Route
            path="/warranties"
            element={
              <ProtectedRoute allowedRoles={["Customer"]}>
                <CustomerWarranties />
              </ProtectedRoute>
            }
          />
          <Route
            path="/returns"
            element={
              <ProtectedRoute allowedRoles={["Customer"]}>
                <CustomerReturns />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["Admin", "Staff"]}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="adminprofile" element={<AdminProfile />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="suppliers" element={<AdminSuppliers />} />
            <Route path="received_notes" element={<AdminReceivedNotes />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="inventories" element={<AdminInventories />} />
            <Route path="reviews" element={<AdminReviews />} />
            <Route path="notifications" element={<AdminNotifications/>} />
            <Route
              path="staffs"
              element={
                <ProtectedRoute allowedRoles={["Admin"]}>
                  <AdminStaffs />
                </ProtectedRoute>
              }
            />
            <Route path="warranties" element={<AdminWarranties />} />
            <Route path="risks" element={<AdminRisks />} />
            <Route path="returns" element={<AdminReturns />} />
            <Route path="payments" element={<AdminPayments />} />
            <Route
              path="promotions"
              element={
                <ProtectedRoute allowedRoles={["Admin"]}>
                  <AdminPromotions />
                </ProtectedRoute>
              }
            />
            <Route
              path="news"
              element={
                <ProtectedRoute allowedRoles={["Admin"]}>
                  <AdminNews />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
          <Route path="/login-success" element={<LoginSuccess />} />

          <Route
            path="/orders"
            element={
              <ProtectedRoute allowedRoles={["Customer", "Admin", "Staff"]}>
                <OrderTracking />
              </ProtectedRoute>
            }
          />
          <Route path="/support/:slug" element={<SupportPage />} />
          <Route path="/payment-result" element={<PaymentResult />} />
        </Routes>
        <ConditionalContactIcons />
        <ConditionalChatBot />
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>,
);
