# 🪙 Manual UPI Payment System - Setup Guide

## ✅ What Has Been Implemented

A complete manual UPI payment system has been added to your e-commerce website with **zero gateway fees**!

### 🏗️ System Architecture

```
User Flow:
1. User selects "Pay via UPI (Manual)" at checkout
2. System creates order with UPI payment method
3. Modal shows: UPI QR Code + UPI ID
4. User pays via GPay/PhonePe/Paytm
5. User uploads payment screenshot + UTR number
6. Admin receives verification request
7. Admin verifies in their bank app
8. Admin approves → Order is activated

Database: MongoDB
Payment Gateway: None (₹0 fees!)
Verification: Manual (by admin)
```

## 📁 Files Created/Modified

### Backend Files:
- ✅ `backend/models/upiPayment.model.js` - Payment proof storage model
- ✅ `backend/routes/upiPayment.js` - UPI payment APIs
- ✅ `backend/routes/payment.js` - Added UPI order creation endpoint
- ✅ `backend/models/order.model.js` - Added 'UPI' to payment methods
- ✅ `backend/server.js` - Registered UPI payment routes

### Frontend Files:
- ✅ `frontend/src/components/UpiPaymentModal.js` - Beautiful payment modal with QR code
- ✅ `frontend/src/components/CheckoutPage.js` - Added UPI payment option
- ✅ `frontend/src/components/AdminUpiPayments.js` - Admin verification panel
- ✅ `frontend/src/components/AdminNav.js` - Added UPI tab
- ✅ `frontend/src/App.js` - Added admin route for UPI payments

## 🔧 Required Setup Steps

### Step 1: Add Your UPI Details

#### Option A: Generate Your Own QR Code
1. Open **Google Pay** / **PhonePe** / **Paytm**
2. Go to **Profile** → **QR Code**
3. Download/Screenshot your UPI QR code
4. Save it as `frontend/public/upi-qr-code.png`

#### Option B: Use UPI ID Only
If you don't want to use a QR code:
1. Get your UPI ID (e.g., `yourname@okaxis`)
2. You can temporarily hide the QR in the modal

### Step 2: Update UPI Configuration

Open `frontend/src/components/UpiPaymentModal.js` and update:

```javascript
// Line 17-18
const UPI_ID = 'yourname@okaxis'; // ← Replace with your actual UPI ID
const UPI_QR_CODE = '/upi-qr-code.png'; // ← Path to your QR image in public folder
```

### Step 3: Restart Frontend (if running)

```bash
cd frontend
npm start
```

## 🛡️ Fraud Protection Features

The system includes multiple fraud prevention measures:

1. ✅ **UTR Uniqueness** - Each UTR can only be used once
2. ✅ **Amount Verification** - Submitted amount must match order total
3. ✅ **Pending Limit** - Max 3 pending verifications per user
4. ✅ **Screenshot Required** - Mandatory proof upload (max 5MB)
5. ✅ **Admin Verification** - Manual approval required
6. ✅ **Duplicate Prevention** - One payment proof per order

## 📋 How to Use

### For Customers:

1. Add products to cart
2. Proceed to checkout
3. Select **"Pay via UPI (Manual)"**
4. Click **"Proceed to Pay"**
5. Modal opens with:
   - Your UPI QR Code (scan with any UPI app)
   - Your UPI ID (for manual payment)
   - Amount to pay
6. Make payment in GPay/PhonePe/Paytm
7. Submit proof:
   - UTR/Transaction ID (12-digit number)
   - Payment screenshot
   - Payee name (optional)
8. Wait for admin approval (usually 1-24 hours)

### For Admin:

1. Login as admin
2. Go to **Admin Panel**
3. Click **"UPI Payments"** tab
4. See three sections:
   - **Pending** - Awaiting verification
   - **Approved** - Successfully verified
   - **Rejected** - Declined payments
5. For each pending payment:
   - Click **"View"** to see details + screenshot
   - Verify UTR in your bank app
   - Click **"Approve"** or **"Reject"**
   - Add optional verification note
6. Once approved:
   - Order is activated
   - User can track shipment

## 🔌 API Endpoints

### Customer APIs:
- `POST /api/payment/upi-order` - Create UPI order
- `POST /api/upi-payment/submit` - Submit payment proof
- `GET /api/upi-payment/my-payments` - View my payment submissions

### Admin APIs:
- `GET /api/upi-payment/pending` - Get pending verifications
- `GET /api/upi-payment/all?status={status}` - Get all payments by status
- `PUT /api/upi-payment/:id/approve` - Approve payment
- `PUT /api/upi-payment/:id/reject` - Reject payment

## 💰 Why This is Powerful

| Feature | Razorpay/Stripe | Manual UPI |
|---------|----------------|------------|
| Transaction Fee | 2% | ₹0 |
| KYC Required | Yes | No |
| Setup Time | Days | Minutes |
| Webhooks | Automatic | Manual |
| Failures | Yes | Rare |
| Control | Gateway | Full |

## 🎨 UI/UX Features

- 🌈 Beautiful gradient payment modal
- 📱 Responsive design (mobile + desktop)
- 🖼️ Image preview for payment screenshots
- 📊 Admin dashboard with tabs and filters
- ✨ Professional Ant Design components
- 🔔 Success/error notifications
- 📋 Detailed payment information display

## 🧪 Testing Flow

1. **Create Test Order:**
   - Login as regular user
   - Add products to cart
   - Choose "Pay via UPI"
   - Submit mock payment proof with any UTR

2. **Admin Verification:**
   - Login as admin (isAdmin: true)
   - Go to Admin Panel → UPI Payments
   - View pending payment
   - Approve it

3. **Check Order Status:**
   - Go to Order History
   - Order should be activated

## 🐛 Troubleshooting

### QR Code Not Showing:
- Check if file exists at `frontend/public/upi-qr-code.png`
- Verify file name matches exactly
- Clear browser cache

### Upload Fails:
- Check file size < 5MB
- Only JPG, JPEG, PNG allowed
- Check Cloudinary credentials in `.env`

### UTR Duplicate Error:
- Each UTR must be unique
- Don't reuse old transaction IDs
- This is by design for fraud protection

## 📝 Database Schema

### UpiPayment Collection:
```javascript
{
  user: ObjectId (ref: User),
  orderId: ObjectId (ref: Order),
  utr: String (unique),
  amount: Number,
  paymentScreenshot: String (Cloudinary URL),
  payeeName: String,
  status: 'pending' | 'approved' | 'rejected',
  verificationNote: String,
  verifiedBy: ObjectId (ref: User),
  verifiedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## 🎯 Next Steps

1. ✅ Add your UPI QR code to `frontend/public/`
2. ✅ Update UPI ID in `UpiPaymentModal.js`
3. ✅ Test the complete flow
4. ✅ Monitor admin panel regularly
5. 🔜 Optional: Add email notifications for approvals
6. 🔜 Optional: Add payment status in order history

## 📞 Support

If you encounter any issues:
1. Check this guide
2. Verify all environment variables
3. Check browser console for errors
4. Check backend terminal for API errors

---

**Congratulations! 🎉** You now have a fully functional manual UPI payment system with zero gateway fees!
