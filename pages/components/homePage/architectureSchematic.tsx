import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SYSTEM_SCENARIOS } from "../../api/architectureData";
import { LucideIcon } from 'lucide-react';

// --- TYPES ---
interface NodeData {
  id: string;
  label: string;
  icon: LucideIcon;
  x: string;
  y: string;
  color: string;
}

interface EdgeData {
  from: string;
  to: string;
  color: string;
  delay?: number;
}

interface NodeProps {
  node: NodeData;
  delay: number;
}

interface ConnectionProps {
  start: NodeData;
  end: NodeData;
  color: string;
  delay?: number;
}

// --- COMPONENTS ---

const Node: React.FC<NodeProps> = ({ node, delay }) => (
  <motion.div
    initial={{ scale: 0, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    exit={{ scale: 0, opacity: 0 }}
    transition={{ delay: delay * 0.1, type: "spring", stiffness: 200, damping: 20 }}
    className="absolute w-12 h-12 -ml-6 -mt-6 flex flex-col items-center justify-center z-20"
    style={{ left: node.x, top: node.y }}
  >
    <div className={`relative w-10 h-10 rounded-xl bg-[#111] border border-white/10 flex items-center justify-center shadow-2xl`}>
        {/* Glow behind */}
        <div className={`absolute inset-0 rounded-xl opacity-30 blur-md ${node.color}`} />
        {/* Icon */}
        <node.icon size={18} className="text-white relative z-10" />
    </div>
    <span className="absolute top-full mt-2 text-[8px] font-mono text-slate-400 uppercase tracking-wider bg-black/50 px-1 rounded whitespace-nowrap">
        {node.label}
    </span>
  </motion.div>
);

const Connection: React.FC<ConnectionProps> = ({ start, end, color, delay = 0 }) => {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible">
      {/* Background Line */}
      <line 
        x1={start.x} 
        y1={start.y} 
        x2={end.x} 
        y2={end.y} 
        stroke="rgba(255,255,255,0.05)" 
        strokeWidth="1" 
        strokeDasharray="4 4"
      />
      {/* Animated Packet */}
      <motion.circle
        r="2"
        fill={color}
        filter={`drop-shadow(0 0 4px ${color})`}
        initial={{ 
          cx: start.x,
          cy: start.y,
          opacity: 0
        }}
        animate={{ 
          cx: [start.x, end.x],
          cy: [start.y, end.y],
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

const ArchitectureSchematic: React.FC = () => {
  const [index, setIndex] = useState<number>(0);

  useEffect(() => {
    const timer = setInterval(() => setIndex((i) => (i + 1) % SYSTEM_SCENARIOS.length), 6000);
    return () => clearInterval(timer);
  }, []);

  const scene = SYSTEM_SCENARIOS[index];
  const SceneIcon = scene.icon;

  return (
    <div className="w-full h-full bg-[#050505] rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col relative group">
      
      {/* 1. Header (Floating Status Bar) */}
      <div className="relative z-30 px-3 py-3 border-b border-white/5 bg-white/[0.02] backdrop-blur-md flex justify-between items-center">
         <div className="flex-1">
             <motion.div 
               key={scene.title}
               initial={{ opacity: 0, y: 5 }}
               animate={{ opacity: 1, y: 0 }}
               className="flex items-center gap-3"
             >
                 <div className={`w-8 h-8 rounded-lg ${scene.accent} bg-opacity-20 border border-white/10 flex items-center justify-center`}>
                   <SceneIcon size={16} className={scene.color} />
                 </div>
                 <div className="flex flex-col">
                   <span className={`text-xs font-semibold ${scene.color}`}>
                      {scene.title}
                   </span>
                   <span className="text-[9px] text-slate-500 font-mono">
                      {scene.desc}
                   </span>
                 </div>
             </motion.div>
         </div>
      </div>

      {/* 2. Visualization Area */}
      <div className="relative flex-1 w-full">
         
         {/* Grid Background */}
         <div className="absolute inset-0 opacity-10" 
              style={{ 
                backgroundImage: `linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)`, 
                backgroundSize: '24px 24px' 
              }}>
         </div>

         {/* Scanline Effect */}
         <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent h-[20%] w-full animate-scanline pointer-events-none" />

         {/* Vignette */}
         <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/30 pointer-events-none" />

         <AnimatePresence mode="wait">
            <motion.div 
                key={scene.id}
                className="absolute inset-0 justify-center items-center"
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
                {scene.edges.map((edge, i) => {
                    const start = scene.nodes.find(n => n.id === edge.from);
                    const end = scene.nodes.find(n => n.id === edge.to);
                    if (!start || !end) return null;
                    return <Connection key={i} start={start} end={end} color={edge.color} delay={edge.delay || 0} />;
                })}
            </motion.div>
         </AnimatePresence>
      </div>

      {/* 3. Footer (Metrics) */}
      <div className="relative z-30 px-4     py-1 border-t border-white/5 bg-white/[0.02] flex justify-between text-[9px] font-mono text-slate-500 uppercase tracking-wider">
         <div className="flex gap-2">
           <span>Scenario: <span className="text-white">{index + 1}/{SYSTEM_SCENARIOS.length}</span></span>
           <span>Region: <span className="text-white">us-east-1</span></span>
         </div>
         <div className="flex gap-2">
           <span>Latency: <span className="text-emerald-500">&lt;100ms</span></span>
           <span>Uptime: <span className="text-emerald-500">99.99%</span></span>
         </div>
      </div>

      <style jsx>{`
        @keyframes scanline { 
          0% { top: -20%; } 
          100% { top: 120%; } 
        }
        .animate-scanline { 
          animation: scanline 4s linear infinite; 
        }
      `}</style>
    </div>
  );
};

export default ArchitectureSchematic;