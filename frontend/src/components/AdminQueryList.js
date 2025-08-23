// frontend/src/components/AdminQueryList.js
import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Typography, message, Tag } from 'antd';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const { Title } = Typography;

const AdminQueryList = () => {
    const [queries, setQueries] = useState([]);
    const [loading, setLoading] = useState(false);
    const { token } = useAuth();

    const fetchQueries = useCallback(async () => {
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get('http://localhost:5000/api/queries', config);
            setQueries(data);
        } catch (error) {
            message.error('Failed to fetch queries');
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (token) fetchQueries();
    }, [token, fetchQueries]);

    const handleResolve = async (id) => {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        await axios.put(`http://localhost:5000/api/queries/${id}/resolve`, {}, config);
        message.success('Query marked as resolved');
        fetchQueries();
    };

    const columns = [
        { title: 'Name', dataIndex: 'name', key: 'name' },
        { title: 'Email', dataIndex: 'email', key: 'email' },
        { title: 'Order ID', dataIndex: 'orderId', key: 'orderId' },
        { title: 'Message', dataIndex: 'message', key: 'message', ellipsis: true },
        { title: 'Status', dataIndex: 'isResolved', key: 'status', render: res => <Tag color={res ? 'green' : 'volcano'}>{res ? 'Resolved' : 'Pending'}</Tag> },
        { title: 'Action', key: 'action', render: (_, rec) => !rec.isResolved && <Button onClick={() => handleResolve(rec._id)}>Mark Resolved</Button> },
    ];

    return (
        <div>
            <Title level={2}>Customer Queries</Title>
            <Table columns={columns} dataSource={queries} rowKey="_id" loading={loading} />
        </div>
    );
};

export default AdminQueryList;