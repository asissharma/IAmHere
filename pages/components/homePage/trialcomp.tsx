// File: components/AnimatedLandingPage.tsx
'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';

interface SectionRevealProps {
  children: React.ReactNode;
  className?: string;
}

const SectionReveal: React.FC<SectionRevealProps> = ({ children, className = '' }) => {
  const ref = useRef<HTMLElement | null>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const variants = {
    hidden: { opacity: 0, y: 40, scale: 0.995 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: [0.2, 0.8, 0.2, 1] } }
  };

  return (
    <motion.section
      ref={ref}
      className={`w-full max-w-6xl mx-auto px-6 py-16 ${className}`}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={variants}
    >
      {children}
    </motion.section>
  );
};

const ScrollProgress: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const width = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  return (
    <motion.div className="fixed top-0 left-0 h-1 z-50 bg-transparent w-full">
      <motion.div style={{ width }} className="h-full origin-left bg-gradient-to-r from-indigo-500 via-pink-500 to-yellow-400 shadow-md" />
    </motion.div>
  );
};

const Navbar: React.FC = () => {
  const { scrollY } = useScroll();
  const blur = useTransform(scrollY, [0, 150], [0, 6]);
  const y = useTransform(scrollY, [0, 200], [0, -10]);
  const bgOpacity = useTransform(scrollY, [0, 120], [0.0, 0.95]);

  return (
    <motion.header style={{ y }} className="fixed top-4 left-0 right-0 z-40 pointer-events-none">
      <motion.nav
        style={{ backdropFilter: blur ? `blur(${(blur as any).get() || 0}px)` : undefined, backgroundColor: bgOpacity ? `rgba(255,255,255,${(bgOpacity as any).get?.() ?? 0})` : undefined }}
        className="mx-auto max-w-6xl px-6 py-3 pointer-events-auto rounded-2xl shadow-sm flex items-center justify-between border border-transparent"
      >
        <div className="flex items-center gap-3">
          <motion.div whileTap={{ scale: 0.92 }} className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-pink-500 text-white font-bold">
            K
          </motion.div>
          <div>
            <div className="font-semibold">K — Labs</div>
            <div className="text-xs opacity-60">Next.js experiments</div>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-6 text-sm opacity-80">
          <a className="hover:underline" href="#features">Features</a>
          <a className="hover:underline" href="#work">Work</a>
          <a className="hover:underline" href="#contact">Contact</a>
          <button className="py-2 px-3 rounded-lg bg-black text-white text-sm">Get Started</button>
        </div>
      </motion.nav>
    </motion.header>
  );
};

const Hero: React.FC = () => {
  const ref = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({ target: ref as any }); // framer types are finicky with generic targets
  const y = useTransform(scrollYProgress, [0, 1], [0, -120]);

  return (
    <section ref={ref} className="relative min-h-[80vh] flex items-center">
      <motion.div style={{ y }} className="absolute inset-0 -z-10 bg-[length:1600px] bg-center" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-700 via-purple-700 to-transparent opacity-80" />
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="g1" x1="0" x2="1">
              <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#ec4899" stopOpacity="0.12" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#g1)" />
        </svg>
      </motion.div>

      <div className="w-full max-w-6xl mx-auto px-6 py-24">
        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-4xl md:text-6xl font-extrabold leading-tight text-white">
          Build fast, smooth, and delightful web experiences.
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mt-6 max-w-2xl text-lg text-white/90">
          Production-ready patterns: scroll-driven motion, section reveals, parallax, and micro-interactions — all in one composable component.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="mt-8 flex gap-3">
          <a href="#features" className="px-5 py-3 rounded-lg bg-white text-black font-medium">Explore features</a>
          <a href="#work" className="px-5 py-3 rounded-lg border border-white/30 text-white">See work</a>
        </motion.div>
      </div>
    </section>
  );
};

type ScrollerItem = { tag: string; title: string; excerpt: string };

interface HorizontalScrollerProps {
  items?: ScrollerItem[];
}

const HorizontalScroller: React.FC<HorizontalScrollerProps> = ({ items = [] }) => {
  return (
    <div className="w-full overflow-x-auto scroll-snap-x py-8">
      <div className="flex gap-6 px-6" style={{ width: 'max-content' }}>
        {items.map((it, idx) => (
          <motion.article key={idx} whileHover={{ scale: 1.03 }} className="min-w-[320px] md:min-w-[420px] p-6 rounded-2xl bg-white/5 border border-white/6 backdrop-blur-md scroll-snap-start">
            <div className="text-sm uppercase opacity-60 tracking-wide">{it.tag}</div>
            <h3 className="mt-2 font-semibold text-lg">{it.title}</h3>
            <p className="mt-3 text-sm opacity-80">{it.excerpt}</p>
          </motion.article>
        ))}
      </div>
    </div>
  );
};

export default function AnimatedLandingPage(): JSX.Element {
  const sampleItems: ScrollerItem[] = [
    { tag: 'Design', title: 'Pixel-perfect UI kits', excerpt: 'Reusable design tokens & component library for scale.' },
    { tag: 'Performance', title: 'Load-fast architectures', excerpt: 'Practical patterns to cut TTFB & improve LCP.' },
    { tag: 'Motion', title: 'Scroll-driven magic', excerpt: 'High-signal animations that guide the eye, not distract.' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f172a] to-[#071029] text-white antialiased">
      <ScrollProgress />
      <Navbar />

      <main className="pt-24">
        <Hero />

        <SectionReveal>
          <div id="features" className="grid md:grid-cols-3 gap-8 items-start">
            <div>
              <h2 className="text-2xl font-bold">Design principles</h2>
              <p className="mt-3 text-sm opacity-80">Zero-clutter UI, motion that clarifies, and components that are composable and themeable.</p>
            </div>

            <div className="md:col-span-2 grid gap-6">
              <div className="p-6 rounded-2xl bg-white/3 border border-white/6">
                <h4 className="font-semibold">Reveal on scroll</h4>
                <p className="text-sm mt-2 opacity-80">Each section uses IntersectionObserver to trigger a single, smooth entrance animation.</p>
              </div>

              <div className="p-6 rounded-2xl bg-white/3 border border-white/6">
                <h4 className="font-semibold">Parallax layers</h4>
                <p className="text-sm mt-2 opacity-80">Background layers subtly translate with scroll to create depth without performance penalty.</p>
              </div>
            </div>
          </div>
        </SectionReveal>

        <SectionReveal>
          <div className="max-w-6xl mx-auto px-6">
            <h3 className="text-2xl font-bold mb-6">Horizontal showcase</h3>
            <HorizontalScroller items={sampleItems} />
          </div>
        </SectionReveal>

        <SectionReveal>
          <div id="work" className="max-w-4xl mx-auto px-6 text-center">
            <h3 className="text-2xl font-bold">Selected work</h3>
            <p className="mt-4 text-sm opacity-80">Examples of production-grade animations and micro-interactions. Each piece tuned to reduce cognitive load while increasing perceived speed.</p>
          </div>
        </SectionReveal>

        <div id="contact" className="py-20">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <h4 className="text-xl font-bold">Want this wired into your Next.js app?</h4>
            <p className="mt-3 text-sm opacity-80">I can break this into small, testable components, connect to your theme tokens, and add SSR-friendly optimisations.</p>
            <div className="mt-6 flex justify-center gap-3">
              <button className="px-5 py-3 rounded-lg bg-white text-black">Ship it</button>
              <button className="px-5 py-3 rounded-lg border border-white/20">Discuss scope</button>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-8 text-center text-sm opacity-70">© {new Date().getFullYear()} K — Labs</footer>
    </div>
  );
}
