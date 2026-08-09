'use client';

import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from 'react';

/**
 * Wraps children so they "shuffle in" (fade + slide/rotate from an offset)
 * the first time they scroll into view, instead of just appearing. Pass the
 * same `from` transform each card starts at — once visible, it animates to
 * its natural resting transform (set via CSS on the child itself).
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
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(node);
    return () => observer.disconnect();
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
