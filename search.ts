import Groq from "groq-sdk";

export default async function handler(req: any, res: any) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { query } = req.body;

  // 1. Input Validation
  if (!query || typeof query !== 'string' || query.length > 100) {
    return res.status(400).json({ error: "Invalid search query." });
  }

  // Initialize Groq
  const groq = new Groq({ 
    apiKey: process.env.GROQ_API_KEY || '',
  });

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
    console.error("Vercel API Search Error:", err);
    res.status(500).json({ error: "Failed to process search." });
  }
}
