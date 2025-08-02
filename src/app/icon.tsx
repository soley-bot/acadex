import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const size = {
  width: 32,
  height: 32,
}

export const contentType = 'image/png'

export default function Icon() {
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
          borderRadius: '6px',
        }}
      >
        <div
          style={{
            color: 'white',
            fontSize: '12px',
            fontWeight: '900',
            fontFamily: 'Inter',
            letterSpacing: '-0.5px',
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