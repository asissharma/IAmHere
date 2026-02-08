// app/components/Marquee.tsx
'use client'

import React, { useEffect, useRef, useState } from "react";

export interface MarqueeProps {
  items: React.ReactNode[];
  // either duration (seconds for a single full loop) OR speedPxPerSec (pixels/sec). duration wins if provided.
  duration?: number;
  speedPxPerSec?: number;
  gap?: string;
  className?: string;
  pauseOnHover?: boolean;
}

const Marquee: React.FC<MarqueeProps> = ({
  items,
  duration,
  speedPxPerSec = 80,
  gap = "1rem",
  className = "",
  pauseOnHover = false,
}) => {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);
  const [isReduced, setIsReduced] = useState(false);
  const [computedDuration, setComputedDuration] = useState<number | null>(duration ?? null);
  const [running, setRunning] = useState(true);

  // detect reduced motion (client-side)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mm = window.matchMedia("(prefers-reduced-motion: reduce)");
    setIsReduced(!!mm.matches);
    const handler = () => setIsReduced(!!mm.matches);
    mm.addEventListener?.("change", handler);
    return () => mm.removeEventListener?.("change", handler);
  }, []);

  // compute animation-duration based on actual width for smooth continuous loop
  useEffect(() => {
    if (!innerRef.current || !viewportRef.current) return;
    if (isReduced) {
      setComputedDuration(null);
      return;
    }

    function recompute() {
      const inner = innerRef.current!;
      // we duplicate the list, so half of inner.scrollWidth is one loop
      const singleLoopWidth = inner.scrollWidth / 2;
      if (duration) {
        setComputedDuration(duration);
      } else {
        // duration (s) = pixels / pxPerSec
        const dur = Math.max(6, singleLoopWidth / Math.max(1, speedPxPerSec));
        setComputedDuration(dur);
      }
    }

    recompute();
    // recompute on resize
    const ro = new ResizeObserver(recompute);
    ro.observe(innerRef.current);
    window.addEventListener("load", recompute);
    return () => {
      ro.disconnect();
      window.removeEventListener("load", recompute);
    };
  }, [items, duration, speedPxPerSec, isReduced]);

  // pause on hover/focus if requested
  useEffect(() => {
    if (!innerRef.current) return;
    const el = innerRef.current;
    if (!pauseOnHover) return;

    const onEnter = () => setRunning(false);
    const onLeave = () => setRunning(true);

    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointerleave", onLeave);
    el.addEventListener("focusin", onEnter);
    el.addEventListener("focusout", onLeave);

    return () => {
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("focusin", onEnter);
      el.removeEventListener("focusout", onLeave);
    };
  }, [pauseOnHover]);

  // For reduced-motion users, present static text (no animation)
  if (isReduced) {
    return (
      <div className={`w-full ${className}`}>
        <div className="py-2 overflow-x-auto">
          <div className="flex gap-4 whitespace-nowrap">
            {items?.map((it, idx) => (
              <div key={idx} className="font-mono text-sm inline-flex items-center gap-2">
                {it}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`} style={{ ['--marquee-gap' as any]: gap }}>
      <div
        ref={viewportRef}
        className="w-full overflow-hidden marquee-viewport"
        aria-label="Animated developer marquee"
      >
        <div
          ref={innerRef}
          className="marquee-inner"
          style={{
            animationDuration: computedDuration ? `${computedDuration}s` : undefined,
            animationPlayState: running ? "running" : "paused",
          }}
          aria-hidden={false}
        >
          <ul className="marquee-list" role="list">
            {items?.map((it, idx) => (
              <li key={`m1-${idx}`} className="marquee-item font-mono whitespace-nowrap" style={{ marginRight: gap }}>
                {it}
              </li>
            ))}
          </ul>

          {/* duplicate for seamless loop */}
          <ul className="marquee-list" aria-hidden="true">
            {items?.map((it, idx) => (
              <li key={`m2-${idx}`} className="marquee-item font-mono whitespace-nowrap" style={{ marginRight: gap }}>
                {it}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <style jsx global>{`
        .marquee-root { --marquee-gap: ${gap}; }
        .marquee-viewport { position: relative; }

        .marquee-inner {
          display: flex;
          width: max-content;
          align-items: center;
          animation-name: marquee-translate;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
          transform: translate3d(0,0,0);
        }

        .marquee-list {
          display: flex;
          align-items: center;
          gap: var(--marquee-gap, 1rem);
          margin: 0;
          padding: 0;
          list-style: none;
          flex-shrink: 0;
        }

        .marquee-item { display: inline-flex; align-items: center; }

        @keyframes marquee-translate {
          from { transform: translate3d(0, 0, 0); }
          to { transform: translate3d(-50%, 0, 0); }
        }

        /* responsive font sizing */
        @media (max-width: 420px) {
          .marquee-item { font-size: 0.95rem; }
        }

        /* respect reduced motion at the CSS level too */
        @media (prefers-reduced-motion: reduce) {
          .marquee-inner { animation: none !important; }
        }
      `}</style>
    </div>
  );
};

export default Marquee;

// curated items (exported to be used by profile)
export const marqueeItems: React.ReactNode[] = [
  <span key="m0" className="inline-flex items-center gap-3">
    <span className="rounded-md text-xs bg-gray-800 text-white px-2">init()</span>
    <span>"hello world — I declared myself alive"</span>
  </span>,
  <span key="m1" className="inline-flex items-center gap-3">
    <span className="rounded-md text-xs bg-clip-text px-2 bg-gradient-to-r from-indigo-400 to-pink-500 text-transparent">TS</span>
    <span>Typed in TypeScript before it had feelings.</span>
  </span>,
  <span key="m2" className="inline-flex items-center gap-3">
    <span className="rounded-md text-xs bg-gray-800 text-white px-2">⚙️</span>
    <span>I make microservices sing and databases behave.</span>
  </span>,
  <span key="m3" className="inline-flex items-center gap-3">
    <span className="rounded-md text-xs bg-gray-800 text-white px-2">CI</span>
    <span>Ship features at 3AM and write rollbacks as bedtime stories.</span>
  </span>,
  <span key="m4" className="inline-flex items-center gap-3">
    <span className="rounded-md text-xs bg-clip-text px-2 bg-gradient-to-r from-green-400 to-blue-500 text-transparent">O(n)</span>
    <span>Optimized an O(n²) brain into O(n log n) elegance.</span>
  </span>,
  <span key="m5" className="inline-flex items-center gap-3">
    <span className="rounded-md text-xs bg-gray-800 text-white px-2">AI</span>
    <span>I teach models to be helpful and politely obey my CLI.</span>
  </span>,
  <span key="m6" className="inline-flex items-center gap-3">
    <span className="rounded-md text-xs bg-gray-800 text-white px-2">🔧</span>
    <span>Debugged in prod — then automated the detective work away.</span>
  </span>,
  <span key="m7" className="inline-flex items-center gap-3">
    <span className="rounded-md text-xs bg-clip-text px-2 bg-gradient-to-r from-yellow-400 to-red-400 text-transparent">infra</span>
    <span>Infrastructure as poetry (with observability annotations).</span>
  </span>,
  <span key="m8" className="inline-flex items-center gap-3">
    <span className="rounded-md text-xs bg-gray-800 text-white px-2">✨</span>
    <span>hello world — I said I was born.</span>
  </span>,
];
