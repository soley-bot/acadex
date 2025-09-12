export function generateOrganizationSchema() {
  try {
    const schema = {
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
    
    // Validate the schema before returning
    if (!schema["@context"] || typeof schema["@context"] !== 'string') {
      console.error('Organization schema missing valid @context')
      return null
    }
    
    return schema
  } catch (error) {
    console.error('Error generating organization schema:', error)
    return null
  }
}

export function generateWebsiteSchema() {
  try {
    const schema = {
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
    
    // Validate the schema before returning
    if (!schema["@context"] || typeof schema["@context"] !== 'string') {
      console.error('Website schema missing valid @context')
      return null
    }
    
    return schema
  } catch (error) {
    console.error('Error generating website schema:', error)
    return null
  }
}

export function generateCourseSchema(course: any) {
  try {
    // Add safety check for undefined course
    if (!course) {
      return null
    }
    
    return {
      "@context": "https://schema.org",
      "@type": "Course",
      "name": course.title || "Untitled Course",
      "description": course.description || "",
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
  } catch (error) {
    console.error('Error generating course schema:', error)
    return null
  }
}
