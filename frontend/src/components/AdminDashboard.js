// frontend/src/components/AdminDashboard.js

import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Typography, message, Popconfirm } from 'antd';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import ProductEditModal from './ProductEditModal';
import AdminNav from './AdminNav'; // <-- IMPORT THE NEW COMPONENT

const { Title } = Typography;

const AdminDashboard = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const { token } = useAuth();

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get('http://localhost:5000/products');
            setProducts(data);
        } catch (error) {
            message.error('Failed to fetch products');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/products/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            message.success('Product deleted successfully');
            fetchProducts();
        } catch (error) {
            message.error('Failed to delete product');
        }
    };

    const handleModalFinish = async (values) => {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        try {
            if (editingProduct) {
                await axios.put(`http://localhost:5000/products/${editingProduct._id}`, values, config);
                message.success('Product updated successfully');
            } else {
                await axios.post('http://localhost:5000/products', values, config);
                message.success('Product added successfully');
            }
            setIsModalVisible(false);
            setEditingProduct(null);
            fetchProducts();
        } catch (error) {
            message.error('Failed to save product');
        }
    };

    const columns = [
        { title: 'Name', dataIndex: 'name', key: 'name' },
        { title: 'Price', dataIndex: 'price', key: 'price', render: (price) => `₹${price.toFixed(2)}` },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button onClick={() => { setEditingProduct(record); setIsModalVisible(true); }}>Edit</Button>
                    <Popconfirm title="Are you sure?" onConfirm={() => handleDelete(record._id)} okText="Yes" cancelText="No">
                        <Button danger>Delete</Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <Title level={2}>Admin Dashboard</Title>
            <AdminNav /> {/* <-- USE THE NEW COMPONENT */}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <Title level={4} style={{ margin: 0 }}>All Products</Title>
                <Button type="primary" onClick={() => { setEditingProduct(null); setIsModalVisible(true); }}>
                    Add Product
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={products}
                rowKey="_id"
                loading={loading}
                scroll={{ x: true }}
            />

            <ProductEditModal
                visible={isModalVisible}
                onCancel={() => { setIsModalVisible(false); setEditingProduct(null); }}
                onFinish={handleModalFinish}
                initialValues={editingProduct}
            />
        </div>
    );
};

export default AdminDashboard;