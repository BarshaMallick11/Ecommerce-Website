// frontend/src/components/OfferBanner.js
import React from 'react';
import { GiftOutlined } from '@ant-design/icons';

const OfferBanner = () => {
    return (
        <div
            className="offer-banner"
            style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                borderRadius: '12px',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                margin: '16px 0',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
                color: 'white'
            }}
        >
            <div style={{ flex: 1 }}>
                <div style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    marginBottom: '4px'
                }}>
                    30% OFF
                </div>
                <div style={{
                    fontSize: '13px',
                    opacity: 0.95,
                    fontWeight: '400'
                }}>
                    Fresh groceries, big savings daily
                </div>
            </div>
            <div style={{
                width: '48px',
                height: '48px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <GiftOutlined style={{ fontSize: '24px', color: 'white' }} />
            </div>
        </div>
    );
};

export default OfferBanner;
