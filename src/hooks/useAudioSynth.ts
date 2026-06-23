import { useEffect, useRef } from 'react';

export const useAudioSynth = () => {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterVolumeRef = useRef<GainNode | null>(null);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtxRef.current = new AudioContextClass();
      
      const gainNode = audioCtxRef.current.createGain();
      gainNode.gain.setValueAtTime(0.3, audioCtxRef.current.currentTime); // default volume 30%
      gainNode.connect(audioCtxRef.current.destination);
      masterVolumeRef.current = gainNode;
    }

    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  useEffect(() => {
    // Attempt auto-initialization on interaction
    const handleInteraction = () => {
      initAudio();
    };

    window.addEventListener('click', handleInteraction);
    window.addEventListener('keydown', handleInteraction);
    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };
  }, []);

  const playSynthSound = (frequency: number, duration: number, type: OscillatorType = 'sine', peakVolume = 0.1) => {
    initAudio();
    const ctx = audioCtxRef.current;
    const masterVolume = masterVolumeRef.current;
    if (!ctx || !masterVolume) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);

      gain.gain.setValueAtTime(0.01, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(peakVolume, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(masterVolume);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn('Audio synthesis failed:', e);
    }
  };

  const playClick = () => {
    // Short crisp high pitched click
    playSynthSound(1800, 0.05, 'sine', 0.05);
  };

  const playKeyboardClick = () => {
    // Tiny typewriter beep
    playSynthSound(1200 + Math.random() * 400, 0.03, 'sine', 0.03);
  };

  const playBeep = () => {
    // Medium beep
    playSynthSound(900, 0.15, 'sine', 0.08);
  };

  const playSuccess = () => {
    initAudio();
    const ctx = audioCtxRef.current;
    if (!ctx || !masterVolumeRef.current) return;
    
    // Arpeggio
    const now = ctx.currentTime;
    const frequencies = [600, 800, 1200];
    frequencies.forEach((f, i) => {
      setTimeout(() => {
        playSynthSound(f, 0.15, 'sine', 0.06);
      }, i * 80);
    });
  };

  const playSystemBoot = () => {
    initAudio();
    const ctx = audioCtxRef.current;
    const masterVolume = masterVolumeRef.current;
    if (!ctx || !masterVolume) return;

    try {
      const now = ctx.currentTime;

      // 1. Low frequency rising sweep
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(80, now);
      osc1.frequency.exponentialRampToValueAtTime(880, now + 2.0);
      gain1.gain.setValueAtTime(0.01, now);
      gain1.gain.linearRampToValueAtTime(0.12, now + 0.5);
      gain1.gain.exponentialRampToValueAtTime(0.0001, now + 2.0);
      osc1.connect(gain1);
      gain1.connect(masterVolume);
      osc1.start(now);
      osc1.stop(now + 2.0);

      // 2. Futuristic harmonic ringing beep at the peak
      setTimeout(() => {
        playSynthSound(1040, 0.8, 'sine', 0.1);
        setTimeout(() => playSynthSound(1560, 0.4, 'sine', 0.05), 100);
      }, 1800);

    } catch (e) {
      console.warn('Boot sound synthesis failed:', e);
    }
  };

  const playWarning = () => {
    initAudio();
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    // Pulsing siren sound
    const now = ctx.currentTime;
    playSynthSound(380, 0.25, 'sawtooth', 0.08);
    setTimeout(() => {
      playSynthSound(320, 0.25, 'sawtooth', 0.08);
    }, 250);
  };

  const playSonar = () => {
    initAudio();
    const ctx = audioCtxRef.current;
    const masterVolume = masterVolumeRef.current;
    if (!ctx || !masterVolume) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(650, ctx.currentTime);
      // Sweeps slightly down in frequency (classic sonar ping)
      osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 1.2);
      
      gain.gain.setValueAtTime(0.01, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.5);

      osc.connect(gain);
      gain.connect(masterVolume);
      osc.start();
      osc.stop(ctx.currentTime + 1.5);
    } catch (e) {
      console.warn('Sonar sound failed:', e);
    }
  };

  const setMasterVolume = (volume: number) => {
    initAudio();
    if (masterVolumeRef.current && audioCtxRef.current) {
      masterVolumeRef.current.gain.setValueAtTime(
        Math.max(0, Math.min(1, volume)), 
        audioCtxRef.current.currentTime
      );
    }
  };

  return {
    initAudio,
    playClick,
    playBeep,
    playSuccess,
    playSystemBoot,
    playWarning,
    playSonar,
    playKeyboardClick,
    setMasterVolume,
  };
};
