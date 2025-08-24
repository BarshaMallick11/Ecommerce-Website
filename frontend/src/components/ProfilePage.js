// frontend/src/components/ProfilePage.js
import React, { useState, useEffect } from 'react';
import { Card, Button, Typography, Tabs, List, Form, Input, message, Popconfirm } from 'antd';
import { LeftOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import AddressModal from './AddressModal';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

// --- Profile Details Component (for the first tab) ---
const ProfileDetails = ({ user, token, onProfileUpdate }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (user) {
            form.setFieldsValue({
                username: user.username,
                email: user.email,
            });
        }
    }, [user, form]);

    const onFinish = async (values) => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.put('http://localhost:5000/api/profile', values, config);
            message.success('Profile updated successfully!');
            onProfileUpdate(data); // Update the global user state
        } catch (error) {
            message.error('Failed to update profile.');
        }
    };

    return (
        <div>
            <Title level={4}>Update Your Information</Title>
            <Form form={form} layout="vertical" onFinish={onFinish}>
                <Form.Item label="Full Name" name="username" rules={[{ required: true }]}>
                    <Input />
                </Form.Item>
                <Form.Item label="Email Address" name="email" rules={[{ required: true, type: 'email' }]}>
                    <Input />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit">Update Profile</Button>
                </Form.Item>
            </Form>
        </div>
    );
};

// --- Shipping Address Component (for the second tab) ---
const ShippingAddresses = ({ addresses, onAdd, onEdit, onDelete }) => {
    return (
        <div>
            <div 
                style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    marginBottom: '24px' 
                }}
            >
                <Title level={4} style={{ margin: 0 }}>My Shipping Addresses</Title>
                <Button type="primary" onClick={onAdd}>Add New Address</Button>
            </div>

            <List
                grid={{ gutter: 20, xs: 1, sm: 1, md: 2 }}
                dataSource={addresses}
                renderItem={item => (
                    <List.Item style={{ display: "flex", justifyContent: "center" }}>
                        <Card
                            style={{ 
                                width: "100%", 
                                height: "220px", 
                                display: "flex", 
                                flexDirection: "column", 
                                justifyContent: "space-between",
                                borderRadius: "10px",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                            }}
                            bodyStyle={{ 
                                flexGrow: 1, 
                                padding: "16px 20px", 
                                display: "flex", 
                                flexDirection: "column", 
                                justifyContent: "flex-start" 
                            }}
                            actions={[
                                <EditOutlined key="edit" onClick={() => onEdit(item)} />,
                                <Popconfirm title="Are you sure?" onConfirm={() => onDelete(item._id)}>
                                    <DeleteOutlined key="delete" />
                                </Popconfirm>,
                            ]}
                        >
                            <div style={{ marginBottom: "12px" }}>
                                <Text strong style={{ fontSize: "15px", display: "block", marginBottom: "6px", wordBreak: "break-word", lineHeight: "1.4" }}>
                                    {item.address}, {item.city}
                                </Text>
                            </div>
                            <div style={{ marginBottom: "6px", lineHeight: "1.5" }}>
                                <Text>{item.postalCode}, {item.country}</Text>
                            </div>
                            <div>
                                <Text strong>Phone:</Text> {item.phoneNo}
                            </div>
                        </Card>
                    </List.Item>
                )}
            />
        </div>
    );
};

// --- Main Profile Page Component ---
const ProfilePage = () => {
    const navigate = useNavigate();
    const [addresses, setAddresses] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const { user, token, login } = useAuth();

    const fetchAddresses = async () => {
        if (!token) return;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        try {
            const { data } = await axios.get('http://localhost:5000/api/profile', config);
            setAddresses(data.shippingAddresses);
        } catch (error) {
            message.error('Could not fetch addresses.');
        }
    };

    useEffect(() => {
        fetchAddresses();
    }, [token]);

    const handleProfileUpdate = (updatedUser) => {
        // Re-use the login function to update the global state and local storage
        login(token, updatedUser);
    };

    const handleFinishAddress = async (values) => {
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

    const handleDeleteAddress = async (id) => {
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
        <div style={{ maxWidth: '900px', margin: 'auto' }}>
            <Button 
                icon={<LeftOutlined />} 
                onClick={() => navigate(-1)} 
                style={{ marginBottom: '24px' }}
            >
                Back
            </Button>

            <Title level={2}>My Profile</Title>

            <Tabs defaultActiveKey="1" type="card">
                <TabPane tab="Profile Details" key="1">
                    <ProfileDetails user={user} token={token} onProfileUpdate={handleProfileUpdate} />
                </TabPane>
                <TabPane tab="Shipping Addresses" key="2">
                    <ShippingAddresses 
                        addresses={addresses}
                        onAdd={() => { setEditingAddress(null); setIsModalVisible(true); }}
                        onEdit={(address) => { setEditingAddress(address); setIsModalVisible(true); }}
                        onDelete={handleDeleteAddress}
                    />
                </TabPane>
            </Tabs>

            <AddressModal
                visible={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                onFinish={handleFinishAddress}
                initialValues={editingAddress}
            />
        </div>
    );
};

export default ProfilePage;
