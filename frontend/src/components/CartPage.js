// frontend/src/components/CartPage.js
import React from 'react';
import BackButton from './BackButton';
import { useCart } from '../context/CartContext';
import { List, Button, Typography, Row, Col, Empty } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Title} = Typography;

const CartPage = () => {
    const { cartItems, removeFromCart } = useCart();

    const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    if (cartItems.length === 0) {
        return <Empty description="Your cart is empty." />;
    }

    return (
        <div>
            <BackButton />
            <Title level={2}>Shopping Cart</Title>
            <List
                itemLayout="horizontal"
                dataSource={cartItems}
                renderItem={item => (
                    <List.Item
                        actions={[
                            <Button type="text" danger icon={<DeleteOutlined />} onClick={() => removeFromCart(item._id)}>
                                Remove
                            </Button>
                        ]}
                    >
                        <List.Item.Meta
                            avatar={<img src={item.image} alt={item.name} style={{ width: 50 }} />}
                            title={<a href={`/product/${item._id}`}>{item.name}</a>}
                            description={`Quantity: ${item.quantity}`}
                        />
                        <div>₹{(item.price * item.quantity).toFixed(2)}</div>
                    </List.Item>
                )}
            />
            <Row justify="end" style={{ marginTop: '24px' }}>
                <Col>
                    <Title level={4}>Total: ₹{total.toFixed(2)}</Title>
                    <Link to="/shipping">  {/* Add this Link component */}
                        <Button type="primary" size="large">Proceed to Checkout</Button>
                    </Link>
                </Col>
            </Row>
        </div>
    );
};

export default CartPage;