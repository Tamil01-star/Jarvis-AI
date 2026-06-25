import React, { useState, useEffect } from 'react';
import { Settings, Eye, EyeOff, Save, Volume2, HelpCircle, Lock } from 'lucide-react';
import { useAudioSynth } from '../hooks/useAudioSynth';
import { VideoBackgroundHandle } from './VideoBackground';

interface SettingsPanelProps {
  provider: 'gemini' | 'openai' | 'offline';
  setProvider: (p: 'gemini' | 'openai' | 'offline') => void;
  selectedModel: string;
  setSelectedModel: (m: string) => void;
  nickname: string;
  setNickname: (n: string) => void;
  onClose?: () => void;
  videoRef?: React.RefObject<VideoBackgroundHandle>;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  provider,
  setProvider,
  selectedModel,
  setSelectedModel,
  nickname,
  setNickname,
  onClose,
  videoRef,
}) => {
  const { playClick, playSuccess, setMasterVolume } = useAudioSynth();

  const [volume, setVolume] = useState(30);

  // Load volume from localStorage on mount
  useEffect(() => {
    const savedVolume = localStorage.getItem('jarvis_volume');
    if (savedVolume) {
      const vol = parseInt(savedVolume);
      setVolume(vol);
      setMasterVolume(vol / 100);
    }
  }, []);

  const syncSettingsToBackend = async (newProvider: string, newModel: string, newVolume: number) => {
    try {
      const { apiFetch } = await import('../utils/api');
      await apiFetch('/api/settings', {
        method: 'POST',
        body: JSON.stringify({
          nickname,
          provider: newProvider,
          selected_model: newModel,
          volume: newVolume
        })
      });
    } catch (e) {
      console.warn("Failed to sync settings to cloud:", e);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseInt(e.target.value);
    setVolume(vol);
    setMasterVolume(vol / 100);
    videoRef?.current?.setVolume(vol / 100);
    localStorage.setItem('jarvis_volume', vol.toString());
    syncSettingsToBackend(provider, selectedModel, vol);
  };

  const handleProviderChange = (p: 'gemini' | 'openai' | 'offline') => {
    playClick();
    setProvider(p);
    let defaultModel = 'offline-core';
    if (p === 'gemini') defaultModel = 'gemini-2.5-flash';
    else if (p === 'openai') defaultModel = 'gpt-4o';
    
    setSelectedModel(defaultModel);
    syncSettingsToBackend(p, defaultModel, volume);
  };

  return (
    <div className="flex flex-col space-y-5 text-cyber-cyan/95 font-sharetech text-xs select-none p-1">
      {/* Configuration Header */}
      <div className="flex items-center space-x-1 border-b border-cyber-cyan/15 pb-2 mb-1">
        <Settings className="w-4 h-4 text-cyber-cyan animate-spin" style={{ animationDuration: '6s' }} />
        <span className="font-orbitron font-bold tracking-wider">HUD PARAMETERS EDITOR</span>
      </div>

      {/* Profile & Nickname */}
      <div className="flex flex-col space-y-1.5">
        <label className="text-[10px] text-gray-500 uppercase tracking-widest">USER NAME PROFILE</label>
        <input
          type="text"
          value={nickname}
          onChange={(e) => {
            setNickname(e.target.value);
            localStorage.setItem('jarvis_nickname', e.target.value);
          }}
          className="bg-black/40 border border-cyber-cyan/25 rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-cyber-cyan transition-colors"
        />
      </div>

      {/* Master Volume */}
      <div className="flex flex-col space-y-1.5">
        <div className="flex items-center justify-between text-[10px] text-gray-500">
          <span className="uppercase tracking-widest flex items-center">
            <Volume2 className="w-3.5 h-3.5 mr-1" />
            OS AUDITORY FEEDBACK
          </span>
          <span className="text-white">{volume}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={handleVolumeChange}
          className="w-full accent-cyber-cyan bg-cyber-cyan/20 h-1.5 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      {/* AI Synapse Provider */}
      <div className="flex flex-col space-y-1.5">
        <label className="text-[10px] text-gray-500 uppercase tracking-widest">COGNITIVE MODEL NODE</label>
        <div className="grid grid-cols-3 gap-1">
          {(['offline', 'gemini', 'openai'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => handleProviderChange(mode)}
              className={`py-1.5 border rounded uppercase text-[10px] transition-all tracking-wider font-bold ${
                provider === mode
                  ? 'border-cyber-cyan bg-cyber-cyan/15 text-white shadow-neon-cyan'
                  : 'border-cyber-cyan/15 bg-black/35 hover:bg-cyber-cyan/5 hover:border-cyber-cyan/40 text-cyber-cyan/60'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Model Selection Dropdown */}
      {provider !== 'offline' && (
        <div className="flex flex-col space-y-1.5">
          <label className="text-[10px] text-gray-500 uppercase tracking-widest">SELECT ENGINE</label>
          <select
            value={selectedModel}
            onChange={(e) => {
              playClick();
              setSelectedModel(e.target.value);
            }}
            className="bg-black/40 border border-cyber-cyan/25 rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-cyber-cyan tracking-wide font-sharetech select-text"
          >
            {provider === 'gemini' ? (
              <>
                <option value="gemini-2.5-flash">gemini-2.5-flash (Fast)</option>
                <option value="gemini-2.5-pro">gemini-2.5-pro (Creative)</option>
              </>
            ) : (
              <>
                <option value="gpt-4o">gpt-4o (Premium)</option>
                <option value="gpt-4-turbo">gpt-4-turbo (Advanced)</option>
                <option value="gpt-3.5-turbo">gpt-3.5-turbo (Basic)</option>
              </>
            )}
          </select>
        </div>
      )}



      {/* Offline Mode Note */}
      {provider === 'offline' && (
        <div className="bg-cyber-cyan/5 border border-cyber-cyan/10 p-2.5 rounded text-[9px] text-cyber-cyan/60 flex items-start space-x-1.5 leading-relaxed">
          <HelpCircle className="w-5 h-5 text-cyber-cyan flex-shrink-0 mt-0.5" />
          <span>
            Offline fallback core loaded. JARVIS uses built-in diagnostic and response maps. To communicate with real LLMs, switch to OpenAI or Gemini mode and ensure your API keys are set in the .env file.
          </span>
        </div>
      )}
    </div>
  );
};
