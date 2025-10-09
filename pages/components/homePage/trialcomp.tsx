// pages/index.tsx
// Next.js + TypeScript page implementing:
// - Single floating hero image that scales/moves on scroll and "settles" into the second section
// - While the image is moving toward the target, the masonry grid is hidden; the grid fades in when the image nearly reaches its settled place
// - Pinterest-like masonry grid and a small form to add pins
//
// Notes:
// - Uses framer-motion for smooth springs and motion values.
// - Tailwind CSS classes used for layout; adjust as needed.

import React, { useRef, useState, useEffect, useCallback } from 'react';
import type { NextPage } from 'next';
import { motion, useSpring, useMotionValue } from 'framer-motion';

type Pin = {
  id: string;
  title: string;
  image: string;
};

const samplePins: Pin[] = Array.from({ length: 8 }).map((_, i) => ({
  id: String(i),
  title: `Pin ${i + 1}`,
  image: `https://picsum.photos/seed/pin${i + 1}/600/800`,
}));

const Home: NextPage = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const heroInnerRef = useRef<HTMLDivElement | null>(null); // hero container for measurement
  const settleTargetRef = useRef<HTMLDivElement | null>(null); // target area where image should settle
  const floatingImgRef = useRef<HTMLImageElement | null>(null); // fixed floating image DOM

  const [pins, setPins] = useState<Pin[]>(samplePins);
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  // motion values
  const mvX = useMotionValue(0);
  const mvY = useMotionValue(0);
  const mvScale = useMotionValue(1);
  const mvOpacity = useMotionValue(1);
  const mvProgress = useMotionValue(0); // 0..1 progress of transition

  // springs
  const springX = useSpring(mvX, { stiffness: 160, damping: 30 });
  const springY = useSpring(mvY, { stiffness: 160, damping: 30 });
  const springScale = useSpring(mvScale, { stiffness: 160, damping: 30 });
  const springOpacity = useSpring(mvOpacity, { stiffness: 120, damping: 28 });
  const springProgress = useSpring(mvProgress, { stiffness: 140, damping: 30 });

  const [showGrid, setShowGrid] = useState(false);

  // subscribe to springProgress to toggle grid visibility when near settled
  useEffect(() => {
    const unsubscribe = springProgress.onChange((v) => {
      // show grid slightly before fully settled so they perceive blending
      if (v >= 0.92) setShowGrid(true);
      else setShowGrid(false);
    });
    return () => unsubscribe();
  }, [springProgress]);

  const measureRects = useCallback(() => {
    const heroImg = heroInnerRef.current?.querySelector('img') as HTMLImageElement | null;
    const target = settleTargetRef.current;
    if (!heroImg || !target || !floatingImgRef.current) return null;

    const heroRect = heroImg.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();

    // convert to page coordinates
    const scrollY = window.scrollY || window.pageYOffset;
    const scrollX = window.scrollX || window.pageXOffset;

    const heroPage = {
      left: heroRect.left + scrollX,
      top: heroRect.top + scrollY,
      width: heroRect.width,
      height: heroRect.height,
      centerX: heroRect.left + heroRect.width / 2 + scrollX,
      centerY: heroRect.top + heroRect.height / 2 + scrollY,
    };

    const targetPage = {
      left: targetRect.left + scrollX,
      top: targetRect.top + scrollY,
      width: targetRect.width,
      height: targetRect.height,
      centerX: targetRect.left + targetRect.width / 2 + scrollX,
      centerY: targetRect.top + targetRect.height / 2 + scrollY,
    };

    return { heroPage, targetPage };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    let mounted = true;

    function updateOnScroll() {
      if (!mounted) return;
      const rects = measureRects();
      if (!rects) return;

      const { heroPage, targetPage } = rects;

      // choose start and end scroll positions
      // start when hero top is near top-third of viewport
      const start = Math.max(0, heroInnerRef.current!.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.35);
      // end when the target top is at ~30% viewport from top (settled)
      const end = Math.max(start + 1, targetPage.top - window.innerHeight * 0.30);

      const scrollY = window.scrollY || window.pageYOffset;
      let t = (scrollY - start) / (end - start);
      t = Math.max(0, Math.min(1, t));

      // compute deltas and scales
      const deltaX = targetPage.centerX - heroPage.centerX;
      const deltaY = targetPage.centerY - heroPage.centerY;
      const targetScale = (targetPage.width / heroPage.width) * 0.98; // slightly smaller

      // apply to motion values
      mvX.set(deltaX * t);
      mvY.set(deltaY * t);
      mvScale.set(1 -  (targetScale - 1) * t);
      mvOpacity.set(1 - 0.12 * t);
      mvProgress.set(t);

      // size & position the fixed floating image to match hero initial rect (viewport coords)
      const floatEl = floatingImgRef.current;
      if (floatEl) {
        floatEl.style.width = `${heroPage.width}px`;
        floatEl.style.height = `${heroPage.height}px`;
        const leftViewport = heroPage.left - window.scrollX;
        const topViewport = heroPage.top - window.scrollY;
        floatEl.style.left = `${leftViewport}px`;
        floatEl.style.top = `${topViewport}px`;
      }
    }

    // initial
    updateOnScroll();

    let ticking = false;
    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateOnScroll();
          ticking = false;
        });
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      mounted = false;
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [measureRects, mvX, mvY, mvScale, mvOpacity, mvProgress]);

  // Add new pin
  function addPin(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !imageUrl.trim()) return;
    const p: Pin = { id: String(Date.now()), title: title.trim(), image: imageUrl.trim() };
    setPins([p, ...pins]);
    setTitle('');
    setImageUrl('');
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-100 text-gray-900">
      {/* HERO SECTION */}
      <section className="relative h-[85vh] lg:h-[80vh] flex items-center justify-center overflow-hidden" ref={heroInnerRef}>
        {/* decorative backgrounds */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -left-20 -top-20 w-72 h-72 rounded-full bg-gradient-to-br from-pink-200 to-yellow-200 opacity-30 blur-3xl transform rotate-45"></div>
          <div className="absolute right-0 bottom-0 w-96 h-96 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 opacity-30 blur-3xl"></div>
        </div>

        {/* layout placeholder (keeps page flow) - hide the real hero image (duplicate) */}
        <div className="relative z-0 w-[70vw] max-w-4xl rounded-2xl overflow-hidden bg-white pointer-events-none">
          <img
            src="/profile.png"
            alt="Hero placeholder"
            className="w-full h-[56vh] object-cover sm:h-[60vh] md:h-[64vh] lg:h-[56vh] opacity-0"
            style={{ display: 'block' }}
          />

          <div className="p-6 bg-gradient-to-t from-black/5 to-transparent">
            <h1 className="text-3xl md:text-4xl font-semibold">Modern animated experience</h1>
            <p className="mt-2 text-sm text-gray-600">Scroll to watch the hero shrink and blend into the gallery below.</p>
          </div>
        </div>

        {/* Floating image - fixed & animated via motion values */}
        <motion.img
          ref={floatingImgRef}
          src="/profile.png"
          alt="Hero"
          style={{
            translateX: springX as any,
            translateY: springY as any,
            scale: springScale as any,
            opacity: springOpacity as any,
            position: 'fixed',
            left: 0,
            top: 0,
            zIndex: 50,
            borderRadius: '14px',
            boxShadow: '0 30px 80px rgba(2,6,23,0.12)',
            transformOrigin: 'center center',
            pointerEvents: 'none'
          }}
          className="object-cover"
        />

        {/* Decorative circle that'll expand with the image (subtle) */}
        <motion.div
          aria-hidden
          style={{
            scale: springProgress as any,
            opacity: springProgress as any
          }}
          className="pointer-events-none absolute z-10 rounded-full bg-gradient-to-r from-indigo-200 to-pink-200 mix-blend-screen"
          // center in hero area
          // inline styles for size & positioning (no duplicate 'style' prop)
          // using as React.CSSProperties to satisfy TypeScript
          {...({
            style: {
              width: '280px',
              height: '280px',
              left: '50%',
              transform: 'translateX(-50%)',
              top: 'calc(50% - 140px)',
              boxShadow: '0 30px 80px rgba(99,102,241,0.12), inset 0 0 60px rgba(236,72,153,0.06)'
            } as React.CSSProperties
          } as any)}
        />
      </section>

      {/* SECOND SECTION (settle target) */}
      <section ref={settleTargetRef} className="relative py-20 px-6 lg:px-24">
        <div className="max-w-6xl mx-auto">
          {/* Target container where the floating image will move to */}
          <div className="flex items-center justify-center mb-12">
            <div className="w-[320px] max-w-full rounded-xl overflow-hidden shadow-lg bg-white/30 border border-gray-100" style={{ height: 192 }}>
              {/* empty - the floating image will overlap this area when it arrives */}
            </div>
          </div>
          {/* Masonry grid - hidden until showGrid=true */}
          <div
            className="transition-opacity duration-500 hidden"
            style={{ opacity: showGrid ? 1 : 0, pointerEvents: showGrid ? 'auto' : 'none' }}
          >
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
              {pins.map((p) => (
                <article key={p.id} className="break-inside-avoid rounded-lg overflow-hidden bg-white shadow-sm mb-4">
                  <img src={p.image} alt={p.title} className="w-full object-cover" style={{ width: '100%', display: 'block' }} />
                  <div className="p-3">
                    <h3 className="font-semibold text-sm">{p.title}</h3>
                    <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                      <span>{Math.floor(Math.random() * 500)} saves</span>
                      <button className="px-2 py-1 rounded-md bg-gray-100">Open</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 text-center text-sm text-gray-500">
        Grid appears when the hero finishes its shrink & settle motion. Adjust the 0.92 threshold inside the file to tune timing.
      </footer>
    </div>
  );
};

export default Home;
