// frontend/src/components/LoginPage.js
import React from 'react';
import { Form, Input, Button, Card, Typography, message, Row, Col } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const { Title } = Typography;

const LoginPage = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    const onFinish = async (values) => {
        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', values);
            login(res.data.token, res.data.user);
            message.success('Login successful!');
            navigate('/');
        } catch (err) {
            message.error(err.response.data.msg || 'Login failed!');
        }
    };

    return (
        <Row justify="center" align="middle" style={{ minHeight: '70vh', padding: '0 16px' }}>
            <Col xs={24} sm={20} md={12} lg={8}>
                <Card>
                    <Title level={3} style={{ textAlign: 'center' }}>Login</Title>
                    <Form name="login" onFinish={onFinish}>
                        <Form.Item name="email" rules={[{ required: true, message: 'Please input your Email!' }]}>
                            <Input prefix={<MailOutlined />} placeholder="Email" />
                        </Form.Item>
                        <Form.Item name="password" rules={[{ required: true, min: 6, message: 'Password must be at least 6 characters', message: 'Please input your Password!' }]}>
                            <Input.Password prefix={<LockOutlined />} placeholder="Password" />
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
                                Log in
                            </Button>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
                                <Link to="/forgot-password">Forgot password?</Link>
                                <Link to="/register">Register now!</Link>
                            </div>
                        </Form.Item>
                    </Form>
                </Card>
            </Col>
        </Row>
    );
};

export default LoginPage;
