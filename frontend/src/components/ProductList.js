import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Row, Col, Spin, Typography } from 'antd';
import Product from './Product';

const { Title } = Typography;

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:5000/products/')
      .then(response => {
        setProducts(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>;
  }

  return (
    <div className="product-list">
      <Title level={2} style={{ textAlign: 'center', marginBottom: '24px' }}>Our Products</Title>
      <Row justify="center">
        {products.map(currentproduct => (
          <Col key={currentproduct._id}>
            <Product product={currentproduct} />
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default ProductList;
