import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Server, Database, Globe, Cpu, ShieldCheck, 
  Zap, Layers, Radio, ArrowDownToLine 
} from 'lucide-react';

// --- CONFIGURATION ---
// Data-driven scenarios for easy expansion
const SCENARIOS = [
  {
    id: "gateway",
    title: "API Gateway Aggregation",
    desc: "Unified entry point routing to microservices.",
    color: "text-blue-400",
    accent: "bg-blue-500",
    nodes: [
      { id: "client", icon: Globe, label: "Client", x: 50, y: 15, color: "bg-blue-500" },
      { id: "gw", icon: ShieldCheck, label: "Gateway", x: 50, y: 50, color: "bg-indigo-500" },
      { id: "s1", icon: Server, label: "Auth", x: 20, y: 85, color: "bg-slate-700" },
      { id: "s2", icon: Server, label: "Core", x: 50, y: 85, color: "bg-slate-700" },
      { id: "s3", icon: Server, label: "Pay", x: 80, y: 85, color: "bg-slate-700" },
    ],
    connections: [
      { from: "client", to: "gw", color: "#60a5fa" },
      { from: "gw", to: "s1", color: "#60a5fa", delay: 0.2 },
      { from: "gw", to: "s2", color: "#60a5fa", delay: 0.3 },
      { from: "gw", to: "s3", color: "#60a5fa", delay: 0.4 },
    ]
  },
  {
    id: "kafka",
    title: "Event-Driven Pipeline",
    desc: "Asynchronous decoupling via Kafka brokers.",
    color: "text-purple-400",
    accent: "bg-purple-500",
    nodes: [
      { id: "pub", icon: Zap, label: "Producer", x: 15, y: 50, color: "bg-amber-500" },
      { id: "bus", icon: Layers, label: "Event Bus", x: 50, y: 50, color: "bg-purple-600" },
      { id: "sub1", icon: Database, label: "Logs", x: 85, y: 20, color: "bg-purple-900" },
      { id: "sub2", icon: Server, label: "Email", x: 85, y: 50, color: "bg-purple-900" },
      { id: "sub3", icon: Server, label: "Analytics", x: 85, y: 80, color: "bg-purple-900" },
    ],
    connections: [
      { from: "pub", to: "bus", color: "#a855f7" },
      { from: "bus", to: "sub1", color: "#c084fc", delay: 0.5 },
      { from: "bus", to: "sub2", color: "#c084fc", delay: 0.6 },
      { from: "bus", to: "sub3", color: "#c084fc", delay: 0.7 },
    ]
  },
  {
    id: "cache",
    title: "Read-Aside Caching",
    desc: "Sub-millisecond latency via Redis.",
    color: "text-emerald-400",
    accent: "bg-emerald-500",
    nodes: [
      { id: "user", icon: Globe, label: "User", x: 50, y: 15, color: "bg-blue-500" },
      { id: "api", icon: Server, label: "API", x: 50, y: 50, color: "bg-slate-500" },
      { id: "redis", icon: Cpu, label: "Cache (HIT)", x: 85, y: 50, color: "bg-emerald-500" },
      { id: "db", icon: Database, label: "DB (MISS)", x: 20, y: 85, color: "bg-red-500" },
    ],
    connections: [
      { from: "user", to: "api", color: "#34d399" },
      { from: "api", to: "redis", color: "#34d399", delay: 0.3 },
      { from: "api", to: "db", color: "#f87171", delay: 0.8 }, // Slower path
    ]
  }
];

// --- COMPONENTS ---

const Node = ({ node, delay }: { node: any, delay: number }) => (
  <motion.div
    initial={{ scale: 0, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    exit={{ scale: 0, opacity: 0 }}
    transition={{ delay: delay * 0.1, type: "spring", stiffness: 200, damping: 20 }}
    className="absolute w-12 h-12 -ml-6 -mt-6 flex flex-col items-center justify-center z-20"
    style={{ left: `${node.x}%`, top: `${node.y}%` }}
  >
    <div className={`relative w-10 h-10 rounded-xl bg-[#111] border border-white/10 flex items-center justify-center shadow-2xl`}>
        {/* Glow behind */}
        <div className={`absolute inset-0 rounded-xl opacity-30 blur-md ${node.color}`} />
        {/* Icon */}
        <node.icon size={18} className="text-white relative z-10" />
    </div>
    <span className="absolute top-full mt-2 text-[8px] font-mono text-slate-400 uppercase tracking-wider bg-black/50 px-1 rounded">
        {node.label}
    </span>
  </motion.div>
);

const Connection = ({ start, end, color, delay = 0 }: any) => {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible">
      {/* Background Line */}
      <line 
        x1={`${start.x}%`} y1={`${start.y}%`} 
        x2={`${end.x}%`} y2={`${end.y}%`} 
        stroke="rgba(255,255,255,0.05)" 
        strokeWidth="1" 
        strokeDasharray="4 4"
      />
      {/* Animated Packet */}
      <motion.circle
        r="2"
        fill={color}
        filter={`drop-shadow(0 0 4px ${color})`}
        initial={{ offsetDistance: "0%" }}
        animate={{ 
          cx: [`${start.x}%`, `${end.x}%`],
          cy: [`${start.y}%`, `${end.y}%`],
          opacity: [0, 1, 1, 0]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "linear",
          delay: delay,
          repeatDelay: 0.5
        }}
      />
    </svg>
  );
};

const ArchitectureSchematic = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setIndex((i) => (i + 1) % SCENARIOS.length), 5000);
    return () => clearInterval(timer);
  }, []);

  const scene = SCENARIOS[index];

  return (
    <div className="w-full h-full bg-[#050505] rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col relative group">
      
      {/* 1. Header (Floating Status Bar) */}
      <div className="relative z-30 px-6 py-4 border-b border-white/5 bg-white/[0.02] backdrop-blur-md flex justify-between items-center">
         <div>
             <motion.div 
               key={scene.title}
               initial={{ opacity: 0, y: 5 }}
               animate={{ opacity: 1, y: 0 }}
               className="flex items-center gap-2"
             >
                 <div className={`w-1.5 h-1.5 rounded-full ${scene.accent} animate-pulse shadow-[0_0_8px_currentColor]`} />
                 <span className={`text-[10px] font-mono uppercase tracking-widest ${scene.color}`}>
                    {scene.title}
                 </span>
             </motion.div>
         </div>
         {/* Simple Progress Dots */}
         <div className="flex gap-1.5">
            {SCENARIOS.map((_, i) => (
                <div key={i} className={`h-1 rounded-full transition-all duration-500 ${i === index ? `w-4 ${scene.accent}` : 'w-1 bg-white/10'}`} />
            ))}
         </div>
      </div>

      {/* 2. Visualization Area */}
      <div className="relative flex-1 w-full">
         
         {/* Grid Background */}
         <div className="absolute inset-0 opacity-10" 
              style={{ backgroundImage: `linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)`, backgroundSize: '24px 24px' }}>
         </div>

         {/* Scanline Effect */}
         <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent h-[20%] w-full animate-scanline pointer-events-none" />

         <AnimatePresence mode="wait">
            <motion.div 
                key={scene.id}
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
            >
                {/* Render Nodes */}
                {scene.nodes.map((node, i) => (
                    <Node key={node.id} node={node} delay={i} />
                ))}

                {/* Render Connections */}
                {scene.connections.map((conn, i) => {
                    const start = scene.nodes.find(n => n.id === conn.from);
                    const end = scene.nodes.find(n => n.id === conn.to);
                    if (!start || !end) return null;
                    return <Connection key={i} start={start} end={end} color={conn.color} delay={conn.delay} />;
                })}
            </motion.div>
         </AnimatePresence>
      </div>

      {/* 3. Footer (Metrics) */}
      <div className="relative z-30 px-6 py-3 border-t border-white/5 bg-white/[0.02] flex justify-between text-[9px] font-mono text-slate-500 uppercase tracking-wider">
         <span>Region: <span className="text-white">us-east-1</span></span>
         <span>Uptime: <span className="text-emerald-500">99.99%</span></span>
      </div>

      <style jsx>{`
        @keyframes scanline { 0% { top: -20%; } 100% { top: 120%; } }
        .animate-scanline { animation: scanline 4s linear infinite; }
      `}</style>
    </div>
  );
};

export default ArchitectureSchematic;