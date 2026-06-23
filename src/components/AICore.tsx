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
      <svg className="absolute inset-0 w-full h-full drop-shadow-lg" viewBox="0 0 260 260">
        {/* Outermost tech ring */}
        <motion.circle cx="130" cy="130" r="124" fill="none"
          stroke={cfg.ring} strokeWidth="2" strokeDasharray="6 4 12 4 4 4" opacity="0.3"
          animate={{ rotate: 360 }} transition={{ duration: cfg.speed[0], repeat: Infinity, ease: 'linear' }}
          style={{ originX: '130px', originY: '130px' }}
        />
        {/* Thick segmented frame ring */}
        <motion.circle cx="130" cy="130" r="112" fill="none"
          stroke={cfg.ring} strokeWidth="8" strokeDasharray="45 15 25 15" opacity="0.6"
          animate={{ rotate: -360 }} transition={{ duration: cfg.speed[0] * 0.8, repeat: Infinity, ease: 'linear' }}
          style={{ originX: '130px', originY: '130px' }}
        />
        {/* Medium dashed ring */}
        <motion.circle cx="130" cy="130" r="98" fill="none"
          stroke={cfg.ring} strokeWidth="1" strokeDasharray="1 6" opacity="0.5"
          animate={{ rotate: 360 }} transition={{ duration: cfg.speed[1], repeat: Infinity, ease: 'linear' }}
          style={{ originX: '130px', originY: '130px' }}
        />
        {/* Solid glowing boundary ring */}
        <circle cx="130" cy="130" r="86" fill="none" stroke={cfg.ring} strokeWidth="3" opacity="0.8" style={{ filter: `drop-shadow(0 0 5px ${cfg.glow})` }} />
        
        {/* Inner gears/segments */}
        <motion.circle cx="130" cy="130" r="76" fill="none"
          stroke={cfg.ring} strokeWidth="12" strokeDasharray="12 4" opacity="0.4"
          animate={{ rotate: -360 }} transition={{ duration: cfg.speed[2], repeat: Infinity, ease: 'linear' }}
          style={{ originX: '130px', originY: '130px' }}
        />

        {/* 4 Crosshairs extending outward */}
        {Array.from({ length: 4 }).map((_, i) => {
          const angle = (i / 4) * 360;
          const rad = angle * (Math.PI / 180);
          const x1 = 130 + 130 * Math.cos(rad);
          const y1 = 130 + 130 * Math.sin(rad);
          const x2 = 130 + 145 * Math.cos(rad);
          const y2 = 130 + 145 * Math.sin(rad);
          return <line key={`cross-${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={cfg.ring} strokeWidth="1.5" opacity="0.5" />;
        })}
      </svg>

      {/* ---- Central pulsing energy sphere ---- */}
      <motion.div
        className="relative w-36 h-36 rounded-full flex items-center justify-center"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${cfg.core}22 0%, rgba(5,10,25,0.85) 70%)`,
          boxShadow: `inset 0 0 30px ${cfg.glow}, 0 0 22px ${cfg.glow}, 0 0 60px ${cfg.glow.replace('0.', '0.0')}`
        }}
        animate={pulseAnim}
        transition={{ duration: pulseDuration, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* Thick glowing core pupil */}
        <motion.div
          className="w-16 h-16 rounded-full border-4 flex items-center justify-center"
          style={{ borderColor: cfg.core, boxShadow: `0 0 20px ${cfg.core}, inset 0 0 15px ${cfg.core}` }}
          animate={{ rotate: 360, scale: speechState === 'listening' ? [1, 1.1, 1] : 1 }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          {/* Innermost dot */}
          <div className="w-6 h-6 rounded-full" style={{ background: cfg.core, boxShadow: `0 0 15px ${cfg.core}` }} />
        </motion.div>

        {/* Orbiting satellite dot */}
        <motion.div
          className="absolute w-full h-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
        >
          <div className="absolute top-2 left-1/2 -ml-1.5 w-3 h-3 rounded-full"
            style={{ background: cfg.core, boxShadow: `0 0 10px ${cfg.core}` }}
          />
        </motion.div>
      </motion.div>

      {/* ---- State label ---- */}
      <div className="absolute -bottom-12 flex flex-col items-center">
        <span className="font-sharetech text-[9px] text-cyan-500/80 tracking-[0.25em] uppercase">Core Telemetry</span>
        <motion.span
          key={speechState}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-orbitron text-[13px] font-bold tracking-[0.15em] uppercase mt-0.5"
          style={{ color: cfg.core, textShadow: `0 0 10px ${cfg.glow}` }}
        >
          {cfg.label}
        </motion.span>
      </div>
    </div>
  );
};
