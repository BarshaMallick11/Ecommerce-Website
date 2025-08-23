// frontend/src/components/ProfilePage.js
import React, { useState, useEffect } from 'react';
import { Typography, Button, message, Card, List, Popconfirm, Space } from 'antd';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import AddressModal from './AddressModal';

const { Title } = Typography;

const ProfilePage = () => {
    const [addresses, setAddresses] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const { token } = useAuth();

    const fetchAddresses = async () => {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const { data } = await axios.get('http://localhost:5000/api/profile', config);
        setAddresses(data.shippingAddresses);
    };

    useEffect(() => {
        if (token) fetchAddresses();
    }, [token]);

    const handleFinish = async (values) => {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        try {
            let response;
            if (editingAddress) {
                response = await axios.put(`http://localhost:5000/api/profile/address/${editingAddress._id}`, values, config);
                message.success('Address updated successfully!');
            } else {
                response = await axios.post('http://localhost:5000/api/profile/address', values, config);
                message.success('Address added successfully!');
            }
            setAddresses(response.data);
            setIsModalVisible(false);
            setEditingAddress(null);
        } catch (error) {
            message.error('Failed to save address.');
        }
    };

    const handleDelete = async (id) => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.delete(`http://localhost:5000/api/profile/address/${id}`, config);
            setAddresses(data);
            message.success('Address deleted successfully!');
        } catch (error) {
            message.error('Failed to delete address.');
        }
    };

    return (
        <div>
            <Title level={2}>My Profile</Title>
            <Card title="My Shipping Addresses" extra={<Button type="primary" onClick={() => { setEditingAddress(null); setIsModalVisible(true); }}>Add New Address</Button>}>
                <List
                    dataSource={addresses}
                    renderItem={item => (
                        <List.Item
                            actions={[
                                <Button type="link" onClick={() => { setEditingAddress(item); setIsModalVisible(true); }}>Edit</Button>,
                                <Popconfirm title="Are you sure?" onConfirm={() => handleDelete(item._id)}>
                                    <Button type="link" danger>Delete</Button>
                                </Popconfirm>
                            ]}
                        >
                            <List.Item.Meta
                                title={`${item.address}, ${item.city}`}
                                description={`${item.postalCode}, ${item.country}, Phone: ${item.phoneNo}`}
                            />
                        </List.Item>
                    )}
                />
            </Card>
            <AddressModal
                visible={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                onFinish={handleFinish}
                initialValues={editingAddress}
            />
        </div>
    );
};

export default ProfilePage;
