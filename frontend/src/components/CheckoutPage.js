// frontend/src/components/CheckoutPage.js
import React, { useState } from 'react';
import { Button, Typography, message, Radio, Space } from 'antd';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import BackButton from './BackButton';

const { Title } = Typography;

const CheckoutPage = () => {
    const { cartItems, clearCart } = useCart();
    const { user, token } = useAuth();
    const navigate = useNavigate();
    const [paymentMethod, setPaymentMethod] = useState('Razorpay'); // Default to Razorpay

    const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

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
        } else {
            handleCodOrder();
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

    return (
        <div style={{ maxWidth: '500px', margin: 'auto' }}>
            <BackButton />
            <Title level={2}>Checkout</Title>
            <Title level={4}>Payment Method</Title>
            <Radio.Group onChange={(e) => setPaymentMethod(e.target.value)} value={paymentMethod} style={{ marginBottom: 24 }}>
                <Space direction="vertical">
                    <Radio value="Razorpay">Pay Online with Razorpay</Radio>
                    <Radio value="COD">Cash on Delivery (COD)</Radio>
                </Space>
            </Radio.Group>

            <Title level={4}>Total: ₹{total.toFixed(2)}</Title>
            <Button type="primary" size="large" onClick={handlePlaceOrder}>
                {paymentMethod === 'COD' ? 'Place Order' : 'Pay with Razorpay'}
            </Button>
        </div>
    );
};

export default CheckoutPage;