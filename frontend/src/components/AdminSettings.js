// frontend/src/components/AdminSettings.js

import React, { useEffect } from 'react';
import { Form, Input, Button, Card, Typography, message, Spin } from 'antd';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import AdminNav from './AdminNav';

const { Title } = Typography;

const AdminSettings = () => {
    const [form] = Form.useForm();
    const { token } = useAuth();
    const [loading, setLoading] = React.useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                setLoading(true);
                // The GET request for settings does not need an auth token
                const { data } = await axios.get('http://localhost:5000/api/settings');
                if (data) {
                    form.setFieldsValue(data);
                }
            } catch (error) {
                message.error('Could not load site settings.');
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, [form]);

    const onFinish = async (values) => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.put('http://localhost:5000/api/settings', values, config);
            message.success('Settings updated successfully!');
        } catch (error) {
            message.error('Failed to update settings.');
        }
    };

    return (
        <div>
            <Title level={2}>Admin Dashboard</Title>
            <AdminNav />

            <Title level={4}>Site Settings</Title>

            {loading ? <Spin /> : (
                <Card>
                    <Title level={5}>Contact Information</Title>
                    <Form form={form} onFinish={onFinish} layout="vertical">
                        <Form.Item name="contactPhone" label="Contact Phone Number for Help Page">
                            <Input placeholder="Enter a phone number" />
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit">Save Settings</Button>
                        </Form.Item>
                    </Form>
                </Card>
            )}
        </div>
    );
};

export default AdminSettings;