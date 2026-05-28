import {useEffect, useState} from "react";
import {Avatar, Dropdown, Layout, Menu, notification} from "antd";
import {
  AlertOutlined,
  AppstoreOutlined,
  AuditOutlined,
  BarChartOutlined,
  CommentOutlined,
  CreditCardOutlined,
  DashboardOutlined,
  DeploymentUnitOutlined,
  FileTextOutlined,
  LogoutOutlined,
  SafetyOutlined,
  ShoppingOutlined,
  SwapOutlined,
  TagsOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {Outlet, useLocation, useNavigate} from "react-router-dom";
import axios from "axios";
import styles from "./AdminLayout.module.css";
import {connectAdminSocket, disconnectAdminSocket} from "../Utility/socket.js";

const {Header, Sider, Content} = Layout;
const API_BASE = "https://ceramic-shop-u8ak.onrender.com/api/v1";

const STAFF_MENU = [
    {key: "/admin", icon: <DashboardOutlined/>, label: "Đơn hàng"},
    {key: "/admin/products", icon: <ShoppingOutlined/>, label: "Sản phẩm"},
    {
        key: "/admin/categories",
        icon: <AppstoreOutlined/>,
        label: "Danh mục sản phẩm",
    },
    {key: "/admin/customers", icon: <TeamOutlined/>, label: "Khách hàng"},
    {
        key: "/admin/suppliers",
        icon: <DeploymentUnitOutlined/>,
        label: "Nhà cung cấp",
    },
    {
        key: "/admin/received_notes",
        icon: <AuditOutlined/>,
        label: "Phiếu nhập hàng",
    },
    {key: "/admin/promotions", icon: <TagsOutlined/>, label: "Khuyến mãi"},
    {key: "/admin/news", icon: <FileTextOutlined/>, label: "Tin tức"},
    {key: "/admin/warranties", icon: <SafetyOutlined/>, label: "Bảo hành"},
    {key: "/admin/risks", icon: <AlertOutlined/>, label: "Rủi ro"},
    {key: "/admin/returns", icon: <SwapOutlined/>, label: "Đổi trả"},
    {
        key: "/admin/payments",
        icon: <CreditCardOutlined/>,
        label: "Thanh toán / Hoàn tiền",
    },
    {
        key: "/admin/inventories",
        icon: <AuditOutlined/>,
        label: "Lịch sử tồn kho",
    },
    {
        key: "/admin/reviews",
        icon: <CommentOutlined/>,
        label: "Phản hồi khách hàng",
    },
];

const ADMIN_MENU = [
    {key: "/admin", icon: <DashboardOutlined/>, label: "Đơn hàng"},
    {key: "/admin/products", icon: <ShoppingOutlined/>, label: "Sản phẩm"},
    {
        key: "/admin/categories",
        icon: <AppstoreOutlined/>,
        label: "Danh mục sản phẩm",
    },
    {key: "/admin/customers", icon: <TeamOutlined/>, label: "Khách hàng"},
    {
        key: "/admin/suppliers",
        icon: <DeploymentUnitOutlined/>,
        label: "Nhà cung cấp",
    },
    {
        key: "/admin/received_notes",
        icon: <AuditOutlined/>,
        label: "Phiếu nhập hàng",
    },
    {key: "/admin/staffs", icon: <UserOutlined/>, label: "Nhân viên"},
    {key: "/admin/promotions", icon: <TagsOutlined/>, label: "Khuyến mãi"},
    {
        key: "/admin/reports",
        icon: <BarChartOutlined/>,
        label: "Báo cáo và Thống kê",
    },
    {key: "/admin/news", icon: <FileTextOutlined/>, label: "Tin tức"},
    {key: "/admin/warranties", icon: <SafetyOutlined/>, label: "Bảo hành"},
    {key: "/admin/risks", icon: <AlertOutlined/>, label: "Rủi ro"},
    {key: "/admin/returns", icon: <SwapOutlined/>, label: "Đổi trả"},
    {
        key: "/admin/payments",
        icon: <CreditCardOutlined/>,
        label: "Thanh toán / Hoàn tiền",
    },
    {
        key: "/admin/inventories",
        icon: <AuditOutlined/>,
        label: "Lịch sử tồn kho",
    },
    {
        key: "/admin/reviews",
        icon: <CommentOutlined/>,
        label: "Phản hồi khách hàng",
    },
    {
        key: "/admin/notifications",
        icon: <AlertOutlined/>,
        label: "Thông báo",
    }
];

export default function AdminLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);

    const rawRole =
        localStorage.getItem("admin_role") || localStorage.getItem("role") || "";
    const roleString = rawRole.trim().toLowerCase();

    useEffect(() => {
        if (roleString === "customer" || !roleString) {
            localStorage.clear();
            navigate("/login");
        }
    }, [roleString, navigate]);

    useEffect(() => {
        if (roleString !== "admin" && roleString !== "staff") return;

        const socket = connectAdminSocket();
        if (!socket) return;

        const notifyOrder = (payload, type = "info") => {
            notification[type]({
                message: payload?.title || "Thong bao don hang",
                description: payload?.message,
                placement: "topRight",
                onClick: () => navigate(payload?.redirectUrl || "/admin"),
            });
        };

        const dispatchOrderChanged = (payload) => {
            window.dispatchEvent(
                new CustomEvent("admin:orders_changed", {detail: payload}),
            );
        };

        const handleOrderCreated = (payload) => {
            notifyOrder(payload, "info");
            dispatchOrderChanged(payload);
        };

        const handleOrderUpdated = (payload) => {
            dispatchOrderChanged(payload);
        };

        const handleOrderCanceled = (payload) => {
            notifyOrder(payload, "warning");
            dispatchOrderChanged(payload);
        };

        socket.on("admin:order_created", handleOrderCreated);
        socket.on("admin:order_updated", handleOrderUpdated);
        socket.on("admin:order_canceled", handleOrderCanceled);
        socket.on("connect_error", (err) => {
            console.warn("Admin socket connect error:", err.message);
        });

        return () => {
            socket.off("admin:order_created", handleOrderCreated);
            socket.off("admin:order_updated", handleOrderUpdated);
            socket.off("admin:order_canceled", handleOrderCanceled);
            socket.off("connect_error");
        };
    }, [roleString, navigate]);

    const isAdmin = roleString === "admin";
    const role = isAdmin ? "Admin" : "Staff";
    const username =
        localStorage.getItem("admin_username") ||
        localStorage.getItem("username") ||
        "Tài khoản";
    const menuItems = isAdmin ? ADMIN_MENU : STAFF_MENU;

    const handleLogout = async () => {
        try {
            await axios.post(
                `${API_BASE}/auth/logout`,
                {},
                {withCredentials: true},
            );
        } catch (err) {
            console.error("Lỗi đăng xuất:", err);
        } finally {
            disconnectAdminSocket();
            localStorage.clear();
            navigate("/login");
        }
    };

    const userMenu = {
        items: [
            {key: "adminprofile", icon: <UserOutlined/>, label: "Tài khoản"},
            {type: "divider"},
            {
                key: "logout",
                icon: <LogoutOutlined/>,
                label: "Đăng xuất",
                danger: true,
            },
        ],
        onClick: ({key}) => {
            if (key === "logout") handleLogout();
            if (key === "adminprofile") navigate("/admin/adminprofile");
        },
    };

    return (
        <Layout className={styles.adminWrapper}>
            <Sider
                trigger={null}
                collapsible
                collapsed={collapsed}
                width={240}
                collapsedWidth={88}
                className={styles.sider}
                breakpoint="lg"
                onBreakpoint={(broken) => setCollapsed(broken)}
            >
                <button
                    type="button"
                    className={`${styles.siderLogo} ${collapsed ? styles.siderLogoCollapsed : ""}`}
                    onClick={() => setCollapsed(!collapsed)}
                    aria-label={collapsed ? "Mở thanh quản trị" : "Thu gọn thanh quản trị"}
                    title={collapsed ? "Mở thanh quản trị" : "Thu gọn thanh quản trị"}
                >
                    <img
                        src="/logo.png"
                        alt="Ceramic Shop Logo"
                        className={styles.logoImg}
                    />

                    {!collapsed && (
                        <div className={styles.logoTextWrap}>
                            <span className={styles.logoText}>CERAMIC-SHOP</span>
                            <span className={styles.logoSub}>TINH HOA GỐM SỨ VIỆT</span>
                        </div>
                    )}
                </button>

                <div className={styles.menuScroll}>
                    <Menu
                        theme="dark"
                        mode="inline"
                        selectedKeys={[location.pathname]}
                        items={menuItems}
                        onClick={({key}) => navigate(key)}
                        className={styles.siderMenu}
                    />
                </div>
            </Sider>

            <Layout>
                <Header className={styles.header}>
                    <div className={styles.headerRight}>
                        <Dropdown menu={userMenu} placement="bottomRight" arrow>
                            <div className={styles.userInfo}>
                                <Avatar className={styles.avatar}>
                                    {username?.[0]?.toUpperCase()}
                                </Avatar>
                                <div className={styles.userMeta}>
                                    <span className={styles.userName}>{username}</span>
                                    <span className={styles.userRole}>{role}</span>
                                </div>
                            </div>
                        </Dropdown>
                    </div>
                </Header>
                <Content className={styles.content}>
                    <Outlet/>
                </Content>
            </Layout>
        </Layout>
    );
}
