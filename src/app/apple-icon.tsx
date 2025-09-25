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
          background: 'linear-gradient(135deg, #6D28D9 0%, #4F46E5 100%)', // Using brand primary colors
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '36px', // Rounded corners for iOS
          fontSize: '96px', // Larger font for the bigger icon size
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

