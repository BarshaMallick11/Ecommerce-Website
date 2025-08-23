// frontend/src/components/HelpPage.js
import React, { useState, useEffect } from 'react';
import { Card, Typography, Form, Input, Button, Space, message } from 'antd';
import { MailOutlined, PhoneOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const { Title, Text } = Typography;
const { TextArea } = Input;

const HelpPage = () => {
    const [form] = Form.useForm();
    const { user } = useAuth();
    const [phone, setPhone] = useState('');

    useEffect(() => {
        const fetchSettings = async () => {
            const { data } = await axios.get('http://localhost:5000/api/settings');
            setPhone(data.contactPhone);
        };
        fetchSettings();
        if (user) {
            form.setFieldsValue({ name: user.username, email: user.email });
        }
    }, [user, form]);

    const onFinish = async (values) => {
        try {
            const { data } = await axios.post('http://localhost:5000/api/queries', values);
            message.success(data.message);
            form.resetFields(['orderId', 'message']);
        } catch (error) {
            message.error('Failed to submit query.');
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: 'auto' }}>
            <Title level={2} style={{ textAlign: 'center', marginBottom: '24px' }}>Help & Contact</Title>
            <Card title="Contact Us">
                <p>For immediate assistance, please call us. For other inquiries, please use the form below.</p>
                <Space direction="vertical" style={{ marginBottom: 24 }}>
                    <Text><PhoneOutlined style={{ marginRight: '8px' }} /> <a href={`tel:${phone}`}>{phone}</a></Text>
                    <Text><MailOutlined style={{ marginRight: '8px' }} /> barshamallick57@gmail.com</Text>
                </Space>
                <Form form={form} layout="vertical" onFinish={onFinish}>
                    <Form.Item name="name" label="Your Name" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="email" label="Your Email" rules={[{ required: true, type: 'email' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="orderId" label="Order ID (Optional)">
                        <Input />
                    </Form.Item>
                    <Form.Item name="message" label="Message" rules={[{ required: true }]}>
                        <TextArea rows={4} />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit">Submit Query</Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default HelpPage;