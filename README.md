# Zenith AI

A 3D, multi-modal AI content studio. One dashboard to generate **captions,
hashtags, blog posts, video scripts, story ideas, movie ideas, content
ideas, images, video concepts, and music concepts** — powered by Google
**Gemini's free API tier** plus the free, keyless **Pollinations.ai** image API.

```
zenith-ai/
├── frontend/          static site — plain HTML/CSS/JS + three.js (no build step)
│   ├── index.html
│   ├── css/style.css
│   └── js/
│       ├── three-scene.js   the 3D hero background
│       └── app.js           UI logic + calls to the backend
└── backend/            Node.js + Express API
    ├── server.js
    ├── routes/generate.js
    └── services/
        ├── gemini.js         Gemini text generation
        ├── prompts.js        prompt templates per mode
        └── pollinations.js   free image URL builder
```

## 1. Get a free Gemini API key

1. Go to **https://aistudio.google.com/app/apikey**
2. Sign in with a Google account and click **Create API key** — it's free,
   no credit card required, and comes with a generous daily free quota.
3. Copy the key.

## 2. Run the backend

```bash
cd backend
npm install
cp .env.example .env
# open .env and paste your key into GEMINI_API_KEY=
npm start
```

The API will be live at `http://localhost:5000`. Health check:
`GET http://localhost:5000/api/health`.

## 3. Run the frontend

The frontend is plain static files, so you can just open `frontend/index.html`
in a browser, or (recommended, avoids CORS quirks) serve it locally:

```bash
cd frontend
npx serve .
# or: python3 -m http.server 5500
```

Then visit the printed local URL (e.g. `http://localhost:5500`).

If your backend runs anywhere other than `http://localhost:5000/api`, set it
before `app.js` loads:

```html
<script>window.ZENITH_API_BASE = "https://your-backend-url.com/api";</script>
```

## What's real vs. simulated

| Feature | How it works |
|---|---|
| Captions, hashtags, blog, script, story/movie/content ideas | Live Gemini `gemini-1.5-flash` calls — fully real, fully free. |
| Images | Gemini writes a rich image prompt, then the free/keyless Pollinations.ai API renders it — fully real, fully free. |
| Video concepts | No free, keyless text-to-video API exists yet. Gemini generates a full director-ready storyboard/brief instead (shots, style, music cues, duration). Swap in a paid model (Veo, Runway, Pika...) inside `backend/routes/generate.js` once you have a key — the endpoint shape is already there. |
| Music concepts | Same reasoning — Gemini generates a full producer brief (genre, tempo, structure, lyrical themes) instead of rendering audio. Wire in Suno/Udio later if you upgrade. |

## Notes

- Rate limiting is enabled on the backend (30 requests/min per IP) to protect
  your free Gemini quota — tune it in `server.js`.
- Never commit your real `.env` file — `.gitignore` already excludes it.
- All API calls use **your own** free key; nothing is sent to Anthropic or
  billed anywhere beyond Google's free tier limits.
