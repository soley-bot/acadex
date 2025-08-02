export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "Acadex",
    "description": "Modern platform for English learning with expert-led courses and interactive quizzes",
    "url": "https://acadex.academy",
    "logo": "https://acadex.academy/logo.png",
    "sameAs": [
      // Add your social media URLs here when you create them
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "availableLanguage": "English"
    },
    "areaServed": "Worldwide",
    "educationalCredentialAwarded": "Certificate of Completion"
  }
}

export function generateWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Acadex",
    "description": "English Learning & Online Courses Platform",
    "url": "https://acadex.academy",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://acadex.academy/search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  }
}

export function generateCourseSchema(course: any) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": course.title,
    "description": course.description,
    "provider": {
      "@type": "Organization",
      "name": "Acadex",
      "url": "https://acadex.academy"
    },
    "url": `https://acadex.academy/courses/${course.id}`,
    "courseMode": "online",
    "educationalLevel": "beginner-advanced",
    "inLanguage": "en",
    "about": "English Language Learning"
  }
}
