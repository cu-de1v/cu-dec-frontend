import express from "express";
import cors from "cors";
import { exec } from "child_process";

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());

/**
 * Health check
 */
app.get("/", (req, res) => {
  res.json({
    status: "OK",
    service: "CU-Dev TikTok Backend (yt-dlp) 🚀"
  });
});

/**
 * Download TikTok (REDIRECT – NO STREAM)
 * /download?url=https://www.tiktok.com/...
 */
app.get("/download", (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: "TikTok URL is required" });
  }

  // yt-dlp: get direct mp4 URL
  const cmd = `yt-dlp -f mp4 -g "${url}"`;

  exec(cmd, (err, stdout, stderr) => {
    if (err || !stdout) {
      console.error("yt-dlp error:", stderr || err);
      return res.status(500).json({ error: "Failed to extract video" });
    }

    const videoUrl = stdout.trim();

    // 🔥 REDIRECT browser to real video URL (BEST PRACTICE)
    res.redirect(videoUrl);
  });
});

/**
 * Start server
 */
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});
