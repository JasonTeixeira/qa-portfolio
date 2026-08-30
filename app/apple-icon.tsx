import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

/** Apple touch icon — the Cloud Native brand mark, white on brand blue. */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background:
            'radial-gradient(circle at 32% 24%, rgba(255,255,255,0.16), transparent 55%), #3D5AFE',
          borderRadius: 40,
        }}
      >
        <svg width="120" height="120" viewBox="0 0 64 64" fill="none">
          <g transform="translate(0 -6)">
            <path
              d="M20 44 A10 10 0 0 1 20 24 A13 13 0 0 1 45 21 A9 9 0 0 1 48 44 Z"
              fill="none"
              stroke="#fff"
              strokeWidth="4"
              strokeLinejoin="round"
            />
            <circle cx="26" cy="54" r="3.5" fill="#fff" />
            <circle cx="36" cy="54" r="3.5" fill="#fff" opacity="0.9" />
            <circle cx="46" cy="54" r="3.5" fill="#fff" opacity="0.75" />
          </g>
        </svg>
      </div>
    ),
    { ...size }
  )
}
