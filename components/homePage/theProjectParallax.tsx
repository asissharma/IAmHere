import React, { useEffect, useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// --- CONFIGURATION ---
const GITHUB_TOKEN = process.env.NEXT_PUBLIC_GITHUB_TOKEN;
const TARGET_REPOS = [
   "asissharma/IAmHere",
   "asissharma/Book-Store",
   "facebook/react",
   "torvalds/linux"
];

interface RepoData {
   id: number;
   full_name: string;
   name: string;
   description: string;
   html_url: string;
   topics: string[];
   stargazers_count: number;
   forks_count: number;
   language: string;
   readmeContent: string;
}

const ProjectParallax = () => {
   const [cards, setCards] = useState<RepoData[]>([]);

   useEffect(() => {
      const fetchRepoData = async () => {
         try {
            const headers: HeadersInit = { 'Accept': 'application/vnd.github.v3+json' };
            if (GITHUB_TOKEN) headers['Authorization'] = `token ${GITHUB_TOKEN}`;

            const promises = TARGET_REPOS.map(async (repoStr) => {
               try {
                  const metaRes = await fetch(`https://api.github.com/repos/${repoStr}`, { headers });
                  if (!metaRes.ok) return null;
                  const meta = await metaRes.json();

                  const readmeRes = await fetch(`https://api.github.com/repos/${repoStr}/readme`, {
                     headers: { ...headers, 'Accept': 'application/vnd.github.raw' }
                  });
                  const rawReadme = await readmeRes.text();

                  const cleanReadme = rawReadme
                     .replace(`//g`, "")
                     .replace(/<[^>]*>/g, "")
                     .substring(0, 1200);

                  return {
                     id: meta.id,
                     full_name: meta.full_name,
                     name: meta.name,
                     description: meta.description,
                     html_url: meta.html_url,
                     topics: meta.topics?.slice(0, 4) || [],
                     stargazers_count: meta.stargazers_count,
                     forks_count: meta.forks_count,
                     language: meta.language || "System",
                     readmeContent: cleanReadme,
                  };
               } catch (err) { return null; }
            });

            const results = await Promise.all(promises);
            setCards(results.filter(Boolean) as RepoData[]);
         } catch (error) { console.error(error); }
      };
      fetchRepoData();
   }, []);

   return (
      <div className="w-full bg-[#050505] relative pb-40 border-t border-white/5">

         {/* Sticky Header */}
         <div className="sticky top-0 z-0 py-2 bg-[#050505]/90 backdrop-blur-xl border-b border-white/5 mb-2 transition-all duration-500">
            <div className="max-w-[90%] xl:max-w-7xl mx-auto flex items-end justify-between px-4">
               <div>
                  <h2 className="text-xs font-mono text-emerald-500 tracking-[0.2em] uppercase mb-2">
                // SYSTEM_ARCHITECTURE
                  </h2>
                  <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight">
                     Engineering <span className="text-slate-700">Log</span>
                  </h1>
               </div>
               <div className="hidden md:flex items-center gap-2 text-xs font-mono text-slate-500">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  SYNCED_WITH_GITHUB
               </div>
            </div>
         </div>

         <div className="max-w-[95%] xl:max-w-7xl mx-auto relative z-10 px-4 pb-[20vh]">
            {cards.map((card, index) => (
               <RepoCard key={card.id} card={card} index={index} total={cards.length} />
            ))}
         </div>
      </div>
   );
};

const RepoCard = ({ card, index, total }: { card: RepoData; index: number; total: number }) => {
   const [isFlipped, setIsFlipped] = useState(false);
   const [isVisible, setIsVisible] = useState(false);
   const cardRef = useRef<HTMLDivElement>(null);

   // --- 1. ANIMATION TRIGGER ---
   useEffect(() => {
      const observer = new IntersectionObserver(
         ([entry]) => {
            // Trigger animation when card is 10% visible
            setIsVisible(entry.isIntersecting);
         },
         { threshold: 0.1 }
      );
      if (cardRef.current) observer.observe(cardRef.current);
      return () => observer.disconnect();
   }, []);

   // --- 2. PERFECT STACKING ---
   // We use a FIXED top offset for everyone (180px).
   // This ensures they stack perfectly ON TOP of each other, hiding the previous one completely.
   const stickyTop = 150;

   return (
      <div
         ref={cardRef}
         className={`sticky w-full perspective-[2000px] mb-40 transition-all duration-1000 ease-out`}
         style={{
            top: `${stickyTop}px`,
            height: '75vh',
            zIndex: index + 10,
            // --- 3. ENTRANCE ANIMATION ---
            // If not visible, push it down and fade it out.
            // Once visible, it snaps to its natural position.
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(100px) scale(0.95)'
         }}
      >
         <div
            className={`
          relative w-full h-full transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] preserve-3d
          ${isFlipped ? 'rotate-y-180' : ''}
        `}
         >

            {/* ================= FRONT SIDE ================= */}
            <div className="absolute inset-0 backface-hidden">
               <div className="w-full h-full rounded-3xl overflow-hidden bg-[#aaaaaa] border border-white/10 shadow-2xl flex flex-col relative group">

                  {/* Giant Faded Watermark */}
                  <div className="absolute -right-10 -top-10 text-[10rem] font-bold text-black/[0.1] pointer-events-none select-none whitespace-nowrap">
                     {card.name}
                  </div>

                  {/* Top Bar */}
                  <div className="relative z-20 px-8 py-2 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 bg-[#0A0A0A]/80 backdrop-blur-md">
                     <div>
                        <div className="flex items-center gap-3 mb-1">
                           <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                           <span className="font-mono text-[10px] text-blue-400 uppercase tracking-widest">{card.language}</span>
                        </div>
                        <h2 className="text-xl md:text-xl font-bold text-white tracking-tight">{card.name}</h2>
                     </div>

                     <div className="flex items-center gap-4 text-slate-400 font-mono text-xs">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/5">
                           <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z" /></svg>
                           <span className="text-white">{card.stargazers_count}</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/5">
                           <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
                           <span className="text-white">{card.forks_count}</span>
                        </div>
                     </div>
                  </div>

                  {/* Content Area */}
                  <div className="relative flex-1 p-8 overflow-hidden">
                     <p className="text-slate-400 text-lg mb-8 max-w-3xl leading-relaxed">
                        {card.description}
                     </p>

                     <div className="flex flex-wrap gap-2 mb-8">
                        {card.topics.map(topic => (
                           <span key={topic} className="px-2 py-1 text-[10px] font-mono text-slate-500 border border-slate-800 rounded hover:text-white hover:border-slate-600 transition-colors cursor-default">
                              #{topic}
                           </span>
                        ))}
                     </div>

                     <div className="relative h-full pb-20 overflow-hidden mask-fade-bottom">
                        <div className="text-xs font-bold text-slate-600 uppercase mb-4 tracking-widest flex items-center gap-2">
                           <span className="w-4 h-px bg-slate-700"></span>
                           README.md Preview
                        </div>

                        <div className={`prose prose-invert prose-sm max-w-none 
                      prose-p:text-slate-500 prose-p:font-light prose-p:leading-7
                      prose-headings:text-slate-300 prose-headings:font-normal prose-headings:text-base
                      prose-a:text-blue-400 prose-a:no-underline
                      prose-code:text-orange-300 prose-code:bg-transparent prose-code:font-normal
                      prose-ul:list-disc prose-ul:pl-4 prose-li:text-slate-500
                   `}>
                           <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {card.readmeContent}
                           </ReactMarkdown>
                        </div>
                        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#0A0A0A] to-transparent pointer-events-none"></div>
                     </div>
                  </div>

                  {/* Bottom Bar */}
                  <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between z-30">
                     <a
                        href={card.html_url}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-2 text-sm font-bold text-white hover:text-emerald-400 transition-colors group/link"
                     >
                        <span>View Repository</span>
                        <svg className="w-4 h-4 transform group-hover/link:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                     </a>

                     <button
                        onClick={(e) => { e.stopPropagation(); setIsFlipped(true); }}
                        className="px-6 py-3 rounded-full bg-white text-black font-bold text-sm hover:bg-slate-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)] flex items-center gap-2"
                     >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"></path></svg>
                        Architecture
                     </button>
                  </div>

               </div>
            </div>

            {/* ================= BACK SIDE ================= */}
            <div className="absolute inset-0 rotate-y-180 backface-hidden">
               <div className="w-full h-full rounded-3xl overflow-hidden bg-[#080808] border border-blue-900/30 shadow-2xl flex flex-col relative">
                  <div className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-[#0A0A0A]">
                     <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        <span className="font-mono text-blue-400 text-xs tracking-widest uppercase">
                           System Architecture
                        </span>
                     </div>
                     <button
                        onClick={(e) => { e.stopPropagation(); setIsFlipped(false); }}
                        className="px-4 py-2 rounded-full bg-white/5 text-xs text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
                     >
                        Close
                     </button>
                  </div>
                  <div className="flex-1 bg-[#050505] relative flex items-center justify-center p-10">
                     <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `linear-gradient(#1e3a8a 1px, transparent 1px), linear-gradient(90deg, #1e3a8a 1px, transparent 1px)`, backgroundSize: '40px 40px' }}></div>
                     <div className="relative z-10 flex flex-col items-center gap-8 opacity-80 scale-90 md:scale-100 pointer-events-none">
                        <div className="w-32 h-12 rounded border border-slate-700 bg-slate-900/50 flex items-center justify-center text-slate-400 font-mono text-xs">Client</div>
                        <div className="h-8 w-px bg-slate-700"></div>
                        <div className="w-48 h-20 rounded border border-blue-500/50 bg-blue-900/10 flex items-center justify-center text-blue-300 font-mono text-xs shadow-[0_0_30px_rgba(59,130,246,0.1)]">API Gateway</div>
                        <div className="h-8 w-px bg-slate-700"></div>
                        <div className="flex gap-6">
                           <div className="w-24 h-24 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-slate-400 font-mono text-[10px] text-center p-2">{card.language} Service</div>
                           <div className="w-24 h-24 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-slate-400 font-mono text-[10px] text-center p-2">Postgres DB</div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

         </div>
         <style jsx global>{`
        .rotate-y-180 { transform: rotateY(180deg); }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .mask-fade-bottom { mask-image: linear-gradient(to bottom, black 60%, transparent 100%); }
      `}</style>
      </div>
   );
};

export default ProjectParallax;