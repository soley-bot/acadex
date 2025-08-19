# Google OAuth Setup for Acadex

## 🚀 Quick Setup Guide

### Step 1: Google Cloud Console Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. **Optional: Rename project to "Acadex"** for better branding
4. Configure **OAuth consent screen** first:
   - Go to **APIs & Services > OAuth consent screen**
   - Choose **External** user type
   - Fill in:
     - **App name**: Acadex
     - **User support email**: Your email
     - **App logo**: Upload Acadex logo (optional)
     - **Application home page**: http://localhost:3000 (dev) or your domain
     - **Developer contact information**: Your email
   - Click **Save and Continue**
5. Enable the **Google+ API** (if not already enabled)
6. Go to **APIs & Services > Credentials**
7. Click **"Create Credentials" > "OAuth client ID"**
8. Choose **"Web application"**
9. Configure:
   - **Name**: Acadex App
   - **Authorized JavaScript origins**: 
     - `http://localhost:3000` (for development)
     - `https://yourdomain.com` (for production)
   - **Authorized redirect URIs**:
     - `https://qeoeimktkpdlbblvwhri.supabase.co/auth/v1/callback`

8. **Copy the Client ID and Client Secret**

### Step 2: Supabase Configuration
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your Acadex project
3. Go to **Authentication > Providers**
4. Find **Google** and click **Enable**
5. Paste your **Client ID** and **Client Secret** from Google
6. The redirect URL will automatically be: `https://qeoeimktkpdlbblvwhri.supabase.co/auth/v1/callback`
7. Click **Save**

### Step 3: Test the Integration
1. Restart your development server
2. Go to `http://localhost:3000/auth/signup`
3. Click **"Continue with Google"**
4. Should redirect to Google OAuth flow

## 🔧 Current Implementation Status
✅ **Frontend Code**: Google OAuth button and logic implemented  
✅ **AuthContext**: Updated to handle Google authentication  
✅ **UI/UX**: Professional Google sign-in button with official branding  
✅ **Login Page**: Added Google sign-in to login page  
✅ **Signup Page**: Added Google sign-up to signup page  
⏳ **Backend**: Needs Supabase configuration (Steps 1-2 above)

## 🎯 Benefits of Google OAuth
- **Faster Signup**: Users don't need to create passwords
- **Better Security**: Google handles authentication
- **Higher Conversion**: Reduces signup friction
- **User Trust**: Familiar Google sign-in experience
- **No Password Issues**: Users who sign up with Google don't have passwords - they always use Google to log in!

## 🔐 Important: Google Users & Passwords
**Key Point**: Users who sign up with Google **DO NOT have passwords** in your system.

- ✅ **Sign up with Google** → Always log in with Google
- ✅ **Sign up with email/password** → Log in with email/password  
- ❌ **Don't mix methods** → Google users can't use email/password login

**If a Google user tries to log in with email/password, they should:**
1. Click "Continue with Google" on the login page
2. Or reset their account to use email/password instead

## 🐛 If You Get Errors
- **"OAuth provider not configured"**: Complete Supabase setup (Step 2)
- **"Invalid redirect URI"**: Check redirect URLs match exactly
- **"Client ID not found"**: Verify Google Console setup (Step 1)

## 🌐 Production Deployment
When deploying to production:
1. Update Google OAuth settings with your production domain
2. Update Supabase provider settings
3. Test the complete flow in production environment

---

**Need help?** The code is ready - you just need the OAuth credentials! 🚀
