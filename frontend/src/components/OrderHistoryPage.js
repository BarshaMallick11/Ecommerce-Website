// frontend/src/components/OrderHistoryPage.js
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { List, Typography, Spin, Card, Alert } from 'antd';
import moment from 'moment';
import BackButton from './BackButton';

const { Title, Text } = Typography;

const OrderHistoryPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { token } = useAuth();

    const fetchOrders = useCallback(async () => {
        if (!token) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };
            const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/orders`, config);
            setOrders(data);
        } catch (error) {
            console.error('Failed to fetch orders', error);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>;
    }

    return (
        <div>
            <BackButton />
            <Title level={2}>My Orders</Title>
            <List
                grid={{ gutter: 16, xs: 1, sm: 1, md: 2 }}
                dataSource={orders}
                renderItem={order => (
                    <List.Item>
                        <Card title={`Order Date: ${moment(order.createdAt).format('YYYY-MM-DD')}`}>
                            {order.status === 'Cancelled' ? (
                                <Alert
                                    message="Order Cancelled"
                                    description={`This order was cancelled on ${moment(order.cancelledAt).format('YYYY-MM-DD')}.`}
                                    type="error"
                                    showIcon
                                />
                            ) : (
                                <>
                                    {/* UPI Payment Status Alert */}
                                    {order.paymentMethod === 'UPI' && order.upiPaymentStatus && (
                                        <Alert
                                            message={
                                                order.upiPaymentStatus === 'pending' ? 'Payment Verification Pending' :
                                                    order.upiPaymentStatus === 'approved' ? 'Payment Verified ✓' :
                                                        order.upiPaymentStatus === 'rejected' ? 'Payment Rejected' :
                                                            'Payment Proof Not Submitted'
                                            }
                                            description={
                                                order.upiPaymentStatus === 'pending' ? 'Your payment proof is under review by admin. This usually takes 1-24 hours.' :
                                                    order.upiPaymentStatus === 'approved' ? 'Your payment has been verified. Order will be shipped soon!' :
                                                        order.upiPaymentStatus === 'rejected' ? `Payment verification failed. ${order.upiPaymentNote || 'Please contact support.'}` :
                                                            'Please submit your payment proof to activate this order.'
                                            }
                                            type={
                                                order.upiPaymentStatus === 'pending' ? 'warning' :
                                                    order.upiPaymentStatus === 'approved' ? 'success' :
                                                        order.upiPaymentStatus === 'rejected' ? 'error' :
                                                            'info'
                                            }
                                            showIcon
                                            style={{ marginBottom: 16 }}
                                        />
                                    )}

                                    <p><Text strong>Order ID:</Text> {order._id}</p>
                                    <p><Text strong>Total Amount:</Text> ₹{order.totalAmount.toFixed(2)}</p>
                                    <p><Text strong>Payment Method:</Text> {order.paymentMethod}</p>
                                    <p><Text strong>Status:</Text> {order.status}</p>
                                    {order.shippedAt && <p><Text strong>Shipped On:</Text> {moment(order.shippedAt).format('YYYY-MM-DD')}</p>}
                                    {order.deliveredAt && <p><Text strong>Delivered On:</Text> {moment(order.deliveredAt).format('YYYY-MM-DD')}</p>}
                                    {order.estimatedDeliveryDate && <p><Text strong>Estimated Delivery:</Text> {moment(order.estimatedDeliveryDate).format('YYYY-MM-DD')}</p>}
                                    {order.trackingNumber && <p><Text strong>Tracking #:</Text> {order.trackingNumber}</p>}
                                    <Title level={5} style={{ marginTop: 16 }}>Products:</Title>
                                    {order.products.map(item => (
                                        <div key={item.product._id}>
                                            {item.product.name} - {item.quantity} x ₹{item.product.price.toFixed(2)}
                                        </div>
                                    ))}
                                </>
                            )}
                        </Card>
                    </List.Item>
                )}
            />
        </div>
    );
};

export default OrderHistoryPage;
