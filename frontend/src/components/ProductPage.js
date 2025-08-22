// frontend/src/components/ProductPage.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Row, Col, Spin, Typography, Button, Image } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import { useCart } from '../context/CartContext'; // Import useCart


const { Title, Paragraph, Text } = Typography;

const ProductPage = () => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams(); // Get the product ID from the URL
  const { addToCart } = useCart(); // Get addToCart function

  useEffect(() => {
    axios.get(`http://localhost:5000/products/${id}`)
      .then(response => {
        setProduct(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>;
  }

  if (!product) {
    return <Title level={3}>Product not found!</Title>;
  }

  return (
    <Row gutter={[32, 32]} style={{ padding: '24px' }}>
      <Col xs={24} md={12}>
        <Image
          width="100%"
          src={product.image || '[https://placehold.co/600x600/EEE/31343C?text=No+Image](https://placehold.co/600x600/EEE/31343C?text=No+Image)'}
          alt={product.name}
        />
      </Col>
      <Col xs={24} md={12}>
        <Title level={2}>{product.name}</Title>
        <Paragraph>{product.description}</Paragraph>
        <Text strong style={{ fontSize: '24px' }}>${product.price.toFixed(2)}</Text>
        <div style={{ marginTop: '24px' }}>
          <Button type="primary" size="large" icon={<ShoppingCartOutlined />} onClick={() => addToCart(product)}>
            Add to Cart
          </Button>
        </div>
      </Col>
    </Row>
  );
};

export default ProductPage;
