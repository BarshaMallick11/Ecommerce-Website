// frontend/src/components/ProductList.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Row, Col, Spin, Typography } from 'antd';
import Product from './Product';
import { useParams } from 'react-router-dom';
import BackButton from './BackButton';

const { Title } = Typography;

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { keyword } = useParams();

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const url = keyword ? `/products?keyword=${keyword}` : '/products';
                const { data } = await axios.get(`http://localhost:5000${url}`);
                setProducts(data);
            } catch (error) {
                console.error("Failed to fetch products:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [keyword]);

    if (loading) {
        return <div style={{ textAlign: 'center', marginTop: '50px' }}><Spin size="large" /></div>;
    }

    return (
        <div>
            {keyword && <BackButton />}
            <Title level={2} style={{ textAlign: 'center', margin: '40px 0' }}>
                {keyword ? `Search Results for "${keyword}"` : 'Our Products'}
            </Title>
            <Row gutter={[24, 24]} justify="start">
                {products.length > 0 ? products.map(product => (
                    <Col key={product._id} xs={12} sm={12} md={8} lg={6}>
                        <Product product={product} />
                    </Col>
                )) : (
                    <Col span={24} style={{ textAlign: 'center' }}>
                        <Title level={4}>No products found.</Title>
                    </Col>
                )}
            </Row>
        </div>
    );
};

export default ProductList;
