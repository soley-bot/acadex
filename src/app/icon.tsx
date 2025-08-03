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
          background: 'linear-gradient(135deg, #dc2626 0%, #ea580c 100%)',
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
            display: 'flex',
            color: 'white',
            fontSize: '12px',
            fontWeight: '900',
            fontFamily: 'Inter',
            letterSpacing: '-0.5px',
          }}
        >
          <span style={{ color: 'white' }}>ACAD</span>
          <span style={{ color: '#fbbf24' }}>E</span>
          <span style={{ color: 'white' }}>X</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}