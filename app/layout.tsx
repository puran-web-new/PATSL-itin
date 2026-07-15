export const metadata = { title: 'PATSL ITIN', description: 'ITIN workflow intake' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <body>{children}</body>
    </html>
  );
}
