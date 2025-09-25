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
          {/* SVG Logo inline for OpenGraph */}
          <svg
            width="120"
            height="105"
            viewBox="0 0 862.09 753.15"
            xmlns="http://www.w3.org/2000/svg"
            style={{ marginRight: '20px' }}
          >
            <defs>
              <style>{`
                .cls-1 { fill: #4f46e5; }
                .cls-2 { fill: #6d28d9; }
              `}</style>
            </defs>
            <path className="cls-1" d="M546.41,250.2c-6.17,1.96-12.47,4.21-18.78,6.45-33.22,11.92-67.99,27.34-103.73,46.82-5.75,3.22-11.5,6.45-17.24,9.81-29.58,17.1-59.72,37.15-90.14,60.42-10.94,8.27-21.87,17.1-32.8,26.35l16.54-38.69,74.01-172.84,41.77,96.87c35.61-19.35,70.09-34.62,103.31-46.68l-80.74-179h-126.58L58.59,622.79,0,753.01h132.61v-.14c1.26-2.24,24.39-44.44,65.74-104.01,52.57-75.69,134.71-179.42,238.72-264.93,5.32-4.35,10.51-8.55,15.98-12.89,30.42-23.97,62.66-46.26,96.44-65.74,5.75-3.37,11.5-6.59,17.25-9.67,89.01-48.08,188.39-76.4,295.35-66.02.42.14-133.31-39.39-315.68,20.61Z"/>
            <path className="cls-2" d="M615.8,451.91l135.97,301.24h-133.87l-97.42-225.83-21.03-56.21c-2.94,3.22-5.74,6.59-8.69,9.95-57.05,66.16-116.35,154.47-171.86,271.94v.14h-123.07s223.3-460.62,616.78-484.31c-7.71.84-120.55,10.23-222.04,114.81-1.96,2.1-4.49,3.64-6.73,5.47l13.04,25.65,18.93,37.15Z"/>
            <polygon className="cls-2" points="594.9 138.9 624.05 149.69 594.9 160.47 584.12 189.62 573.33 160.47 544.19 149.69 573.33 138.9 584.12 109.76 594.9 138.9"/>
            <polygon className="cls-1" points="699.27 111.36 728.41 122.14 699.27 132.93 688.48 162.07 677.7 132.93 648.55 122.14 677.7 111.36 688.48 82.21 699.27 111.36"/>
            <polygon className="cls-1" points="622.45 29.15 651.59 39.93 622.45 50.72 611.66 79.86 600.88 50.72 571.73 39.93 600.88 29.15 611.66 0 622.45 29.15"/>
            <polygon className="cls-2" points="700.21 48.88 713.14 53.67 700.21 58.46 695.42 71.39 690.63 58.46 677.69 53.67 690.63 48.88 695.42 35.94 700.21 48.88"/>
          </svg>
          <div
            style={{
              fontSize: '72px',
              fontWeight: '900',
              color: '#1f2937',
              letterSpacing: '-2px',
            }}
          >
            ACAD<span style={{ color: '#4f46e5' }}>E</span>X
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

