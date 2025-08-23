// frontend/src/components/AddressModal.js
import React, { useEffect } from 'react';
import { Modal, Form, Input } from 'antd';

const AddressModal = ({ visible, onCancel, onFinish, initialValues }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (visible) {
            if (initialValues) {
                form.setFieldsValue(initialValues);
            } else {
                form.resetFields();
            }
        }
    }, [initialValues, visible, form]);

    return (
        <Modal
            open={visible}
            title={initialValues ? 'Edit Address' : 'Add New Address'}
            okText={initialValues ? 'Update' : 'Add'}
            cancelText="Cancel"
            onCancel={onCancel}
            onOk={() => {
                form.validateFields()
                    .then(values => {
                        onFinish(values);
                    })
                    .catch(info => {
                        console.log('Validate Failed:', info);
                    });
            }}
        >
            <Form form={form} layout="vertical">
                <Form.Item name="address" label="Address" rules={[{ required: true }]}>
                    <Input />
                </Form.Item>
                <Form.Item name="city" label="City" rules={[{ required: true }]}>
                    <Input />
                </Form.Item>
                <Form.Item name="postalCode" label="Postal Code" rules={[{ required: true }]}>
                    <Input />
                </Form.Item>
                <Form.Item name="country" label="Country" rules={[{ required: true }]}>
                    <Input />
                </Form.Item>
                <Form.Item name="phoneNo" label="Phone Number" rules={[{ required: true }]}>
                    <Input />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default AddressModal;
