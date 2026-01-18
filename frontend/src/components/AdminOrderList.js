// frontend/src/components/AdminOrderList.js
import React, { useState, useEffect, useCallback } from 'react';
import { List, Card, Button, Typography, message, Tag, Modal, Form, Input, Select, Spin, Tooltip, Divider, DatePicker, Popconfirm, Space } from 'antd';
import { DeleteOutlined, DownloadOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import moment from 'moment';
import AdminNav from './AdminNav';
import jsPDF from 'jspdf';

const { Title, Text } = Typography;
const { Option } = Select;

// Bill download function - generates PDF bill
const generateBill = (order) => {
    // Calculate subtotal (total - delivery charge)
    const deliveryCharge = order.deliveryCharge || 0;
    const subtotal = order.totalAmount - deliveryCharge;

    // Create new PDF document
    const doc = new jsPDF();

    // Set font styles
    let yPosition = 20;

    // Header - Store Name
    doc.setFontSize(24);
    doc.setTextColor(79, 119, 45); // #4f772d
    doc.text('Premium.Store', 105, yPosition, { align: 'center' });

    yPosition += 8;
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text('Tax Invoice / Bill of Supply', 105, yPosition, { align: 'center' });

    // Line separator
    yPosition += 5;
    doc.setDrawColor(79, 119, 45);
    doc.setLineWidth(0.5);
    doc.line(20, yPosition, 190, yPosition);

    // Order Information
    yPosition += 10;
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);

    // Left column - Order details
    doc.setFont(undefined, 'bold');
    doc.text('Invoice No:', 20, yPosition);
    doc.setFont(undefined, 'normal');
    doc.text(order._id, 50, yPosition);

    yPosition += 6;
    doc.setFont(undefined, 'bold');
    doc.text('Customer:', 20, yPosition);
    doc.setFont(undefined, 'normal');
    doc.text(order.user?.username || 'Guest', 50, yPosition);

    yPosition += 6;
    doc.setFont(undefined, 'bold');
    doc.text('Date:', 20, yPosition);
    doc.setFont(undefined, 'normal');
    doc.text(moment(order.createdAt).format('DD MMM YYYY, hh:mm A'), 50, yPosition);

    yPosition += 6;
    doc.setFont(undefined, 'bold');
    doc.text('Payment Method:', 20, yPosition);
    doc.setFont(undefined, 'normal');
    doc.text(order.paymentMethod, 50, yPosition);

    // Right column - Shipping address
    let rightYPosition = 43;
    doc.setFont(undefined, 'bold');
    doc.text('Ship To:', 120, rightYPosition);

    rightYPosition += 6;
    doc.setFont(undefined, 'normal');
    doc.text(order.shippingAddress?.address || '', 120, rightYPosition, { maxWidth: 70 });

    rightYPosition += 6;
    doc.text(`${order.shippingAddress?.city || ''}, ${order.shippingAddress?.postalCode || ''}`, 120, rightYPosition);

    rightYPosition += 6;
    doc.text(`${order.shippingAddress?.state || ''}, ${order.shippingAddress?.country || ''}`, 120, rightYPosition);

    rightYPosition += 6;
    doc.text(`Phone: ${order.shippingAddress?.phoneNo || ''}`, 120, rightYPosition);

    // Order Items Section
    yPosition += 15;
    doc.setFillColor(245, 245, 245);
    doc.rect(20, yPosition, 170, 8, 'F');
    doc.setFont(undefined, 'bold');
    doc.text('Order Items', 22, yPosition + 5);

    // Table header
    yPosition += 12;
    doc.setFillColor(79, 119, 45);
    doc.setTextColor(255, 255, 255);
    doc.rect(20, yPosition - 5, 170, 8, 'F');

    doc.setFontSize(9);
    doc.text('#', 22, yPosition);
    doc.text('Product', 30, yPosition);
    doc.text('Unit Price', 100, yPosition);
    doc.text('Qty', 135, yPosition);
    doc.text('Amount', 165, yPosition);

    // Table rows
    yPosition += 6;
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'normal');

    order.products?.forEach((item, index) => {
        const product = item.product || item;
        const price = product.price || 0;
        const discount = product.discount || 0;
        const discountedPrice = price * (1 - discount / 100);
        const qty = item.quantity || item.qty || 1;
        const amount = discountedPrice * qty;
        const unit = product.unit || 'unit';

        if (yPosition > 270) { // Check if we need a new page
            doc.addPage();
            yPosition = 20;
        }

        doc.text((index + 1).toString(), 22, yPosition);
        doc.text(product.name || 'Product', 30, yPosition, { maxWidth: 65 });
        doc.text(`Rs. ${discountedPrice.toFixed(2)}`, 100, yPosition);
        doc.text(`${qty} ${unit}${qty > 1 ? 's' : ''}`, 135, yPosition);
        doc.text(`Rs. ${amount.toFixed(2)}`, 165, yPosition);

        yPosition += 6;
    });

    // Draw table border
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.1);
    doc.line(20, yPosition, 190, yPosition);

    // Totals Section
    yPosition += 10;
    doc.setFontSize(10);

    doc.setFont(undefined, 'bold');
    doc.text('Subtotal:', 120, yPosition);
    doc.setFont(undefined, 'normal');
    doc.text(`Rs. ${subtotal.toFixed(2)}`, 190, yPosition, { align: 'right' });

    yPosition += 6;
    doc.setFont(undefined, 'bold');
    doc.text('Delivery Charge:', 120, yPosition);
    doc.setFont(undefined, 'normal');
    doc.text(deliveryCharge > 0 ? `Rs. ${deliveryCharge.toFixed(2)}` : 'FREE', 190, yPosition, { align: 'right' });

    yPosition += 2;
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.3);
    doc.line(120, yPosition, 190, yPosition);

    yPosition += 6;
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(79, 119, 45);
    doc.text('Grand Total:', 120, yPosition);
    doc.text(`Rs. ${order.totalAmount.toFixed(2)}`, 190, yPosition, { align: 'right' });

    // Additional Info
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'normal');

    if (order.trackingNumber) {
        yPosition += 10;
        doc.setFont(undefined, 'bold');
        doc.text('Tracking Number:', 20, yPosition);
        doc.setFont(undefined, 'normal');
        doc.text(order.trackingNumber, 60, yPosition);
    }

    if (order.estimatedDeliveryDate) {
        yPosition += 6;
        doc.setFont(undefined, 'bold');
        doc.text('Estimated Delivery:', 20, yPosition);
        doc.setFont(undefined, 'normal');
        doc.text(moment(order.estimatedDeliveryDate).format('DD MMM YYYY'), 60, yPosition);
    }

    // Footer
    yPosition = 280;
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.1);
    doc.line(20, yPosition, 190, yPosition);

    yPosition += 5;
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Thank you for shopping with Premium.Store!', 105, yPosition, { align: 'center' });

    yPosition += 5;
    doc.setFontSize(8);
    doc.text('This is a computer-generated invoice and does not require a signature.', 105, yPosition, { align: 'center' });

    // Save the PDF
    const fileName = `Invoice_${order._id.substring(order._id.length - 6)}_${moment(order.createdAt).format('DDMMYYYY')}.pdf`;
    doc.save(fileName);

    // Open the PDF in a new window
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, '_blank');

    message.success('Bill downloaded and opened successfully!');
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