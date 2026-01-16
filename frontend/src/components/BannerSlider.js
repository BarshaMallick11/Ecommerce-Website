// frontend/src/components/BannerSlider.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { GiftOutlined, PercentageOutlined, CarOutlined, StarOutlined, HeartOutlined, TagOutlined } from '@ant-design/icons';
import axios from 'axios';
import './BannerSlider.css';

const getIconComponent = (iconType, color = 'white') => {
    const style = { fontSize: '24px', color };
    const iconMap = {
        gift: <GiftOutlined style={style} />,
        percent: <PercentageOutlined style={style} />,
        truck: <CarOutlined style={style} />,
        star: <StarOutlined style={style} />,
        heart: <HeartOutlined style={style} />,
        tag: <TagOutlined style={style} />,
    };
    return iconMap[iconType] || null;
};

// Default banners to show if no banners from API
const defaultBanners = [
    {
        _id: 'default-1',
        title: '30% OFF',
        subtitle: 'Fresh groceries, big savings daily',
        backgroundColor: '#10b981',
        textColor: '#ffffff',
        icon: 'gift',
        link: '',
        image: ''
    },
    {
        _id: 'default-2',
        title: 'Free Delivery',
        subtitle: 'On orders above ₹499',
        backgroundColor: '#3b82f6',
        textColor: '#ffffff',
        icon: 'truck',
        link: '',
        image: ''
    },
    {
        _id: 'default-3',
        title: 'Fresh Fruits',
        subtitle: 'Farm fresh fruits delivered to your door',
        backgroundColor: '#f59e0b',
        textColor: '#ffffff',
        icon: 'star',
        link: '',
        image: ''
    }
];

const BannerSlider = () => {
    const [banners, setBanners] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState(0);
    const sliderRef = useRef(null);
    const autoSlideRef = useRef(null);
    const navigate = useNavigate();

    // Minimum swipe distance (in px)
    const minSwipeDistance = 50;

    // Fetch banners from API
    useEffect(() => {
        const fetchBanners = async () => {
            try {
                const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/banners`);
                if (data && data.length > 0) {
                    setBanners(data);
                } else {
                    setBanners(defaultBanners);
                }
            } catch (error) {
                console.error('Failed to fetch banners:', error);
                setBanners(defaultBanners);
            }
        };
        fetchBanners();
    }, []);

    // Auto-slide functionality
    const startAutoSlide = useCallback(() => {
        if (autoSlideRef.current) {
            clearInterval(autoSlideRef.current);
        }
        if (banners.length > 1) {
            autoSlideRef.current = setInterval(() => {
                setCurrentIndex((prev) => (prev + 1) % banners.length);
            }, 3500); // 3.5 seconds - similar to Blinkit
        }
    }, [banners.length]);

    const stopAutoSlide = useCallback(() => {
        if (autoSlideRef.current) {
            clearInterval(autoSlideRef.current);
            autoSlideRef.current = null;
        }
    }, []);

    useEffect(() => {
        startAutoSlide();
        return () => stopAutoSlide();
    }, [banners.length, startAutoSlide, stopAutoSlide]);

    // Navigation functions
    const goToSlide = (index) => {
        setCurrentIndex(index);
        startAutoSlide(); // Reset timer
    };

    // Touch handlers for swipe
    const onTouchStart = (e) => {
        stopAutoSlide();
        setIsDragging(true);
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
        setDragOffset(0);
    };

    const onTouchMove = (e) => {
        if (!isDragging) return;
        const currentTouch = e.targetTouches[0].clientX;
        setTouchEnd(currentTouch);

        // Calculate drag offset for real-time feedback
        if (touchStart) {
            const diff = currentTouch - touchStart;
            // Limit the drag offset
            const maxDrag = sliderRef.current?.offsetWidth || 300;
            const limitedDiff = Math.max(-maxDrag * 0.5, Math.min(maxDrag * 0.5, diff));
            setDragOffset(limitedDiff);
        }
    };

    const onTouchEnd = () => {
        setIsDragging(false);
        setDragOffset(0);

        if (!touchStart || !touchEnd) {
            startAutoSlide();
            return;
        }

        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe && banners.length > 1) {
            setCurrentIndex((prev) => (prev + 1) % banners.length);
        } else if (isRightSwipe && banners.length > 1) {
            setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
        }

        setTouchStart(null);
        setTouchEnd(null);
        startAutoSlide();
    };

    // Handle banner click
    const handleBannerClick = (banner) => {
        if (isDragging) return;
        if (banner.link) {
            if (banner.link.startsWith('http')) {
                window.open(banner.link, '_blank');
            } else {
                navigate(banner.link);
            }
        }
    };

    // If no banners, don't render
    if (banners.length === 0) return null;

    return (
        <div className="banner-slider-wrapper">
            <div className="banner-slider-container">
                <div
                    className="banner-slider"
                    ref={sliderRef}
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                >
                    <div
                        className={`banner-slider-track ${isDragging ? 'dragging' : ''}`}
                        style={{
                            transform: `translateX(calc(-${currentIndex * 100}% + ${dragOffset}px))`,
                        }}
                    >
                        {banners.map((banner, index) => (
                            <div
                                key={banner._id}
                                className={`banner-slide ${banner.link ? 'clickable' : ''} ${index === currentIndex ? 'active' : ''}`}
                                onClick={() => handleBannerClick(banner)}
                            >
                                <div
                                    className="banner-slide-content"
                                    style={{
                                        background: banner.image
                                            ? `url(${banner.image}) center/cover no-repeat`
                                            : `linear-gradient(135deg, ${banner.backgroundColor} 0%, ${banner.backgroundColor}cc 100%)`,
                                        color: banner.textColor || '#ffffff'
                                    }}
                                >
                                    {banner.image && <div className="banner-slide-overlay" />}
                                    <div className="banner-slide-text">
                                        <div className="banner-slide-title" style={{ color: banner.textColor }}>
                                            {banner.title}
                                        </div>
                                        <div className="banner-slide-subtitle" style={{ color: banner.textColor }}>
                                            {banner.subtitle}
                                        </div>
                                    </div>
                                    {banner.icon && banner.icon !== 'none' && (
                                        <div className="banner-slide-icon">
                                            {getIconComponent(banner.icon, banner.textColor)}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Progress Bar - Flipkart/Blinkit style */}
                {banners.length > 1 && (
                    <div className="banner-progress-bar">
                        {banners.map((_, index) => (
                            <div
                                key={index}
                                className={`banner-progress-segment ${index === currentIndex ? 'active' : ''} ${index < currentIndex ? 'completed' : ''}`}
                                onClick={() => goToSlide(index)}
                            >
                                <div className="banner-progress-fill" />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BannerSlider;
