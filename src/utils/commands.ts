export interface CommandResult {
  textResponse: string;
  actionCode?: 'DIAGNOSTIC' | 'CLEAR' | 'MUSIC' | 'WEATHER' | 'TIME' | 'SHUTDOWN' | 'MAP';
}

export const processLocalSpeechCommand = (transcript: string): CommandResult | null => {
  const normalized = transcript.toLowerCase().trim();

  // 1. Diagnostic Scanner Commands
  if (
    normalized.includes('diagnostic') || 
    normalized.includes('system check') || 
    normalized.includes('status check') ||
    normalized.includes('scan status')
  ) {
    return {
      textResponse: "Initiating multi-channel system diagnostic. CPU loading is stabilized at twenty-four percent. Firewall layers are fully active. Security threats: zero. All modules are green, sir.",
      actionCode: 'DIAGNOSTIC'
    };
  }

  // 2. Clear Screen / Reset HUD
  if (
    normalized.includes('clear console') || 
    normalized.includes('clear screen') || 
    normalized.includes('clear chat') || 
    normalized.includes('clear terminal') ||
    normalized.includes('reset hud')
  ) {
    return {
      textResponse: "Understood, sir. Purging temporary logs and clearing the primary display console.",
      actionCode: 'CLEAR'
    };
  }

  // 3. Audio / Ambient Frequencies
  if (
    normalized.includes('play music') || 
    normalized.includes('play song') || 
    normalized.includes('ambient frequency') || 
    normalized.includes('laboratory noise')
  ) {
    return {
      textResponse: "Activating laboratory sound synthesizer. Initiating ambient backing tracks, sir.",
      actionCode: 'MUSIC'
    };
  }

  // 4. Weather Details
  if (
    normalized.includes('weather') || 
    normalized.includes('temperature') || 
    normalized.includes('is it raining')
  ) {
    return {
      textResponse: "Scanning meteorological satellite links. Local condition shows twenty-four degrees Celsius, winds at twelve kilometers per hour. A perfect day for flight testing, sir.",
      actionCode: 'WEATHER'
    };
  }

  // 5. System Clock Time
  if (
    normalized.includes('what time') || 
    normalized.includes('current time') || 
    normalized.includes('time check')
  ) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return {
      textResponse: `Sir, the current local telemetry clock is showing ${timeStr}.`,
      actionCode: 'TIME'
    };
  }

  // 6. Security Lock / Shut down
  if (
    normalized.includes('lock system') || 
    normalized.includes('shut down') || 
    normalized.includes('boot down') || 
    normalized.includes('system lock')
  ) {
    return {
      textResponse: "Understood, sir. Initiating secure terminal lock and deactivating workspace feeds.",
      actionCode: 'SHUTDOWN'
    };
  }

  // 7. Locate Map
  if (
    normalized.includes('locate') || 
    normalized.includes('show map') || 
    normalized.includes('find me') ||
    normalized.includes('gps coordinates')
  ) {
    return {
      textResponse: "Aligning global satellite telemetry grids. Pinpointing location metrics on the world map module now.",
      actionCode: 'MAP'
    };
  }

  // Not a local command, pass to LLM
  return null;
};
