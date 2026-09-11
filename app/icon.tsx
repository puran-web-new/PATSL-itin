import Image from 'next/image';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return (
    <Image
      src="/brand/IMG_0230.png"
      alt="PATSL Logo"
      width={32}
      height={32}
      priority
    />
  );
}