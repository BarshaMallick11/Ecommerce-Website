// frontend/src/components/AdminCategoryManager.js
import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, message, Space, Popconfirm, Typography, Upload, Spin } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import axios from 'axios';
import AdminNav from './AdminNav';
import './AdminCategoryManager.css';

const { Title, Text } = Typography;

const AdminCategoryManager = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/categories`);
            setCategories(data);
        } catch (error) {
            message.error('Failed to fetch categories');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const showModal = (category = null) => {
        setEditingCategory(category);
        if (category) {
            form.setFieldsValue({
                name: category.name,
                slug: category.slug,
                description: category.description
            });
            setImagePreview(category.image);
            setImageFile(null);
        } else {
            form.resetFields();
            setImagePreview(null);
            setImageFile(null);
        }
        setIsModalVisible(true);
    };

    const handleModalClose = () => {
        setIsModalVisible(false);
        setEditingCategory(null);
        setImagePreview(null);
        setImageFile(null);
        form.resetFields();
    };

    const handleImageChange = (info) => {
        const file = info.file.originFileObj || info.file;

        if (file) {
            setImageFile(file);

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (values) => {
        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();

            formData.append('name', values.name);
            formData.append('slug', values.slug);
            if (values.description) {
                formData.append('description', values.description);
            }

            // Add image file if uploaded
            if (imageFile) {
                formData.append('image', imageFile);
            }

            if (editingCategory) {
                // Update existing category
                await axios.put(
                    `${process.env.REACT_APP_API_URL}/api/categories/${editingCategory._id}`,
                    formData,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'multipart/form-data'
                        }
                    }
                );
                message.success('Category updated successfully');
            } else {
                // Create new category
                if (!imageFile) {
                    message.error('Please upload a category image');
                    return;
                }

                await axios.post(
                    `${process.env.REACT_APP_API_URL}/api/categories`,
                    formData,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'multipart/form-data'
                        }
                    }
                );
                message.success('Category created successfully');
            }

            fetchCategories();
            handleModalClose();
        } catch (error) {
            message.error(error.response?.data?.message || 'Failed to save category');
            console.error(error);
        }
    };

    const handleDelete = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${process.env.REACT_APP_API_URL}/api/categories/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            message.success('Category deleted successfully');
            fetchCategories();
        } catch (error) {
            message.error('Failed to delete category');
            console.error(error);
        }
    };

    // Auto-generate slug from name
    const handleNameChange = (e) => {
        const name = e.target.value;
        const slug = name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
        form.setFieldsValue({ slug });
    };

    const columns = [
        {
            title: 'Image',
            dataIndex: 'image',
            key: 'image',
            render: (image) => (
                <img
                    src={image}
                    alt="category"
                    style={{
                        width: '60px',
                        height: '60px',
                        objectFit: 'cover',
                        borderRadius: '50%',
                        border: '2px solid #e8e8e8'
                    }}
                />
            ),
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (text) => <Text strong>{text}</Text>,
        },
        {
            title: 'Slug',
            dataIndex: 'slug',
            key: 'slug',
            render: (text) => <Text code>{text}</Text>,
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
        },
        {
            title: 'Status',
            dataIndex: 'isActive',
            key: 'isActive',
            render: (isActive) => (
                <span style={{
                    color: isActive ? '#52c41a' : '#ff4d4f',
                    fontWeight: '600'
                }}>
                    {isActive ? '● Active' : '○ Inactive'}
                </span>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button
                        icon={<EditOutlined />}
                        onClick={() => showModal(record)}
                        size="small"
                        type="primary"
                        ghost
                    >
                        Edit
                    </Button>
                    <Popconfirm
                        title="Delete Category"
                        description="Are you sure you want to delete this category?"
                        onConfirm={() => handleDelete(record._id)}
                        okText="Yes"
                        cancelText="No"
                        okButtonProps={{ danger: true }}
                    >
                        <Button
                            icon={<DeleteOutlined />}
                            danger
                            size="small"
                        >
                            Delete
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div className="admin-category-page">
            {/* Admin Navigation - Same as other admin pages */}
            <Title level={2}>Admin Dashboard</Title>
            <AdminNav />

            {/* Category Management Content */}
            <div className="admin-category-container">
                {/* Header Section */}
                <div className="admin-category-header">
                    <div className="admin-category-header-text">
                        <Title level={4} style={{ margin: 0 }}>Category Management</Title>
                        <Text type="secondary">Manage product categories for your store</Text>
                    </div>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => showModal()}
                        size="large"
                        className="admin-category-create-btn"
                    >
                        Create Category
                    </Button>
                </div>

                {/* Table Wrapper - Contains both Desktop Table and Mobile Cards */}
                <div className="admin-category-table-wrapper">
                    {/* Desktop Table View */}
                    <div className="admin-category-desktop-table">
                        <Table
                            columns={columns}
                            dataSource={categories}
                            rowKey="_id"
                            loading={loading}
                            pagination={{ pageSize: 10 }}
                        />
                    </div>

                    {/* Mobile Card View */}
                    <div className="category-mobile-cards">
                        {loading ? (
                            <div className="category-mobile-loading">
                                <Spin size="large" />
                            </div>
                        ) : categories.length === 0 ? (
                            <div className="category-mobile-empty">
                                <Text type="secondary">No categories found</Text>
                            </div>
                        ) : (
                            categories.map((category) => (
                                <div key={category._id} className="category-card-item">
                                    {/* Category Image */}
                                    <img
                                        src={category.image}
                                        alt={category.name}
                                        className="category-card-image"
                                    />

                                    {/* Category Info */}
                                    <div className="category-card-info">
                                        <span className="category-card-name">{category.name}</span>
                                        <span className="category-card-slug">{category.slug}</span>
                                        <span
                                            className="category-card-status"
                                            style={{ color: category.isActive ? '#52c41a' : '#ff4d4f' }}
                                        >
                                            {category.isActive ? '● Active' : '○ Inactive'}
                                        </span>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="category-card-actions">
                                        <Button
                                            type="primary"
                                            ghost
                                            className="category-action-btn category-edit-btn"
                                            onClick={() => showModal(category)}
                                            aria-label="Edit category"
                                        >
                                            <EditOutlined />
                                        </Button>
                                        <Popconfirm
                                            title="Delete Category"
                                            description="Are you sure you want to delete this category?"
                                            onConfirm={() => handleDelete(category._id)}
                                            okText="Yes"
                                            cancelText="No"
                                            okButtonProps={{ danger: true }}
                                        >
                                            <Button
                                                danger
                                                className="category-action-btn category-delete-btn"
                                                aria-label="Delete category"
                                            >
                                                <DeleteOutlined />
                                            </Button>
                                        </Popconfirm>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <Modal
                title={
                    <div style={{ fontSize: '18px', fontWeight: '600' }}>
                        {editingCategory ? 'Edit Category' : 'Create New Category'}
                    </div>
                }
                open={isModalVisible}
                onCancel={handleModalClose}
                footer={null}
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    style={{ marginTop: '20px' }}
                >
                    {/* Image Upload */}
                    <Form.Item
                        label={<span style={{ fontWeight: '600' }}>Category Image</span>}
                        required
                    >
                        <Upload
                            listType="picture-card"
                            maxCount={1}
                            beforeUpload={() => false}
                            onChange={handleImageChange}
                            showUploadList={false}
                        >
                            {imagePreview ? (
                                <img
                                    src={imagePreview}
                                    alt="category"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            ) : (
                                <div>
                                    <PlusOutlined />
                                    <div style={{ marginTop: 8 }}>Upload</div>
                                </div>
                            )}
                        </Upload>
                        {imagePreview && (
                            <Button
                                type="text"
                                danger
                                icon={<DeleteOutlined />}
                                onClick={() => {
                                    setImagePreview(null);
                                    setImageFile(null);
                                }}
                                style={{
                                    marginTop: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            />
                        )}
                    </Form.Item>

                    <Form.Item
                        name="name"
                        label={<span style={{ fontWeight: '600' }}>Category Name</span>}
                        rules={[{ required: true, message: 'Please enter category name' }]}
                    >
                        <Input
                            placeholder="e.g., Fruits, Vegetables, Dairy"
                            size="large"
                            onChange={handleNameChange}
                        />
                    </Form.Item>

                    <Form.Item
                        name="slug"
                        label={<span style={{ fontWeight: '600' }}>Slug (URL-friendly)</span>}
                        rules={[{ required: true, message: 'Please enter slug' }]}
                        extra="Auto-generated from name. Used in URLs like /products/fruits"
                    >
                        <Input placeholder="e.g., fruits, vegetables" size="large" />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label={<span style={{ fontWeight: '600' }}>Description</span>}
                    >
                        <Input.TextArea
                            rows={3}
                            placeholder="Brief description of this category (optional)"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0, marginTop: '24px' }}>
                        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                            <Button onClick={handleModalClose} size="large">
                                Cancel
                            </Button>
                            <Button type="primary" htmlType="submit" size="large">
                                {editingCategory ? 'Update Category' : 'Create Category'}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default AdminCategoryManager;
