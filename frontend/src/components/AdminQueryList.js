// frontend/src/components/AdminQueryList.js

import React, { useState, useEffect, useCallback } from 'react';
import { List, Card, Button, Typography, message, Tag, Spin } from 'antd'; // Removed Menu
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import AdminNav from './AdminNav'; // <-- IMPORT THE NEW COMPONENT

const { Title, Text, Paragraph } = Typography;

const AdminQueryList = () => {
    const [queries, setQueries] = useState([]);
    const [loading, setLoading] = useState(false);
    const { token } = useAuth();

    const fetchQueries = useCallback(async () => {
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get('${process.env.REACT_APP_API_URL}/api/queries', config);
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
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.put(`${process.env.REACT_APP_API_URL}/api/queries/${id}/resolve`, {}, config);
            message.success('Query marked as resolved');
            fetchQueries();
        } catch (error) {
            message.error('Failed to resolve query');
        }
    };

    return (
        <div>
            <Title level={2}>Admin Dashboard</Title>
            <AdminNav /> {/* <-- USE THE NEW COMPONENT */}

            <Title level={4}>Customer Queries</Title>

            {loading && queries.length === 0 ? <div style={{textAlign: 'center', marginTop: 50}}><Spin size="large"/></div> : (
                <List
                    grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 2, xl: 3 }}
                    dataSource={queries}
                    renderItem={(query) => (
                        <List.Item>
                            <Card
                                title={query.name}
                                extra={<Tag color={query.isResolved ? 'green' : 'volcano'}>{query.isResolved ? 'Resolved' : 'Pending'}</Tag>}
                            >
                                <p><Text strong>Email:</Text> {query.email}</p>
                                {query.orderId && <p><Text strong>Order ID:</Text> {query.orderId}</p>}
                                <Paragraph ellipsis={{ rows: 3, expandable: true, symbol: 'more' }}>
                                    <Text strong>Message:</Text> {query.message}
                                </Paragraph>
                                {!query.isResolved && (
                                    <Button type="primary" style={{ width: '100%', marginTop: 16 }} onClick={() => handleResolve(query._id)}>
                                        Mark as Resolved
                                    </Button>
                                )}
                            </Card>
                        </List.Item>
                    )}
                />
            )}
        </div>
    );
};

export default AdminQueryList;