// frontend/src/components/AdminPincodeManager.js
import React, { useState, useEffect, useCallback } from 'react';
import { List, Button, Typography, message, Input, Form, Popconfirm, Card, Tabs } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import AdminNav from './AdminNav';

const { Title } = Typography;

const AdminPincodeManager = () => {
    const { token } = useAuth();
    const [form] = Form.useForm();

    const [activeType, setActiveType] = useState('PINCODE');
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchItems = useCallback(async () => {
        if (!token) return;

        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(
                `${process.env.REACT_APP_API_URL}/api/coverage?type=${activeType}`,
                config
            );
            setItems(data);
        } catch (error) {
            message.error('Failed to fetch coverage entries');
        } finally {
            setLoading(false);
        }
    }, [token, activeType]);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    const onFinish = async (values) => {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        try {
            await axios.post(
                `${process.env.REACT_APP_API_URL}/api/coverage`,
                { type: activeType, value: values.value },
                config
            );
            message.success('Coverage entry added successfully');
            form.resetFields();
            fetchItems();
        } catch (error) {
            message.error(error.response?.data?.message || 'Failed to add coverage entry');
        }
    };

    const handleDelete = async (id) => {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        try {
            await axios.delete(`${process.env.REACT_APP_API_URL}/api/coverage/${id}`, config);
            message.success('Coverage entry deleted successfully');
            fetchItems();
        } catch (error) {
            message.error('Failed to delete coverage entry');
        }
    };

    const titleByType = {
        STATE: 'State Coverage',
        DISTRICT: 'City / District Coverage',
        PINCODE: 'Pincode Coverage',
    };

    const placeholderByType = {
        STATE: 'Enter state name',
        DISTRICT: 'Enter city/district name',
        PINCODE: 'Enter pincode',
    };

    const labelByType = {
        STATE: 'State',
        DISTRICT: 'City/District',
        PINCODE: 'Pincode',
    };

    return (
        <div>
            <Title level={2}>Admin Dashboard</Title>
            <AdminNav />

            <div style={{ marginTop: 24 }}>
                <Card title="Delivery Coverage">
                    <Tabs
                        activeKey={activeType}
                        onChange={(key) => {
                            setActiveType(key);
                            form.resetFields();
                        }}
                        items={[
                            { key: 'STATE', label: 'State' },
                            { key: 'DISTRICT', label: 'City/District' },
                            { key: 'PINCODE', label: 'Pincode' },
                        ]}
                    />

                    <div style={{ marginTop: 12 }}>
                        <Card size="small" title={titleByType[activeType]}>
                            <Form form={form} layout="inline" onFinish={onFinish} style={{ marginBottom: 24 }}>
                                <Form.Item
                                    name="value"
                                    rules={[{ required: true, message: `Please enter a ${labelByType[activeType]}` }]}
                                >
                                    <Input placeholder={placeholderByType[activeType]} />
                                </Form.Item>
                                <Form.Item>
                                    <Button type="primary" htmlType="submit">
                                        Add
                                    </Button>
                                </Form.Item>
                            </Form>

                            <List
                                bordered
                                loading={loading}
                                dataSource={items}
                                renderItem={(item) => (
                                    <List.Item
                                        actions={[
                                            <Popconfirm title="Are you sure?" onConfirm={() => handleDelete(item._id)}>
                                                <Button type="text" danger icon={<DeleteOutlined />} />
                                            </Popconfirm>,
                                        ]}
                                    >
                                        {item.value}
                                    </List.Item>
                                )}
                            />
                        </Card>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default AdminPincodeManager;
