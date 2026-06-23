import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Fingerprint, ChevronRight, Check } from 'lucide-react';
import { useAudioSynth } from '../hooks/useAudioSynth';

interface BootScreenProps {
  onBootComplete: (nickname: string, userAvatar: string | null) => void;
  onVideoStart?: () => void;
}

const BOOT_LOGS = [
  'STARK INDUSTRIES OS v8.42 — SECURE KERNEL INITIALIZING...',
  'LOADING QUANTUM CRYPTOGRAPHIC HANDSHAKE PROTOCOLS...',
  'NEURAL SYNAPSE CORE: CALIBRATING 847 NODAL PATHWAYS...',
  'HOLOGRAPHIC RENDERING ENGINE: ONLINE AT 144Hz...',
  'VOICE SYNTHESIS MODULE: ENGAGING PAUL-B VOCAL ARRAY...',
  'AI COGNITIVE DATABASE: INDEXING 9.2TB KNOWLEDGE BASE...',
  'STARK SATELLITE GRID: HANDSHAKING — LINK ACQUIRED...',
  'SECURITY PERIMETER: ACTIVE — ZERO THREATS DETECTED...',
  '▓▓▓▓▓▓▓▓▓▓  SYSTEM FULLY OPERATIONAL  ▓▓▓▓▓▓▓▓▓▓',
];

type Phase = 'boot' | 'auth' | 'nickname' | 'launching';

export const BootScreen: React.FC<BootScreenProps> = ({ onBootComplete, onVideoStart }) => {
  const { playClick, playBeep, playSystemBoot, playWarning, playSuccess } = useAudioSynth();

  const [phase, setPhase] = useState<Phase>('boot');
  const [logs, setLogs] = useState<string[]>([]);
  const [loadPct, setLoadPct] = useState(0);

  // Biometric
  const [scanPct, setScanPct] = useState(0);
  const [scanActive, setScanActive] = useState(false); // currently scanning
  const [scanDone, setScanDone] = useState(false);     // completed
  const scanRef = useRef(false);                        // sync ref to avoid stale closure

  // User
  const [googleUser, setGoogleUser] = useState<{ name: string; email: string; avatar: string } | null>(null);
  const [nickname, setNickname] = useState('');
  const [nicknameError, setNicknameError] = useState(false);

  const logContainerRef = useRef<HTMLDivElement>(null);

  /* ── Auto-scroll terminal to bottom ── */
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  /* ── Boot console logger ── */
  useEffect(() => {
    let idx = 0;
    const step = () => {
      if (idx < BOOT_LOGS.length) {
        const currentLog = BOOT_LOGS[idx];
        setLogs(p => [...p, currentLog]);
        setLoadPct(Math.round(((idx + 1) / BOOT_LOGS.length) * 100));
        if (idx < BOOT_LOGS.length - 1) {
          playBeep();
        } else {
          playSuccess();
          setTimeout(() => setPhase('auth'), 800);
        }
        idx++;
        setTimeout(step, 400);
      }
    };
    setTimeout(step, 300);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Biometric scan interval ── */
  useEffect(() => {
    if (!scanActive || scanDone) return;
    let pct = 0;
    const iv = setInterval(() => {
      pct += 3 + Math.random() * 4;
      const rounded = Math.min(100, Math.round(pct));
      setScanPct(rounded);
      if (rounded % 10 === 0) playClick();
      if (rounded >= 100) {
        clearInterval(iv);
        setScanActive(false);
        setScanDone(true);
        scanRef.current = true;
        playSuccess();
        setTimeout(() => setPhase('nickname'), 600);
      }
    }, 70);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanActive]);

  /* ── Start scan (single click/tap – no hold required) ── */
  const handleStartScan = () => {
    if (scanDone || scanActive) return;
    setScanPct(0);
    setScanActive(true);
    playBeep();
  };

  /* ── Google popup ── */
  const handleGoogle = () => {
    playClick();
    const w = 500, h = 560;
    const left = Math.round((screen.width - w) / 2);
    const top  = Math.round((screen.height - h) / 2);
    const popup = window.open('', 'JARVISGoogleLogin',
      `width=${w},height=${h},left=${left},top=${top},resizable=no`);
    if (!popup) {
      alert('Please allow pop-ups for this page to use Google login.');
      return;
    }

    popup.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>Sign in — Google Accounts</title>
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Roboto',sans-serif;background:#f1f3f4;display:flex;align-items:center;justify-content:center;min-height:100vh}
    .card{background:#fff;border-radius:8px;box-shadow:0 2px 18px rgba(0,0,0,.12);padding:36px 32px;width:340px;text-align:center}
    .logo{font-size:22px;font-weight:700;margin-bottom:18px}
    .g-b{color:#4285F4}.g-o{color:#EA4335}.g-y{color:#FBBC05}.g-g{color:#34A853}
    h2{font-size:20px;font-weight:500;margin-bottom:6px;color:#202124}
    p{font-size:13px;color:#5f6368;margin-bottom:22px}
    .acc{display:flex;align-items:center;padding:10px 14px;border:1px solid #dadce0;border-radius:24px;margin:8px 0;cursor:pointer;background:#fff;transition:.18s;text-align:left}
    .acc:hover{background:#f8f9fa;border-color:#bbb}
    .acc img{width:36px;height:36px;border-radius:50%;margin-right:12px;object-fit:cover;flex-shrink:0}
    .name{font-size:14px;font-weight:500;color:#202124}
    .email{font-size:11px;color:#5f6368}
  </style>
</head>
<body>
  <div class="card">
    <div class="logo"><span class="g-b">G</span><span class="g-o">o</span><span class="g-y">o</span><span class="g-g">g</span><span class="g-b">l</span><span class="g-o">e</span></div>
    <h2>Choose an account</h2>
    <p>to continue to <strong>Stark OS&nbsp;/&nbsp;JARVIS</strong></p>

    <div class="acc" onclick="choose('User','user@starklabs.com','https://i.pravatar.cc/80?img=12')">
      <img src="https://i.pravatar.cc/80?img=12"
           onerror="this.src='https://ui-avatars.com/api/?name=User&background=0066ff&color=fff'"/>
      <div><div class="name">User</div><div class="email">user@starklabs.com</div></div>
    </div>

    <div class="acc" onclick="choose('Tony Stark','tony@starkindustries.com','https://i.pravatar.cc/80?img=68')">
      <img src="https://i.pravatar.cc/80?img=68"
           onerror="this.src='https://ui-avatars.com/api/?name=Tony+Stark&background=ff5d00&color=fff'"/>
      <div><div class="name">Tony Stark</div><div class="email">tony@starkindustries.com</div></div>
    </div>

    <div class="acc" onclick="choose('Pepper Potts','pepper@starkindustries.com','https://i.pravatar.cc/80?img=47')">
      <img src="https://i.pravatar.cc/80?img=47"
           onerror="this.src='https://ui-avatars.com/api/?name=Pepper+Potts&background=9d00ff&color=fff'"/>
      <div><div class="name">Pepper Potts</div><div class="email">pepper@starkindustries.com</div></div>
    </div>
  </div>
  <script>
    function choose(name,email,avatar){
      window.opener.postMessage({type:'JARVIS_GOOGLE_AUTH',name,email,avatar},'*');
      window.close();
    }
  </script>
</body>
</html>`);

    const onMsg = (ev: MessageEvent) => {
      if (ev.data?.type !== 'JARVIS_GOOGLE_AUTH') return;
      window.removeEventListener('message', onMsg);
      const { name, email, avatar } = ev.data;
      setGoogleUser({ name, email, avatar });
      setNickname(name.split(' ')[0]);
      playSuccess();
      setPhase('nickname');
    };
    window.addEventListener('message', onMsg);
  };

  /* ── Launch JARVIS ── */
  const handleLaunch = () => {
    if (!nickname.trim()) { setNicknameError(true); playWarning(); return; }
    setNicknameError(false);
    // Start the cinematic video inside the click handler so browser allows audio
    onVideoStart?.();
    playSystemBoot();
    setPhase('launching');
    setTimeout(() => onBootComplete(nickname.trim(), googleUser?.avatar || null), 2800);
  };

  /* ────────────────── RENDER ────────────────── */
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden hex-bg"
      style={{ background: '#03050c' }}>

      {/* CRT scanline overlay */}
      <div className="absolute inset-0 scanline pointer-events-none opacity-25 z-10" />

      {/* Ambient glow blobs */}
      <div className="absolute top-[-25%] left-[-10%] w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(0,240,255,0.06) 0%, transparent 70%)' }} />
      <div className="absolute bottom-[-25%] right-[-10%] w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(255,93,0,0.05) 0%, transparent 70%)' }} />

      {/* Content card */}
      <div className="relative z-20 w-full max-w-[500px] mx-4">

        {/* ══════════════════════════════════════
            PHASE 1 — BOOT CONSOLE
        ══════════════════════════════════════ */}
        <AnimatePresence mode="wait">
          {phase === 'boot' && (
            <motion.div key="boot"
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4 }}
              className="hud-corners glass-panel rounded-lg p-6 flex flex-col space-y-4">
              <span className="hud-bl" /><span className="hud-br" />

              {/* Brand strip */}
              <div className="flex items-center space-x-3 border-b border-cyan-500/10 pb-4">
                <img src="/arc_reactor.png" alt="arc"
                  className="w-10 h-10 rounded-full object-cover opacity-90 flex-shrink-0"
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                <div>
                  <div className="font-orbitron text-[11px] font-black tracking-[0.22em] text-white">
                    STARK <span className="text-cyan-400">INDUSTRIES</span>
                  </div>
                  <div className="font-sharetech text-[8px] text-gray-500 tracking-widest mt-0.5">
                    OS SECURE KERNEL — LOADING...
                  </div>
                </div>
                <div className="ml-auto flex items-center space-x-1.5 flex-shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full status-dot-online" />
                  <span className="font-sharetech text-[8px] text-green-400 tracking-widest">LIVE</span>
                </div>
              </div>

              {/* Terminal scroll area */}
              <div ref={logContainerRef}
                className="h-48 overflow-y-auto custom-scrollbar font-sharetech text-[10px] space-y-1 pr-1">
                {logs.map((l, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`leading-relaxed ${l && l.startsWith('▓') ? 'text-cyan-300 font-bold text-glow-cyan' : 'text-cyan-500/75'}`}>
                    <span className="text-gray-600 mr-1.5 text-[8px]">[{String(i + 1).padStart(2, '0')}]</span>
                    {l}
                  </motion.div>
                ))}
                {/* Blinking cursor */}
                <div className="flex items-center mt-1">
                  <span className="text-cyan-400/50 text-[9px]">{'> '}</span>
                  <span className="w-1.5 h-3 bg-cyan-400/60 ml-0.5 cursor-blink" />
                </div>
              </div>

              {/* Progress bar */}
              <div className="flex items-center space-x-3">
                <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div className="h-full rounded-full"
                    style={{ background: 'linear-gradient(90deg, #0066ff, #00f0ff)' }}
                    animate={{ width: `${loadPct}%` }}
                    transition={{ duration: 0.35 }} />
                </div>
                <span className="font-orbitron text-[10px] text-cyan-400 w-10 text-right tabular-nums">
                  {loadPct}%
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ══════════════════════════════════════
            PHASE 2 — AUTH (Google + Biometric)
        ══════════════════════════════════════ */}
        <AnimatePresence mode="wait">
          {phase === 'auth' && (
            <motion.div key="auth"
              initial={{ opacity: 0, scale: 0.93 }} animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.93 }} transition={{ duration: 0.4 }}
              className="hud-corners glass-panel rounded-lg p-8 flex flex-col items-center space-y-6">
              <span className="hud-bl" /><span className="hud-br" />

              {/* Header */}
              <div className="text-center space-y-1">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <img src="/stark_crest.png" alt="stark"
                    className="w-7 h-7 object-contain opacity-80"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  <span className="font-orbitron text-[8px] text-gray-500 tracking-[0.25em] uppercase">
                    Stark Security Gateway
                  </span>
                </div>
                <h1 className="font-orbitron text-2xl font-black tracking-widest text-white text-glow-cyan">
                  AUTHENTICATION
                </h1>
                <p className="font-sharetech text-[10px] text-gray-500 tracking-widest uppercase">
                  Verify identity to access Stark OS
                </p>
              </div>

              {/* Google sign-in button */}
              <button onClick={handleGoogle}
                className="btn-neon w-64 py-3 px-5 rounded-md flex items-center justify-center space-x-2.5 text-xs">
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.5 0 6.4 1.2 8.7 3.2l6.5-6.5C35.3 2.4 30 0 24 0 14.7 0 6.7 5.5 2.9 13.5l7.6 5.9C12.5 13.2 17.8 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17z"/>
                  <path fill="#FBBC05" d="M10.5 28.6C9.9 26.9 9.5 25 9.5 23s.4-3.9 1-5.6L2.9 11.5A23.8 23.8 0 000 23c0 4 1 7.8 2.9 11.1l7.6-5.5z"/>
                  <path fill="#34A853" d="M24 48c6 0 11-2 14.7-5.4l-7.5-5.8c-2 1.4-4.6 2.2-7.2 2.2-6.2 0-11.5-3.7-13.5-9l-7.6 5.9C6.7 42.5 14.7 48 24 48z"/>
                </svg>
                <span>SIGN IN WITH GOOGLE</span>
              </button>

              {/* Divider */}
              <div className="flex items-center w-60 space-x-3">
                <hr className="flex-1 border-gray-800" />
                <span className="font-sharetech text-[9px] text-gray-600 tracking-widest">OR</span>
                <hr className="flex-1 border-gray-800" />
              </div>

              {/* Biometric pad */}
              <div className="flex flex-col items-center space-y-3">
                {/* Single tap/click to start scan */}
                <button
                  onClick={handleStartScan}
                  disabled={scanDone || scanActive}
                  className={`relative w-28 h-28 rounded-full overflow-hidden border transition-all duration-300 flex items-center justify-center
                    ${scanActive
                      ? 'border-cyan-400 bg-cyan-400/10 shadow-[0_0_24px_rgba(0,240,255,0.45)] cursor-not-allowed'
                      : scanDone
                        ? 'border-green-400 bg-green-400/10 shadow-[0_0_16px_rgba(0,255,102,0.35)] cursor-not-allowed'
                        : 'border-cyan-500/30 hover:border-cyan-400/70 hover:bg-cyan-400/5 cursor-pointer'
                    }`}
                >
                  {scanDone ? (
                    <Check className="w-14 h-14 text-green-400" />
                  ) : (
                    <Fingerprint className={`w-14 h-14 transition-colors ${scanActive ? 'text-cyan-300 animate-pulse' : 'text-cyan-500/50'}`} />
                  )}
                  {scanActive && <div className="scanner-laser" />}
                </button>

                {/* Progress text */}
                <div className="font-sharetech text-[10px] tracking-widest text-center min-h-[16px]">
                  {scanDone ? (
                    <span className="text-green-400 text-glow-green">✓ BIOMETRIC VERIFIED</span>
                  ) : scanActive ? (
                    <span className="text-cyan-300 text-glow-cyan animate-pulse">
                      SCANNING... {scanPct}%
                    </span>
                  ) : (
                    <span className="text-gray-600">CLICK TO SCAN FINGERPRINT</span>
                  )}
                </div>

                {/* Scan progress bar */}
                {(scanActive || scanDone) && (
                  <div className="w-40 h-1 bg-white/5 rounded-full overflow-hidden">
                    <motion.div className="h-full rounded-full"
                      style={{ background: scanDone ? '#00ff66' : 'linear-gradient(90deg,#0066ff,#00f0ff)' }}
                      animate={{ width: `${scanPct}%` }}
                      transition={{ duration: 0.2 }} />
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ══════════════════════════════════════
            PHASE 3 — NICKNAME
        ══════════════════════════════════════ */}
        <AnimatePresence mode="wait">
          {phase === 'nickname' && (
            <motion.div key="nickname"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="hud-corners glass-panel rounded-lg p-8 flex flex-col items-center space-y-6">
              <span className="hud-bl" /><span className="hud-br" />

              {/* Header */}
              <div className="text-center space-y-1">
                <div className="flex items-center justify-center space-x-1.5 text-green-400 mb-2">
                  <Check className="w-4 h-4" />
                  <span className="font-sharetech text-[10px] tracking-widest uppercase">Identity Verified</span>
                </div>
                <h1 className="font-orbitron text-xl font-black text-white tracking-widest text-glow-cyan">
                  CALIBRATE USER PROFILE
                </h1>
                <p className="font-sharetech text-[9px] text-gray-500 tracking-wider uppercase">
                  JARVIS will address you by this name
                </p>
              </div>

              {/* Google avatar */}
              {googleUser && (
                <motion.div className="relative"
                  initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}>
                  <div className="w-16 h-16 rounded-full border-2 border-cyan-400 shadow-[0_0_18px_rgba(0,240,255,0.5)] overflow-hidden">
                    <img src={googleUser.avatar} alt="avatar" className="w-full h-full object-cover"
                      onError={e => {
                        (e.target as HTMLImageElement).src =
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(googleUser.name)}&background=00f0ff&color=000&size=80`;
                      }} />
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-0.5 border-2 border-black">
                    <Check className="w-2.5 h-2.5 text-white" />
                  </div>
                </motion.div>
              )}

              {/* Nickname input */}
              <div className="w-72 space-y-2">
                <label className="font-sharetech text-[9px] text-gray-500 uppercase tracking-widest block">
                  Assign User Codename
                </label>
                <div className={`flex border rounded-md overflow-hidden bg-black/50 transition-all
                  ${nicknameError
                    ? 'border-red-500 shadow-[0_0_10px_rgba(255,0,85,0.35)]'
                    : 'border-cyan-500/25 focus-within:border-cyan-400 focus-within:shadow-[0_0_12px_rgba(0,240,255,0.22)]'}`}>
                  <input
                    autoFocus
                    type="text"
                    value={nickname}
                    onChange={e => { setNickname(e.target.value); setNicknameError(false); }}
                    onKeyDown={e => e.key === 'Enter' && handleLaunch()}
                    placeholder='e.g. "Tamil" or "Sir"'
                    className="flex-1 bg-transparent px-3 py-2.5 text-sm text-white focus:outline-none font-sharetech placeholder-gray-700 select-text"
                  />
                  <button onClick={handleLaunch}
                    className="px-3 text-cyan-400 hover:text-white hover:bg-cyan-400/15 transition-colors border-l border-cyan-500/20 flex-shrink-0">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                {nicknameError && (
                  <p className="font-sharetech text-[9px] text-red-400 tracking-wider">
                    ⚠ Please enter a valid nickname, sir.
                  </p>
                )}
              </div>

              <button onClick={handleLaunch} className="btn-neon px-10 py-2.5 rounded-md text-xs">
                INITIALIZE JARVIS OS
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ══════════════════════════════════════
            PHASE 4 — LAUNCHING
        ══════════════════════════════════════ */}
        <AnimatePresence mode="wait">
          {phase === 'launching' && (
            <motion.div key="launching"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center space-y-8 py-12">

              {/* Spinning arc reactor loader */}
              <div className="relative w-24 h-24">
                <motion.div className="absolute inset-0 border-2 border-cyan-400/50 rounded-full"
                  animate={{ rotate: 360 }} transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }} />
                <motion.div className="absolute inset-2 border border-dashed border-cyan-300/40 rounded-full"
                  animate={{ rotate: -360 }} transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div className="w-10 h-10 rounded-full"
                    style={{ background: 'radial-gradient(circle, #00f0ff 0%, #0066ff 100%)' }}
                    animate={{ scale: [1, 1.35, 1] }}
                    transition={{ duration: 1.1, repeat: Infinity }} />
                </div>
                {/* Pulse ring */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-10 h-10 rounded-full border border-cyan-400/30 pulse-ring" />
                </div>
              </div>

              <div className="text-center font-sharetech space-y-2">
                <div className="text-cyan-300 text-sm tracking-[0.25em] uppercase font-bold text-glow-cyan animate-pulse">
                  SYNAPSE NODES CONNECTING...
                </div>
                <div className="text-gray-500 text-[10px] tracking-widest uppercase">
                  WELCOME ABOARD, {nickname.toUpperCase()}. INITIALIZING WORKSPACE.
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};
