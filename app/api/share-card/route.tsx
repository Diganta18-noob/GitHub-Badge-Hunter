// app/api/share-card/route.ts
import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get('username') ?? 'unknown';

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
        <div style={{ fontSize: 48, fontWeight: 700 }}>@{username}</div>
        <div style={{ fontSize: 24, color: '#94A3B8', marginTop: 12 }}>
          GitHub Badge Profile
        </div>
        <div style={{ fontSize: 18, color: '#64748B', marginTop: 24 }}>
          badge-hunter.vercel.app
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        'Cache-Control': 'public, max-age=3600',
      },
    },
  );
}
