import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Radio, Power, Wifi } from 'lucide-react';

interface BrandingHeaderProps {
  nickname: string;
  onLogout: () => void;
  selectedModel: string;
  speechState: 'idle' | 'listening' | 'speaking' | 'processing';
}

export const BrandingHeader: React.FC<BrandingHeaderProps> = ({ nickname, onLogout, selectedModel, speechState }) => {
  const [time, setTime] = useState(new Date());
  const [signalBars, setSignalBars] = useState(4);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    const s = setInterval(() => setSignalBars(3 + Math.floor(Math.random() * 2)), 5000);
    return () => { clearInterval(t); clearInterval(s); };
  }, []);

  const pad = (n: number) => String(n).padStart(2, '0');

  const statusColor = {
    idle: '#00f0ff',
    listening: '#00f0ff',
    speaking: '#0066ff',
    processing: '#ff5d00',
  }[speechState];

  return (
    <header className="relative w-full h-14 border-b border-cyan-500/10 z-40 flex items-center px-5 select-none"
      style={{ background: 'rgba(3,5,12,0.75)', backdropFilter: 'blur(14px)' }}>

      {/* Animated top edge line */}
      <div className="absolute top-0 left-0 right-0 h-px overflow-hidden">
        <motion.div
          className="h-full"
          style={{ background: 'linear-gradient(90deg, transparent 0%, #00f0ff 30%, #0066ff 60%, transparent 100%)' }}
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      {/* LEFT — Branding */}
      <div className="flex items-center space-x-4 flex-shrink-0">
        {/* Marvel badge */}
        <div className="bg-red-600 px-2 py-0.5 text-[10px] font-black tracking-widest text-white border border-red-500/70 rounded-sm flex-shrink-0">
          MARVEL
        </div>

        {/* Arc reactor tiny icon */}
        <div className="relative w-7 h-7 flex-shrink-0">
          <motion.div className="absolute inset-0 border border-cyan-400/50 rounded-full"
            animate={{ rotate: 360 }} transition={{ duration: 6, repeat: Infinity, ease: 'linear' }} />
          <div className="absolute inset-1.5 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-500"
            style={{ boxShadow: '0 0 8px rgba(0,240,255,0.7)' }} />
        </div>

        {/* Stark wordmark */}
        <div className="flex flex-col leading-none">
          <span className="font-orbitron text-[11px] font-black tracking-[0.22em] text-white">
            STARK <span className="text-cyan-400">INDUSTRIES</span>
          </span>
          <span className="font-sharetech text-[7px] text-gray-600 tracking-[0.3em] mt-0.5">
            JARVIS OS ARCHITECTURE v8.42 (DB ENGINE ACTIVE)
          </span>
        </div>

        {/* Avengers badge */}
        <div className="hidden md:flex items-center space-x-1.5 border-l border-cyan-500/10 pl-4">
          <Shield className="w-3 h-3 text-cyan-400/60" />
          <span className="font-sharetech text-[8px] text-cyan-400/50 tracking-widest uppercase">
            Avengers Initiative
          </span>
        </div>
      </div>

      {/* CENTER — AI State indicator */}
      <div className="flex-1 flex items-center justify-center">
        <div className="flex items-center space-x-2 px-3 py-1 rounded border border-white/5 bg-white/2">
          <motion.div
            className="w-2 h-2 rounded-full"
            style={{ background: statusColor, boxShadow: `0 0 6px ${statusColor}` }}
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          />
          <span className="font-orbitron text-[9px] font-bold tracking-widest" style={{ color: statusColor }}>
            JARVIS :: {speechState.toUpperCase()}
          </span>
          <span className="text-gray-700 font-sharetech text-[8px]">|</span>
          <Radio className="w-3 h-3 text-gray-600" />
          <span className="font-sharetech text-[8px] text-gray-500 tracking-widest uppercase">
            {selectedModel === 'offline-core' ? 'LOCAL CORE' : selectedModel}
          </span>
        </div>
      </div>

      {/* RIGHT — Clock + Signal + User */}
      <div className="flex items-center space-x-4 flex-shrink-0">
        {/* Signal bars */}
        <div className="hidden sm:flex items-end space-x-0.5 h-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i}
              className="w-1 rounded-sm transition-all duration-500"
              style={{
                height: `${i * 15}%`,
                background: i <= signalBars ? '#00f0ff' : 'rgba(0,240,255,0.15)'
              }}
            />
          ))}
        </div>

        {/* Network label */}
        <div className="hidden lg:flex flex-col items-end">
          <span className="font-sharetech text-[7px] text-gray-600 tracking-widest uppercase">Stark Net</span>
          <span className="font-sharetech text-[9px] text-cyan-400 tracking-widest">SECURE</span>
        </div>

        {/* Clock */}
        <div className="flex flex-col items-end border-l border-cyan-500/10 pl-4">
          <span className="font-sharetech text-[7px] text-gray-600 tracking-widest uppercase">System Clock</span>
          <span className="font-orbitron text-sm font-bold text-white text-glow-cyan tracking-wider">
            {pad(time.getHours())}:{pad(time.getMinutes())}:{pad(time.getSeconds())}
          </span>
        </div>

        {/* User & logout */}
        <div className="flex items-center space-x-2 border-l border-cyan-500/10 pl-4">
          <div className="flex flex-col items-end">
            <span className="font-sharetech text-[7px] text-gray-600 tracking-widest uppercase">Operator</span>
            <span className="font-orbitron text-[10px] font-bold text-cyan-400 tracking-wide">{nickname || 'GUEST'}</span>
          </div>
          <button
            onClick={onLogout}
            className="btn-neon btn-orange p-1.5 rounded-md"
            title="Shut Down OS"
          >
            <Power className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
