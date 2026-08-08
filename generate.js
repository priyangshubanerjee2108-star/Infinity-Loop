const express = require("express");
const router = express.Router();

const { generateText } = require("./gemini");
const { buildPrompt } = require("./prompts");
const { buildImageUrl } = require("./pollinations");
const TEXT_MODES = new Set([
  "caption",
  "hashtag",
  "blog",
  "script",
  "story",
  "movie",
  "content",
]);

/**
 * POST /api/generate/text
 * body: { mode: "caption"|"hashtag"|"blog"|"script"|"story"|"movie"|"content",
 *         topic: string, tone?: string, platform?: string, count?: number }
 */
router.post("/text", async (req, res, next) => {
  try {
    const { mode, topic, tone, platform, count } = req.body || {};

    if (!TEXT_MODES.has(mode)) {
      return res.status(400).json({
        error: `Invalid mode. Expected one of: ${[...TEXT_MODES].join(", ")}`,
      });
    }
    if (!topic || !topic.trim()) {
      return res.status(400).json({ error: "topic is required" });
    }

    const prompt = buildPrompt(mode, topic.trim(), { tone, platform, count });
    const text = await generateText(prompt);

    res.json({ mode, topic, result: text });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/generate/image
 * body: { topic: string, width?: number, height?: number, enhance?: boolean }
 *
 * Uses Gemini to turn a rough idea into a rich image prompt, then renders
 * it via Pollinations.ai's free, keyless image API.
 */
router.post("/image", async (req, res, next) => {
  try {
    const { topic, width, height, enhance = true } = req.body || {};
    if (!topic || !topic.trim()) {
      return res.status(400).json({ error: "topic is required" });
    }

    let finalPrompt = topic.trim();
    if (enhance) {
      const promptForPrompt = buildPrompt("image-prompt", finalPrompt);
      finalPrompt = await generateText(promptForPrompt, { temperature: 0.8 });
    }

    const imageUrl = buildImageUrl(finalPrompt, { width, height });
    res.json({ topic, enhancedPrompt: finalPrompt, imageUrl });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/generate/video
 * body: { topic: string }
 *
 * NOTE: Truly free, keyless text-to-video generation doesn't exist yet.
 * This endpoint uses Gemini to produce a full director-ready concept
 * (storyboard, shots, style, music cues) so you get a usable creative
 * brief instantly. Wire in Veo / Runway / Pika here once you have a
 * paid key — the route shape won't need to change.
 */
router.post("/video", async (req, res, next) => {
  try {
    const { topic } = req.body || {};
    if (!topic || !topic.trim()) {
      return res.status(400).json({ error: "topic is required" });
    }

    const prompt = buildPrompt("video-concept", topic.trim());
    const concept = await generateText(prompt);

    res.json({
      topic,
      concept,
      note:
        "Free-tier video rendering isn't available yet, so Zenith AI generated a full storyboard/concept instead. Plug a paid video model (e.g. Veo, Runway, Pika) into backend/routes/generate.js to render actual clips.",
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/generate/music
 * body: { topic: string }
 *
 * Same reasoning as /video — no free keyless music-generation API exists,
 * so Gemini produces a complete track concept/brief instead.
 */
router.post("/music", async (req, res, next) => {
  try {
    const { topic } = req.body || {};
    if (!topic || !topic.trim()) {
      return res.status(400).json({ error: "topic is required" });
    }

    const prompt = buildPrompt("music-concept", topic.trim());
    const concept = await generateText(prompt);

    res.json({
      topic,
      concept,
      note:
        "Free-tier audio rendering isn't available yet, so Zenith AI generated a full track concept instead. Plug a music model (e.g. Suno, Udio) into backend/routes/generate.js to render actual audio.",
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
