// frontend/src/components/AdminSettings.js
import React, { useEffect, useState } from 'react';
import { Form, Input, InputNumber, Button, Card, Typography, message, Spin, Divider, Switch, Upload, Image } from 'antd';
import { PlusOutlined, CarOutlined, ShoppingOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import AdminNav from './AdminNav';

const { Title, Paragraph, Text } = Typography;

const AdminSettings = () => {
    const [form] = Form.useForm();
    const { token } = useAuth();
    const [loading, setLoading] = useState(true);
    const [qrCodeFile, setQrCodeFile] = useState(null);
    const [qrCodePreview, setQrCodePreview] = useState('');
    const [uploadingQR, setUploadingQR] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            setLoading(true);
            try {
                const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/settings`);
                form.setFieldsValue({
                    contactPhone: data.contactPhone,
                    contactEmail: data.contactEmail,
                    upiId: data.upiId || 'yourname@okaxis',
                    upiEnabled: data.upiEnabled !== false,
                    // Delivery Charge Settings
                    deliveryCharge: data.deliveryCharge || 40,
                    freeDeliveryThreshold: data.freeDeliveryThreshold || 399,
                    deliveryChargeEnabled: data.deliveryChargeEnabled !== false,
                    // Order Limit Settings
                    maxQuantityPerProduct: data.maxQuantityPerProduct || 5,
                    orderLimitEnabled: data.orderLimitEnabled !== false,
                    // Payment Method Settings
                    razorpayEnabled: data.razorpayEnabled === undefined ? true : data.razorpayEnabled,
                    upiManualEnabled: data.upiManualEnabled === undefined ? true : data.upiManualEnabled,
                    codEnabled: data.codEnabled === undefined ? true : data.codEnabled
                });
                // Set QR code preview if exists
                if (data.upiQrCodeUrl) {
                    setQrCodePreview(data.upiQrCodeUrl);
                }
            } catch (error) {
                message.error("Could not load site settings.");
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, [form]);

    const handleQRCodeUpload = async (file) => {
        // Validate file
        const isImage = file.type.startsWith('image/');
        if (!isImage) {
            message.error('You can only upload image files!');
            return false;
        }
        const isLt5M = file.size / 1024 / 1024 < 5;
        if (!isLt5M) {
            message.error('Image must be smaller than 5MB!');
            return false;
        }

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => setQrCodePreview(e.target.result);
        reader.readAsDataURL(file);

        // Store file for upload
        setQrCodeFile(file);
        return false; // Prevent auto upload
    };

    const onFinish = async (values) => {
        const config = { headers: { Authorization: `Bearer ${token}` } };

        try {
            let qrCodeUrl = qrCodePreview;

            // Upload QR code if a new file was selected
            if (qrCodeFile) {
                setUploadingQR(true);
                const formData = new FormData();
                formData.append('qrCode', qrCodeFile);

                try {
                    const { data } = await axios.post(
                        `${process.env.REACT_APP_API_URL}/api/settings/upload-qr`,
                        formData,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                                'Content-Type': 'multipart/form-data'
                            }
                        }
                    );
                    qrCodeUrl = data.url;
                    message.success('QR code uploaded successfully!');
                } catch (error) {
                    message.error('Failed to upload QR code');
                    setUploadingQR(false);
                    return;
                }
                setUploadingQR(false);
            }

            // Update settings with QR code URL
            const settingsData = {
                ...values,
                upiQrCodeUrl: qrCodeUrl
            };

            await axios.put(`${process.env.REACT_APP_API_URL}/api/settings`, settingsData, config);
            message.success('Settings updated successfully!');

            // Clear the file after successful upload
            setQrCodeFile(null);
        } catch (error) {
            message.error('Failed to update settings.');
        }
    };

    return (
        <div>
            <Title level={2}>Admin Dashboard</Title>
            <AdminNav />

            <Title level={4} style={{ marginTop: '24px' }}>Site Settings</Title>

            {loading ? <Spin /> : (
                <Form form={form} onFinish={onFinish} layout="vertical">
                    {/* Contact Information */}
                    <Card style={{ marginBottom: 24 }}>
                        <Title level={5}>Contact Information</Title>
                        <Form.Item name="contactPhone" label="Contact Phone Number for Help Page">
                            <Input placeholder="Enter a phone number" size="large" />
                        </Form.Item>
                        <Form.Item name="contactEmail" label="Contact Email for Help Page">
                            <Input placeholder="Enter an email address" size="large" />
                        </Form.Item>
                    </Card>

                    {/* UPI Payment Settings */}
                    <Card style={{ marginBottom: 24 }}>
                        <Title level={5}>UPI Payment Settings</Title>
                        <Paragraph type="secondary">
                            Configure your UPI payment details. These will be shown to customers when they choose UPI payment option.
                        </Paragraph>

                        <Form.Item
                            name="upiEnabled"
                            label="Enable UPI Payments"
                            valuePropName="checked"
                        >
                            <Switch />
                        </Form.Item>

                        <Form.Item
                            name="upiId"
                            label="UPI ID"
                            rules={[{ required: true, message: 'Please enter your UPI ID' }]}
                            extra="Your UPI ID (e.g., yourname@okaxis, 9876543210@paytm)"
                        >
                            <Input
                                placeholder="yourname@okaxis"
                                size="large"
                                prefix="💳"
                            />
                        </Form.Item>

                        <Divider />

                        {/* UPI QR Code Upload */}
                        <div>
                            <Title level={5}>UPI QR Code</Title>
                            <Paragraph type="secondary" style={{ marginBottom: 16 }}>
                                Upload your UPI QR code image. Customers will scan this to pay.
                            </Paragraph>

                            {/* Current QR Code Preview */}
                            {qrCodePreview && (
                                <div style={{ marginBottom: 16 }}>
                                    <Text strong style={{ display: 'block', marginBottom: 8 }}>Current QR Code:</Text>
                                    <Image
                                        src={qrCodePreview}
                                        alt="UPI QR Code"
                                        width={200}
                                        style={{ border: '2px solid #d9d9d9', borderRadius: 8 }}
                                    />
                                </div>
                            )}

                            {/* Upload New QR Code */}
                            <Upload
                                beforeUpload={handleQRCodeUpload}
                                maxCount={1}
                                listType="picture-card"
                                showUploadList={false}
                                accept="image/*"
                            >
                                <div>
                                    <PlusOutlined />
                                    <div style={{ marginTop: 8 }}>
                                        {qrCodeFile ? 'Change QR Code' : 'Upload QR Code'}
                                    </div>
                                </div>
                            </Upload>

                            <Paragraph type="secondary" style={{ marginTop: 8, fontSize: 12 }}>
                                Click to upload a new QR code (JPG, PNG, WebP - Max 5MB)
                            </Paragraph>
                        </div>

                        <Divider />

                        <Paragraph type="warning" style={{ fontSize: 12 }}>
                            <strong>How to get your UPI QR Code:</strong><br />
                            1. Open Google Pay / PhonePe / Paytm<br />
                            2. Go to Profile → QR Code<br />
                            3. Take a screenshot or download your QR<br />
                            4. Upload it using the button above
                        </Paragraph>
                    </Card>

                    {/* Delivery Charge Settings */}
                    <Card style={{ marginBottom: 24 }}>
                        <Title level={5}>
                            <CarOutlined style={{ marginRight: 8 }} />
                            Delivery Charge Settings
                        </Title>
                        <Paragraph type="secondary">
                            Configure delivery charges and free delivery threshold for your store.
                        </Paragraph>

                        <Form.Item
                            name="deliveryChargeEnabled"
                            label="Enable Delivery Charges"
                            valuePropName="checked"
                        >
                            <Switch />
                        </Form.Item>

                        <Form.Item
                            name="deliveryCharge"
                            label="Delivery Charge (₹)"
                            rules={[{ required: true, message: 'Please enter delivery charge' }]}
                            extra="Amount charged for delivery on orders below the free delivery threshold"
                        >
                            <InputNumber
                                min={0}
                                max={500}
                                size="large"
                                style={{ width: '100%' }}
                                prefix="₹"
                                placeholder="40"
                            />
                        </Form.Item>

                        <Form.Item
                            name="freeDeliveryThreshold"
                            label="Free Delivery Above (₹)"
                            rules={[{ required: true, message: 'Please enter free delivery threshold' }]}
                            extra="Orders above this amount will get FREE delivery"
                        >
                            <InputNumber
                                min={0}
                                max={5000}
                                size="large"
                                style={{ width: '100%' }}
                                prefix="₹"
                                placeholder="399"
                            />
                        </Form.Item>

                        <div style={{
                            background: '#f6ffed',
                            padding: '12px',
                            borderRadius: '8px',
                            border: '1px solid #b7eb8f'
                        }}>
                            <Text>
                                <strong>Current Rule:</strong> Orders above ₹{form.getFieldValue('freeDeliveryThreshold') || 399} get
                                <Text strong style={{ color: '#52c41a' }}> FREE Delivery</Text>.
                                Others pay ₹{form.getFieldValue('deliveryCharge') || 40} delivery charge.
                            </Text>
                        </div>
                    </Card>

                    {/* Order Limit Settings */}
                    <Card style={{ marginBottom: 24 }}>
                        <Title level={5}>
                            <ShoppingOutlined style={{ marginRight: 8 }} />
                            Order Quantity Limits
                        </Title>
                        <Paragraph type="secondary">
                            Control how many units of each product a customer can order. This helps prevent bulk buying and ensures fair distribution.
                        </Paragraph>

                        <Form.Item
                            name="orderLimitEnabled"
                            label="Enable Order Limits"
                            valuePropName="checked"
                        >
                            <Switch />
                        </Form.Item>

                        <Form.Item
                            name="maxQuantityPerProduct"
                            label="Maximum Quantity Per Product"
                            rules={[{ required: true, message: 'Please enter maximum quantity' }]}
                            extra="Maximum number of units a customer can order per product"
                        >
                            <InputNumber
                                min={1}
                                max={100}
                                size="large"
                                style={{ width: '100%' }}
                                placeholder="5"
                            />
                        </Form.Item>

                        <div style={{
                            background: '#fff7e6',
                            padding: '12px',
                            borderRadius: '8px',
                            border: '1px solid #ffd591'
                        }}>
                            <Text>
                                <strong>Current Limit:</strong> Customers can order a maximum of{' '}
                                <Text strong style={{ color: '#fa8c16' }}>
                                    {form.getFieldValue('maxQuantityPerProduct') || 5} units
                                </Text>{' '}
                                per product.
                            </Text>
                        </div>
                    </Card>

                    {/* Payment Method Settings */}
                    <Card style={{ marginBottom: 24 }}>
                        <Title level={5}>
                            💳 Payment Methods
                        </Title>
                        <Paragraph type="secondary">
                            Enable or disable payment methods available to customers during checkout.
                        </Paragraph>

                        <Form.Item
                            name="razorpayEnabled"
                            label="Razorpay (Online Payments)"
                            valuePropName="checked"
                            extra="Accept online payments via Razorpay payment gateway (Credit/Debit Cards, UPI, Wallets)"
                        >
                            <Switch />
                        </Form.Item>

                        <Form.Item
                            name="upiManualEnabled"
                            label="UPI Manual Pay"
                            valuePropName="checked"
                            extra="Allow customers to pay via UPI by scanning QR code and uploading payment proof"
                        >
                            <Switch />
                        </Form.Item>

                        <Form.Item
                            name="codEnabled"
                            label="Cash on Delivery (COD)"
                            valuePropName="checked"
                            extra="Enable COD option for customers to pay at the time of delivery"
                        >
                            <Switch />
                        </Form.Item>

                        <div style={{
                            background: '#e6f7ff',
                            padding: '12px',
                            borderRadius: '8px',
                            border: '1px solid #91d5ff',
                            marginTop: 16
                        }}>
                            <Text>
                                <strong>Note:</strong> At least one payment method must be enabled. Disabled payment options will be hidden from customers at checkout.
                            </Text>
                        </div>
                    </Card>

                    {/* Save Button */}
                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            size="large"
                            loading={uploadingQR}
                            style={{ minWidth: 200 }}
                        >
                            {uploadingQR ? 'Uploading QR Code...' : 'Save All Settings'}
                        </Button>
                    </Form.Item>
                </Form>
            )}
        </div>
    );
};

export default AdminSettings;
