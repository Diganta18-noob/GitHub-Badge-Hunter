// app/api/og/route.ts
import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '1200',
          height: '630',
          backgroundColor: '#0F172A',
          color: 'white',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        <div style={{ fontSize: 80, marginBottom: 20 }}>🏆</div>
        <div style={{ fontSize: 60, fontWeight: 800 }}>Badge Hunter</div>
        <div style={{ fontSize: 28, color: '#94A3B8', marginTop: 16 }}>
          GitHub Achievement Tracker
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
