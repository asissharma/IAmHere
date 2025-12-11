import React, { useState, useEffect, useRef, useCallback } from 'react';

// --- THE DATA (As provided) ---
const textLines = [
  { text: "█ SYSTEM BOOT SEQUENCE INITIATED", delay: 100, color: "text-cyan-400" },
  { text: "> Initializing Backend_Architect_Protocol v3.7.2", delay: 80, color: "text-gray-400" },
  { text: "> Loading neural pathways: [████████████] 100%", delay: 60, color: "text-green-400" },
  { text: "", delay: 300, color: "" },
  { text: "▓ CORE DIRECTIVE", delay: 100, color: "text-yellow-400" },
  { text: "> Transform_Complexity → Elegant_Simplicity", delay: 70, color: "text-gray-300" },
  { text: "> Optimize_Latency → Sub-millisecond_Response", delay: 70, color: "text-gray-300" },
  { text: "> Scale_Infrastructure → Millions_of_Requests", delay: 70, color: "text-gray-300" },
  { text: "", delay: 300, color: "" },
  { text: "▓ ENGINEERING STACK", delay: 100, color: "text-yellow-400" },
  { text: "  ├─ Distributed Systems: Microservices | Event-Driven | CQRS", delay: 60, color: "text-blue-300" },
  { text: "  ├─ Performance Tier: Redis | GraphQL | gRPC | WebSockets", delay: 60, color: "text-blue-300" },
  { text: "  ├─ Data Layer: PostgreSQL | MongoDB | ElasticSearch | Kafka", delay: 60, color: "text-blue-300" },
  { text: "  └─ Infrastructure: Docker | K8s | Terraform | AWS/GCP", delay: 60, color: "text-blue-300" },
  { text: "", delay: 300, color: "" },
  { text: "▓ PRINCIPLES", delay: 100, color: "text-yellow-400" },
  { text: "  [✓] Clean Architecture // Domain-Driven Design", delay: 60, color: "text-green-400" },
  { text: "  [✓] Test-Driven Development // 95%+ Coverage", delay: 60, color: "text-green-400" },
  { text: "  [✓] Zero-Downtime Deployments // Blue-Green Strategy", delay: 60, color: "text-green-400" },
  { text: "  [✓] Observability First // Metrics | Logs | Traces", delay: 60, color: "text-green-400" },
  { text: "", delay: 300, color: "" },
  { text: "▓ PERFORMANCE METRICS", delay: 100, color: "text-yellow-400" },
  { text: "  • API Latency: p99 < 50ms", delay: 50, color: "text-purple-300" },
  { text: "  • Throughput: 100K+ req/sec", delay: 50, color: "text-purple-300" },
  { text: "  • Uptime: 99.99% SLA", delay: 50, color: "text-purple-300" },
  { text: "  • Error Rate: < 0.01%", delay: 50, color: "text-purple-300" },
  { text: "", delay: 400, color: "" },
  { text: "█ SYSTEM STATUS CHECK", delay: 120, color: "text-cyan-400" },
  { text: "> Code Quality .......... [OPTIMIZED]", delay: 70, color: "text-green-400" },
  { text: "> Architecture .......... [SCALABLE]", delay: 70, color: "text-green-400" },
  { text: "> Security .............. [HARDENED]", delay: 70, color: "text-green-400" },
  { text: "> Documentation ......... [COMPREHENSIVE]", delay: 70, color: "text-green-400" },
  { text: "", delay: 500, color: "" },
  { text: "▓▓▓ READY TO ARCHITECT SCALABLE SYSTEMS ▓▓▓", delay: 150, color: "text-cyan-400 font-bold" },
  { text: "", delay: 200, color: "" },
  { text: "> Role: Senior Backend Architect", delay: 60, color: "text-gray-400" },
  { text: "> Focus: Performance | Reliability | Scale", delay: 60, color: "text-gray-400" },
  { text: "> Mission: Delivering High-Impact Solutions", delay: 60, color: "text-gray-400" },
  { text: "", delay: 500, color: "" },
  { text: "█ AWAITING COMMAND..._", delay: 100, color: "text-cyan-400 animate-pulse" }
];

const TerminalBoot = () => {
  const [displayedLines, setDisplayedLines] = useState<typeof textLines>([]);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const [scrollThumbHeight, setScrollThumbHeight] = useState(20);
  const [scrollThumbTop, setScrollThumbTop] = useState(0);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startY = useRef(0);
  const startTop = useRef(0);

  // 1. Logic to feed lines one by one
  useEffect(() => {
    let currentIndex = 0;
    let timeoutId: NodeJS.Timeout;

    const processNextLine = () => {
      if (currentIndex >= textLines.length) return;

      const line = textLines[currentIndex];
      setDisplayedLines(prev => [...prev, line]);
      currentIndex++;

      if (currentIndex < textLines.length) {
        timeoutId = setTimeout(processNextLine, line.delay);
      }
    };

    // Start the sequence
    processNextLine();

    return () => clearTimeout(timeoutId);
  }, []);

  // 2. Logic to handle Auto-Scrolling
  useEffect(() => {
    if (isAutoScrolling && containerRef.current) {
      const { scrollHeight, clientHeight } = containerRef.current;
      // Scroll to bottom
      containerRef.current.scrollTop = scrollHeight - clientHeight;
    }
  }, [displayedLines, isAutoScrolling]);

  // 3. Logic to Update Custom Scrollbar Thumb Position & Size
  const updateScrollThumb = useCallback(() => {
    if (!containerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    
    // Calculate thumb height ratio
    const heightRatio = clientHeight / scrollHeight;
    const thumbHeight = Math.max(heightRatio * clientHeight, 30); // Min height 30px
    setScrollThumbHeight(thumbHeight);

    // Calculate thumb position ratio
    const maxScrollTop = scrollHeight - clientHeight;
    const scrollRatio = scrollTop / maxScrollTop;
    const maxThumbTop = clientHeight - thumbHeight;
    
    setScrollThumbTop(scrollRatio * maxThumbTop || 0);

    // If user scrolls up significantly, stop auto-scrolling. 
    // If they hit the bottom, resume auto-scrolling.
    const isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 5;
    
    if (isAtBottom) {
      setIsAutoScrolling(true);
    } else if (isAutoScrolling) {
      // Only disable if we were auto-scrolling and the USER moved away
      // We check if this function fired due to user interaction in the onScroll event
       setIsAutoScrolling(false);
    }
  }, [isAutoScrolling]);

  // 4. Handle Dragging the "Retro Cursor"
  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    startY.current = e.clientY;
    startTop.current = scrollThumbTop;
    document.body.style.userSelect = 'none'; // Prevent text selection while dragging
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging.current || !containerRef.current) return;
    
    const deltaY = e.clientY - startY.current;
    const { clientHeight, scrollHeight } = containerRef.current;
    const maxThumbTop = clientHeight - scrollThumbHeight;
    
    // Calculate new top position constrained to bounds
    let newTop = startTop.current + deltaY;
    newTop = Math.max(0, Math.min(newTop, maxThumbTop));
    
    // Convert thumb position back to scroll position
    const scrollRatio = newTop / maxThumbTop;
    const maxScrollTop = scrollHeight - clientHeight;
    
    containerRef.current.scrollTop = scrollRatio * maxScrollTop;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    document.body.style.userSelect = 'auto';
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-black p-4 font-mono">
      
      {/* TERMINAL CONTAINER */}
      <div className="relative w-full max-w-3xl border-2 border-gray-800 rounded bg-[#0a0a0a] shadow-2xl overflow-hidden flex flex-col">
        
        {/* HEADER BAR */}
        <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-800 select-none">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
          </div>
          <div className="text-xs text-gray-500 uppercase tracking-widest">
            {isAutoScrolling ? 'LIVE_FEED :: CONNECTED' : 'FEED_PAUSED :: MANUAL_OVERRIDE'}
          </div>
        </div>

        {/* SCROLL AREA */}
        <div className="relative h-[500px] flex">
          
          {/* TEXT CONTENT (Native scroll hidden) */}
          <div 
            ref={containerRef}
            onScroll={updateScrollThumb}
            className="flex-1 p-6 overflow-y-auto scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }} 
          >
            <div ref={contentRef} className="space-y-1">
              {displayedLines.map((line, index) => (
                <div key={index} className={`${line.color} font-medium tracking-wide whitespace-pre-wrap`}>
                  {line.text || "\u00A0"} 
                </div>
              ))}
              {/* Invisible anchor for initial auto-scroll targeting if needed */}
              <div id="terminal-bottom" />
            </div>
          </div>

          {/* RETRO SCROLLBAR TRACK */}
          <div className="w-6 bg-gray-900 border-l border-gray-800 relative select-none">
            {/* RETRO CURSOR (Draggable Thumb) */}
            <div 
              onMouseDown={handleMouseDown}
              style={{ 
                height: `${scrollThumbHeight}px`, 
                top: `${scrollThumbTop}px` 
              }}
              className={`absolute left-0 w-full cursor-pointer transition-colors duration-100 ease-linear border-y border-black
                ${isAutoScrolling ? 'bg-cyan-600 hover:bg-cyan-500' : 'bg-yellow-600 hover:bg-yellow-500'}
                group
              `}
            >
              {/* Decorative grip lines on the cursor */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col gap-[2px]">
                <div className="w-3 h-[1px] bg-black/50"></div>
                <div className="w-3 h-[1px] bg-black/50"></div>
                <div className="w-3 h-[1px] bg-black/50"></div>
              </div>
            </div>
          </div>

        </div>

        {/* FOOTER STATUS */}
        <div className="px-4 py-1 bg-gray-900 border-t border-gray-800 flex justify-between text-[10px] text-gray-500">
           <span>MEM_USAGE: 24MB</span>
           {!isAutoScrolling && <span className="animate-pulse text-yellow-500">SCROLL DOWN TO RESUME</span>}
        </div>
      </div>

      {/* CSS for hiding native scrollbar explicitly */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
      `}</style>
    </div>
  );
};

export default TerminalBoot;