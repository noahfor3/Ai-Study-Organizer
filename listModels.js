import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" }); // ensure it reads your API key

async function listModels() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const result = await fetch("https://generativelanguage.googleapis.com/v1beta/models?key=" + process.env.GEMINI_API_KEY);
    const data = await result.json();

    console.log("✅ Available Gemini models for your key:\n");
    data.models.forEach(m => {
      console.log(`• ${m.name} — supported methods: ${m.supportedGenerationMethods.join(", ")}`);
    });
  } catch (err) {
    console.error("❌ Failed to list models:", err);
  }
}

listModels();
