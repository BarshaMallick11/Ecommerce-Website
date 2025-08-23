// frontend/src/App.js

import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import './App.css';
import { Layout, Typography, Button, Space, Dropdown, Menu, Drawer, ConfigProvider } from 'antd';
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
import AdminOrderList from './components/AdminOrderList';
import AdminUserList from './components/AdminUserList';
import SearchBox from './components/SearchBox';
import TrackOrderPage from './components/TrackOrderPage';
import HelpPage from './components/HelpPage';
import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import AdminQueryList from './components/AdminQueryList';
import AdminSettings from './components/AdminSettings';

const { Header, Content, Footer } = Layout;
const { Title } = Typography;

const AppHeader = () => {
    const { user, logout } = useAuth();
    const [drawerVisible, setDrawerVisible] = useState(false);

    const showDrawer = () => setDrawerVisible(true);
    const closeDrawer = () => setDrawerVisible(false);

    const menuItems = [
        { key: '1', label: <Link to="/">Home</Link> },
        { key: '2', label: <Link to="/profile">My Profile</Link> },
        { key: '3', label: <Link to="/orders">Order History</Link> },
        { key: '4', label: <Link to="/track-order">Track Order</Link> },
        ...(user && user.isAdmin ? [{ key: '5', label: <Link to="/admin">Admin Panel</Link> }] : []),
        { key: '6', label: <Link to="/help">Help & Contact</Link> },
        { key: '7', label: <div onClick={logout}>Logout</div> },
    ];

    return (
        <Header style={{ backgroundColor: '#4f772d', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 24px' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
                <img src="/ecommerce_logo1.png" alt="Premium.com" style={{ height: '40px', marginRight: '15px', borderRadius: '50%', border: '0.5px solid white', backgroundColor: 'white' }} />
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
                        <Dropdown menu={{ items: menuItems }} placement="bottomRight">
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
                <Button type="primary" onClick={showDrawer} icon={<MenuOutlined />} />
            </div>

            <Drawer title="Menu" placement="right" onClose={closeDrawer} open={drawerVisible}>
                <div style={{ marginBottom: '20px' }}>
                    <SearchBox />
                </div>
                <Menu mode="inline" items={menuItems} onClick={closeDrawer} />
            </Drawer>
        </Header>
    );
};

// In frontend/src/App.js

// ... (keep all your imports and the entire AppHeader component as they are)

// In frontend/src/App.js

function App() {
    const theme = {
      token: {
        colorPrimary: '#446950', // Your custom dark green
      },
    };
  
    return (
      <ConfigProvider theme={theme}>
        <AuthProvider>
          <CartProvider>
            <Router>
              <Layout className="layout" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                <AppHeader />
                {/* THIS IS THE FIX: Added a background style to the Content component */}
                <Content className="site-content" style={{ padding: '0 50px', background: '#f4f1de', flex: 1}}>
                  <div 
                    className="site-layout-content" 
                    style={{ 
                    //   background: '#f1f5e6', // Your custom yellowish-green
                      padding: 0, 
                      minHeight: 280, 
                      marginTop: 24,
                      marginBottom: 48
                    }}
                  >
                    <Routes>
                      {/* ... all your routes ... */}
                      <Route path="/" element={<ProductList />} />
                      <Route path="/search/:keyword" element={<ProductList />} />
                      <Route path="/product/:id" element={<ProductPage />} />
                      <Route path="/cart" element={<CartPage />} />
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/register" element={<RegisterPage />} />
                      <Route path="/checkout" element={<CheckoutPage />} />
                      <Route path="/orders" element={<OrderHistoryPage />} />
                      <Route path="/profile" element={<ProfilePage />} />
                      <Route path="/shipping" element={<ShippingPage />} />
                      <Route path="/track-order" element={<TrackOrderPage />} />
                      <Route path="/help" element={<HelpPage />} />
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
                  Premium.Store ©2025 | All Rights Reserved.
                </Footer>
              </Layout>
            </Router>
          </CartProvider>
        </AuthProvider>
      </ConfigProvider>
    );
  }
  
  export default App;