# 🧪 UPI Payment System - Quick Test Guide

## Quick Setup (5 minutes)

### Step 1: Update Your UPI Details
1. Open `frontend/src/components/UpiPaymentModal.js`
2. Find line 17-18:
   ```javascript
   const UPI_ID = 'yourname@okaxis'; // ← Change this
   const UPI_QR_CODE = '/upi-qr-code.png'; // ← Leave as is (or update if needed)
   ```
3. Replace with your actual UPI ID (e.g., `yourusername@paytm`)

### Step 2: Add Your QR Code (Optional but Recommended)
1. Open Google Pay / PhonePe / Paytm
2. Go to Profile → QR Code
3. Download/Screenshot it
4. Save as: `frontend/public/upi-qr-code.png`
   - This will replace the placeholder

### Step 3: Restart Frontend (if needed)
```bash
# If you made changes while frontend was running:
# Press Ctrl+C in the terminal running npm start
# Then restart:
cd frontend
npm start
```

---

## 🎯 Testing the Complete Flow

### Test 1: User Creates UPI Order

1. **Navigate to Store**
   - Go to http://localhost:3000
   - Login as a regular user (not admin)

2. **Add Items to Cart**
   - Click on any product
   - Click "Add to Cart"
   - Go to Cart (cart icon in header)

3. **Proceed to Checkout**
   - Click "Proceed to Checkout"
   - Add/Select shipping address
   - Click "Continue to Payment"

4. **Select UPI Payment**
   - You should see three options:
     - ✅ Pay Online with Razorpay
     - ✅ **Pay via UPI (Manual)** ← Select this
       - Should show badge: "₹0 fees • No gateway"
     - ✅ Cash on Delivery (COD)

5. **Click "Proceed to Pay"**
   - A beautiful modal should open
   - Should display:
     - ✅ Total Amount (in purple gradient card)
     - ✅ QR Code (your custom one or placeholder)
     - ✅ UPI ID with copy button
     - ✅ Form with UTR, Name, Screenshot fields

6. **Submit Mock Payment Proof**
   - **UTR:** Enter any 12-digit number (e.g., `123456789012`)
   - **Name:** Enter any name (e.g., `Test User`)
   - **Screenshot:** Upload any image (JPG/PNG, < 5MB)
   - Click "Submit Payment Proof"

7. **Verify Success**
   - Should see success message: "Payment proof submitted! Awaiting admin verification."
   - Cart should clear
   - Should redirect to Order History page
   - Order should appear with UPI payment method

---

### Test 2: Admin Verifies Payment

1. **Login as Admin**
   - Logout from user account
   - Login with admin credentials (isAdmin: true)

2. **Navigate to Admin Panel**
   - Click on your username → Admin Panel
   - Should see tabs:
     - Product Management
     - Order Management
     - **UPI Payments** ← Click this

3. **View Pending Payments**
   - Should see the "Pending" tab active
   - Your test payment should appear in the table
   - Should display:
     - ✅ Date/Time
     - ✅ User details (username + email)
     - ✅ UTR number
     - ✅ Amount
     - ✅ Status (orange "Pending" tag)
     - ✅ Screenshot thumbnail
     - ✅ Actions (View, Approve, Reject)

4. **View Payment Details**
   - Click "View" button
   - Modal should open with:
     - ✅ All payment details
     - ✅ Order information
     - ✅ Full-size screenshot
     - ✅ User contact info

5. **Approve Payment**
   - Close the detail modal
   - Click "Approve" button
   - Verification modal should open
   - (Optional) Add a note: "Test verification successful"
   - Click "Approve"

6. **Verify Approval**
   - Should see success message
   - Payment should move to "Approved" tab
   - Status should change to green "Approved" tag
   - Order should be activated in Order Management

---

### Test 3: Check Order Status

1. **Go to Order Management**
   - Click "Order Management" tab
   - Find the order that was just approved

2. **Verify Order Details**
   - ✅ Payment Method: UPI
   - ✅ Payment ID: Should be `UPI-{your_utr}` (e.g., `UPI-123456789012`)
   - ✅ Status: Processing
   - ✅ Can now ship the order

---

## 🛡️ Fraud Protection Tests

### Test 4: Duplicate UTR (Should Fail)

1. Create another UPI order as user
2. Try to submit payment proof with **same UTR** as before
3. **Expected:** Error message "This UTR has already been used"

### Test 5: Amount Mismatch (Should Fail)

1. Create a UPI order with total ₹500
2. In the payment proof submission, manually edit the amount to ₹400
3. **Expected:** Error message about amount mismatch

### Test 6: Pending Limit (Should Fail)

1. Create 3 UPI orders
2. Submit payment proofs for all 3 (don't approve)
3. Try to create 4th order and submit proof
4. **Expected:** Error "You have too many pending verifications"

### Test 7: File Size Limit (Should Fail)

1. Create UPI order
2. Try to upload image > 5MB
3. **Expected:** Error "Image must be smaller than 5MB!"

---

## 📊 Things to Check

### Frontend Checklist:
- [ ] UPI option appears in checkout
- [ ] Modal opens smoothly
- [ ] QR code displays (placeholder or yours)
- [ ] Copy button works for UPI ID
- [ ] File upload accepts JPG/PNG
- [ ] File upload rejects other formats
- [ ] Form validation works
- [ ] Success message appears
- [ ] Cart clears after submission
- [ ] Redirects to orders page

### Admin Panel Checklist:
- [ ] UPI Payments tab appears in admin nav
- [ ] Pending payments load
- [ ] Table displays all columns correctly
- [ ] Screenshot thumbnails show
- [ ] View button opens detail modal
- [ ] Detail modal shows full screenshot
- [ ] Approve button works
- [ ] Reject button works
- [ ] Status updates correctly
- [ ] Tabs switch (Pending/Approved/Rejected)

### Backend Checklist:
- [ ] UPI order created in database
- [ ] Payment proof created in database
- [ ] Screenshot uploaded to Cloudinary
- [ ] UTR uniqueness enforced
- [ ] Amount validation works
- [ ] Pending limit enforced
- [ ] Approval updates order
- [ ] PaymentId changes from PENDING to actual UTR

---

## 🐛 Common Issues & Fixes

### Issue 1: QR Code Not Showing
**Solution:** 
- Check if `frontend/public/upi-qr-code.png` exists
- Clear browser cache (Cmd+Shift+R / Ctrl+Shift+R)
- Verify filename is exactly `upi-qr-code.png`

### Issue 2: Upload Fails
**Solution:**
- Verify Cloudinary credentials in `backend/.env`
- Check file format (only JPG, JPEG, PNG)
- Check file size (< 5MB)

### Issue 3: Admin Panel Empty
**Solution:**
- Make sure you submitted at least one payment proof
- Check you're logged in as admin
- Refresh the page

### Issue 4: Can't Find UPI Option
**Solution:**
- Refresh the checkout page
- Clear browser cache
- Check browser console for errors

---

## 🎨 UI Preview

### What the UPI Modal Should Look Like:
```
┌─────────────────────────────────┐
│  Pay via UPI                    │
├─────────────────────────────────┤
│  [Purple Gradient Card]         │
│    ₹999.00                      │
│    Total Amount to Pay          │
│                                 │
│  Scan QR Code:                  │
│  [QR Code Image]                │
│                                 │
│  Or Pay to UPI ID:              │
│  yourname@okaxis  [Copy]        │
└─────────────────────────────────┘
│                                 │
│  After Payment, Submit Proof    │
│  ┌─────────────────────────┐   │
│  │ UTR Number*             │   │
│  │ [Input field]           │   │
│  ├─────────────────────────┤   │
│  │ Your Name               │   │
│  │ [Input field]           │   │
│  ├─────────────────────────┤   │
│  │ Payment Screenshot*     │   │
│  │ [Upload button]         │   │
│  └─────────────────────────┘   │
│                                 │
│  [Submit Payment Proof]         │
└─────────────────────────────────┘
```

### What Admin Panel Should Look Like:
```
┌────────────────────────────────────────┐
│  UPI Payment Verifications             │
├────────────────────────────────────────┤
│  [Pending] [Approved] [Rejected]       │
├────────────────────────────────────────┤
│ Date     | User  | UTR  | Amount | ... │
├────────────────────────────────────────┤
│ Jan 11   | John  | 1234 | ₹999   | ... │
│ 7:30 PM  | Doe   | 5678 |        | ... │
└────────────────────────────────────────┘
```

---

## ✅ Success Criteria

Your UPI system is working if:
- ✅ Users can select UPI payment
- ✅ Modal shows QR code and UPI ID
- ✅ Users can submit payment proof
- ✅ Proof uploads to Cloudinary
- ✅ Admin can see pending payments
- ✅ Admin can approve/reject
- ✅ Order activates on approval
- ✅ Duplicate UTR is prevented

---

## 📞 Need Help?

If something doesn't work:
1. Check browser console (F12)
2. Check backend terminal for errors
3. Verify all files are saved
4. Review the documentation:
   - `UPI_PAYMENT_SETUP.md`
   - `PAYMENT_METHODS_GUIDE.md`
   - `UPI_IMPLEMENTATION_SUMMARY.md`

---

**Happy Testing! 🚀**

Once everything works, you're ready to go live with ₹0 payment gateway fees! 💰
