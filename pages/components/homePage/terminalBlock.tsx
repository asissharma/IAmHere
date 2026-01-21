import React, { useState, useEffect, useRef } from 'react';

type CommandOutput = {
  type: 'text' | 'success' | 'error' | 'system';
  content: string;
};

// 1. Define the Prop for Navigation
interface TerminalProps {
  onNavigate: (section: string) => void;
}

const TerminalBlock: React.FC<TerminalProps> = ({ onNavigate }) => {
  const [history, setHistory] = useState<CommandOutput[]>([]);
  const [inputVal, setInputVal] = useState('');
  const [isBooting, setIsBooting] = useState(true);
  
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const timeouts = useRef<NodeJS.Timeout[]>([]);

  // --- 1. CONFIGURATION: COMMANDS & NAVIGATION ---
  const commandRegistry: { [key: string]: () => CommandOutput } = {
    help: () => ({
      type: 'system',
      content: 'COMMANDS: [dashboard] [playground] [notebook] [upload] [trial] [clear]',
    }),
    '/': () => ({
        type: 'system',
        content: 'ACCESS GRANTED. TYPE SECTION NAME TO NAVIGATE.',
      }),
    about: () => ({
      type: 'text',
      content: 'Backend Architect focused on scalable systems and high-performance APIs.',
    }),
    
    // --- NAVIGATION COMMANDS (Trigger the Prop) ---
    dashboard: () => {
      onNavigate('dashboard');
      return { type: 'success', content: '>> LOADING DASHBOARD_MODULE...' };
    },
    playground: () => {
      onNavigate('playground');
      return { type: 'success', content: '>> INITIALIZING DSA_ENVIRONMENT...' };
    },
    notebook: () => {
      onNavigate('notebook');
      return { type: 'success', content: '>> OPENING DIGITAL_ARCHIVES...' };
    },
    trial: () => {
      onNavigate('trial'); // Just in case, though you are already here
      return { type: 'success', content: '>> REFRESHING EXPERIMENTAL_BUILD...' };
    },
    upload: () => {
        onNavigate('upload');
        return { type: 'success', content: '>> INITIATING UPLOAD_PROTOCOL...' };
    },
    editor: () => {
        onNavigate('editor');
        return { type: 'success', content: '>> OPENING TEXT_EDITOR...' };
    },
    
    // --- UTILITIES ---
    clear: () => {
      setHistory([]);
      return { type: 'system', content: 'Console cleared.' };
    },
    sudo: () => ({
      type: 'error',
      content: 'PERMISSION DENIED: You are not root.',
    })
  };

  // --- 2. BOOT SEQUENCE ---
  useEffect(() => {
    const lines = [
      "> INITIALIZING: BACKEND_ARCHITECT_PROTOCOL...",
      "> CONNECTING TO: LOCALHOST:3000",
      "> STATUS: READY_TO_DELIVER_IMPACT",
      "> READY. TYPE '/' OR 'help' FOR COMMAND CODES."
    ];

    let currentDelay = 0;

    lines.forEach((line, index) => {
      // Random typing delay for realism
      const delay = Math.random() * 600 + 400; 
      currentDelay += delay;

      const timeout = setTimeout(() => {
        if (!isBooting) return; // Stop if interrupted
        setHistory(prev => [...prev, { type: 'system', content: line }]);
        
        if (index === lines.length - 1) {
          setIsBooting(false);
          setTimeout(() => inputRef.current?.focus(), 100);
        }
      }, currentDelay);

      timeouts.current.push(timeout);
    });

    return () => {
      timeouts.current.forEach(clearTimeout);
    };
  }, []);

  // --- 3. AUTO-SCROLL ---
  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [history, isBooting]);

  // --- 4. HANDLE INTERRUPTION (STOP ON TYPE) ---
  const stopBootSequence = () => {
    if (isBooting) {
      timeouts.current.forEach(clearTimeout);
      setIsBooting(false);
      setHistory(prev => [
        ...prev, 
        { type: 'success', content: "> BOOT_SEQUENCE_ABORTED. SYSTEM READY." },
        { type: 'system', content: "> TYPE '/' FOR CODES." }
      ]);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  // --- 5. HANDLE COMMAND EXECUTION ---
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isBooting) {
        stopBootSequence();
        return;
    }

    if (e.key === 'Enter') {
      const command = inputVal.trim().toLowerCase();
      if (!command) return;

      const newEntry: CommandOutput = { type: 'text', content: `> ${inputVal}` };
      
      let response: CommandOutput;
      if (commandRegistry[command]) {
        response = commandRegistry[command]();
        if (command === 'clear') {
             setHistory([]); 
             setInputVal('');
             return; 
        }
      } else {
        response = { type: 'error', content: `Err: Command '${command}' not found. Type 'help'.` };
      }

      setHistory(prev => [...prev, newEntry, response]);
      setInputVal('');
    }
  };

  return (
    <div className="mac-terminal-container" onClick={() => inputRef.current?.focus()}>
      <div className="mac-terminal-header">
        <div className="traffic-lights">
          <div className="light red"></div>
          <div className="light yellow"></div>
          <div className="light green"></div>
        </div>
        <div className="terminal-title">Kaala Sharma</div>
      </div>
      
      <div className="mac-terminal-body" ref={bodyRef}>
        {/* HISTORY */}
        {history.map((line, index) => (
          <div key={index} className={`terminal-line ${line.type}`}>
            {line.content}
          </div>
        ))}

        {/* INPUT AREA */}
        <div className="input-line">
          <span className="prompt-symbol">{'>'}</span>
          <input
            ref={inputRef}
            type="text"
            className="terminal-input"
            value={inputVal}
            onChange={(e) => {
                setInputVal(e.target.value);
                if (isBooting && e.target.value.length > 0) stopBootSequence();
            }}
            onKeyDown={handleKeyDown}
            autoFocus
            spellCheck={false}
            autoComplete="off"
            placeholder={isBooting ? "Initialize..." : ""}
          />
        </div>
      </div>
    </div>
  );
};

export default TerminalBlock;