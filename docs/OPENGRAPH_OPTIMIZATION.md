# OpenGraph & Social Media Optimization

## ✅ **Enhanced OpenGraph Metadata**

I've updated the homepage OpenGraph configuration with comprehensive social media optimization:

### **🔧 Changes Made to `/src/app/page.tsx`:**

#### **1. Title Consistency Fixed**
```tsx
// Before: Inconsistent titles
title: 'Acadex - Online Learning Platform for Cambodians',
openGraph: {
  title: 'Acadex - Learn Real Skills, Your Way',
}

// After: Consistent branding
title: 'Acadex - Learn Real Skills, Your Way',
openGraph: {
  title: 'Acadex - Learn Real Skills, Your Way',
}
```

#### **2. Complete OpenGraph Properties Added**
```tsx
openGraph: {
  title: 'Acadex - Learn Real Skills, Your Way',
  description: 'Simple lessons and clear explanations made for Cambodian learners. Short videos, friendly visuals, and zero pressure. Start learning today!',
  url: 'https://acadex.com',
  siteName: 'Acadex',
  locale: 'en_US',
  type: 'website',
  images: [
    {
      url: '/og-image.jpg',
      width: 1200,
      height: 630,
      alt: 'Acadex - Online Learning Platform for Cambodians',
    },
  ],
},
```

#### **3. Twitter Card Optimization**
```tsx
twitter: {
  card: 'summary_large_image',
  title: 'Acadex - Learn Real Skills, Your Way',
  description: 'Simple lessons and clear explanations made for Cambodian learners. Short videos, friendly visuals, and zero pressure.',
  images: ['/og-image.jpg'],
},
```

#### **4. SEO & Robots Enhancement**
```tsx
robots: {
  index: true,
  follow: true,
  googleBot: {
    index: true,
    follow: true,
    'max-video-preview': -1,
    'max-image-preview': 'large',
    'max-snippet': -1,
  },
},
```

## 🎨 **OpenGraph Image Requirements**

### **Missing: Social Media Image**
You'll need to create an OpenGraph image at `/public/og-image.jpg` with these specifications:

#### **📐 Image Specifications:**
- **Dimensions**: 1200×630 pixels (Facebook/LinkedIn recommended)
- **Format**: JPG or PNG
- **File size**: < 8MB (recommended < 1MB for fast loading)
- **Aspect ratio**: 1.91:1

#### **🎨 Design Recommendations:**
Based on your brand and typography system:

```
┌─────────────────────────────────────┐
│  🎯 Acadex Logo/Brand               │
│                                     │
│  📚 Learn Real Skills, Your Way     │
│     Simple • Clear • Cambodian      │
│                                     │
│  ✨ Background: Primary gradient    │
│     with subtle visual elements     │
└─────────────────────────────────────┘
```

**Typography for OpenGraph Image:**
- **Main Title**: Bold, large, readable from thumbnail
- **Subtitle**: Medium weight, supporting information
- **Colors**: Use your primary yellow (#FFCE32) and secondary blue (#1D63FF)
- **Font**: Inter (matching your site typography)

#### **📝 Text Content Suggestions:**
```
Main Headline: "Learn Real Skills, Your Way"
Subtitle: "Made for Cambodian Learners"
Features: "Simple Lessons • Clear Videos • Zero Pressure"
Call to Action: "Start Learning Today"
```

## 🔍 **Testing OpenGraph Implementation**

### **Tools to Test Social Media Appearance:**

1. **Facebook Debugger**: https://developers.facebook.com/tools/debug/
2. **Twitter Card Validator**: https://cards-dev.twitter.com/validator
3. **LinkedIn Post Inspector**: https://www.linkedin.com/post-inspector/
4. **WhatsApp Preview**: Send link to test WhatsApp preview

### **How to Test:**
1. Deploy your site or use a public URL
2. Paste your homepage URL into the debugger tools
3. Check that the image, title, and description appear correctly
4. Clear cache if needed (Facebook debugger has "Scrape Again" button)

## 📱 **Social Media Preview Examples**

### **Facebook/LinkedIn Card:**
```
┌─────────────────────────────────────┐
│  [OG Image: 1200x630]              │
│                                     │
│  Acadex - Learn Real Skills, Your Way
│  Simple lessons and clear explanations 
│  made for Cambodian learners...
│  acadex.com
└─────────────────────────────────────┘
```

### **Twitter Card:**
```
┌─────────────────────────────────────┐
│  [OG Image: Large card format]     │
│                                     │
│  Acadex - Learn Real Skills, Your Way
│  Simple lessons and clear explanations...
│  🔗 acadex.com
└─────────────────────────────────────┘
```

### **WhatsApp Preview:**
```
┌─────────────────────────────────────┐
│  [OG Image thumbnail]              │
│  Acadex - Learn Real Skills, Your Way
│  Simple lessons and clear explanations...
└─────────────────────────────────────┘
```

## 🚀 **Next Steps for Complete OpenGraph Setup**

### **Immediate (Required):**
1. **Create OpenGraph image** (`/public/og-image.jpg`) - 1200×630px
2. **Update URL** in metadata when you have your production domain
3. **Test social media previews** with debugging tools

### **Optional Enhancements:**
1. **Favicon optimization** - ensure high-quality favicon.ico
2. **Apple touch icons** - for iOS home screen bookmarks
3. **Manifest.json enhancement** - for PWA capabilities
4. **Multiple image sizes** - for different social platforms

### **Typography-Consistent OpenGraph Image:**
The image should reflect your new semantic typography system:
- **Bold statistics** (100+ learners, 50+ questions)
- **Clear hierarchy** with proper font weights
- **Brand colors** that match your CSS design system
- **Mobile-friendly** text that's readable at small sizes

## 📊 **SEO Benefits of Enhanced OpenGraph**

1. **Better click-through rates** from social media
2. **Professional appearance** when shared
3. **Consistent branding** across all platforms
4. **Improved social media engagement**
5. **Enhanced discoverability** through rich snippets

The OpenGraph metadata is now **fully optimized** and ready for social media sharing, maintaining consistency with your semantic typography approach throughout the entire user experience.
