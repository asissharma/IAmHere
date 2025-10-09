// app/components/KaalaProfileComponent.tsx
'use client'

import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Marquee, { marqueeItems } from "./marquee";

const IMAGE_SRC = "/profile.png";
const BACKGROUND_SRC = "/positive_mountains.png";

export default function KaalaProfileComponent() {
  const bgRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // respect user reduced-motion preference (framer hook)
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    // mount flag used to avoid running enter animation during SSR/hydration
    const raf = requestAnimationFrame(() => setIsMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  // optional parallax — disabled for reduced motion
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
        const tx = lastX * 10;
        const ty = lastY * 6 + (window.scrollY * 0.01);
        if (bgRef.current) bgRef.current.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(1.02)`;
      });
    }

    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [prefersReducedMotion]);

  const title = "Kaala Sharma";
  const subtitle = "Software Engineer · Published by Us";

  const tech = [
    "React",
    "TypeScript",
    "Next.js",
    "Node",
    "Tailwind",
    "WebGL",
    "GraphQL",
  ];

  //
  // Framer motion variants
  //
  const titleContainer = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.045,
        delayChildren: 0.04,
      },
    },
  } as const;

  const titleLetter = {
    hidden: { opacity: 0, y: -28, scale: 0.78 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 760, damping: 32, mass: 0.12 },
    },
  } as const;

  const subtitleContainer = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.09,
        delayChildren: 0.28, // start after title begins
      },
    },
  } as const;

  const subtitleWord = {
    hidden: { opacity: 0, y: -18, scale: 0.92 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.42, ease: [0.2, 0.9, 0.3, 1] },
    },
  } as const;

  const chipsContainer = {
    hidden: {},
    show: {
      transition: { staggerChildren: 0.08, delayChildren: 0.22 },
    },
  } as const;

  const chipItem = {
    hidden: { opacity: 0, scale: 0.88, y: 6 },
    show: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: "spring", stiffness: 520, damping: 30 },
    },
  } as const;

  const blurbVariant = {
    hidden: { opacity: 0, x: -28 },
    show: { opacity: 1, x: 0, transition: { duration: 0.56, ease: [0.2, 0.9, 0.3, 1] } },
  } as const;

  // helpers
  const renderTitle = () => {
    if (prefersReducedMotion) {
      return <h1 className="text-4xl md:text-4xl font-extrabold leading-tight text-black">{title}</h1>;
    }

    // render each character; skip animating plain spaces (render a small spacer)
    return (
      <motion.h1
        aria-label={title}
        className="text-4xl md:text-4xl font-extrabold leading-tight text-black"
        variants={titleContainer}
        initial="hidden"
        animate={isMounted ? "show" : "hidden"}
      >
        {Array.from(title).map((chr, idx) => {
          if (chr === " ") {
            // small non-animated spacer to preserve word spacing
            return (
              <span key={`sp-${idx}`} aria-hidden style={{ display: "inline-block", width: "0.38rem" }}>
                &nbsp;
              </span>
            );
          }
          return (
            <motion.span
              aria-hidden
              key={`t-${idx}-${chr}`}
              className="inline-block"
              variants={titleLetter}
            >
              {chr}
            </motion.span>
          );
        })}
      </motion.h1>
    );
  };

  const renderSubtitle = () => {
    if (prefersReducedMotion) {
      return <p className="mt-1 text-sm text-slate-600 leading-snug">{subtitle}</p>;
    }

    const words = subtitle.split(" ");
    return (
      <motion.p
        className="mt-1 text-sm text-slate-600 leading-snug flex flex-wrap"
        aria-label={subtitle}
        variants={subtitleContainer}
        initial="hidden"
        animate={isMounted ? "show" : "hidden"}
      >
        {words.map((w, idx) => {
          return (
            <motion.span
              aria-hidden
              key={`s-${idx}-${w}`}
              className="inline-block mr-2"
              variants={subtitleWord}
            >
              {w}
            </motion.span>
          );
        })}
      </motion.p>
    );
  };

  return (
    <div
      ref={containerRef}
      className={`flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-slate-50 to-white text-slate-900`}
    >
      {/* First section */}
      <div className="relative isolate w-full">
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
        <main className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 pr-6 pl-6 halo">
          {/* LEFT — Meta & Bio */}
          <section className="flex flex-col items-start md:items-center justify-center p-6 md:pl-10 md:pr-6 bg-white/30 h-4/5 backdrop-blur-sm ">
            <motion.h1
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-4xl md:text-4xl font-extrabold leading-tight text-black"
            >
              {title}
            </motion.h1>
            <header className="w-full">
              {renderSubtitle()}
            </header>

              <motion.div
                className="mt-4 flex flex-wrap gap-2"
                variants={chipsContainer}
                initial="hidden"
                animate={isMounted ? "show" : "hidden"}
              >
                {tech.map((t) => (
                  <motion.span
                    key={t}
                    className="text-xs px-3 py-1 rounded-full bg-white/70 backdrop-blur-sm ring-1 ring-white/20 inline-flex"
                    variants={chipItem}
                  >
                    {t}
                  </motion.span>
                ))}
              </motion.div>

            {/* Blurb — slide in from left */}
            
            <motion.p className="mt-4 text-sm text-slate-700 fade-in-15">
              I ship delightful developer tools and quirky product features — thoughtful, testable, and fun. Here are a few project highlights.
            </motion.p>
          </section>

          {/* CENTER — Portrait */}
          <section className="flex items-center justify-center">
            <figure
              className="w-[320px] sm:w-[420px] bg-white/5 ring-1 ring-white/10 p-4 flex flex-col items-center relative"
              role="img"
              aria-label={`Kaala Sharma portrait`}
            >
              <div className="relative w-[220px] h-[420px] sm:w-[260px] sm:h-[  500px]">
                <Image
                  src={IMAGE_SRC}
                  alt={`Kaala Sharma portrait`}
                  fill
                  sizes="(max-width: 640px) 60vw, 320px"
                  style={{ objectFit: "contain", objectPosition: "center" }}
                  priority
                />
                <div className="absolute -inset-2 rounded-full blur-3xl opacity-30" aria-hidden="true" />
              </div>
            </figure>
          </section>

          {/* RIGHT — placeholder */}
          <section className="p-6 md:pr-10 md:pl-6 flex flex-col justify-between">
            {/* right column left blank for mascot / social */}
          </section>
        </main>
      </div>

      {/* Marquee */}
      <div className="w-full m-2">
        <Marquee items={marqueeItems} duration={50} gap="1rem"/>
      </div>
      
      {/* Second section */}
      <div className="relative isolate min-h-44 w-full bg-[#b1b2b3]" >

      </div>

      {/* Minor scoped styles */}
      <style jsx>{`
        @media (max-width: 420px) {
          h1 { font-size: 1.4rem; }
        }
      `}</style>
    </div>
  );
}
