import { useState } from 'react';
import { useEffect } from 'react';
import { Layout, Menu, Avatar, Dropdown, Button, Badge } from 'antd';
import {
  DashboardOutlined, ShoppingOutlined, TeamOutlined, UserOutlined,
  LogoutOutlined, MenuFoldOutlined, MenuUnfoldOutlined, BellOutlined,
  ShopOutlined, TagsOutlined, FileTextOutlined, SettingOutlined, BarChartOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import axios from 'axios';
import styles from './AdminLayout.module.css';
const { Header, Sider, Content } = Layout;
const API_BASE = 'https://ceramic-shop-u8ak.onrender.com/api/v1';

const STAFF_MENU = [
  { key: '/admin', icon: <DashboardOutlined />, label: 'Tổng quan' },
  { key: '/admin/orders', icon: <FileTextOutlined />, label: 'Đơn hàng' },
  { key: '/admin/products', icon: <ShoppingOutlined />, label: 'Sản phẩm' },
  { key: '/admin/customers', icon: <TeamOutlined />, label: 'Khách hàng' },
];

const ADMIN_MENU = [
  { key: '/admin', icon: <DashboardOutlined />, label: 'Tổng quan' },
  { key: '/admin/orders', icon: <FileTextOutlined />, label: 'Đơn hàng' },
  { key: '/admin/products', icon: <ShoppingOutlined />, label: 'Sản phẩm' },
  { key: '/admin/customers', icon: <TeamOutlined />, label: 'Khách hàng' },
  { key: '/admin/staffs', icon: <UserOutlined />, label: 'Nhân viên' },
  { key: '/admin/promotions', icon: <TagsOutlined />, label: 'Khuyến mãi' },
  { key: '/admin/reports', icon: <BarChartOutlined />, label: 'Báo cáo' },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const rawRole = localStorage.getItem('role') || '';
  const roleString = rawRole.trim().toLowerCase();

  useEffect(() => {
    if (roleString === 'customer' || !roleString) {
      localStorage.clear();
      navigate('/login');
    }
  }, [roleString, navigate]);

  const isAdmin = roleString === 'admin';
  const role = isAdmin ? 'Admin' : 'Staff';
  const username = localStorage.getItem('username') || 'Tài khoản';
  const menuItems = isAdmin ? ADMIN_MENU : STAFF_MENU;
  const handleLogout = async () => {
    try {
      await axios.post(`${API_BASE}/auth/logout`, {}, { withCredentials: true });
    } catch (err) {
      console.error('Lỗi đăng xuất:', err);
    } finally {
      localStorage.clear();
      navigate('/login');
    }
  };

  const userMenu = {
    items: [
      { key: 'profile', icon: <UserOutlined />, label: 'Sửa hồ sơ' },
      { type: 'divider' },
      { key: 'logout', icon: <LogoutOutlined />, label: 'Đăng xuất', danger: true },
    ],
    onClick: ({ key }) => {
      if (key === 'logout') handleLogout();
      if (key === 'profile') navigate('/profile');
    },
  };

  return (
    <Layout className={styles.adminWrapper}>
      <Sider
        trigger={null} collapsible collapsed={collapsed}
        width={240} className={styles.sider} breakpoint="lg"
        onBreakpoint={(broken) => setCollapsed(broken)}
      >
        <div className={styles.siderLogo} onClick={() => navigate('/')}>
          <ShopOutlined className={styles.logoIcon} />
          {!collapsed && <span className={styles.logoText}>CERAMIC</span>}
        </div>

        {!collapsed && (
          <div className={styles.roleTag}>
            <span className={role === 'Admin' ? styles.roleAdmin : styles.roleStaff}>
              {role === 'Admin' ? '👑 Admin' : '🛠 Staff'}
            </span>
          </div>
        )}

        <Menu
          theme="dark" mode="inline"
          selectedKeys={[location.pathname]} items={menuItems}
          onClick={({ key }) => navigate(key)} className={styles.siderMenu}
        />

        <div className={styles.siderFooter}>
          {!collapsed && (
            <div className={styles.siderUser}>
              <Avatar size={32} className={styles.avatarSmall}>
                {username?.[0]?.toUpperCase()}
              </Avatar>
              <span className={styles.siderUsername}>{username}</span>
            </div>
          )}
        </div>
      </Sider>

      <Layout>
        <Header className={styles.header}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className={styles.collapseBtn}
          />
          <div className={styles.headerRight}>
            <Dropdown menu={userMenu} placement="bottomRight" arrow>
              <div className={styles.userInfo}>
                <Avatar className={styles.avatar}>{username?.[0]?.toUpperCase()}</Avatar>
                <div className={styles.userMeta}>
                  <span className={styles.userName}>{username}</span>
                  <span className={styles.userRole}>{role}</span>
                </div>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content className={styles.content}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}