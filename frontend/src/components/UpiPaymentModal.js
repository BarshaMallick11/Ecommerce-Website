// frontend/src/components/UpiPaymentModal.js
import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Upload, Button, message, Typography, Divider, Card, Space, Grid } from 'antd';
import { UploadOutlined, CopyOutlined, CheckCircleOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const { Title, Text, Paragraph } = Typography;
const { useBreakpoint } = Grid;

const UpiPaymentModal = ({ visible, onClose, orderId, amount, onSuccess }) => {
    const [form] = Form.useForm();
    const { token } = useAuth();
    const screens = useBreakpoint();
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
        // Only append UTR if it has a value (optional field)
        if (values.utr && values.utr.trim()) {
            formData.append('utr', values.utr.trim());
        }
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
            title={<Title level={3} style={{ margin: 0 }}>Pay via UPI</Title>}
            open={visible}
            onCancel={onClose}
            footer={null}
            width={screens.xs ? '100%' : screens.sm ? 550 : 700}
            style={{ top: 20 }}
            centered={!screens.xs}
            styles={{
                body: { padding: screens.xs ? '16px' : '24px' }
            }}
        >
            <Card
                style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    marginBottom: screens.xs ? '16px' : '24px',
                    borderRadius: 12
                }}
                styles={{
                    body: { padding: screens.xs ? '16px' : '24px' }
                }}
            >
                <Space direction="vertical" size={screens.xs ? 'middle' : 'large'} style={{ width: '100%' }}>
                    <div style={{ textAlign: 'center' }}>
                        <Title level={2} style={{ color: 'white', margin: 0, fontSize: screens.xs ? '28px' : undefined }}>
                            ₹{amount.toFixed(2)}
                        </Title>
                        <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: screens.xs ? '14px' : undefined }}>Total Amount to Pay</Text>
                    </div>

                    <Divider style={{ borderColor: 'rgba(255,255,255,0.3)', margin: '12px 0' }} />

                    <div>
                        <Text strong style={{ color: 'white', display: 'block', marginBottom: 8 }}>
                            Scan QR Code:
                        </Text>
                        <div style={{
                            background: 'white',
                            padding: screens.xs ? '12px' : '16px',
                            borderRadius: 8,
                            textAlign: 'center',
                            marginBottom: 16
                        }}>
                            <img
                                src={upiSettings.upiQrCodeUrl}
                                alt="UPI QR Code"
                                style={{
                                    width: screens.xs ? '150px' : '200px',
                                    height: screens.xs ? '150px' : '200px',
                                    maxWidth: '100%'
                                }}
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'block';
                                }}
                            />
                            <div style={{ display: 'none', padding: screens.xs ? '20px' : '40px', color: '#666' }}>
                                QR Code Not Available
                            </div>
                        </div>

                        <Text strong style={{ color: 'white', display: 'block', marginBottom: screens.xs ? 8 : 12, fontSize: screens.xs ? '14px' : '16px' }}>
                            Or Pay to UPI ID:
                        </Text>
                        <div style={{
                            background: 'rgba(255,255,255,0.2)',
                            padding: screens.xs ? '10px' : '12px',
                            borderRadius: 8,
                            display: 'flex',
                            flexDirection: screens.xs ? 'column' : 'row',
                            gap: screens.xs ? '10px' : '0'
                        }}>
                            <Text code style={{
                                background: 'transparent',
                                color: 'white',
                                fontSize: screens.xs ? '13px' : '15px',
                                border: 'none',
                                padding: screens.xs ? '8px' : 0,
                                wordBreak: 'break-all',
                                flex: screens.xs ? 'unset' : 1,
                                width: '100%',
                                textAlign: 'center'
                            }}>
                                {upiSettings.upiId}
                            </Text>
                            <Button
                                icon={screens.xs ? undefined : <CopyOutlined />}
                                onClick={handleCopyUPI}
                                size={screens.xs ? 'middle' : 'small'}
                                style={{
                                    background: 'white',
                                    color: '#667eea',
                                    border: 'none',
                                    width: screens.xs ? '100%' : 'auto',
                                    minHeight: screens.xs ? 40 : undefined
                                }}
                            >
                                {screens.xs ? 'Copy UPI ID' : 'Copy'}
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
                styles={{
                    body: { padding: screens.xs ? '16px' : '24px' }
                }}
            >
                <Form form={form} onFinish={handleSubmit} layout="vertical">
                    <Form.Item
                        name="utr"
                        label="UTR / Transaction ID (Optional)"
                        rules={[
                            {
                                validator: (_, value) => {
                                    if (!value) return Promise.resolve();
                                    if (value && value.length < 10) {
                                        return Promise.reject('UTR must be at least 10 characters');
                                    }
                                    return Promise.resolve();
                                }
                            }
                        ]}
                        extra="12-digit unique transaction reference number from your payment app (if available)"
                    >
                        <Input
                            placeholder="e.g., 123456789012 (Optional)"
                            size={screens.xs ? 'middle' : 'large'}
                            maxLength={20}
                        />
                    </Form.Item>

                    <Form.Item
                        name="payeeName"
                        label="Your Name (as per payment app)"
                        extra="Optional - helps in verification"
                    >
                        <Input placeholder="e.g., John Doe" size={screens.xs ? 'middle' : 'large'} />
                    </Form.Item>

                    <Form.Item
                        label="Payment Screenshot"
                        required
                        extra="Upload screenshot showing UTR, amount, and payment status"
                    >
                        <Upload
                            {...uploadProps}
                            listType="picture-card"
                            style={{ width: '100%' }}
                        >
                            {fileList.length === 0 && (
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '8px'
                                }}>
                                    <UploadOutlined style={{ fontSize: 24, marginBottom: 8 }} />
                                    <span style={{ fontSize: 12, textAlign: 'center' }}>
                                        Click to Upload
                                    </span>
                                </div>
                            )}
                        </Upload>
                    </Form.Item>

                    <Divider />

                    <Paragraph type="warning" style={{ fontSize: screens.xs ? 11 : 12, marginBottom: screens.xs ? '12px' : '16px' }}>
                        <strong>Important:</strong> Your order will be activated only after admin verification.
                        This usually takes 1-24 hours. You'll be notified once approved.
                    </Paragraph>

                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        size={screens.xs ? 'large' : 'large'}
                        block
                        style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            border: 'none',
                            height: screens.xs ? 44 : 48,
                            fontSize: screens.xs ? 15 : 16,
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
