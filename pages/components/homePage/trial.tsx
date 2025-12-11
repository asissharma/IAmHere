import React, { useEffect, useRef, useState } from 'react';
import Marquee, { marqueeItems } from './marquee';

export default function ScrollAnimation() {
  // TS: Explicitly type refs for DOM elements
  const imgWrapRef = useRef<HTMLDivElement>(null);
  const sec2Ref = useRef<HTMLDivElement>(null);
  
  // TS: Store request ID for animation frame (number)
  const requestRef = useRef<number | null>(null);
  
  const [showHalo, setShowHalo] = useState<boolean>(false);

  // --- CYBER TYPEWRITER LOGIC ---
  const [typedLines, setTypedLines] = useState<string[]>([]);

  useEffect(() => {
const textLines: string[] = [
      "> INITIALIZING: BACKEND_ARCHITECT_PROTOCOL...",
      "> ROLE: ARCHITECTING_SCALABILITY",
      "> MISSION: TRANSFORM_COMPLEXITY -> SIMPLICITY",
      "> BUILDING: LOW_LATENCY_SYSTEMS // ROBUST_APIS",
      "> STANDARD: CLEAN_CODE // HIGH_PERFORMANCE",
      "> STATUS: READY_TO_DELIVER_IMPACT_ CONNECTING...",
      "> DEPLOYING: SCALABLE_SOLUTIONS_AT_VOLUME",
      "> SYSTEM_CHECK: 100% // OPTIMIZED_FOR_SCALE",
      "> FOCUS: PERFORMANCE // LATENCY // SIMPLICITY",
      "> QUALITY: ROBUST // CLEAN // MAINTAINABLE",
      "> RESULT: HIGH_IMPACT_DELIVERY"
    ];

    let lineIndex = 0;
    let charIndex = 0;
    
    // Initialize array with empty strings matching line count
    const currentTextArray: string[] = new Array(textLines.length).fill(""); 
    
    let isMounted = true;
    let typeTimeout: ReturnType<typeof setTimeout>;

    const typeChar = () => {
      if (!isMounted) return;

      if (lineIndex < textLines.length) {
        const currentLine = textLines[lineIndex];
        
        if (charIndex < currentLine.length) {
          // Append next character
          currentTextArray[lineIndex] = currentLine.substring(0, charIndex + 1);
          setTypedLines([...currentTextArray]);
          charIndex++;
          // Randomize typing speed for "human hacker" feel
          typeTimeout = setTimeout(typeChar, Math.random() * 30 + 30); 
        } else {
          // Line complete, pause before next line
          lineIndex++;
          charIndex = 0;
          typeTimeout = setTimeout(typeChar, 200); 
        }
      }
    };

    // Initial delay before typing starts
    const startTimeout = setTimeout(typeChar, 500);

    return () => {
      isMounted = false;
      clearTimeout(startTimeout);
      clearTimeout(typeTimeout);
    };
  }, []);
  // --- END TYPEWRITER ---

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

  const haloImages: string[] = [
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

  return (
    <>
      <style jsx global>{`
        body { margin: 0; font-family: sans-serif; background: #fff; overflow-x: hidden; }
        
        .hero, .sec2, .sec3 {
          min-height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        
        .hero { background: black; color: white; }
        .sec2 { background: white; color: black; }
        .sec3 { background: #f2f2f2; }

        .imgWrap {
          position: fixed;
          left: 50vw;
          top: 50vh;
          transform: translate(-50%, -50%) scale(0.5);
          transition: transform 0.1s linear;
          pointer-events: none;
          z-index: 50;
          will-change: transform;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .founder {
          width: 80%;
          height: 80%;
          object-fit: cover;
          position: relative;
        }

        /* --- CYBER OVERLAY CSS --- */
        .cyber-overlay {
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%); 
          width: 600px;
          max-width: 90vw;
          height: auto;
          z-index: 60; 
          pointer-events: none;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding-top: 320px; /* Pushed down to clear the face area */
        }

        .terminal-text {
          font-family: 'Courier New', Courier, monospace;
          font-size: 14px;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.9);
          text-shadow: 0 0 5px rgba(0, 255, 0, 0.2); /* Slight green glow hints */
          font-weight: 600;
          letter-spacing: 0.5px;
          text-align: left;
        }

        @media (min-width: 768px) {
           .terminal-text { font-size: 16px; }
        }

        /* Cursor Blink */
        .cursor {
          display: inline-block;
          width: 8px;
          height: 16px;
          background-color: white;
          animation: blink 1s step-end infinite;
          vertical-align: sub;
          margin-left: 5px;
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }

        .halo {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 5;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .haloItem {
          position: absolute;
          width: 60px;
          height: 60px;
          border-radius: 12px;
          overflow: hidden;
          opacity: 0;
          transform: rotate(var(--angle)) translate(0px) rotate(calc(var(--angle) * -1)) scale(0);
          transition: 
            opacity 0.6s cubic-bezier(.12,.74,.36,1), 
            transform 0.6s cubic-bezier(.12,.74,.36,1);
        }

        .haloItem img { width: 100%; height: 100%; object-fit: cover; }

        /* Dynamic CSS generation for halo items */
        ${haloImages.map((_, i) => `
          .haloItem:nth-child(${i + 1}) {
            --angle: ${i * 30}deg;
            --dist: 210px;
            --scale: 1.0;
          }
        `).join('')}
          
        .halo-on .haloItem {
          opacity: 1;
          transform: rotate(var(--angle)) translate(var(--dist)) rotate(calc(var(--angle) * -1)) scale(var(--scale));
        }
        
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

          {/* TECH TERMINAL OVERLAY */}
          <div className="cyber-overlay">
            {typedLines.map((line, index) => (
              <div key={index} className="terminal-text">
                {line}
                {index === typedLines.length - 1 && index < 4 && <span className="cursor"></span>}
              </div>
            ))}
          </div>

        </div>
        
        <div className="sec2" ref={sec2Ref}>
        </div>
        <div className="w-full m-2">
          <Marquee items={marqueeItems} duration={50} gap="1rem"/>
        </div>
        <div className="sec3"><h1>SECTION 3</h1></div>
        <div className="sec4"><h1>SECTION 4</h1></div>

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
    </>
  );
}