# Step 2: Supabase Google OAuth Configuration Guide

## 🎯 Complete Step-by-Step Instructions

### Prerequisites
✅ You have completed Step 1 (Google Cloud Console setup)  
✅ You have your **Client ID** and **Client Secret** from Google  
✅ You're logged into your Supabase account

---

## 📋 Step 2: Configure Google OAuth in Supabase

### 1. Access Your Supabase Dashboard
1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Sign in to your account
3. **Select your Acadex project** from the project list

### 2. Navigate to Authentication Settings
1. In the left sidebar, click **"Authentication"**
2. Click on **"Providers"** tab
3. You should see a list of OAuth providers

### 3. Enable Google Provider
1. **Find "Google"** in the providers list
2. Click the **toggle switch** to enable it
3. The Google section will expand to show configuration options

### 4. Configure Google OAuth Settings

#### A. Enter Your Google Credentials
```
Client ID: [Paste from Google Cloud Console]
Client Secret: [Paste from Google Cloud Console]
```

#### B. Redirect URL (Auto-Generated)
- **Supabase automatically shows**: `https://qeoeimktkpdlbblvwhri.supabase.co/auth/v1/callback`
- ✅ **This should match exactly** what you entered in Google Cloud Console
- ❌ **If it doesn't match**, copy this URL and update your Google Cloud Console settings

#### C. Additional Settings (Optional)
- **Scopes**: Leave as default (`openid profile email`)
- **Additional Scopes**: Leave empty unless you need specific Google API access

### 5. Save Configuration
1. Click **"Save"** button at the bottom
2. You should see a success message
3. Google OAuth is now enabled for your project

---

## 🧪 Test the Integration

### 6. Test Google Sign-In
1. **Open your app**: `http://localhost:3000/auth/login`
2. **Click "Continue with Google"**
3. **Expected flow**:
   - Redirects to Google OAuth page
   - Shows your Google account selection
   - Asks for permission to access Acadex
   - Redirects back to your app
   - You should be logged in and redirected to dashboard

### 7. Verify User Creation
1. **Back in Supabase Dashboard** → Authentication → Users
2. **You should see your new user** with:
   - Email from your Google account
   - Provider: `google`
   - Created timestamp

---

## 🐛 Troubleshooting Common Issues

### Issue 1: "OAuth provider not configured"
- **Cause**: Google provider not enabled in Supabase
- **Fix**: Make sure you clicked "Save" after enabling Google

### Issue 2: "Invalid redirect URI"
- **Cause**: Mismatch between Google Console and Supabase URLs
- **Fix**: Copy the exact URL from Supabase and paste it in Google Console

### Issue 3: "Client ID not found"
- **Cause**: Wrong Client ID or Secret
- **Fix**: Double-check you copied the correct credentials from Google Console

### Issue 4: "Access blocked" or "Unauthorized"
- **Cause**: OAuth consent screen not configured
- **Fix**: Complete OAuth consent screen setup in Google Console

---

## 📸 Visual Checkpoints

### ✅ What Success Looks Like:

#### In Supabase Dashboard:
```
Authentication > Providers > Google
[x] Enabled
Client ID: 1234567890-abcdef.apps.googleusercontent.com
Client Secret: ●●●●●●●●●●●●●●●●●●●●
Redirect URL: https://qeoeimktkpdlbblvwhri.supabase.co/auth/v1/callback
Status: ✅ Configured
```

#### In Your App:
```
1. Click "Continue with Google"
2. Google OAuth popup opens
3. Select your Google account
4. Grant permissions
5. Redirected to /dashboard
6. You're logged in!
```

---

## 🚀 Next Steps After Success

### Immediate Testing
- [ ] Test Google signup from signup page
- [ ] Test Google login from login page  
- [ ] Verify user appears in Supabase Users table
- [ ] Test logout and login again

### Production Preparation
- [ ] Set up OAuth consent screen branding
- [ ] Add production domain to Google Console
- [ ] Configure custom Supabase domain (optional)
- [ ] Test with different Google accounts

---

## 📞 Need Help?

### If you get stuck:
1. **Check the exact error message** - it usually tells you what's wrong
2. **Verify URLs match exactly** between Google Console and Supabase
3. **Make sure you saved** both Google Console and Supabase settings
4. **Try a different browser** to rule out cache issues

### Your specific configuration:
- **Supabase Project**: `qeoeimktkpdlbblvwhri.supabase.co`
- **Redirect URL**: `https://qeoeimktkpdlbblvwhri.supabase.co/auth/v1/callback`
- **Test URL**: `http://localhost:3000/auth/login`

---

🎉 **Once this works, your Google OAuth is fully functional and ready for beta testing!**
