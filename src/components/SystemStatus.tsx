import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Cpu, HardDrive, Thermometer, Activity, Wifi, Lock } from 'lucide-react';

interface Metric { label: string; value: number; unit: string; color: string; icon: React.ReactNode; history: number[]; }

const MiniGraph: React.FC<{ history: number[]; color: string }> = ({ history, color }) => {
  const max = Math.max(...history, 1);
  const W = 80, H = 28;
  const pts = history.map((v, i) => `${(i / (history.length - 1)) * W},${H - (v / max) * H}`).join(' ');
  return (
    <svg width={W} height={H} className="overflow-visible">
      <defs>
        <linearGradient id={`g-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" opacity="0.85" />
      <polygon points={`0,${H} ${pts} ${W},${H}`} fill={`url(#g-${color})`} />
    </svg>
  );
};

export const SystemStatus: React.FC = () => {
  const [metrics, setMetrics] = useState<Metric[]>([
    { label: 'CPU Load',   value: 24, unit: '%',  color: '#00f0ff', icon: <Cpu className="w-3.5 h-3.5"         />, history: [15,18,24,20,28,24,22,26,24] },
    { label: 'RAM Usage',  value: 54, unit: '%',  color: '#4488ff', icon: <HardDrive className="w-3.5 h-3.5"  />, history: [48,50,52,50,54,53,54,55,54] },
    { label: 'GPU Temp',   value: 46, unit: '°C', color: '#ff5d00', icon: <Thermometer className="w-3.5 h-3.5"/>, history: [44,45,46,45,47,46,46,46,46] },
    { label: 'Net Pulse',  value: 12, unit: 'ms', color: '#00ff66', icon: <Activity className="w-3.5 h-3.5"   />, history: [11,13,12,14,12,11,12,13,12] },
  ]);

  useEffect(() => {
    const iv = setInterval(() => {
      setMetrics(prev => prev.map((m, i) => {
        const delta = (Math.random() - 0.5) * (i === 2 ? 4 : i === 3 ? 6 : 12);
        const next = Math.max(5, Math.min(i === 2 ? 90 : i === 3 ? 300 : 98, m.value + delta));
        return { ...m, value: Math.round(next), history: [...m.history.slice(1), Math.round(next)] };
      }));
    }, 2000);
    return () => clearInterval(iv);
  }, []);

  const [threats, setThreats] = useState('ZERO');
  const [uptime, setUptime] = useState(0);
  useEffect(() => {
    const uv = setInterval(() => setUptime(s => s + 1), 1000);
    return () => clearInterval(uv);
  }, []);
  const fmtUptime = (s: number) => `${String(Math.floor(s/3600)).padStart(2,'0')}:${String(Math.floor((s%3600)/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  return (
    <div className="flex flex-col space-y-3 font-sharetech text-[10px]">
      {metrics.map((m, i) => (
        <motion.div
          key={m.label}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.08 }}
          className="bg-black/25 border border-white/5 rounded-md p-2.5 hover:border-white/10 transition-colors"
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center space-x-1.5" style={{ color: m.color }}>
              {m.icon}
              <span className="uppercase tracking-wider">{m.label}</span>
            </div>
            <div className="flex items-end space-x-3">
              <MiniGraph history={m.history} color={m.color} />
              <span className="font-orbitron font-bold text-white text-xs w-12 text-right">
                {m.value}{m.unit}
              </span>
            </div>
          </div>
          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${m.color}99, ${m.color})` }}
              animate={{ width: `${Math.min(100, m.label === 'GPU Temp' ? (m.value/90)*100 : m.label === 'Net Pulse' ? Math.min(m.value/300*100,100) : m.value)}%` }}
              transition={{ duration: 0.6 }}
            />
          </div>
        </motion.div>
      ))}

      {/* Security & Uptime strip */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <div className="bg-black/25 border border-white/5 rounded-md p-2 flex flex-col items-center">
          <Lock className="w-3.5 h-3.5 text-green-400 mb-1" />
          <span className="text-[7px] text-gray-600 tracking-widest uppercase">Threats</span>
          <span className="font-orbitron text-[10px] font-bold text-green-400 text-glow-green">{threats}</span>
        </div>
        <div className="bg-black/25 border border-white/5 rounded-md p-2 flex flex-col items-center">
          <Wifi className="w-3.5 h-3.5 text-cyan-400 mb-1" />
          <span className="text-[7px] text-gray-600 tracking-widest uppercase">Uptime</span>
          <span className="font-orbitron text-[10px] font-bold text-cyan-400">{fmtUptime(uptime)}</span>
        </div>
      </div>
    </div>
  );
};
