// frontend/src/components/AdminOrderList.js

import React, { useState, useEffect, useCallback } from 'react';
import { List, Card, Button, Typography, message, Tag, Modal, Form, Input, Select, Spin } from 'antd';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import moment from 'moment';
import AdminNav from './AdminNav'; // <-- IMPORT THE NEW COMPONENT

const { Title, Text } = Typography;
const { Option } = Select;

const AdminOrderList = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const { token } = useAuth();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [currentOrder, setCurrentOrder] = useState(null);
    const [form] = Form.useForm();

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/orders/all`, config);
            setOrders(data);
        } catch (error) {
            message.error('Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (token) { fetchOrders(); }
    }, [token, fetchOrders]);

    const handleUpdateStatus = async (values) => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.put(`${process.env.REACT_APP_API_URL}/api/orders/${currentOrder._id}/status`, values, config);
            message.success('Order status updated');
            setIsModalVisible(false);
            fetchOrders();
        } catch (error) {
            message.error('Failed to update order status');
        }
    };

    const showUpdateModal = (order) => {
        setCurrentOrder(order);
        form.setFieldsValue({ status: order.status, trackingNumber: order.trackingNumber });
        setIsModalVisible(true);
    };

    const StatusTag = ({ status }) => {
        let color = 'geekblue';
        if (status === 'Shipped') color = 'orange';
        if (status === 'Delivered') color = 'green';
        return <Tag color={color}>{status ? status.toUpperCase() : 'N/A'}</Tag>;
    };

    return (
        <div>
            <Title level={2}>Admin Dashboard</Title>
            <AdminNav /> {/* <-- USE THE NEW COMPONENT */}

            <Title level={4}>All Customer Orders</Title>

            {loading && orders.length === 0 ? <div style={{textAlign: 'center', marginTop: 50}}><Spin size="large"/></div> : (
                <List
                    grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3, xl: 4 }}
                    dataSource={orders}
                    renderItem={(order) => (
                        <List.Item>
                            <Card title={`Order: ...${order._id.substring(order._id.length - 6)}`}>
                                <p><Text strong>User:</Text> {order.user ? order.user.username : 'N/A'}</p>
                                <p><Text strong>Date:</Text> {moment(order.createdAt).format('YYYY-MM-DD')}</p>
                                <p><Text strong>Total:</Text> ₹{order.totalAmount.toFixed(2)}</p>
                                <p><Text strong>Status:</Text> <StatusTag status={order.status} /></p>
                                {order.trackingNumber && <p><Text strong>Tracking #:</Text> {order.trackingNumber}</p>}
                                <Button type="primary" style={{ width: '100%', marginTop: 16 }} onClick={() => showUpdateModal(order)}>
                                    Update Status
                                </Button>
                            </Card>
                        </List.Item>
                    )}
                />
            )}

            <Modal
                title="Update Order Status"
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                onOk={() => form.submit()}
                destroyOnClose
            >
                <Form form={form} layout="vertical" onFinish={handleUpdateStatus}>
                    <Form.Item name="status" label="Status">
                        <Select>
                            <Option value="Processing">Processing</Option>
                            <Option value="Shipped">Shipped</Option>
                            <Option value="Delivered">Delivered</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="trackingNumber" label="Tracking Number">
                        <Input placeholder="Enter tracking number" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default AdminOrderList;