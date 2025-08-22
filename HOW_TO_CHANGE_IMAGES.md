# 🖼️ How to Change Images in Acadex

## Super Easy Ways to Change Images

### **Method 1: Replace Files (No Coding)**
Simply replace the image files in these folders with new ones using the **same filenames**:

```
public/images/courses/
├── english-grammar.jpg          # For grammar courses
├── conversation-practice.jpg    # For speaking/conversation courses
├── business-english.jpg         # For business courses
├── ielts-preparation.jpg        # For test preparation courses
├── academic-writing.jpg         # For writing courses
└── vocabulary-building.jpg      # For vocabulary courses

public/images/hero/
├── learning-together.jpg        # Courses page hero image
├── online-learning.jpg          # Quizzes page hero image
└── graduation-success.jpg       # Dashboard hero image
```

**Steps:**
1. Find a new image you like
2. Rename it to match one of the names above
3. Drag and drop it into the folder (replace the old one)
4. Refresh your browser - done! ✅

---

### **Method 2: Add New Categories (Easy Editing)**
Want to add new course types? Edit `/src/lib/imageMapping.ts`:

```typescript
// Add your new category here
'photography': {
  src: '/images/courses/photography-course.jpg',
  alt: 'Photography Learning and Camera Skills',
  category: 'Photography'
},
```

Then add the image file: `public/images/courses/photography-course.jpg`

---

### **Method 3: Individual Course Images (Database)**
Want specific courses to have unique images? Add them in the admin panel:

1. Go to Admin → Courses → Edit Course
2. Add an `image_url` field (we can add this to the form)
3. That course will use its specific image instead of the category default

---

### **Method 4: Change Hero Images**
Want different hero images for pages? Edit `/src/lib/imageMapping.ts`:

```typescript
export const heroImageMappings = {
  'courses': {
    src: '/images/hero/YOUR-NEW-IMAGE.jpg',  // ← Change this
    alt: 'Your New Alt Text',
    title: 'Your New Title'
  },
  // ... etc
}
```

---

## Image Requirements

### **File Formats:** 
- ✅ JPG, PNG, WebP
- ✅ Recommended: JPG for photos, PNG for graphics

### **Dimensions:**
- **Course thumbnails**: 400x250px (16:10 ratio) 
- **Hero images**: 800x500px (16:10 ratio)
- **Any size works** - Next.js automatically optimizes them

### **File Size:**
- **Recommended**: Under 500KB per image
- **System automatically optimizes** for web delivery

---

## Free Image Sources

### **Educational Images:**
- **Unsplash**: https://unsplash.com/s/photos/education
- **Pexels**: https://www.pexels.com/search/online%20learning/
- **Pixabay**: https://pixabay.com/images/search/study/

### **Search Terms:**
- "online learning"
- "students studying" 
- "english conversation"
- "language learning"
- "education technology"
- "graduation success"

---

## Summary

**Difficulty Level: ⭐ (Very Easy)**

Most of the time, you just need to:
1. Find a new image
2. Rename it to match the existing filename  
3. Drop it in the folder
4. Refresh - done!

The smart mapping system handles everything automatically! 🚀
