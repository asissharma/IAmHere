import { ShieldCheck, Zap, Cpu, Database, Globe, Server, Layers, Radio, ArrowDownToLine, Lock, GitBranch } from 'lucide-react';

export const SYSTEM_SCENARIOS = [
  {
    id: "gateway",
    title: "API Gateway Aggregation",
    desc: "Unified entry point routing to microservices.",
    accent: "bg-blue-500",
    color: "text-blue-400",
    icon: ShieldCheck,
    nodes: [
      { id: "client", label: "Client", icon: Globe, x: "50%", y: "15%", color: "bg-blue-500" },
      { id: "gateway", label: "Gateway", icon: ShieldCheck, x: "50%", y: "45%", color: "bg-indigo-500" },
      { id: "auth", label: "Auth", icon: Lock, x: "20%", y: "75%", color: "bg-slate-700" },
      { id: "service", label: "Core", icon: Server, x: "50%", y: "75%", color: "bg-slate-700" },
      { id: "billing", label: "Billing", icon: Server, x: "80%", y: "75%", color: "bg-slate-700" },
    ],
    edges: [
      { from: "client", to: "gateway", color: "#60a5fa" },
      { from: "gateway", to: "auth", color: "#60a5fa", delay: 0.5 },
      { from: "gateway", to: "service", color: "#60a5fa", delay: 0.6 },
      { from: "gateway", to: "billing", color: "#60a5fa", delay: 0.7 },
    ]
  },
  {
    id: "kafka",
    title: "Event-Driven Pipeline",
    desc: "Asynchronous decoupling via Kafka brokers.",
    accent: "bg-purple-500",
    color: "text-purple-400",
    icon: Zap,
    nodes: [
      { id: "producer", label: "Producer", icon: Zap, x: "15%", y: "50%", color: "bg-yellow-500" },
      { id: "broker", label: "Broker", icon: Layers, x: "50%", y: "50%", color: "bg-purple-600" },
      { id: "c1", label: "Logs", icon: Server, x: "85%", y: "25%", color: "bg-purple-900" },
      { id: "c2", label: "Notifs", icon: Server, x: "85%", y: "50%", color: "bg-purple-900" },
      { id: "c3", label: "Analytics", icon: Server, x: "85%", y: "75%", color: "bg-purple-900" },
    ],
    edges: [
      { from: "producer", to: "broker", color: "#a855f7" },
      { from: "broker", to: "c1", color: "#a855f7", delay: 0.8 },
      { from: "broker", to: "c2", color: "#a855f7", delay: 0.9 },
      { from: "broker", to: "c3", color: "#a855f7", delay: 1.0 },
    ]
  },
  {
    id: "cache",
    title: "Read-Aside Caching",
    desc: "Sub-millisecond latency via Redis.",
    accent: "bg-amber-500",
    color: "text-amber-400",
    icon: Cpu,
    nodes: [
      { id: "user", label: "User", icon: Globe, x: "50%", y: "15%", color: "bg-blue-500" },
      { id: "api", label: "API", icon: Server, x: "50%", y: "45%", color: "bg-slate-500" },
      { id: "redis", label: "Cache HIT", icon: Cpu, x: "80%", y: "45%", color: "bg-emerald-500" },
      { id: "db", label: "DB MISS", icon: Database, x: "20%", y: "75%", color: "bg-red-500" },
    ],
    edges: [
      { from: "user", to: "api", color: "#f59e0b" },
      { from: "api", to: "redis", color: "#10b981", delay: 0.5 },
      { from: "api", to: "db", color: "#ef4444", delay: 0.8 },
    ]
  },
  {
    id: "replication",
    title: "Database Replication",
    desc: "Primary-Replica sync for availability.",
    accent: "bg-emerald-500",
    color: "text-emerald-400",
    icon: Database,
    nodes: [
      { id: "primary", label: "Primary", icon: Database, x: "50%", y: "20%", color: "bg-emerald-500" },
      { id: "sync1", label: "Sync", icon: ArrowDownToLine, x: "25%", y: "50%", color: "bg-blue-900" },
      { id: "sync2", label: "Sync", icon: ArrowDownToLine, x: "75%", y: "50%", color: "bg-blue-900" },
      { id: "r1", label: "Replica 1", icon: Database, x: "25%", y: "80%", color: "bg-blue-600" },
      { id: "r2", label: "Replica 2", icon: Database, x: "75%", y: "80%", color: "bg-blue-600" },
    ],
    edges: [
      { from: "primary", to: "sync1", color: "#10b981" },
      { from: "primary", to: "sync2", color: "#10b981" },
      { from: "sync1", to: "r1", color: "#3b82f6", delay: 0.5 },
      { from: "sync2", to: "r2", color: "#3b82f6", delay: 0.5 },
    ]
  },
  {
    id: "cdn",
    title: "Global Edge CDN",
    desc: "Serving assets from nearest POP.",
    accent: "bg-cyan-500",
    color: "text-cyan-400",
    icon: Globe,
    nodes: [
      { id: "asia", label: "Asia", icon: Globe, x: "15%", y: "80%", color: "bg-slate-600" },
      { id: "eu", label: "Europe", icon: Globe, x: "85%", y: "80%", color: "bg-slate-600" },
      { id: "edge", label: "Edge POP", icon: Radio, x: "50%", y: "50%", color: "bg-cyan-500" },
      { id: "origin", label: "Origin", icon: Server, x: "50%", y: "20%", color: "bg-indigo-600" },
    ],
    edges: [
      { from: "asia", to: "edge", color: "#06b6d4" },
      { from: "eu", to: "edge", color: "#06b6d4" },
      { from: "edge", to: "origin", color: "#06b6d4", delay: 0.5 },
    ]
  },
  {
    id: "sharding",
    title: "Database Sharding",
    desc: "Horizontal partitioning by shard key.",
    accent: "bg-rose-500",
    color: "text-rose-400",
    icon: GitBranch,
    nodes: [
      { id: "lb", label: "Router", icon: GitBranch, x: "50%", y: "20%", color: "bg-rose-500" },
      { id: "s1", label: "Shard A-M", icon: Database, x: "20%", y: "60%", color: "bg-slate-700" },
      { id: "s2", label: "Shard N-Z", icon: Database, x: "80%", y: "60%", color: "bg-slate-700" },
    ],
    edges: [
      { from: "lb", to: "s1", color: "#e11d48" },
      { from: "lb", to: "s2", color: "#e11d48", delay: 0.2 },
    ]
  }
];