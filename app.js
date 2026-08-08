(function () {
  "use strict";

  // ----------------------------------------------------------------
  // Config — point this at your running backend.
  // ----------------------------------------------------------------
  const API_BASE = "https://infinity-loop-6yal.onrender.com/api";
  // ----------------------------------------------------------------
  // Nav background on scroll
  // ----------------------------------------------------------------
  const nav = document.getElementById("nav");
  window.addEventListener("scroll", () => {
    nav.classList.toggle("scrolled", window.scrollY > 40);
  });

  // ----------------------------------------------------------------
  // Mode selection (capability cards + mode rail stay in sync)
  // ----------------------------------------------------------------
  const modeRail = document.getElementById("mode-rail");
  const modeButtons = Array.from(modeRail.querySelectorAll(".mode-btn"));
  const capCards = Array.from(document.querySelectorAll(".cap-card"));
  const textOptions = document.getElementById("text-options");
  const topicInput = document.getElementById("topic-input");
  const outputModeTag = document.getElementById("output-mode-tag");

  const MODE_LABELS = {
    caption: "Caption",
    hashtag: "Hashtag",
    blog: "Blog post",
    script: "Video script",
    story: "Story idea",
    movie: "Movie idea",
    content: "Content idea",
    image: "Image",
    video: "Video concept",
    music: "Music concept",
  };

  const MODE_PLACEHOLDERS = {
    caption: "e.g. a solo backpacking trip through the Himalayas",
    hashtag: "e.g. a new plant-based protein bar launch",
    blog: "e.g. why remote teams struggle with async communication",
    script: "e.g. 3 morning habits that changed my focus",
    story: "e.g. a lighthouse keeper who receives messages from the future",
    movie: "e.g. two rival chefs forced to run one food truck",
    content: "e.g. a solo indie game developer's devlog channel",
    image: "e.g. a neon-lit cyberpunk marketplace at night, rain-soaked streets",
    video: "e.g. a 30-second ad for a minimalist smartwatch",
    music: "e.g. a lo-fi track for late-night studying",
  };

  const TEXT_MODES = new Set(["caption", "hashtag", "blog", "script", "story", "movie", "content"]);

  let currentMode = "caption";

  function setMode(mode) {
    currentMode = mode;
    modeButtons.forEach((btn) =>
      btn.classList.toggle("is-active", btn.dataset.mode === mode)
    );
    textOptions.style.display = TEXT_MODES.has(mode) ? "flex" : "none";
    topicInput.placeholder = MODE_PLACEHOLDERS[mode] || "Describe your idea...";
    outputModeTag.textContent = MODE_LABELS[mode] || mode;
  }

  modeButtons.forEach((btn) => {
    btn.addEventListener("click", () => setMode(btn.dataset.mode));
  });

  capCards.forEach((card) => {
    card.addEventListener("click", () => {
      setMode(card.dataset.mode);
      document.getElementById("studio").scrollIntoView({ behavior: "smooth" });
      topicInput.focus();
    });
  });

  setMode(currentMode);

  // ----------------------------------------------------------------
  // Form submit -> call backend
  // ----------------------------------------------------------------
  const form = document.getElementById("studio-form");
  const generateBtn = document.getElementById("generate-btn");
  const outputEmpty = document.getElementById("output-empty");
  const outputResult = document.getElementById("output-result");
  const outputBody = document.getElementById("output-body");
  const outputNote = document.getElementById("output-note");
  const outputError = document.getElementById("output-error");
  const copyBtn = document.getElementById("copy-btn");

  function setLoading(isLoading) {
    generateBtn.classList.toggle("is-loading", isLoading);
    generateBtn.disabled = isLoading;
  }

  function showError(message) {
    outputError.hidden = false;
    outputError.textContent = message;
    outputResult.hidden = true;
    outputEmpty.hidden = true;
  }

  function showResult({ bodyHtml, note }) {
    outputError.hidden = true;
    outputEmpty.hidden = true;
    outputResult.hidden = false;
    outputBody.innerHTML = bodyHtml;
    if (note) {
      outputNote.hidden = false;
      outputNote.textContent = note;
    } else {
      outputNote.hidden = true;
    }
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  async function callApi(path, payload) {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || `Request failed (${res.status})`);
    }
    return data;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const topic = topicInput.value.trim();
    if (!topic) return;

    setLoading(true);

    try {
      if (TEXT_MODES.has(currentMode)) {
        const tone = document.getElementById("tone-input").value;
        const platform = document.getElementById("platform-input").value;
        const count = Number(document.getElementById("count-input").value) || 5;

        const data = await callApi("/generate/text", {
          mode: currentMode,
          topic,
          tone,
          platform,
          count,
        });
        showResult({ bodyHtml: escapeHtml(data.result) });
      } else if (currentMode === "image") {
        const data = await callApi("/generate/image", { topic });
        const html = `
          <img src="${data.imageUrl}" alt="${escapeHtml(topic)}" loading="lazy" />
          <p style="margin-top:14px;color:var(--mist);font-size:13px;">
            <strong style="color:var(--paper);">Prompt used:</strong> ${escapeHtml(data.enhancedPrompt)}
          </p>`;
        showResult({ bodyHtml: html });
      } else if (currentMode === "video") {
        const data = await callApi("/generate/video", { topic });
        showResult({ bodyHtml: escapeHtml(data.concept), note: data.note });
      } else if (currentMode === "music") {
        const data = await callApi("/generate/music", { topic });
        showResult({ bodyHtml: escapeHtml(data.concept), note: data.note });
      }
    } catch (err) {
      showError(
        err.message ||
          "Something went wrong. Make sure the backend is running and your GEMINI_API_KEY is set."
      );
    } finally {
      setLoading(false);
    }
  });

  copyBtn.addEventListener("click", () => {
    const text = outputBody.innerText;
    navigator.clipboard.writeText(text).then(() => {
      const original = copyBtn.textContent;
      copyBtn.textContent = "Copied!";
      setTimeout(() => (copyBtn.textContent = original), 1500);
    });
  });
})();
