// frontend/src/components/AdminUserList.js

import React, { useState, useEffect } from 'react';
import { List, Card, Button, Typography, message, Tag, Popconfirm, Space, Spin, Tooltip } from 'antd';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import AdminNav from './AdminNav'; // <-- IMPORT THE NEW COMPONENT

const { Title, Text } = Typography;

const AdminUserList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const { token, user: loggedInUser } = useAuth();

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/users`, config);
            setUsers(data);
        } catch (error) {
            message.error('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchUsers();
        }
    }, [token]);

    const handleMakeAdmin = async (id) => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.put(`${process.env.REACT_APP_API_URL}/api/users/${id}/make-admin`, {}, config);
            message.success('User is now an admin');
            fetchUsers();
        } catch (error) {
            message.error('Failed to make user an admin');
        }
    };

    const handleDelete = async (id) => {
         if (id === loggedInUser.id) {
            message.error("You cannot delete your own admin account.");
            return;
        }
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.delete(`${process.env.REACT_APP_API_URL}/api/users/${id}`, config);
            message.success('User deleted successfully');
            fetchUsers();
        } catch (error) {
            message.error(error.response?.data?.message || 'Failed to delete user');
        }
    };

    return (
        <div>
            <Title level={2}>Admin Dashboard</Title>
            <AdminNav /> {/* <-- USE THE NEW COMPONENT */}
            <Title level={4}>Manage Users</Title>
            
            {loading && users.length === 0 ? <div style={{textAlign: 'center', marginTop: 50}}><Spin size="large"/></div> : (
                <List
                    grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 2, xl: 3 }}
                    dataSource={users}
                    renderItem={(user) => (
                        <List.Item>
                            <Card title={user.username}>
                                <p>
                                    <Text strong>ID: </Text>
                                    <Tooltip title={user._id}>
                                        <span>...{user._id.substring(user._id.length - 6)}</span>
                                    </Tooltip>
                                </p>
                                <p><Text strong>Email:</Text> {user.email}</p>
                                <p>
                                    <Text strong>Admin:</Text> {user.isAdmin 
                                        ? <Tag icon={<CheckCircleOutlined />} color="success">Yes</Tag> 
                                        : <Tag icon={<CloseCircleOutlined />} color="default">No</Tag>}
                                </p>
                                <Space style={{ marginTop: 16, width: '100%', justifyContent: 'flex-end' }}>
                                    {!user.isAdmin && (
                                        <Button onClick={() => handleMakeAdmin(user._id)}>
                                            Make Admin
                                        </Button>
                                    )}
                                    <Popconfirm title="Are you sure?" onConfirm={() => handleDelete(user._id)}>
                                        <Button danger>Delete</Button>
                                    </Popconfirm>
                                </Space>
                            </Card>
                        </List.Item>
                    )}
                />
            )}
        </div>
    );
};

export default AdminUserList;