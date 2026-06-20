// app/u/[username]/opengraph-image.tsx
import { ImageResponse } from 'next/og';

export const alt = 'GitHub Badge Tracker Profile';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';
export const runtime = 'edge';

interface OpengraphImageProps {
  params: {
    username: string;
  };
}

export default async function Image({ params }: OpengraphImageProps) {
  const { username } = params;

  let avatarUrl = '';
  let name = '';

  try {
    const res = await fetch(`https://api.github.com/users/${username}`, {
      headers: {
        Accept: 'application/vnd.github+json',
      },
      next: { revalidate: 300 },
    });
    if (res.ok) {
      const data = await res.json();
      avatarUrl = data.avatar_url;
      name = data.name || data.login;
    }
  } catch {
    // Fallback on network/fetch errors
  }

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          backgroundColor: '#0F172A',
          color: 'white',
          fontFamily: 'sans-serif',
          padding: '40px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={name}
              style={{
                width: '180px',
                height: '180px',
                borderRadius: '40px',
                border: '4px solid rgba(255, 255, 255, 0.1)',
              }}
            />
          ) : (
            <div
              style={{
                width: '180px',
                height: '180px',
                borderRadius: '40px',
                backgroundColor: '#1E293B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '80px',
              }}
            >
              🏆
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '48px', fontWeight: 'bold' }}>
              {name || `@${username}`}
            </div>
            <div style={{ fontSize: '28px', color: '#38BDF8', marginTop: '8px' }}>
              @{username}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '40px', marginTop: '60px' }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              padding: '20px 40px',
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <span style={{ fontSize: '18px', color: '#94A3B8' }}>GitHub Badges</span>
            <span style={{ fontSize: '36px', fontWeight: 'bold', color: '#F59E0B', marginTop: '8px' }}>
              Achievement Tracker
            </span>
          </div>
        </div>

        <div style={{ fontSize: '18px', color: '#64748B', marginTop: '60px' }}>
          badge-hunter.vercel.app
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
