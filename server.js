require("dotenv").config();

const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const generateRouter = require("./generate");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN === "*" ? true : process.env.CLIENT_ORIGIN,
  })
);
app.use(express.json({ limit: "1mb" }));

// Basic protection against hammering the free Gemini quota.
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please slow down." },
});
app.use("/api/", limiter);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "zenith-ai-backend", time: new Date().toISOString() });
});

app.use("/api/generate", generateRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Central error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`⚡ Zenith AI backend running at http://localhost:${PORT}`);
});
