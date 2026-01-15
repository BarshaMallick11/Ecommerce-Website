## 🚀 Quick Deploy Checklist for Render

### ✅ Step-by-Step:

1. **Go to Render Dashboard**
   - URL: https://dashboard.render.com
   - Select your backend service

2. **Add Environment Variables**
   Navigate to **Environment** tab and add:
   ```
   RESEND_API_KEY=re_6BD4K5m5_A3JertsoGf5NPVwxm31hwnpN
   RESEND_FROM_EMAIL=onboarding@resend.dev
   ```

3. **Push Code to GitHub**
   ```bash
   git add .
   git commit -m "Switch to Resend email service"
   git push
   ```

4. **Wait for Render to Deploy**
   - Render will auto-deploy on push
   - Watch the deployment logs

5. **Test the Email**
   - Update an order status in admin panel
   - Check if email arrives to user

### 📌 Important Notes:
- ✅ Local testing passed
- ✅ Uses Resend's free tier (100 emails/day)
- ✅ No more timeout issues
- ⚠️ Must use `onboarding@resend.dev` as FROM address (free tier requirement)

### 🆘 If Issues:
- Check Render logs for errors
- Verify environment variables are set correctly
- Make sure both RESEND_API_KEY and RESEND_FROM_EMAIL are added
