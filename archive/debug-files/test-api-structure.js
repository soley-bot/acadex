// Quick test of the updated API structure
const testAPI = async () => {
  try {
    const response = await fetch('/api/admin/generate-enhanced-quiz')
    const data = await response.json()
    
    console.log('API Response Structure:')
    console.log('- availableSubjects:', data.availableSubjects?.length || 0, 'items')
    console.log('- suggestedSubjects:', data.suggestedSubjects?.length || 0, 'items') 
    console.log('- supportedOptions:', Object.keys(data.supportedOptions || {}).join(', '))
    console.log('- note:', data.note)
    
    // Test backward compatibility
    console.log('\nBackward Compatibility Check:')
    console.log('✅ Forms can use options.availableSubjects:', !!data.availableSubjects)
    console.log('✅ New format options.suggestedSubjects:', !!data.suggestedSubjects)
    console.log('✅ Both contain same data:', JSON.stringify(data.availableSubjects) === JSON.stringify(data.suggestedSubjects))
    
    return data
  } catch (error) {
    console.error('API Test failed:', error)
  }
}

// If running in Node.js, comment out the fetch and replace with:
console.log('API structure test script created. Run in browser console or update for Node.js testing.')

module.exports = { testAPI }
