// frontend/src/components/CheckoutPage.js
import React from 'react';
import { Button, Typography, message } from 'antd';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const CheckoutPage = () => {
    const { cartItems, clearCart } = useCart();
    const { user, token } = useAuth(); 
    const navigate = useNavigate();

    const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const handlePayment = async () => {
        const shippingAddress = JSON.parse(localStorage.getItem('shippingAddress'));
        if (!shippingAddress) {
            message.error('Shipping address not found. Please go back.');
            return;
        }

        if (!user) {
            message.error('Please log in to proceed with the payment.');
            navigate('/login');
            return;
        }

        try {
            const { data: order } = await axios.post('http://localhost:5000/api/payment/create-order', { items: cartItems });

            const options = {
                key: 'rzp_test_1DP5mmOlF5G5ag', // Enter the Key ID generated from the Dashboard
                amount: order.amount,
                currency: order.currency,
                name: 'My E-Commerce Site',
                description: 'Test Transaction',
                order_id: order.id,
                handler: async function (response) {
                    try {
                        const verificationData = {
                            ...response,
                            cartItems: cartItems,
                            totalAmount: total,
                            token: token ,// Send the auth token
                            shippingAddress
                        };
                        await axios.post('http://localhost:5000/api/payment/verify-payment', verificationData);
                        localStorage.removeItem('shippingAddress');
                        message.success('Payment successful!');
                        clearCart();
                        navigate('/orders'); // Navigate to order history
                    } catch (error) {
                        message.error('Payment verification failed.');
                    }
                },
                prefill: {
                    name: user.username,
                    email: user.email, // You might need to add email to your user context
                },
                theme: {
                    color: '#3399cc'
                }
            };
            const rzp1 = new window.Razorpay(options);
            rzp1.open();
        } catch (error) {
            message.error('Could not initiate payment.');
        }
    };

    return (
        <div style={{ maxWidth: '500px', margin: 'auto' }}>
            <Title level={2}>Checkout Summary</Title>
            {/* You can add a summary of cart items here */}
            <Title level={4}>Total: ₹{total.toFixed(2)}</Title>
            <Button type="primary" size="large" onClick={handlePayment}>
                Pay with Razorpay
            </Button>
        </div>
    );
};

export default CheckoutPage;
