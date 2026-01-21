import express from "express";
import cors from "cors";
import { exec } from "child_process";

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());

app.get("/", (req, res) => {
  res.json({
    status: "OK",
    service: "CU-Dev TikTok Backend (yt-dlp) 🚀"
  });
});

/**
 * DOWNLOAD → REDIRECT (NO STREAM)
 */
app.get("/download", (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).send("URL required");

  // 🔥 BEST yt-dlp FORMAT (IMPORTANT)
  const cmd = `yt-dlp -f "bv*+ba/b" -g "${url}"`;

  exec(cmd, (err, stdout, stderr) => {
    if (err || !stdout) {
      console.error("yt-dlp error:", stderr || err);
      return res.status(500).send("Failed to download TikTok video");
    }

    // yt-dlp may return multiple URLs → take first
    const videoUrl = stdout.trim().split("\n")[0];

    // ✅ REDIRECT browser to TikTok CDN
    res.redirect(videoUrl);
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});
