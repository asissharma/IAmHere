// components/RealRecentCommitsBlock.tsx
import React, { useEffect, useState } from 'react';

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

  // --- Helper: Relative Time (e.g., "2h ago") ---
  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  useEffect(() => {
    const fetchCommits = async () => {
      try {
        // --- UPDATED URL HERE ---
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

  return (
    <div className="bg-slate-900 text-slate-200 p-6 rounded-xl border border-slate-800 shadow-lg h-full font-mono text-sm flex flex-col">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-white">
        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        Recent Commits
      </h3>

      {/* LIST CONTAINER */}
      <ul className="space-y-4 flex-1 overflow-hidden">
        
        {/* LOADING STATE */}
        {loading && Array.from({ length: 4 }).map((_, i) => (
           <li key={i} className="flex gap-3 items-start animate-pulse">
             <div className="mt-1.5 min-w-[6px] h-[6px] rounded-full bg-slate-700"></div>
             <div className="flex-1 space-y-2">
                <div className="h-3 bg-slate-800 rounded w-3/4"></div>
                <div className="flex justify-between">
                   <div className="h-2 bg-slate-800 rounded w-12"></div>
                   <div className="h-2 bg-slate-800 rounded w-8"></div>
                </div>
             </div>
           </li>
        ))}

        {/* DATA STATE */}
        {!loading && commits.map((c, i) => (
          <li key={i} className="flex gap-3 items-start group">
            {/* The Blue Dot */}
            <div className="mt-1.5 min-w-[6px] h-[6px] rounded-full bg-blue-500 group-hover:bg-blue-400 group-hover:shadow-[0_0_8px_rgba(96,165,250,0.6)] transition-all"></div>
            
            <div className="flex-1 min-w-0">
              
              {/* Repo Name */}
              <div className="text-[10px] text-slate-500 mb-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                {c.repo}
              </div>

              {/* Commit Message */}
              <div className="text-slate-300 group-hover:text-white transition-colors truncate" title={c.msg}>
                {c.msg}
              </div>
              
              {/* Meta Row: Time & Hash */}
              <div className="flex justify-between mt-1 text-xs text-slate-500">
                <span>{formatTimeAgo(c.date || c.time)}</span>
                <span className="font-mono bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 group-hover:text-blue-300 transition-colors">
                    #{c.hash}
                </span>
              </div>
            </div>
          </li>
        ))}

        {/* EMPTY STATE */}
        {!loading && commits.length === 0 && (
           <li className="text-slate-500 text-center italic mt-10">
              No public commits found recently.
              <br/><span className="text-xs">Time to push code.</span>
           </li>
        )}
      </ul>
    </div>
  );
};

export default RealRecentCommitsBlock;


// const RecentCommitsBlock = () => {
//   const commits = [
//     { msg: "feat: async crawler integration", time: "2h ago", hash: "8a2f9d" },
//     { msg: "fix: docker memory leak", time: "5h ago", hash: "4b3c2e" },
//     { msg: "chore: update portfolio assets", time: "1d ago", hash: "9f8e1a" },
//     { msg: "refactor: redis caching layer", time: "2d ago", hash: "1d2c3b" },
//   ];

//   return (
//     <div className="bg-slate-900 text-slate-200 p-6 rounded-xl border border-slate-800 shadow-lg h-full font-mono text-sm flex flex-col">
//       <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-white">
//         <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
//         Recent Commits
//       </h3>
//       <ul className="space-y-4 flex-1">
//         {commits.map((c, i) => (
//           <li key={i} className="flex gap-3 items-start group">
//             <div className="mt-1.5 min-w-[6px] h-[6px] rounded-full bg-blue-500 group-hover:bg-blue-400"></div>
//             <div className="flex-1">
//               <div className="text-slate-300 group-hover:text-white transition-colors truncate">
//                 {c.msg}
//               </div>
//               <div className="flex justify-between mt-1 text-xs text-slate-500">
//                 <span>{c.time}</span>
//                 <span className="font-mono bg-slate-800 px-1 rounded text-slate-400">#{c.hash}</span>
//               </div>
//             </div>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };