import Image from "next/image";
import React, { useEffect, useRef } from "react";

const IMAGE_SRC = "/profile.png"; // public/
const BACKGROUND_SRC = "/positive_mountains.png"; // public/

type Props = {
  title?: string;
  role?: string;
  publisher?: string;
  focalPoint?: string;
  demoHref?: string;
  repoHref?: string;
};

export default function JokerProfileComponent({
  title = "Kaala Sharma",
  role = "Software Engineer",
  publisher = "Published by Us",
  focalPoint = "center",
  demoHref = "#",
  repoHref = "#",
}: Props) {
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


  return (
    <div
      ref={containerRef}
      className="flex items-center justify-center bg-gradient-to-b from-slate-50 to-white text-slate-900"
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
                {title}
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                {role} · <span className="opacity-70">{publisher}</span>
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
              aria-label={`${title} portrait`}
            >
              <div
                className="relative w-[220px] h-[420px] sm:w-[260px] sm:h-[500px] overflow-hidden transform transition-transform duration-320 ease-out"
                style={{ willChange: "transform" }}
              >
                <Image
                  src={IMAGE_SRC}
                  alt={`${title} portrait`}
                  fill
                  sizes="(max-width: 640px) 60vw, 320px"
                  style={{ objectFit: "contain", objectPosition: focalPoint }}
                  priority
                />

                {/* subtle floating halo */}
                <div className="absolute -inset-2 rounded-full blur-3xl opacity-30 animate-halo" aria-hidden="true" />
              </div>
            </figure>
          </section>

          {/* RIGHT — Featured / Social / Mascot */}
          <section className="p-6 md:pr-10 md:pl-6flex flex-col justify-between">
            
          </section>
        </main>

        {/* Inline styles for design tokens + reduced motion handling */}
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
