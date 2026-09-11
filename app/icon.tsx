import { ImageResponse } from 'next/og';

export const size = { width: 512, height: 512 };
export const contentType = 'image/png';

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
          background: '#080e14',
          color: '#d4af37',
          fontSize: 320,
          fontWeight: 800,
          borderRadius: 112,
          border: '24px solid #d4af37',
        }}
      >
        P
      </div>
    ),
    { ...size }
  );
}
