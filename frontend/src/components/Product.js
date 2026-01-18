// frontend/src/components/Product.js

import React from 'react';
import { Card, Button, Typography, message, Rate, Tooltip } from 'antd';
import { MinusOutlined, PlusOutlined, EditOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';

const { Text } = Typography;

const Product = ({ product }) => {
    const { cartItems, addToCart, decreaseQuantity: decreaseCartQuantity } = useCart();
    const { user } = useAuth();
    const { settings } = useSettings();
    const navigate = useNavigate();

    // Check if product has variants
    const hasVariants = product.hasVariants && product.unitVariants && product.unitVariants.length > 0;

    // Get default variant or first variant if has variants
    const defaultVariant = hasVariants
        ? (product.unitVariants.find(v => v.isDefault) || product.unitVariants[0])
        : null;

    // Get display price (use default variant price if available)
    const displayPrice = hasVariants && defaultVariant ? defaultVariant.price : product.price;

    // Get starting price (lowest price among variants)
    const startingPrice = hasVariants
        ? Math.min(...product.unitVariants.map(v => v.price))
        : product.price;

    // Find if this product is in the cart
    const cartItem = cartItems.find(item => item._id === product._id);
    const currentQuantity = cartItem ? cartItem.quantity : 0;

    // Stock management - use default variant stock if has variants
    const availableStock = hasVariants && defaultVariant ? (defaultVariant.stock || 0) : (product.stock || 0);
    const isOutOfStock = hasVariants
        ? product.unitVariants.every(v => (v.stock || 0) === 0)
        : availableStock === 0;

    // Order limit management
    const maxOrderLimit = settings.orderLimitEnabled ? settings.maxQuantityPerProduct : Infinity;
    const effectiveMax = Math.min(availableStock, maxOrderLimit);
    const canAddMore = currentQuantity < effectiveMax;
    const isAtOrderLimit = settings.orderLimitEnabled && currentQuantity >= maxOrderLimit;

    const handlePlusClick = () => {
        // If product has variants, redirect to product page for selection
        if (hasVariants) {
            navigate(`/product/${product._id}`);
            return;
        }

        if (!user) {
            message.warning('Please log in to add items to your cart.');
            navigate('/login');
            return;
        }

        if (isOutOfStock) {
            message.error('This product is out of stock');
            return;
        }

        if (!canAddMore) {
            if (isAtOrderLimit) {
                message.warning(`Maximum ${maxOrderLimit} units allowed per product.`);
            } else {
                message.warning(`Only ${availableStock} units available. You already have ${currentQuantity} in cart.`);
            }
            return;
        }

        addToCart(product);
    };

    const increaseQuantity = () => {
        if (!canAddMore) {
            if (isAtOrderLimit) {
                message.warning(`Maximum ${maxOrderLimit} units allowed per product.`);
            } else {
                message.warning(`Limited stock! Only ${availableStock} units available.`);
            }
            return;
        }
        addToCart(product);
    };

    const decreaseQuantity = () => {
        decreaseCartQuantity(product._id);
    };

    return (
        <Card
            hoverable
            style={{
                width: '100%',
                border: 'none',
                backgroundColor: '#fff',
                borderRadius: '16px',
                overflow: 'visible',
                position: 'relative',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
            }}
            cover={
                <div className="product-card-cover">
                    <Link to={`/product/${product._id}`} style={{ width: '100%', height: '100%' }}>
                        <img
                            alt={product.name}
                            src={product.image}
                        />
                    </Link>
                </div>
            }
            bodyStyle={{ padding: '16px' }}
        >
            {/* Product Title with Plus Button (inline on desktop, separate on mobile) */}
            <div className="product-header-section">
                {/* 1. Product Title */}
                <div className="product-title-content" style={{ marginBottom: '8px' }}>
                    {/* Desktop: Product Name + Quantity Badge */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <Link to={`/product/${product._id}`} className="product-title-link">
                            <Text
                                strong
                                className="product-name-text"
                                style={{
                                    fontSize: '16px',
                                    color: '#262626',
                                    lineHeight: '1.4'
                                }}
                            >
                                {product.name}
                            </Text>
                        </Link>

                        {/* Desktop-only: Quantity Badge OR Variant Options Badge */}
                        {hasVariants ? (
                            <span className="quantity-badge-desktop" style={{
                                backgroundColor: '#e6f7ff',
                                color: '#1890ff',
                                padding: '2px 8px',
                                borderRadius: '10px',
                                fontSize: '11px',
                                fontWeight: '600',
                                border: '1px solid #91d5ff',
                                whiteSpace: 'nowrap'
                            }}>
                                {product.unitVariants.length} options
                            </span>
                        ) : product.quantity > 0 && (
                            <span className="quantity-badge-desktop" style={{
                                backgroundColor: '#d4f4dd',
                                color: '#16a34a',
                                padding: '2px 8px',
                                borderRadius: '10px',
                                fontSize: '11px',
                                fontWeight: '600',
                                border: '1px solid #86efac',
                                whiteSpace: 'nowrap'
                            }}>
                                {product.quantity} {product.unit || 'Kg'}
                            </span>
                        )}
                    </div>

                    {/* Mobile-only: Product description */}
                    <div className="product-description-mobile">
                        <Text
                            type="secondary"
                            style={{ fontSize: '12px' }}
                        >
                            {product.description}
                        </Text>
                    </div>

                    {/* Mobile-only: Badges (Quantity/Variants + Discount) */}
                    <div className="product-badges-mobile">
                        {hasVariants ? (
                            <span className="quantity-badge-mobile" style={{
                                backgroundColor: '#e6f7ff',
                                color: '#1890ff',
                                border: '1px solid #91d5ff'
                            }}>
                                {product.unitVariants.length} options
                            </span>
                        ) : product.quantity > 0 && (
                            <span className="quantity-badge-mobile">
                                {product.quantity} {product.unit || 'Kg'}
                            </span>
                        )}
                        {product.discount > 0 && (
                            <span className="discount-badge-mobile">
                                -{product.discount}%
                            </span>
                        )}
                    </div>

                    {/* Mobile-only: Rating (after badges, before price) */}
                    <div className="product-rating-mobile" style={{ display: 'none', marginTop: '4px' }}>
                        <Rate
                            disabled
                            allowHalf
                            value={product.rating || 0}
                            style={{ fontSize: '10px' }}
                        />
                    </div>
                </div>

                {/* Admin Edit Button - Mobile only */}
                {user?.isAdmin && (
                    <div className="admin-edit-wrapper" style={{
                        display: 'none', // Hidden on desktop, shown on mobile via CSS
                        position: 'absolute',
                        bottom: '12px',
                        right: '12px'
                    }}>
                        <Tooltip title="Edit Product (Admin)">
                            <Button
                                icon={<EditOutlined />}
                                className="product-admin-edit-btn"
                                style={{
                                    backgroundColor: '#1890ff',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '40px',
                                    height: '40px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 2px 8px rgba(24, 144, 255, 0.3)'
                                }}
                            />
                        </Tooltip>
                    </div>
                )}

                {/* Plus Icon / Out of Stock - Shows inline on desktop, separate on mobile */}
                {!user?.isAdmin && (
                    <div className="plus-icon-wrapper">
                        {isOutOfStock ? (
                            // Out of Stock Text
                            <div style={{
                                backgroundColor: '#fff1f0',
                                color: '#bf1725ff',
                                padding: '9px 12px',
                                borderRadius: '16px',
                                fontSize: '13px',
                                fontWeight: '600',
                                fontStyle: 'italic',
                                border: '1px solid #ffccc7',
                                whiteSpace: 'nowrap'
                            }}>
                                Out of Stock
                            </div>
                        ) : currentQuantity === 0 ? (
                            // Plus Button
                            <Button
                                icon={<PlusOutlined />}
                                onClick={handlePlusClick}
                                shape="circle"
                                size="small"
                                className="add-cart-btn-mobile"
                                style={{
                                    backgroundColor: 'white',
                                    border: '1px solid #e8e8e8',
                                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                                    width: '32px',
                                    height: '32px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '14px',
                                    color: '#1890ff'
                                }}
                            />
                        ) : (
                            // Quantity Controls
                            <div className="qty-controls-mobile" style={{
                                backgroundColor: 'white',
                                borderRadius: '16px',
                                padding: '4px 8px',
                                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
                                border: '1px solid #e8e8e8',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                height: '32px'
                            }}>
                                <Button
                                    icon={<MinusOutlined />}
                                    onClick={decreaseQuantity}
                                    size="small"
                                    shape="circle"
                                    style={{
                                        border: 'none',
                                        color: '#ff4d4f',
                                        fontSize: '10px',
                                        width: '20px',
                                        height: '20px',
                                        minWidth: '20px',
                                        padding: 0
                                    }}
                                />
                                <Text strong style={{ fontSize: '12px', minWidth: '12px', textAlign: 'center' }}>
                                    {currentQuantity}
                                </Text>
                                <Button
                                    icon={<PlusOutlined />}
                                    onClick={increaseQuantity}
                                    size="small"
                                    shape="circle"
                                    disabled={!canAddMore}
                                    style={{
                                        border: 'none',
                                        color: canAddMore ? '#1890ff' : '#d9d9d9',
                                        fontSize: '10px',
                                        width: '20px',
                                        height: '20px',
                                        minWidth: '20px',
                                        padding: 0,
                                        cursor: canAddMore ? 'pointer' : 'not-allowed',
                                        opacity: canAddMore ? 1 : 0.5
                                    }}
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* 2. Rating Row */}
            <div className="product-rating-row" style={{ marginBottom: '8px' }}>
                <div>
                    <Rate
                        disabled
                        allowHalf
                        value={product.rating || 0}
                        style={{ fontSize: '10px' }}
                    />
                    <div style={{ marginTop: '2px' }}>
                        <Text type="secondary" style={{ fontSize: '9px' }}>
                            ({product.numReviews || 0} reviews)
                        </Text>
                    </div>
                </div>
            </div>

            {/* 3. Price & Add to Cart Button (Horizontal) */}
            <div className="product-price-row" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                minHeight: '36px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <div className="price-container-mobile">
                        <Text
                            strong
                            className="product-price-text"
                            style={{
                                fontSize: '18px',
                                color: '#262626',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            {hasVariants ? (
                                <>₹{(startingPrice * (1 - (product.discount || 0) / 100)).toFixed(0)}</>
                            ) : (
                                <>₹{(product.price * (1 - (product.discount || 0) / 100)).toFixed(0)}</>
                            )}
                        </Text>
                        {/* Mobile-only: Original price with strikethrough */}
                        {product.discount > 0 && (
                            <Text
                                className="original-price-mobile"
                                type="secondary"
                                delete
                                style={{
                                    fontSize: '13px',
                                    marginLeft: '8px'
                                }}
                            >
                                ₹{(hasVariants ? startingPrice : product.price).toFixed(0)}
                            </Text>
                        )}
                        {/* Show "onwards" for products with variants */}
                        {hasVariants && (
                            <Text
                                type="secondary"
                                style={{
                                    fontSize: '11px',
                                    marginLeft: '4px'
                                }}
                            >
                                onwards
                            </Text>
                        )}
                    </div>

                    {/* Desktop-only: Discount Badge (next to price) */}
                    {product.discount > 0 && (
                        <span className="discount-badge-desktop" style={{
                            backgroundColor: '#fee2e2',
                            color: '#dc2626',
                            padding: '2px 8px',
                            borderRadius: '10px',
                            fontSize: '11px',
                            fontWeight: '600',
                            border: '1px solid #fca5a5',
                            whiteSpace: 'nowrap'
                        }}>
                            -{product.discount}% OFF
                        </span>
                    )}
                </div>
            </div>
        </Card>
    );
};

export default Product;