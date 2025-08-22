// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import './App.css';
import { Layout, Typography, Button, Space } from 'antd';
import ProductList from "./components/ProductList";
import ProductPage from "./components/ProductPage";
import CartPage from "./components/CartPage";
import CartIcon from "./components/CartIcon";
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import CheckoutPage from './components/CheckoutPage';
import OrderHistoryPage from './components/OrderHistoryPage';
import AdminDashboard from './components/AdminDashboard';
import AdminRoute from './components/AdminRoute';




const { Header, Content, Footer } = Layout;
const { Title } = Typography;

// A new component to handle the header logic
const AppHeader = () => {
    const { user, logout } = useAuth();
    /*const menu = (
        <Menu>
            <Menu.Item key="1">
                <Link to="/orders">Order History</Link>
            </Menu.Item>
            <Menu.Item key="2" onClick={logout}>
                Logout
            </Menu.Item>
        </Menu>
    );*/
    return (
        <Header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link to="/">
                <Title level={3} style={{ color: 'white', lineHeight: '64px', margin: 0 }}>
                    My E-Commerce Site
                </Title>
            </Link>
            <Space>
                {user && user.isAdmin && (
                    <Link to="/admin">
                        <Button>Admin Panel</Button>
                    </Link>
                )}
                {user ? (
                    <>
                        <span style={{ color: 'white' }}>Welcome, {user.username}</span>
                        <Link to="/orders">
                            <Button type="primary">Order History</Button>
                        </Link>

                        <Button type="primary" onClick={logout}>Logout</Button>
                    </>
                ) : (
                    <Link to="/login">
                        <Button type="primary">Login</Button>
                    </Link>
                )}
                <CartIcon />
            </Space>
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
              <Content style={{ padding: '0 50px' }}>
                <div className="site-layout-content" style={{ background: '#fff', padding: 24, minHeight: 280 }}>
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
                My E-Commerce Site ©2025 Created with Ant Design
              </Footer>
            </Layout>
          </Router>
        </CartProvider>
    </AuthProvider>
  );
}

export default App;