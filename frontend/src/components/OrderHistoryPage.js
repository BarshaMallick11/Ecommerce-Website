// frontend/src/components/OrderHistoryPage.js
import React, { useState, useEffect } from 'react';
import BackButton from './BackButton';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { List, Typography, Spin, Card } from 'antd';

const { Title, Text } = Typography;

const OrderHistoryPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { token } = useAuth();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/orders', {
                    headers: { 'x-auth-token': token }
                });
                setOrders(res.data);
            } catch (error) {
                console.error('Failed to fetch orders', error);
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchOrders();
        }
    }, [token]);

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>;
    }

    return (
        <div>
            <BackButton />
            <Title level={2}>My Orders</Title>
            <List
                grid={{ gutter: 16, column: 1 }}
                dataSource={orders}
                renderItem={order => (
                    <List.Item>
                        <Card title={`Order Date: ${new Date(order.createdAt).toLocaleDateString()}`}>
                            <p><Text strong>Order ID:</Text> {order._id}</p>
                            <p><Text strong>Total Amount:</Text> ₹{order.totalAmount.toFixed(2)}</p>
                            <p><Text strong>Payment ID:</Text> {order.paymentId}</p>
                            <Title level={5}>Products:</Title>
                            {order.products.map(item => (
                                <div key={item.product._id}>
                                    {item.product.name} - {item.quantity} x ₹{item.product.price.toFixed(2)}
                                </div>
                            ))}
                        </Card>
                    </List.Item>
                )}
            />
        </div>
    );
};

export default OrderHistoryPage;