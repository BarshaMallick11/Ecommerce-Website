// frontend/src/components/ProductEditModal.js
import React, { useEffect } from 'react';
import { Modal, Form, Input, InputNumber } from 'antd';

const ProductEditModal = ({ visible, onCancel, onFinish, initialValues }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (initialValues) {
            form.setFieldsValue(initialValues);
        } else {
            form.resetFields();
        }
    }, [initialValues, form]);

    return (
        <Modal
            open={visible}
            title={initialValues ? 'Edit Product' : 'Add New Product'}
            okText={initialValues ? 'Update' : 'Create'}
            cancelText="Cancel"
            onCancel={onCancel}
            onOk={() => {
                form.validateFields()
                    .then(values => {
                        form.resetFields();
                        onFinish(values);
                    })
                    .catch(info => {
                        console.log('Validate Failed:', info);
                    });
            }}
        >
            <Form form={form} layout="vertical" name="product_form">
                <Form.Item name="name" label="Product Name" rules={[{ required: true, message: 'Please input the name of the product!' }]}>
                    <Input />
                </Form.Item>
                <Form.Item name="description" label="Description" rules={[{ required: true, message: 'Please input the description!' }]}>
                    <Input.TextArea rows={4} />
                </Form.Item>
                <Form.Item name="price" label="Price" rules={[{ required: true, message: 'Please input the price!' }]}>
                    <InputNumber min={0} style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item name="image" label="Image URL" rules={[{ required: true, message: 'Please input the image URL!' }]}>
                    <Input />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ProductEditModal;
