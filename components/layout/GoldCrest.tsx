import Image from 'next/image';

// Circular gold-embossed seal/crest used as the site's brand mark.
// Now displays the full PATSL golden shield logo instead of just initials.
export default function GoldCrest({ className = 'h-9 w-9' }: { className?: string }) {
  return (
    <Image
      src="/brand/IMG_0230.png"
      alt="PATSL Logo"
      width={40}
      height={40}
      className={className}
      priority
    />
  );
}