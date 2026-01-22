import React, { useEffect, useRef, useState } from 'react';
import Marquee, { marqueeItems } from './marquee';
import TheProjectParallax from './theProjectParallax';
import TerminalBlock from './terminalBlock';
import ThoughtOfTheDayPedal from './thoughtOfTheDay';

interface TrialProps {
  onNavigate: (section: string) => void;
}

export default function HomePage({ onNavigate }: TrialProps) {
  const imgWrapRef = useRef<HTMLDivElement>(null); 
  const sec2Ref = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number | null>(null);
  const [showHalo, setShowHalo] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(true);

  // Define tech stack icons
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

  // 2. Desktop Parallax (Disabled on Mobile)
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

      // Move left by 400px on desktop
      const maxMoveX = -400; 
      const moveX = f * maxMoveX;
      
      const triggerPoint = endScroll;

      if (scrollY < triggerPoint) {
        // FIXED PHASE
        imgWrapRef.current.classList.remove('is-absolute');
        imgWrapRef.current.style.position = 'fixed';
        imgWrapRef.current.style.top = '50%';
        imgWrapRef.current.style.left = '50%';
        imgWrapRef.current.style.transform = `translate3d(-50%, -50%, 0) translate3d(${moveX}px, 0, 0)`; 
      } else {
        // ABSOLUTE PHASE
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
          .haloItem:nth-child(${i + 1}) {
            --angle: ${i * 30}deg;
          }
          .halo-active .haloItem:nth-child(${i + 1}) { 
            transition-delay: ${i * 0.05}s; 
          }
        `).join('')}
      `}</style>

      <div className="flex flex-col items-center justify-center overflow-x-hidden bg-slate-50 text-slate-900 w-full">
        
        {/* --- SECTION 1: HERO --- */}
        <div className="hero">
          {/* Background */}
          <div className="absolute inset-0 z-0">
             <img 
               src="/positive_mountains.png" 
               alt="Hero Background" 
               className="w-full h-full object-cover opacity-50"
             />
             <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80"></div>
          </div>

          {/* LAYOUT CONTAINER: 
            This Flex container controls the "Extreme Left vs Right" placement.
            Mobile: Flex Column (Stack)
            Desktop: Flex Row (Space Between)
          */}
          <div className="w-full max-w-[95%] md:max-w-7xl relative z-20 flex flex-col md:flex-row justify-between items-center md:items-center min-h-[50vh] gap-10 md:gap-0">
            
            {/* LEFT: Thought Brick */}
            <div className="brick-wrapper w-full md:w-auto flex justify-center md:justify-start">
               <ThoughtOfTheDayPedal />
            </div>

            {/* CENTER (MOBILE ONLY): Static Profile */}
            <div className="md:hidden mobile-profile-section">
                <div className="relative">
                    <img className="mobile-founder-img" src="/profile.png" alt="Founder" />
                    <div className="halo-container mobile-halo">
                    {haloImages.map((src, index) => (
                        <div key={index} className="haloItem" style={{transform: `rotate(${index * 30}deg) translate(130px) rotate(-${index * 30}deg)`}}>
                            <img src={src} alt={`Tech ${index}`} />
                        </div>
                    ))}
                    </div>
                </div>
            </div>
            
            {/* RIGHT: Terminal */}
            <div className="w-full md:w-auto flex justify-center md:justify-end">
               <TerminalBlock onNavigate={onNavigate} />
            </div>

          </div>
        </div>
        
        {/* --- SECTION 2: TRANSITION LANDING --- */}
        <div className="sec2 relative" ref={sec2Ref}>
           <div className="max-w-4xl px-6 text-center z-10">
              <h2 className="text-4xl md:text-6xl font-bold mb-6">Built for Scale</h2>
              <p className="text-xl text-slate-600">
                Transitioning from chaotic scripts to orchestrated symphonies.
              </p>
           </div>
        </div>

        {/* --- DESKTOP ANIMATION CONTAINER (Fixed Center) --- */}
        {/* This sits OUTSIDE the flex layout above so it stays perfectly centered */}
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

        <div className="w-full bg-white py-8 border-t border-slate-100">
          <Marquee items={marqueeItems} duration={50} gap="2rem"/>
        </div>

      </div>

      <div className="w-full sec3">
          <TheProjectParallax/>
      </div>

      <footer className="w-full bg-black text-white py-12 px-4 z-10 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">Backend Architect</h3>
              <p className="text-slate-400">Building scalable systems that power the digital world.</p>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Projects</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Skills</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4">Tech Stack</h4>
              <p className="text-slate-400">Python • Go • PostgreSQL<br/>Docker • Kubernetes</p>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-slate-500">
            <p>© 2025 Backend Architect. Engineered with precision.</p>
          </div>
        </div>
      </footer>
    </>
  );
}