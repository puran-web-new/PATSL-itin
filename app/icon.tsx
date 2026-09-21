import { ImageResponse } from 'next/og';
import { readFile } from 'fs/promises';
import { join } from 'path';

// Next.js icon route: MUST return an image Response (e.g. ImageResponse), not a
// React `next/image` component. We read the brand logo off disk, embed it as a
// data URL, and render it at favicon size so the served icon is the real PATSL mark.
export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default async function Icon() {
  const logo = await readFile(join(process.cwd(), 'public/brand/IMG_0230.png'));
  const src = `data:image/png;base64,${logo.toString('base64')}`;

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} width={32} height={32} alt="PATSL" />
      </div>
    ),
    { ...size }
  );
}
