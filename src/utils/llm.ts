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

  // Call the backend API for real LLM requests
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        nickname: nickname || 'Sir',
        message,
        history,
        provider,
        selectedModel: model
      })
    });

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    const data = await response.json();
    return data.reply;
  } catch (error) {
    console.error("Backend request failed:", error);
    return `[SYSTEM ERROR] Sir, connection to the backend node failed. Reverting to local fallback core.`;
  }
};
