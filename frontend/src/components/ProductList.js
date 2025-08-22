// frontend/src/components/ProductList.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Row, Col, Spin, Typography } from 'antd';
import Product from './Product';

const { Title } = Typography;

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const { data } = await axios.get('http://localhost:5000/products');
                setProducts(data);
            } catch (error) {
                console.error("Failed to fetch products:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    if (loading) {
        return <div style={{ textAlign: 'center', marginTop: '50px' }}><Spin size="large" /></div>;
    }

    return (
        <div>
            <Title level={2} style={{ textAlign: 'center', margin: '40px 0' }}>Our Products</Title>
            <Row gutter={[24, 24]} justify="start">
                {products.map(product => (
                    // This is the line we're changing: xs={24} becomes xs={12}
                    <Col key={product._id} xs={12} sm={12} md={8} lg={6}>
                        <Product product={product} />
                    </Col>
                ))}
            </Row>
        </div>
    );
};

export default ProductList;