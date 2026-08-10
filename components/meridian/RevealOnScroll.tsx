'use client';

import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from 'react';

/**
 * Wraps children so they "shuffle in" (fade + slide/rotate from an offset)
 * the first time they scroll into view, instead of just appearing. Pass the
 * same `from` transform each card starts at — once visible, it animates to
 * its natural resting transform (set via CSS on the child itself).
 *
 * Defensive by design: if IntersectionObserver isn't available, throws, or
 * simply never fires (slow connection, browser quirk, etc.), a fallback
 * timer forces the content visible anyway. Content must never get stuck
 * permanently invisible just because a scroll-animation hook didn't fire.
 */
export default function RevealOnScroll({
  children,
  delay = '0ms',
  from = 'translateY(28px) scale(0.94)',
}: {
  children: ReactNode;
  delay?: string;
  from?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    const reveal = () => setVisible(true);

    // Safety net: no matter what happens with the observer below, make sure
    // this content is visible within 1.2s of mounting.
    const fallback = window.setTimeout(reveal, 1200);

    if (!node || typeof IntersectionObserver === 'undefined') {
      reveal();
      return () => window.clearTimeout(fallback);
    }

    try {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            reveal();
            observer.disconnect();
          }
        },
        { threshold: 0.15 }
      );
      observer.observe(node);
      return () => {
        window.clearTimeout(fallback);
        observer.disconnect();
      };
    } catch {
      reveal();
      return () => window.clearTimeout(fallback);
    }
  }, []);

  return (
    <div
      ref={ref}
      style={
        {
          opacity: visible ? 1 : 0,
          transform: visible ? 'none' : from,
          transition: `opacity 0.7s ease-out, transform 0.7s ease-out`,
          transitionDelay: delay,
        } as CSSProperties
      }
    >
      {children}
    </div>
  );
}
