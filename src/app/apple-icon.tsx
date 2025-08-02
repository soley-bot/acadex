import { ImageResponse } from 'next/og'

// Route segment config
export const runtime = 'edge'

// Image metadata
export const size = {
  width: 180,
  height: 180,
}
export const contentType = 'image/png'

// Image generation
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '36px',
        }}
      >
        <div
          style={{
            color: 'white',
            fontSize: '64px',
            fontWeight: '900',
            fontFamily: 'Inter',
            letterSpacing: '-3px',
          }}
        >
          A<span style={{ color: '#ef4444' }}>E</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
