import React, { useEffect, useRef, useState } from 'react';
import Marquee, { marqueeItems } from './marquee';
import TheProjectParallax from './theProjectParallax';
import TerminalBlock from './terminalBlock';
import ThoughtOfTheDayPedal from './thoughtOfTheDay';

interface TrialProps {
  onNavigate: (section: string) => void;
}

// --- MOCK DATA COMPONENTS ---

const MockGithubCalendar = () => {
  // Generates a random pattern similar to a contribution graph
  const weeks = 52;
  const days = 7;
  
  return (
    <div className="w-full bg-slate-900 rounded-xl p-6 border border-slate-800 shadow-2xl">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-slate-200 font-mono text-sm font-bold flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          contrib_graph.json
        </h3>
        <div className="text-xs text-slate-500 font-mono hidden sm:block">1,243 contributions in 2025</div>
      </div>
      
      {/* Scrollable Container for Mobile/Tablet robustness */}
      <div className="overflow-x-auto pb-2 custom-scrollbar">
        <div className="flex gap-[3px] min-w-max">
          {Array.from({ length: weeks }).map((_, wIndex) => (
            <div key={wIndex} className="flex flex-col gap-[3px]">
              {Array.from({ length: days }).map((_, dIndex) => {
                const rand = Math.random();
                let colorClass = "bg-slate-800/50"; 
                if (rand > 0.85) colorClass = "bg-green-500"; 
                else if (rand > 0.65) colorClass = "bg-green-700"; 
                else if (rand > 0.45) colorClass = "bg-green-900/80"; 
                
                return (
                  <div 
                    key={`${wIndex}-${dIndex}`} 
                    className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm ${colorClass} hover:border hover:border-white/20`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-end items-center gap-2 mt-2 text-[10px] text-slate-500 font-mono">
        <span>Less</span>
        <div className="w-2 h-2 bg-slate-800/50 rounded-sm"></div>
        <div className="w-2 h-2 bg-green-900/80 rounded-sm"></div>
        <div className="w-2 h-2 bg-green-700 rounded-sm"></div>
        <div className="w-2 h-2 bg-green-500 rounded-sm"></div>
        <span>More</span>
      </div>
    </div>
  );
};

const SyllabusBlock = () => {
  const topics = [
    { name: "Adv. Backend (CQRS)", status: "In Progress", progress: 65, color: "bg-amber-500" },
    { name: "Dist. Systems (Raft/Paxos)", status: "Pending", progress: 10, color: "bg-slate-600" },
    { name: "Python Internals (GIL)", status: "Done", progress: 100, color: "bg-green-500" },
    { name: "K8s Operators", status: "Review", progress: 85, color: "bg-blue-500" },
  ];

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-lg h-full flex flex-col justify-between">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800">
        <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
        Syllabus Status
      </h3>
      <div className="space-y-4">
        {topics.map((topic, i) => (
          <div key={i}>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-700">{topic.name}</span>
              <span className={topic.progress === 100 ? "text-green-600" : "text-slate-500"}>{topic.status}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5">
              <div 
                className={`h-1.5 rounded-full ${topic.color} transition-all duration-1000`} 
                style={{ width: `${topic.progress}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const RecentCommitsBlock = () => {
  const commits = [
    { msg: "feat: async crawler integration", time: "2h ago", hash: "8a2f9d" },
    { msg: "fix: docker memory leak", time: "5h ago", hash: "4b3c2e" },
    { msg: "chore: update portfolio assets", time: "1d ago", hash: "9f8e1a" },
    { msg: "refactor: redis caching layer", time: "2d ago", hash: "1d2c3b" },
  ];

  return (
    <div className="bg-slate-900 text-slate-200 p-6 rounded-xl border border-slate-800 shadow-lg h-full font-mono text-sm flex flex-col">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-white">
        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        Recent Commits
      </h3>
      <ul className="space-y-4 flex-1">
        {commits.map((c, i) => (
          <li key={i} className="flex gap-3 items-start group">
            <div className="mt-1.5 min-w-[6px] h-[6px] rounded-full bg-blue-500 group-hover:bg-blue-400"></div>
            <div className="flex-1">
              <div className="text-slate-300 group-hover:text-white transition-colors truncate">
                {c.msg}
              </div>
              <div className="flex justify-between mt-1 text-xs text-slate-500">
                <span>{c.time}</span>
                <span className="font-mono bg-slate-800 px-1 rounded text-slate-400">#{c.hash}</span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default function HomePage({ onNavigate }: TrialProps) {
  const imgWrapRef = useRef<HTMLDivElement>(null); 
  const sec2Ref = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number | null>(null);
  const [showHalo, setShowHalo] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(true);

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
      
      // Calculate center point of Section 2
      const sec2Center = sec2Top + sec2Height / 2;
      
      // Define scroll range
      const startScroll = 0;
      const endScroll = sec2Center - vh / 2;
      const totalDistance = endScroll - startScroll;
      
      let f = (scrollY - startScroll) / totalDistance;
      f = Math.max(0, Math.min(1, f));

      // LOGIC CHANGE: Move image to the LEFT side of the screen
      // Initial state is center. We translate X negative to move left.
      const screenW = window.innerWidth;
      
      // --- ADJUSTMENT HERE ---
      // Increased from 0.25 to 0.35 to shift it further left
      const maxMoveX = -(screenW * 0.30 ); 
      
      const moveX = f * maxMoveX;
      
      const triggerPoint = endScroll;

      if (scrollY < triggerPoint) {
        // FIXED PHASE (Moving)
        imgWrapRef.current.classList.remove('is-absolute');
        imgWrapRef.current.style.position = 'fixed';
        imgWrapRef.current.style.top = '50%';
        imgWrapRef.current.style.left = '50%';
        imgWrapRef.current.style.transform = `translate3d(-50%, -50%, 0) translate3d(${moveX}px, 0, 0)`; 
      } else {
        // ABSOLUTE PHASE (Landed)
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
             <img src="/positive_mountains.png" alt="Hero Background" className="w-full h-full object-cover opacity-50"/>
             <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80"></div>
          </div>

          <div className="w-full max-w-[95%] md:max-w-7xl relative z-20 flex flex-col md:flex-row justify-between items-center min-h-[50vh] gap-10 md:gap-0">
            <div className="brick-wrapper w-full md:w-auto flex justify-center md:justify-start">
               <ThoughtOfTheDayPedal />
            </div>

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
            
            <div className="w-full md:w-auto flex justify-center md:justify-end">
               <TerminalBlock onNavigate={onNavigate} />
            </div>
          </div>
        </div>
        
        {/* --- SECTION 2: TRANSITION LANDING + DASHBOARD --- */}
        <div className="sec2 relative w-full min-h-screen flex items-center justify-between py-20" ref={sec2Ref}>
           
           <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row">
              {/* LEFT COLUMN: Empty Space for Parallax Image Landing */}
              <div className="hidden md:block md:w-[35%]">
                  {/* The Founder/Halo lands here visually via absolute positioning */}
              </div>

              {/* RIGHT COLUMN: Content Dashboard (>50% width) */}
              <div className="w-full md:w-[65%] z-10 flex flex-col gap-8 md:pl-10">
                 
                 {/* Header Text */}
                 <div className="text-left">
                    <h2 className="text-4xl md:text-6xl font-bold mb-4 text-slate-900">Built for Scale</h2>
                    <p className="text-xl text-slate-600">
                      Transitioning from chaotic scripts to orchestrated symphonies. 
                      Every commit counts towards the architecture.
                    </p>
                 </div>

                 {/* Block 1: GitHub Calendar (Full Width of Right Col) */}
                 <div className="w-full">
                    <MockGithubCalendar />
                 </div>

                 {/* Block 2 & 3: Syllabus & Activity (Split Grid) */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="w-full">
                       <SyllabusBlock />
                    </div>
                    <div className="w-full">
                       <RecentCommitsBlock />
                    </div>
                 </div>

              </div>
           </div>
        </div>

        {/* --- DESKTOP ANIMATION CONTAINER (Fixed Center -> Moves Left) --- */}
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