import React, { useEffect, useRef, useState } from 'react';

interface CardData {
  id: number;
  title: string;
  description: string;
  gradient: string;
}

const CardStackScroll: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState<number[]>([]);

  const cards: CardData[] = [
    {
      id: 1,
      title: "Design System",
      description: "Building scalable component libraries with consistent patterns and reusable elements.",
      gradient: "from-violet-500 to-purple-600"
    },
    {
      id: 2,
      title: "User Research",
      description: "Understanding user needs through interviews, testing, and behavioral analysis.",
      gradient: "from-blue-500 to-cyan-600"
    },
    {
      id: 3,
      title: "Prototyping",
      description: "Rapid iteration and validation of ideas through interactive mockups.",
      gradient: "from-emerald-500 to-teal-600"
    },
    {
      id: 4,
      title: "Development",
      description: "Transforming designs into production-ready code with attention to detail.",
      gradient: "from-amber-500 to-orange-600"
    },
    {
      id: 5,
      title: "Launch",
      description: "Shipping products that delight users and drive business outcomes.",
      gradient: "from-rose-500 to-pink-600"
    }
  ];

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const cards = container.querySelectorAll('.stack-card');
      const progress: number[] = [];

      cards.forEach((card, index) => {
        const rect = card.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const cardTop = rect.top;
        const cardHeight = rect.height;

        // Calculate how much of the card has been scrolled
        const scrolled = windowHeight - cardTop;
        const cardProgress = Math.max(0, Math.min(1, scrolled / (windowHeight * 0.7)));
        
        progress[index] = cardProgress;
      });

      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial calculation

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getCardStyle = (index: number): React.CSSProperties => {
    const progress = scrollProgress[index] || 0;
    const prevProgress = scrollProgress[index - 1] || 0;

    // Calculate scale and position based on scroll
    const scale = 0.98 + (progress * 0.05);
    const opacity = 0.3 + (progress * 0.7);
    const yOffset = (1 - progress) * 50;

    // Pin effect: reduce movement when card is active
    const isPinned = progress > 0.3 && progress < 1;
    const pinnedY = isPinned ? Math.max(0, yOffset * 0.3) : yOffset;

    return {
      transform: `translateY(${pinnedY}px) scale(${scale})`,
      opacity: opacity,
      zIndex: index + 1,
    };
  };

  return (
    <div className="w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div ref={containerRef} className="relative px-4 pb-screen">
        {cards.map((card, index) => (
          <div
            key={card.id}
            className="stack-card sticky top-20 mb-8"
            style={getCardStyle(index)}
          >
            <div className={`bg-gradient-to-br ${card.gradient} rounded-3xl p-8 flex flex-col justify-between`}>
              <div>
                <div className="text-white/60 text-sm font-medium mb-4">
                  {String(index + 1).padStart(2, '0')}
                </div>
                <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
                  {card.title}
                </h2>
                <p className="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">
                  {card.description}
                </p>
              </div>
              
              <div className="flex items-center gap-3 text-white/80">
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
                <span className="text-sm font-medium">Learn More</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CardStackScroll;