// frontend/src/components/AdminSettings.js
import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Spin } from 'antd';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import AdminNav from './AdminNav'; // Assuming you have created this component

const { Title } = Typography;

const AdminSettings = () => {
    const [form] = Form.useForm();
    const { token } = useAuth();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            setLoading(true);
            try {
                const { data } = await axios.get('${process.env.REACT_APP_API_URL}/api/settings');
                form.setFieldsValue({ 
                    contactPhone: data.contactPhone,
                    contactEmail: data.contactEmail
                });
            } catch (error) {
                message.error("Could not load site settings.");
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, [form]);

    const onFinish = async (values) => {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        try {
            await axios.put('${process.env.REACT_APP_API_URL}/api/settings', values, config);
            message.success('Settings updated!');
        } catch (error) {
            message.error('Failed to update settings.');
        }
    };

    return (
        <div>
            <Title level={2}>Admin Dashboard</Title>
            <AdminNav />

            <Title level={4} style={{ marginTop: '24px' }}>Site Settings</Title>

            {loading ? <Spin /> : (
                <Card>
                    <Title level={5}>Contact Information</Title>
                    <Form form={form} onFinish={onFinish} layout="vertical">
                        <Form.Item name="contactPhone" label="Contact Phone Number for Help Page">
                            <Input placeholder="Enter a phone number" />
                        </Form.Item>
                        <Form.Item name="contactEmail" label="Contact Email for Help Page">
                            <Input placeholder="Enter an email address" />
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
