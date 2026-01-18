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
import { useSettings } from '../context/SettingsContext';

const { Title, Paragraph, Text } = Typography;

const ProductPage = () => {
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(null); // For image gallery
    const [previewVisible, setPreviewVisible] = useState(false); // For image preview modal
    const [selectedVariant, setSelectedVariant] = useState(null); // For unit variant selection
    const { id } = useParams();
    const { addToCart, cartItems } = useCart();
    const { user } = useAuth();
    const { settings } = useSettings();

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

            // Set default variant if product has variants
            if (data.hasVariants && data.unitVariants && data.unitVariants.length > 0) {
                const defaultVariant = data.unitVariants.find(v => v.isDefault) || data.unitVariants[0];
                setSelectedVariant(defaultVariant);
            }
        } catch (error) {
            console.error("Failed to fetch product", error);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchProduct();
    }, [fetchProduct]);

    // Get current price and stock based on selected variant
    const getCurrentPrice = () => {
        if (product?.hasVariants && selectedVariant) {
            return selectedVariant.price;
        }
        return product?.price || 0;
    };

    const getCurrentStock = () => {
        if (product?.hasVariants && selectedVariant) {
            return selectedVariant.stock || 0;
        }
        return product?.stock || 0;
    };

    const getCurrentLabel = () => {
        if (product?.hasVariants && selectedVariant) {
            return selectedVariant.label;
        }
        return product?.quantity ? `${product.quantity}${product.unit || 'Kg'}` : '';
    };

    // Stock management - check current cart quantity (considering variant)
    const getCartItemKey = () => {
        if (product?.hasVariants && selectedVariant) {
            return `${id}_${selectedVariant._id}`;
        }
        return id;
    };

    const cartItem = cartItems.find(item => {
        if (product?.hasVariants && selectedVariant) {
            return item._id === id && item.selectedVariant?._id === selectedVariant._id;
        }
        return item._id === id;
    });
    const currentCartQuantity = cartItem ? cartItem.quantity : 0;
    const availableStock = getCurrentStock();
    const isOutOfStock = availableStock === 0;

    // Order limit management
    const maxOrderLimit = settings.orderLimitEnabled ? settings.maxQuantityPerProduct : Infinity;
    const effectiveMax = Math.min(availableStock, maxOrderLimit);
    const canIncreaseQuantity = (quantity + currentCartQuantity) < effectiveMax;
    const isAtOrderLimit = settings.orderLimitEnabled && (quantity + currentCartQuantity) >= maxOrderLimit;

    const increaseQuantity = () => {
        if (canIncreaseQuantity) {
            setQuantity(prev => prev + 1);
        } else {
            if (isAtOrderLimit) {
                message.warning(`Maximum ${maxOrderLimit} units allowed per product.`);
            } else {
                message.warning(`Limited stock! Only ${availableStock} units available total (${currentCartQuantity} already in cart).`);
            }
        }
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
        if (!user) {
            message.warning('Please log in to add items to cart');
            return;
        }

        if (isOutOfStock) {
            message.error('This product is out of stock');
            return;
        }

        // Check if adding this quantity would exceed stock or order limit
        const totalQuantity = currentCartQuantity + quantity;

        // Check order limit first
        if (settings.orderLimitEnabled && totalQuantity > maxOrderLimit) {
            const remaining = maxOrderLimit - currentCartQuantity;
            if (remaining > 0) {
                message.warning(`Maximum ${maxOrderLimit} units allowed per product. You can add ${remaining} more.`);
            } else {
                message.warning(`Maximum limit of ${maxOrderLimit} units reached for this product.`);
            }
            return;
        }

        // Check stock limit
        if (totalQuantity > availableStock) {
            const remainingStock = availableStock - currentCartQuantity;
            if (remainingStock > 0) {
                message.warning(`Only ${remainingStock} more units can be added. You already have ${currentCartQuantity} in cart.`);
            } else {
                message.warning(`You already have the maximum stock (${availableStock} units) in your cart.`);
            }
            return;
        }

        // Create product object with variant info if applicable
        const productToAdd = {
            ...product,
            // Override price and stock with selected variant values
            price: getCurrentPrice(),
            stock: getCurrentStock(),
            selectedVariant: selectedVariant || null,
            variantLabel: getCurrentLabel()
        };

        for (let i = 0; i < quantity; i++) {
            addToCart(productToAdd);
        }

        const variantInfo = selectedVariant ? ` (${selectedVariant.label})` : '';
        message.success(`${quantity} item(s)${variantInfo} added to cart!`);
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

                            {/* Unit Variant Selector - Like Modern Grocery Apps */}
                            {product.hasVariants && product.unitVariants && product.unitVariants.length > 0 && (
                                <div style={{ marginTop: '20px' }}>
                                    <Text strong style={{ fontSize: '14px', color: '#555', marginBottom: '12px', display: 'block' }}>
                                        Select Size / Pack:
                                    </Text>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                        {product.unitVariants.map((variant) => {
                                            const isSelected = selectedVariant?._id === variant._id;
                                            const variantOutOfStock = (variant.stock || 0) === 0;
                                            const discountedPrice = variant.price * (1 - (product.discount || 0) / 100);

                                            return (
                                                <div
                                                    key={variant._id}
                                                    onClick={() => !variantOutOfStock && setSelectedVariant(variant)}
                                                    style={{
                                                        padding: '12px 16px',
                                                        borderRadius: '12px',
                                                        border: isSelected ? '2px solid #52c41a' : '1px solid #e8e8e8',
                                                        backgroundColor: variantOutOfStock ? '#f5f5f5' : isSelected ? '#f6ffed' : '#fff',
                                                        cursor: variantOutOfStock ? 'not-allowed' : 'pointer',
                                                        opacity: variantOutOfStock ? 0.6 : 1,
                                                        transition: 'all 0.2s ease',
                                                        minWidth: '100px',
                                                        textAlign: 'center',
                                                        position: 'relative',
                                                        boxShadow: isSelected ? '0 2px 8px rgba(82, 196, 26, 0.2)' : 'none'
                                                    }}
                                                >
                                                    {isSelected && (
                                                        <div style={{
                                                            position: 'absolute',
                                                            top: '-8px',
                                                            right: '-8px',
                                                            backgroundColor: '#52c41a',
                                                            color: '#fff',
                                                            borderRadius: '50%',
                                                            width: '20px',
                                                            height: '20px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontSize: '12px'
                                                        }}>
                                                            ✓
                                                        </div>
                                                    )}
                                                    <div style={{
                                                        fontWeight: 600,
                                                        fontSize: '15px',
                                                        color: variantOutOfStock ? '#999' : '#333'
                                                    }}>
                                                        {variant.label}
                                                    </div>
                                                    <div style={{
                                                        marginTop: '4px',
                                                        fontSize: '16px',
                                                        fontWeight: 700,
                                                        color: variantOutOfStock ? '#999' : '#52c41a'
                                                    }}>
                                                        ₹{discountedPrice.toFixed(0)}
                                                    </div>
                                                    {product.discount > 0 && (
                                                        <div style={{
                                                            fontSize: '12px',
                                                            color: '#999',
                                                            textDecoration: 'line-through'
                                                        }}>
                                                            ₹{variant.price.toFixed(0)}
                                                        </div>
                                                    )}
                                                    {variantOutOfStock && (
                                                        <Tag color="red" style={{ marginTop: '4px', fontSize: '10px' }}>
                                                            Out of Stock
                                                        </Tag>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Price - Dynamic based on variant selection */}
                            <div style={{ marginTop: '20px' }}>
                                <Space align="baseline">
                                    <Text strong className="product-detail-price" style={{ fontSize: '32px', color: '#262626' }}>
                                        ₹{(getCurrentPrice() * (1 - (product.discount || 0) / 100)).toFixed(2)}
                                    </Text>
                                    {product.discount ? (
                                        <Text delete type="secondary" style={{ fontSize: '20px' }}>
                                            ₹{getCurrentPrice().toFixed(2)}
                                        </Text>
                                    ) : (
                                        <Text delete type="secondary" style={{ fontSize: '20px' }}>
                                            ₹{(getCurrentPrice() * 1.2).toFixed(2)}
                                        </Text>
                                    )}
                                    {getCurrentLabel() && (
                                        <Tag color="blue" style={{ marginLeft: '8px' }}>
                                            {getCurrentLabel()}
                                        </Tag>
                                    )}
                                </Space>
                            </div>

                            {/* Description */}
                            <Paragraph style={{ marginTop: '16px', color: '#666', lineHeight: '1.8' }}>
                                {product.description || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'}
                            </Paragraph>

                            {/* Stock Status */}
                            <div style={{ marginTop: '16px' }}>
                                <Text strong>Stock: </Text>
                                {isOutOfStock ? (
                                    <Tag color="red">Out of Stock</Tag>
                                ) : (
                                    <Tag color="green">{availableStock} units available</Tag>
                                )}
                            </div>

                            {/* Order Limit Info */}
                            {settings.orderLimitEnabled && !isOutOfStock && (
                                <div style={{
                                    marginTop: '12px',
                                    padding: '8px 12px',
                                    backgroundColor: '#fff7e6',
                                    borderRadius: '6px',
                                    border: '1px solid #ffd591'
                                }}>
                                    <Text style={{ fontSize: '13px', color: '#d46b08' }}>
                                        <strong>Order Limit:</strong> Max {settings.maxQuantityPerProduct} units per order
                                        {currentCartQuantity > 0 && (
                                            <span> ({currentCartQuantity} already in cart)</span>
                                        )}
                                    </Text>
                                </div>
                            )}

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
                                                disabled={!canIncreaseQuantity || isOutOfStock}
                                                style={{
                                                    border: 'none',
                                                    width: '40px',
                                                    height: '40px',
                                                    color: (canIncreaseQuantity && !isOutOfStock) ? '#1890ff' : '#d9d9d9',
                                                    cursor: (canIncreaseQuantity && !isOutOfStock) ? 'pointer' : 'not-allowed',
                                                    opacity: (canIncreaseQuantity && !isOutOfStock) ? 1 : 0.5
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