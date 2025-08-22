// frontend/src/App.js

import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import './App.css';
import { Layout, Typography, Button, Space, Drawer, Divider, Dropdown, Menu } from 'antd';
import { MenuOutlined, DownOutlined } from '@ant-design/icons';
import ProductList from "./components/ProductList";
import ProductPage from "./components/ProductPage";
import CartPage from "./components/CartPage";
import CartIcon from "./components/CartIcon";
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import CheckoutPage from './components/CheckoutPage';
import OrderHistoryPage from './components/OrderHistoryPage';
import AdminDashboard from './components/AdminDashboard';
import AdminRoute from './components/AdminRoute';
import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';

const { Header, Content, Footer } = Layout;
const { Title } = Typography;

const AppHeader = () => {
    const { user, logout } = useAuth();
    const [drawerVisible, setDrawerVisible] = useState(false);

    const showDrawer = () => setDrawerVisible(true);
    const closeDrawer = () => setDrawerVisible(false);

    // --- Dropdown menu items for desktop ---
    const menuItems = [
        user?.isAdmin && {
            key: 'admin',
            label: (<Link to="/admin">Admin Panel</Link>),
        },
        {
            key: 'orders',
            label: (<Link to="/orders">Order History</Link>),
        },
        {
            key: 'logout',
            label: (<div onClick={logout}>Logout</div>),
        }
    ].filter(Boolean); // Removes any false items (like admin link if not admin)

    // --- Navigation links for the mobile drawer ---
    const MobileNavLinks = () => (
        <Space direction={'vertical'} align={'start'} size="middle">
            {user && user.isAdmin && (
                <Link to="/admin" onClick={closeDrawer}><Button>Admin Panel</Button></Link>
            )}
            {user ? (
                <>
                    <span style={{ color: 'black', fontWeight: 'bold' }}>Welcome, {user.username}</span>
                    <Link to="/orders" onClick={closeDrawer}><Button type="primary">Order History</Button></Link>
                    <Button type="primary" onClick={() => { logout(); closeDrawer(); }}>Logout</Button>
                </>
            ) : (
                <Link to="/login" onClick={closeDrawer}><Button type="primary">Login</Button></Link>
            )}
        </Space>
    );

    return (
        <Header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 24px' }}>
            <Link to="/">
                <Title level={3} style={{ color: 'white', lineHeight: '64px', margin: 0 }}>
                    ShopCart
                </Title>
            </Link>

            {/* --- Desktop Navigation --- */}
            <div className="desktop-nav-links">
                <Space align="center" size="large">
                    {user ? (
                        <Dropdown menu={{ items: menuItems }} placement="bottomRight">
                            <Button ghost>
                                Welcome, {user.username} <DownOutlined />
                            </Button>
                        </Dropdown>
                    ) : (
                        <Link to="/login"><Button type="primary">Login</Button></Link>
                    )}
                    <CartIcon />
                </Space>
            </div>

            {/* --- Mobile Navigation --- */}
            <div className="mobile-nav-icon">
                <Button type="primary" onClick={showDrawer}>
                    <MenuOutlined />
                </Button>
            </div>

            <Drawer title="Menu" placement="right" onClose={closeDrawer} open={drawerVisible}>
                <Link to="/cart" onClick={closeDrawer} style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit', marginBottom: '20px' }}>
                    <CartIcon />
                    <span style={{ marginLeft: 16, fontSize: 16 }}>View Cart</span>
                </Link>
                <Divider />
                <MobileNavLinks />
            </Drawer>
        </Header>
    );
};

function App() {
  return (
    <AuthProvider>
        <CartProvider>
          <Router>
            <Layout className="layout">
              <AppHeader />
              <Content style={{ padding: '0 24px' }}>
                <div className="site-layout-content" style={{ background: '#fff', padding: 24, minHeight: 280, marginTop: 24 }}>
                  <Routes>
                    <Route path="/" element={<ProductList />} />
                    <Route path="/product/:id" element={<ProductPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/orders" element={<OrderHistoryPage />} />
                    <Route path="/admin" element={<AdminRoute />}>
                        <Route path="" element={<AdminDashboard />} />
                    </Route>
                  </Routes>
                </div>
              </Content>
              <Footer style={{ textAlign: 'center' }}>
                ShopCart ©2025 All rights reserved
              </Footer>
            </Layout>
          </Router>
        </CartProvider>
    </AuthProvider>
  );
}

export default App;