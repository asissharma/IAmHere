import React, { useEffect, useRef, useState } from 'react';
import Marquee, { marqueeItems } from './marquee';
import TheProjectParallax from './theProjectParallax';
import TerminalBlock from './terminalBlock';
import ThoughtOfTheDayPedal from './thoughtOfTheDay';

interface TrialProps {
  onNavigate: (section: string) => void;
}

export default function homePage({ onNavigate }: TrialProps) {
  // TS: Explicitly type refs for DOM elements
  const imgWrapRef = useRef<HTMLDivElement>(null); 
  const sec2Ref = useRef<HTMLDivElement>(null);
  
  // TS: Store request ID for animation frame (number)
  const requestRef = useRef<number | null>(null);
  
  const [showHalo, setShowHalo] = useState<boolean>(false);

  useEffect(() => {
    const update = () => {
      if (!imgWrapRef.current || !sec2Ref.current) return;

      const scrollY = window.scrollY;
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      
      const sec2Top = sec2Ref.current.offsetTop;
      const sec2Height = sec2Ref.current.offsetHeight;
      const sec2Center = sec2Top + sec2Height / 2;
      
      const startScroll = 0;
      const endScroll = sec2Center - vh / 2;
      const totalDistance = endScroll - startScroll;
      
      let f = (scrollY - startScroll) / totalDistance;
      
      // Clamp f
      if (f < 0) f = 0;
      if (f > 1) f = 1;

      // Responsive movement calculation
      const maxMoveX = vw < 768 ? -vw * 0.1 : -400; 
      const moveX = f * maxMoveX;
      
      const triggerPoint = endScroll;

      if (scrollY < triggerPoint) {
        // Fixed phase
        imgWrapRef.current.style.position = 'fixed';
        imgWrapRef.current.style.top = '50%';
        imgWrapRef.current.style.left = '50%';
        imgWrapRef.current.style.transform = 
          `translate(-50%, -50%) translate3d(${moveX}px, 0, 0) scale(1)`; 
      } else {
        // Absolute phase (locked)
        imgWrapRef.current.style.position = 'absolute';
        imgWrapRef.current.style.top = `${sec2Center}px`;
        imgWrapRef.current.style.left = '50%';
        imgWrapRef.current.style.transform = 
          `translate(-50%, -50%) translate3d(${maxMoveX}px, 0, 0) scale(1)`;
      }

      // Toggle Halo state
      const shouldShowHalo = f >= 0.95;
      setShowHalo(prev => prev === shouldShowHalo ? prev : shouldShowHalo);
    };

    const onScroll = () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      requestRef.current = requestAnimationFrame(update);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    
    // Initial update
    update();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

// TS: Tech Stack Icons (Backend/Architecture Focus)
  const haloImages: string[] = [
    // 1. The Core
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg',
    // 2. The Data
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg',
    // 3. The Container
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg',
    // 4. The Cache
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redis/redis-original.svg',
    // 5. The Frontend
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg',
    // 6. The Streaming (Kafka - fits your System Design interest)
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/apachekafka/apachekafka-original.svg',
    // 7. The Safety
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg',
    // 8. The Environment
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linux/linux-original.svg',
    // 9. Version Control
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg',
    // 10. Performance (Go is great for backend concurrency)
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/go/go-original-wordmark.svg',
    // 11. Orchestration
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kubernetes/kubernetes-plain.svg',
    // 12. The Gateway
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nginx/nginx-original.svg',
  ];

  return (
    <>
      <style jsx global>{`
        ${haloImages.map((_, i) => `
          .haloItem:nth-child(${i + 1}) {
            --angle: ${i * 30}deg;
            --dist: 210px;
            --scale: 1.0;
          }
        `).join('')}
          
        ${haloImages.map((_, i) => `
          .halo-on .haloItem:nth-child(${i + 1}) { transition-delay: ${i * 0.05}s; }
        `).join('')}
        
        @media (max-width: 768px) {
           ${haloImages.map((_, i) => `
             .haloItem:nth-child(${i + 1}) {
               --dist: 130px; 
             }
           `).join('')}
        }
      `}</style>

      <div className="flex flex-col items-center justify-center overflow-hidden bg-slate-50 text-slate-900">
        <div className="hero">
          <div style={{position: 'absolute', inset: 0, zIndex: 0}}>
             {/* Background */}
             <img 
               src="/positive_mountains.png" 
               alt="Hero" 
               style={{width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5}} 
             />
          </div>

          <ThoughtOfTheDayPedal />
          <TerminalBlock onNavigate={onNavigate} />
        </div>
        
        <div className="sec2" ref={sec2Ref}>
        </div>
        <div className="w-full m-2">
          <Marquee items={marqueeItems} duration={50} gap="1rem"/>
        </div>

        <div className="imgWrap" ref={imgWrapRef}>
          <img className="founder" src="/profile.png" alt="Founder" />
          <div className={`halo ${showHalo ? 'halo-on' : ''}`}>
            {haloImages.map((src, index) => (
              <div key={index} className="haloItem">
                <img src={src} alt={`Member ${index}`} />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="w-full sec3">
          <TheProjectParallax/>
        </div>
      <footer className="w-full bg-black text-white py-12 px-4">
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
              <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-bold mb-4">Tech Stack</h4>
            <p className="text-slate-400">Python • Go • PostgreSQL<br/>Docker • Kubernetes • Redis<br/>Kafka • React • TypeScript</p>
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