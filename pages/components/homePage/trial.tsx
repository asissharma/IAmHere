'use client'

import Image from "next/image";
import React, { useEffect, useRef, useState, useMemo } from "react";

const IMAGE_SRC = "/profile.png"; // public/
const BACKGROUND_SRC = "/positive_mountains.png"; // public/

type FuturisticStripProps = {
  items: React.ReactNode[]
  speed?: number
  gap?: number
  direction?: 'left' | 'right'
  pauseOnHover?: boolean
  className?: string
}

/**
 * Compact Futuristic code strip (in-file). Tailwind-first, respects prefers-reduced-motion,
 * pauses on hover/focus, has a small typewriter above and an infinite marquee below.
 */
function FuturisticCodeStrip({
  items,
  speed = 100,
  gap = 28,
  direction = 'left',
  pauseOnHover = true,
  className = ''
}: FuturisticStripProps) {
  const singleRef = useRef<HTMLDivElement | null>(null)
  const [duration, setDuration] = useState(18)
  const [paused, setPaused] = useState(false)
  const [reduce, setReduce] = useState(false)

  const story = useMemo(() => [
    "A cluster wakes at 02:14 — pipes hum, sockets open.",
    'Logs spool out: "build succeeded" — containers begin their slow ballet.',
    "Traffic leans in. Edges respond. Night ships become tomorrow's foundation."
  ], [])

  const [si, setSi] = useState(0)
  const [txt, setTxt] = useState('')
  const [typing, setTyping] = useState(true)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduce(!!mq.matches)
    const onChange = (e: MediaQueryListEvent) => setReduce(!!e.matches)
    mq.addEventListener && mq.addEventListener('change', onChange)

    const measure = () => {
      const el = singleRef.current
      if (!el) return
      const w = el.getBoundingClientRect().width
      if (w <= 0) return
      setDuration(Math.max(6, w / speed))
    }
    measure()
    const ro = new ResizeObserver(measure)
    singleRef.current && ro.observe(singleRef.current)
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
      mq.removeEventListener && mq.removeEventListener('change', onChange)
    }
  }, [speed])

  useEffect(() => {
    if (reduce) return
    let mounted = true
    const line = story[si]
    let i = 0
    setTyping(true)

    const step = () => {
      if (!mounted) return
      if (i <= line.length) {
        setTxt(line.slice(0, i))
        i += 1
        setTimeout(step, 20 + Math.random() * 24)
      } else {
        setTyping(false)
        setTimeout(() => {
          if (!mounted) return
          let j = line.length
          const erase = () => {
            if (!mounted) return
            if (j >= 0) {
              setTxt(line.slice(0, j))
              j -= 1
              setTimeout(erase, 12 + Math.random() * 12)
            } else {
              setSi(s => (s + 1) % story.length)
              setTimeout(() => mounted && setTyping(true), 220)
            }
          }
          erase()
        }, 1200)
      }
    }
    const t = setTimeout(step, 160)
    return () => { mounted = false; clearTimeout(t) }
  }, [si, story, reduce])

  const trackStyle: React.CSSProperties = {
    animationDuration: `${duration}s`,
    animationPlayState: paused || reduce ? 'paused' : 'running',
    animationDirection: direction === 'left' ? 'normal' : 'reverse'
  }
  const itemStyle: React.CSSProperties = { marginRight: `${gap}px` }

  return (
    <div
      className={`relative w-full text-gray-200 ${className}`}
      onMouseEnter={() => pauseOnHover && setPaused(true)}
      onMouseLeave={() => pauseOnHover && setPaused(false)}
      onFocus={() => pauseOnHover && setPaused(true)}
      onBlur={() => pauseOnHover && setPaused(false)}
      aria-label="Futuristic code strip"
    >
      <div aria-hidden className="absolute inset-0 -z-30 bg-gradient-to-b from-gray-900 via-gray-850 to-gray-950 opacity-95" />

      {/* subtle falling hex tokens (reduced-motion aware) */}
      {!reduce && (
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-20">
          {Array.from({ length: 12 }).map((_, i) => (
            <span
              key={i}
              style={{
                left: `${(i / 12) * 100 + Math.random() * 6 - 3}%`,
                animationDuration: `${6 + Math.random() * 8}s`,
                animationDelay: `${Math.random() * -12}s`,
                opacity: 0.05 + Math.random() * 0.12,
                fontSize: `${10 + Math.random() * 18}px`
              }}
              className="absolute top-[-30%] select-none text-gray-500"
            >
              {'0x' + Math.floor(Math.random() * 0xffff).toString(16).padStart(4, '0')}
            </span>
          ))}
        </div>
      )}

      {/* story */}
      <div className="relative z-10 max-w-4xl mx-auto px-2text-center">
        <p className="mt-2 font-mono text-sm text-black-100 min-h-[34px]">
          <span aria-live="polite">{txt}</span>
          <span className={`ml-1 inline-block w-1 h-4 align-middle bg-gray-100 ${typing ? 'animate-cursor' : ''}`} />
        </p>
      </div>

      {/* fade edges */}
      <div aria-hidden className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 z-20" style={{ background: 'linear-gradient(90deg, rgba(13,14,17,1), rgba(13,14,17,0))' }} />
      <div aria-hidden className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 z-20" style={{ background: 'linear-gradient(270deg, rgba(13,14,17,1), rgba(13,14,17,0))' }} />

      {/* marquee track (two copies for seamless loop) */}
      <div className="flex items-center whitespace-nowrap will-change-transform relative z-10" style={trackStyle}>
        <div ref={singleRef} className="flex items-center" role="list">
          {items.map((it, i) => (
            <div key={i} role="listitem" style={itemStyle} className="inline-flex items-center font-mono text-xs tracking-wide px-3 py-2 rounded bg-gray-800/30 border border-gray-700/30 shadow-inner mr-2">
              {typeof it === 'string' ? <span className="select-none text-gray-200">{it}</span> : it}
            </div>
          ))}
        </div>

        <div aria-hidden className="flex items-center py-2">
          {items.map((it, i) => (
            <div key={`dup-${i}`} style={itemStyle} className="inline-flex items-center font-mono text-xs tracking-wide px-3 py-2 rounded bg-gray-800/30 border border-gray-700/30 shadow-inner mr-2">
              {typeof it === 'string' ? <span className="select-none text-gray-200">{it}</span> : it}
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes fall { 0% { transform: translateY(-20%) scale(0.9); } 100% { transform: translateY(140%) scale(1); } }
        @keyframes cursor { 0%{opacity:1}50%{opacity:0}100%{opacity:1} }
        .will-change-transform { animation-name: scroll; animation-timing-function: linear; animation-iteration-count: infinite; }
        .animate-cursor { animation: cursor 1s step-end infinite; }
        .pointer-events-none.absolute > span { animation-name: fall; animation-timing-function: linear; animation-iteration-count: infinite; }
        @media (prefers-reduced-motion: reduce) {
          .will-change-transform, .pointer-events-none.absolute > span, .animate-cursor { animation-play-state: paused !important; animation: none !important; }
        }
      `}</style>
    </div>
  )
}

export default function JokerProfileComponent() {
  // reduced motion
  const prefersReducedMotion = useRef<boolean>(false);

  // refs for background parallax & mascot follow
  const bgRef = useRef<HTMLDivElement | null>(null);
  const mascotRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // determine reduced-motion preference once
  useEffect(() => {
    if (typeof window !== "undefined") {
      prefersReducedMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }
  }, []);

  const items = [
    'const future = async () => { /* compile */ }',
    'docker build --tag=infra:nightly .',
    'kubectl rollout restart deployment/api',
    'git push origin main && npm ci --silent',
    'observability: alerts.ok = true'
  ]

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-white text-slate-900"
    >
      <div className="relative isolate w-full">
        {/* BACKGROUND (parallax layer) */}
        <div
          ref={bgRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-20"
          style={{ transition: "transform 350ms cubic-bezier(.2,.9,.3,1)" }}
        >
          <Image
            src={BACKGROUND_SRC}
            alt=""
            fill
            priority={false}
            sizes="(max-width: 1024px) 100vw, 1200px"
            style={{ objectFit: "cover", objectPosition: "center" }}
          />

          {/* subtle overlay to increase contrast */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(8,10,15,0.06) 0%, rgba(8,10,15,0.12) 30%, rgba(8,10,15,0.34) 100%)",
              mixBlendMode: "multiply",
            }}
          />

          {/* decorative animated gradient shine */}
          <div className="absolute inset-0 opacity-40 animate-shimmer pointer-events-none" />
        </div>

        <main className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 pr-6 pl-6">
          {/* LEFT — Meta & Bio */}
          <section className="flex flex-col items-center justify-center p-6 md:pl-10 md:pr-6 bg-white/30 h-4/5 backdrop-blur-sm rounded-xl shadow-sm transition-transform duration-220 ease-out hover:-translate-y-1">
            <header>
              <h1 id="profile-title" className="text-2xl sm:text-3xl font-semibold tracking-tight">
                Kaala Sharma
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Software Engineer · <span className="opacity-70">Published by Us</span>
              </p>
            </header>

            {/* Tech chips */}
            <div className="mt-4 flex flex-wrap gap-2">
              {[
                "React",
                "TypeScript",
                "Next.js",
                "Node",
                "Tailwind",
                "WebGL",
                "GraphQL",
              ].map((t) => (
                <span
                  key={t}
                  className="text-xs px-3 py-1 rounded-full bg-white/70 backdrop-blur-sm ring-1 ring-white/20 transform transition-transform duration-200 hover:-translate-y-0.5"
                >
                  {t}
                </span>
              ))}
            </div>

            {/* Short blurb + metrics */}
            <p className="mt-4 text-sm text-slate-700">
              I ship delightful developer tools and quirky product features — thoughtful, testable, and fun. Here are a few project highlights.
            </p>

          </section>

          {/* CENTER — Portrait (single static canvas) */}
          <section className="flex items-center justify-center">
            <figure
              className="w-[320px] sm:w-[420px] bg-white/5 ring-1 ring-white/10 p-4 flex flex-col items-center rounded-2xl transform transition-transform duration-260 ease-out hover:-translate-y-2"
              role="img"
              aria-label={`Kaala Sharma portrait`}
            >
              <div
                className="relative w-[220px] h-[420px] sm:w-[260px] sm:h-[500px] overflow-hidden transform transition-transform duration-320 ease-out"
                style={{ willChange: "transform" }}
              >
                <Image
                  src={IMAGE_SRC}
                  alt={`Kaala Sharma portrait`}
                  fill
                  sizes="(max-width: 640px) 60vw, 320px"
                  style={{ objectFit: "contain", objectPosition: "center" }}
                  priority
                />

                {/* subtle floating halo */}
                <div className="absolute -inset-2 rounded-full blur-3xl opacity-30 animate-halo" aria-hidden="true" />
              </div>
            </figure>
          </section>

          {/* RIGHT — Featured / Social / Mascot */}
          <section className="p-6 md:pr-10 md:pl-6 flex flex-col justify-between">
           
          </section>
        </main>

        <style jsx>{`
          :root {
            --accent-purple: #6f2ff0;
            --accent-cyan: #00d1ff;
            --highlight: #ff6b35;
            --muted: #9aa4b2;
          }

          /* shimmer for background */
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
          .animate-shimmer {
            background: linear-gradient(90deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.02) 100%);
            background-size: 400% 100%;
            animation: shimmer 6s linear infinite;
          }

          /* floating halo */
          @keyframes halo {
            0% { transform: translateY(-2px) scale(1); opacity: 0.28; }
            50% { transform: translateY(-6px) scale(1.03); opacity: 0.45; }
            100% { transform: translateY(-2px) scale(1); opacity: 0.28; }
          }
          .animate-halo { animation: halo 4.2s ease-in-out infinite; }

          /* ensure reduced motion respects user preference */
          @media (prefers-reduced-motion: reduce) {
            .isolate * { transition: none !important; animation: none !important; }
          }

          :focus { outline: none; }
        `}</style>
      </div>

      {/* === INSERT THE STRIP BETWEEN THE TWO "relative isolate w-full" DIVS === */}
      <div className="w-full">
        <FuturisticCodeStrip items={items} speed={110} gap={32} />
      </div>

      {/* second block (kept as requested) */}
      <div className="relative isolate w-full">
        {/* BACKGROUND (parallax layer) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-20"
          style={{ transition: "transform 350ms cubic-bezier(.2,.9,.3,1)" }}
        >
          <Image
            src={BACKGROUND_SRC}
            alt=""
            fill
            priority={false}
            sizes="(max-width: 1024px) 100vw, 1200px"
            style={{ objectFit: "cover", objectPosition: "center" }}
          />

          {/* subtle overlay to increase contrast */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(8,10,15,0.06) 0%, rgba(8,10,15,0.12) 30%, rgba(8,10,15,0.34) 100%)",
              mixBlendMode: "multiply",
            }}
          />

          <div className="absolute inset-0 opacity-40 animate-shimmer pointer-events-none" />
        </div>

        <main className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 pr-6 pl-6">
          {/* LEFT — Meta & Bio (duplicate for layout continuation) */}
          <section className="flex flex-col items-center justify-center p-6 md:pl-10 md:pr-6 bg-white/30 h-4/5 backdrop-blur-sm rounded-xl shadow-sm transition-transform duration-220 ease-out hover:-translate-y-1">
            <header>
              <h1 id="profile-title-2" className="text-2xl sm:text-3xl font-semibold tracking-tight">
                Kaala Sharma
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Software Engineer · <span className="opacity-70">Published by Us</span>
              </p>
            </header>

            <div className="mt-4 flex flex-wrap gap-2">
              {[
                "React",
                "TypeScript",
                "Next.js",
                "Node",
                "Tailwind",
                "WebGL",
                "GraphQL",
              ].map((t) => (
                <span
                  key={`b-${t}`}
                  className="text-xs px-3 py-1 rounded-full bg-white/70 backdrop-blur-sm ring-1 ring-white/20 transform transition-transform duration-200 hover:-translate-y-0.5"
                >
                  {t}
                </span>
              ))}
            </div>

            <p className="mt-4 text-sm text-slate-700">
              I ship delightful developer tools and quirky product features — thoughtful, testable, and fun.
            </p>

          </section>

          {/* CENTER — repeat portrait */}
          <section className="flex items-center justify-center">
            <figure
              className="w-[320px] sm:w-[420px] bg-white/5 ring-1 ring-white/10 p-4 flex flex-col items-center rounded-2xl transform transition-transform duration-260 ease-out hover:-translate-y-2"
              role="img"
              aria-label={`Kaala Sharma portrait 2`}
            >
              <div
                className="relative w-[220px] h-[420px] sm:w-[260px] sm:h-[500px] overflow-hidden transform transition-transform duration-320 ease-out"
                style={{ willChange: "transform" }}
              >
                <Image
                  src={IMAGE_SRC}
                  alt={`Kaala Sharma portrait`}
                  fill
                  sizes="(max-width: 640px) 60vw, 320px"
                  style={{ objectFit: "contain", objectPosition: "center" }}
                  priority
                />
                <div className="absolute -inset-2 rounded-full blur-3xl opacity-30 animate-halo" aria-hidden="true" />
              </div>
            </figure>
          </section>

          <section className="p-6 md:pr-10 md:pl-6 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-16 h-16 rounded-full bg-white/5 ring-1 ring-white/10 flex items-center justify-center">🎭</div>
              <div className="text-sm text-slate-700">More links</div>
            </div>
          </section>
        </main>

        <style jsx>{`
          :root {
            --accent-purple: #6f2ff0;
            --accent-cyan: #00d1ff;
            --highlight: #ff6b35;
            --muted: #9aa4b2;
          }

          /* shimmer for background */
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }

          .animate-shimmer {
            background: linear-gradient(90deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.02) 100%);
            background-size: 400% 100%;
            animation: shimmer 6s linear infinite;
          }

          /* floating halo */
          @keyframes halo {
            0% { transform: translateY(-2px) scale(1); opacity: 0.28; }
            50% { transform: translateY(-6px) scale(1.03); opacity: 0.45; }
            100% { transform: translateY(-2px) scale(1); opacity: 0.28; }
          }
          .animate-halo { animation: halo 4.2s ease-in-out infinite; }

          :focus { outline: none; }

          @media (prefers-reduced-motion: reduce) {
            .isolate * { transition: none !important; animation: none !important; }
          }
        `}</style>
      </div>

    </div>
  );
}
