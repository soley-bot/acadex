# 🎯 Adding New Course Categories - Complete Guide

## The System is 100% Flexible!

You can add **unlimited categories** beyond English learning. Here's how:

## Step 1: Add Your Categories

Edit `/src/lib/imageMapping.ts` and add your new categories. I just added examples for:

### **Photography & Visual Arts**
```typescript
'photography': {
  src: '/images/courses/photography.jpg',
  alt: 'Photography Skills and Camera Techniques', 
  category: 'Photography'
},
'visual-arts': {
  src: '/images/courses/visual-arts.jpg',
  alt: 'Visual Arts and Creative Design',
  category: 'Visual Arts'
},
```

### **Cooking & Culinary**
```typescript
'cooking': {
  src: '/images/courses/cooking.jpg',
  alt: 'Cooking Skills and Culinary Techniques',
  category: 'Cooking'
},
'baking': {
  src: '/images/courses/baking.jpg', 
  alt: 'Baking and Pastry Arts',
  category: 'Baking'
},
```

### **Science & Technology**
```typescript
'science': {
  src: '/images/courses/science.jpg',
  alt: 'Science Learning and Laboratory Skills',
  category: 'Science'
},
'programming': {
  src: '/images/courses/programming.jpg',
  alt: 'Programming and Software Development', 
  category: 'Programming'
},
```

## Step 2: Add the Images

Create image files in `public/images/courses/` with these names:
- `photography.jpg`
- `visual-arts.jpg` 
- `cooking.jpg`
- `baking.jpg`
- `science.jpg`
- `programming.jpg`
- etc.

## Step 3: That's It! ✅

The system automatically:
- ✅ Detects course categories and assigns the right image
- ✅ Falls back gracefully if no match is found
- ✅ Handles multiple variations (e.g., "programming", "coding", "web-development")

## Advanced: Multiple Keywords per Category

You can map multiple keywords to the same image:

```typescript
// All these will use the same programming image:
'programming': { src: '/images/courses/programming.jpg', ... },
'coding': { src: '/images/courses/programming.jpg', ... },
'software': { src: '/images/courses/programming.jpg', ... },
'web-development': { src: '/images/courses/programming.jpg', ... },
```

## Examples of Categories You Could Add:

### **Creative Arts**
- Photography, Drawing, Design, Music, Video Editing

### **Professional Skills** 
- Project Management, Leadership, Marketing, Sales

### **Technical Skills**
- Programming, Data Science, Cybersecurity, AI/ML

### **Life Skills**
- Cooking, Fitness, Finance, Time Management

### **Academic Subjects**
- Math, Science, History, Literature, Languages

## The Smart Matching System

The system checks in this order:
1. **Exact category match**: `course.category = "Photography"` → photography image
2. **Title keywords**: `course.title = "Learn Python Programming"` → programming image  
3. **Flexible variations**: `"web-development"` matches `"web development"`
4. **Fallback**: Uses default grammar image if nothing matches

**Bottom Line**: Add any category you want! The system is completely flexible and extensible. 🚀
