// frontend/src/components/AdminNav.js

import React from 'react';
import { Tabs, Button } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { HomeOutlined } from '@ant-design/icons';

const { TabPane } = Tabs;

const AdminNav = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const getActiveKey = () => {
        const path = location.pathname;
        if (path.includes('/admin/orders')) return '/admin/orders';
        if (path.includes('/admin/users')) return '/admin/users';
        if (path.includes('/admin/queries')) return '/admin/queries';
        if (path.includes('/admin/settings')) return '/admin/settings';
        return '/admin';
    };

    const handleTabChange = (key) => {
        navigate(key);
    };

    return (
        // THIS is the container that gets the bottom margin to create space
        <div style={{ marginBottom: '24px' }}>
            <Tabs
                activeKey={getActiveKey()}
                onChange={handleTabChange}
            >
                <TabPane tab="Product Management" key="/admin" />
                <TabPane tab="Order Management" key="/admin/orders" />
                <TabPane tab="User Management" key="/admin/users" />
                <TabPane tab="Customer Queries" key="/admin/queries" />
                <TabPane tab="Site Settings" key="/admin/settings" />
            </Tabs>

            <Button
                icon={<HomeOutlined />}
                onClick={() => navigate('/')}
                style={{ marginTop: '16px' }} // This adds space between the tabs and this button
            >
                Back to Store
            </Button>
        </div>
    );
};

export default AdminNav;