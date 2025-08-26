// frontend/src/components/AdminPincodeManager.js
import React, { useState, useEffect, useCallback } from 'react';
import { List, Button, Typography, message, Input, Form, Popconfirm, Card } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import AdminNav from './AdminNav';

const { Title } = Typography;

const AdminPincodeManager = () => {
    const [pincodes, setPincodes] = useState([]);
    const [loading, setLoading] = useState(false);
    const { token } = useAuth();
    const [form] = Form.useForm();

    const fetchPincodes = useCallback(async () => {
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/pincodes`, config);
            setPincodes(data);
        } catch (error) {
            message.error('Failed to fetch pincodes');
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (token) fetchPincodes();
    }, [token, fetchPincodes]);

    const onFinish = async (values) => {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/api/pincodes`, values, config);
            message.success('Pincode added successfully');
            form.resetFields();
            fetchPincodes();
        } catch (error) {
            message.error(error.response?.data?.message || 'Failed to add pincode');
        }
    };

    const handleDelete = async (id) => {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        try {
            await axios.delete(`${process.env.REACT_APP_API_URL}/api/pincodes/${id}`, config);
            message.success('Pincode deleted successfully');
            fetchPincodes();
        } catch (error) {
            message.error('Failed to delete pincode');
        }
    };

    return (
        <div>
            <Title level={2}>Admin Dashboard</Title>
            <AdminNav />

            <div style={{ marginTop: 24 }}>
                <Card title="Manage Serviceable Pincodes">
                    <Form form={form} layout="inline" onFinish={onFinish} style={{ marginBottom: 24 }}>
                        <Form.Item name="code" rules={[{ required: true, message: 'Please enter a pincode' }]}>
                            <Input placeholder="Enter new pincode" />
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit">Add Pincode</Button>
                        </Form.Item>
                    </Form>
                    <List
                        bordered
                        loading={loading}
                        dataSource={pincodes}
                        renderItem={item => (
                            <List.Item
                                actions={[
                                    <Popconfirm title="Are you sure?" onConfirm={() => handleDelete(item._id)}>
                                        <Button type="text" danger icon={<DeleteOutlined />} />
                                    </Popconfirm>
                                ]}
                            >
                                {item.code}
                            </List.Item>
                        )}
                    />
                </Card>
            </div>
        </div>
    );
};

export default AdminPincodeManager;
