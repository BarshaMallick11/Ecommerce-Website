// frontend/src/components/UpiPaymentModal.js
import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Upload, Button, message, Typography, Divider, Card, Space } from 'antd';
import { UploadOutlined, CopyOutlined, CheckCircleOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const { Title, Text, Paragraph } = Typography;

const UpiPaymentModal = ({ visible, onClose, orderId, amount, onSuccess }) => {
    const [form] = Form.useForm();
    const { token } = useAuth();
    const [loading, setLoading] = useState(false);
    const [fileList, setFileList] = useState([]);
    const [upiSettings, setUpiSettings] = useState({
        upiId: 'Loading...',
        upiQrCodeUrl: '/upi-qr-code.png'
    });

    // Fetch UPI settings from backend
    useEffect(() => {
        const fetchUpiSettings = async () => {
            try {
                const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/settings`);
                if (data && data.upiId) {
                    setUpiSettings({
                        upiId: data.upiId,
                        upiQrCodeUrl: data.upiQrCodeUrl || '/upi-qr-code.png'
                    });
                }
            } catch (error) {
                console.error('Failed to fetch UPI settings:', error);
            }
        };
        if (visible) {
            fetchUpiSettings();
        }
    }, [visible]);

    const handleCopyUPI = () => {
        navigator.clipboard.writeText(upiSettings.upiId);
        message.success('UPI ID copied to clipboard!');
    };

    const handleSubmit = async (values) => {
        if (fileList.length === 0) {
            message.error('Please upload payment screenshot');
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('orderId', orderId);
        formData.append('utr', values.utr);
        formData.append('amount', amount);
        formData.append('payeeName', values.payeeName || '');
        formData.append('screenshot', fileList[0].originFileObj);

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            };

            const { data } = await axios.post(
                `${process.env.REACT_APP_API_URL}/api/upi-payment/submit`,
                formData,
                config
            );

            message.success(data.message);
            form.resetFields();
            setFileList([]);
            onSuccess();
            onClose();
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Failed to submit payment proof';
            message.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const uploadProps = {
        beforeUpload: (file) => {
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
            // Store file in Ant Design format with originFileObj
            setFileList([{
                uid: '-1',
                name: file.name,
                status: 'done',
                originFileObj: file
            }]);
            return false; // Prevent auto upload
        },
        fileList,
        onRemove: () => {
            setFileList([]);
        },
        maxCount: 1,
    };

    return (
        <Modal
            title={<Title level={3}>Pay via UPI</Title>}
            open={visible}
            onCancel={onClose}
            footer={null}
            width={700}
            style={{ top: 20 }}
        >
            <Card
                style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    marginBottom: 24,
                    borderRadius: 12
                }}
            >
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    <div style={{ textAlign: 'center' }}>
                        <Title level={2} style={{ color: 'white', margin: 0 }}>
                            ₹{amount.toFixed(2)}
                        </Title>
                        <Text style={{ color: 'rgba(255,255,255,0.9)' }}>Total Amount to Pay</Text>
                    </div>

                    <Divider style={{ borderColor: 'rgba(255,255,255,0.3)', margin: '12px 0' }} />

                    <div>
                        <Text strong style={{ color: 'white', display: 'block', marginBottom: 8 }}>
                            Scan QR Code:
                        </Text>
                        <div style={{
                            background: 'white',
                            padding: 16,
                            borderRadius: 8,
                            textAlign: 'center',
                            marginBottom: 16
                        }}>
                            <img
                                src={upiSettings.upiQrCodeUrl}
                                alt="UPI QR Code"
                                style={{ width: '200px', height: '200px' }}
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'block';
                                }}
                            />
                            <div style={{ display: 'none', padding: 40, color: '#666' }}>
                                QR Code Not Available
                            </div>
                        </div>

                        <Text strong style={{ color: 'white', display: 'block', marginBottom: 8 }}>
                            Or Pay to UPI ID:
                        </Text>
                        <div style={{
                            background: 'rgba(255,255,255,0.2)',
                            padding: 12,
                            borderRadius: 8,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <Text code style={{
                                background: 'transparent',
                                color: 'white',
                                fontSize: 16,
                                border: 'none',
                                padding: 0
                            }}>
                                {upiSettings.upiId}
                            </Text>
                            <Button
                                icon={<CopyOutlined />}
                                onClick={handleCopyUPI}
                                size="small"
                                style={{
                                    background: 'white',
                                    color: '#667eea',
                                    border: 'none'
                                }}
                            >
                                Copy
                            </Button>
                        </div>
                    </div>
                </Space>
            </Card>

            <Card
                title={
                    <Space>
                        <CheckCircleOutlined style={{ color: '#52c41a' }} />
                        <span>After Payment, Submit Proof</span>
                    </Space>
                }
                style={{ borderRadius: 12 }}
            >
                <Form form={form} onFinish={handleSubmit} layout="vertical">
                    <Form.Item
                        name="utr"
                        label="UTR / Transaction ID (Optional)"
                        rules={[
                            { min: 10, message: 'UTR must be at least 10 characters' }
                        ]}
                        extra="12-digit unique transaction reference number from your payment app (if available)"
                    >
                        <Input
                            placeholder="e.g., 123456789012 (Optional)"
                            size="large"
                            maxLength={20}
                        />
                    </Form.Item>

                    <Form.Item
                        name="payeeName"
                        label="Your Name (as per payment app)"
                        extra="Optional - helps in verification"
                    >
                        <Input placeholder="e.g., John Doe" size="large" />
                    </Form.Item>

                    <Form.Item
                        label="Payment Screenshot"
                        required
                        extra="Upload screenshot showing UTR, amount, and payment status"
                    >
                        <Upload {...uploadProps}>
                            <Button icon={<UploadOutlined />} size="large" block>
                                Click to Upload Screenshot
                            </Button>
                        </Upload>
                    </Form.Item>

                    <Divider />

                    <Paragraph type="warning" style={{ fontSize: 12 }}>
                        <strong>Important:</strong> Your order will be activated only after admin verification.
                        This usually takes 1-24 hours. You'll be notified once approved.
                    </Paragraph>

                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        size="large"
                        block
                        style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            border: 'none',
                            height: 48,
                            fontSize: 16,
                            fontWeight: 600
                        }}
                    >
                        Submit Payment Proof
                    </Button>
                </Form>
            </Card>
        </Modal>
    );
};

export default UpiPaymentModal;
