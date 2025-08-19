import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('Testing course update with authentication...')
    
    const body = await request.json()
    const { courseId, updates, testToken } = body
    
    if (!courseId || !updates) {
      return NextResponse.json({ 
        error: 'courseId and updates are required',
        received: { courseId, updates }
      }, { status: 400 })
    }
    
    console.log('Testing course update:', courseId)
    console.log('With updates:', updates)
    
    // Test the actual course update API
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/admin/courses`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': testToken ? `Bearer ${testToken}` : ''
      },
      body: JSON.stringify({
        id: courseId,
        ...updates
      })
    })
    
    console.log('API Response status:', response.status)
    
    const responseData = await response.json()
    console.log('API Response data:', responseData)
    
    return NextResponse.json({
      success: true,
      message: 'Course update test completed',
      apiStatus: response.status,
      apiResponse: responseData,
      testDetails: {
        courseId,
        updates,
        hasToken: !!testToken
      }
    })

  } catch (error) {
    console.error('Test course update error:', error)
    return NextResponse.json({ 
      error: 'Test failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
