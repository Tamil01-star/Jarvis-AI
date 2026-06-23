import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HologramPanel } from './HologramPanel';
import { AICore } from './AICore';
import { BrandingHeader } from './BrandingHeader';
import { SystemStatus } from './SystemStatus';
import { TerminalConsole } from './TerminalConsole';
import { ChatWindow } from './ChatWindow';
import { SettingsPanel } from './SettingsPanel';
import { processLocalSpeechCommand } from '../utils/commands';
import { useAudioSynth } from '../hooks/useAudioSynth';
import { VideoBackgroundHandle } from './VideoBackground';
import { Zap, Globe, Radio, Clock, Cpu, Lock, Battery } from 'lucide-react';

interface DashboardProps {
  nickname: string;
  userAvatar: string | null;
  onLogout: () => void;
  videoRef?: React.RefObject<VideoBackgroundHandle>;
}

/* Small arc-reactor animation component for the center strip */
const ArcReactor: React.FC<{ power: number }> = ({ power }) => (
  <div className="relative w-10 h-10 flex-shrink-0">
    <motion.div
      className="absolute inset-0 rounded-full border border-cyan-400/50"
      animate={{ rotate: 360 }}
      transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
    />
    <motion.div
      className="absolute inset-1 rounded-full border border-dashed border-cyan-300/30"
      animate={{ rotate: -360 }}
      transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
    />
    <div
      className="absolute inset-2.5 rounded-full"
      style={{ background: 'radial-gradient(circle, #00f0ff, #0066ff)', boxShadow: '0 0 10px rgba(0,240,255,0.7)' }}
    />
  </div>
);

/* Floating corner telemetry widgets */
const TelemetryWidget: React.FC<{ icon: React.ReactNode; label: string; value: string; color?: string }> = ({
  icon, label, value, color = '#00f0ff'
}) => (
  <div className="flex items-center space-x-2 bg-black/30 border border-white/5 rounded-md px-2.5 py-1.5">
    <div style={{ color }}>{icon}</div>
    <div className="flex flex-col leading-none">
      <span className="font-sharetech text-[7px] text-gray-600 uppercase tracking-widest">{label}</span>
      <span className="font-orbitron text-[10px] font-bold" style={{ color }}>{value}</span>
    </div>
  </div>
);

export const Dashboard: React.FC<DashboardProps> = ({ nickname, userAvatar, onLogout, videoRef }) => {
  const { playClick, playBeep, playSonar } = useAudioSynth();

  const [provider, setProvider] = useState<'gemini' | 'openai' | 'offline'>(() =>
    (localStorage.getItem('jarvis_provider') as 'gemini' | 'openai' | 'offline') || 'offline'
  );
  const [selectedModel, setSelectedModel] = useState(
    localStorage.getItem('jarvis_model') || 'offline-core'
  );
  const [customNickname, setCustomNickname] = useState(nickname);
  const [speechState, setSpeechState] = useState<'idle' | 'listening' | 'speaking' | 'processing'>('idle');

  const [scanning, setScanning] = useState(false);
  const [arcPower] = useState(100);
  const [localTime, setLocalTime] = useState(new Date());

  /* Persist settings to localStorage when they change */
  useEffect(() => { localStorage.setItem('jarvis_provider', provider); }, [provider]);
  useEffect(() => { localStorage.setItem('jarvis_model', selectedModel); }, [selectedModel]);

  useEffect(() => {
    const t = setInterval(() => setLocalTime(new Date()), 1000);
    // Occasional ambient sonar
    const s = setInterval(() => { if (Math.random() > 0.5) playSonar(); }, 18000);
    return () => { clearInterval(t); clearInterval(s); };
  }, []);

  const handleLocalCommand = (cmd: string) => {
    const result = processLocalSpeechCommand(cmd);
    if (!result) return;
    if (result.actionCode === 'DIAGNOSTIC') {
      setScanning(true);
      playBeep();
      setTimeout(() => setScanning(false), 6000);
    } else if (result.actionCode === 'SHUTDOWN') {
      onLogout();
    }
  };

  const pad2 = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="w-full h-screen flex flex-col relative z-10 overflow-hidden">
      <BrandingHeader
        nickname={customNickname}
        onLogout={onLogout}
        selectedModel={selectedModel}
        speechState={speechState}
      />

      {/* Global diagnostic scan laser overlay */}
      {scanning && <div className="scanner-laser-red z-30 opacity-60" />}

      {/* Main grid — 3 columns on desktop */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 p-3 overflow-hidden">

        {/* ================================================
            LEFT COLUMN
        ================================================ */}
        <div className="lg:col-span-3 flex flex-col space-y-3 overflow-y-auto custom-scrollbar">
          <HologramPanel title="System Telemetry" subtitle="STARK_DIAGNOSTICS" showHeaderScan={scanning} className="flex-shrink-0">
            <SystemStatus />
          </HologramPanel>

          <HologramPanel title="HUD Shell Terminal" subtitle="STARK_CLI" showHeaderScan={scanning} className="flex-shrink-0">
            <TerminalConsole onCommandTriggered={handleLocalCommand} />
          </HologramPanel>
        </div>

        {/* ================================================
            CENTER COLUMN
        ================================================ */}
        <div className="lg:col-span-6 flex flex-col items-center space-y-4">

          {/* Top telemetry strip */}
          <div className="w-full flex items-center justify-between px-2 gap-2 flex-wrap">
            <TelemetryWidget icon={<Radio className="w-3.5 h-3.5" />}  label="Node Link" value="SAT_GRID" />
            <TelemetryWidget icon={<Globe className="w-3.5 h-3.5" />}  label="Coverage" value="GLOBAL" />
            <TelemetryWidget icon={<Clock className="w-3.5 h-3.5" />}  label="Local Time" value={`${pad2(localTime.getHours())}:${pad2(localTime.getMinutes())}`} />
            <TelemetryWidget icon={<Lock className="w-3.5 h-3.5" />}   label="Shield" value="ACTIVE" color="#00ff66" />
          </div>

          {/* AI Core display */}
          <div className="flex-1 flex items-center justify-center relative w-full">
            {/* Background image (arc reactor) as faint overlay */}
            <div
              className="absolute w-48 h-48 rounded-full opacity-5 pointer-events-none"
              style={{ backgroundImage: 'url(/arc_reactor.png)', backgroundSize: 'cover' }}
            />
            <AICore
              speechState={speechState}
              onClick={() => {
                playClick();
                setSpeechState(s => s === 'idle' ? 'listening' : 'idle');
              }}
            />
          </div>

          {/* Arc Reactor power strip */}
          <div className="w-full glass-panel rounded-md px-4 py-3 flex items-center justify-between border border-cyan-500/10">
            <div className="flex items-center space-x-3">
              <ArcReactor power={arcPower} />
              <div className="font-sharetech">
                <div className="text-[10px] text-white tracking-[0.15em] font-bold uppercase">Arc Reactor Grid</div>
                <div className="text-[7px] text-gray-500 tracking-widest">POWER MATRIX v4.02 — CAPACITORS FULL</div>
                <div className="mt-1.5 w-44 h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: 'linear-gradient(90deg, #0066ff, #00f0ff)' }}
                    animate={{ width: `${arcPower}%` }}
                    transition={{ duration: 1 }}
                  />
                </div>
              </div>
            </div>
            <div className="text-right font-sharetech">
              <div className="text-[7px] text-gray-500 uppercase tracking-widest">Energy Output</div>
              <div className="font-orbitron text-lg font-bold text-cyan-300 text-glow-cyan">
                {(arcPower * 10.4).toFixed(0)} <span className="text-[10px]">MW</span>
              </div>
              <div className="flex items-center justify-end space-x-1 mt-0.5">
                <Battery className="w-3 h-3 text-green-400" />
                <span className="text-[8px] text-green-400 font-bold">OPTIMAL</span>
              </div>
            </div>
          </div>
        </div>

        {/* ================================================
            RIGHT COLUMN
        ================================================ */}
        <div className="lg:col-span-3 flex flex-col space-y-3 overflow-y-auto custom-scrollbar">
          <HologramPanel title="OS Cognition Console" subtitle="JARVIS_COMMS" className="flex-[2] min-h-0" showHeaderScan={scanning}>
            <ChatWindow
              nickname={customNickname}
              userAvatar={userAvatar}
              provider={provider}
              selectedModel={selectedModel}
              speechState={speechState}
              setSpeechState={setSpeechState}
              onVoiceCommandLocal={handleLocalCommand}
            />
          </HologramPanel>

          <HologramPanel title="System Parameters" subtitle="CONFIG_VARS" className="flex-shrink-0" showHeaderScan={scanning}>
          <SettingsPanel
              provider={provider}
              setProvider={setProvider}
              selectedModel={selectedModel}
              setSelectedModel={setSelectedModel}
              nickname={customNickname}
              setNickname={setCustomNickname}
              videoRef={videoRef}
            />
          </HologramPanel>
        </div>

      </main>
    </div>
  );
};
