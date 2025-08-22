// frontend/src/components/RegisterPage.js
import React from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Row, Col } from 'antd';

const { Title } = Typography;

const RegisterPage = () => {
    const navigate = useNavigate();

    const onFinish = async (values) => {
        try {
            await axios.post('http://localhost:5000/api/auth/register', values);
            message.success('Registration successful! Please log in.');
            navigate('/login');
        } catch (err) {
            message.error(err.response.data.msg || 'Registration failed!');
        }
    };

    return (
        <Row justify="center" align="middle" style={{ minHeight: '70vh' }}>
            <Col>
                <Card title={<Title level={3}>Register</Title>} style={{ width: 400 }}>
                    <Form name="register" onFinish={onFinish}>
                        <Form.Item name="username" rules={[{ required: true, message: 'Please input your Username!' }]}>
                            <Input prefix={<UserOutlined />} placeholder="Username" />
                        </Form.Item>
                        <Form.Item name="email" rules={[{ required: true, type: 'email', message: 'Please input a valid Email!' }]}>
                            <Input prefix={<MailOutlined />} placeholder="Email" />
                        </Form.Item>
                        <Form.Item name="password" rules={[{ required: true, message: 'Please input your Password!' }]}>
                            <Input.Password prefix={<LockOutlined />} placeholder="Password" />
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
                                Register
                            </Button>
                            Already have an account? <Link to="/login">Log in</Link>
                        </Form.Item>
                    </Form>
                </Card>
            </Col>
        </Row>
    );
};

export default RegisterPage;
