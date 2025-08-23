// frontend/src/components/ProfilePage.js

import React, { useState } from 'react';
import { Card, Button, Typography, Space, Divider, Tabs, List, Form, Input, message } from 'antd';
import { LeftOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

// --- Placeholder Data (you would fetch this from your backend) ---
const initialAddresses = [
    {
        id: 1,
        line1: 'Soladevanahalli, Bengaluru',
        city: 'Bengaluru',
        postalCode: '560107',
        country: 'India',
        phone: '9641648838'
    }
];

// --- Profile Details Component (for the first tab) ---
const ProfileDetails = () => {
    const onFinish = (values) => {
        console.log('Success:', values);
        message.success('Profile updated successfully!');
        // Here you would call your backend API to update the user's profile
    };

    return (
        <div>
            <Title level={4}>Update Your Information</Title>
            <Form layout="vertical" onFinish={onFinish} initialValues={{ name: 'Barsha', email: 'barsha@example.com' }}>
                <Form.Item label="Full Name" name="name" rules={[{ required: true }]}>
                    <Input />
                </Form.Item>
                <Form.Item label="Email Address" name="email" rules={[{ required: true, type: 'email' }]}>
                    <Input />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit">Update Profile</Button>
                </Form.Item>
            </Form>
            {/* <Divider />
            <Title level={4}>Change Password</Title>
            <Form layout="vertical" onFinish={() => message.success('Password changed!')}>
                 <Form.Item label="Current Password" name="currentPassword" rules={[{ required: true }]}>
                    <Input.Password />
                </Form.Item>
                <Form.Item label="New Password" name="newPassword" rules={[{ required: true }]}>
                    <Input.Password />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit">Change Password</Button>
                </Form.Item>
            </Form> */}
        </div>
    );
};

// --- Shipping Address Component (for the second tab) ---
const ShippingAddresses = () => {
    const [addresses, setAddresses] = useState(initialAddresses);

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <Title level={4} style={{ margin: 0 }}>My Shipping Addresses</Title>
                <Button type="primary">Add New Address</Button>
            </div>
            <List
                grid={{ gutter: 16, xs: 1, sm: 1, md: 2 }}
                dataSource={addresses}
                renderItem={item => (
                    <List.Item>
                        <Card
                            title={item.line1}
                            actions={[
                                <EditOutlined key="edit" />,
                                <DeleteOutlined key="delete" />,
                            ]}
                        >
                            <p>{item.city}, {item.postalCode}</p>
                            <p>{item.country}</p>
                            <p><Text strong>Phone:</Text> {item.phone}</p>
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
                    <ProfileDetails />
                </TabPane>
                <TabPane tab="Shipping Addresses" key="2">
                    <ShippingAddresses />
                </TabPane>
            </Tabs>
        </div>
    );
};

export default ProfilePage;