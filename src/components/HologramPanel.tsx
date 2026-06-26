import React, { Children } from 'react';
import { motion } from 'framer-motion';

interface HologramPanelProps {
  title: string;
  subtitle?: string;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
  showHeaderScan?: boolean;
  headerAction?: React.ReactNode;
}

export const HologramPanel: React.FC<HologramPanelProps> = ({
  title, subtitle, className = '', style, children, showHeaderScan = false, headerAction,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35 }}
    style={style}
    className={`hud-corners glass-panel rounded-md p-3.5 relative flex flex-col overflow-hidden group ${className}`}
  >
    {/* Corner helpers */}
    <span className="hud-bl" />
    <span className="hud-br" />

    {/* Scan laser */}
    {showHeaderScan && <div className="scanner-laser opacity-30 group-hover:opacity-50 transition-opacity" />}

    {/* Panel header */}
    <div className="flex items-center justify-between border-b border-cyan-500/10 pb-2 mb-3 flex-shrink-0 select-none">
      <div>
        <h3 className="font-orbitron text-[10px] font-bold text-white tracking-[0.18em] uppercase text-glow-cyan">
          {title}
        </h3>
        {subtitle && (
          <p className="font-sharetech text-[7px] text-gray-600 tracking-widest mt-0.5 uppercase">
            // {subtitle}
          </p>
        )}
      </div>
      {/* Actions and Tiny status indicators */}
      <div className="flex items-center space-x-2">
        {headerAction && <div className="flex items-center mr-1 z-10">{headerAction}</div>}
        <div className="flex items-center space-x-1">
          <motion.div className="w-1.5 h-1.5 rounded-full status-dot-online"
            animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity }} />
          <div className="w-2.5 h-0.5 bg-cyan-400/20 rounded-full" />
          <div className="w-1 h-1 border border-cyan-400/30 rounded-sm" />
        </div>
      </div>
    </div>

    {/* Content */}
    <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0">
      {children}
    </div>

    {/* Watermark corner */}
    <span className="absolute bottom-1 right-2 font-sharetech text-[6px] text-cyan-400/15 pointer-events-none select-none uppercase tracking-widest">
      SECURE_NODE
    </span>
  </motion.div>
);
