// Circular gold-embossed seal/crest used as the site's brand mark: a thin
// engraved ring, laurel-style tick marks, and centered initials — echoing the
// "official credential" look of the CAA badges without claiming any specific
// government seal.
export default function GoldCrest({ className = 'h-9 w-9', initials = 'P' }: { className?: string; initials?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <defs>
        <radialGradient id="crestGold" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#f5e3ad" />
          <stop offset="45%" stopColor="#d4af37" />
          <stop offset="100%" stopColor="#a37f2f" />
        </radialGradient>
      </defs>
      <circle cx="24" cy="24" r="22.5" fill="#080e14" stroke="url(#crestGold)" strokeWidth="1.5" />
      <circle cx="24" cy="24" r="18.5" fill="none" stroke="url(#crestGold)" strokeWidth="1" opacity="0.7" />
      {Array.from({ length: 24 }).map((_, i) => {
        const angle = (i * 360) / 24;
        const rad = (angle * Math.PI) / 180;
        const x1 = 24 + 20.5 * Math.cos(rad);
        const y1 = 24 + 20.5 * Math.sin(rad);
        const x2 = 24 + 22.5 * Math.cos(rad);
        const y2 = 24 + 22.5 * Math.sin(rad);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="url(#crestGold)" strokeWidth="0.75" opacity="0.6" />;
      })}
      <text
        x="24"
        y="30"
        textAnchor="middle"
        fontSize="17"
        fontWeight="800"
        fontFamily="var(--font-display, sans-serif)"
        fill="url(#crestGold)"
      >
        {initials}
      </text>
    </svg>
  );
}
