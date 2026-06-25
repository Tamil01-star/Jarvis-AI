export interface MessageItem {
  role: 'user' | 'assistant';
  content: string;
}

const offlineJarvisResponses = [
  "At your service, sir. The core systems are functioning within optimal parameters.",
  "I've updated the telemetry logs. We are currently utilizing 24% of local memory.",
  "Very well, sir. Should I initiate a database search on that topic?",
  "Fascinating. I am monitoring multiple channels, and everything seems to be quiet on the perimeter.",
  "Stark Industries firewall remains impenetrable. No security alerts reported.",
  "I am compiling the files you requested. All modules are green.",
  "Indeed, sir. Tony Stark always advised maintaining a high energy reserve. Battery is at 100%.",
  "Of course. Speech synthesizers are tuned to your convenience. What is our next move?",
  "Scanning regional feeds. No anomalous activities detected in your vicinity."
];

const keywordResponses: { keywords: string[]; response: string }[] = [
  {
    keywords: ["status", "system check", "check status", "diagnostics", "diagnostic"],
    response: "Initiating global system diagnostic. ... CPU telemetry: 34%. RAM load: 5.6 GB. Holographic core: 60 FPS. Firewalls: Active. All secondary protocols are green, sir."
  },
  {
    keywords: ["who are you", "what is jarvis", "about yourself", "identity"],
    response: "I am JARVIS (Just A Rather Very Intelligent System). A custom-designed AI core running on Stark Industries framework, optimized for automation, security, and workspace assistance."
  },
  {
    keywords: ["stark industries", "tony stark", "iron man", "ironman", "marvel"],
    response: "Stark Industries is a multinational industrial conglomerate. JARVIS was initially developed by Tony Stark as a natural-language user interface, later integrated into the Iron Man armors."
  },
  {
    keywords: ["weather", "temperature outside", "rain"],
    response: "Satellite reports suggest local temperature is 24°C (75°F) with clear skies. Wind speed is 12 km/h North-East. Ideal conditions for a test flight, sir."
  },
  {
    keywords: ["time", "clock", "date"],
    response: `According to my telemetry, the current local system time is ${new Date().toLocaleTimeString()} on ${new Date().toLocaleDateString()}.`
  },
  {
    keywords: ["hello", "hi", "hey", "jarvis"],
    response: "Hello, sir. The system is online and ready for commands. What can I do for you today?"
  },
  {
    keywords: ["clear", "reset", "wipe"],
    response: "Understood, sir. Purging temporary logs and clearing the primary display console."
  },
  {
    keywords: ["music", "play song", "soundtrack"],
    response: "Activating audio synthesizer. Playing Stark ambient laboratory frequencies in the background."
  }
];

import { apiFetch } from './api';

// Helper — try one URL and return the parsed JSON reply, or throw
async function tryFetch(url: string, body: object): Promise<string> {
  const response = await apiFetch(url, {
    method: 'POST',
    body: JSON.stringify(body)
  });
  
  if (!response.ok) {
    let errorMsg = `HTTP ${response.status}`;
    try {
      const errData = await response.json();
      if (errData.error) errorMsg += `: ${errData.error}`;
    } catch (e) {
      // Ignore JSON parse error on error response
    }
    throw new Error(errorMsg);
  }
  
  const data = await response.json();
  return data.reply;
}

export const fetchLLMResponse = async (
  message: string,
  history: MessageItem[],
  provider: 'gemini' | 'openai' | 'offline',
  model: string,
  nickname: string
): Promise<string> => {
  // Offline Mode processing (still local for immediate speed if strictly offline)
  if (provider === 'offline') {
    const queryLower = message.toLowerCase();
    await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 800));

    for (const item of keywordResponses) {
      if (item.keywords.some(keyword => queryLower.includes(keyword))) {
        return item.response;
      }
    }
    const randomIndex = Math.floor(Math.random() * offlineJarvisResponses.length);
    return offlineJarvisResponses[randomIndex];
  }

  const payload = {
    nickname: nickname || 'Sir',
    message,
    history,
    provider,
    selectedModel: model
  };

  // Try via Vite proxy first (works when page is served from port 3000)
  // If that 404s/fails, fall back directly to port 5000 (always works locally)
  const urls = ['/api/chat'];
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    urls.push('http://localhost:5000/api/chat');
  }

  let lastErrorMsg = '';

  for (const url of urls) {
    try {
      const reply = await tryFetch(url, payload);
      return reply;
    } catch (err: any) {
      console.warn(`[JARVIS] Attempt via ${url} failed: ${err.message}`);
      lastErrorMsg = err.message;
    }
  }

  return `[SYSTEM ERROR] Sir, the backend connection failed. Detail: ${lastErrorMsg}`;
};
