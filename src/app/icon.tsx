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
          background: 'linear-gradient(135deg, #6D28D9 0%, #4F46E5 100%)', // Using brand primary colors
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '6px',
          fontSize: '24px',
          fontWeight: '900',
          fontFamily: 'Inter',
          color: 'white',
        }}
      >
        A
      </div>
    ),
    {
      ...size,
    }
  )
}
