import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

/** Sage Academy favicon — the Cloud Native brand mark, white on brand blue. */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#3D5AFE',
          borderRadius: 7,
        }}
      >
        <svg width="24" height="24" viewBox="0 0 64 64" fill="none">
          <g transform="translate(0 -6)">
            <path
              d="M20 44 A10 10 0 0 1 20 24 A13 13 0 0 1 45 21 A9 9 0 0 1 48 44 Z"
              fill="none"
              stroke="#fff"
              strokeWidth="5"
              strokeLinejoin="round"
            />
            <circle cx="26" cy="54" r="3.6" fill="#fff" />
            <circle cx="36" cy="54" r="3.6" fill="#fff" />
            <circle cx="46" cy="54" r="3.6" fill="#fff" />
          </g>
        </svg>
      </div>
    ),
    { ...size }
  )
}
