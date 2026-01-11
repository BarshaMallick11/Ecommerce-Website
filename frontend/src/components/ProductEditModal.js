// frontend/src/components/ProductEditModal.js
import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, InputNumber, Upload, message, Typography, Divider, Space, Image } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const ProductEditModal = ({ visible, onCancel, onFinish, initialValues }) => {
    const [form] = Form.useForm();
    const [mainImageFile, setMainImageFile] = useState(null);
    const [mainImagePreview, setMainImagePreview] = useState(null);
    const [additionalImages, setAdditionalImages] = useState([]); // Array of {file, preview}
    const [existingImages, setExistingImages] = useState([]); // Existing image URLs

    useEffect(() => {
        if (initialValues) {
            form.setFieldsValue(initialValues);
            // Set main image preview
            setMainImagePreview(initialValues.image);
            setMainImageFile(null);

            // Set additional images from product.images array
            if (initialValues.images && initialValues.images.length > 0) {
                setExistingImages(initialValues.images);
            } else {
                setExistingImages([]);
            }
            setAdditionalImages([]);
        } else {
            form.resetFields();
            setMainImagePreview(null);
            setMainImageFile(null);
            setAdditionalImages([]);
            setExistingImages([]);
        }
    }, [initialValues, form, visible]);

    const handleMainImageChange = (info) => {
        const file = info.file.originFileObj || info.file;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            message.error('You can only upload image files!');
            return;
        }

        // Validate file size (5MB)
        if (file.size / 1024 / 1024 > 5) {
            message.error('Image must be smaller than 5MB!');
            return;
        }

        setMainImageFile(file);

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
            setMainImagePreview(e.target.result);
        };
        reader.readAsDataURL(file);
    };

    const handleAdditionalImageChange = (info) => {
        const file = info.file.originFileObj || info.file;

        // Check total count (existing + new + current file)
        const totalCount = existingImages.length + additionalImages.length + 1;
        if (totalCount > 5) {
            message.error('Maximum 5 additional images allowed!');
            return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            message.error('You can only upload image files!');
            return;
        }

        // Validate file size (5MB)
        if (file.size / 1024 / 1024 > 5) {
            message.error('Image must be smaller than 5MB!');
            return;
        }

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
            setAdditionalImages(prev => [...prev, { file, preview: e.target.result }]);
        };
        reader.readAsDataURL(file);
    };

    const removeAdditionalImage = (index) => {
        setAdditionalImages(prev => prev.filter((_, i) => i !== index));
    };

    const removeExistingImage = (index) => {
        setExistingImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = () => {
        form.validateFields()
            .then(values => {
                // Pass form values, main image file, additional image files, and existing images
                onFinish({
                    ...values,
                    mainImageFile,
                    additionalImageFiles: additionalImages.map(img => img.file),
                    existingImages // URLs of existing images to keep
                });
                form.resetFields();
                setMainImageFile(null);
                setMainImagePreview(null);
                setAdditionalImages([]);
                setExistingImages([]);
            })
            .catch(info => {
                console.log('Validate Failed:', info);
            });
    };

    const uploadButton = (
        <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>Upload</div>
        </div>
    );

    return (
        <Modal
            open={visible}
            title={initialValues ? 'Edit Product' : 'Add New Product'}
            okText={initialValues ? 'Update' : 'Create'}
            cancelText="Cancel"
            width={700}
            onCancel={() => {
                onCancel();
                setMainImageFile(null);
                setMainImagePreview(null);
                setAdditionalImages([]);
                setExistingImages([]);
            }}
            onOk={handleSubmit}
        >
            <Form form={form} layout="vertical" name="product_form">
                <Form.Item
                    name="name"
                    label="Product Name"
                    rules={[{ required: true, message: 'Please input the name of the product!' }]}
                >
                    <Input size="large" />
                </Form.Item>

                <Form.Item
                    name="description"
                    label="Description"
                    rules={[{ required: true, message: 'Please input the description!' }]}
                >
                    <Input.TextArea rows={4} />
                </Form.Item>

                <Form.Item
                    name="price"
                    label="Price"
                    rules={[{ required: true, message: 'Please input the price!' }]}
                >
                    <InputNumber min={0} style={{ width: '100%' }} size="large" />
                </Form.Item>

                <Divider />

                <Title level={5}>Product Images</Title>
                <Text type="secondary">Upload up to 5 high-quality images. The main image will be displayed in product listings.</Text>

                {/* Main Image */}
                <Form.Item
                    label="Main Product Image"
                    style={{ marginTop: 16 }}
                    required
                    rules={[{
                        required: !initialValues && !mainImageFile,
                        message: 'Please upload a main product image!'
                    }]}
                >
                    <Upload
                        listType="picture-card"
                        showUploadList={false}
                        beforeUpload={() => false}
                        onChange={handleMainImageChange}
                        accept="image/*"
                    >
                        {mainImagePreview ? (
                            <img
                                src={mainImagePreview}
                                alt="main product"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        ) : (
                            uploadButton
                        )}
                    </Upload>
                    {mainImagePreview && (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            {mainImageFile ? 'New main image selected' : 'Current main image (click to change)'}
                        </Text>
                    )}
                </Form.Item>

                {/* Additional Images */}
                <Form.Item label={`Additional Images (${existingImages.length + additionalImages.length}/5)`}>
                    <Space wrap size={[8, 8]}>
                        {/* Existing Images */}
                        {existingImages.map((imgUrl, index) => (
                            <div key={`existing-${index}`} style={{ position: 'relative' }}>
                                <Image
                                    src={imgUrl}
                                    alt={`existing-${index}`}
                                    width={104}
                                    height={104}
                                    style={{ objectFit: 'cover', borderRadius: 8 }}
                                />
                                <DeleteOutlined
                                    onClick={() => removeExistingImage(index)}
                                    style={{
                                        position: 'absolute',
                                        top: 4,
                                        right: 4,
                                        background: 'rgba(255,255,255,0.9)',
                                        padding: 4,
                                        borderRadius: '50%',
                                        cursor: 'pointer',
                                        color: '#ff4d4f'
                                    }}
                                />
                            </div>
                        ))}

                        {/* New Images */}
                        {additionalImages.map((imgObj, index) => (
                            <div key={`new-${index}`} style={{ position: 'relative' }}>
                                <img
                                    src={imgObj.preview}
                                    alt={`additional-${index}`}
                                    style={{
                                        width: 104,
                                        height: 104,
                                        objectFit: 'cover',
                                        borderRadius: 8,
                                        border: '2px solid #52c41a'
                                    }}
                                />
                                <DeleteOutlined
                                    onClick={() => removeAdditionalImage(index)}
                                    style={{
                                        position: 'absolute',
                                        top: 4,
                                        right: 4,
                                        background: 'rgba(255,255,255,0.9)',
                                        padding: 4,
                                        borderRadius: '50%',
                                        cursor: 'pointer',
                                        color: '#ff4d4f'
                                    }}
                                />
                            </div>
                        ))}

                        {/* Upload Button */}
                        {(existingImages.length + additionalImages.length) < 5 && (
                            <Upload
                                listType="picture-card"
                                showUploadList={false}
                                beforeUpload={() => false}
                                onChange={handleAdditionalImageChange}
                                accept="image/*"
                            >
                                {uploadButton}
                            </Upload>
                        )}
                    </Space>
                    <div style={{ marginTop: 8 }}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            Click + to add more images (max 5 total). These will appear in the product details page.
                        </Text>
                    </div>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ProductEditModal;
