import React, { useState, useEffect, useRef } from 'react';
import { BootScreen } from './components/BootScreen';
import { Dashboard } from './components/Dashboard';
import { BackgroundEffects } from './components/BackgroundEffects';
import { VideoBackground, VideoBackgroundHandle } from './components/VideoBackground';

export const App: React.FC = () => {
  const [booted, setBooted] = useState(false);
  const [nickname, setNickname] = useState('');
  const [userAvatar, setUserAvatar] = useState<string | null>(null);

  // Store user info during cinematic playback so we can sign in when the video ends
  const [pendingBootInfo, setPendingBootInfo] = useState<{ name: string; avatar: string | null } | null>(null);
  const [videoMode, setVideoMode] = useState<'intro' | 'background'>('intro');

  // Ref to the cinematic video so we can start it from within a user-gesture callback
  const videoRef = useRef<VideoBackgroundHandle>(null);

  useEffect(() => {
    // Attempt auto-recovery of session if nickname is cached
    const cachedNickname = localStorage.getItem('jarvis_nickname');
    if (cachedNickname) {
      // Keep state initialized, but still require boot interface click to comply with Web Audio autoplay browser restrictions
    }
  }, []);

  // Called by BootScreen's "INITIALIZE JARVIS OS" button — INSIDE the click handler
  // so the browser allows unmuted video playback.
  const handleVideoStart = (name: string, avatar: string | null) => {
    setPendingBootInfo({ name, avatar });
    setVideoMode('intro');
    const savedVolume = localStorage.getItem('jarvis_volume');
    const vol = savedVolume ? parseInt(savedVolume) / 100 : 0.3;
    videoRef.current?.playIntro(vol);
  };

  const handleVideoEnded = () => {
    setVideoMode('background');
    videoRef.current?.startLoopSilent();
    if (pendingBootInfo) {
      handleBootComplete(pendingBootInfo.name, pendingBootInfo.avatar);
    }
  };

  const handleBootComplete = (name: string, avatar: string | null) => {
    setNickname(name);
    setUserAvatar(avatar);
    localStorage.setItem('jarvis_nickname', name);
    setBooted(true);
  };

  const handleShutdown = () => {
    setBooted(false);
    setUserAvatar(null);
    setPendingBootInfo(null);
    setVideoMode('intro');
  };

  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-cyber-bg text-white font-sans">
      {/* Cinematic fullscreen video background — always mounted so it preloads */}
      <VideoBackground
        ref={videoRef}
        mode={videoMode}
        onEnded={handleVideoEnded}
      />

      {/* Immersive 60FPS Canvas overlay (grid, mouse trails, sonar sweeps) on top of video */}
      <BackgroundEffects />

      {/* Screen view routers */}
      {booted ? (
        <Dashboard
          nickname={nickname}
          userAvatar={userAvatar}
          onLogout={handleShutdown}
          videoRef={videoRef}
        />
      ) : (
        <BootScreen
          onBootComplete={handleBootComplete}
          onVideoStart={handleVideoStart}
        />
      )}
    </div>
  );
};

export default App;
