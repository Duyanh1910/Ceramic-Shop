import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import ReactGA from "react-ga4";
import { HelmetProvider } from "react-helmet-async";

import LandingPage from "./LandingPage.jsx";
import Home from "./Home.jsx";
import Login from "./Login.jsx";
import Register from "./Register.jsx";
import ProductDetail from "./productDetail.jsx";
import Profile from "./Profile.jsx";
import Cart from "./Cart.jsx";
import ChatBot from "./ChatBot";
import ContactIcons from "./ContactIcons.jsx";
import ForgotPassword from "./ForgotPassword.jsx";
import LoginSuccess from "./LoginSuccess.jsx";
import AdminLayout from "./AdminLayout.jsx";
import AdminDashboard from "./AdminDashboard.jsx";
import AdminProducts from "./AdminProducts.jsx";
import AdminCustomers from "./AdminCustomers.jsx";
import AdminStaffs from "./AdminStaffs.jsx";
import PaymentSuccess from "./PaymentSuccess.jsx";
import OrderTracking from "./OrderTracking.jsx";
import SupportPage from "./Supportpage.jsx";
import NewsDetail from "./NewsDetails.jsx";
import AdminReports from "./AdminReports.jsx";
import Checkout from "./Checkout.jsx";
import PaymentResult from "./PaymentResult.jsx";
import AdminProfile from "./AdminProfile.jsx";
import AdminPromotions from "./AdminPromotions.jsx";
import AdminNews from "./AdminNews.jsx";
import AdminWarranties from "./AdminWarranties.jsx";
import AdminRisks from "./AdminRisks.jsx";
import AdminInventories from "./AdminInventories.jsx";
import AdminReviews from "./AdminReviews.jsx";

ReactGA.initialize("G-909W1LHHLD");

const AnalyticsTracker = () => {
  const location = useLocation();

  useEffect(() => {
    ReactGA.send({
      hitType: "pageview",
      page: location.pathname + location.search,
    });
  }, [location]);

  return null;
};

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
  const allowedPaths = ["/", "/home", "/profile", "/cart"];
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

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <AnalyticsTracker />
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
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["Admin", "Staff"]}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="adminprofile" element={<AdminProfile />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="inventories" element={<AdminInventories />} />
            <Route path="reviews" element={<AdminReviews />} />
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
