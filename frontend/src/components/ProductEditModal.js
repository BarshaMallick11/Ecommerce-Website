// frontend/src/components/ProductEditModal.js
import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, InputNumber, Upload, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const ProductEditModal = ({ visible, onCancel, onFinish, initialValues }) => {
    const [form] = Form.useForm();
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        if (initialValues) {
            form.setFieldsValue(initialValues);
            // Set preview to existing image URL when editing
            setImagePreview(initialValues.image);
            setImageFile(null);
        } else {
            form.resetFields();
            setImagePreview(null);
            setImageFile(null);
        }
    }, [initialValues, form]);

    const handleImageChange = (info) => {
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

        setImageFile(file);

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
            setImagePreview(e.target.result);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = () => {
        form.validateFields()
            .then(values => {
                // Pass both form values and image file
                onFinish({ ...values, imageFile });
                form.resetFields();
                setImageFile(null);
                setImagePreview(null);
            })
            .catch(info => {
                console.log('Validate Failed:', info);
            });
    };

    const uploadButton = (
        <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>Upload Image</div>
        </div>
    );

    return (
        <Modal
            open={visible}
            title={initialValues ? 'Edit Product' : 'Add New Product'}
            okText={initialValues ? 'Update' : 'Create'}
            cancelText="Cancel"
            onCancel={() => {
                onCancel();
                setImageFile(null);
                setImagePreview(null);
            }}
            onOk={handleSubmit}
        >
            <Form form={form} layout="vertical" name="product_form">
                <Form.Item
                    name="name"
                    label="Product Name"
                    rules={[{ required: true, message: 'Please input the name of the product!' }]}
                >
                    <Input />
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
                    <InputNumber min={0} style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item
                    label="Product Image"
                    rules={[{
                        required: !initialValues && !imageFile,
                        message: 'Please upload a product image!'
                    }]}
                >
                    <Upload
                        listType="picture-card"
                        showUploadList={false}
                        beforeUpload={() => false} // Prevent auto upload
                        onChange={handleImageChange}
                        accept="image/*"
                    >
                        {imagePreview ? (
                            <img
                                src={imagePreview}
                                alt="product"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        ) : (
                            uploadButton
                        )}
                    </Upload>
                    {imagePreview && (
                        <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                            {imageFile ? 'New image selected' : 'Current image (click to change)'}
                        </div>
                    )}
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ProductEditModal;
