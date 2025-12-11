// app/components/KaalaProfileComponent.tsx
'use client'

import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Marquee, { marqueeItems } from "./marquee";
import HeaderData from "./infoheader";

const IMAGE_SRC = "/profile.png";
const BACKGROUND_SRC = "/positive_mountains.png";

export default function KaalaProfileComponent() {
  const bgRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const imgWrapRef = useRef<HTMLDivElement | null>(null);
  const haloRef = useRef<HTMLDivElement | null>(null);
  const sec2Ref = useRef<HTMLDivElement | null>(null);

  const [isMounted, setIsMounted] = useState(false);
  const [showHalo, setShowHalo] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  // Halo images array
  const haloImages = [
    'https://randomuser.me/api/portraits/women/1.jpg',
    'https://randomuser.me/api/portraits/men/2.jpg',
    'https://randomuser.me/api/portraits/women/3.jpg',
    'https://randomuser.me/api/portraits/men/4.jpg',
    'https://randomuser.me/api/portraits/women/5.jpg',
    'https://randomuser.me/api/portraits/men/6.jpg',
    'https://randomuser.me/api/portraits/women/7.jpg',
    'https://randomuser.me/api/portraits/men/8.jpg',
    'https://randomuser.me/api/portraits/women/9.jpg',
    'https://randomuser.me/api/portraits/men/10.jpg',
    'https://randomuser.me/api/portraits/women/11.jpg',
    'https://randomuser.me/api/portraits/men/12.jpg',
  ];

  // Profile data
  const title = "Kaala Sharma";
  const subtitle = "Software Engineer · Published by Us";
  const tech = [
    "React", "TypeScript", "Next.js", "Node",
    "Tailwind", "WebGL", "GraphQL",
  ];

  // Mount animation
  useEffect(() => {
    const raf = requestAnimationFrame(() => setIsMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  // Scroll-based profile animation
  useEffect(() => {
    const update = () => {
      if (!imgWrapRef.current || !sec2Ref.current) return;

      const scrollY = window.scrollY;
      const vh = window.innerHeight;
      const sec2Top = sec2Ref.current.offsetTop;
      const sec2Center = sec2Top + sec2Ref.current.offsetHeight / 2;
      const screenCenter = scrollY + vh / 2;
      const total = sec2Center - vh / 2;

      // Calculate progress (0 to 1)
      let progress = (screenCenter - vh / 2) / total;
      progress = Math.max(0, Math.min(1, progress));

      const moveX = progress * -400;
      const scale = 1 - 0.5 * progress;

      // Fix & move while scrolling
      if (scrollY <= sec2Center - 320) {
        Object.assign(imgWrapRef.current.style, {
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) translateX(${moveX}px) scale(${scale})`,
        });
      } else {
        Object.assign(imgWrapRef.current.style, {
          position: "absolute",
          top: `${sec2Center}px`,
          left: "50%",
          transform: `translate(-50%, -50%) translateX(${moveX}px) scale(${scale})`,
        });
      }

      // Show halo when progress reaches 90%
      setShowHalo(progress >= 0.9);
    };

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
    
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  // Parallax background effect
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

    function onScroll() {
      schedule();
    }

    function schedule() {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const tx = lastX * 10;
        const ty = lastY * 6 + (window.scrollY * 0.01);
        bgRef.current!.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(1.02)`;
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

  // Subtitle render function
  const renderSubtitle = () => (
    <motion.p
      className="mt-1 text-sm text-slate-600 leading-snug flex flex-wrap"
      aria-label={subtitle}
      initial="hidden"
      animate={isMounted ? "show" : "hidden"}
    >
      {subtitle.split(" ").map((word, i) => (
        <motion.span key={i} className="inline-block mr-2">
          {word}
        </motion.span>
      ))}
    </motion.p>
  );

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-slate-50 to-white text-slate-900"
    >
      {/* Section 1: Hero with background */}
      <div className="relative isolate w-full">
        {/* Parallax background */}
        <div
          ref={bgRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-20 transition-transform duration-300 ease-[cubic-bezier(.2,.9,.3,1)]"
        >
          <Image
            src={BACKGROUND_SRC}
            alt=""
            fill
            style={{ objectFit: "cover", objectPosition: "center" }}
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/40 mix-blend-multiply" />
        </div>

        {/* Main content grid */}
        <main className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 px-6">
          {/* Left column: Header data */}
          <HeaderData
            title={title}
            subtitle={subtitle}
            tech={tech}
            isMounted={isMounted}
            renderSubtitle={renderSubtitle}
          />

          {/* Center column: Empty for layout */}
          <div />

          {/* Right column: Empty for layout */}
          <section className="p-6 md:pr-10 md:pl-6 flex flex-col justify-between" />
        </main>
      </div>

      {/* Marquee section */}
      <div className="w-full my-8">
        <Marquee items={marqueeItems} duration={50} gap="1rem" />
      </div>

      {/* Section 2: Scroll anchor */}
      <div 
        ref={sec2Ref} 
        className="relative isolate min-h-[44vh] w-full bg-[#b1b2b3]" 
      />

      {/* Floating profile image with halo */}
      <div 
        ref={imgWrapRef} 
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-[5] w-[300px] h-[300px]"
      >
        {/* Profile card */}
        <section className="flex items-center justify-center w-full h-full">
          <figure
            className="w-[320px] sm:w-[420px] bg-white/5 backdrop-blur-sm ring-1 ring-white/10 p-4 rounded-lg shadow-[0_25px_70px_rgba(0,0,0,0.5)] flex flex-col items-center"
            role="img"
            aria-label="Kaala Sharma portrait"
          >
            <div className="relative w-[220px] h-[420px] sm:w-[260px] sm:h-[500px]">
              <Image
                src={IMAGE_SRC}
                alt="Kaala Sharma portrait"
                fill
                sizes="(max-width: 640px) 60vw, 320px"
                style={{ objectFit: "contain", objectPosition: "center" }}
                priority
              />
            </div>
          </figure>
        </section>

        {/* Halo effect */}
        <div 
          ref={haloRef} 
          className={`absolute inset-0 flex items-center justify-center pointer-events-none z-[6] transition-opacity duration-500 ${
            showHalo ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {haloImages.map((src, i) => (
            <div
              key={i}
              className={`absolute w-[80px] h-[80px] rounded-2xl overflow-hidden shadow-lg transition-all duration-[600ms] ease-[cubic-bezier(.12,.74,.36,1)] ${
                showHalo ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
              }`}
              style={{
                transform: showHalo 
                  ? `rotate(${i * 30}deg) translate(var(--halo-radius)) rotate(-${i * 30}deg)`
                  : `rotate(${i * 30}deg) translate(0) rotate(-${i * 30}deg) scale(0)`,
                transitionDelay: `${i * 50}ms`,
              }}
            >
              <img 
                src={src} 
                alt="" 
                className="w-full h-full object-cover" 
              />
            </div>
          ))}
        </div>
      </div>

      {/* Global styles */}
      <style jsx global>{`
        :root {
          --halo-radius: 240px;
        }
      `}</style>

      {/* Component-scoped styles */}
      <style jsx>{`
        @media (max-width: 420px) {
          h1 {
            font-size: 1.4rem;
          }
        }
      `}</style>
    </div>
  );
}