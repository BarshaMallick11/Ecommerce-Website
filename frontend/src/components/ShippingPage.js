// frontend/src/components/ShippingPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { Typography, Radio, Button, message, Card, Space, Alert } from 'antd';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import AddressModal from './AddressModal';
import BackButton from './BackButton';

const { Title } = Typography;

const ShippingPage = () => {
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isServiceable, setIsServiceable] = useState(true);
    const { token } = useAuth();
    const navigate = useNavigate();

    const fetchAddresses = useCallback(async () => {
        if (!token) return;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        try {
            const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/profile`, config);
            setAddresses(data.shippingAddresses);
        } catch (error) {
            message.error("Failed to fetch addresses.");
        }
    }, [token]);

    useEffect(() => {
        fetchAddresses();
    }, [fetchAddresses]);

    const checkServiceability = async (address) => {
        if (!address) {
            setIsServiceable(true); // Reset if no address is selected
            return;
        }
        try {
            const { data } = await axios.post(`${process.env.REACT_APP_API_URL}/api/shipping/check-pincode`, { postalCode: address.postalCode });
            setIsServiceable(data.serviceable);
        } catch (error) {
            setIsServiceable(false);
        }
    };

    const handleAddressChange = (e) => {
        const newAddress = e.target.value;
        setSelectedAddress(newAddress);
        checkServiceability(newAddress);
    };

    const handleContinue = () => {
        if (selectedAddress && isServiceable) {
            localStorage.setItem('shippingAddress', JSON.stringify(selectedAddress));
            navigate('/checkout');
        } else {
            message.error('Please select a serviceable shipping address.');
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
                <Radio.Group onChange={handleAddressChange} value={selectedAddress} style={{ width: '100%' }}>
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

            {!isServiceable && selectedAddress && (
                <Alert message="Sorry, we do not currently deliver to this pincode." type="warning" showIcon style={{ marginTop: 24 }}/>
            )}

            <Button type="primary" onClick={handleContinue} style={{ marginTop: 24 }} disabled={!selectedAddress || !isServiceable}>
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
