import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
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
          fontSize: 20,
          fontWeight: 800,
          borderRadius: 16,
          border: '1.5px solid #d4af37',
        }}
      >
        P
      </div>
    ),
    { ...size }
  );
}
