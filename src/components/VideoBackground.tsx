import React, { useRef, forwardRef, useImperativeHandle } from 'react';

export interface VideoBackgroundHandle {
  play: () => void;
  setVolume: (v: number) => void;
}

export const VideoBackground = forwardRef<VideoBackgroundHandle>((_, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useImperativeHandle(ref, () => ({
    play: () => {
      const video = videoRef.current;
      if (!video) return;
      // Start muted to guarantee browser allows play, then unmute
      video.muted = false;
      video.volume = 0.25;
      video.play().catch(() => {
        // Fallback: play muted (autoplay policy)
        if (videoRef.current) {
          videoRef.current.muted = true;
          videoRef.current.play().catch(() => {});
        }
      });
    },
    setVolume: (v: number) => {
      if (videoRef.current) {
        videoRef.current.volume = Math.max(0, Math.min(1, v));
        videoRef.current.muted = v === 0;
      }
    },
  }));

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <video
        ref={videoRef}
        src="/jarvis_animation.mp4"
        loop
        playsInline
        muted
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          opacity: 0.28,
          filter: 'hue-rotate(185deg) saturate(1.4) brightness(0.55)',
        }}
      />
      {/* Deep dark overlay — keeps holographic UI readable */}
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(3,5,12,0.60)' }}
      />
      {/* Subtle cyan radial tint at centre */}
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(0,240,255,0.04) 0%, transparent 70%)' }}
      />
      {/* Bottom vignette so footer panels don't fight the video */}
      <div
        className="absolute bottom-0 left-0 right-0 h-40"
        style={{ background: 'linear-gradient(to top, rgba(3,5,12,0.7) 0%, transparent 100%)' }}
      />
    </div>
  );
});

VideoBackground.displayName = 'VideoBackground';
