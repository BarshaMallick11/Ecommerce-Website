// frontend/src/components/AdminOrderList.js
import React, { useState, useEffect, useCallback } from 'react';
import { List, Card, Button, Typography, message, Tag, Modal, Form, Input, Select, Spin, Tooltip, Divider, DatePicker, Popconfirm } from 'antd'; // Import Tooltip
import { DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import moment from 'moment';
import AdminNav from './AdminNav';

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
    const handleDelete = async (id) => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.delete(`${process.env.REACT_APP_API_URL}/api/orders/${id}`, config);
            message.success('Order deleted successfully');
            fetchOrders(); // Refresh the list
        } catch (error) {
            message.error('Failed to delete order');
        }
    };

    const showUpdateModal = (order) => {
        setCurrentOrder(order);
        form.setFieldsValue({
            status: order.status,
            trackingNumber: order.trackingNumber,
            estimatedDeliveryDate: order.estimatedDeliveryDate ? moment(order.estimatedDeliveryDate) : null
        });
        setIsModalVisible(true);
    };

    const StatusTag = ({ status }) => {
        let color = 'geekblue';
        if (status === 'Shipped') color = 'orange';
        if (status === 'Delivered') color = 'green';
        if (status === 'Cancelled') color = 'red';
        return <Tag color={color}>{status ? status.toUpperCase() : 'N/A'}</Tag>;
    };

    return (
        <div>
            <Title level={2}>Admin Dashboard</Title>
            <AdminNav />

            <Title level={4} style={{ marginTop: 24 }}>All Customer Orders</Title>

            {loading && orders.length === 0 ? <div style={{ textAlign: 'center', marginTop: 50 }}><Spin size="large" /></div> : (
                <List
                    grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3, xl: 4 }}
                    dataSource={orders}
                    renderItem={(order) => (
                        <List.Item>
                            <Card
                                title={
                                    <Tooltip title={order._id}>
                                        <span>{`Order: ...${order._id.substring(order._id.length - 6)}`}</span>
                                    </Tooltip>
                                }
                                extra={
                                    <Popconfirm title="Are you sure you want to delete this order?" onConfirm={() => handleDelete(order._id)}>
                                        <Button shape="circle" danger icon={<DeleteOutlined />} />
                                    </Popconfirm>
                                }
                            >
                                <p><Text strong>User:</Text> {order.user ? order.user.username : 'N/A'}</p>
                                <p><Text strong>Date:</Text> {moment(order.createdAt).format('YYYY-MM-DD')}</p>

                                {/* Product Items */}
                                <div style={{
                                    background: '#f9f9f9',
                                    padding: '10px 12px',
                                    borderRadius: '6px',
                                    margin: '8px 0'
                                }}>
                                    <Text strong style={{ fontSize: '13px', color: '#555' }}>Items Ordered:</Text>
                                    <div style={{ marginTop: '6px' }}>
                                        {order.products && order.products.map((item, index) => (
                                            <div
                                                key={index}
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    padding: '4px 0',
                                                    borderBottom: index < order.products.length - 1 ? '1px solid #eee' : 'none'
                                                }}
                                            >
                                                <Text style={{ fontSize: '13px', flex: 1 }}>
                                                    {item.product?.name || item.name || 'Product'}
                                                </Text>
                                                <Tag color="blue" style={{ marginLeft: '8px' }}>
                                                    x{item.quantity || item.qty || 1}
                                                </Tag>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <p><Text strong>Total:</Text> ₹{order.totalAmount.toFixed(2)}</p>
                                <p><Text strong>Payment Mode:</Text>
                                    <Tag color={order.paymentMethod === 'COD' ? 'green' : 'blue'}>
                                        {order.paymentMethod === 'COD' ? 'COD' : order.paymentMethod === 'UPI' ? 'UPI (Paid)' : order.paymentMethod}
                                    </Tag>
                                </p>
                                <p><Text strong>Status:</Text> <StatusTag status={order.status} /></p>
                                {order.trackingNumber && <p><Text strong>Tracking #:</Text> {order.trackingNumber}</p>}
                                {order.estimatedDeliveryDate && <p><Text strong>Est. Delivery:</Text> {moment(order.estimatedDeliveryDate).format('YYYY-MM-DD')}</p>}

                                <Divider style={{ margin: '12px 0' }} />
                                <p><Text strong>Shipping Address:</Text></p>
                                <Text>{order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.postalCode}</Text><br />
                                <Text>{order.shippingAddress.country}</Text><br />
                                <Text>Phone: {order.shippingAddress.phoneNo}</Text>
                                <Button type="primary" style={{ width: '100%', marginTop: 16 }} onClick={() => showUpdateModal(order)} disabled={order.status === 'Delivered'}>
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
                destroyOnHidden
            >
                <Form form={form} layout="vertical" onFinish={handleUpdateStatus}>
                    <Form.Item name="status" label="Status">
                        <Select>
                            <Option value="Processing">Processing</Option>
                            <Option value="Shipped">Shipped</Option>
                            <Option value="Delivered">Delivered</Option>
                            <Option value="Cancelled">Cancelled</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="trackingNumber" label="Tracking Number">
                        <Input placeholder="Enter tracking number" />
                    </Form.Item>
                    <Form.Item name="estimatedDeliveryDate" label="Estimated Delivery Date">
                        <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default AdminOrderList;