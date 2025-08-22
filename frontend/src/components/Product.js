// frontend/src/components/Product.js
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Typography } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import { useCart } from '../context/CartContext'; // Import useCart

const { Meta } = Card;
const { Text } = Typography;

const Product = ({ product }) => {
  const { addToCart } = useCart(); // Get addToCart function

  const handleAddToCart = (e) => {
    e.preventDefault(); // Prevent navigation when clicking the button
    e.stopPropagation(); // Stop the click from bubbling up to the Link
    addToCart(product);
  };

  return (
    <Link to={`/product/${product._id}`}>
      <Card
        hoverable
        style={{ width: 240, margin: '16px' }}
        cover={<img alt={product.name} src={product.image || '[https://placehold.co/240x240/EEE/31343C?text=No+Image](https://placehold.co/240x240/EEE/31343C?text=No+Image)'} />}
        actions={[
          <Button type="primary" icon={<ShoppingCartOutlined />} onClick={handleAddToCart}>
            Add to Cart
          </Button>
        ]}
      >
        <Meta
          title={product.name}
          description={<Text strong>${product.price.toFixed(2)}</Text>}
        />
      </Card>
    </Link>
  );
};

export default Product;
