import { ImageResponse } from 'next/og'
import { SITE_NAME } from '@/lib/site'

export const alt = SITE_NAME
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          backgroundColor: '#FAFAF8',
          padding: '80px',
        }}
      >
        <div style={{ width: 64, height: 8, backgroundColor: '#C8442A', marginBottom: 40 }} />
        <div
          style={{
            fontSize: 96,
            color: '#1A1A18',
            lineHeight: 1.05,
            fontWeight: 700,
          }}
        >
          Worth a Pint
        </div>
        <div
          style={{
            fontSize: 32,
            color: '#6B6B65',
            marginTop: 24,
            maxWidth: 900,
          }}
        >
          An editorial guide to London&apos;s best independent pubs
        </div>
      </div>
    ),
    { ...size }
  )
}
