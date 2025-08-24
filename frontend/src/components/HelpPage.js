// frontend/src/components/HelpPage.js
import React, { useState, useEffect } from 'react';
import BackButton from './BackButton';
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
    const [email, setEmail] = useState(''); // Correctly declare state for email

    useEffect(() => {
        const fetchSettings = async () => {
            const { data } = await axios.get('${process.env.REACT_APP_API_URL}/api/settings');
            setPhone(data.contactPhone);
            setEmail(data.contactEmail); // Correctly set the email
        };
        fetchSettings();
        if (user) {
            form.setFieldsValue({ name: user.username, email: user.email });
        }
    }, [user, form]);

    const onFinish = async (values) => {
        try {
            const { data } = await axios.post('${process.env.REACT_APP_API_URL}/api/queries', values);
            message.success(data.message);
            form.resetFields(['orderId', 'message']);
        } catch (error) {
            message.error('Failed to submit query.');
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: 'auto' }}>
            <BackButton />
            <Title level={2} style={{ textAlign: 'center', marginBottom: '24px' }}>Help & Contact</Title>
            <Card title="Contact Us">
                <p>For immediate assistance, please call us. For other inquiries, please use the form below.</p>
                <Space direction="vertical" style={{ marginBottom: 24 }}>
                    <Text><PhoneOutlined style={{ marginRight: '8px' }} /> <a href={`tel:${phone}`}>{phone}</a></Text>
                    <Text><MailOutlined style={{ marginRight: '8px' }} /> <a href={`mailto:${email}`}>{email}</a></Text>
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
