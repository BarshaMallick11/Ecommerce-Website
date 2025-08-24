// frontend/src/components/TrackOrderPage.js
import React, { useState } from 'react';
import BackButton from './BackButton';
import { Input, Card, Typography, message, Steps } from 'antd';
import axios from 'axios';

const { Title } = Typography;
const { Step } = Steps;

const TrackOrderPage = () => {
    const [orderId, setOrderId] = useState('');
    const [orderStatus, setOrderStatus] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleTrackOrder = async () => {
        if (!orderId.trim()) {
            message.error('Please enter an Order ID.');
            return;
        }
        setLoading(true);
        try {
            const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/orders/track/${orderId}`);
            setOrderStatus(data);
        } catch (error) {
            message.error('Order not found.');
            setOrderStatus(null);
        } finally {
            setLoading(false);
        }
    };

    const getStep = () => {
        if (!orderStatus) return 0;
        if (orderStatus.status === 'Processing') return 0;
        if (orderStatus.status === 'Shipped') return 1;
        if (orderStatus.status === 'Delivered') return 2;
        return 0;
    };

    return (
        <div style={{ maxWidth: '600px', margin: 'auto' }}>
            <BackButton />
            <Title level={2}>Track Your Order</Title>
            <Input.Search
                placeholder="Enter your Order ID"
                enterButton="Track"
                size="large"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                onSearch={handleTrackOrder}
                loading={loading}
            />
            {orderStatus && (
                <Card style={{ marginTop: 24 }}>
                    <Steps current={getStep()}>
                        <Step title="Processing" />
                        <Step title="Shipped" />
                        <Step title="Delivered" />
                    </Steps>
                    {orderStatus.status === 'Shipped' && orderStatus.trackingNumber && (
                        <p style={{ marginTop: 16 }}>
                            Tracking Number: <strong>{orderStatus.trackingNumber}</strong>
                        </p>
                    )}
                </Card>
            )}
        </div>
    );
};

export default TrackOrderPage;