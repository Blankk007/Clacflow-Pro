import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });

const GEMINI_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_KEY) {
  console.error("\n❌  GEMINI_API_KEY missing in .env\n");
  process.exit(1);
}

const app = express();
app.use(express.json({ limit: "2mb" }));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Methods", "POST, OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

// Convert Anthropic-style request to Gemini format
app.post("/api/claude", async (req, res) => {
  try {
    const { messages, system } = req.body;
    
    // Build Gemini contents
    const contents = messages.map(m => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }]
    }));

    const body = {
      ...(system ? { system_instruction: { parts: [{ text: system }] } } : {}),
      contents,
      generationConfig: { temperature: 0.3, maxOutputTokens: 2048 }
    };

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`;
    
    const upstream = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await upstream.json();
    console.log("Gemini status:", upstream.status);
    console.log("Gemini response:", JSON.stringify(data).slice(0, 500));
    
    // Convert Gemini response back to Anthropic format
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || 
                 data?.error?.message ||
                 "Error: no response";
    
    res.json({
      content: [{ type: "text", text }]
    });

  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.use(express.static(path.join(__dirname, "dist")));
app.get("*", (_, res) => res.sendFile(path.join(__dirname, "dist", "index.html")));

app.listen(3001, () => {
  console.log(`\n✅  Server ready at http://localhost:3001`);
  console.log(`   Gemini key: ${GEMINI_KEY.slice(0, 10)}...\n`);
});
