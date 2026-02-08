import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Activity, Cpu, Server } from 'lucide-react';

const SystemHealthBlock = () => {
  const [metrics, setMetrics] = useState({ load: 34, temp: 45, status: 'NOMINAL' });

  // Simulate complex live data
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        load: Math.floor(Math.max(20, Math.min(95, prev.load + (Math.random() * 20 - 10)))),
        temp: Math.floor(Math.max(40, Math.min(85, prev.temp + (Math.random() * 10 - 5)))),
        status: Math.random() > 0.9 ? 'OPTIMIZING' : 'NOMINAL'
      }));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  // Determine color based on load
  const statusColor = metrics.load > 80 ? 'text-red-500' : metrics.load > 60 ? 'text-amber-500' : 'text-emerald-500';
  const glowColor = metrics.load > 80 ? 'shadow-red-500/50' : 'shadow-emerald-500/50';

  return (
    <div className="relative w-full h-full bg-[#030305] rounded-xl border border-white/5 overflow-hidden flex flex-col justify-between group shadow-2xl">
      
      {/* 1. BACKGROUND EFFECTS */}
      {/* Moving Mesh Gradient */}
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-900/40 via-[#050505] to-[#050505]"></div>
      
      {/* Scanning Line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500/30 blur-[2px] animate-scan-vertical pointer-events-none z-0"></div>

      {/* 2. HEADER */}
      <div className="relative z-10 px-5 py-3 flex justify-between items-start bg-gradient-to-b from-white/5 to-transparent">
         <div className="flex flex-col">
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-0.5">Core_Status</span>
            <div className={`flex items-center gap-2 text-xs font-bold font-mono ${statusColor}`}>
               <Activity size={12} className="animate-pulse" />
               {metrics.status}
            </div>
         </div>
         <div className="px-2 py-1 rounded bg-white/5 border border-white/5 text-[9px] font-mono text-slate-400">
            ap-south-1
         </div>
      </div>

      {/* 3. CENTER: THE REACTOR CORE (The "Eye Catching" Part) */}
      <div className="relative flex-1 flex items-center justify-center py-2">
         
         {/* Outer Rotating Ring */}
         <div className="absolute w-32 h-32 rounded-full border border-dashed border-slate-800 animate-spin-slow opacity-50"></div>
         <div className="absolute w-28 h-28 rounded-full border border-slate-800 animate-spin-reverse opacity-30"></div>

         {/* The Glowing Core */}
         <div className="relative w-20 h-20 flex items-center justify-center">
            {/* Pulsing Aura */}
            <div className={`absolute inset-0 rounded-full blur-xl opacity-40 transition-colors duration-700 ${metrics.load > 80 ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
            
            {/* Solid Core */}
            <div className="relative z-10 w-16 h-16 bg-[#0A0A0A] rounded-full border border-white/10 flex flex-col items-center justify-center shadow-inner">
               <span className="text-xl font-bold text-white font-mono">{metrics.load}%</span>
               <span className="text-[8px] text-slate-500 font-mono uppercase">Load</span>
            </div>

            {/* Orbiting Particle */}
            <div className="absolute w-full h-full animate-spin-fast">
               <div className={`w-2 h-2 rounded-full ${metrics.load > 80 ? 'bg-red-400' : 'bg-emerald-400'} shadow-[0_0_10px_currentColor] absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1`}></div>
            </div>
         </div>

      </div>

      {/* 4. FOOTER METRICS GRID */}
      <div className="relative z-10 grid grid-cols-2 border-t border-white/5 bg-black/20 backdrop-blur-sm">
         <div className="p-3 border-r border-white/5 flex items-center gap-3">
            <Cpu size={14} className="text-slate-600" />
            <div className="flex flex-col">
               <span className="text-[8px] text-slate-500 uppercase">Temp</span>
               <span className="text-xs text-slate-300 font-mono">{metrics.temp}°C</span>
            </div>
         </div>
         <div className="p-3 flex items-center gap-3">
            <Server size={14} className="text-slate-600" />
            <div className="flex flex-col">
               <span className="text-[8px] text-slate-500 uppercase">Memory</span>
               <span className="text-xs text-slate-300 font-mono">12GB</span>
            </div>
         </div>
      </div>

      <style jsx>{`
        @keyframes scan-vertical { 0% { top: -10%; opacity: 0; } 50% { opacity: 1; } 100% { top: 110%; opacity: 0; } }
        @keyframes spin-slow { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes spin-reverse { 0% { transform: rotate(360deg); } 100% { transform: rotate(0deg); } }
        @keyframes spin-fast { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        
        .animate-scan-vertical { animation: scan-vertical 3s linear infinite; }
        .animate-spin-slow { animation: spin-slow 10s linear infinite; }
        .animate-spin-reverse { animation: spin-reverse 15s linear infinite; }
        .animate-spin-fast { animation: spin-fast 2s linear infinite; }
      `}</style>
    </div>
  );
};

export default SystemHealthBlock;