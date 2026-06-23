const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');
require('dotenv').config({ path: path.join(__dirname, '../.env') }); // Load root .env for API keys

const app = express();
app.use(cors());
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
      const modelName = selectedModel || "gemini-1.5-flash";
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
        const data = await gRes.json();
        aiResponse = data.candidates[0].content.parts[0].text;
      } else {
        const err = await gRes.json();
        aiResponse = \`[SYSTEM ERROR] \${err.error?.message}\`;
      }
    } else if (provider === 'openai') {
      // OpenAI API Call
      const messages = [
        { role: "system", content: "You are JARVIS..." },
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
          "Authorization": \`Bearer \${finalApiKey}\`
        },
        body: JSON.stringify({
          model: selectedModel || "gpt-4o",
          messages,
          max_tokens: 400
        })
      });
      if (oRes.ok) {
        const data = await oRes.json();
        aiResponse = data.choices[0].message.content;
      } else {
        const err = await oRes.json();
        aiResponse = \`[SYSTEM ERROR] \${err.error?.message}\`;
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
app.listen(PORT, () => console.log(\`Server running on port \${PORT}\`));
