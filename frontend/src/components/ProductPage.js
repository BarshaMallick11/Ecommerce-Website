// frontend/src/components/ProductPage.js

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import BackButton from './BackButton';
import { Row, Col, Spin, Typography, Button, Image, Rate, Tag, Space, Card, message } from 'antd';
import { ShoppingCartOutlined, MinusOutlined, PlusOutlined, ShareAltOutlined } from '@ant-design/icons';
import ProductReviews from './ProductReviews';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const { Title, Paragraph, Text } = Typography;

const ProductPage = () => {
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(null); // For image gallery
    const [previewVisible, setPreviewVisible] = useState(false); // For image preview modal
    const { id } = useParams();
    const { addToCart } = useCart();
    const { user } = useAuth();

    // Combine main image and additional images
    const allImages = product ? [
        product.image,
        ...(product.images || [])
    ].filter(Boolean) : []; // Filter out any null/undefined values

    const fetchProduct = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/products/${id}`);
            setProduct(data);
            setSelectedImage(data.image); // Set main image as selected by default
        } catch (error) {
            console.error("Failed to fetch product", error);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchProduct();
    }, [fetchProduct]);

    const increaseQuantity = () => {
        setQuantity(prev => prev + 1);
    };

    const decreaseQuantity = () => {
        if (quantity > 1) {
            setQuantity(prev => prev - 1);
        }
    };

    const handleShare = async () => {
        const shareData = {
            title: product.name,
            text: `Check out ${product.name} - ₹${product.price}`,
            url: window.location.href
        };

        try {
            if (navigator.share) {
                // Use Web Share API for mobile devices
                await navigator.share(shareData);
            } else {
                // Fallback: Copy link to clipboard
                await navigator.clipboard.writeText(window.location.href);
                message.success('Product link copied to clipboard!');
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Error sharing:', error);
                message.error('Failed to share product');
            }
        }
    };

    const handleAddToCart = () => {
        if (user) {
            for (let i = 0; i < quantity; i++) {
                addToCart(product);
            }
        }
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>;
    }

    if (!product) {
        return <Title level={3}>Product not found!</Title>;
    }

    return (
        <div>
            <BackButton />

            {/* Main Product Section */}
            <Card
                style={{
                    marginTop: '24px',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    border: 'none',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                }}
            >
                <Row gutter={[48, 32]} style={{ rowGap: window.innerWidth <= 576 ? '16px' : '32px' }}>
                    {/*Left Side - Product Image Gallery */}
                    <Col xs={24} md={10}>
                        <div className="product-detail-image" style={{
                            backgroundColor: '#f5f5f5',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '400px'
                        }}>
                            <Image
                                width="100%"
                                height="100%"
                                style={{ objectFit: 'cover', cursor: 'pointer' }}
                                src={selectedImage || product.image || 'https://placehold.co/600x600/EEE/31343C?text=No+Image'}
                                alt={product.name}
                                preview={{
                                    visible: previewVisible,
                                    onVisibleChange: (visible) => setPreviewVisible(visible),
                                    src: selectedImage || product.image
                                }}
                                onClick={() => setPreviewVisible(true)}
                            />
                        </div>

                        {/* Thumbnail Images - Show all available images */}
                        {allImages.length > 1 && (
                            <div style={{
                                display: 'flex',
                                gap: '12px',
                                marginTop: '16px',
                                justifyContent: 'flex-start',
                                flexWrap: 'wrap'
                            }}>
                                {allImages.map((imgUrl, index) => (
                                    <div
                                        key={index}
                                        className="product-thumbnail"
                                        onClick={() => setSelectedImage(imgUrl)}
                                        style={{
                                            width: '80px',
                                            height: '80px',
                                            border: selectedImage === imgUrl ? '2px solid #52c41a' : '1px solid #e8e8e8',
                                            borderRadius: '8px',
                                            padding: '4px',
                                            cursor: 'pointer',
                                            backgroundColor: '#fff',
                                            transition: 'all 0.3s ease',
                                            boxShadow: selectedImage === imgUrl ? '0 2px 8px rgba(82,196,26,0.3)' : 'none'
                                        }}
                                    >
                                        <img
                                            src={imgUrl}
                                            alt={`View ${index + 1}`}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                                borderRadius: '4px'
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </Col>

                    {/* Right Side - Product Details */}
                    <Col xs={24} md={14}>
                        <div>


                            {/* Product Name and Share Button */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                                <Title level={2} style={{ margin: 0 }}>{product.name}</Title>
                                <Button
                                    icon={<ShareAltOutlined />}
                                    shape="circle"
                                    size="large"
                                    onClick={handleShare}
                                    style={{
                                        border: '1px solid #e5e7eb',
                                        backgroundColor: '#f9fafb',
                                        color: '#374151'
                                    }}
                                />
                            </div>

                            {/* Rating */}
                            <div style={{ marginTop: '12px' }}>
                                <Space>
                                    <Rate disabled allowHalf value={product.rating || 0} style={{ fontSize: '16px' }} />
                                    <Text type="secondary">({product.numReviews || 0} reviews)</Text>
                                </Space>
                            </div>

                            {/* Discount Badge Only */}
                            <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
                                {product.discount > 0 && (
                                    <Tag icon="🎉" color="green">
                                        {product.discount}% Discount
                                    </Tag>
                                )}
                            </div>

                            {/* Price */}
                            <div style={{ marginTop: '20px' }}>
                                <Space align="baseline">
                                    <Text strong className="product-detail-price" style={{ fontSize: '32px', color: '#262626' }}>
                                        ₹{(product.price * (1 - (product.discount || 0) / 100)).toFixed(2)}
                                    </Text>
                                    {product.discount ? (
                                        <Text delete type="secondary" style={{ fontSize: '20px' }}>
                                            ₹{product.price.toFixed(2)}
                                        </Text>
                                    ) : (
                                        <Text delete type="secondary" style={{ fontSize: '20px' }}>
                                            ₹{(product.price * 1.2).toFixed(2)}
                                        </Text>
                                    )}
                                </Space>
                            </div>

                            {/* Description */}
                            <Paragraph style={{ marginTop: '16px', color: '#666', lineHeight: '1.8' }}>
                                {product.description || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'}
                            </Paragraph>

                            {/* Quantity and Add to Cart */}
                            {!user?.isAdmin && (
                                <div style={{ marginTop: '32px' }}>
                                    <Space size={16}>
                                        {/* Quantity Selector */}
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            border: '1px solid #e8e8e8',
                                            borderRadius: '8px',
                                            padding: '4px',
                                            backgroundColor: 'white'
                                        }}>
                                            <Button
                                                icon={<MinusOutlined />}
                                                onClick={decreaseQuantity}
                                                style={{
                                                    border: 'none',
                                                    width: '40px',
                                                    height: '40px'
                                                }}
                                            />
                                            <Text strong style={{
                                                fontSize: '18px',
                                                minWidth: '40px',
                                                textAlign: 'center',
                                                display: 'inline-block'
                                            }}>
                                                {quantity}
                                            </Text>
                                            <Button
                                                icon={<PlusOutlined />}
                                                onClick={increaseQuantity}
                                                style={{
                                                    border: 'none',
                                                    width: '40px',
                                                    height: '40px'
                                                }}
                                            />
                                        </div>

                                        {/* Add to Cart Button */}
                                        <Button
                                            type="primary"
                                            size="large"
                                            icon={<ShoppingCartOutlined />}
                                            onClick={handleAddToCart}
                                            style={{
                                                height: '48px',
                                                paddingLeft: '32px',
                                                paddingRight: '32px',
                                                borderRadius: '8px',
                                                fontSize: '16px',
                                                fontWeight: '500',
                                                backgroundColor: '#52c41a',
                                                border: 'none'
                                            }}
                                        >
                                            Add to Cart
                                        </Button>
                                    </Space>
                                </div>
                            )}
                        </div>
                    </Col>
                </Row>
            </Card>

            {/* Reviews Section */}
            <div style={{ marginTop: '24px' }}>
                <ProductReviews product={product} fetchProduct={fetchProduct} />
            </div>
        </div>
    );
};

export default ProductPage;