import { useState, useEffect, useRef } from 'react';

interface UseSpeechOptions {
  onCommandDetected: (command: string) => void;
  onSpeechStateChange?: (state: 'idle' | 'listening' | 'speaking' | 'processing') => void;
  nickname: string;
}

export const useSpeech = ({ onCommandDetected, onSpeechStateChange, nickname }: UseSpeechOptions) => {
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);
  const synthVoiceRef = useRef<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    synthesisRef.current = window.speechSynthesis;

    // Detect browser speech recognition
    const SpeechRecognitionClass = 
      (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition;

    if (SpeechRecognitionClass) {
      setIsSupported(true);
      const rec = new SpeechRecognitionClass();
      rec.continuous = true;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsListening(true);
        onSpeechStateChange?.('listening');
      };

      rec.onend = () => {
        setIsListening(false);
      };

      rec.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setIsListening(false);
          onSpeechStateChange?.('idle');
        }
      };

      rec.onresult = (event: any) => {
        const resultIndex = event.resultIndex;
        const transcript = event.results[resultIndex][0].transcript.trim();
        console.log('Detected Voice Input:', transcript);
        
        onSpeechStateChange?.('processing');
        onCommandDetected(transcript);
      };

      recognitionRef.current = rec;
    }

    // Set voice options when loaded
    const loadVoices = () => {
      if (!synthesisRef.current) return;
      const voices = synthesisRef.current.getVoices();
      const jarvisVoice = 
        voices.find(v => v.lang === 'en-GB' && v.name.toLowerCase().includes('google')) ||
        voices.find(v => v.lang === 'en-GB' && v.name.toLowerCase().includes('male')) ||
        voices.find(v => v.lang === 'en-GB') ||
        voices.find(v => v.lang === 'en-US' && v.name.toLowerCase().includes('male')) ||
        voices.find(v => v.lang === 'en-US') ||
        voices[0];
      
      synthVoiceRef.current = jarvisVoice || null;
    };

    loadVoices();
    if (synthesisRef.current && 'onvoiceschanged' in synthesisRef.current) {
      synthesisRef.current.onvoiceschanged = loadVoices;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthesisRef.current) {
        synthesisRef.current.cancel();
      }
    };
  }, [nickname]);

  const startListening = () => {
    if (!isSupported || !recognitionRef.current) return;
    
    if (synthesisRef.current) {
      synthesisRef.current.cancel();
    }
    setIsSpeaking(false);

    try {
      recognitionRef.current.start();
    } catch (e) {
      console.warn(e);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      onSpeechStateChange?.('idle');
    }
  };

  const speakText = (text: string, onDoneCallback?: () => void) => {
    if (!synthesisRef.current) {
      onDoneCallback?.();
      return;
    }

    const cleanedText = text
      .replace(/\[SYSTEM ERROR\]/gi, 'System warning:')
      .replace(/\[\w+\]/g, '') 
      .replace(/[`*#_]/g, ''); 

    const wasListening = isListening;
    if (wasListening) {
      stopListening();
    }

    synthesisRef.current.cancel();
    setIsSpeaking(true);
    onSpeechStateChange?.('speaking');

    const utterance = new SpeechSynthesisUtterance(cleanedText);
    if (synthVoiceRef.current) {
      utterance.voice = synthVoiceRef.current;
    }

    utterance.rate = 1.05; 
    utterance.pitch = 0.95; 

    utterance.onend = () => {
      setIsSpeaking(false);
      onSpeechStateChange?.('idle');
      onDoneCallback?.();
      
      if (wasListening) {
        startListening();
      }
    };

    utterance.onerror = (e) => {
      console.error('Speech synthesis error:', e);
      setIsSpeaking(false);
      onSpeechStateChange?.('idle');
      onDoneCallback?.();

      if (wasListening) {
        startListening();
      }
    };

    synthesisRef.current.speak(utterance);
  };

  return {
    isSupported,
    isListening,
    isSpeaking,
    startListening,
    stopListening,
    speakText,
  };
};

