// frontend/src/components/AdminOrderList.js
import React, { useState, useEffect, useCallback } from 'react'; // Import useCallback
import { Table, Button, Typography, message, Tag, Modal, Form, Input, Select } from 'antd';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const { Title } = Typography;
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
            const { data } = await axios.get('http://localhost:5000/api/orders/all', config);
            setOrders(data);
        } catch (error) {
            message.error('Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (token) {
            fetchOrders();
        }
    }, [token, fetchOrders]);

    const handleUpdateStatus = async (values) => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.put(`http://localhost:5000/api/orders/${currentOrder._id}/status`, values, config);
            message.success('Order status updated');
            setIsModalVisible(false);
            fetchOrders();
        } catch (error) {
            message.error('Failed to update order status');
        }
    };

    const columns = [
        { title: 'ID', dataIndex: '_id', key: 'id', ellipsis: true },
        { title: 'User', dataIndex: 'user', key: 'user', render: user => user ? user.username : 'N/A' },
        { title: 'Date', dataIndex: 'createdAt', key: 'date', render: date => new Date(date).toLocaleDateString() },
        { title: 'Total', dataIndex: 'totalAmount', key: 'total', render: total => `₹${total.toFixed(2)}` },
        { 
            title: 'Status', 
            dataIndex: 'status', 
            key: 'status', 
            render: status => {
                let color = 'geekblue';
                if (status === 'Shipped') color = 'orange';
                if (status === 'Delivered') color = 'green';
                return <Tag color={color}>{status ? status.toUpperCase() : 'N/A'}</Tag>;
            }
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Button onClick={() => { setCurrentOrder(record); form.setFieldsValue(record); setIsModalVisible(true); }}>
                    Update Status
                </Button>
            ),
        },
    ];

    return (
        <div>
            <Title level={2}>Manage Orders</Title>
            <Table columns={columns} dataSource={orders} rowKey="_id" loading={loading} />
            <Modal
                title="Update Order Status"
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                onOk={() => form.submit()}
            >
                <Form form={form} onFinish={handleUpdateStatus} initialValues={{ status: currentOrder?.status, trackingNumber: currentOrder?.trackingNumber }}>
                    <Form.Item name="status" label="Status">
                        <Select>
                            <Option value="Processing">Processing</Option>
                            <Option value="Shipped">Shipped</Option>
                            <Option value="Delivered">Delivered</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="trackingNumber" label="Tracking Number">
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default AdminOrderList;
