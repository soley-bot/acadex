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
          background: '#ff5757',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '32px',
        }}
      >
        <div
          style={{
            color: 'white',
            fontSize: '100px',
            fontWeight: 'bold',
            fontFamily: 'Inter',
          }}
        >
          A
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
