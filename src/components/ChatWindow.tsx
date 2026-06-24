import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, MicOff, Volume2, VolumeX, Sparkles, ChevronDown } from 'lucide-react';
import { MessageItem, fetchLLMResponse } from '../utils/llm';
import { useSpeech } from '../hooks/useSpeech';
import { useAudioSynth } from '../hooks/useAudioSynth';

interface ChatWindowProps {
  nickname: string;
  userAvatar: string | null;
  provider: 'gemini' | 'openai' | 'offline';
  selectedModel: string;
  speechState: 'idle' | 'listening' | 'speaking' | 'processing';
  setSpeechState: (s: 'idle' | 'listening' | 'speaking' | 'processing') => void;
  onVoiceCommandLocal: (command: string) => void;
}

const WAVE_COLORS: Record<string, string> = {
  idle: '#00f0ff33',
  listening: '#00f0ff',
  speaking: '#0066ff',
  processing: '#ff5d00',
};

const WaveBar: React.FC<{ delay: number; state: string }> = ({ delay, state }) => (
  <motion.div
    className="w-0.5 rounded-full flex-shrink-0"
    style={{ background: WAVE_COLORS[state] || '#00f0ff33', height: 28 }}
    animate={state === 'idle'
      ? { scaleY: 0.15 }
      : { scaleY: [0.15, 1, 0.4, 0.85, 0.2, 1, 0.15] }
    }
    transition={{ duration: 1.1, repeat: Infinity, delay, ease: 'easeInOut' }}
  />
);

export const ChatWindow: React.FC<ChatWindowProps> = ({
  nickname, userAvatar, provider, selectedModel,
  speechState, setSpeechState, onVoiceCommandLocal,
}) => {
  const { playClick, playBeep, playKeyboardClick } = useAudioSynth();

  const [messages, setMessages] = useState<MessageItem[]>([{
    role: 'assistant',
    content: `Systems online. Welcome back, ${nickname}. I am JARVIS — fully operational and standing by for your commands, sir.`,
  }]);
  const [input, setInput] = useState('');
  const [muted, setMuted] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Fetch chat history from the database on mount
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(`/api/history?nickname=${encodeURIComponent(nickname || 'Sir')}`);
        if (res.ok) {
          const dbHistory = await res.json();
          if (dbHistory.length > 0) {
            setMessages(dbHistory);
          }
        }
      } catch (e) {
        console.warn('Could not load history from cloud:', e);
      }
    };
    fetchHistory();
  }, [nickname]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const triggerLLM = async (query: string) => {
    setSpeechState('processing');
    setIsTyping(true);

    const reply = await fetchLLMResponse(query, messages.slice(-6), provider, selectedModel, nickname);

    setIsTyping(false);
    setMessages(p => [...p, { role: 'assistant', content: reply }]);

    if (!muted) speakText(reply);
    else setSpeechState('idle');
  };

  const handleVoiceCommand = (transcript: string) => {
    setMessages(p => [...p, { role: 'user', content: transcript }]);
    playBeep();
    onVoiceCommandLocal(transcript);
    triggerLLM(transcript);
  };

  const { isSupported, isListening, startListening, stopListening, speakText } = useSpeech({
    nickname,
    onCommandDetected: handleVoiceCommand,
    onSpeechStateChange: setSpeechState,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const text = input.trim();
    setInput('');
    playClick();
    setMessages(p => [...p, { role: 'user', content: text }]);
    onVoiceCommandLocal(text);
    triggerLLM(text);
  };

  return (
    <div className="flex flex-col h-full">

      {/* ---- Messages ---- */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 custom-scrollbar">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => {
            const isAI = msg.role === 'assistant';
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.28 }}
                className={`flex items-start space-x-2 ${isAI ? '' : 'flex-row-reverse space-x-reverse'}`}
              >
                {/* Avatar */}
                <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center border text-[9px] font-bold
                  ${isAI
                    ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-400'
                    : 'border-blue-500/40 bg-blue-500/10 text-blue-300'}`}
                >
                  {isAI ? (
                    <Sparkles className="w-3.5 h-3.5" />
                  ) : userAvatar ? (
                    <img src={userAvatar} alt="" className="w-full h-full rounded-full object-cover"
                      onError={e => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${nickname}&background=0066ff&color=fff`; }}
                    />
                  ) : (
                    nickname[0]?.toUpperCase() || 'U'
                  )}
                </div>

                {/* Bubble */}
                <div className={`max-w-[82%] px-3 py-2 rounded-lg font-sharetech text-[10px] leading-relaxed tracking-wide select-text border
                  ${isAI
                    ? 'glass-panel text-cyan-100/90 border-cyan-500/12 rounded-tl-none'
                    : 'bg-blue-900/20 text-white border-blue-500/20 rounded-tr-none'}`}
                >
                  {msg.content}
                </div>
              </motion.div>
            );
          })}

          {/* Typing indicator */}
          {isTyping && (
            <motion.div
              key="typing"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center space-x-2"
            >
              <div className="w-7 h-7 rounded-full border border-cyan-500/40 bg-cyan-500/10 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              </div>
              <div className="glass-panel px-3 py-2 rounded-lg rounded-tl-none border border-cyan-500/12 flex items-center space-x-1">
                {[0, 1, 2].map(i => (
                  <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-cyan-400"
                    animate={{ y: [0, -5, 0] }} transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15 }} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* ---- Waveform area ---- */}
      <div className="border-t border-cyan-500/8 bg-black/20 py-2 px-3 flex flex-col items-center">
        <div className="flex items-center justify-center space-x-0.5 h-8">
          {Array.from({ length: 20 }).map((_, i) => (
            <WaveBar key={i} delay={i * 0.04} state={speechState} />
          ))}
        </div>
        <span className="font-sharetech text-[7px] text-gray-600 tracking-[0.22em] uppercase mt-0.5">
          {speechState === 'idle' ? 'AUDIO LINK IDLE' :
           speechState === 'listening' ? 'VOICE TELEMETRY ACTIVE' :
           speechState === 'speaking' ? 'VOCAL SYNAPSE TRANSMITTING' :
           'AI COGNITIVE NODES PARSING'}
        </span>
      </div>

      {/* ---- Input bar ---- */}
      <form onSubmit={handleSubmit}
        className="border-t border-cyan-500/10 bg-black/30 px-3 py-2.5 flex items-center space-x-2 rounded-b-md"
      >
        {/* Mute toggle */}
        <button type="button" onClick={() => { setMuted(m => !m); playClick(); }}
          className={`p-1.5 rounded border transition-all flex-shrink-0 ${muted ? 'border-gray-800 text-gray-700' : 'border-cyan-500/25 text-cyan-400 hover:border-cyan-400 hover:bg-cyan-400/8'}`}
          title={muted ? 'Unmute JARVIS voice' : 'Mute JARVIS voice'}
        >
          {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
        </button>

        {/* Mic toggle */}
        {isSupported && (
          <button type="button"
            onClick={() => { playClick(); isListening ? stopListening() : startListening(); }}
            className={`p-1.5 rounded border transition-all flex-shrink-0 ${
              isListening
                ? 'border-orange-500/60 text-orange-400 bg-orange-500/10 shadow-[0_0_10px_rgba(255,93,0,0.3)] animate-pulse'
                : 'border-cyan-500/25 text-cyan-400 hover:border-cyan-400 hover:bg-cyan-400/8'
            }`}
            title={isListening ? 'Stop listening' : 'Start voice commands'}
          >
            {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
          </button>
        )}

        {/* Text input */}
        <div className="flex-1 flex border border-cyan-500/18 bg-black/40 rounded-md overflow-hidden focus-within:border-cyan-400/50 focus-within:shadow-[0_0_10px_rgba(0,240,255,0.18)] transition-all">
          <input
            type="text" value={input} onChange={e => { setInput(e.target.value); playKeyboardClick(); }}
            placeholder={isListening ? 'Listening… or type here' : 'Ask JARVIS…'}
            className="flex-1 bg-transparent px-3 py-2 text-[11px] text-white placeholder-gray-700 focus:outline-none font-sharetech select-text"
          />
          <button type="submit" disabled={!input.trim()}
            className="px-3 text-cyan-400 border-l border-cyan-500/15 hover:bg-cyan-400/12 disabled:opacity-25 disabled:pointer-events-none transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
};
