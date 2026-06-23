import React, { useState, useEffect, useRef } from 'react';
import { useAudioSynth } from '../hooks/useAudioSynth';

interface TerminalConsoleProps {
  onCommandTriggered: (commandText: string) => void;
}

export const TerminalConsole: React.FC<TerminalConsoleProps> = ({ onCommandTriggered }) => {
  const { playClick, playKeyboardClick } = useAudioSynth();
  
  const [logs, setLogs] = useState<string[]>([
    "JARVIS OS [VERSION 8.42] CORE ACCESS ESTABLISHED.",
    "TYPE 'help' FOR LIST OF SYSTEM NODE COMMANDS."
  ]);
  const [inputVal, setInputVal] = useState('');
  const logContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const command = inputVal.trim();
    setInputVal('');
    playClick();

    // Log the typed command
    setLogs((prev) => [...prev, `GUEST@STARK_HUD:~$ ${command}`]);

    // Send command to the central command dispatcher
    onCommandTriggered(command);

    // Local echo response
    const cmdLower = command.toLowerCase();
    setTimeout(() => {
      if (cmdLower === 'help') {
        setLogs((prev) => [
          ...prev,
          "  SUPPORTED HUD NODE COMMANDS:",
          "  - 'status' / 'diagnostic' : Trigger comprehensive system scans.",
          "  - 'clear'                 : Flush active terminal frame buffers.",
          "  - 'weather'               : Query regional thermal/wind radar stats.",
          "  - 'time'                  : Query active GPS satellite clock values.",
          "  - 'music'                 : Initiate lab audio frequencies.",
          "  - 'security'              : Toggle firewall threat scanning overrides."
        ]);
      } else if (cmdLower === 'clear') {
        setLogs([]);
      } else if (cmdLower.includes('status') || cmdLower.includes('diagnostic')) {
        setLogs((prev) => [
          ...prev,
          "  [DIAGNOSTIC SCAN INITIATED...]",
          "  STARK NETWORK: SECURE (100%)",
          "  SYNAPSE NODES: ONLINE",
          "  FIREWALL CORE: STEALTH SHIELDS ACTIVE",
          "  CORE TEMP: 42°C (STABLE)"
        ]);
      } else {
        setLogs((prev) => [
          ...prev,
          `  TRANSMITTING COMMAND NODE: [${command.toUpperCase()}]`,
          "  JARVIS: Processing request, sir."
        ]);
      }
    }, 200);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputVal(e.target.value);
    playKeyboardClick();
  };

  return (
    <div className="flex flex-col h-full font-sharetech text-[10px] text-cyber-cyan/70 select-none">
      {/* Scrollable logs area */}
      <div 
        ref={logContainerRef}
        className="flex-1 overflow-y-auto space-y-1.5 custom-scrollbar pr-1 pb-2 h-44"
      >
        {logs.map((log, idx) => (
          <div key={idx} className="leading-relaxed">
            {log.startsWith('GUEST@STARK_HUD') ? (
              <span className="text-white font-bold">{log}</span>
            ) : log.includes('[DIAGNOSTIC') ? (
              <span className="text-cyber-orange text-glow-orange">{log}</span>
            ) : (
              <span>{log}</span>
            )}
          </div>
        ))}
        {/* blinking cursor if terminal is active */}
        <div className="flex items-center space-x-1">
          <span>GUEST@STARK_HUD:~$</span>
          <span className="w-1.5 h-3 bg-cyber-cyan/70 animate-blink" />
        </div>
      </div>

      {/* Terminal prompt input box */}
      <form onSubmit={handleCommandSubmit} className="border-t border-cyber-cyan/10 pt-2 flex items-center">
        <span className="text-cyber-cyan font-bold mr-1">{`>`}</span>
        <input
          type="text"
          value={inputVal}
          onChange={handleInputChange}
          placeholder="Enter shell command (e.g. 'help', 'status')"
          className="flex-1 bg-transparent text-white font-sharetech border-none outline-none focus:ring-0 placeholder-cyber-cyan/25 select-text"
        />
      </form>
    </div>
  );
};
