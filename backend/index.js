import express from "express";
import cors from "cors";
import { exec } from "child_process";
import https from "https";

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
 * Get direct video URL using yt-dlp
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

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    res.json({
      success: true,
      streamUrl: `${baseUrl}/stream?video=${encodeURIComponent(videoUrl)}`
    });
  });
});

/**
 * Stream MP4 to browser
 */
app.get("/stream", (req, res) => {
  const { video } = req.query;

  if (!video) {
    return res.status(400).json({ error: "Video URL required" });
  }

  res.setHeader(
    "Content-Disposition",
    "attachment; filename=tiktok.mp4"
  );
  res.setHeader("Content-Type", "video/mp4");

  https.get(video, videoRes => {
    videoRes.pipe(res);
  }).on("error", () => {
    res.status(500).end("Stream error");
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});
