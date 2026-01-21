// frontend/src/components/ShippingPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { Typography, Radio, Button, message, Card, Space, Alert, Popconfirm } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
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
    const [editingAddress, setEditingAddress] = useState(null);
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
            const { data } = await axios.post(
                `${process.env.REACT_APP_API_URL}/api/shipping/check-coverage`,
                {
                    postalCode: address.postalCode,
                    state: address.state,
                    district: address.district,
                    city: address.city,
                }
            );
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

    const handleSaveAddress = async (values) => {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        try {
            let updated;
            if (editingAddress?._id) {
                const { data } = await axios.put(
                    `${process.env.REACT_APP_API_URL}/api/profile/address/${editingAddress._id}`,
                    values,
                    config
                );
                updated = data;
                message.success('Address updated successfully!');
            } else {
                const { data } = await axios.post(`${process.env.REACT_APP_API_URL}/api/profile/address`, values, config);
                updated = data;
                message.success('Address added successfully!');
            }

            setAddresses(updated);

            // If we edited the currently selected address, refresh the selected object
            // from the updated list (so UI + serviceability stay in sync).
            if (editingAddress?._id) {
                const refreshed = updated.find((a) => a._id === editingAddress._id);
                if (refreshed && selectedAddress?._id === editingAddress._id) {
                    setSelectedAddress(refreshed);
                    checkServiceability(refreshed);
                }
            }

            setIsModalVisible(false);
            setEditingAddress(null);
        } catch (error) {
            message.error('Failed to save address.');
        }
    };

    const handleEditClick = (address, e) => {
        e?.stopPropagation();

        // If the card is currently selected, keep it selected.
        // Also re-check serviceability after saving.
        setEditingAddress(address);
        setIsModalVisible(true);
    };

    const handleDelete = async (addressId, e) => {
        e?.stopPropagation();

        const config = { headers: { Authorization: `Bearer ${token}` } };
        try {
            const { data } = await axios.delete(`${process.env.REACT_APP_API_URL}/api/profile/address/${addressId}`, config);
            setAddresses(data);

            if (selectedAddress?._id === addressId) {
                setSelectedAddress(null);
                setIsServiceable(true);
            }

            message.success('Address deleted successfully!');
        } catch (error) {
            message.error('Failed to delete address.');
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: 'auto' }}>
            <BackButton />
            <Title level={2}>Shipping Address</Title>
            <Button
                type="dashed"
                onClick={() => {
                    setEditingAddress(null);
                    setIsModalVisible(true);
                }}
                style={{ marginBottom: 24 }}
            >
                Add New Address
            </Button>
            {addresses.length > 0 ? (
                <Radio.Group onChange={handleAddressChange} value={selectedAddress} style={{ width: '100%' }}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                        {addresses.map((addr) => (
                            <Radio key={addr._id} value={addr}>
                                <Card
                                    size="small"
                                    style={{ width: '100%' }}
                                    actions={[
                                        <Button
                                            type="text"
                                            icon={<EditOutlined />}
                                            onClick={(e) => handleEditClick(addr, e)}
                                        />,
                                        <Popconfirm
                                            title="Delete this address?"
                                            onConfirm={(e) => handleDelete(addr._id, e)}
                                        >
                                            <Button type="text" danger icon={<DeleteOutlined />} />
                                        </Popconfirm>,
                                    ]}
                                >
                                    <p><strong>{addr.name}</strong></p>
                                    <p>
                                        {addr.address}, {addr.city}
                                        {addr.district ? `, ${addr.district}` : ''}
                                        {addr.state ? `, ${addr.state}` : ''}
                                        {`, ${addr.postalCode}`}
                                    </p>
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
                <Alert message="Sorry, we do not currently deliver to this location." type="warning" showIcon style={{ marginTop: 24 }}/>
            )}

            <Button type="primary" onClick={handleContinue} style={{ marginTop: 24 }} disabled={!selectedAddress || !isServiceable}>
                Continue to Payment
            </Button>
            <AddressModal
                visible={isModalVisible}
                onCancel={() => {
                    setIsModalVisible(false);
                    setEditingAddress(null);
                }}
                onFinish={handleSaveAddress}
                initialValues={editingAddress}
            />
        </div>
    );
};

export default ShippingPage;
