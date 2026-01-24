import React, { useEffect, useRef, useState } from 'react';

// --- Types ---
interface TechBadge {
  label: string;
  icon?: string;
}

interface CardData {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  bgTheme: string;
  cardGradient: string;
  techStack: TechBadge[];
  metric: { value: string; label: string };
}

// --- Data: Refined for Professional Polish ---
const cards: CardData[] = [
  {
    id: 1,
    title: "Event-Driven Core",
    subtitle: "Architecture",
    description: "Decoupling microservices via high-throughput message brokers. Implementing idempotent consumer patterns to ensure data consistency at scale.",
    bgTheme: "bg-[#0B0F19]", // Deep slate
    cardGradient: "from-violet-600 via-indigo-700 to-indigo-900",
    techStack: [{ label: "Kafka" }, { label: "Go" }, { label: "gRPC" }],
    metric: { value: "120k", label: "Events / Sec" }
  },
  {
    id: 2,
    title: "Chaos Engineering",
    subtitle: "Reliability",
    description: "Proactive fault injection to validate resilience. Utilizing circuit breakers and bulkhead patterns to prevent cascading failures across the mesh.",
    bgTheme: "bg-[#091210]", // Deep teal/black
    cardGradient: "from-emerald-600 via-teal-700 to-teal-900",
    techStack: [{ label: "Istio" }, { label: "Gremlin" }, { label: "K8s" }],
    metric: { value: "99.99%", label: "Availability" }
  },
  {
    id: 3,
    title: "Edge Distribution",
    subtitle: "Performance",
    description: "Intelligent content routing and database read-replicas. Moving compute closer to the user to minimize handshake latency.",
    bgTheme: "bg-[#0B1120]", // Deep blue
    cardGradient: "from-blue-600 via-cyan-700 to-cyan-900",
    techStack: [{ label: "Cloudflare" }, { label: "Redis" }, { label: "Rust" }],
    metric: { value: "<35ms", label: "Global TTFB" }
  },
  {
    id: 4,
    title: "Deep Observability",
    subtitle: "Insights",
    description: "Correlation of distributed traces with logs and metrics. turning raw telemetry into predictive alerts for operations teams.",
    bgTheme: "bg-[#1A0F0A]", // Deep orange/brown
    cardGradient: "from-orange-600 via-amber-700 to-red-900",
    techStack: [{ label: "OpenTelemetry" }, { label: "Grafana" }, { label: "Loki" }],
    metric: { value: "24/7", label: "Anomaly Detection" }
  }
];

const BouncyCardStack: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      const distFromTop = -rect.top;
      const scrollPerCard = viewportHeight;
      const rawIndex = (distFromTop + (viewportHeight * 0.2)) / scrollPerCard;

      // 4. Determine Active Index
      const clampedIndex = Math.min(
        cards.length - 1,
        Math.max(0, Math.floor(rawIndex))
      );

      const finished = rect.bottom <= viewportHeight;

      if (clampedIndex !== activeCardIndex) {
        setActiveCardIndex(clampedIndex);
      }
      if (finished !== isFinished) {
        setIsFinished(finished);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeCardIndex, isFinished]);

  return (
    <div className={`w-full transition-colors duration-700 ease-linear ${cards[activeCardIndex].bgTheme}`}>
      
      <div 
        ref={containerRef}
        className="relative w-full px-4 md:px-8"
        style={{ height: `${(cards.length * 100) + 50}vh` }}
      >
        
        {/* Sticky Header - Fades out as you scroll deep */}
        <div className="sticky mt-5 z-0 text-center transition-opacity duration-300"
             style={{ opacity: isFinished ? 0 : 1 }}>
          <h2 className="text-xs md:text-sm font-mono text-white/40 tracking-[0.2em] uppercase mb-1">
            System Architecture
          </h2>
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-white tracking-tight">
            Built for <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Scale</span>
          </h1>
        </div>

        <div className="max-w-5xl mx-auto relative">
          {cards.map((card, index) => {
            const isActive = activeCardIndex === index;
            const isPast = activeCardIndex > index;
            const isFuture = activeCardIndex < index;
            let cardStyle: React.CSSProperties = {
                zIndex: index + 10,
                transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
            };

            if (isActive) {
                cardStyle = {
                    ...cardStyle,
                    transform: 'scale(1) translateY(0) rotateX(0deg)',
                    opacity: 1,
                    filter: 'blur(0px)'
                };
            } else if (isPast) {
                cardStyle = {
                    ...cardStyle,
                    transform: 'scale(0.9) translateY(-100px) rotateX(5deg)',
                    opacity: 0,
                    filter: 'blur(8px)',
                    pointerEvents: 'none'
                };
            } else if (isFuture) {
                cardStyle = {
                    ...cardStyle,
                    transform: 'scale(1.1) translateY(150px) rotateX(-5deg)',
                    opacity: 0,
                    filter: 'blur(4px)',
                    pointerEvents: 'none'
                };
            }

            return (

              <div 
                key={card.id}
                className="sticky h-screen flex items-center justify-center overflow-hidden"
              >
                <div 
                  className={`
                    relative w-full rounded-3xl p-8 md:p-12 
                    border border-white/10 shadow-2xl backdrop-blur-md
                    bg-gradient-to-br ${card.cardGradient}
                  `}
                  style={cardStyle}
                >
                  <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay"
                       style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.4'/%3E%3C/svg%3E")` }} 
                  />
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 relative z-10">
                    
                    <div className="flex flex-col justify-center text-left">
                      <div className="inline-flex items-center gap-3 mb-6">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 text-white/90 text-xs font-mono border border-white/10 shadow-inner">
                          {index + 1}
                        </span>
                        <span className="h-px w-8 bg-white/20"></span>
                        <span className="text-white/80 text-xs font-bold tracking-widest uppercase">
                          {card.subtitle}
                        </span>
                      </div>
                      
                      <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight drop-shadow-sm">
                        {card.title}
                      </h2>
                      
                      <p className="text-lg text-blue-50/80 leading-relaxed font-light mb-8">
                        {card.description}
                      </p>

                      {/* Tech Pills */}
                      <div className="flex flex-wrap gap-3">
                        {card.techStack.map((tech, i) => (
                          <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-black/20 border border-white/5 shadow-sm">
                             {/* Tiny dot for visual accent */}
                             <div className={`w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-emerald-400' : 'bg-blue-400'}`} />
                             <span className="text-sm font-medium text-white/90">{tech.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="hidden lg:flex items-center justify-center relative">
                      <div className="absolute w-64 h-64 bg-white/10 rounded-full blur-[80px]" />
                      
                      <div className="relative w-full aspect-square max-w-sm bg-gradient-to-b from-white/10 to-transparent rounded-2xl border border-white/10 p-1 flex flex-col items-center justify-center shadow-2xl">
                         <div className="w-full h-full bg-[#050505]/20 rounded-xl flex flex-col items-center justify-center backdrop-blur-sm">
                           <span className="text-7xl font-bold text-white mb-2 tracking-tighter drop-shadow-xl">
                             {card.metric.value}
                           </span>
                           <span className="text-white/50 text-xs font-mono uppercase tracking-[0.2em]">
                             {card.metric.label}
                           </span>
                         </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BouncyCardStack;