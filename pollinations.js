/**
 * Pollinations.ai (https://pollinations.ai) exposes a completely free,
 * keyless text-to-image endpoint. We don't need a backend call at all —
 * the URL itself IS the generated image — but we build it server-side
 * so the frontend never has to think about encoding/params, and so we
 * have one place to swap in a different provider later (e.g. Gemini's
 * Imagen models once you're on a billed tier).
 */
function buildImageUrl(prompt, { width = 1024, height = 1024, seed } = {}) {
  const encoded = encodeURIComponent(prompt);
  const finalSeed = seed ?? Math.floor(Math.random() * 1000000);
  return `https://image.pollinations.ai/prompt/${encoded}?width=${width}&height=${height}&seed=${finalSeed}&nologo=true`;
}

module.exports = { buildImageUrl };
