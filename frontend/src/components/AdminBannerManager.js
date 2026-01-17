// frontend/src/components/AdminBannerManager.js
import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, message, Space, Popconfirm, Typography, Upload, Switch, Select, ColorPicker, Spin } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, GiftOutlined, PercentageOutlined, CarOutlined, StarOutlined, HeartOutlined, TagOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import axios from 'axios';
import AdminNav from './AdminNav';
import './AdminBannerManager.css';

const { Title, Text } = Typography;
const { TextArea } = Input;

const iconOptions = [
    { value: 'gift', label: 'Gift', icon: <GiftOutlined /> },
    { value: 'percent', label: 'Percent', icon: <PercentageOutlined /> },
    { value: 'truck', label: 'Delivery', icon: <CarOutlined /> },
    { value: 'star', label: 'Star', icon: <StarOutlined /> },
    { value: 'heart', label: 'Heart', icon: <HeartOutlined /> },
    { value: 'tag', label: 'Tag', icon: <TagOutlined /> },
    { value: 'none', label: 'No Icon', icon: null },
];

const getIconComponent = (iconType) => {
    const iconMap = {
        gift: <GiftOutlined style={{ fontSize: '24px' }} />,
        percent: <PercentageOutlined style={{ fontSize: '24px' }} />,
        truck: <CarOutlined style={{ fontSize: '24px' }} />,
        star: <StarOutlined style={{ fontSize: '24px' }} />,
        heart: <HeartOutlined style={{ fontSize: '24px' }} />,
        tag: <TagOutlined style={{ fontSize: '24px' }} />,
    };
    return iconMap[iconType] || null;
};

const AdminBannerManager = () => {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingBanner, setEditingBanner] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [backgroundColor, setBackgroundColor] = useState('#10b981');
    const [textColor, setTextColor] = useState('#ffffff');
    const [form] = Form.useForm();

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/banners/admin`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBanners(data);
        } catch (error) {
            message.error('Failed to fetch banners');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const showModal = (banner = null) => {
        setEditingBanner(banner);
        if (banner) {
            form.setFieldsValue({
                title: banner.title,
                subtitle: banner.subtitle,
                icon: banner.icon,
                link: banner.link,
                order: banner.order,
                isActive: banner.isActive
            });
            setBackgroundColor(banner.backgroundColor || '#10b981');
            setTextColor(banner.textColor || '#ffffff');
            setImagePreview(banner.image || null);
            setImageFile(null);
        } else {
            form.resetFields();
            form.setFieldsValue({
                icon: 'gift',
                isActive: true,
                order: banners.length
            });
            setBackgroundColor('#10b981');
            setTextColor('#ffffff');
            setImagePreview(null);
            setImageFile(null);
        }
        setIsModalVisible(true);
    };

    const handleModalClose = () => {
        setIsModalVisible(false);
        setEditingBanner(null);
        setImagePreview(null);
        setImageFile(null);
        form.resetFields();
    };

    const handleImageChange = (info) => {
        const file = info.file.originFileObj || info.file;
        if (file) {
            setImageFile(file);
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

            formData.append('title', values.title);
            formData.append('subtitle', values.subtitle);
            formData.append('backgroundColor', typeof backgroundColor === 'string' ? backgroundColor : backgroundColor.toHexString());
            formData.append('textColor', typeof textColor === 'string' ? textColor : textColor.toHexString());
            formData.append('icon', values.icon || 'gift');
            formData.append('link', values.link || '');
            formData.append('order', values.order || 0);
            formData.append('isActive', values.isActive !== undefined ? values.isActive : true);

            if (imageFile) {
                formData.append('image', imageFile);
            }

            if (editingBanner) {
                await axios.put(
                    `${process.env.REACT_APP_API_URL}/api/banners/${editingBanner._id}`,
                    formData,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'multipart/form-data'
                        }
                    }
                );
                message.success('Banner updated successfully');
            } else {
                await axios.post(
                    `${process.env.REACT_APP_API_URL}/api/banners`,
                    formData,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'multipart/form-data'
                        }
                    }
                );
                message.success('Banner created successfully');
            }

            fetchBanners();
            handleModalClose();
        } catch (error) {
            message.error(error.response?.data?.message || 'Failed to save banner');
            console.error(error);
        }
    };

    const handleDelete = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${process.env.REACT_APP_API_URL}/api/banners/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            message.success('Banner deleted successfully');
            fetchBanners();
        } catch (error) {
            message.error('Failed to delete banner');
            console.error(error);
        }
    };

    const handleToggleActive = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`${process.env.REACT_APP_API_URL}/api/banners/${id}/toggle`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            message.success('Banner status updated');
            fetchBanners();
        } catch (error) {
            message.error('Failed to update banner status');
            console.error(error);
        }
    };

    // Preview component
    const BannerPreview = () => {
        const title = form.getFieldValue('title') || 'Banner Title';
        const subtitle = form.getFieldValue('subtitle') || 'Banner subtitle text';
        const icon = form.getFieldValue('icon') || 'gift';
        const bgColor = typeof backgroundColor === 'string' ? backgroundColor : backgroundColor?.toHexString() || '#10b981';
        const txtColor = typeof textColor === 'string' ? textColor : textColor?.toHexString() || '#ffffff';

        return (
            <div
                className="banner-preview"
                style={{
                    background: imagePreview ? `url(${imagePreview}) center/cover` : `linear-gradient(135deg, ${bgColor} 0%, ${bgColor}dd 100%)`,
                    borderRadius: '12px',
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '20px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    color: txtColor,
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                {imagePreview && (
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'rgba(0,0,0,0.3)',
                        borderRadius: '12px'
                    }} />
                )}
                <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
                    <div style={{ fontSize: '24px', fontWeight: '700', marginBottom: '4px', color: txtColor }}>
                        {title}
                    </div>
                    <div style={{ fontSize: '13px', opacity: 0.95, fontWeight: '400', color: txtColor }}>
                        {subtitle}
                    </div>
                </div>
                {icon !== 'none' && (
                    <div style={{
                        width: '48px',
                        height: '48px',
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        zIndex: 1,
                        color: txtColor
                    }}>
                        {getIconComponent(icon)}
                    </div>
                )}
            </div>
        );
    };

    const columns = [
        {
            title: 'Preview',
            key: 'preview',
            width: 250,
            render: (_, record) => (
                <div
                    style={{
                        background: record.image ? `url(${record.image}) center/cover` : `linear-gradient(135deg, ${record.backgroundColor} 0%, ${record.backgroundColor}dd 100%)`,
                        borderRadius: '8px',
                        padding: '10px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        color: record.textColor,
                        minWidth: '200px',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    {record.image && (
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'rgba(0,0,0,0.3)',
                            borderRadius: '8px'
                        }} />
                    )}
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ fontSize: '14px', fontWeight: '700' }}>{record.title}</div>
                        <div style={{ fontSize: '10px', opacity: 0.9 }}>{record.subtitle}</div>
                    </div>
                    {record.icon !== 'none' && (
                        <div style={{
                            width: '28px',
                            height: '28px',
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative',
                            zIndex: 1,
                            fontSize: '14px'
                        }}>
                            {getIconComponent(record.icon)}
                        </div>
                    )}
                </div>
            ),
        },
        {
            title: 'Order',
            dataIndex: 'order',
            key: 'order',
            width: 80,
        },
        {
            title: 'Status',
            dataIndex: 'isActive',
            key: 'isActive',
            width: 100,
            render: (isActive, record) => (
                <Switch
                    checked={isActive}
                    onChange={() => handleToggleActive(record._id)}
                    checkedChildren={<EyeOutlined />}
                    unCheckedChildren={<EyeInvisibleOutlined />}
                />
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 150,
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
                        title="Delete Banner"
                        description="Are you sure you want to delete this banner?"
                        onConfirm={() => handleDelete(record._id)}
                        okText="Yes"
                        cancelText="No"
                        okButtonProps={{ danger: true }}
                    >
                        <Button icon={<DeleteOutlined />} danger size="small">
                            Delete
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div className="admin-banner-page">
            <Title level={2}>Admin Dashboard</Title>
            <AdminNav />

            <div className="admin-banner-container">
                <div className="admin-banner-header">
                    <div className="admin-banner-header-text">
                        <Title level={4} style={{ margin: 0 }}>Banner Management</Title>
                        <Text type="secondary">Manage promotional banners for your store</Text>
                    </div>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => showModal()}
                        size="large"
                        className="admin-banner-create-btn"
                    >
                        Create Banner
                    </Button>
                </div>

                <div className="admin-banner-table-wrapper">
                    {/* Desktop Table View */}
                    <div className="admin-banner-desktop-table">
                        <Table
                            columns={columns}
                            dataSource={banners}
                            rowKey="_id"
                            loading={loading}
                            pagination={{ pageSize: 10 }}
                        />
                    </div>

                    {/* Mobile Card View */}
                    <div className="banner-mobile-cards">
                        {loading ? (
                            <div className="banner-mobile-loading">
                                <Spin size="large" />
                            </div>
                        ) : banners.length === 0 ? (
                            <div className="banner-mobile-empty">
                                <Text type="secondary">No banners found. Create your first banner!</Text>
                            </div>
                        ) : (
                            banners.map((banner) => (
                                <div key={banner._id} className="banner-card-item">
                                    {/* Banner Preview */}
                                    <div
                                        className="banner-card-preview"
                                        style={{
                                            background: banner.image ? `url(${banner.image}) center/cover` : `linear-gradient(135deg, ${banner.backgroundColor} 0%, ${banner.backgroundColor}dd 100%)`,
                                            color: banner.textColor,
                                        }}
                                    >
                                        {banner.image && <div className="banner-card-overlay" />}
                                        <div className="banner-card-content">
                                            <div className="banner-card-title">{banner.title}</div>
                                            <div className="banner-card-subtitle">{banner.subtitle}</div>
                                        </div>
                                        {banner.icon !== 'none' && (
                                            <div className="banner-card-icon">
                                                {getIconComponent(banner.icon)}
                                            </div>
                                        )}
                                    </div>

                                    {/* Banner Info & Actions */}
                                    <div className="banner-card-footer">
                                        <div className="banner-card-meta">
                                            <span className="banner-card-order">Order: {banner.order}</span>
                                            <Switch
                                                size="small"
                                                checked={banner.isActive}
                                                onChange={() => handleToggleActive(banner._id)}
                                            />
                                        </div>
                                        <div className="banner-card-actions">
                                            <Button
                                                type="primary"
                                                ghost
                                                size="small"
                                                className="banner-action-btn"
                                                onClick={() => showModal(banner)}
                                            >
                                                <EditOutlined />
                                            </Button>
                                            <Popconfirm
                                                title="Delete Banner"
                                                description="Are you sure?"
                                                onConfirm={() => handleDelete(banner._id)}
                                                okText="Yes"
                                                cancelText="No"
                                                okButtonProps={{ danger: true }}
                                            >
                                                <Button
                                                    danger
                                                    size="small"
                                                    className="banner-action-btn"
                                                >
                                                    <DeleteOutlined />
                                                </Button>
                                            </Popconfirm>
                                        </div>
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
                        {editingBanner ? 'Edit Banner' : 'Create New Banner'}
                    </div>
                }
                open={isModalVisible}
                onCancel={handleModalClose}
                footer={null}
                width={650}
                className="banner-modal"
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    style={{ marginTop: '20px' }}
                    onValuesChange={() => {
                        // Force re-render for preview
                        setBackgroundColor(backgroundColor);
                    }}
                >
                    {/* Live Preview */}
                    <div style={{ marginBottom: '20px' }}>
                        <Text strong style={{ display: 'block', marginBottom: '8px' }}>Live Preview</Text>
                        <BannerPreview />
                    </div>

                    <Form.Item
                        name="title"
                        label={<span style={{ fontWeight: '600' }}>Banner Title</span>}
                        rules={[{ required: true, message: 'Please enter banner title' }]}
                    >
                        <Input placeholder="e.g., 30% OFF" size="large" />
                    </Form.Item>

                    <Form.Item
                        name="subtitle"
                        label={<span style={{ fontWeight: '600' }}>Banner Subtitle</span>}
                        rules={[{ required: true, message: 'Please enter banner subtitle' }]}
                    >
                        <TextArea rows={2} placeholder="e.g., Fresh groceries, big savings daily" size="large" />
                    </Form.Item>

                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                        <Form.Item
                            label={<span style={{ fontWeight: '600' }}>Background Color</span>}
                            style={{ flex: 1, minWidth: '140px' }}
                        >
                            <ColorPicker
                                value={backgroundColor}
                                onChange={setBackgroundColor}
                                showText
                            />
                        </Form.Item>

                        <Form.Item
                            label={<span style={{ fontWeight: '600' }}>Text Color</span>}
                            style={{ flex: 1, minWidth: '140px' }}
                        >
                            <ColorPicker
                                value={textColor}
                                onChange={setTextColor}
                                showText
                            />
                        </Form.Item>

                        <Form.Item
                            name="icon"
                            label={<span style={{ fontWeight: '600' }}>Icon</span>}
                            style={{ flex: 1, minWidth: '140px' }}
                        >
                            <Select
                                placeholder="Select icon"
                                options={iconOptions.map(opt => ({
                                    value: opt.value,
                                    label: (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            {opt.icon} {opt.label}
                                        </span>
                                    )
                                }))}
                            />
                        </Form.Item>
                    </div>

                    <Form.Item
                        label={<span style={{ fontWeight: '600' }}>Banner Image (Optional - overrides background color)</span>}
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
                                    alt="banner"
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
                                size="small"
                                onClick={() => {
                                    setImagePreview(null);
                                    setImageFile(null);
                                }}
                                style={{ marginTop: '8px' }}
                            >
                                Remove Image
                            </Button>
                        )}
                    </Form.Item>

                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                        <Form.Item
                            name="link"
                            label={<span style={{ fontWeight: '600' }}>Link URL (Optional)</span>}
                            style={{ flex: 2, minWidth: '200px' }}
                        >
                            <Input placeholder="e.g., /category/fruits" size="large" />
                        </Form.Item>

                        <Form.Item
                            name="order"
                            label={<span style={{ fontWeight: '600' }}>Display Order</span>}
                            style={{ flex: 1, minWidth: '100px' }}
                        >
                            <Input type="number" placeholder="0" size="large" />
                        </Form.Item>
                    </div>

                    <Form.Item
                        name="isActive"
                        label={<span style={{ fontWeight: '600' }}>Active Status</span>}
                        valuePropName="checked"
                    >
                        <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0, marginTop: '24px' }}>
                        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                            <Button onClick={handleModalClose} size="large">
                                Cancel
                            </Button>
                            <Button type="primary" htmlType="submit" size="large">
                                {editingBanner ? 'Update Banner' : 'Create Banner'}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default AdminBannerManager;
