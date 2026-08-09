import HeroParticleField from './HeroParticleField';
import RimRing from './RimRing';

const CIRCLES = [
  {
    size: '78vmax', left: '-38vmax', top: '-14vmax',
    bg: 'radial-gradient(circle at 35% 30%, #153c60, #0d2540 70%)',
    pulseDelay: '0s', ringFrom: 0, ringDuration: '9s', ringReverse: false,
    glow: 'drop-shadow(0 0 6px #1de9c2) drop-shadow(0 0 14px #39e08a)',
    ringGradient: 'conic-gradient(from 0deg, transparent 0deg, transparent 300deg, #1de9c2 330deg, #39e08a 348deg, #1de9c2 356deg, transparent 360deg)',
  },
  {
    size: '64vmax', left: '-30vmax', top: '22vmax',
    bg: 'radial-gradient(circle at 40% 35%, #113252, #0a1c30 72%)',
    pulseDelay: '-2.3s', ringDuration: '12s', ringReverse: true,
    glow: 'drop-shadow(0 0 6px #1de9c2) drop-shadow(0 0 14px #39e08a)',
    ringGradient: 'conic-gradient(from 0deg, transparent 0deg, transparent 300deg, #1de9c2 330deg, #39e08a 348deg, #1de9c2 356deg, transparent 360deg)',
  },
  {
    size: '46vmax', left: '-8vmax', top: '44vmax',
    bg: 'radial-gradient(circle at 45% 30%, #153c60, #0d2540 70%)',
    pulseDelay: '-4.6s', ringDuration: '9s', ringReverse: false,
    glow: 'drop-shadow(0 0 6px #1de9c2) drop-shadow(0 0 14px #39e08a)',
    ringGradient: 'conic-gradient(from 0deg, transparent 0deg, transparent 300deg, #1de9c2 330deg, #39e08a 348deg, #1de9c2 356deg, transparent 360deg)',
  },
  {
    size: '34vmax', left: '-28vmax', top: '2vmax',
    bg: 'radial-gradient(circle at 40% 30%, #123048, #0a1c30 72%)',
    pulseDelay: '-1.4s', ringDuration: '7s', ringReverse: true,
    glow: 'drop-shadow(0 0 6px #39e08a) drop-shadow(0 0 12px #1de9c2)',
    ringGradient: 'conic-gradient(from 40deg, transparent 0deg, transparent 300deg, #39e08a 330deg, #1de9c2 348deg, #39e08a 356deg, transparent 360deg)',
  },
  {
    size: '26vmax', left: '-20vmax', top: '58vmax',
    bg: 'radial-gradient(circle at 40% 30%, #153c60, #0d2540 72%)',
    pulseDelay: '-3.2s', ringDuration: '6s', ringReverse: false,
    glow: 'drop-shadow(0 0 5px #1de9c2) drop-shadow(0 0 10px #39e08a)',
    ringGradient: 'conic-gradient(from 120deg, transparent 0deg, transparent 300deg, #1de9c2 330deg, #39e08a 348deg, #1de9c2 356deg, transparent 360deg)',
  },
];

const ICONS = [
  { size: 44, top: '14%', left: '30%', floatyDelay: '-1s', fadeDelay: '-1.5s', color: '#1de9c2', path: <><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 8h8M8 12h8M8 16h5" /></> },
  { size: 36, top: '34%', left: '12%', floatyDelay: '-3s', fadeDelay: '-0.6s', color: '#39e08a', path: <><path d="M12 3 20 6v10l-8 5-8-5V6z" /><polyline points="8.5,12 11,14.5 15.5,9.5" /></> },
  { size: 46, top: '52%', left: '26%', floatyDelay: '-4.5s', fadeDelay: '-2.2s', color: '#1de9c2', path: <><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7.5a4 4 0 0 1 8 0V11" /></> },
  { size: 38, top: '70%', left: '16%', floatyDelay: '-2s', fadeDelay: '-3.8s', color: '#39e08a', path: <><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.5-7 8-7s8 3 8 7" /></> },
  { size: 30, top: '86%', left: '24%', floatyDelay: '-0.8s', fadeDelay: '-4.4s', color: '#1de9c2', path: <path d="M12 5v14M5 12h14" /> },
];

export default function HeroBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <HeroParticleField />

      <div
        className="absolute z-[2]"
        style={{ width: '40vmax', height: '40vmax', borderRadius: '50%', background: 'radial-gradient(circle, rgba(29,233,194,0.18), transparent 70%)', filter: 'blur(10px)', left: '-6vmax', bottom: '-10vmax', animation: 'mrd-drift 14s ease-in-out infinite alternate' }}
      />
      <div
        className="absolute z-[2]"
        style={{ width: '40vmax', height: '40vmax', borderRadius: '50%', background: 'radial-gradient(circle, rgba(57,224,138,0.16), transparent 70%)', filter: 'blur(10px)', right: '-10vmax', top: '10vmax', animation: 'mrd-drift 18s ease-in-out infinite alternate -4s' }}
      />

      <div className="absolute inset-0 z-[2]">
        {CIRCLES.map((c, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{ width: c.size, height: c.size, left: c.left, top: c.top, background: c.bg, animation: `mrd-pulse 7s ease-in-out infinite ${c.pulseDelay}` }}
          >
            <RimRing gradient={c.ringGradient} duration={c.ringDuration} reverse={c.ringReverse} glow={c.glow} padding="2px" />
          </div>
        ))}
      </div>

      <div className="absolute inset-x-0 bottom-0 z-[3]" style={{ top: 220 }}>
        {ICONS.map((icon, i) => (
          <div
            key={i}
            className="mrd-badge-icon absolute"
            style={{
              width: icon.size,
              height: icon.size,
              top: icon.top,
              left: icon.left,
              animation: `mrd-floaty 7s ease-in-out infinite ${icon.floatyDelay}, mrd-icon-fade 6s ease-in-out infinite ${icon.fadeDelay}`,
            }}
          >
            <RimRing
              gradient={`conic-gradient(from 0deg, transparent 0deg, transparent 270deg, ${icon.color} 305deg, ${icon.color === '#1de9c2' ? '#39e08a' : '#1de9c2'} 325deg, ${icon.color} 345deg, transparent 360deg)`}
              duration="5s"
              padding="1.4px"
            />
            <svg viewBox="0 0 24 24" fill="none" stroke={icon.color} strokeWidth="1.4" style={{ width: '52%', height: '52%', filter: 'drop-shadow(0 0 5px currentColor)' }}>
              {icon.path}
            </svg>
          </div>
        ))}
      </div>
    </div>
  );
}
