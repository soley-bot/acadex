import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'Acadex - English Learning Platform'
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '40px',
          }}
        >
          <div
            style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '48px',
              fontWeight: 'bold',
              marginRight: '24px',
              boxShadow: '0 10px 30px rgba(59, 130, 246, 0.3)',
            }}
          >
            A
          </div>
          <div
            style={{
              fontSize: '72px',
              fontWeight: 'bold',
              color: '#1f2937',
              letterSpacing: '-2px',
            }}
          >
            Acadex
          </div>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: '32px',
            color: '#6b7280',
            textAlign: 'center',
            maxWidth: '800px',
            lineHeight: '1.4',
          }}
        >
          Master English with Expert-Led Courses & Interactive Quizzes
        </div>

        {/* Features */}
        <div
          style={{
            display: 'flex',
            marginTop: '60px',
            gap: '40px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              fontSize: '24px',
              color: '#374151',
            }}
          >
            📚 Comprehensive Courses
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              fontSize: '24px',
              color: '#374151',
            }}
          >
            🎯 Interactive Quizzes
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              fontSize: '24px',
              color: '#374151',
            }}
          >
            👨‍🏫 Expert Instructors
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
