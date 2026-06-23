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
  apiKey: string
): Promise<string> => {
  const queryLower = message.toLowerCase();

  // 1. Offline Mode (Local keyword matcher / default answers)
  if (provider === 'offline' || !apiKey) {
    // Artificial latency for realism
    await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 800));

    // Try keyword matching
    for (const item of keywordResponses) {
      if (item.keywords.some(keyword => queryLower.includes(keyword))) {
        return item.response;
      }
    }

    // Default responses
    const randomIndex = Math.floor(Math.random() * offlineJarvisResponses.length);
    return offlineJarvisResponses[randomIndex];
  }

  // 2. OpenAI Integration
  if (provider === 'openai') {
    try {
      const messages = [
        {
          role: "system",
          content: "You are JARVIS, Tony Stark's premium holographic AI operating system. Speak with a refined, helpful, and highly intelligent tone, addressing the user as 'sir' (or by their name if provided). Keep responses concise, scientific, and slightly witty, fitting the Iron Man/Stark Industries style. Do not write extremely long essays; keep it formatted in a sleek, robotic, structured manner."
        },
        ...history.map(msg => ({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content
        })),
        { role: 'user', content: message }
      ];

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model || "gpt-4o",
          messages: messages,
          max_tokens: 400
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP error ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Unknown error';
      console.error("OpenAI Request failed:", e);
      return `[SYSTEM ERROR] Sir, connection to OpenAI nodes failed: ${errorMessage}. Reverting to local fallback core.`;
    }
  }

  // 3. Gemini Integration
  if (provider === 'gemini') {
    try {
      const formattedHistory = [
        {
          role: 'user',
          parts: [{ text: "System prompt: You are JARVIS, the premium AI operating system for Tony Stark. Speak with a refined, high-intelligence, British-accented assistant vibe. Always call the user 'sir' or by their configured nickname. Keep replies crisp, structured, and informative. Reference Stark Industries tech and sensors if relevant." }]
        },
        ...history.map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        })),
        {
          role: 'user',
          parts: [{ text: message }]
        }
      ];

      // Format role name since Gemini API expects 'model' instead of 'assistant'
      const contents = formattedHistory.map(h => ({
        role: h.role,
        parts: h.parts
      }));

      const modelName = model || "gemini-1.5-flash";
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: contents,
          generationConfig: {
            maxOutputTokens: 400
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP error ${response.status}`);
      }

      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Unknown error';
      console.error("Gemini Request failed:", e);
      return `[SYSTEM ERROR] Sir, connection to Gemini nodes failed: ${errorMessage}. Reverting to local fallback core.`;
    }
  }

  return "Offline. Ready to receive commands.";
};
