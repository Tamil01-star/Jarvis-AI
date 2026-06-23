import React, { useRef, forwardRef, useImperativeHandle, useState } from 'react';

export interface VideoBackgroundHandle {
  playIntro: (volume: number) => void;
  startLoopSilent: () => void;
  setVolume: (v: number) => void;
}

interface VideoBackgroundProps {
  mode: 'intro' | 'background';
  onEnded?: () => void;
}

export const VideoBackground = forwardRef<VideoBackgroundHandle, VideoBackgroundProps>(({ mode, onEnded }, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentVolume, setCurrentVolume] = useState(0.3);

  useImperativeHandle(ref, () => ({
    playIntro: (volume: number) => {
      const video = videoRef.current;
      if (!video) return;
      video.loop = false;
      video.muted = false;
      const targetVol = Math.max(0, Math.min(1, volume));
      video.volume = targetVol;
      setCurrentVolume(targetVol);
      
      video.currentTime = 0;
      video.play().catch((err) => {
        console.warn("Autoplay blocked or play failed:", err);
        // Fallback: play muted
        video.muted = true;
        video.play().catch(() => {});
      });
    },
    startLoopSilent: () => {
      const video = videoRef.current;
      if (!video) return;
      video.loop = true;
      video.muted = true;
      video.play().catch(() => {});
    },
    setVolume: (v: number) => {
      const video = videoRef.current;
      if (video) {
        const targetVol = Math.max(0, Math.min(1, v));
        setCurrentVolume(targetVol);
        if (mode === 'intro') {
          video.volume = targetVol;
          video.muted = targetVol === 0;
        }
      }
    },
  }));

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-black">
      <video
        ref={videoRef}
        src="/jarvis_animation.mp4"
        playsInline
        muted
        preload="auto"
        onEnded={onEnded}
        className="absolute inset-0 w-full h-full object-cover"
        style={
          mode === 'intro'
            ? {
                opacity: 1.0,
                filter: 'none',
                transition: 'opacity 1s ease, filter 1s ease',
              }
            : {
                opacity: 0.22,
                filter: 'hue-rotate(185deg) saturate(1.4) brightness(0.55)',
                transition: 'opacity 1s ease, filter 1s ease',
              }
        }
      />
      {/* Overlays are always rendered to allow CSS transitions to work smoothly */}
      {/* Deep dark overlay — keeps holographic UI readable */}
      <div
        className="absolute inset-0 transition-opacity duration-1000"
        style={{ 
          background: 'rgba(3,5,12,0.60)', 
          opacity: mode === 'background' ? 1 : 0 
        }}
      />
      {/* Subtle cyan radial tint at centre */}
      <div
        className="absolute inset-0 transition-opacity duration-1000"
        style={{ 
          background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(0,240,255,0.04) 0%, transparent 70%)',
          opacity: mode === 'background' ? 1 : 0 
        }}
      />
      {/* Bottom vignette so footer panels don't fight the video */}
      <div
        className="absolute bottom-0 left-0 right-0 h-40 transition-opacity duration-1000"
        style={{ 
          background: 'linear-gradient(to top, rgba(3,5,12,0.7) 0%, transparent 100%)',
          opacity: mode === 'background' ? 1 : 0 
        }}
      />
    </div>
  );
});

VideoBackground.displayName = 'VideoBackground';

