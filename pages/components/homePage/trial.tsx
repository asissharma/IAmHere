import Image from "next/image";
import React, { useEffect, useState, useRef } from "react";

const IMAGE_SRC = "/profile.png"; // main portrait (public/)
const BACKGROUND_SRC = "/positive_mountains.png"; // 1024x1024 background image (public/)

type Props = {
  title?: string;
  publisher?: string;
  totalSlides?: number;
  initialSlide?: number;
  focalPoint?: string; // CSS object-position value if you want to tweak focal point (e.g. 'center top')
};

export default function JokerProfileComponent({
  title = "Joker",
  publisher = "Published by DC",
  totalSlides = 5,
  initialSlide = 1,
  focalPoint = "center",
}: Props) {
  const [currentSlide, setCurrentSlide] = useState(() => Math.min(Math.max(initialSlide, 1), totalSlides));
  const liveRegionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (liveRegionRef.current) {
      liveRegionRef.current.textContent = `Slide ${currentSlide} of ${totalSlides}: ${title}`;
    }
  }, [currentSlide, totalSlides, title]);

  const next = () => setCurrentSlide((s) => (s >= totalSlides ? 1 : s + 1));
  const prev = () => setCurrentSlide((s) => (s <= 1 ? totalSlides : s - 1));

  const bgSrc = encodeURI(BACKGROUND_SRC);

  return (
    <div className="flex items-center justify-center bg-gradient-to-b from-slate-50 to-white">
      <div className="isolate">
        {/* BACKGROUND IMAGE (kept behind content) */}
        <div className="absolute inset-0 -z-10">
          <Image src={bgSrc} alt="Positive mountains background" fill sizes="100vw" priority />

          <div
            className="absolute inset-0"
            aria-hidden="true"
            style={{
              background:
                "linear-gradient(180deg, rgba(8,10,15,0.14) 0%, rgba(8,10,15,0.16) 30%, rgba(8,10,15,0.36) 100%)",
              mixBlendMode: "multiply",
            }}
          />
        </div>

        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-20 focus:bg-white/90 focus:px-3 focus:py-2 focus:rounded">
          Skip to content
        </a>

        <header className="absolute top-6 left-6 right-6 flex items-center justify-between z-20">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center border bg-white/80 backdrop-blur-sm" aria-hidden="true">
              <span className="font-bold text-sm">DC</span>
            </div>
            <nav className="hidden md:flex gap-6 text-sm text-white/90" aria-label="Primary">
              <a href="#" className="font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded">Home</a>
              <a href="#" className="hover:underline focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded">Movie</a>
              <a href="#" className="hover:underline focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded">About</a>
              <a href="#" className="hover:underline focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded">Blog</a>
            </nav>
          </div>

          <div className="text-xs text-white/80 z-20" aria-hidden="false">
            <span className="sr-only">Slide</span>
            <span className="font-mono">{String(currentSlide).padStart(2, "0")}</span>
            <span className="mx-1">/</span>
            <span className="font-mono">{String(totalSlides).padStart(2, "0")}</span>
          </div>
        </header>

        <main id="main-content" className="flex flex-col md:flex-row items-stretch z-20 gap-6" aria-labelledby="profile-title">
          {/* LEFT */}
          <section className="w-full md:w-1/3 p-8 md:pr-6 flex flex-col justify-between bg-gradient-to-tr from-white/60 to-white/40 backdrop-blur-sm border-r border-white/10">
            <div>
              <h1 id="profile-title" className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight" style={{ fontSize: "clamp(2rem, 4.5vw, 3.75rem)" }}>
                {title}
              </h1>

              <p className="mt-2 text-sm text-slate-600">{publisher}</p>

              <div className="mt-6 text-sm text-slate-700 space-y-4">
                <h3 className="font-semibold text-slate-800">Power</h3>
                <p className="text-sm leading-relaxed text-slate-600">
                  Complete unpredictability, chaos agent, customized weapons, and a toxin that causes victims to die
                  laughing.
                </p>

                <ul className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-slate-800" aria-hidden="true" />
                    Intelligence
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-slate-800" aria-hidden="true" />
                    Chaos
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-slate-800" aria-hidden="true" />
                    Unpredictability
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-slate-800" aria-hidden="true" />
                    Showmanship
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3 text-xs text-slate-600">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M12 5v14"></path>
                <path d="M5 12h14"></path>
              </svg>
              <span>Scroll — mouse, touch, or keyboard</span>
            </div>
          </section>

          {/* MIDDLE: portrait — changed so the portrait is shown in full (object-fit: contain) */}
          <section className="w-full md:w-1/3 relative flex items-center justify-center">
            {/* Container provides a pleasant letterbox and preserves rounded corners */}
            <figure className="w-[360px] sm:w-[420px] max-w-full ring-1 ring-white/10 bg-white/5 flex items-center justify-center">
              {/* Use intrinsic width/height and objectFit: 'contain' so the full image is visible without cropping */}
              <Image
                src={IMAGE_SRC}
                alt={`${title} portrait`}
                width={230}
                height={560}
                sizes="(max-width: 640px) 60vw, 360px"
                style={{ objectFit: "contain", objectPosition: focalPoint }}
                priority
              />
              <figcaption className="sr-only">Portrait of {title}</figcaption>
            </figure>
          </section>

          {/* RIGHT */}
          <section className="w-full md:w-1/3 relative flex items-center justify-center p-6">
            <div className="relative w-full h-full flex items-center justify-center">
              <div className="absolute top-24 left-8 bg-white/90 px-3 py-2 rounded-lg shadow-md flex items-center gap-3 transition-transform hover:-translate-y-1" role="note" aria-label="Intelligence">
                <div className="w-2 h-2 bg-slate-800 rounded-full" aria-hidden="true" />
                <div className="text-xs font-medium text-slate-800">Intelligence</div>
              </div>

              <div className="absolute bottom-24 right-8 bg-white/90 px-3 py-2 rounded-lg shadow-md flex items-center gap-3 max-w-[220px] transition-transform hover:-translate-y-1" role="note" aria-label="Key trait">
                <div className="w-2 h-2 bg-slate-800 rounded-full" aria-hidden="true" />
                <div className="text-xs font-medium text-slate-800">Complete Unpredictability</div>
              </div>

              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col items-center gap-4" role="group" aria-label="Slides navigation">
                <button
                  type="button"
                  onClick={prev}
                  className="-mb-2 p-1 rounded-full bg-white/10 hover:bg-white/20 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400"
                  aria-label="Previous slide"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>

                <div className="flex flex-col items-center gap-3">
                  {Array.from({ length: totalSlides }).map((_, i) => {
                    const isActive = i + 1 === currentSlide;
                    return (
                      <button
                        key={i}
                        onClick={() => setCurrentSlide(i + 1)}
                        type="button"
                        aria-label={`Go to slide ${i + 1}`}
                        aria-current={isActive ? "true" : undefined}
                        className={`w-3 h-3 rounded-full border focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400 transition-transform ${
                          isActive ? "bg-white border-slate-900 scale-110" : "bg-transparent border-white/60"
                        }`}
                      />
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={next}
                  className="-mt-2 p-1 rounded-full bg-white/10 hover:bg-white/20 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400"
                  aria-label="Next slide"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M9 6l6 6-6 6" />
                  </svg>
                </button>
              </div>

              <div className="absolute right-4 bottom-4 w-10 h-10 flex items-center justify-center" aria-hidden="true">
                <svg viewBox="0 0 64 64" className="w-10 h-10">
                  <path d="M8 22c0 12 48 12 48 0" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round" />
                  <circle cx="20" cy="22" r="3" fill="#000" />
                  <circle cx="44" cy="22" r="3" fill="#000" />
                </svg>
              </div>
            </div>
          </section>
        </main>

        <div ref={liveRegionRef} className="sr-only" aria-live="polite" aria-atomic="true" />

        <style jsx>{`
          :root {
            --card-gap: 1.5rem;
          }

          @media (prefers-reduced-motion: no-preference) {
            .isolate * {
              transition: transform 220ms cubic-bezier(.2,.9,.2,1), box-shadow 200ms;
            }
          }
        `}</style>
      </div>
    </div>
  );
}
