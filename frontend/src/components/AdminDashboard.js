// frontend/src/components/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Typography, message, Popconfirm } from 'antd';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import ProductEditModal from './ProductEditModal';
import AdminNav from './AdminNav';

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
            const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/products`);
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
            await axios.delete(`${process.env.REACT_APP_API_URL}/products/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            message.success('Product deleted successfully');
            fetchProducts();
        } catch (error) {
            message.error('Failed to delete product');
        }
    };

    const handleModalFinish = async (values) => {
        console.log('=== Form Submit ===');
        console.log('Values received:', values);

        const config = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };

        try {
            // Create FormData object
            const formData = new FormData();
            formData.append('name', values.name);
            formData.append('description', values.description);
            formData.append('price', values.price);

            // Add main image file if present
            if (values.mainImageFile) {
                formData.append('image', values.mainImageFile);
                console.log('Main image appended to FormData');
            }

            // Add additional image files
            if (values.additionalImageFiles && values.additionalImageFiles.length > 0) {
                values.additionalImageFiles.forEach((file, index) => {
                    formData.append('additionalImages', file);
                    console.log(`Additional image ${index + 1} appended`);
                });
            }

            // Add existing images array (for updates - to keep existing images)
            if (values.existingImages && values.existingImages.length > 0) {
                formData.append('existingImages', JSON.stringify(values.existingImages));
                console.log('Existing images:', values.existingImages);
            }

            // Log FormData contents
            console.log('FormData entries:');
            for (let pair of formData.entries()) {
                console.log(pair[0], pair[1]);
            }

            if (editingProduct) {
                console.log('Updating product:', editingProduct._id);
                await axios.put(`${process.env.REACT_APP_API_URL}/products/${editingProduct._id}`, formData, config);
                message.success('Product updated successfully');
            } else {
                // For new products, main image is required
                if (!values.mainImageFile) {
                    message.error('Please upload a main product image');
                    return;
                }
                console.log('Creating new product...');
                await axios.post(`${process.env.REACT_APP_API_URL}/products`, formData, config);
                message.success('Product added successfully');
            }
            setIsModalVisible(false);
            setEditingProduct(null);
            fetchProducts();
        } catch (error) {
            console.error('Error saving product:', error);
            console.error('Error response:', error.response);
            message.error(error.response?.data?.message || 'Failed to save product');
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
            <AdminNav />

            <div style={{ marginTop: '24px' }}>
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
        </div>
    );
};

export default AdminDashboard;
