import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#080e14', color: '#d4af37', fontSize: 112, fontWeight: 800, borderRadius: 40, border: '8px solid #d4af37' }}>P</div>,
    { ...size },
  );
}
