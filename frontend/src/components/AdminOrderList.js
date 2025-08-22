// frontend/src/components/AdminOrderList.js
import React, { useState, useEffect } from 'react';
import { Table, Button, Typography, message, Tag } from 'antd';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const { Title } = Typography;

const AdminOrderList = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const { token } = useAuth();

    const fetchOrders = async () => {
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
    };

    useEffect(() => {
        if (token) {
            fetchOrders();
        }
    }, [token]);

    const handleMarkAsDelivered = async (id) => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.put(`http://localhost:5000/api/orders/${id}/deliver`, {}, config);
            message.success('Order marked as delivered');
            fetchOrders(); // Refresh the list
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
            title: 'Delivered', 
            dataIndex: 'isDelivered', 
            key: 'delivered', 
            render: delivered => (
                <Tag color={delivered ? 'green' : 'volcano'}>
                    {delivered ? 'Yes' : 'No'}
                </Tag>
            )
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                !record.isDelivered && (
                    <Button onClick={() => handleMarkAsDelivered(record._id)}>
                        Mark As Delivered
                    </Button>
                )
            ),
        },
    ];

    return (
        <div>
            <Title level={2}>Manage Orders</Title>
            <Table columns={columns} dataSource={orders} rowKey="_id" loading={loading} />
        </div>
    );
};

export default AdminOrderList;
