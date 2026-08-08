/**
 * Builds a Gemini prompt for each generation "mode" the frontend supports.
 * Keeping these in one place makes them easy to tune without touching
 * route logic.
 */
function buildPrompt(mode, topic, options = {}) {
  const tone = options.tone || "engaging";
  const platform = options.platform || "Instagram";
  const count = options.count || 5;

  switch (mode) {
    case "caption":
      return `Write ${count} short, ${tone} social media captions for ${platform} about: "${topic}".
Each caption should be scroll-stopping, under 220 characters, and end with a subtle call to action.
Return them as a numbered list only, no extra commentary.`;

    case "hashtag":
      return `Generate ${count * 4} relevant, high-reach hashtags for a ${platform} post about: "${topic}".
Mix broad, niche, and branded-style hashtags. Return them space-separated on a single line, all starting with #, no commentary.`;

    case "blog":
      return `Write a well-structured, ${tone} blog post about: "${topic}".
Include: an attention-grabbing title, a short intro, 3-5 subheadings with 2-3 short paragraphs each, and a concluding call to action.
Use markdown formatting (## for subheadings). Keep it around 500-700 words.`;

    case "script":
      return `Write a ${tone} short-form video script (for ${platform}, 30-60 seconds) about: "${topic}".
Format it as a numbered shot list with: [HOOK], [SCENE], [VOICEOVER/ON-SCREEN TEXT], and [CTA] labels. Keep each line punchy.`;

    case "story":
      return `Generate ${count} original short story ideas inspired by: "${topic}".
For each idea give: a Title, a one-line Logline, the Genre, and 2-3 sentences of Premise. Format as a numbered list with bold labels.`;

    case "movie":
      return `Generate ${count} original movie/film concept pitches inspired by: "${topic}".
For each give: Title, Genre, Logline (one sentence), Target Audience, and a short "Why it works" note. Format as a numbered list.`;

    case "content":
      return `Act as a content strategist. Generate ${count} content ideas for ${platform} around the topic: "${topic}".
For each idea include: a catchy Title/Hook, the Content Format (e.g. reel, carousel, thread, video), and one sentence on the Angle/why it will perform well. Format as a numbered list.`;

    case "image-prompt":
      return `Turn this rough idea into one vivid, highly detailed AI image-generation prompt (for a text-to-image model): "${topic}".
Describe subject, style, lighting, composition, color palette, and mood in a single dense paragraph, under 80 words. Return only the prompt text, nothing else.`;

    case "video-concept":
      return `Act as a film director. Build a video concept for: "${topic}".
Include: Title, Logline, Visual Style, a 5-shot Storyboard (numbered, one line each describing shot + camera move), Suggested Music/Mood, and estimated Duration. Format clearly with headings.`;

    case "music-concept":
      return `Act as a music producer. Build a track concept for: "${topic}".
Include: Track Title, Genre/Subgenre, Mood, Tempo (BPM range), Instrumentation, a short structural outline (Intro/Verse/Chorus/Bridge/Outro), and 4 lines of sample lyrical themes (not full lyrics). Format clearly with headings.`;

    default:
      throw Object.assign(new Error(`Unknown mode: ${mode}`), { status: 400 });
  }
}

module.exports = { buildPrompt };
