// Simple test script to check content review API
console.log('Testing Content Review API...')

// Wait for server to start then test
setTimeout(async () => {
  try {
    const response = await fetch('http://localhost:3000/api/admin/content-review-simple?limit=3')
    const data = await response.json()
    
    console.log('===== API RESPONSE ANALYSIS =====')
    console.log('Response Status:', response.status)
    console.log('Response OK:', response.ok)
    console.log('Data Structure:', {
      hasItems: !!data.items,
      itemsCount: data.items?.length || 0,
      hasStats: !!data.stats,
      statsKeys: data.stats ? Object.keys(data.stats) : []
    })
    
    if (data.items && data.items.length > 0) {
      console.log('First Item:', {
        id: data.items[0].id,
        title: data.items[0].title,
        content_type: data.items[0].content_type,
        priority: data.items[0].priority,
        ai_confidence_score: data.items[0].ai_confidence_score,
        hasCreatedAt: !!data.items[0].created_at,
        hasEstimatedTime: !!data.items[0].estimated_review_time
      })
    }
    
    console.log('Stats:', data.stats)
    console.log('===== END API ANALYSIS =====')
    
  } catch (error) {
    console.error('API Test Failed:', error.message)
  }
}, 5000) // Wait 5 seconds for server to start

export {}
