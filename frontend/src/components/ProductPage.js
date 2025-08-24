// frontend/src/components/ProductPage.js

// frontend/src/components/ProductPage.js
import React, { useState, useEffect, useCallback } from 'react'; // Add useCallback
import { useParams } from 'react-router-dom';
import axios from 'axios';
import BackButton from './BackButton';
import { Row, Col, Spin, Typography, Button, Image, Rate, Divider } from 'antd'; // Add Rate and Divider
import { ShoppingCartOutlined } from '@ant-design/icons';
import ProductReviews from './ProductReviews'; // Import the new component
import { useCart } from '../context/CartContext';

const { Title, Paragraph, Text } = Typography;

const ProductPage = () => {
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const { id } = useParams();
    const { addToCart } = useCart();

    const fetchProduct = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/products/${id}`);
            setProduct(data);
        } catch (error) {
            console.error("Failed to fetch product", error);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchProduct();
    }, [fetchProduct]);

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>;
    }

    if (!product) {
        return <Title level={3}>Product not found!</Title>;
    }

    return (
        <div>
            <BackButton />
            <Row gutter={[32, 32]} style={{ padding: '24px' }}>
                <Col xs={24} md={12}>
                    <Image
                        width="100%"
                        src={product.image || 'https://placehold.co/600x600/EEE/31343C?text=No+Image'}
                        alt={product.name}
                    />
                </Col>
                <Col xs={24} md={12}>
                    <Title level={2}>{product.name}</Title>
                    <Rate disabled value={product.rating} /> <Text>({product.numReviews} reviews)</Text>
                    <Paragraph style={{ marginTop: '10px' }}>{product.description}</Paragraph>
                    <Text strong style={{ fontSize: '24px' }}>₹{product.price.toFixed(2)}</Text>
                    <div style={{ marginTop: '24px' }}>
                        <Button type="primary" size="large" icon={<ShoppingCartOutlined />} onClick={() => addToCart(product)}>
                            Add to Cart
                        </Button>
                    </div>
                </Col>
            </Row>
            <Divider />
            <Row style={{ padding: '24px' }}>
                <Col span={24}>
                    <ProductReviews product={product} fetchProduct={fetchProduct} />
                </Col>
            </Row>
        </div>
    );
};

export default ProductPage;