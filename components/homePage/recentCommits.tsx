import React, { useEffect, useState, useRef } from 'react';

interface Commit {
  msg: string;
  time: string;
  date: string;
  hash: string;
  repo: string;
}

const RealRecentCommitsBlock = () => {
  const [commits, setCommits] = useState<Commit[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  
  // Use a ref to persist scroll position across effect re-runs
  const scrollPosRef = useRef(0);

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const past = new Date(dateString);
    const diff = Math.floor((now.getTime() - past.getTime()) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return `${Math.floor(diff / 604800)}w ago`;
  };

  useEffect(() => {
    const fetchCommits = async () => {
      try {
        const res = await fetch('/api/githubContributions?mode=commits');
        if (!res.ok) throw new Error('Failed');
        const data = await res.json();
        setCommits(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchCommits();
  }, []);

  // Auto-scroll effect
  useEffect(() => {
    if (loading || !scrollContainerRef.current || commits.length === 0 || isHovering) return;

    const container = scrollContainerRef.current;
    let direction = 1; // 1 for down, -1 for up
    let pauseTimer: NodeJS.Timeout | null = null;
    let isPaused = false;

    // Sync ref with current DOM position initially
    if (scrollPosRef.current === 0 && container.scrollTop > 0) {
        scrollPosRef.current = container.scrollTop;
    }

    const scroll = () => {
      if (!container || isHovering) return;

      const maxScroll = container.scrollHeight - container.clientHeight;
      
      // If content doesn't overflow, don't scroll
      if (maxScroll <= 0) return;
      
      if (isPaused) return;

      scrollPosRef.current += direction * 0.5;

      // Reverse direction at boundaries with pause
      if (scrollPosRef.current >= maxScroll) {
        scrollPosRef.current = maxScroll;
        direction = -1;
        isPaused = true;
        if (pauseTimer) clearTimeout(pauseTimer);
        pauseTimer = setTimeout(() => {
          isPaused = false;
        }, 2000);
      } else if (scrollPosRef.current <= 0) {
        scrollPosRef.current = 0;
        direction = 1;
        isPaused = true;
        if (pauseTimer) clearTimeout(pauseTimer);
        pauseTimer = setTimeout(() => {
          isPaused = false;
        }, 2000);
      }

      container.scrollTop = scrollPosRef.current;
    };

    const interval = setInterval(scroll, 30);
    
    return () => {
      clearInterval(interval);
      if (pauseTimer) clearTimeout(pauseTimer);
    };
  }, [loading, commits.length, isHovering]);

  return (
    <div className="commits-gem commits-container relative h-[218px] rounded-xl w-full overflow-hidden">
      {/* Premium Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#f9f7f4] via-[#f5e6d3] to-[#ede4d1]" />

      {/* Subtle Noise Texture */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='400' height='400' fill='%23000' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
        }}
      />

      {/* Content Container */}
      <div className="relative h-full flex flex-col">
        
        {/* Header */}
        <div className="py-1 px-2 border-b border-[#d4a373]/20 flex-shrink-0">
          <div className="flex items-baseline gap-2">
            <h6 className="text-xl font-bold" style={{ fontFamily: 'Bricolage Grotesque', color: '#2a2520' }}>
              Recent Activity
            </h6>
            <span className="text-sm tracking-widest uppercase" style={{ color: '#8b7355', fontWeight: 500 }}>
              Push Log
            </span>
            <p className="text-[8px] mt-1" style={{ color: '#a89b88' }}>Latest commits across your repositories</p>
          </div>
        </div>

        {/* Commits List with Auto-Scroll */}
        <div 
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto p-2 transition-opacity duration-300"
          style={{ 
            opacity: isHovering ? 1 : 1,
            scrollbarWidth: 'thin',
            scrollbarColor: '#d4a373 transparent'
          }}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          
          {/* Loading State */}
          {loading && (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="space-y-2">
                  <div 
                    className="h-4 rounded-full animate-pulse"
                    style={{ backgroundColor: '#e8dcc8', width: `${85 + Math.random() * 15}%` }}
                  />
                  <div 
                    className="h-3 rounded-full animate-pulse"
                    style={{ backgroundColor: '#ede4d1', width: `${60 + Math.random() * 30}%` }}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Commit Items */}
          {!loading && commits.length > 0 && commits.map((c, i) => (
            <div 
              key={i}
              className="commit-item group px-3 py-2 rounded-xl transition-all duration-300 hover:shadow-md cursor-pointer mb-1"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.6)',
                border: '1px solid rgba(212, 163, 115, 0.15)',
              }}
            >
              <div className="">
                {/* Top Row: Message & Time */}
                <div className="flex items-start justify-between gap-1">
                  <p 
                    className="font-medium text-sm flex-1 line-clamp-1 group-hover:text-[#d4a373] transition-colors"
                    style={{ 
                      fontFamily: 'JetBrains Mono', 
                      color: '#2a2520',
                      fontSize: '13px',
                      lineHeight: '1.4'
                    }}
                  >
                    {c.msg || 'Update'}
                  </p>
                  <span 
                    className="text-xs font-medium whitespace-nowrap group-hover:opacity-100 transition-opacity"
                    style={{ color: '#d4a373' }}
                  >
                    {formatTimeAgo(c.date || c.time)}
                  </span>
                </div>

                {/* Bottom Row: Repo & Hash */}
                <div className="flex items-center justify-between gap-1">
                  <span 
                    className="text-xs font-semibold uppercase tracking-wider group-hover:text-[#d4a373] transition-colors"
                    style={{ color: '#8b7355' }}
                  >
                    {c.repo}
                  </span>
                  <code 
                    className="text-[11px] rounded bg-[#d4a373]/8 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: '#d4a373', fontFamily: 'JetBrains Mono' }}
                  >
                    {c.hash?.slice(0, 7) || '—'}
                  </code>
                </div>
              </div>
            </div>
          ))}

          {/* Empty State */}
          {!loading && commits.length === 0 && (
            <div className="flex items-center justify-center h-32">
              <p style={{ color: '#a89b88' }} className="text-sm">No recent commits</p>
            </div>
          )}
        </div>
      </div>

      {/* Gradient Fade at Bottom */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, transparent, rgba(245, 230, 211, 0.8))'
        }}
      />
      
      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .commits-gem ::-webkit-scrollbar {
          width: 6px;
        }
        
        .commits-gem ::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .commits-gem ::-webkit-scrollbar-thumb {
          background: #d4a373;
          border-radius: 3px;
        }
        
        .commits-gem ::-webkit-scrollbar-thumb:hover {
          background: #c49363;
        }
      `}</style>
    </div>
  );
};

export default RealRecentCommitsBlock;