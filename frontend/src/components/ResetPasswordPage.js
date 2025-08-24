// frontend/src/components/ResetPasswordPage.js
import React from 'react';
import { Form, Input, Button, Card, Typography, message, Row, Col } from 'antd';
import axios from 'axios';
import { useNavigate, useParams, Link } from 'react-router-dom';

const { Title } = Typography;

const ResetPasswordPage = () => {
    const navigate = useNavigate();
    const { token } = useParams();

    const onFinish = async (values) => {
        if (values.password !== values.confirmPassword) {
            return message.error("Passwords do not match!");
        }
        try {
            const { data } = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/reset-password/${token}`, { password: values.password });
            message.success(data.message);
            navigate('/login');
        } catch (err) {
            message.error(err.response.data.message || 'An error occurred. Please try again.');
        }
    };

    return (
        <Row justify="center" align="middle" style={{ minHeight: '70vh' }}>
            <Col xs={24} sm={20} md={12} lg={8}>
                <Card>
                    <Title level={3} style={{ textAlign: 'center' }}>Reset Password</Title>
                    <Form name="reset_password" onFinish={onFinish}>
                        <Form.Item name="password" label="New Password" rules={[{ required: true, min: 6, max: 10, message: 'Password must be at least 6 characters' }]}>
                            <Input.Password placeholder="Enter new password" />
                        </Form.Item>
                        <Form.Item name="confirmPassword" label="Confirm New Password" dependencies={['password']} rules={[{ required: true, message: 'Please confirm your password!' }, ({ getFieldValue }) => ({ validator(_, value) { if (!value || getFieldValue('password') === value) { return Promise.resolve(); } return Promise.reject(new Error('The two passwords that you entered do not match!')); } })]}>
                            <Input.Password placeholder="Confirm new password" />
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
                                Reset Password
                            </Button>
                        </Form.Item>
                    </Form>
                </Card>
            </Col>
        </Row>
    );
};

export default ResetPasswordPage;