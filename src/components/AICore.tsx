import React from 'react';
import { motion } from 'framer-motion';

interface AICoreProps {
  speechState: 'idle' | 'listening' | 'speaking' | 'processing';
  onClick?: () => void;
}

const STATE_CONFIG = {
  idle:       { core: '#00f0ff', glow: 'rgba(0,240,255,0.35)', ring: '#00f0ff', speed: [40, 28, 18], label: 'STANDBY' },
  listening:  { core: '#00f0ff', glow: 'rgba(0,240,255,0.65)', ring: '#00f0ff', speed: [20, 14, 8],  label: 'LISTENING' },
  speaking:   { core: '#0066ff', glow: 'rgba(0,102,255,0.70)', ring: '#4488ff', speed: [8, 5, 3],    label: 'SPEAKING' },
  processing: { core: '#ff5d00', glow: 'rgba(255,93,0,0.65)',  ring: '#ff8800', speed: [10, 7, 4],   label: 'PROCESSING' },
};

export const AICore: React.FC<AICoreProps> = ({ speechState, onClick }) => {
  const cfg = STATE_CONFIG[speechState];

  const pulseAnim = speechState === 'speaking'
    ? { scale: [1, 1.18, 0.95, 1.22, 1] }
    : speechState === 'listening'
    ? { scale: [1, 1.10, 1] }
    : { scale: [1, 1.04, 1] };

  const pulseDuration = speechState === 'speaking' ? 0.45 : speechState === 'listening' ? 1.0 : 2.5;

  return (
    <div
      onClick={onClick}
      className="relative w-72 h-72 flex items-center justify-center cursor-pointer select-none"
      title="Click to toggle voice listening"
    >
      {/* ---- Far background diffuse glow ---- */}
      <motion.div
        className="absolute rounded-full blur-[60px] pointer-events-none"
        style={{ width: 240, height: 240, background: cfg.glow }}
        animate={{ opacity: [0.2, 0.38, 0.2] }}
        transition={{ duration: 3, repeat: Infinity }}
      />

      {/* ---- SVG ring system ---- */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 260 260">
        {/* Outermost dashed ring — slowest CW */}
        <motion.circle cx="130" cy="130" r="120" fill="none"
          stroke={cfg.ring} strokeWidth="0.7" strokeDasharray="30 8 5 8" opacity="0.22"
          animate={{ rotate: 360 }} transition={{ duration: cfg.speed[0], repeat: Infinity, ease: 'linear' }}
          style={{ originX: '130px', originY: '130px' }}
        />
        {/* Tick-marks ring — CCW */}
        <motion.circle cx="130" cy="130" r="108" fill="none"
          stroke={cfg.ring} strokeWidth="1.5" strokeDasharray="2 7" opacity="0.30"
          animate={{ rotate: -360 }} transition={{ duration: cfg.speed[0] * 0.7, repeat: Infinity, ease: 'linear' }}
          style={{ originX: '130px', originY: '130px' }}
        />
        {/* Large arc segment ring — CW */}
        <motion.circle cx="130" cy="130" r="94" fill="none"
          stroke={cfg.ring} strokeWidth="1.2" strokeDasharray="140 50 60 50" opacity="0.40"
          animate={{ rotate: 360 }} transition={{ duration: cfg.speed[1], repeat: Infinity, ease: 'linear' }}
          style={{ originX: '130px', originY: '130px' }}
        />
        {/* Inner fast ring — CCW */}
        <motion.circle cx="130" cy="130" r="78" fill="none"
          stroke={cfg.ring} strokeWidth="0.6" strokeDasharray="12 20" opacity="0.28"
          animate={{ rotate: -360 }} transition={{ duration: cfg.speed[2] * 0.9, repeat: Infinity, ease: 'linear' }}
          style={{ originX: '130px', originY: '130px' }}
        />
        {/* Frame ring — fast CW */}
        <motion.circle cx="130" cy="130" r="64" fill="none"
          stroke={cfg.ring} strokeWidth="2.5" strokeDasharray="55 18 12 18" opacity="0.60"
          animate={{ rotate: 360 }} transition={{ duration: cfg.speed[2], repeat: Infinity, ease: 'linear' }}
          style={{ originX: '130px', originY: '130px' }}
        />
        {/* Inner boundary */}
        <circle cx="130" cy="130" r="52" fill="none" stroke={cfg.ring} strokeWidth="0.5" strokeDasharray="4 4" opacity="0.20" />

        {/* Sweeping highlight beam */}
        <motion.path d="M 88 130 A 42 42 0 0 1 172 130" fill="none"
          stroke={cfg.ring} strokeWidth="2" opacity="0.45"
          animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          style={{ originX: '130px', originY: '130px' }}
        />

        {/* 8 tick lines on outermost ring */}
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i / 8) * 360;
          const rad = angle * (Math.PI / 180);
          const x1 = 130 + 115 * Math.cos(rad);
          const y1 = 130 + 115 * Math.sin(rad);
          const x2 = 130 + 124 * Math.cos(rad);
          const y2 = 130 + 124 * Math.sin(rad);
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={cfg.ring} strokeWidth="2" opacity="0.35" />;
        })}
      </svg>

      {/* ---- Central pulsing energy sphere ---- */}
      <motion.div
        className="relative w-28 h-28 rounded-full flex items-center justify-center"
        style={{
          background: `radial-gradient(circle at 38% 38%, ${cfg.core} 0%, ${cfg.core}66 25%, rgba(5,10,25,0.95) 68%)`,
          boxShadow: `0 0 22px ${cfg.glow}, 0 0 45px ${cfg.glow.replace('0.', '0.0')}`
        }}
        animate={pulseAnim}
        transition={{ duration: pulseDuration, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* Arc reactor style hexagonal inner rings */}
        <motion.div
          className="w-14 h-14 rounded-full border flex items-center justify-center"
          style={{ borderColor: `${cfg.core}55` }}
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        >
          <motion.div
            className="w-8 h-8 rounded-full border-2 flex items-center justify-center"
            style={{ borderColor: cfg.core }}
            animate={{ rotate: -360 }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          >
            <div className="w-3.5 h-3.5 rounded-full" style={{ background: cfg.core, boxShadow: `0 0 10px ${cfg.core}` }} />
          </motion.div>
        </motion.div>

        {/* Orbiting dot */}
        <motion.div
          className="absolute w-full h-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        >
          <div className="absolute top-1 left-1/2 -ml-1 w-2 h-2 rounded-full"
            style={{ background: cfg.core, boxShadow: `0 0 8px ${cfg.core}` }}
          />
        </motion.div>
      </motion.div>

      {/* ---- State label ---- */}
      <div className="absolute -bottom-10 flex flex-col items-center">
        <span className="font-sharetech text-[8px] text-gray-600 tracking-[0.2em] uppercase">AI Core State</span>
        <motion.span
          key={speechState}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-orbitron text-[11px] font-bold tracking-[0.15em] uppercase"
          style={{ color: cfg.core, textShadow: `0 0 8px ${cfg.glow}` }}
        >
          {cfg.label}
        </motion.span>
      </div>
    </div>
  );
};
