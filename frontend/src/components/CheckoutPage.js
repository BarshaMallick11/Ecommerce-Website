// frontend/src/components/CheckoutPage.js
import React, { useState, useEffect } from 'react';
import { Button, Typography, message, Radio, Space, Card, Divider, Tag } from 'antd';
import { CarOutlined, GiftOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import BackButton from './BackButton';
import UpiPaymentModal from './UpiPaymentModal';

const { Title, Text } = Typography;

const CheckoutPage = () => {
    const { cartItems, clearCart } = useCart();
    const { user, token } = useAuth();
    const navigate = useNavigate();
    const [paymentMethod, setPaymentMethod] = useState('');
    const [upiModalVisible, setUpiModalVisible] = useState(false);
    const [pendingOrderId, setPendingOrderId] = useState(null);
    const [deliverySettings, setDeliverySettings] = useState({
        deliveryCharge: 40,
        freeDeliveryThreshold: 399,
        deliveryChargeEnabled: true
    });
    const [paymentMethodSettings, setPaymentMethodSettings] = useState({
        razorpayEnabled: true,
        upiManualEnabled: true,
        codEnabled: true
    });

    // Fetch delivery and payment method settings
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/settings`);
                setDeliverySettings({
                    deliveryCharge: data.deliveryCharge || 40,
                    freeDeliveryThreshold: data.freeDeliveryThreshold || 399,
                    deliveryChargeEnabled: data.deliveryChargeEnabled !== false
                });

                const paymentSettings = {
                    razorpayEnabled: data.razorpayEnabled === undefined ? true : data.razorpayEnabled,
                    upiManualEnabled: data.upiManualEnabled === undefined ? true : data.upiManualEnabled,
                    codEnabled: data.codEnabled === undefined ? true : data.codEnabled
                };
                setPaymentMethodSettings(paymentSettings);

                // Set default payment method to first enabled method
                if (!paymentMethod) {
                    if (paymentSettings.razorpayEnabled) {
                        setPaymentMethod('Razorpay');
                    } else if (paymentSettings.upiManualEnabled) {
                        setPaymentMethod('UPI');
                    } else if (paymentSettings.codEnabled) {
                        setPaymentMethod('COD');
                    }
                }
            } catch (error) {
                console.error('Failed to fetch settings');
            }
        };
        fetchSettings();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Calculate subtotal using discounted price
    const subtotal = cartItems.reduce((sum, item) => {
        const discount = item.discount || 0;
        const discountedPrice = item.price * (1 - discount / 100);
        return sum + discountedPrice * item.quantity;
    }, 0);

    // Calculate delivery charge
    const isFreeDelivery = subtotal >= deliverySettings.freeDeliveryThreshold;
    const deliveryCharge = (!deliverySettings.deliveryChargeEnabled || isFreeDelivery) ? 0 : deliverySettings.deliveryCharge;

    // Final total
    const total = subtotal + deliveryCharge;

    const handlePlaceOrder = async () => {
        if (!user) {
            message.error('Please log in to proceed.');
            navigate('/login');
            return;
        }

        const shippingAddress = JSON.parse(localStorage.getItem('shippingAddress'));
        if (!shippingAddress) {
            message.error('Shipping address not found. Please go back.');
            return;
        }

        if (paymentMethod === 'Razorpay') {
            handleRazorpayPayment();
        } else if (paymentMethod === 'COD') {
            handleCodOrder();
        } else if (paymentMethod === 'UPI') {
            handleUpiOrder();
        }
    };

    const handleRazorpayPayment = async () => {
        try {
            const { data: order } = await axios.post(`${process.env.REACT_APP_API_URL}/api/payment/create-order`, { items: cartItems });

            const options = {
                key: process.env.REACT_APP_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: 'Premium.Store',
                description: 'Test Transaction',
                order_id: order.id,
                handler: async function (response) {
                    const verificationData = {
                        ...response,
                        cartItems,
                        totalAmount: total,
                        deliveryCharge: deliveryCharge,
                        token,
                        shippingAddress: JSON.parse(localStorage.getItem('shippingAddress')),
                    };
                    await axios.post(`${process.env.REACT_APP_API_URL}/api/payment/verify-payment`, verificationData);
                    message.success('Payment successful!');
                    clearCart();
                    localStorage.removeItem('shippingAddress');
                    navigate('/orders');
                },
                prefill: { name: user.username, email: user.email },
                theme: { color: '#4f772d' }
            };
            const rzp1 = new window.Razorpay(options);
            rzp1.open();
        } catch (error) {
            message.error('Could not initiate payment.');
        }
    };

    const handleCodOrder = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const orderData = {
                cartItems,
                totalAmount: total,
                deliveryCharge: deliveryCharge,
                shippingAddress: JSON.parse(localStorage.getItem('shippingAddress')),
            };
            await axios.post(`${process.env.REACT_APP_API_URL}/api/payment/cod-order`, orderData, config);
            message.success('Order placed successfully!');
            clearCart();
            localStorage.removeItem('shippingAddress');
            navigate('/orders');
        } catch (error) {
            message.error('Failed to place order.');
        }
    };

    const handleUpiOrder = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const orderData = {
                cartItems,
                totalAmount: total,
                deliveryCharge: deliveryCharge,
                shippingAddress: JSON.parse(localStorage.getItem('shippingAddress')),
            };
            const { data } = await axios.post(
                `${process.env.REACT_APP_API_URL}/api/payment/upi-order`,
                orderData,
                config
            );

            // Order created, now show UPI payment modal
            setPendingOrderId(data.orderId);
            setUpiModalVisible(true);
        } catch (error) {
            message.error('Failed to create order.');
        }
    };

    const handleUpiPaymentSuccess = () => {
        clearCart();
        localStorage.removeItem('shippingAddress');
        message.success('Payment proof submitted! Awaiting admin verification.');
        navigate('/orders');
    };

    return (
        <div style={{ maxWidth: '500px', margin: 'auto' }}>
            <BackButton />
            <Title level={2}>Checkout</Title>
            <Title level={4}>Payment Method</Title>
            {!paymentMethodSettings.razorpayEnabled && !paymentMethodSettings.upiManualEnabled && !paymentMethodSettings.codEnabled ? (
                <div style={{
                    background: '#fff1f0',
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px solid #ffa39e',
                    marginBottom: 24
                }}>
                    <Text type="danger">
                        <strong>No payment methods available.</strong> Please contact the store administrator.
                    </Text>
                </div>
            ) : (
                <Radio.Group onChange={(e) => setPaymentMethod(e.target.value)} value={paymentMethod} style={{ marginBottom: 24 }}>
                    <Space direction="vertical">
                        {paymentMethodSettings.razorpayEnabled && (
                            <Radio value="Razorpay">Pay Online with Razorpay</Radio>
                        )}
                        {paymentMethodSettings.upiManualEnabled && (
                            <Radio value="UPI">
                                Pay via UPI (Manual)
                                <span style={{ fontSize: 12, color: '#888', marginLeft: 8 }}>
                                    ₹0 fees • No gateway
                                </span>
                            </Radio>
                        )}
                        {paymentMethodSettings.codEnabled && (
                            <Radio value="COD">Cash on Delivery (COD)</Radio>
                        )}
                    </Space>
                </Radio.Group>
            )}

            {/* Bill Details Card */}
            <Card style={{ marginBottom: 24, borderRadius: '12px' }}>
                <Title level={5} style={{ marginBottom: '16px' }}>Bill Details</Title>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <Text>Item Total</Text>
                    <Text>₹{subtotal.toFixed(2)}</Text>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', alignItems: 'center' }}>
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

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Title level={4} style={{ margin: 0 }}>To Pay</Title>
                    <Title level={4} style={{ margin: 0, color: '#4f772d' }}>₹{total.toFixed(2)}</Title>
                </div>

                {isFreeDelivery && (
                    <div style={{
                        background: '#f6ffed',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        marginTop: '12px',
                        textAlign: 'center'
                    }}>
                        <Text style={{ color: '#52c41a' }}>
                            🎉 FREE Delivery on this order!
                        </Text>
                    </div>
                )}
            </Card>

            <Button
                type="primary"
                size="large"
                onClick={handlePlaceOrder}
                disabled={!paymentMethod || (!paymentMethodSettings.razorpayEnabled && !paymentMethodSettings.upiManualEnabled && !paymentMethodSettings.codEnabled)}
                block
                style={{
                    height: '48px',
                    fontSize: '16px',
                    fontWeight: '600',
                    background: '#4f772d'
                }}
            >
                {paymentMethod === 'COD' ? 'Place Order' : paymentMethod === 'UPI' ? 'Proceed to Pay' : 'Pay with Razorpay'}
            </Button>

            <UpiPaymentModal
                visible={upiModalVisible}
                onClose={() => setUpiModalVisible(false)}
                orderId={pendingOrderId}
                amount={total}
                onSuccess={handleUpiPaymentSuccess}
            />
        </div>
    );
};

export default CheckoutPage;