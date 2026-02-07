import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, Variants } from "framer-motion";
import Marquee, { marqueeItems } from './marquee';
import TheProjectParallax from './theProjectParallax';
import YourStory from './yourStory';
import TerminalBlock from './terminalBlock';
import ThoughtOfTheDayPedal from './thoughtOfTheDay';
import MockGithubCalendar from './mockGithubCalendar';
import SyllabusBlock from './syllabusBlock';
import RecentCommitsBlock from './recentCommits';
import ArchitectureSchematic from './architectureSchematic';
import SystemHealthBlock from './systemHealthBlock';

interface TrialProps {
  onNavigate: (section: string) => void;
  onUnlock?: () => void;
}

export default function HomePage({ onNavigate, onUnlock }: TrialProps) {
  const imgWrapRef = useRef<HTMLDivElement>(null);
  const sec2Ref = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number | null>(null);
  const [showHalo, setShowHalo] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(true);

  // --- CONFIG: LINKS ---
  const SOCIALS = {
    github: "https://github.com/asissharma",
    linkedin: "https://linkedin.com/in/your-profile",
    twitter: "https://twitter.com/your-handle",
    resume: "/Asis_Sharma.pdf"
  };

  const haloImages: string[] = [
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg',
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg',
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg',
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redis/redis-original.svg',
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg',
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/apachekafka/apachekafka-original.svg',
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg',
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linux/linux-original.svg',
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg',
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/go/go-original-wordmark.svg',
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kubernetes/kubernetes-plain.svg',
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nginx/nginx-original.svg',
  ];

  // 1. Mobile Check
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 2. Desktop Parallax Logic
  useEffect(() => {
    if (isMobile) return;

    const update = () => {
      if (!imgWrapRef.current || !sec2Ref.current) return;

      const scrollY = window.scrollY;
      const vh = window.innerHeight;

      const sec2Top = sec2Ref.current.offsetTop;
      const sec2Height = sec2Ref.current.offsetHeight;
      const sec2Center = sec2Top + sec2Height / 2;

      const startScroll = 0;
      const endScroll = sec2Center - vh / 2;
      const totalDistance = endScroll - startScroll;

      let f = (scrollY - startScroll) / totalDistance;
      f = Math.max(0, Math.min(1, f));

      const screenW = window.innerWidth;
      const maxMoveX = -(screenW * 0.30);

      const moveX = f * maxMoveX;

      if (scrollY < endScroll) {
        imgWrapRef.current.classList.remove('is-absolute');
        imgWrapRef.current.style.position = 'fixed';
        imgWrapRef.current.style.top = '50%';
        imgWrapRef.current.style.left = '50%';
        imgWrapRef.current.style.transform = `translate3d(-50%, -50%, 0) translate3d(${moveX}px, 0, 0)`;
      } else {
        imgWrapRef.current.classList.add('is-absolute');
        imgWrapRef.current.style.position = 'absolute';
        imgWrapRef.current.style.top = `${sec2Center}px`;
        imgWrapRef.current.style.left = '50%';
        imgWrapRef.current.style.transform = `translate3d(-50%, -50%, 0) translate3d(${maxMoveX}px, 0, 0)`;
      }

      const shouldShowHalo = f >= 0.90;
      setShowHalo(prev => prev === shouldShowHalo ? prev : shouldShowHalo);
    };

    const onScroll = () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      requestRef.current = requestAnimationFrame(update);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isMobile]);

  return (
    <>
      <style jsx global>{`
        ${haloImages.map((_, i) => `
          .haloItem:nth-child(${i + 1}) { --angle: ${i * 30}deg; }
          .halo-active .haloItem:nth-child(${i + 1}) { transition-delay: ${i * 0.05}s; }
        `).join('')}
        .custom-scrollbar::-webkit-scrollbar { height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #1e293b; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #475569; border-radius: 4px; }
      `}</style>

      <div className="flex flex-col items-center justify-center overflow-x-hidden bg-slate-50 text-slate-900 w-full">

        {/* --- SECTION 1: HERO --- */}
        <div className="hero">

          <div className="absolute inset-0 z-0">
            <img src="/positive_mountains.png" alt="Hero Background" className="w-full h-full object-cover opacity-50" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80"></div>
          </div>

          <div className="absolute top-0 left-0 w-full z-50 p-6 flex justify-between items-start pointer-events-none">
            <div className="pointer-events-auto bg-black/20 backdrop-blur-md border border-white/5 rounded-full px-4 py-1.5 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[10px] font-mono text-emerald-100 uppercase tracking-widest">
                System: Online
              </span>
            </div>

            <div className="pointer-events-auto flex items-center gap-3 bg-black/20 backdrop-blur-md border border-white/5 rounded-full px-4 py-2 hover:bg-black/40 transition-colors">
              <a href={SOCIALS.github} target="_blank" className="text-slate-400 hover:text-white transition-colors"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg></a>
              <a href={SOCIALS.linkedin} target="_blank" className="text-slate-400 hover:text-blue-400 transition-colors"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg></a>
              <div className="w-px h-4 bg-white/20 mx-1"></div>
              <a href={SOCIALS.resume} download className="flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-emerald-400 transition-colors uppercase tracking-wide">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                <span>Resume</span>
              </a>
            </div>
          </div>

          <div className="w-full max-w-[95%] md:max-w-7xl relative z-20 flex flex-col md:flex-row justify-between items-center min-h-[50vh] gap-10 md:gap-0 mt-16 md:mt-0">
            <div className="brick-wrapper w-full md:w-auto flex justify-center md:justify-start">
              <ThoughtOfTheDayPedal />
            </div>
            <div className="md:hidden mobile-profile-section flex flex-col items-center gap-6">
              <div className="relative">
                <img className="mobile-founder-img" src="/profile.png" alt="Founder" />
                <div className="halo-container mobile-halo">
                  {haloImages.map((src, index) => (
                    <div key={index} className="haloItem" style={{ transform: `rotate(${index * 30}deg) translate(130px) rotate(-${index * 30}deg)` }}>
                      <img src={src} alt={`Tech ${index}`} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="w-full md:w-auto flex justify-center md:justify-end">
              <TerminalBlock onNavigate={onNavigate} />
            </div>
          </div>
        </div>

        {/* --- SECTION 2: BUILT FOR SCALE --- */}
        <div className="sec2 relative w-full min-h-screen flex items-center justify-center py-2" ref={sec2Ref}>

          <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row gap-10 px-4">

            {/* Left Spacer for Parallax Image */}
            <div className="hidden md:block md:w-[35%] shrink-0"></div>

            {/* Right Content Area */}
            <div className="w-full md:w-[65%] z-10 flex flex-col gap-2">

              <div className="text-center">
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Built for Scale</h2>
                <p className="text-md text-slate-600 leading-relaxed">
                  Transitioning from chaotic scripts to orchestrated symphonies.
                  Every commit counts towards the architecture.
                </p>
              </div>

              {/* --- COMMAND CENTER ROW (Calendar + System Health) --- */}
              {/* Parent: items-stretch ensures both children are the exact same height */}
              <div className="flex flex-col lg:flex-row gap-3 w-full mb-1 items-stretch">

                {/* 2. System Health (Takes 30% width) */}
                {/* Removed min-h-[280px], it will now inherit height from the calendar */}
                <div className="lg:w-[30%] w-full">
                  <SystemHealthBlock />
                </div>

                {/* 1. Github Calendar (Takes 70% width) */}
                <div className="lg:w-[70%] w-full">
                  <MockGithubCalendar />
                </div>

              </div>

              {/* --- BENTO GRID (Architecture + Details) --- */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 w-full lg:h-[450px]">

                {/* Left: Vertical Stack (Takes 2 columns = 66% width) */}
                <div className="lg:col-span-2 flex flex-col gap-1 h-full">
                  <div className="flex-1 max-h-[250px]">
                    <SyllabusBlock />
                  </div>
                  <div className="flex-1 min-h-[200px]">
                    <RecentCommitsBlock />
                  </div>
                </div>

                {/* Right: Architecture (Takes 1 column = 33% width) */}
                <div className="lg:col-span-1 w-full h-[300px] lg:h-full">
                  <ArchitectureSchematic />
                </div>

              </div>

            </div>
          </div>
        </div>

        <div className="imgWrap-desktop" ref={imgWrapRef}>
          <img className="founder-img" src="/profile.png" alt="Founder" />
          <div className={`halo-container ${showHalo ? 'halo-active' : ''}`}>
            {haloImages.map((src, index) => (
              <div key={index} className="haloItem">
                <img src={src} alt={`Tech ${index}`} />
              </div>
            ))}
          </div>
        </div>

        <div className="w-full bg-orange-400 py-2 border-t border-slate-100">
          <Marquee items={marqueeItems} duration={50} gap="2rem" />
        </div>

      </div >

      <div className="w-full sec3">
        <YourStory />
        {/* <TheProjectParallax/> */}
      </div>

      <footer className="w-full bg-[#050505] text-white py-6 px-3 z-10 relative border-t border-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-10">
            <div className="text-center md:text-left max-w-sm">
              <h3 className="text-2xl font-bold mb-2 tracking-tight text-white">Backend Architect</h3>
              <p className="text-slate-500 leading-relaxed">
                Building scalable systems, robust APIs, and idempotent architectures.
              </p>
            </div>
            <div className="flex flex-col items-center md:items-end gap-4">
              <div className="flex items-center gap-4">
                <a href={SOCIALS.github} className="text-slate-400 hover:text-white"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg></a>
                <a href={SOCIALS.linkedin} className="text-slate-400 hover:text-blue-400"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg></a>
              </div>
              <a href={SOCIALS.resume} download className="px-6 py-3 bg-white text-black font-bold rounded-lg hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-900/20 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                Download Resume
              </a>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-900 text-center text-slate-600 text-sm">
            <p>© 2025 Backend Architect. Engineered with precision.</p>
          </div>
        </div>
      </footer>
    </>
  );
}