// frontend/src/components/ProductReviews.js
import React, { useState } from 'react';
import { List, Typography, Form, Input, Button, Rate, message } from 'antd';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const { Title, Text } = Typography;
const { TextArea } = Input;

const ProductReviews = ({ product, fetchProduct }) => {
    const [form] = Form.useForm();
    const { user, token } = useAuth();
    const [loading, setLoading] = useState(false);

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.post(`${process.env.REACT_APP_API_URL}/products/${product._id}/reviews`, values, config);
            message.success('Review submitted successfully!');
            form.resetFields();
            fetchProduct(); // Re-fetch product to show the new review
        } catch (error) {
            message.error(error.response.data.message || 'Failed to submit review');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <Title level={4}>Reviews</Title>
            {product.reviews.length === 0 && <Text>No reviews yet.</Text>}
            <List
                itemLayout="horizontal"
                dataSource={product.reviews}
                renderItem={item => (
                    <List.Item>
                        <List.Item.Meta
                            title={<><Text strong>{item.name}</Text> <Rate disabled defaultValue={item.rating} /></>}
                            description={item.comment}
                        />
                    </List.Item>
                )}
            />

            {user && (
                <div style={{ marginTop: '20px' }}>
                    <Title level={4}>Write a Customer Review</Title>
                    <Form form={form} onFinish={onFinish} layout="vertical">
                        <Form.Item name="rating" label="Rating" rules={[{ required: true, message: 'Please select a rating!' }]}>
                            <Rate />
                        </Form.Item>
                        <Form.Item name="comment" label="Comment" rules={[{ required: true, message: 'Please enter your comment!' }]}>
                            <TextArea rows={4} />
                        </Form.Item>
                        <Form.Item>
                            <Button htmlType="submit" loading={loading} type="primary">
                                Submit Review
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
            )}
        </div>
    );
};

export default ProductReviews;
