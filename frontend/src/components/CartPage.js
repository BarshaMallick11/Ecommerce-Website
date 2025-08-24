// frontend/src/components/CartPage.js
import React from 'react';
import { useCart } from '../context/CartContext';
import BackButton from './BackButton';  
import { List, Button, Typography, Row, Col, Empty, Space, Avatar } from 'antd';
import { DeleteOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Title, Text } = Typography;

const CartPage = () => {
    const { cartItems, removeFromCart, addToCart, decreaseQuantity } = useCart();

    const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    if (cartItems.length === 0) {
        return( 
            <div>
                <BackButton />
                <Empty description="Your cart is empty." />
            </div>
        );
    }

    return (
        <div>
            <div>
                <BackButton />
            </div>
            <Title level={2}>Shopping Cart</Title>
            <List
                itemLayout="vertical"
                dataSource={cartItems}
                renderItem={item => (
                    <List.Item
                        className="cart-item-responsive"
                        actions={[
                            <Button type="text" danger icon={<DeleteOutlined />} onClick={() => removeFromCart(item._id)}>
                                Remove
                            </Button>
                        ]}
                    >
                        <Row align="middle" gutter={[16, 16]}>
                            <Col xs={24} sm={12} md={10}>
                                <List.Item.Meta
                                    avatar={<Avatar shape="square" size={64} src={item.image} />}
                                    title={<Link to={`/product/${item._id}`}>{item.name}</Link>}
                                    description={`Price: ₹${item.price.toFixed(2)}`}
                                />
                            </Col>
                            <Col xs={12} sm={6} md={7} style={{ textAlign: 'center' }}>
                                <Space>
                                    <Button size="small" shape="circle" icon={<MinusOutlined />} onClick={() => decreaseQuantity(item._id)} />
                                    <Text strong>{item.quantity}</Text>
                                    <Button size="small" shape="circle" icon={<PlusOutlined />} onClick={() => addToCart(item)} />
                                </Space>
                            </Col>
                            <Col xs={12} sm={6} md={7} style={{ textAlign: 'right' }}>
                                <Text strong>
                                    ₹{(item.price * item.quantity).toFixed(2)}
                                </Text>
                            </Col>
                        </Row>
                    </List.Item>
                )}
            />
            <Row justify="end" style={{ marginTop: '24px' }}>
                <Col>
                    <Title level={4}>Total: ₹{total.toFixed(2)}</Title>
                    <Link to="/shipping">
                        <Button type="primary" size="large">Proceed to Checkout</Button>
                    </Link>
                </Col>
            </Row>
        </div>
    );
};

export default CartPage;
