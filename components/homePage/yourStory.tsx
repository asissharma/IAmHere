import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const YourStory = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    // Parallax Transforms
    const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
    const yText = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
    const opacityText = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

    const timelineData = [
        {
            year: "2020",
            title: "The Awakening",
            desc: "Wrote my first line of Python. Realized that with great power comes great syntax errors.",
            icon: "⚡"
        },
        {
            year: "2021",
            title: "Building Blocks",
            desc: "Dove headfirst into Full Stack. React, Node, and the art of centering a div.",
            icon: "🏗️"
        },
        {
            year: "2022",
            title: "System Thinking",
            desc: "Moved beyond 'it works' to 'it scales'. Architecture, database design, and optimization.",
            icon: "🧠"
        },
        {
            year: "2024",
            title: "The Architect",
            desc: "Building IAmHere. Orchestrating symphonies of code. Obsessed with performance and UX.",
            icon: "🚀"
        }
    ];

    return (
        <div ref={containerRef} className="relative w-full bg-[#050505] text-white py-32 overflow-hidden border-t border-white/5">

            {/* Parallax Background Elements */}
            <motion.div style={{ y: yBg }} className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-900/30 rounded-full blur-3xl mix-blend-screen animate-blob"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-900/30 rounded-full blur-3xl mix-blend-screen animate-blob animation-delay-2000"></div>
            </motion.div>

            <div className="max-w-6xl mx-auto px-6 relative z-10">

                {/* Parallax Header */}
                <motion.div
                    style={{ y: yText, opacity: opacityText }}
                    className="text-center mb-32"
                >
                    <h2 className="text-sm font-mono text-emerald-500 tracking-widest uppercase mb-4">
             // ORIGIN_STORY
                    </h2>
                    <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-400 to-slate-600 tracking-tighter">
                        The Human<br />Behind the Code
                    </h1>
                    <p className="mt-8 text-slate-400 max-w-2xl mx-auto leading-relaxed text-lg">
                        Beyond the commits and the pull requests, there's a journey of curiosity, failure, and endless iteration.
                    </p>
                </motion.div>

                {/* Timeline Grid */}
                <div className="relative">
                    {/* Vertical Line */}
                    <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-emerald-500/50 to-transparent"></div>

                    <div className="space-y-24">
                        {timelineData.map((item, index) => (
                            <TimelineItem key={index} item={item} index={index} />
                        ))}
                    </div>
                </div>

                {/* Philosophy Section */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-10%" }}
                    transition={{ duration: 0.8 }}
                    className="mt-40 grid grid-cols-1 md:grid-cols-3 gap-8"
                >
                    {[
                        { title: "Curiosity", desc: "I don't just use tools; I take them apart to see how they work." },
                        { title: "Craftsmanship", desc: "Clean code is not a luxury. It's a necessity for sanity." },
                        { title: "Impact", desc: "Software solves problems. If it doesn't help people, why build it?" }
                    ].map((card, i) => (
                        <div
                            key={i}
                            className="group p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all duration-500 hover:-translate-y-2"
                        >
                            <h3 className="text-xl font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors">{card.title}</h3>
                            <p className="text-slate-500 text-sm leading-relaxed">{card.desc}</p>
                        </div>
                    ))}
                </motion.div>

            </div>
        </div>
    );
};

// Extracted Component for cleaner code & isolated animations
const TimelineItem = ({ item, index }: { item: any, index: number }) => {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "center center"]
    });

    // As element scrolls into view:
    // Opacity goes 0 -> 1
    // Scale goes 0.8 -> 1
    // Y goes 100 -> 0
    const opacity = useTransform(scrollYProgress, [0, 0.8], [0, 1]);
    const scale = useTransform(scrollYProgress, [0, 0.8], [0.8, 1]);
    const y = useTransform(scrollYProgress, [0, 0.8], [100, 0]);

    return (
        <motion.div
            ref={ref}
            style={{ opacity, scale, y }}
            className={`flex flex-col md:flex-row items-center ${index % 2 === 0 ? 'md:flex-row-reverse' : ''} relative`}
        >
            {/* Icon Node */}
            <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-[#050505] border border-emerald-500/50 flex items-center justify-center z-10 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                <span className="text-lg">{item.icon}</span>
            </div>

            {/* Spacer for Desktop */}
            <div className="hidden md:block w-1/2"></div>

            {/* Content Card */}
            <div className={`w-full md:w-1/2 pl-16 md:pl-0 ${index % 2 === 0 ? 'md:pr-16 md:text-right' : 'md:pl-16 md:text-left'}`}>
                <div>
                    <span className="inline-block px-3 py-1 mb-3 text-xs font-mono font-bold text-emerald-500/80 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                        {item.year}
                    </span>
                    <h3 className="text-2xl font-bold text-white mb-3">
                        {item.title}
                    </h3>
                    <p className="text-slate-400 text-base leading-relaxed">
                        {item.desc}
                    </p>
                </div>
            </div>
        </motion.div>
    );
}

export default YourStory;
