# ⚡ Quick Setup - SendGrid Email Service

## 🎯 The Problem
Resend only allows sending to YOUR email address on free tier.
Cannot send to customer emails → Migration to SendGrid required.

## 🚀 3-Step Setup

### 1️⃣ Get SendGrid API Key (5 mins)
```
1. Visit: https://signup.sendgrid.com/
2. Create account with: riderflynn062@gmail.com
3. Go to: Settings → API Keys → Create API Key
4. Name: "ecommerce-backend"
5. Permission: "Full Access"  
6. COPY the key (starts with SG.)
```

### 2️⃣ Verify Your Sender Email (2 mins)
```
1. Go to: Settings → Sender Authentication
2. Click "Single Sender Verification"
3. Add: riderflynn062@gmail.com
4. Check email and click verification link
```

### 3️⃣ Update .env File
```bash
SENDGRID_API_KEY=SG.paste_your_key_here
SENDGRID_FROM_EMAIL=riderflynn062@gmail.com
```

## ✅ Test It
```bash
node test-sendgrid.js
```

## 🎉 Done!
Restart your server and test order status updates.

---

**SendGrid Dashboard**: https://app.sendgrid.com/
**Email Activity Log**: https://app.sendgrid.com/email_activity
