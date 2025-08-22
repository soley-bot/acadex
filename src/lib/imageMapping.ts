// Image mapping utility for courses and content
// Provides professional, context-appropriate images for educational content

export interface ImageMapping {
  src: string
  alt: string
  category: string
}

// Course thumbnail mappings based on category and content
export const courseImageMappings: Record<string, ImageMapping> = {
  // English Grammar & Language Fundamentals
  'grammar': {
    src: '/images/courses/english-grammar.jpg',
    alt: 'English Grammar Learning with Books and Writing',
    category: 'English Grammar'
  },
  'english-grammar': {
    src: '/images/courses/english-grammar.jpg',
    alt: 'English Grammar Learning with Books and Writing',
    category: 'English Grammar'
  },
  'language-fundamentals': {
    src: '/images/courses/english-grammar.jpg',
    alt: 'Language Fundamentals and Writing Practice',
    category: 'Language Fundamentals'
  },

  // Conversation & Speaking Practice
  'conversation': {
    src: '/images/courses/conversation-practice.jpg',
    alt: 'English Conversation Practice and Speaking Skills',
    category: 'Conversation Practice'
  },
  'speaking': {
    src: '/images/courses/conversation-practice.jpg',
    alt: 'English Speaking Practice and Communication',
    category: 'Speaking Practice'
  },
  'communication': {
    src: '/images/courses/conversation-practice.jpg',
    alt: 'English Communication and Conversation Skills',
    category: 'Communication'
  },

  // Business English
  'business': {
    src: '/images/courses/business-english.jpg',
    alt: 'Business English and Professional Communication',
    category: 'Business English'
  },
  'business-english': {
    src: '/images/courses/business-english.jpg',
    alt: 'Business English and Professional Communication',
    category: 'Business English'
  },
  'professional': {
    src: '/images/courses/business-english.jpg',
    alt: 'Professional English and Workplace Communication',
    category: 'Professional English'
  },

  // Test Preparation
  'ielts': {
    src: '/images/courses/ielts-preparation.jpg',
    alt: 'IELTS Test Preparation and Study Materials',
    category: 'IELTS Preparation'
  },
  'toefl': {
    src: '/images/courses/ielts-preparation.jpg',
    alt: 'TOEFL Test Preparation and Practice',
    category: 'TOEFL Preparation'
  },
  'test-preparation': {
    src: '/images/courses/ielts-preparation.jpg',
    alt: 'English Test Preparation and Study Guide',
    category: 'Test Preparation'
  },

  // Academic Writing
  'writing': {
    src: '/images/courses/academic-writing.jpg',
    alt: 'Academic Writing and Essay Composition',
    category: 'Academic Writing'
  },
  'academic-writing': {
    src: '/images/courses/academic-writing.jpg',
    alt: 'Academic Writing and Research Skills',
    category: 'Academic Writing'
  },
  'essay': {
    src: '/images/courses/academic-writing.jpg',
    alt: 'Essay Writing and Academic Composition',
    category: 'Essay Writing'
  },

  // Vocabulary Building
  'vocabulary': {
    src: '/images/courses/vocabulary-building.jpg',
    alt: 'Vocabulary Building and Word Learning',
    category: 'Vocabulary'
  },
  'vocabulary-building': {
    src: '/images/courses/vocabulary-building.jpg',
    alt: 'English Vocabulary Building and Word Study',
    category: 'Vocabulary Building'
  },
  'words': {
    src: '/images/courses/vocabulary-building.jpg',
    alt: 'English Word Learning and Vocabulary Expansion',
    category: 'Word Learning'
  },

  // NEW CATEGORIES - Add as many as you want!
  
  // Photography & Visual Arts
  'photography': {
    src: '/images/courses/photography.jpg',
    alt: 'Photography Skills and Camera Techniques',
    category: 'Photography'
  },
  'camera': {
    src: '/images/courses/photography.jpg',
    alt: 'Camera Operation and Photography Basics',
    category: 'Camera Skills'
  },
  'visual-arts': {
    src: '/images/courses/visual-arts.jpg',
    alt: 'Visual Arts and Creative Design',
    category: 'Visual Arts'
  },

  // Cooking & Culinary Arts
  'cooking': {
    src: '/images/courses/cooking.jpg',
    alt: 'Cooking Skills and Culinary Techniques',
    category: 'Cooking'
  },
  'culinary': {
    src: '/images/courses/cooking.jpg',
    alt: 'Culinary Arts and Food Preparation',
    category: 'Culinary Arts'
  },
  'baking': {
    src: '/images/courses/baking.jpg',
    alt: 'Baking and Pastry Arts',
    category: 'Baking'
  },

  // Science & Technology
  'science': {
    src: '/images/courses/science.jpg',
    alt: 'Science Learning and Laboratory Skills',
    category: 'Science'
  },
  'chemistry': {
    src: '/images/courses/chemistry.jpg',
    alt: 'Chemistry and Chemical Sciences',
    category: 'Chemistry'
  },
  'biology': {
    src: '/images/courses/biology.jpg',
    alt: 'Biology and Life Sciences',
    category: 'Biology'
  },
  'physics': {
    src: '/images/courses/physics.jpg',
    alt: 'Physics and Physical Sciences',
    category: 'Physics'
  },

  // Programming & Technology
  'programming': {
    src: '/images/courses/programming.jpg',
    alt: 'Programming and Software Development',
    category: 'Programming'
  },
  'web-development': {
    src: '/images/courses/web-development.jpg',
    alt: 'Web Development and Coding',
    category: 'Web Development'
  },
  'data-science': {
    src: '/images/courses/data-science.jpg',
    alt: 'Data Science and Analytics',
    category: 'Data Science'
  }
}

// Hero section image mappings for different pages
export const heroImageMappings = {
  'courses': {
    src: '/images/hero/learning-together.jpg',
    alt: 'Students Learning Together in Collaborative Environment',
    title: 'Learn English with Confidence'
  },
  'quizzes': {
    src: '/images/hero/online-learning.jpg',
    alt: 'Online Learning and Quiz Practice Setup',
    title: 'Test Your English Skills'
  },
  'dashboard': {
    src: '/images/hero/graduation-success.jpg',
    alt: 'Successful Student Celebrating Learning Achievement',
    title: 'Your Learning Journey'
  }
}

// Function to get course image based on category, title, or fallback
export function getCourseImage(course: { 
  category?: string 
  title?: string 
  image_url?: string | null 
}): ImageMapping {
  // If course already has an image_url, use it
  if (course.image_url) {
    return {
      src: course.image_url,
      alt: course.title || 'Course Image',
      category: course.category || 'Course'
    }
  }

  // Try to match by category first
  if (course.category) {
    const categoryKey = course.category.toLowerCase().replace(/\s+/g, '-')
    if (courseImageMappings[categoryKey]) {
      return courseImageMappings[categoryKey]
    }
  }

  // Try to match by title keywords
  if (course.title) {
    const titleLower = course.title.toLowerCase()
    
    // Check for keywords in title
    for (const [key, mapping] of Object.entries(courseImageMappings)) {
      if (titleLower.includes(key) || titleLower.includes(key.replace('-', ' '))) {
        return mapping
      }
    }
  }

  // Fallback to grammar image for English courses
  return courseImageMappings['grammar'] || {
    src: '/images/courses/english-grammar.jpg',
    alt: 'English Learning Course',
    category: 'English'
  }
}

// Function to get hero image for specific pages
export function getHeroImage(page: keyof typeof heroImageMappings) {
  return heroImageMappings[page] || heroImageMappings['courses']
}

// Function to generate optimized image props for Next.js Image component
export function getOptimizedImageProps(mapping: ImageMapping, size: 'thumbnail' | 'hero' | 'card' = 'card') {
  const dimensions = {
    thumbnail: { width: 300, height: 200 },
    card: { width: 400, height: 250 },
    hero: { width: 800, height: 500 }
  }

  return {
    src: mapping.src,
    alt: mapping.alt,
    width: dimensions[size].width,
    height: dimensions[size].height,
    className: "object-cover w-full h-full",
    priority: size === 'hero',
    quality: 85
  }
}
