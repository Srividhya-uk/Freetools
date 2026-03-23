import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import Groq from "groq-sdk";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize Groq on the server
  const groq = new Groq({ 
    apiKey: process.env.GROQ_API_KEY || '',
  });

  app.use(express.json());

  // --- SECURITY LAYER: API ENDPOINT ---
  app.post("/api/search", async (req, res) => {
    const { query } = req.body;

    // 1. Input Validation
    if (!query || typeof query !== 'string' || query.length > 100) {
      return res.status(400).json({ error: "Invalid search query." });
    }

    try {
      // 2. Server-side Groq Call (Key is hidden)
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are a helpful assistant that finds the best FREE or OPEN-SOURCE tools. 
            Return exactly 12 tools for the requested category in a JSON array format.
            Each object must have: "name", "rating" (string, e.g. "4.8"), "url", and "simplicityRank" (integer 1-5).
            1: Extremely simple, anyone can use it immediately.
            5: Requires expert-level knowledge or steep learning curve.
            Ensure all tools have a significant free tier or are completely free to use.`
          },
          {
            role: "user",
            content: `List exactly 12 of the best and most popular FREE or OPEN-SOURCE tools for the category: "${query}".`
          }
        ],
        model: "llama-3.3-70b-versatile",
        response_format: { type: "json_object" }
      });

      const content = chatCompletion.choices[0]?.message?.content;
      if (!content) throw new Error("No response from AI");
      
      const parsed = JSON.parse(content);
      const tools = Array.isArray(parsed) ? parsed : (parsed.tools || Object.values(parsed)[0]);

      res.json({ tools });
    } catch (err) {
      console.error("Server-side Search Error:", err);
      res.status(500).json({ error: "Failed to process search." });
    }
  });

  // --- VITE MIDDLEWARE ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SECURITY] Server running on http://localhost:${PORT}`);
    console.log(`[SECURITY] API Key is hidden from client.`);
  });
}

startServer();
