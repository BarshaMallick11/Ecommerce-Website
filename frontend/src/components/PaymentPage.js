// frontend/src/components/PaymentPage.js
import { useState, useEffect } from 'react';
import { Card, Typography, Space, Spin, message, Divider, Grid, Button } from 'antd';
import { CheckCircleOutlined, CopyOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title, Text, Paragraph } = Typography;
const { useBreakpoint } = Grid;

const PaymentPage = () => {
    const screens = useBreakpoint();
    const [loading, setLoading] = useState(true);
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
                message.error('Failed to load payment information');
            } finally {
                setLoading(false);
            }
        };
        fetchUpiSettings();
    }, []);

    const handleCopyUPI = () => {
        navigator.clipboard.writeText(upiSettings.upiId);
        message.success('UPI ID copied to clipboard!');
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px' }}>
            <Title level={2} style={{ textAlign: 'center', marginBottom: 32 }}>
                Payment Information
            </Title>

            <Card
                style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    borderRadius: 12,
                    marginBottom: 24
                }}
                styles={{
                    body: { padding: screens.xs ? '16px' : '24px' }
                }}
            >
                <Space direction="vertical" size="large" style={{ width: '100%', textAlign: 'center' }}>
                    <div>
                        <Title level={3} style={{ color: 'white', margin: 0 }}>
                            We Accept UPI Payments
                        </Title>
                        <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '16px' }}>
                            Fast, Secure & Convenient
                        </Text>
                    </div>

                    <Divider style={{ borderColor: 'rgba(255,255,255,0.3)', margin: '16px 0' }} />

                    <div>
                        <Text strong style={{ color: 'white', display: 'block', marginBottom: screens.xs ? 12 : 16, fontSize: screens.xs ? '16px' : '18px' }}>
                            Scan QR Code to Pay:
                        </Text>
                        <div style={{
                            background: 'white',
                            padding: screens.xs ? '12px' : '24px',
                            borderRadius: 12,
                            display: 'inline-block',
                            marginBottom: 24
                        }}>
                            <img
                                src={upiSettings.upiQrCodeUrl}
                                alt="UPI QR Code"
                                style={{
                                    width: screens.xs ? '200px' : '250px',
                                    height: screens.xs ? '200px' : '250px',
                                    maxWidth: '100%'
                                }}
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'block';
                                }}
                            />
                            <div style={{ display: 'none', padding: '60px', color: '#666', fontSize: '16px' }}>
                                QR Code Not Available
                            </div>
                        </div>
                    </div>

                    <div style={{ textAlign: 'left' }}>
                        <Text strong style={{ color: 'white', display: 'block', marginBottom: screens.xs ? 8 : 12, fontSize: screens.xs ? '16px' : '18px' }}>
                            Or Pay to UPI ID:
                        </Text>
                        <div style={{
                            background: 'rgba(255,255,255,0.2)',
                            padding: screens.xs ? '10px' : '12px',
                            borderRadius: 8,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: screens.xs ? '8px' : '12px',
                            flexWrap: screens.xs ? 'wrap' : 'nowrap'
                        }}>
                            <Text code style={{
                                background: 'transparent',
                                color: 'white',
                                fontSize: screens.xs ? '14px' : '16px',
                                border: 'none',
                                padding: 0,
                                wordBreak: 'break-all',
                                flex: screens.xs ? 1 : 'auto'
                            }}>
                                {upiSettings.upiId}
                            </Text>
                            <Button
                                icon={<CopyOutlined />}
                                onClick={handleCopyUPI}
                                size={screens.xs ? 'small' : 'middle'}
                                style={{
                                    background: 'white',
                                    color: '#667eea',
                                    border: 'none',
                                    flexShrink: 0
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
                        <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '20px' }} />
                        <span style={{ fontSize: '18px', fontWeight: 600 }}>Payment Instructions</span>
                    </Space>
                }
                style={{ borderRadius: 12 }}
            >
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <div>
                        <Paragraph style={{ marginBottom: 8, fontSize: '15px' }}>
                            <strong>1. Choose any UPI app</strong> - Google Pay, PhonePe, Paytm, BHIM, etc.
                        </Paragraph>
                        <Paragraph style={{ marginBottom: 8, fontSize: '15px' }}>
                            <strong>2. Scan the QR code</strong> using your UPI app or copy the UPI ID
                        </Paragraph>
                        <Paragraph style={{ marginBottom: 8, fontSize: '15px' }}>
                            <strong>3. Enter the amount</strong> and complete the payment
                        </Paragraph>
                        <Paragraph style={{ marginBottom: 8, fontSize: '15px' }}>
                            <strong>4. Take a screenshot</strong> of the payment confirmation
                        </Paragraph>
                        <Paragraph style={{ marginBottom: 0, fontSize: '15px' }}>
                            <strong>5. Upload the screenshot</strong> while placing your order
                        </Paragraph>
                    </div>

                    <Divider />

                    <div style={{ background: '#fffbe6', padding: '16px', borderRadius: 8, border: '1px solid #ffe58f' }}>
                        <Title level={5} style={{ margin: 0, marginBottom: 8, color: '#fa8c16' }}>
                            Important Note
                        </Title>
                        <Text style={{ fontSize: '14px', color: '#8c8c8c' }}>
                            Please ensure you take a screenshot showing the UTR/Transaction ID, amount,
                            and payment status. This will be required for verification and order processing.
                        </Text>
                    </div>
                </Space>
            </Card>

            <Card
                title={
                    <span style={{ fontSize: '18px', fontWeight: 600 }}>Supported UPI Apps</span>
                }
                style={{ borderRadius: 12, marginTop: 24 }}
            >
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <Text>• Google Pay (GPay)</Text>
                    <Text>• PhonePe</Text>
                    <Text>• Paytm</Text>
                    <Text>• BHIM</Text>
                    <Text>• Amazon Pay</Text>
                    <Text>• And many more UPI-enabled apps</Text>
                </Space>
            </Card>
        </div>
    );
};

export default PaymentPage;
