// components/RealSyllabusBlock.tsx
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router'; // For navigation

interface SyllabusItem {
  id: string;
  topic: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'DONE';
  progress: number;
}

const RealSyllabusBlock = () => {
  const [items, setItems] = useState<SyllabusItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/syllabus');
        const data = await res.json();
        // Check if data is array to avoid crashes if API errors
        if (Array.isArray(data)) setItems(data);
      } catch (e) {
        console.error("Syllabus Load Failed", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleNavigate = (nodeId: string) => {
    // Navigate to the notebook page and open this specific node
    router.push(`/notebook?nodeId=${nodeId}`);
  };

  const getStatusColor = (status: string, progress: number) => {
    if (status === 'DONE') return 'bg-green-500';
    if (status === 'IN_PROGRESS') {
       if (progress > 80) return 'bg-emerald-400';
       if (progress > 50) return 'bg-amber-400';
       return 'bg-amber-500';
    }
    return 'bg-slate-600';
  };

  if (loading) return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-lg h-full animate-pulse">
       <div className="h-6 bg-slate-200 rounded w-1/3 mb-6"></div>
       <div className="space-y-4">
          <div className="h-4 bg-slate-100 rounded w-full"></div>
          <div className="h-4 bg-slate-100 rounded w-full"></div>
          <div className="h-4 bg-slate-100 rounded w-full"></div>
       </div>
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-lg h-full flex flex-col">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800">
        <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
        Syllabus Tracks
      </h3>

      <div className="space-y-5 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
        {items.length === 0 ? (
           <div className="text-sm text-slate-400 text-center py-4">
              No syllabus tracks found.<br/>Create a "Syllabus" node in your Notebook.
           </div>
        ) : items.map((topic) => (
          <div 
            key={topic.id} 
            onClick={() => handleNavigate(topic.id)}
            className="group cursor-pointer hover:bg-slate-50 p-2 rounded-lg -mx-2 transition-colors"
          >
            <div className="flex justify-between text-xs font-semibold mb-1.5">
              <span className="text-slate-700 font-mono group-hover:text-blue-600 transition-colors">
                {topic.topic}
              </span>
              <span className="text-slate-500 text-[10px] uppercase">{topic.progress}%</span>
            </div>
            
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div 
                className={`h-1.5 rounded-full ${getStatusColor(topic.status, topic.progress)} transition-all duration-1000`} 
                style={{ width: `${topic.progress}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RealSyllabusBlock;

// const SyllabusBlock = () => {
//   const topics = [
//     { name: "Adv. Backend (CQRS)", status: "In Progress", progress: 65, color: "bg-amber-500" },
//     { name: "Dist. Systems (Raft/Paxos)", status: "Pending", progress: 10, color: "bg-slate-600" },
//     { name: "Python Internals (GIL)", status: "Done", progress: 100, color: "bg-green-500" },
//     { name: "K8s Operators", status: "Review", progress: 85, color: "bg-blue-500" },
//   ];

//   return (
//     <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-lg h-full flex flex-col justify-between">
//       <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800">
//         <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
//         Syllabus Status
//       </h3>
//       <div className="space-y-4">
//         {topics.map((topic, i) => (
//           <div key={i}>
//             <div className="flex justify-between text-xs font-semibold mb-1">
//               <span className="text-slate-700">{topic.name}</span>
//               <span className={topic.progress === 100 ? "text-green-600" : "text-slate-500"}>{topic.status}</span>
//             </div>
//             <div className="w-full bg-slate-100 rounded-full h-1.5">
//               <div 
//                 className={`h-1.5 rounded-full ${topic.color} transition-all duration-1000`} 
//                 style={{ width: `${topic.progress}%` }}
//               ></div>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };