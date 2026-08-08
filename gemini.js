const { GoogleGenerativeAI } = require("@google/generative-ai");

let client = null;

function getClient() {
  if (!process.env.GEMINI_API_KEY) {
    const err = new Error(
      "Missing GEMINI_API_KEY. Get a free key at https://aistudio.google.com/app/apikey and add it to backend/.env"
    );
    err.status = 500;
    throw err;
  }
  if (!client) {
    client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return client;
}

// Google retires/renames Gemini models fairly often, so if this stops
// working, check https://ai.google.dev/gemini-api/docs/models for the
// current lineup, or call ListModels with your key to see exactly what's
// available to you:
//   curl "https://generativelanguage.googleapis.com/v1beta/models?key=YOUR_KEY"
//
// We try a small chain of models, newest-and-fastest first, and fall back
// automatically if your key doesn't have access to one of them yet (or it
// gets retired later). This makes the app resilient to Google's frequent
// model churn without you having to edit code.
const MODEL_CANDIDATES = [
  "gemini-3.6-flash", // current fast, free-tier-friendly workhorse (GA July 2026)
  "gemini-3.5-flash-lite",
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
];

let workingModel = null;

/**
 * Sends a prompt to Gemini and returns the raw text response. Tries each
 * candidate model in order until one works, then remembers the winner for
 * subsequent calls.
 */
async function generateText(prompt, { temperature = 0.9 } = {}) {
  const genAI = getClient();
  const candidates = workingModel ? [workingModel, ...MODEL_CANDIDATES] : MODEL_CANDIDATES;

  let lastError = null;
  for (const modelName of candidates) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      });
      workingModel = modelName; // remember what worked
      return result.response.text().trim();
    } catch (err) {
      lastError = err;
      // 404 = model not found/not supported for this key -> try next candidate.
      // Anything else (bad key, quota, etc.) -> stop and surface it immediately.
      const status = err?.status || err?.response?.status;
      if (status !== 404 && !/404/.test(String(err?.message))) {
        throw err;
      }
    }
  }

  const err = new Error(
    `No available Gemini model worked for your API key (tried: ${candidates.join(", ")}). ` +
      `Check https://ai.google.dev/gemini-api/docs/models for current model names, or list your available models at ` +
      `https://generativelanguage.googleapis.com/v1beta/models?key=YOUR_KEY. Original error: ${lastError?.message}`
  );
  err.status = 500;
  throw err;
}

module.exports = { generateText };
