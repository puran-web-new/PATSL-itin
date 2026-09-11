import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'PATSL ITIN Platform',
    short_name: 'PATSL ITIN',
    description: 'Secure ITIN intake, identity review, and IRS package automation.',
    start_url: '/',
    display: 'standalone',
    background_color: '#080e14',
    theme_color: '#080e14',
    orientation: 'portrait-primary',
    icons: [
      { src: '/icon', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
      { src: '/apple-icon', sizes: '180x180', type: 'image/png' },
    ],
  };
}
