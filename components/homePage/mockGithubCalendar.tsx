// components/RealGithubCalendar.tsx
import React, { useEffect, useState } from 'react';

// Types for the API response
interface ContributionDay {
  contributionCount: number;
  date: string;
}

interface ContributionWeek {
  contributionDays: ContributionDay[];
}

interface CalendarData {
  totalContributions: number;
  weeks: ContributionWeek[];
}

const RealGithubCalendar = () => {
  const [data, setData] = useState<CalendarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Fallback "Mock" data for loading state (preserves layout stability)
  const skeletonWeeks = 52;
  const skeletonDays = 7;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/githubContributions');
        if (!res.ok) throw new Error('Failed to fetch');
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Utility to determine color intensity
  const getColor = (count: number) => {
    if (count === 0) return "bg-slate-800/50";
    if (count <= 3) return "bg-green-900/80";
    if (count <= 6) return "bg-green-700";
    return "bg-green-500";
  };

  return (
    <div className="w-full bg-slate-900 rounded-xl p-6 border border-slate-800 shadow-2xl">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-slate-200 font-mono text-sm font-bold flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${error ? 'bg-red-500' : 'bg-green-500'} ${loading ? 'animate-pulse' : ''}`}></span>
          {loading ? 'fetching_data...' : 'contribution_graph.json'}
        </h3>
        <div className="text-xs text-slate-500 font-mono hidden sm:block">
          {loading ? '---' : data?.totalContributions} contributions in the last year
        </div>
      </div>
      
      {/* Scrollable Container */}
      <div className="overflow-x-auto pb-2 custom-scrollbar direction-rtl">
        <div className="flex gap-[3px] min-w-max">
          
          {/* LOADING STATE: Render Skeleton */}
          {loading && Array.from({ length: skeletonWeeks }).map((_, wIndex) => (
            <div key={wIndex} className="flex flex-col gap-[3px]">
              {Array.from({ length: skeletonDays }).map((_, dIndex) => (
                 <div 
                   key={dIndex} 
                   className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm bg-slate-800/30 animate-pulse"
                 />
              ))}
            </div>
          ))}

          {/* REAL DATA STATE */}
          {!loading && data && data.weeks.map((week, wIndex) => (
            <div key={wIndex} className="flex flex-col gap-[3px]">
              {week.contributionDays.map((day, dIndex) => (
                <div 
                  key={`${wIndex}-${dIndex}`} 
                  title={`${day.contributionCount} contributions on ${day.date}`}
                  className={`
                    w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm 
                    ${getColor(day.contributionCount)} 
                    hover:border hover:border-white/20 hover:scale-125 transition-transform
                    cursor-pointer
                  `}
                />
              ))}
            </div>
          ))}

        </div>
      </div>

      <div className="flex justify-end items-center gap-2 mt-2 text-[10px] text-slate-500 font-mono">
        <span>Less</span>
        <div className="w-2 h-2 bg-slate-800/50 rounded-sm"></div>
        <div className="w-2 h-2 bg-green-900/80 rounded-sm"></div>
        <div className="w-2 h-2 bg-green-700 rounded-sm"></div>
        <div className="w-2 h-2 bg-green-500 rounded-sm"></div>
        <span>More</span>
      </div>
    </div>
  );
};

export default RealGithubCalendar;


// const MockGithubCalendar = () => {
//   // Generates a random pattern similar to a contribution graph
//   const weeks = 52;
//   const days = 7;
  
//   return (
//     <div className="w-full bg-slate-900 rounded-xl p-6 border border-slate-800 shadow-2xl">
//       <div className="flex justify-between items-center mb-4">
//         <h3 className="text-slate-200 font-mono text-sm font-bold flex items-center gap-2">
//           <span className="w-2 h-2 rounded-full bg-green-500"></span>
//           contrib_graph.json
//         </h3>
//         <div className="text-xs text-slate-500 font-mono hidden sm:block">1,243 contributions in 2025</div>
//       </div>
      
//       {/* Scrollable Container for Mobile/Tablet robustness */}
//       <div className="overflow-x-auto pb-2 custom-scrollbar">
//         <div className="flex gap-[3px] min-w-max">
//           {Array.from({ length: weeks }).map((_, wIndex) => (
//             <div key={wIndex} className="flex flex-col gap-[3px]">
//               {Array.from({ length: days }).map((_, dIndex) => {
//                 const rand = Math.random();
//                 let colorClass = "bg-slate-800/50"; 
//                 if (rand > 0.85) colorClass = "bg-green-500"; 
//                 else if (rand > 0.65) colorClass = "bg-green-700"; 
//                 else if (rand > 0.45) colorClass = "bg-green-900/80"; 
                
//                 return (
//                   <div 
//                     key={`${wIndex}-${dIndex}`} 
//                     className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm ${colorClass} hover:border hover:border-white/20`}
//                   />
//                 );
//               })}
//             </div>
//           ))}
//         </div>
//       </div>
//       <div className="flex justify-end items-center gap-2 mt-2 text-[10px] text-slate-500 font-mono">
//         <span>Less</span>
//         <div className="w-2 h-2 bg-slate-800/50 rounded-sm"></div>
//         <div className="w-2 h-2 bg-green-900/80 rounded-sm"></div>
//         <div className="w-2 h-2 bg-green-700 rounded-sm"></div>
//         <div className="w-2 h-2 bg-green-500 rounded-sm"></div>
//         <span>More</span>
//       </div>
//     </div>
//   );
// };