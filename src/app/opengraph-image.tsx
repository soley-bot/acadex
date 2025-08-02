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
              fontSize: '72px',
              fontWeight: '900',
              color: '#1f2937',
              letterSpacing: '-2px',
            }}
          >
            ACAD<span style={{ color: '#ef4444' }}>E</span>X
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
            gap: '60px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              fontSize: '22px',
              color: '#374151',
              fontWeight: '600',
            }}
          >
            • Comprehensive Courses
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              fontSize: '22px',
              color: '#374151',
              fontWeight: '600',
            }}
          >
            • Interactive Quizzes
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              fontSize: '22px',
              color: '#374151',
              fontWeight: '600',
            }}
          >
            • Expert Instructors
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
