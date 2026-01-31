import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ThoughtBrick = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [content, setContent] = useState({
    quote: "INITIALIZING_SYSTEM_HANDSHAKE...",
    author: "KERNEL"
  });
  const [isLoading, setIsLoading] = useState(true);

  // Constants
  const STORAGE_KEY = 'apex_daily_thought';

  // Helper
  const cleanJSON = (text: string) => text.replace(/```json/g, '').replace(/```/g, '').trim();

  // 2. Fetch Logic
  const fetchThought = async () => {
    try {
      setIsLoading(true);
      
      const { data } = await axios.post('/api/chat', {
        message: `Find a new thought.
        You are "The Apex." Find a single "Insight of the Day".
          CRITICAL: The output must be VERY short (max 15 words) to fit a ticker-tape UI.
          
          **Output Format:**
          Return ONLY a single valid JSON object.
          {
            "quote": "Short raw insight.",
            "author": "the Real Author Name"
          }        
        `, 
        systemInstruction: `
          You are "The Apex." Find a single "Insight of the Day".
          CRITICAL: The output must be VERY short (max 15 words) to fit a ticker-tape UI.
          
          **Output Format:**
          Return ONLY a single valid JSON object.
          {
            "quote": "Short raw insight.",
            "author": "the Real Author Name"
          }
        `,
        notFormattedResponse : true
      });

      const parsedData = JSON.parse(cleanJSON(data.response));
      
      setContent({
        quote: parsedData.quote,
        author: parsedData.author
      });

      const today = new Date().toDateString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        date: today,
        data: {
          quote: parsedData.quote,
          author: parsedData.author
        }
      }));

    } catch (error) {
      console.error('Connection lost:', error);
      setContent({
        quote: "CONNECTION_REFUSED.",
        author: "OFFLINE"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const checkCacheAndFetch = async () => {
      const today = new Date().toDateString();
      const cachedString = localStorage.getItem(STORAGE_KEY);

      if (cachedString) {
        try {
          const cached = JSON.parse(cachedString);
          if (cached.date === today && cached.data) {
            setContent(cached.data);
            setIsLoading(false);
            return;
          }
        } catch (e) {
          console.warn("Cache corrupted.");
        }
      }
      await fetchThought();
    };

    checkCacheAndFetch();
  }, []);

  return (
    <>
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); } /* Very subtle float */
        }
        @media (min-width: 768px) {
            .animate-float { animation: float 2s ease-in-out infinite; }
        }
        .animate-blink { animation: blink 1s step-end infinite; }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>

      <div 
        className="relative w-full h-full md:perspective-[1200px] brick-container group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* SHADOW - Very thin and wide */}
        <div className="hidden md:block absolute -bottom-3 left-1/2 -translate-x-1/2 w-[90%] h-3 bg-black rounded-[50%] blur-sm opacity-20 transition-all duration-300 group-hover:scale-90 group-hover:opacity-10"></div>

        {/* BRICK BODY */}
        <div 
          className="
            max-w-sm md:max-w-[500px] mx-auto 
            bg-zinc-800 
            rounded-md
            absolute -bottom-60 -left-5
            transition-all duration-300 ease-out
            border-t border-zinc-700
            animate-float
            transform-none
            shadow-md
            md:rotate-x-6 md:rotate-y-3
            md:group-hover:translate-y-[-4px] 
            md:group-hover:rotate-x-[6deg] 
            md:group-hover:rotate-y-[3deg]
            md:shadow-[0px_4px_0px_#18181b]
            md:group-hover:shadow-[0px_8px_0px_#18181b,0px_15px_15px_rgba(0,0,0,0.5)]
          "
        >
        
          {/* FACEPLATE - Ultra Compact Vertical Padding */}
          <div className="p-1.5 pb-2"> 
            <div className="bg-[#111] rounded border border-zinc-900 shadow-[inset_0_2px_10px_rgba(0,0,0,1)] p-2 relative overflow-hidden min-h-[55px] flex flex-col justify-center">
              
              {/* GLARE */}
              <div className="absolute top-0 right-0 bottom-0 left-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none"></div>

              {/* TOP ROW: Status AND Author (Combined to save vertical space) */}
              <div className="flex items-center justify-between border-b border-zinc-800/50 pb-1 mb-1 relative z-10">
                
                {/* Left: Status */}
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full border border-zinc-950 shadow-inner
                    ${isLoading ? 'bg-yellow-500 animate-blink' : isHovered ? 'bg-orange-500' : 'bg-emerald-700'}
                  `}></div>
                  <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">
                    {isLoading ? 'BOOT' : 'APEX_SYS'}
                  </span>
                </div>

                {/* Right: Author (Moved here from bottom) */}
                <p className="text-zinc-700 text-[9px] font-mono uppercase tracking-wide">
                  {isLoading ? '' : `// ${content.author}`}
                </p>
              </div>

              {/* CONTENT - Horizontal focus */}
              <div className="relative z-10 flex-grow flex items-center">
                <p className={`font-mono text-xs md:text-[13px] w-full truncate ${isLoading ? 'text-zinc-500' : 'text-orange-500/90'}`}>
                  {isLoading ? 'Searching database...' : `"${content.quote}"`}
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ThoughtBrick;