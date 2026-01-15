# Resend Email Service - Deployment Guide for Render

## ✅ Migration Complete

You have successfully migrated from **Gmail SMTP (Nodemailer)** to **Resend API**. This change resolves the connection timeout issues you were experiencing on Render.

---

## 📝 What Changed

### 1. **Installed Resend Package**
```bash
npm install resend
```

### 2. **Updated `emailService.js`**
- Removed Nodemailer and Gmail SMTP configuration
- Implemented Resend API integration
- Kept the same retry logic (2 attempts with 2-second delay)
- Maintained all email templates and functionality

### 3. **Updated Environment Variables**
The `.env` file now uses:
```bash
RESEND_API_KEY=re_6BD4K5m5_A3JertsoGf5NPVwxm31hwnpN
RESEND_FROM_EMAIL=onboarding@resend.dev
```

**Important:** The `from` email address must be `onboarding@resend.dev` (Resend's default) because:
- Gmail addresses (like `riderflynn062@gmail.com`) cannot be used as "from" addresses without domain verification
- You would need to verify your own domain to use a custom email address
- For the free tier, `onboarding@resend.dev` works perfectly

---

## 🚀 Deploy to Render - Step by Step

### Step 1: Update Environment Variables on Render

1. Go to your Render dashboard: https://dashboard.render.com
2. Select your backend service
3. Click on **"Environment"** in the left sidebar
4. Add these two new environment variables:

```
Key: RESEND_API_KEY
Value: re_6BD4K5m5_A3JertsoGf5NPVwxm31hwnpN

Key: RESEND_FROM_EMAIL
Value: onboarding@resend.dev
```

5. You can optionally remove these old variables (they're no longer used):
   - `EMAIL_USER`
   - `EMAIL_PASS`
   - `SENDGRID_API_KEY`

6. Click **"Save Changes"**

### Step 2: Deploy Updated Code

1. Commit and push your changes to GitHub:
```bash
git add .
git commit -m "Migrated email service from Gmail to Resend"
git push
```

2. Render will automatically detect the changes and start a new deployment
3. Monitor the deployment logs for any errors

### Step 3: Verify Email Functionality

After deployment:
1. Trigger an order status update from your admin panel
2. Check the Render logs for:
   - `✅ Email sent successfully via Resend. ID: [some-id]`
3. Check your user's inbox (the recipient email)
4. The email should arrive within seconds

---

## 📊 Resend Free Tier Limits

Your current plan includes:
- **100 emails per day**
- **3,000 emails per month**
- No credit card required

You can see your usage in the Resend dashboard: https://resend.com/emails

---

## 🔧 Testing Locally

To test the email service locally:

```bash
cd backend
node test-resend.js
```

Expected output:
```
✅ Email sent successfully!
Response: {
  "data": {
    "id": "3ac150e8-e3c1-4c8b-9b24-e388c85a7bd6"
  }
}
```

---

## 🎯 Why Resend Works Better on Render

| Gmail SMTP (Old) | Resend API (New) |
|------------------|------------------|
| ❌ Connection timeouts | ✅ HTTP API (reliable) |
| ❌ App passwords required | ✅ Simple API key |
| ❌ ISP blocking issues | ✅ No firewall issues |
| ❌ Gmail daily limits | ✅ 100 emails/day free |
| ❌ Slower delivery | ✅ Fast delivery |

---

## 🔐 Security Note

Your API key is currently visible in this conversation. After deployment:
1. Consider regenerating your Resend API key for security
2. Keep it secret and never commit it to public repositories
3. Only store it in `.env` files (which should be in `.gitignore`)

To regenerate:
1. Go to https://resend.com/api-keys
2. Create a new API key
3. Update the `RESEND_API_KEY` in both:
   - Your local `.env` file
   - Render environment variables

---

## 📚 Additional Resources

- [Resend Documentation](https://resend.com/docs)
- [Resend Node.js SDK](https://github.com/resendlabs/resend-node)
- [Verify Custom Domain](https://resend.com/docs/dashboard/domains/introduction) - if you want to use your own email address

---

## ✨ Summary

✅ Nodemailer removed  
✅ Resend installed and configured  
✅ Environment variables updated  
✅ Email service tested locally  
🚀 Ready to deploy to Render

**Next step:** Update environment variables on Render and push your code!
