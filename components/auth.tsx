import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface AuthProps {
  onSuccess: () => void; // Callback to notify success
  isModal?: boolean;
}

const Auth: React.FC<AuthProps> = ({ onSuccess, isModal = false }) => {
  const [code, setCode] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage('>> VERIFYING_CREDENTIALS...');

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('>> ACCESS_GRANTED. WELCOME_ARCHITECT.');
        setTimeout(() => onSuccess(), 800);
      } else {
        setMessage('>> ACCESS_DENIED. INVALID_TOKEN.');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('>> SYSTEM_ERROR. CONNECTION_LOST.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center ${isModal ? 'h-full w-full' : 'min-h-screen'} bg-[#050505] text-slate-300 font-mono overflow-hidden relative`}>

      {/* Background Matrix/Grid Effect */}
      {!isModal && (
        <div className="absolute inset-0 z-0 opacity-20"
          style={{ backgroundImage: `linear-gradient(#111 1px, transparent 1px), linear-gradient(90deg, #111 1px, transparent 1px)`, backgroundSize: '20px 20px' }}>
        </div>
      )}

      <motion.div
        className="w-full max-w-md z-10 p-1"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-black/80 backdrop-blur-md border border-white/10 rounded-lg shadow-2xl overflow-hidden">

          {/* Terminal Header */}
          <div className="px-4 py-2 bg-white/5 border-b border-white/5 flex items-center justify-between">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
            </div>
            <div className="text-[10px] text-slate-500 uppercase tracking-widest">
              SYSTEM_LOCK
            </div>
          </div>

          <div className="p-8 flex flex-col items-center">
            <div className="mb-6 w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
              <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
            </div>

            <h1 className="text-xl font-bold text-white mb-2 tracking-tight">Restricted Access</h1>
            <p className="text-sm text-slate-500 mb-8 text-center">
              This system is protected. Please enter your access token to verify identity.
            </p>

            <form onSubmit={handleSubmit} className="w-full space-y-4">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500 font-bold">{'>'}</span>
                <input
                  type="password"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="ENTER_PASSCODE"
                  className="w-full bg-black/50 border border-white/10 rounded px-8 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all font-mono placeholder:text-slate-700"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded text-xs font-bold uppercase tracking-widest transition-all duration-300
                            ${loading ? 'bg-slate-800 text-slate-500 cursor-wait' : 'bg-white text-black hover:bg-emerald-400 hover:shadow-[0_0_20px_rgba(52,211,153,0.4)]'}
                        `}
              >
                {loading ? 'AUTHENTICATING...' : 'UNLOCK SYSTEM'}
              </button>
            </form>

            {message && (
              <div className={`mt-6 text-xs font-mono p-2 w-full text-center border rounded 
                        ${message.includes('GRANTED') ? 'text-emerald-400 border-emerald-900/30 bg-emerald-900/10' :
                  message.includes('VERIFYING') ? 'text-blue-400 border-blue-900/30 bg-blue-900/10' :
                    'text-red-400 border-red-900/30 bg-red-900/10'}
                    `}>
                {message}
              </div>
            )}
          </div>

          <div className="px-4 py-2 bg-white/5 border-t border-white/5 flex justify-between text-[9px] text-slate-600 font-mono uppercase">
            <span>ID: GUEST_USER</span>
            <span>SECURE_CONNECTION</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
