// frontend/src/components/ShippingPage.js
import React, { useState, useEffect, useCallback } from 'react'; // Import useCallback
import BackButton from './BackButton';
import { Typography, Radio, Button, message, Card, Space } from 'antd';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import AddressModal from './AddressModal';

const { Title } = Typography;

const ShippingPage = () => {
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const { token } = useAuth();
    const navigate = useNavigate();

    const fetchAddresses = useCallback(async () => {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/profile`, config);
        setAddresses(data.shippingAddresses);
        /*if (!selectedAddress && data.shippingAddresses.length > 0) {
            setSelectedAddress(data.shippingAddresses[0]);
        }*/
    }, [token]);

    useEffect(() => {
        if (token) fetchAddresses();
    }, [token, fetchAddresses]);

    const handleContinue = () => {
        if (selectedAddress) {
            localStorage.setItem('shippingAddress', JSON.stringify(selectedAddress));
            navigate('/checkout');
        } else {
            message.error('Please select or add a shipping address.');
        }
    };

    const handleAddAddress = async (values) => {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        try {
            const { data } = await axios.post(`${process.env.REACT_APP_API_URL}/api/profile/address`, values, config);
            setAddresses(data);
            setIsModalVisible(false);
            message.success('Address added successfully!');
        } catch (error) {
            message.error('Failed to add address.');
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: 'auto' }}>
            <BackButton />
            <Title level={2}>Shipping Address</Title>
            <Button type="dashed" onClick={() => setIsModalVisible(true)} style={{ marginBottom: 24 }}>
                Add New Address
            </Button>
            {addresses.length > 0 ? (
                <Radio.Group onChange={(e) => setSelectedAddress(e.target.value)} value={selectedAddress} style={{ width: '100%' }}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                        {addresses.map(addr => (
                            <Radio key={addr._id} value={addr}>
                                <Card size="small" style={{ width: '100%' }}>
                                    <p>{addr.address}, {addr.city}, {addr.postalCode}</p>
                                    <p>{addr.country}, Phone: {addr.phoneNo}</p>
                                </Card>
                            </Radio>
                        ))}
                    </Space>
                </Radio.Group>
            ) : (
                <p>No addresses found. Please <Link to="/profile">add an address</Link> to continue.</p>
            )}
            <Button type="primary" onClick={handleContinue} style={{ marginTop: 24 }} disabled={!selectedAddress}>
                Continue to Payment
            </Button>
            <AddressModal
                visible={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                onFinish={handleAddAddress}
                initialValues={null}
            />
        </div>
    );
};

export default ShippingPage;
