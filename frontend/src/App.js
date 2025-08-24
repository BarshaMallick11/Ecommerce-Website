// frontend/src/App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import './App.css';
// Make sure you have a responsive.css file if you are using these classNames
// import './responsive.css'; 
import { Layout, Typography, Button, Space, Dropdown, Menu, Drawer, ConfigProvider, Divider } from 'antd';
import { DownOutlined, MenuOutlined } from '@ant-design/icons';
import ProductList from "./components/ProductList";
import ProductPage from "./components/ProductPage";
import CartPage from "./components/CartPage";
import CartIcon from "./components/CartIcon";
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import CheckoutPage from './components/CheckoutPage';
import OrderHistoryPage from './components/OrderHistoryPage';
import ProfilePage from './components/ProfilePage';
import ShippingPage from './components/ShippingPage';
import AdminDashboard from './components/AdminDashboard';
import AdminRoute from './components/AdminRoute';
import PrivateRoute from './components/PrivateRoute'; // Import PrivateRoute
import AdminOrderList from './components/AdminOrderList';
import AdminUserList from './components/AdminUserList';
import SearchBox from './components/SearchBox';
import TrackOrderPage from './components/TrackOrderPage';
import HelpPage from './components/HelpPage';
import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import AdminQueryList from './components/AdminQueryList';
import AdminSettings from './components/AdminSettings';
import ForgotPasswordPage from './components/ForgotPasswordPage';
import ResetPasswordPage from './components/ResetPasswordPage';
const { Header, Content, Footer } = Layout;
const { Title } = Typography;

const AppHeader = () => {
    const { user, logout } = useAuth();
    const [drawerVisible, setDrawerVisible] = useState(false);

    const showDrawer = () => setDrawerVisible(true);
    const closeDrawer = () => setDrawerVisible(false);

    const desktopMenuItems = [
        { key: '1', label: <Link to="/profile">My Profile</Link> },
        { key: '2', label: <Link to="/orders">Order History</Link> },
        { key: '3', label: <Link to="/track-order">Track Order</Link> },
        { key: '4', label: <Link to="/help">Help & Contact</Link> },
        ...(user && user.isAdmin ? [{ key: '5', label: <Link to="/admin">Admin Panel</Link> }] : []),
        { key: '6', label: <div onClick={logout}>Logout</div> },
    ];

    // This component is created to ensure it re-renders correctly on state change
    const MobileNavMenu = () => {
        if (user) {
            return (
                <Menu mode="inline" onClick={closeDrawer}>
                    <Menu.Item key="welcome" style={{ color: '#4f772d', fontWeight: 'bold' }}>Welcome, {user.username}</Menu.Item>
                    <Menu.Divider />
                    <Menu.Item key="profile"><Link to="/">Home</Link></Menu.Item>
                    <Menu.Item key="profile"><Link to="/profile">My Profile</Link></Menu.Item>
                    <Menu.Item key="orders"><Link to="/orders">Order History</Link></Menu.Item>
                    <Menu.Item key="track"><Link to="/track-order">Track Order</Link></Menu.Item>
                    {user.isAdmin && <Menu.Item key="admin"><Link to="/admin">Admin Panel</Link></Menu.Item>}
                    <Menu.Item key="help"><Link to="/help">Help & Contact</Link></Menu.Item>
                    <Menu.Item key="logout" onClick={logout}>Logout</Menu.Item>
                </Menu>
            );
        } else {
            return (
                <Menu mode="inline" onClick={closeDrawer}>
                    <Menu.Item key="login"><Link to="/login">Login</Link></Menu.Item>
                    <Menu.Item key="help"><Link to="/help">Help & Contact</Link></Menu.Item>
                </Menu>
            );
        }
    };

    return (
        <Header style={{ backgroundColor: '#4f772d', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 24px' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
                <img src="/ecommerce_logo1.png" alt="Premium.Store" style={{ height: '40px', marginRight: '15px', borderRadius: '50%', border: '0.5px solid white', backgroundColor: 'white' }}  />
                <Title level={3} style={{ color: 'white', lineHeight: '64px', margin: 0, whiteSpace: 'nowrap' }}>
                    Premium.Store
                </Title>
            </Link>

            <div className="header-search">
                <SearchBox />
            </div>

            <div className="header-right-side">
                <Space>
                    {user ? (
                        <Dropdown menu={{ items: desktopMenuItems }} placement="bottomRight">
                            <Button type="primary">
                                Welcome, {user.username} <DownOutlined />
                            </Button>
                        </Dropdown>
                    ) : (
                        <Link to="/login">
                            <Button type="primary">Login</Button>
                        </Link>
                    )}
                    <CartIcon />
                </Space>
            </div>
            
            <div className="mobile-menu-icon">
              <Space size="middle" align='center'>
                <CartIcon />
                <Button type="primary" onClick={showDrawer} icon={<MenuOutlined />} />
              </Space>
            </div>

            <Drawer title="Menu" placement="right" onClose={closeDrawer} open={drawerVisible} width={300}>
                <div style={{ marginBottom: '20px' }}>
                    <SearchBox onSearchCallback={closeDrawer}/>
                </div>
                <Divider />
                <MobileNavMenu />
            </Drawer>
        </Header>
    );
};

function App() {
    const theme = {
      token: {
        colorPrimary: '#446950',
      },
    };
  
    return (
      <ConfigProvider theme={theme}>
        <AuthProvider>
          <CartProvider>
            <Router>
              <Layout className="layout" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                <AppHeader />
                <Content className="site-content" style={{ padding: '0 50px', background: '#f4f1de', flex: 1}}>
                  <div 
                    className="site-layout-content" 
                    style={{ 
                      padding: 0, 
                      minHeight: 280, 
                      marginTop: 24,
                      marginBottom: 48
                    }}
                  >
                    <Routes>
                      {/* Public Routes */}
                      <Route path="/" element={<ProductList />} />
                      <Route path="/search/:keyword" element={<ProductList />} />
                      <Route path="/product/:id" element={<ProductPage />} />
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/register" element={<RegisterPage />} />
                      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
                      <Route path="/track-order" element={<TrackOrderPage />} />
                      <Route path="/help" element={<HelpPage />} />
                      <Route path="/cart" element={<CartPage />} />

                      {/* Private User Routes */}
                      <Route path="" element={<PrivateRoute />}>
                          <Route path="/profile" element={<ProfilePage />} />
                          <Route path="/orders" element={<OrderHistoryPage />} />
                          <Route path="/shipping" element={<ShippingPage />} />
                          <Route path="/checkout" element={<CheckoutPage />} />
                      </Route>
                      
                      {/* Private Admin Routes */}
                      <Route path="/admin" element={<AdminRoute />}>
                          <Route path="" element={<AdminDashboard />} />
                          <Route path="orders" element={<AdminOrderList />} />
                          <Route path="users" element={<AdminUserList />} />
                          <Route path="queries" element={<AdminQueryList />} />
                          <Route path="settings" element={<AdminSettings />} />
                      </Route>
                    </Routes>
                  </div>
                </Content>
                <Footer style={{ textAlign: 'center', backgroundColor: '#4f772d', color: 'white' }}>
                  Premium.Store©2025 | All Rights Reserved.
                </Footer>
              </Layout>
            </Router>
          </CartProvider>
        </AuthProvider>
      </ConfigProvider>
    );
  }
  
  export default App;
