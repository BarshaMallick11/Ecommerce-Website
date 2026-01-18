// frontend/src/components/AdminOrderList.js
import React, { useState, useEffect, useCallback } from 'react';
import { List, Card, Button, Typography, message, Tag, Modal, Form, Input, Select, Spin, Tooltip, Divider, DatePicker, Popconfirm, Space } from 'antd';
import { DeleteOutlined, DownloadOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import moment from 'moment';
import AdminNav from './AdminNav';

const { Title, Text } = Typography;
const { Option } = Select;

// Bill download function - generates PDF-like bill
const generateBill = (order) => {
    // Calculate subtotal (total - delivery charge)
    const deliveryCharge = order.deliveryCharge || 0;
    const subtotal = order.totalAmount - deliveryCharge;

    const billContent = `
<!DOCTYPE html>
<html>
<head>
    <title>Invoice - ${order._id}</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
        .header { text-align: center; border-bottom: 2px solid #4f772d; padding-bottom: 20px; margin-bottom: 20px; }
        .header h1 { color: #4f772d; margin: 0; }
        .header p { color: #666; margin: 5px 0; }
        .order-info { display: flex; justify-content: space-between; margin-bottom: 20px; }
        .order-info div { flex: 1; }
        .section-title { background: #f5f5f5; padding: 10px; font-weight: bold; margin: 15px 0 10px 0; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
        th { background: #4f772d; color: white; }
        .totals { text-align: right; margin-top: 20px; }
        .totals p { margin: 5px 0; }
        .totals .grand-total { font-size: 18px; font-weight: bold; color: #4f772d; }
        .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; }
        .status-tag { display: inline-block; padding: 4px 12px; border-radius: 4px; font-size: 12px; }
        .status-processing { background: #e6f7ff; color: #1890ff; }
        .status-shipped { background: #fff7e6; color: #fa8c16; }
        .status-delivered { background: #f6ffed; color: #52c41a; }
        .status-cancelled { background: #fff1f0; color: #f5222d; }
        @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
    </style>
</head>
<body>
    <div class="header">
        <h1>Premium.Store</h1>
        <p>Tax Invoice / Bill of Supply</p>
    </div>

    <div class="order-info">
        <div>
            <strong>Invoice No:</strong> ${order._id}<br>
            <strong>Date:</strong> ${moment(order.createdAt).format('DD MMM YYYY, hh:mm A')}<br>
            <strong>Payment Method:</strong> ${order.paymentMethod}<br>
            <strong>Status:</strong> <span class="status-tag status-${order.status?.toLowerCase()}">${order.status}</span>
        </div>
        <div style="text-align: right;">
            <strong>Ship To:</strong><br>
            ${order.shippingAddress?.address || ''}<br>
            ${order.shippingAddress?.city || ''}, ${order.shippingAddress?.postalCode || ''}<br>
            ${order.shippingAddress?.state || ''}, ${order.shippingAddress?.country || ''}<br>
            Phone: ${order.shippingAddress?.phoneNo || ''}
        </div>
    </div>

    <div class="section-title">Order Items</div>
    <table>
        <thead>
            <tr>
                <th>#</th>
                <th>Product</th>
                <th>Unit Price</th>
                <th>Qty</th>
                <th>Amount</th>
            </tr>
        </thead>
        <tbody>
            ${order.products?.map((item, index) => {
                const product = item.product || item;
                const price = product.price || 0;
                const discount = product.discount || 0;
                const discountedPrice = price * (1 - discount / 100);
                const qty = item.quantity || item.qty || 1;
                const amount = discountedPrice * qty;
                return `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${product.name || 'Product'}</td>
                        <td>₹${discountedPrice.toFixed(2)}${discount > 0 ? ` <small style="color:#999;text-decoration:line-through">₹${price.toFixed(2)}</small>` : ''}</td>
                        <td>${qty} ${product.unit || 'unit'}${qty > 1 ? 's' : ''}</td>
                        <td>₹${amount.toFixed(2)}</td>
                    </tr>
                `;
            }).join('') || ''}
        </tbody>
    </table>

    <div class="totals">
        <p><strong>Subtotal:</strong> ₹${subtotal.toFixed(2)}</p>
        <p><strong>Delivery Charge:</strong> ${deliveryCharge > 0 ? '₹' + deliveryCharge.toFixed(2) : 'FREE'}</p>
        <p class="grand-total"><strong>Grand Total:</strong> ₹${order.totalAmount.toFixed(2)}</p>
    </div>

    ${order.trackingNumber ? `<p><strong>Tracking Number:</strong> ${order.trackingNumber}</p>` : ''}
    ${order.estimatedDeliveryDate ? `<p><strong>Estimated Delivery:</strong> ${moment(order.estimatedDeliveryDate).format('DD MMM YYYY')}</p>` : ''}

    <div class="footer">
        <p>Thank you for shopping with Premium.Store!</p>
        <p style="font-size: 12px;">This is a computer-generated invoice and does not require a signature.</p>
    </div>
</body>
</html>
    `;

    // Create and download
    const blob = new Blob([billContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Invoice_${order._id.substring(order._id.length - 6)}_${moment(order.createdAt).format('DDMMYYYY')}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    message.success('Bill downloaded successfully!');
};

const AdminOrderList = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const { token } = useAuth();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [currentOrder, setCurrentOrder] = useState(null);
    const [form] = Form.useForm();

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/orders/all`, config);
            setOrders(data);
        } catch (error) {
            message.error('Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (token) { fetchOrders(); }
    }, [token, fetchOrders]);

    const handleUpdateStatus = async (values) => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.put(`${process.env.REACT_APP_API_URL}/api/orders/${currentOrder._id}/status`, values, config);
            message.success('Order status updated');
            setIsModalVisible(false);
            fetchOrders();
        } catch (error) {
            message.error('Failed to update order status');
        }
    };
    const handleDelete = async (id) => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.delete(`${process.env.REACT_APP_API_URL}/api/orders/${id}`, config);
            message.success('Order deleted successfully');
            fetchOrders(); // Refresh the list
        } catch (error) {
            message.error('Failed to delete order');
        }
    };

    const showUpdateModal = (order) => {
        setCurrentOrder(order);
        form.setFieldsValue({
            status: order.status,
            trackingNumber: order.trackingNumber,
            estimatedDeliveryDate: order.estimatedDeliveryDate ? moment(order.estimatedDeliveryDate) : null
        });
        setIsModalVisible(true);
    };

    const StatusTag = ({ status }) => {
        let color = 'geekblue';
        if (status === 'Shipped') color = 'orange';
        if (status === 'Delivered') color = 'green';
        if (status === 'Cancelled') color = 'red';
        return <Tag color={color}>{status ? status.toUpperCase() : 'N/A'}</Tag>;
    };

    return (
        <div>
            <Title level={2}>Admin Dashboard</Title>
            <AdminNav />

            <Title level={4} style={{ marginTop: 24 }}>All Customer Orders</Title>

            {loading && orders.length === 0 ? <div style={{ textAlign: 'center', marginTop: 50 }}><Spin size="large" /></div> : (
                <List
                    grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3, xl: 4 }}
                    dataSource={orders}
                    renderItem={(order) => (
                        <List.Item>
                            <Card
                                title={
                                    <Tooltip title={order._id}>
                                        <span>{`Order: ...${order._id.substring(order._id.length - 6)}`}</span>
                                    </Tooltip>
                                }
                                extra={
                                    <Space>
                                        <Tooltip title="Download Bill">
                                            <Button shape="circle" icon={<DownloadOutlined />} onClick={() => generateBill(order)} />
                                        </Tooltip>
                                        <Popconfirm title="Are you sure you want to delete this order?" onConfirm={() => handleDelete(order._id)}>
                                            <Button shape="circle" danger icon={<DeleteOutlined />} />
                                        </Popconfirm>
                                    </Space>
                                }
                            >
                                <p><Text strong>User:</Text> {order.user ? order.user.username : 'N/A'}</p>
                                <p><Text strong>Date:</Text> {moment(order.createdAt).format('YYYY-MM-DD')}</p>

                                {/* Product Items */}
                                <div style={{
                                    background: '#f9f9f9',
                                    padding: '10px 12px',
                                    borderRadius: '6px',
                                    margin: '8px 0'
                                }}>
                                    <Text strong style={{ fontSize: '13px', color: '#555' }}>Items Ordered:</Text>
                                    <div style={{ marginTop: '6px' }}>
                                        {order.products && order.products.map((item, index) => {
                                            const product = item.product || item;
                                            const price = product.price || 0;
                                            const discount = product.discount || 0;
                                            const discountedPrice = price * (1 - discount / 100);
                                            const qty = item.quantity || item.qty || 1;
                                            const itemTotal = discountedPrice * qty;
                                            const unit = product.unit || 'unit';

                                            return (
                                                <div
                                                    key={index}
                                                    style={{
                                                        padding: '6px 0',
                                                        borderBottom: index < order.products.length - 1 ? '1px solid #eee' : 'none'
                                                    }}
                                                >
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <Text style={{ fontSize: '13px', flex: 1, fontWeight: 500 }}>
                                                            {product.name || 'Product'}
                                                        </Text>
                                                        <Tag color="blue">
                                                            {qty} {unit}{qty > 1 ? 's' : ''}
                                                        </Tag>
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#888', marginTop: '2px' }}>
                                                        <span>₹{discountedPrice.toFixed(2)} × {qty}</span>
                                                        <span style={{ fontWeight: 500, color: '#333' }}>₹{itemTotal.toFixed(2)}</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Pricing Summary */}
                                <div style={{ background: '#fafafa', padding: '8px 10px', borderRadius: '4px', margin: '8px 0' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                        <Text style={{ fontSize: '12px', color: '#666' }}>Subtotal:</Text>
                                        <Text style={{ fontSize: '12px' }}>₹{(order.totalAmount - (order.deliveryCharge || 0)).toFixed(2)}</Text>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                        <Text style={{ fontSize: '12px', color: '#666' }}>Delivery Charge:</Text>
                                        <Text style={{ fontSize: '12px', color: order.deliveryCharge > 0 ? '#333' : '#52c41a' }}>
                                            {order.deliveryCharge > 0 ? `₹${order.deliveryCharge.toFixed(2)}` : 'FREE'}
                                        </Text>
                                    </div>
                                    <Divider style={{ margin: '6px 0' }} />
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Text strong>Total:</Text>
                                        <Text strong style={{ color: '#4f772d', fontSize: '15px' }}>₹{order.totalAmount.toFixed(2)}</Text>
                                    </div>
                                </div>
                                <p><Text strong>Payment Mode:</Text>
                                    <Tag color={order.paymentMethod === 'COD' ? 'green' : 'blue'}>
                                        {order.paymentMethod === 'COD' ? 'COD' : order.paymentMethod === 'UPI' ? 'UPI (Paid)' : order.paymentMethod}
                                    </Tag>
                                </p>
                                <p><Text strong>Status:</Text> <StatusTag status={order.status} /></p>
                                {order.trackingNumber && <p><Text strong>Tracking #:</Text> {order.trackingNumber}</p>}
                                {order.estimatedDeliveryDate && <p><Text strong>Est. Delivery:</Text> {moment(order.estimatedDeliveryDate).format('YYYY-MM-DD')}</p>}

                                <Divider style={{ margin: '12px 0' }} />
                                <p><Text strong>Shipping Address:</Text></p>
                                <Text>{order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.postalCode}</Text><br />
                                <Text>{order.shippingAddress.country}</Text><br />
                                <Text>Phone: {order.shippingAddress.phoneNo}</Text>
                                <Button type="primary" style={{ width: '100%', marginTop: 16 }} onClick={() => showUpdateModal(order)} disabled={order.status === 'Delivered'}>
                                    Update Status
                                </Button>
                            </Card>
                        </List.Item>
                    )}
                />
            )}

            <Modal
                title="Update Order Status"
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                onOk={() => form.submit()}
                destroyOnHidden
            >
                <Form form={form} layout="vertical" onFinish={handleUpdateStatus}>
                    <Form.Item name="status" label="Status">
                        <Select>
                            <Option value="Processing">Processing</Option>
                            <Option value="Shipped">Shipped</Option>
                            <Option value="Delivered">Delivered</Option>
                            <Option value="Cancelled">Cancelled</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="trackingNumber" label="Tracking Number">
                        <Input placeholder="Enter tracking number" />
                    </Form.Item>
                    <Form.Item name="estimatedDeliveryDate" label="Estimated Delivery Date">
                        <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default AdminOrderList;