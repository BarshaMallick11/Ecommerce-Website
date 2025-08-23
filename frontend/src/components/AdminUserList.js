// frontend/src/components/AdminUserList.js
import React, { useState, useEffect } from 'react';
import { Table, Button, Typography, message, Tag, Popconfirm , Space} from 'antd';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

const { Title } = Typography;

const AdminUserList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const { token } = useAuth();

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get('http://localhost:5000/api/users', config);
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
            await axios.put(`http://localhost:5000/api/users/${id}/make-admin`, {}, config);
            message.success('User is now an admin');
            fetchUsers();
        } catch (error) {
            message.error('Failed to make user an admin');
        }
    };

    const handleDelete = async (id) => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.delete(`http://localhost:5000/api/users/${id}`, config);
            message.success('User deleted successfully');
            fetchUsers();
        } catch (error) {
            message.error(error.response.data.message || 'Failed to delete user');
        }
    };

    const columns = [
        { title: 'ID', dataIndex: '_id', key: 'id', ellipsis: true },
        { title: 'Username', dataIndex: 'username', key: 'username' },
        { title: 'Email', dataIndex: 'email', key: 'email' },
        { 
            title: 'Admin', 
            dataIndex: 'isAdmin', 
            key: 'admin', 
            render: isAdmin => (
                isAdmin ? <CheckCircleOutlined style={{ color: 'green' }} /> : <CloseCircleOutlined style={{ color: 'red' }} />
            )
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Space>
                    {!record.isAdmin && (
                        <Button onClick={() => handleMakeAdmin(record._id)}>
                            Make Admin
                        </Button>
                    )}
                    <Popconfirm title="Are you sure to delete this user?" onConfirm={() => handleDelete(record._id)}>
                        <Button danger>Delete</Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <Title level={2}>Manage Users</Title>
            <Table columns={columns} dataSource={users} rowKey="_id" loading={loading} />
        </div>
    );
};

export default AdminUserList;