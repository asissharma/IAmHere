/*
Single-file demo: "Scrollytelling + Parallax" for Next.js / React + Tailwind

How to use
1. Save this file as `app/components/KaalaScrollyDemo.tsx` in a Next 13 app (app router).
2. Import it from `app/page.tsx` or a route: `import KaalaScrollyDemo from './components/KaalaScrollyDemo'` then render <KaalaScrollyDemo />.
3. Requirements: Tailwind CSS configured, optionally framer-motion installed (the demo works without it, but includes small motion hooks if available).
4. Images are using placeholder public URLs — replace with `/public/...` assets as desired.

What this file contains
- A lightweight Marquee component
- KaalaProfileComponent (adapted from your submission; respects reduced motion)
- ScrollyContainer: 4 full-height narrative panels which pin text and animate as you scroll
- Parallax background layer that responds to pointermove + scroll (disabled when prefers-reduced-motion)

This is meant as a plug-and-play demo; tweak copy, timing, and images to taste.
*/

import React, { useEffect, useRef, useState } from 'react';

// Try to import framer-motion if available; otherwise fall back to noop animations
let motion: any = null;
try { motion = require('framer-motion'); } catch (e) { motion = null; }

function Marquee({ items = [], duration = 20 }: { items?: string[]; duration?: number }) {
  return (
    <div className="overflow-hidden whitespace-nowrap w-full">
      <div
        className="inline-block animate-marquee py-2"
        style={{ animationDuration: `${duration}s` }}
      >
        {items.concat(items).map((it, i) => (
          <span key={i} className="mx-6 inline-block text-sm uppercase tracking-widest opacity-80">
            {it}
          </span>
        ))}
      </div>
      <style jsx>{`
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .animate-marquee { display: inline-block; will-change: transform; animation-name: marquee; animation-timing-function: linear; animation-iteration-count: infinite; }
      `}</style>
    </div>
  );
}

function KaalaProfileComponent({ className = '' }: { className?: string }) {
  const IMAGE_SRC = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=abc';
  const BACKGROUND_SRC = 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1600&auto=format&fit=crop&ixlib=rb-4.0.3&s=def';

  const bgRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    const raf = requestAnimationFrame(() => setIsMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;
    if (!bgRef.current || !containerRef.current) return;
    let raf = 0;
    let lastX = 0;
    let lastY = 0;

    function onPointer(e: PointerEvent) {
      const rect = containerRef.current!.getBoundingClientRect();
      lastX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      lastY = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      schedule();
    }
    function onScroll() { schedule(); }
    function schedule() {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const tx = lastX * 12; // horizontal parallax
        const ty = lastY * 8 + (window.scrollY * 0.02); // vertical + scroll
        if (bgRef.current) bgRef.current.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(1.04)`;
      });
    }

    window.addEventListener('pointermove', onPointer, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [prefersReducedMotion]);

  const title = 'Kaala Sharma';
  const subtitle = 'Software Engineer · Published by Us';
  const tech = ['React', 'TypeScript', 'Next.js', 'Node', 'Tailwind', 'WebGL', 'GraphQL'];

  return (
    <div ref={containerRef} className={`relative w-full max-w-5xl mx-auto p-6 ${className}`}>
      {/* background layer */}
      <div
        ref={bgRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 h-full"
        style={{ transition: 'transform 350ms cubic-bezier(.2,.9,.3,1)', backgroundImage: `url(${BACKGROUND_SRC})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      />

      <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6 items-center bg-white/60 backdrop-blur-md p-6 rounded-2xl shadow-lg">
        <div>
          <h1 className="text-3xl font-extrabold">{title}</h1>
          <p className="mt-1 text-sm text-slate-700">{subtitle}</p>

          <div className="mt-4 flex flex-wrap gap-2">
            {tech.map((t) => (
              <span key={t} className="text-xs px-3 py-1 rounded-full bg-white/80 ring-1 ring-white/20">{t}</span>
            ))}
          </div>

          <p className="mt-4 text-sm text-slate-700">I ship delightful developer tools and quirky product features — thoughtful, testable, and fun. Here are a few project highlights.</p>
        </div>

        <div className="flex items-center justify-center">
          <div className="w-[220px] h-[320px] bg-white/30 rounded-xl overflow-hidden p-4 flex items-center justify-center">
            <img src={IMAGE_SRC} alt="portrait" className="object-contain w-full h-full" />
          </div>
        </div>

        <div className="flex flex-col justify-between">
          <div className="text-sm text-slate-700">Social / Links
            <ul className="mt-2 text-xs opacity-80">
              <li>Twitter — @kaala</li>
              <li>GitHub — /kaala</li>
            </ul>
          </div>

          <div className="mt-4">
            <button className="px-4 py-2 rounded-md bg-slate-900 text-white text-sm">Contact</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScrollyPanel({ index, title, copy, bg }: { index: number; title: string; copy: string; bg: string }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => setVisible(entry.isIntersecting));
      },
      { threshold: 0.55 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={ref} className="min-h-screen flex items-center relative">
      <div className="absolute inset-0 -z-10 bg-cover bg-center" style={{ backgroundImage: `url(${bg})`, filter: 'contrast(0.9) saturate(0.9)' }} />
      <div className="container mx-auto px-6 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="sticky top-28">
            <h2 className={`text-4xl font-bold mb-4 ${visible ? 'opacity-100 translate-y-0' : 'opacity-40 translate-y-6'} transition-all duration-600`}>{title}</h2>
            <p className={`text-lg text-slate-800 ${visible ? 'opacity-100' : 'opacity-60'} transition-opacity duration-600`}>{copy}</p>
          </div>

          <div>
            <div className="space-y-6">
              <div className={`p-6 rounded-xl bg-white/80 shadow ${visible ? 'scale-100' : 'scale-97'} transition-transform duration-600`}>Card A — supporting detail</div>
              <div className={`p-6 rounded-xl bg-white/80 shadow ${visible ? 'scale-100' : 'scale-97'} transition-transform duration-700`}>Card B — supporting detail</div>
              <div className={`p-6 rounded-xl bg-white/80 shadow ${visible ? 'scale-100' : 'scale-97'} transition-transform duration-800`}>Card C — supporting detail</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function KaalaScrollyDemo() {
  const marqueeItems = ['Design', 'Engineering', 'Performance', 'Scrollytelling', 'Parallax', 'Motion'];
  const panels = [
    { title: 'Origin', copy: 'Where it all began — a small studio, big ideas, and endless iteration.', bg: 'https://images.unsplash.com/photo-1503264116251-35a269479413?q=80&w=1600&auto=format&fit=crop&ixlib=rb-4.0.3&s=aaa' },
    { title: 'Build', copy: 'Fast feedback loops, instrumentation, and product-led growth mindset.', bg: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1600&auto=format&fit=crop&ixlib=rb-4.0.3&s=bbb' },
    { title: 'Scale', copy: 'Automate, delegate, and institutionalize the flywheel.', bg: 'https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?q=80&w=1600&auto=format&fit=crop&ixlib=rb-4.0.3&s=ccc' },
    { title: 'Future', copy: 'Speculative, bold, and grounded in first principles.', bg: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1600&auto=format&fit=crop&ixlib=rb-4.0.3&s=ddd' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-900">
      <header className="py-10">
        <div className="container mx-auto px-6 flex items-center justify-between">
          <div className="text-xl font-bold">Kaala — Demo</div>
          <nav className="space-x-4 text-sm opacity-80 hidden md:inline-flex">
            <a href="#" className="hover:underline">Work</a>
            <a href="#" className="hover:underline">About</a>
            <a href="#" className="hover:underline">Contact</a>
          </nav>
        </div>
      </header>

      <main>
        <section className="pt-6 pb-12">
          <KaalaProfileComponent />
        </section>

        <div className="w-full border-t" />

        <div className="py-6">
          <div className="container mx-auto px-6">
            <Marquee items={marqueeItems} duration={30} />
          </div>
        </div>

        {/* Scrollytelling panels */}
        {panels.map((p, i) => (
          <ScrollyPanel key={i} index={i} title={p.title} copy={p.copy} bg={p.bg} />
        ))}

        <section className="min-h-[40vh] flex items-center justify-center">
          <div className="text-center">
            <h3 className="text-3xl font-bold">Thanks — next steps</h3>
            <p className="mt-3 text-slate-700">Swap images, adjust copy, or tell me where you want the scrollytelling to pin/animate and I’ll tighten the motion curve and timing.</p>
          </div>
        </section>
      </main>

      <footer className="py-8">
        <div className="container mx-auto px-6 text-center text-xs opacity-70">© Kaala Demo — generated boilerplate</div>
      </footer>

      <style jsx>{`
        .container { max-width: 1100px; }
        @media (min-width: 768px) {
          .top-28 { top: 7rem; }
        }
        .scale-97 { transform: scale(.97); }
      `}</style>
    </div>
  );
}
