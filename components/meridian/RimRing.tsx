import type { CSSProperties } from 'react';

type Props = {
  /** conic-gradient (or any) background used to paint the ring */
  gradient: string;
  duration?: string;
  reverse?: boolean;
  glow?: string;
  padding?: string;
};

/**
 * The recurring Meridian "spinning rim-light ring" motif. Renders as an
 * absolutely-positioned overlay masked down to a thin ring, so the parent
 * element just needs `position: relative` (and usually `overflow: hidden`
 * unless the glow should bleed outside, in which case leave overflow visible).
 */
export default function RimRing({ gradient, duration = '5s', reverse = false, glow, padding = '1.4px' }: Props) {
  return (
    <span
      aria-hidden
      className="mrd-ring-el"
      style={
        {
          background: gradient,
          animationDuration: duration,
          animationDirection: reverse ? 'reverse' : 'normal',
          filter: glow,
          padding,
        } as CSSProperties
      }
    />
  );
}
