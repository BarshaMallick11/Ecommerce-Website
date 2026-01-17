// frontend/src/components/CartPage.js
import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import BackButton from './BackButton';
import { List, Button, Typography, Row, Col, Empty, Space, Avatar, Tooltip, Tag, Card, Divider, message } from 'antd';
import { DeleteOutlined, PlusOutlined, MinusOutlined, EditOutlined, CarOutlined, GiftOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import axios from 'axios';

const { Title, Text } = Typography;

const CartPage = () => {
    const { cartItems, removeFromCart, addToCart, decreaseQuantity } = useCart();
    const { user } = useAuth();
    const [deliverySettings, setDeliverySettings] = useState({
        deliveryCharge: 40,
        freeDeliveryThreshold: 399,
        deliveryChargeEnabled: true
    });

    // Fetch delivery settings
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/settings`);
                setDeliverySettings({
                    deliveryCharge: data.deliveryCharge || 40,
                    freeDeliveryThreshold: data.freeDeliveryThreshold || 399,
                    deliveryChargeEnabled: data.deliveryChargeEnabled !== false
                });
            } catch (error) {
                console.error('Failed to fetch settings');
            }
        };
        fetchSettings();
    }, []);

    // Calculate subtotal using discounted price
    const subtotal = cartItems.reduce((sum, item) => {
        const discount = item.discount || 0;
        const discountedPrice = item.price * (1 - discount / 100);
        return sum + discountedPrice * item.quantity;
    }, 0);

    // Calculate delivery charge
    const isFreeDelivery = subtotal >= deliverySettings.freeDeliveryThreshold;
    const deliveryCharge = (!deliverySettings.deliveryChargeEnabled || isFreeDelivery) ? 0 : deliverySettings.deliveryCharge;
    const amountForFreeDelivery = deliverySettings.freeDeliveryThreshold - subtotal;

    // Final total
    const total = subtotal + deliveryCharge;

    if (cartItems.length === 0) {
        return (
            <div>
                <BackButton />
                <Empty description="Your cart is empty." />
            </div>
        );
    }

    return (
        <div>
            <div>
                <BackButton />
            </div>
            <Title level={2}>Shopping Cart</Title>
            <List
                itemLayout="vertical"
                dataSource={cartItems}
                renderItem={item => {
                    const discount = item.discount || 0;
                    const discountedPrice = item.price * (1 - discount / 100);
                    const itemTotal = discountedPrice * item.quantity;
                    const originalTotal = item.price * item.quantity;

                    // Stock validation
                    const availableStock = item.stock || 0;
                    const canAddMore = item.quantity < availableStock;

                    const handleAddToCart = () => {
                        if (canAddMore) {
                            addToCart(item);
                        } else {
                            message.warning(`Limited stock! Only ${availableStock} units available.`);
                        }
                    };

                    return (
                        <List.Item
                            className="cart-item-responsive"
                            actions={[
                                user?.isAdmin && (
                                    <Tooltip title="Edit (Admin)">
                                        <Button type="text" icon={<EditOutlined />} className="cart-admin-edit-btn">
                                            Edit
                                        </Button>
                                    </Tooltip>
                                ),
                                <Button type="text" danger icon={<DeleteOutlined />} onClick={() => removeFromCart(item._id)}>
                                    Remove
                                </Button>
                            ]}
                        >
                            <Row align="middle" gutter={[16, 16]}>
                                <Col xs={24} sm={12} md={9}>
                                    <List.Item.Meta
                                        avatar={<Avatar shape="square" size={64} src={item.image} />}
                                        title={<Link to={`/product/${item._id}`}>{item.name}</Link>}
                                        description={
                                            <Space direction="vertical" size={0}>
                                                <Text type="secondary">Price: ₹{item.price.toFixed(2)}</Text>
                                                {item.quantity && <Text type="secondary">Stock: {item.quantity}</Text>}
                                            </Space>
                                        }
                                    />
                                </Col>

                                {/* Desktop View: Show quantity and discount badges */}
                                <Col xs={0} md={4} style={{ textAlign: 'center' }} className="desktop-badge-col">
                                    <Space direction="vertical" size={4}>
                                        <Tag color="blue">Qty: {item.quantity}</Tag>
                                        {discount > 0 && (
                                            <Tag color="green">
                                                Discount: {discount}%
                                            </Tag>
                                        )}
                                    </Space>
                                </Col>

                                <Col xs={12} sm={6} md={5} style={{ textAlign: 'center' }}>
                                    <Space>
                                        <Button size="small" shape="circle" icon={<MinusOutlined />} onClick={() => decreaseQuantity(item._id)} />
                                        <Text strong>{item.quantity}</Text>
                                        <Button
                                            size="small"
                                            shape="circle"
                                            icon={<PlusOutlined />}
                                            onClick={handleAddToCart}
                                            disabled={!canAddMore}
                                            style={{
                                                color: canAddMore ? '#1890ff' : '#d9d9d9',
                                                borderColor: canAddMore ? '#1890ff' : '#d9d9d9',
                                                cursor: canAddMore ? 'pointer' : 'not-allowed',
                                                opacity: canAddMore ? 1 : 0.5
                                            }}
                                        />
                                    </Space>
                                </Col>

                                <Col xs={12} sm={6} md={6} style={{ textAlign: 'right' }}>
                                    <Space direction="vertical" size={0} align="end">
                                        <Text strong style={{ fontSize: '16px' }}>
                                            ₹{itemTotal.toFixed(2)}
                                        </Text>
                                        {discount > 0 && (
                                            <Text delete type="secondary" style={{ fontSize: '12px' }}>
                                                ₹{originalTotal.toFixed(2)}
                                            </Text>
                                        )}
                                        {discount > 0 && (
                                            <Text type="success" style={{ fontSize: '12px' }}>
                                                Save: ₹{(originalTotal - itemTotal).toFixed(2)}
                                            </Text>
                                        )}
                                    </Space>
                                </Col>
                            </Row>
                        </List.Item>
                    );
                }}
            />

            {/* Order Summary Card - Like Blinkit/Flipkart */}
            <Card
                style={{
                    marginTop: '24px',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                }}
            >
                {/* Free Delivery Progress */}
                {!isFreeDelivery && deliverySettings.deliveryChargeEnabled && (
                    <div style={{
                        background: 'linear-gradient(135deg, #fff7e6 0%, #fffbe6 100%)',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        marginBottom: '16px',
                        border: '1px solid #ffe58f'
                    }}>
                        <Space>
                            <GiftOutlined style={{ color: '#fa8c16', fontSize: '18px' }} />
                            <Text>
                                Add <Text strong style={{ color: '#fa8c16' }}>₹{amountForFreeDelivery.toFixed(0)}</Text> more for
                                <Text strong style={{ color: '#52c41a' }}> FREE Delivery</Text>
                            </Text>
                        </Space>
                    </div>
                )}

                {/* Bill Details */}
                <Title level={5} style={{ marginBottom: '16px' }}>Bill Details</Title>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <Text>Item Total</Text>
                    <Text>₹{subtotal.toFixed(2)}</Text>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center' }}>
                    <Space>
                        <CarOutlined style={{ color: isFreeDelivery ? '#52c41a' : '#666' }} />
                        <Text>Delivery Charge</Text>
                    </Space>
                    {isFreeDelivery ? (
                        <Space>
                            <Text delete style={{ color: '#999' }}>₹{deliverySettings.deliveryCharge}</Text>
                            <Tag color="green">FREE</Tag>
                        </Space>
                    ) : (
                        <Text>₹{deliveryCharge.toFixed(2)}</Text>
                    )}
                </div>

                <Divider style={{ margin: '12px 0' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <Title level={4} style={{ margin: 0 }}>To Pay</Title>
                    <Title level={4} style={{ margin: 0, color: '#4f772d' }}>₹{total.toFixed(2)}</Title>
                </div>

                {isFreeDelivery && (
                    <div style={{
                        background: '#f6ffed',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        marginBottom: '16px',
                        textAlign: 'center'
                    }}>
                        <Text style={{ color: '#52c41a' }}>
                            🎉 Yay! You get <Text strong>FREE Delivery</Text> on this order!
                        </Text>
                    </div>
                )}

                <Link to="/shipping">
                    <Button
                        type="primary"
                        size="large"
                        block
                        style={{
                            height: '48px',
                            fontSize: '16px',
                            fontWeight: '600',
                            background: '#4f772d'
                        }}
                    >
                        Proceed to Checkout
                    </Button>
                </Link>
            </Card>
        </div>
    );
};

export default CartPage;
