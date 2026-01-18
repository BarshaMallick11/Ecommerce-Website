// frontend/src/components/ProductEditModal.js
import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, InputNumber, Upload, message, Typography, Divider, Space, Image, Select, Switch, Button, Card, Row, Col, Tag } from 'antd';
import { PlusOutlined, DeleteOutlined, PlusCircleOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;

const ProductEditModal = ({ visible, onCancel, onFinish, initialValues }) => {
    const [form] = Form.useForm();
    const [mainImageFile, setMainImageFile] = useState(null);
    const [mainImagePreview, setMainImagePreview] = useState(null);
    const [additionalImages, setAdditionalImages] = useState([]); // Array of {file, preview}
    const [existingImages, setExistingImages] = useState([]); // Existing image URLs
    const [categories, setCategories] = useState([]);
    const [hasVariants, setHasVariants] = useState(false);
    const [unitVariants, setUnitVariants] = useState([]);

    useEffect(() => {
        // Fetch categories
        const fetchCategories = async () => {
            try {
                const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/categories`);
                setCategories(data);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        if (initialValues) {
            // Set all form fields with explicit values
            form.setFieldsValue({
                name: initialValues.name,
                description: initialValues.description,
                category: initialValues.category?._id || initialValues.category,
                price: initialValues.price,
                quantity: initialValues.quantity,
                stock: initialValues.stock || 0,
                unit: initialValues.unit || 'Kg',
                discount: initialValues.discount || 0
            });

            // Set main image preview
            setMainImagePreview(initialValues.image);
            setMainImageFile(null);

            // Set additional images from product.images array
            if (initialValues.images && initialValues.images.length > 0) {
                setExistingImages(initialValues.images);
            } else {
                setExistingImages([]);
            }
            setAdditionalImages([]);

            // Set unit variants
            setHasVariants(initialValues.hasVariants || false);
            setUnitVariants(initialValues.unitVariants || []);
        } else {
            form.resetFields();
            setMainImagePreview(null);
            setMainImageFile(null);
            setAdditionalImages([]);
            setExistingImages([]);
            setHasVariants(false);
            setUnitVariants([]);
        }
    }, [initialValues, form, visible]);

    const handleMainImageChange = (info) => {
        const file = info.file.originFileObj || info.file;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            message.error('You can only upload image files!');
            return;
        }

        // Validate file size (5MB)
        if (file.size / 1024 / 1024 > 5) {
            message.error('Image must be smaller than 5MB!');
            return;
        }

        setMainImageFile(file);

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
            setMainImagePreview(e.target.result);
        };
        reader.readAsDataURL(file);
    };

    const handleAdditionalImageChange = (info) => {
        const file = info.file.originFileObj || info.file;

        // Check total count (existing + new + current file)
        const totalCount = existingImages.length + additionalImages.length + 1;
        if (totalCount > 5) {
            message.error('Maximum 5 additional images allowed!');
            return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            message.error('You can only upload image files!');
            return;
        }

        // Validate file size (5MB)
        if (file.size / 1024 / 1024 > 5) {
            message.error('Image must be smaller than 5MB!');
            return;
        }

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
            setAdditionalImages(prev => [...prev, { file, preview: e.target.result }]);
        };
        reader.readAsDataURL(file);
    };

    const removeAdditionalImage = (index) => {
        setAdditionalImages(prev => prev.filter((_, i) => i !== index));
    };

    const removeExistingImage = (index) => {
        setExistingImages(prev => prev.filter((_, i) => i !== index));
    };

    // Unit variants management functions
    const addUnitVariant = () => {
        if (unitVariants.length >= 10) {
            message.warning('Maximum 10 variants allowed');
            return;
        }
        setUnitVariants([...unitVariants, {
            label: '',
            value: 0,
            unit: 'gm',
            price: 0,
            stock: 0,
            isDefault: unitVariants.length === 0 // First variant is default
        }]);
    };

    const removeUnitVariant = (index) => {
        const newVariants = unitVariants.filter((_, i) => i !== index);
        // If removed variant was default, make first one default
        if (unitVariants[index].isDefault && newVariants.length > 0) {
            newVariants[0].isDefault = true;
        }
        setUnitVariants(newVariants);
    };

    const updateUnitVariant = (index, field, value) => {
        const newVariants = [...unitVariants];
        newVariants[index][field] = value;

        // Auto-generate label based on value and unit
        if (field === 'value' || field === 'unit') {
            const variant = newVariants[index];
            if (variant.value && variant.unit) {
                newVariants[index].label = `${variant.value}${variant.unit}`;
            }
        }

        // Handle default selection (only one can be default)
        if (field === 'isDefault' && value === true) {
            newVariants.forEach((v, i) => {
                v.isDefault = i === index;
            });
        }

        setUnitVariants(newVariants);
    };

    const handleSubmit = () => {
        form.validateFields()
            .then(values => {
                // Validate unit variants if enabled
                if (hasVariants && unitVariants.length === 0) {
                    message.error('Please add at least one unit variant or disable variants');
                    return;
                }

                if (hasVariants) {
                    const invalidVariants = unitVariants.filter(v => !v.label || !v.price || v.price <= 0);
                    if (invalidVariants.length > 0) {
                        message.error('Please fill all variant details (label and price are required)');
                        return;
                    }
                }

                // Pass form values, main image file, additional image files, existing images, and variants
                onFinish({
                    ...values,
                    mainImageFile,
                    additionalImageFiles: additionalImages.map(img => img.file),
                    existingImages, // URLs of existing images to keep
                    hasVariants,
                    unitVariants: hasVariants ? unitVariants : []
                });
                form.resetFields();
                setMainImageFile(null);
                setMainImagePreview(null);
                setAdditionalImages([]);
                setExistingImages([]);
                setHasVariants(false);
                setUnitVariants([]);
            })
            .catch(info => {
                console.log('Validate Failed:', info);
            });
    };

    const uploadButton = (
        <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>Upload</div>
        </div>
    );

    return (
        <Modal
            open={visible}
            title={initialValues ? 'Edit Product' : 'Add New Product'}
            okText={initialValues ? 'Update' : 'Create'}
            cancelText="Cancel"
            width={700}
            onCancel={() => {
                onCancel();
                setMainImageFile(null);
                setMainImagePreview(null);
                setAdditionalImages([]);
                setExistingImages([]);
            }}
            onOk={handleSubmit}
        >
            <Form form={form} layout="vertical" name="product_form">
                <Form.Item
                    name="name"
                    label="Product Name"
                    rules={[{ required: true, message: 'Please input the name of the product!' }]}
                >
                    <Input size="large" />
                </Form.Item>

                <Form.Item
                    name="description"
                    label="Description"
                    rules={[{ required: true, message: 'Please input the description!' }]}
                >
                    <Input.TextArea rows={4} />
                </Form.Item>

                <Form.Item
                    name="category"
                    label="Category"
                    rules={[{ required: false }]}
                >
                    <Select
                        size="large"
                        placeholder="Select a category"
                        allowClear
                        showSearch
                        optionFilterProp="children"
                    >
                        {categories.map(cat => (
                            <Select.Option key={cat._id} value={cat._id}>
                                {cat.name}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    name="price"
                    label="Price"
                    rules={[{ required: true, message: 'Please input the price!' }]}
                >
                    <InputNumber min={0} style={{ width: '100%' }} size="large" />
                </Form.Item>

                <Form.Item
                    name="quantity"
                    label="Quantity (Weight)"
                    rules={[{ required: true, message: 'Please input the quantity!' }]}
                >
                    <InputNumber min={0} step={1} style={{ width: '100%' }} size="large" placeholder="e.g., 50" />
                </Form.Item>

                <Form.Item
                    name="stock"
                    label="Available Stock"
                    rules={[{ required: true, message: 'Please input the stock!' }]}
                    extra="Number of units available for purchase (0 = Out of Stock)"
                >
                    <InputNumber min={0} step={1} style={{ width: '100%' }} size="large" placeholder="e.g., 100" />
                </Form.Item>

                <Form.Item
                    name="unit"
                    label="Unit"
                    rules={[{ required: true, message: 'Please select a unit!' }]}
                    initialValue="Kg"
                >
                    <Select size="large" placeholder="Select unit">
                        <Select.Option value="gm">Grams (gm)</Select.Option>
                        <Select.Option value="Kg">Kilograms (Kg)</Select.Option>
                        <Select.Option value="L">Litres (L)</Select.Option>
                        <Select.Option value="ml">MiliLitres (ml)</Select.Option>
                        <Select.Option value="packet">Packet (packet)</Select.Option>
                        <Select.Option value="piece">Piece (piece)</Select.Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    name="discount"
                    label="Discount (%)"
                    rules={[
                        { required: false },
                        {
                            type: 'number',
                            message: 'Discount must be a valid number'
                        },
                        {
                            validator: (_, value) => {
                                if (value === undefined || value === null || value === '') return Promise.resolve();
                                if (value < 0 || value > 100) {
                                    return Promise.reject(new Error('Discount must be between 0 and 100%'));
                                }
                                return Promise.resolve();
                            }
                        }
                    ]}
                >
                    <InputNumber min={0} max={100} step={0.5} style={{ width: '100%' }} size="large" placeholder="e.g., 10" />
                </Form.Item>

                <Divider />

                {/* Unit Variants Section - Like Modern Grocery Apps */}
                <div style={{ marginBottom: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <div>
                            <Title level={5} style={{ margin: 0 }}>Unit Variants (Multiple Sizes)</Title>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                Enable to offer multiple pack sizes like 250g, 500g, 1Kg with different prices
                            </Text>
                        </div>
                        <Switch
                            checked={hasVariants}
                            onChange={(checked) => {
                                setHasVariants(checked);
                                if (checked && unitVariants.length === 0) {
                                    // Add a default variant based on current product values
                                    const currentUnit = form.getFieldValue('unit') || 'Kg';
                                    const currentPrice = form.getFieldValue('price') || 0;
                                    const currentStock = form.getFieldValue('stock') || 0;
                                    const currentQty = form.getFieldValue('quantity') || 1;
                                    setUnitVariants([{
                                        label: `${currentQty}${currentUnit}`,
                                        value: currentQty,
                                        unit: currentUnit,
                                        price: currentPrice,
                                        stock: currentStock,
                                        isDefault: true
                                    }]);
                                }
                            }}
                            checkedChildren="ON"
                            unCheckedChildren="OFF"
                        />
                    </div>

                    {hasVariants && (
                        <Card size="small" style={{ backgroundColor: '#fafafa' }}>
                            {unitVariants.map((variant, index) => (
                                <div
                                    key={index}
                                    style={{
                                        padding: '12px',
                                        marginBottom: index < unitVariants.length - 1 ? '12px' : 0,
                                        backgroundColor: variant.isDefault ? '#e6f7ff' : '#fff',
                                        borderRadius: '8px',
                                        border: variant.isDefault ? '1px solid #91d5ff' : '1px solid #f0f0f0'
                                    }}
                                >
                                    <Row gutter={[12, 12]} align="middle">
                                        <Col xs={24} sm={6}>
                                            <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>Quantity</Text>
                                            <Space.Compact style={{ width: '100%' }}>
                                                <InputNumber
                                                    min={1}
                                                    value={variant.value}
                                                    onChange={(val) => updateUnitVariant(index, 'value', val)}
                                                    style={{ width: '60%' }}
                                                    placeholder="250"
                                                />
                                                <Select
                                                    value={variant.unit}
                                                    onChange={(val) => updateUnitVariant(index, 'unit', val)}
                                                    style={{ width: '40%' }}
                                                >
                                                    <Select.Option value="gm">gm</Select.Option>
                                                    <Select.Option value="Kg">Kg</Select.Option>
                                                    <Select.Option value="ml">ml</Select.Option>
                                                    <Select.Option value="L">L</Select.Option>
                                                    <Select.Option value="pc">pc</Select.Option>
                                                    <Select.Option value="pack">pack</Select.Option>
                                                </Select>
                                            </Space.Compact>
                                        </Col>
                                        <Col xs={12} sm={5}>
                                            <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>Price (₹)</Text>
                                            <InputNumber
                                                min={0}
                                                value={variant.price}
                                                onChange={(val) => updateUnitVariant(index, 'price', val)}
                                                style={{ width: '100%' }}
                                                placeholder="99"
                                                prefix="₹"
                                            />
                                        </Col>
                                        <Col xs={12} sm={5}>
                                            <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>Stock</Text>
                                            <InputNumber
                                                min={0}
                                                value={variant.stock}
                                                onChange={(val) => updateUnitVariant(index, 'stock', val)}
                                                style={{ width: '100%' }}
                                                placeholder="100"
                                            />
                                        </Col>
                                        <Col xs={16} sm={5}>
                                            <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>Default</Text>
                                            <Switch
                                                size="small"
                                                checked={variant.isDefault}
                                                onChange={(val) => updateUnitVariant(index, 'isDefault', val)}
                                            />
                                            {variant.isDefault && <Tag color="blue" style={{ marginLeft: 8 }}>Default</Tag>}
                                        </Col>
                                        <Col xs={8} sm={3} style={{ textAlign: 'right' }}>
                                            <Button
                                                type="text"
                                                danger
                                                icon={<DeleteOutlined />}
                                                onClick={() => removeUnitVariant(index)}
                                                disabled={unitVariants.length === 1}
                                            />
                                        </Col>
                                    </Row>
                                    {variant.label && (
                                        <div style={{ marginTop: 8 }}>
                                            <Tag color="green">{variant.label} - ₹{variant.price}</Tag>
                                        </div>
                                    )}
                                </div>
                            ))}

                            <Button
                                type="dashed"
                                onClick={addUnitVariant}
                                block
                                icon={<PlusCircleOutlined />}
                                style={{ marginTop: 12 }}
                                disabled={unitVariants.length >= 10}
                            >
                                Add Variant ({unitVariants.length}/10)
                            </Button>

                            <div style={{ marginTop: 12, padding: '8px 12px', backgroundColor: '#fffbe6', borderRadius: '6px', border: '1px solid #ffe58f' }}>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                    <strong>Tip:</strong> Add multiple variants like 250gm, 500gm, 1Kg. The default variant will be shown initially.
                                    Price and stock are managed per variant.
                                </Text>
                            </div>
                        </Card>
                    )}
                </div>

                <Divider />

                <Title level={5}>Product Images</Title>
                <Text type="secondary">Upload up to 5 high-quality images. The main image will be displayed in product listings.</Text>

                {/* Main Image */}
                <Form.Item
                    label="Main Product Image"
                    style={{ marginTop: 16 }}
                    required
                    rules={[{
                        required: !initialValues && !mainImageFile,
                        message: 'Please upload a main product image!'
                    }]}
                >
                    <Upload
                        listType="picture-card"
                        showUploadList={false}
                        beforeUpload={() => false}
                        onChange={handleMainImageChange}
                        accept="image/*"
                    >
                        {mainImagePreview ? (
                            <img
                                src={mainImagePreview}
                                alt="main product"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        ) : (
                            uploadButton
                        )}
                    </Upload>
                    {mainImagePreview && (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            {mainImageFile ? 'New main image selected' : 'Current main image (click to change)'}
                        </Text>
                    )}
                </Form.Item>

                {/* Additional Images */}
                <Form.Item label={`Additional Images (${existingImages.length + additionalImages.length}/5)`}>
                    <Space wrap size={[8, 8]}>
                        {/* Existing Images */}
                        {existingImages.map((imgUrl, index) => (
                            <div key={`existing-${index}`} style={{ position: 'relative' }}>
                                <Image
                                    src={imgUrl}
                                    alt={`existing-${index}`}
                                    width={104}
                                    height={104}
                                    style={{ objectFit: 'cover', borderRadius: 8 }}
                                />
                                <DeleteOutlined
                                    onClick={() => removeExistingImage(index)}
                                    style={{
                                        position: 'absolute',
                                        top: 4,
                                        right: 4,
                                        background: 'rgba(255,255,255,0.9)',
                                        padding: 4,
                                        borderRadius: '50%',
                                        cursor: 'pointer',
                                        color: '#ff4d4f'
                                    }}
                                />
                            </div>
                        ))}

                        {/* New Images */}
                        {additionalImages.map((imgObj, index) => (
                            <div key={`new-${index}`} style={{ position: 'relative' }}>
                                <img
                                    src={imgObj.preview}
                                    alt={`additional-${index}`}
                                    style={{
                                        width: 104,
                                        height: 104,
                                        objectFit: 'cover',
                                        borderRadius: 8,
                                        border: '2px solid #52c41a'
                                    }}
                                />
                                <DeleteOutlined
                                    onClick={() => removeAdditionalImage(index)}
                                    style={{
                                        position: 'absolute',
                                        top: 4,
                                        right: 4,
                                        background: 'rgba(255,255,255,0.9)',
                                        padding: 4,
                                        borderRadius: '50%',
                                        cursor: 'pointer',
                                        color: '#ff4d4f'
                                    }}
                                />
                            </div>
                        ))}

                        {/* Upload Button */}
                        {(existingImages.length + additionalImages.length) < 5 && (
                            <Upload
                                listType="picture-card"
                                showUploadList={false}
                                beforeUpload={() => false}
                                onChange={handleAdditionalImageChange}
                                accept="image/*"
                            >
                                {uploadButton}
                            </Upload>
                        )}
                    </Space>
                    <div style={{ marginTop: 8 }}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            Click + to add more images (max 5 total). These will appear in the product details page.
                        </Text>
                    </div>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ProductEditModal;
