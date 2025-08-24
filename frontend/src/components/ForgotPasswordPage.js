// frontend/src/components/ForgotPasswordPage.js
import React from 'react';
import { Form, Input, Button, Card, Typography, message, Row, Col } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import axios from 'axios';
import BackButton from './BackButton';

const { Title } = Typography;

const ForgotPasswordPage = () => {
    const onFinish = async (values) => {
        try {
            const { data } = await axios.post('${process.env.REACT_APP_API_URL}/api/auth/forgot-password', values);
            message.success(data.message);
        } catch (err) {
            message.error('An error occurred. Please try again.');
        }
    };

    return (
        <div>
            <BackButton />
            <Row justify="center" align="middle" style={{ minHeight: '70vh' }}>
                <Col xs={24} sm={20} md={12} lg={8}>
                    <Card>
                        <Title level={3} style={{ textAlign: 'center' }}>Forgot Password</Title>
                        <p style={{ textAlign: 'center', marginBottom: '24px' }}>Enter your email address and we'll send you a link to reset your password.</p>
                        <Form name="forgot_password" onFinish={onFinish}>
                            <Form.Item name="email" rules={[{ required: true, type: 'email', message: 'Please input a valid Email!' }]}>
                                <Input prefix={<MailOutlined />} placeholder="Email" />
                            </Form.Item>
                            <Form.Item>
                                <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
                                    Send Reset Link
                                </Button>
                            </Form.Item>
                        </Form>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default ForgotPasswordPage;
