const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');
require('dotenv').config({ path: path.join(__dirname, '../.env') }); // Load root .env for API keys

const app = express();
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests from any localhost port, or no origin (e.g. curl / server-to-server)
    if (!origin || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use((req, res, next) => {
  console.log(`[SERVER] ${req.method} ${req.url}`);
  next();
});
app.use(express.json());

// Helper to get or create a user by nickname
async function getOrCreateUser(nickname) {
  let res = await db.query('SELECT * FROM users WHERE nickname = $1', [nickname]);
  if (res.rows.length === 0) {
    res = await db.query('INSERT INTO users (nickname) VALUES ($1) RETURNING *', [nickname]);
  }
  return res.rows[0];
}

// 1. Get or Create User & Settings
app.post('/api/user', async (req, res) => {
  try {
    const { nickname } = req.body;
    if (!nickname) return res.status(400).json({ error: 'Nickname required' });
    
    const user = await getOrCreateUser(nickname);
    
    // Get settings
    let settingsRes = await db.query('SELECT * FROM settings WHERE user_id = $1', [user.id]);
    if (settingsRes.rows.length === 0) {
      settingsRes = await db.query('INSERT INTO settings (user_id) VALUES ($1) RETURNING *', [user.id]);
    }
    
    res.json({ user, settings: settingsRes.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// 2. Update Settings
app.post('/api/settings', async (req, res) => {
  try {
    const { nickname, provider, selected_model, volume } = req.body;
    const user = await getOrCreateUser(nickname);
    
    await db.query(`
      UPDATE settings 
      SET provider = $1, selected_model = $2, volume = $3, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $4
    `, [provider, selected_model, volume, user.id]);
    
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// 3. Get Chat History
app.get('/api/history', async (req, res) => {
  try {
    const { nickname } = req.query;
    if (!nickname) return res.status(400).json({ error: 'Nickname required' });
    
    const user = await getOrCreateUser(nickname);
    const historyRes = await db.query(`
      SELECT role, content FROM chat_history 
      WHERE user_id = $1 
      ORDER BY id ASC
    `, [user.id]);
    
    res.json(historyRes.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// 4. Chat Endpoint (Calls LLM and Saves to DB)
app.post('/api/chat', async (req, res) => {
  try {
    const { nickname, message, history, provider, selectedModel } = req.body;
    const user = await getOrCreateUser(nickname);
    
    // Save User Message
    await db.query('INSERT INTO chat_history (user_id, role, content) VALUES ($1, $2, $3)', [user.id, 'user', message]);

    // Construct LLM logic natively here or just call the frontend API key logic
    // For simplicity, we process the request on the backend.
    let aiResponse = "Offline fallback. Reverting to local core.";
    let finalApiKey = provider === 'gemini' ? process.env.VITE_GEMINI_API_KEY : process.env.VITE_OPENAI_API_KEY;

    if (provider !== 'offline' && !finalApiKey) {
      aiResponse = `[SYSTEM ALERT] Sir, the ${provider.toUpperCase()} cognitive node is selected, but the API key is missing. Please configure VITE_${provider.toUpperCase()}_API_KEY in the .env file.`;
    } else if (provider === 'gemini') {
      // Gemini API Call
      let modelName = selectedModel || "gemini-2.5-flash";
      if (modelName === "gemini-1.5-flash") modelName = "gemini-2.5-flash";
      if (modelName === "gemini-1.5-pro") modelName = "gemini-2.5-pro";

      const contents = [
        ...history.map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        })),
        { role: 'user', parts: [{ text: message }] }
      ];
      
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${finalApiKey}`;
      const gRes = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: "You are JARVIS, the premium AI operating system for Tony Stark. Speak with a refined, high-intelligence, British-accented assistant vibe. Always call the user 'sir' or by their configured nickname. Keep replies crisp, structured, and informative. Reference Stark Industries tech and sensors if relevant." }]
          },
          contents,
          generationConfig: { maxOutputTokens: 400 }
        })
      });
      if (gRes.ok) {
        let data;
        try {
          data = await gRes.json();
        } catch (jsonErr) {
          throw new Error(`Failed to parse Gemini response JSON: ${jsonErr.message}`);
        }

        if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0]) {
          aiResponse = data.candidates[0].content.parts[0].text;
        } else if (data.promptFeedback && data.promptFeedback.blockReason) {
          aiResponse = `[SYSTEM ALERT] Sir, the cognitive output was blocked by security protocols. Reason: ${data.promptFeedback.blockReason}`;
        } else {
          aiResponse = "[SYSTEM ALERT] Sir, the cognitive node returned an empty response. Please retry.";
        }
      } else {
        let errMsg = "Unknown error";
        try {
          const err = await gRes.json();
          errMsg = err.error?.message || JSON.stringify(err);
        } catch (e) {
          try {
            errMsg = await gRes.text();
          } catch (tErr) {
            errMsg = gRes.statusText || "unreadable error response";
          }
        }
        aiResponse = `[SYSTEM ERROR] ${errMsg}`;
      }
    } else if (provider === 'openai') {
      // OpenAI API Call
      const messages = [
        { role: "system", content: "You are JARVIS, the premium AI operating system for Tony Stark. Speak with a refined, high-intelligence, British-accented assistant vibe. Always call the user 'sir' or by their configured nickname. Keep replies crisp, structured, and informative. Reference Stark Industries tech and sensors if relevant." },
        ...history.map(msg => ({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content
        })),
        { role: 'user', content: message }
      ];
      const oRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${finalApiKey}`
        },
        body: JSON.stringify({
          model: selectedModel || "gpt-4o",
          messages,
          max_tokens: 400
        })
      });
      if (oRes.ok) {
        let data;
        try {
          data = await oRes.json();
        } catch (jsonErr) {
          throw new Error(`Failed to parse OpenAI response JSON: ${jsonErr.message}`);
        }

        if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
          aiResponse = data.choices[0].message.content;
        } else {
          aiResponse = "[SYSTEM ALERT] Sir, the OpenAI cognitive node returned an empty response.";
        }
      } else {
        let errMsg = "Unknown error";
        try {
          const err = await oRes.json();
          errMsg = err.error?.message || JSON.stringify(err);
        } catch (e) {
          try {
            errMsg = await oRes.text();
          } catch (tErr) {
            errMsg = oRes.statusText || "unreadable error response";
          }
        }
        aiResponse = `[SYSTEM ERROR] ${errMsg}`;
      }
    }

    // Save AI Response
    await db.query('INSERT INTO chat_history (user_id, role, content) VALUES ($1, $2, $3)', [user.id, 'assistant', aiResponse]);

    res.json({ reply: aiResponse });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
