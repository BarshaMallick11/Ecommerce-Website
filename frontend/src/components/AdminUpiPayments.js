// frontend/src/components/AdminUpiPayments.js
import React, { useState, useEffect } from 'react';
import {
    Table,
    Button,
    Tag,
    Image,
    Modal,
    Input,
    message,
    Space,
    Card,
    Descriptions,
    Typography,
    Tabs
} from 'antd';
import {
    CheckOutlined,
    CloseOutlined,
    EyeOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined
} from '@ant-design/icons';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const { TextArea } = Input;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

const AdminUpiPayments = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [verifyModalVisible, setVerifyModalVisible] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [verificationNote, setVerificationNote] = useState('');
    const [actionType, setActionType] = useState(''); // 'approve' or 'reject'
    const [activeTab, setActiveTab] = useState('pending');
    const { token } = useAuth();

    useEffect(() => {
        fetchPayments();
    }, [activeTab]);

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const endpoint = activeTab === 'pending'
                ? '/api/upi-payment/pending'
                : `/api/upi-payment/all?status=${activeTab}`;

            const { data } = await axios.get(
                `${process.env.REACT_APP_API_URL}${endpoint}`,
                config
            );
            setPayments(data);
        } catch (error) {
            message.error('Failed to fetch payments');
        } finally {
            setLoading(false);
        }
    };

    const showDetailModal = (payment) => {
        setSelectedPayment(payment);
        setDetailModalVisible(true);
    };

    const showVerifyModal = (payment, action) => {
        setSelectedPayment(payment);
        setActionType(action);
        setVerifyModalVisible(true);
    };

    const handleVerify = async () => {
        if (!selectedPayment) return;

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const endpoint = actionType === 'approve' ? 'approve' : 'reject';

            await axios.put(
                `${process.env.REACT_APP_API_URL}/api/upi-payment/${selectedPayment._id}/${endpoint}`,
                { verificationNote },
                config
            );

            message.success(`Payment ${actionType === 'approve' ? 'approved' : 'rejected'} successfully!`);
            setVerifyModalVisible(false);
            setVerificationNote('');
            fetchPayments();
        } catch (error) {
            message.error(`Failed to ${actionType} payment`);
        }
    };

    const getStatusTag = (status) => {
        const statusConfig = {
            pending: { color: 'orange', icon: <ClockCircleOutlined />, text: 'Pending' },
            approved: { color: 'green', icon: <CheckCircleOutlined />, text: 'Approved' },
            rejected: { color: 'red', icon: <CloseCircleOutlined />, text: 'Rejected' }
        };
        const config = statusConfig[status] || statusConfig.pending;
        return <Tag color={config.color} icon={config.icon}>{config.text}</Tag>;
    };

    const columns = [
        {
            title: 'Date',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => new Date(date).toLocaleString(),
            width: 180,
        },
        {
            title: 'User',
            dataIndex: 'user',
            key: 'user',
            render: (user) => (
                <div>
                    <div><strong>{user?.username}</strong></div>
                    <Text type="secondary" style={{ fontSize: 12 }}>{user?.email}</Text>
                </div>
            ),
        },
        {
            title: 'UTR',
            dataIndex: 'utr',
            key: 'utr',
            render: (utr) => <Text code>{utr}</Text>,
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
            render: (amount) => <strong>₹{amount.toFixed(2)}</strong>,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => getStatusTag(status),
        },
        {
            title: 'Screenshot',
            dataIndex: 'paymentScreenshot',
            key: 'paymentScreenshot',
            render: (url) => (
                <Image
                    src={url}
                    alt="Payment Screenshot"
                    width={60}
                    height={60}
                    style={{ objectFit: 'cover', borderRadius: 4 }}
                />
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button
                        icon={<EyeOutlined />}
                        onClick={() => showDetailModal(record)}
                        size="small"
                    >
                        View
                    </Button>
                    {record.status === 'pending' && (
                        <>
                            <Button
                                icon={<CheckOutlined />}
                                type="primary"
                                onClick={() => showVerifyModal(record, 'approve')}
                                size="small"
                            >
                                Approve
                            </Button>
                            <Button
                                icon={<CloseOutlined />}
                                danger
                                onClick={() => showVerifyModal(record, 'reject')}
                                size="small"
                            >
                                Reject
                            </Button>
                        </>
                    )}
                </Space>
            ),
            fixed: 'right',
            width: 250,
        },
    ];

    return (
        <div>
            <Title level={2}>UPI Payment Verifications</Title>

            <Card style={{ marginBottom: 24 }}>
                <Tabs activeKey={activeTab} onChange={setActiveTab}>
                    <TabPane
                        tab={
                            <span>
                                <ClockCircleOutlined />
                                Pending
                            </span>
                        }
                        key="pending"
                    />
                    <TabPane
                        tab={
                            <span>
                                <CheckCircleOutlined />
                                Approved
                            </span>
                        }
                        key="approved"
                    />
                    <TabPane
                        tab={
                            <span>
                                <CloseCircleOutlined />
                                Rejected
                            </span>
                        }
                        key="rejected"
                    />
                </Tabs>
            </Card>

            <Table
                columns={columns}
                dataSource={payments}
                rowKey="_id"
                loading={loading}
                scroll={{ x: 1200 }}
                pagination={{ pageSize: 10 }}
            />

            {/* Detail Modal */}
            <Modal
                title="Payment Details"
                open={detailModalVisible}
                onCancel={() => setDetailModalVisible(false)}
                footer={null}
                width={700}
            >
                {selectedPayment && (
                    <div>
                        <Descriptions bordered column={2}>
                            <Descriptions.Item label="Status" span={2}>
                                {getStatusTag(selectedPayment.status)}
                            </Descriptions.Item>
                            <Descriptions.Item label="User">
                                {selectedPayment.user?.username}
                            </Descriptions.Item>
                            <Descriptions.Item label="Email">
                                {selectedPayment.user?.email}
                            </Descriptions.Item>
                            <Descriptions.Item label="UTR">
                                <Text code>{selectedPayment.utr}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Amount">
                                <strong>₹{selectedPayment.amount?.toFixed(2)}</strong>
                            </Descriptions.Item>
                            <Descriptions.Item label="Payee Name">
                                {selectedPayment.payeeName || 'N/A'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Order Total">
                                ₹{selectedPayment.orderId?.totalAmount?.toFixed(2)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Submitted At">
                                {new Date(selectedPayment.createdAt).toLocaleString()}
                            </Descriptions.Item>
                            <Descriptions.Item label="Order Date">
                                {new Date(selectedPayment.orderId?.createdAt).toLocaleString()}
                            </Descriptions.Item>
                            {selectedPayment.verifiedBy && (
                                <>
                                    <Descriptions.Item label="Verified By">
                                        {selectedPayment.verifiedBy?.username}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Verified At">
                                        {new Date(selectedPayment.verifiedAt).toLocaleString()}
                                    </Descriptions.Item>
                                </>
                            )}
                            {selectedPayment.verificationNote && (
                                <Descriptions.Item label="Note" span={2}>
                                    {selectedPayment.verificationNote}
                                </Descriptions.Item>
                            )}
                        </Descriptions>

                        <div style={{ marginTop: 24, textAlign: 'center' }}>
                            <Text strong>Payment Screenshot</Text>
                            <div style={{ marginTop: 16 }}>
                                <Image
                                    src={selectedPayment.paymentScreenshot}
                                    alt="Payment Screenshot"
                                    style={{ maxWidth: '100%' }}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Verify Modal */}
            <Modal
                title={`${actionType === 'approve' ? 'Approve' : 'Reject'} Payment`}
                open={verifyModalVisible}
                onOk={handleVerify}
                onCancel={() => {
                    setVerifyModalVisible(false);
                    setVerificationNote('');
                }}
                okText={actionType === 'approve' ? 'Approve' : 'Reject'}
                okButtonProps={{
                    danger: actionType === 'reject',
                    type: actionType === 'approve' ? 'primary' : 'default'
                }}
            >
                {selectedPayment && (
                    <div>
                        <Descriptions bordered column={1} size="small" style={{ marginBottom: 16 }}>
                            <Descriptions.Item label="User">
                                {selectedPayment.user?.username}
                            </Descriptions.Item>
                            <Descriptions.Item label="UTR">
                                <Text code>{selectedPayment.utr}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Amount">
                                ₹{selectedPayment.amount?.toFixed(2)}
                            </Descriptions.Item>
                        </Descriptions>

                        <div>
                            <Text strong>Verification Note (Optional)</Text>
                            <TextArea
                                rows={3}
                                value={verificationNote}
                                onChange={(e) => setVerificationNote(e.target.value)}
                                placeholder="Add a note about this verification..."
                                style={{ marginTop: 8 }}
                            />
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default AdminUpiPayments;
