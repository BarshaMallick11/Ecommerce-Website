// frontend/src/components/AdminSettings.js
import React, { useEffect } from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const { Title } = Typography;

const AdminSettings = () => {
    const [form] = Form.useForm();
    const { token } = useAuth();

    useEffect(() => {
        const fetchSettings = async () => {
            const { data } = await axios.get('http://localhost:5000/api/settings');
            form.setFieldsValue({ contactPhone: data.contactPhone });
        };
        fetchSettings();
    }, [form]);

    const onFinish = async (values) => {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        await axios.put('http://localhost:5000/api/settings', values, config);
        message.success('Settings updated!');
    };

    return (
        <Card title="Site Settings">
            <Title level={4}>Contact Information</Title>
            <Form form={form} onFinish={onFinish} layout="vertical">
                <Form.Item name="contactPhone" label="Contact Phone Number">
                    <Input />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit">Save Settings</Button>
                </Form.Item>
            </Form>
        </Card>
    );
};

export default AdminSettings;
