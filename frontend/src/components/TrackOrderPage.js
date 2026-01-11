// frontend/src/components/TrackOrderPage.js
import React, { useState, useEffect, useCallback } from 'react';
import BackButton from './BackButton';
import { Card, Typography, Steps, Tag, Alert, Spin, Empty, Divider, Row, Col } from 'antd';
import {
    ClockCircleOutlined,
    RocketOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    WarningOutlined
} from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';
import { useAuth } from '../context/AuthContext';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

const TrackOrderPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { token, user } = useAuth();

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
            // Filter out cancelled orders from track page
            const activeOrders = data.filter(order => order.status !== 'Cancelled');
            setOrders(activeOrders);
        } catch (error) {
            console.error('Failed to fetch orders', error);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const getStepStatus = (orderStatus) => {
        if (orderStatus === 'Processing') return 0;
        if (orderStatus === 'Shipped') return 1;
        if (orderStatus === 'Delivered') return 2;
        return 0;
    };

    const getStatusTag = (status) => {
        const statusConfig = {
            Processing: { color: 'blue', icon: <ClockCircleOutlined /> },
            Shipped: { color: 'orange', icon: <RocketOutlined /> },
            Delivered: { color: 'green', icon: <CheckCircleOutlined /> },
            Cancelled: { color: 'red', icon: <CloseCircleOutlined /> }
        };
        const config = statusConfig[status] || statusConfig.Processing;
        return <Tag color={config.color} icon={config.icon}>{status}</Tag>;
    };

    const getPaymentMethodTag = (method) => {
        const colors = {
            Razorpay: 'purple',
            COD: 'gold',
            UPI: 'cyan'
        };
        return <Tag color={colors[method] || 'default'}>{method}</Tag>;
    };

    if (!user) {
        return (
            <div style={{ maxWidth: '800px', margin: 'auto' }}>
                <BackButton />
                <Alert
                    message="Login Required"
                    description="Please login to track your orders."
                    type="warning"
                    showIcon
                />
            </div>
        );
    }

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" />
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div style={{ maxWidth: '800px', margin: 'auto' }}>
                <BackButton />
                <Title level={2}>Track Your Orders</Title>
                <Empty
                    description="No active orders to track"
                    style={{ marginTop: 50 }}
                />
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '900px', margin: 'auto' }}>
            <BackButton />
            <Title level={2}>Track Your Orders</Title>
            <Paragraph type="secondary">
                View the status and delivery information for all your orders
            </Paragraph>

            {orders.map((order, index) => (
                <Card
                    key={order._id}
                    style={{ marginBottom: 24 }}
                    title={
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                            <div>
                                <Text strong>Order #{index + 1}</Text>
                                <br />
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                    Placed on {moment(order.createdAt).format('MMM DD, YYYY')}
                                </Text>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                {getStatusTag(order.status)}
                                {getPaymentMethodTag(order.paymentMethod)}
                            </div>
                        </div>
                    }
                >
                    {/* UPI Payment Status */}
                    {order.paymentMethod === 'UPI' && order.upiPaymentStatus && order.upiPaymentStatus !== 'approved' && (
                        <Alert
                            message={
                                order.upiPaymentStatus === 'pending'
                                    ? 'Payment Verification Pending'
                                    : 'Payment Proof Required'
                            }
                            description={
                                order.upiPaymentStatus === 'pending'
                                    ? 'Your payment is being verified. Order will be shipped once approved.'
                                    : 'Please submit payment proof to proceed with this order.'
                            }
                            type="warning"
                            showIcon
                            icon={<WarningOutlined />}
                            style={{ marginBottom: 20 }}
                        />
                    )}

                    {/* Order Timeline */}
                    <Steps current={getStepStatus(order.status)} style={{ marginBottom: 24 }}>
                        <Step
                            title="Order Placed"
                            description={moment(order.createdAt).format('MMM DD, hh:mm A')}
                        />
                        <Step
                            title="Shipped"
                            description={
                                order.shippedAt
                                    ? moment(order.shippedAt).format('MMM DD, hh:mm A')
                                    : order.status === 'Processing' ? 'Preparing shipment' : 'Pending'
                            }
                        />
                        <Step
                            title="Delivered"
                            description={
                                order.deliveredAt
                                    ? moment(order.deliveredAt).format('MMM DD, hh:mm A')
                                    : order.status === 'Shipped' ? 'In transit' : 'Pending'
                            }
                        />
                    </Steps>

                    <Divider />

                    {/* Order Details */}
                    <Row gutter={[16, 16]}>
                        <Col xs={24} md={12}>
                            <Text strong>Order ID:</Text>
                            <br />
                            <Text copyable style={{ fontSize: 12, fontFamily: 'monospace' }}>
                                {order._id}
                            </Text>
                        </Col>
                        <Col xs={24} md={12}>
                            <Text strong>Total Amount:</Text>
                            <br />
                            <Text style={{ fontSize: 18, color: '#52c41a' }}>
                                ₹{order.totalAmount.toFixed(2)}
                            </Text>
                        </Col>
                    </Row>

                    <Divider />

                    {/* Delivery Information */}
                    <Row gutter={[16, 16]}>
                        {order.estimatedDeliveryDate && (
                            <Col xs={24} md={12}>
                                <Text strong>Estimated Delivery:</Text>
                                <br />
                                <Text style={{ color: '#1890ff', fontSize: 16 }}>
                                    {moment(order.estimatedDeliveryDate).format('MMM DD, YYYY')}
                                </Text>
                                <br />
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                    ({moment(order.estimatedDeliveryDate).fromNow()})
                                </Text>
                            </Col>
                        )}

                        {order.trackingNumber && (
                            <Col xs={24} md={12}>
                                <Text strong>Tracking Number:</Text>
                                <br />
                                <Text code copyable style={{ fontSize: 14 }}>
                                    {order.trackingNumber}
                                </Text>
                            </Col>
                        )}
                    </Row>

                    {order.status === 'Delivered' && order.deliveredAt && (
                        <>
                            <Divider />
                            <Alert
                                message="Order Delivered Successfully!"
                                description={`Your order was delivered on ${moment(order.deliveredAt).format('MMMM DD, YYYY at hh:mm A')}`}
                                type="success"
                                showIcon
                            />
                        </>
                    )}

                    {/* Shipping Address */}
                    <Divider />
                    <div>
                        <Text strong>Shipping Address:</Text>
                        <Paragraph style={{ marginTop: 8, marginBottom: 0 }}>
                            {order.shippingAddress.address}<br />
                            {order.shippingAddress.city}, {order.shippingAddress.postalCode}<br />
                            {order.shippingAddress.country}<br />
                            Phone: {order.shippingAddress.phoneNo}
                        </Paragraph>
                    </div>

                    {/* Products */}
                    <Divider />
                    <div>
                        <Text strong>Products ({order.products.length}):</Text>
                        <div style={{ marginTop: 12 }}>
                            {order.products.map((item, idx) => (
                                <div
                                    key={idx}
                                    style={{
                                        padding: '8px 0',
                                        borderBottom: idx < order.products.length - 1 ? '1px solid #f0f0f0' : 'none'
                                    }}
                                >
                                    <Row justify="space-between">
                                        <Col>
                                            <Text>{item.product.name}</Text>
                                            <br />
                                            <Text type="secondary" style={{ fontSize: 12 }}>
                                                Quantity: {item.quantity}
                                            </Text>
                                        </Col>
                                        <Col>
                                            <Text strong>₹{(item.product.price * item.quantity).toFixed(2)}</Text>
                                        </Col>
                                    </Row>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
};

export default TrackOrderPage;