import React from 'react';

const TurntableBrick = () => {
  const date = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  const thought = "Design is not just what it looks like and feels like. Design is how it works.";
  const author = "Steve Jobs";

  return (
    // UPDATED CONTAINER: 
    // - Added 'min-h-screen' to ensure full background coverage
    // - Changed 'justify-center' to 'justify-start' for Left Alignment
    // - Increased padding to 'p-20' for nice spacing from the left edge
    <div className="flex items-center justify-start bg-neutral-800 p-20">
      
      {/* THE BRICK BLOCK */}
      <div 
        className="
          relative 
          w-[400px] h-[520px] 
          bg-[#222529] 
          rounded-sm
          border-b-[16px] border-r-[16px] border-b-[#111315] border-r-[#0c0e10]
          shadow-[0_20px_25px_-5px_rgba(0,0,0,0.6),_25px_35px_60px_-15px_rgba(0,0,0,0.5)]
        "
      >
        {/* Subtle top edge highlight for realism (Rim light) */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-white/10 z-20"></div>
        <div className="absolute left-0 top-0 h-full w-[1px] bg-white/5 z-20"></div>

        {/* --- TOP SECTION: TURNTABLE MECHANISM --- */}
        <div className="h-[340px] relative p-6">
          
          {/* The Platter (Silver circle) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-2/3 -translate-y-1/2 w-64 h-64 rounded-full shadow-[inset_0_0_20px_rgba(0,0,0,0.5),_5px_10px_20px_rgba(0,0,0,0.4)] bg-gradient-to-tr from-neutral-300 via-neutral-100 to-neutral-300 flex items-center justify-center">
            {/* Vinyl texture rings */}
            <div className="w-[98%] h-[98%] rounded-full opacity-60 bg-[repeating-radial-gradient(#dddddd_0px,#dddddd_1px,#cccccc_2px,#cccccc_3px)]"></div>
            
            {/* Center Spindle Cap */}
            <div className="absolute w-16 h-16 rounded-full bg-gradient-to-b from-neutral-200 to-neutral-400 shadow-[2px_4px_10px_rgba(0,0,0,0.3)] flex items-center justify-center">
               <div className="w-2 h-2 rounded-full bg-neutral-500 shadow-inner"></div>
            </div>
          </div>

          {/* The Tonearm Assembly */}
          <div className="absolute right-8 top-12 bottom-12 w-20 flex flex-col items-center">
            {/* Top Pivot Box */}
            <div className="relative w-16 h-20 bg-neutral-300 shadow-lg rounded-sm flex flex-col items-center justify-center z-10 border-b-4 border-neutral-400">
               <div className="w-10 h-10 rounded-full border-4 border-neutral-200 bg-neutral-100 shadow-inner"></div>
               {/* Side knob */}
               <div className="absolute -right-2 top-4 w-4 h-6 bg-neutral-400 rounded-sm shadow-md"></div>
            </div>

            {/* The Arm (Long silver tube) */}
            <div className="w-3 h-48 bg-gradient-to-r from-neutral-200 via-white to-neutral-300 shadow-[4px_4px_10px_rgba(0,0,0,0.5)] z-20 -mt-2"></div>

            {/* The Needle/Head */}
            <div className="w-8 h-12 bg-neutral-200 rounded-sm shadow-md z-20 flex items-center justify-center">
               <div className="w-1 h-3 bg-neutral-800 mt-8"></div>
            </div>
            
            {/* Arm Rest/Lever */}
            <div className="absolute bottom-20 -right-2 w-8 h-1 bg-neutral-400"></div>
          </div>
          
          {/* Top Branding */}
          <div className="absolute top-6 left-6">
            <div className="w-8 h-1 bg-neutral-800 shadow-[inset_1px_1px_2px_rgba(0,0,0,1)] mb-2"></div>
          </div>
          
          <div className="absolute bottom-6 left-6 text-[8px] text-neutral-500 font-mono tracking-widest opacity-50">
            MINIMALIST AUDIO CORP<br/>
            MODEL: DAY-DREAMER
          </div>

        </div>

        {/* --- SEPARATOR GROOVE --- */}
        <div className="h-[2px] bg-black/60 shadow-[0_1px_0_rgba(255,255,255,0.05)] mx-0"></div>


        {/* --- BOTTOM SECTION: THOUGHT OF THE DAY --- */}
        <div className="h-[160px] p-8 flex flex-row justify-between items-start relative overflow-hidden">
            
            {/* Text Content Area */}
            <div className="flex-1 pr-6 z-10">
                <h3 className="text-[10px] font-bold tracking-[0.2em] text-neutral-500 uppercase mb-3">
                  {date}
                </h3>
                
                <p className="text-neutral-200 text-sm font-light leading-relaxed font-sans tracking-wide">
                  "{thought}"
                </p>
                
                <p className="text-neutral-500 text-[10px] mt-3 font-mono">
                  — {author}
                </p>
            </div>

            {/* Right Side Control Interface */}
            <div className="w-12 h-full flex flex-col justify-end items-center gap-4 border-l border-neutral-700/50 pl-4">
                
                {/* Vertical Slider Indicator */}
                <div className="w-1 h-12 bg-neutral-800 rounded-full relative shadow-inner">
                    <div className="absolute top-1/2 -translate-y-1/2 -left-[2px] w-2 h-1 bg-red-500/80 shadow-[0_0_5px_rgba(255,50,50,0.4)]"></div>
                </div>

                {/* Subtle LED buttons */}
                <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#3a3a3a] shadow-[inset_0_1px_3px_rgba(0,0,0,0.8)] border border-neutral-700 flex items-center justify-center">
                       {/* Inactive LED */}
                    </div>
                    <div className="w-3 h-3 rounded-full bg-[#3a3a3a] shadow-[inset_0_1px_3px_rgba(0,0,0,0.8)] border border-neutral-700 flex items-center justify-center">
                       {/* Active LED (Very subtle orange hint) */}
                       <div className="w-1 h-1 bg-orange-500/50 rounded-full shadow-[0_0_4px_rgba(255,165,0,0.8)]"></div>
                    </div>
                </div>
            </div>

            {/* Decorative Grid/Vent in corner */}
            <div className="absolute bottom-4 left-4 w-4 h-4 border border-neutral-600 opacity-30 grid grid-cols-2 grid-rows-2 gap-[1px]">
               <div className="bg-neutral-600"></div><div className="bg-transparent"></div>
               <div className="bg-transparent"></div><div className="bg-neutral-600"></div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default TurntableBrick;