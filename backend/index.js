import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import pkg from "@tobyg74/tiktok-api-dl";

const { TiktokDL } = pkg;

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

/**
 * Health check
 */
app.get("/", (req, res) => {
  res.json({
    status: "OK",
    service: "CU-Dev Backend is running"
  });
});

/**
 * Download API
 * Example:
 * /download?url=https://www.tiktok.com/@user/video/xxxx
 */
app.get("/download", async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: "TikTok URL is required" });
  }

  try {
    const result = await TiktokDL(url, { version: "v1" });

    const videoUrl =
      result?.result?.video?.noWatermark ||
      result?.result?.video?.no_watermark;

    if (!videoUrl) {
      return res.status(500).json({
        error: "Failed to extract TikTok video"
      });
    }

    res.json({
      success: true,
      streamUrl: `http://localhost:${PORT}/stream?video=${encodeURIComponent(
        videoUrl
      )}`
    });

  } catch (err) {
    console.error("❌ TikTok fetch error:", err);
    res.status(500).json({
      error: "Failed to fetch TikTok video"
    });
  }
});

/**
 * Stream mp4 to browser (force download)
 */
app.get("/stream", async (req, res) => {
  const { video } = req.query;

  if (!video) {
    return res.status(400).json({ error: "Video URL is required" });
  }

  try {
    const response = await fetch(video);

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=cu-dev-tiktok.mp4"
    );
    res.setHeader("Content-Type", "video/mp4");

    response.body.pipe(res);

  } catch (err) {
    console.error("❌ Stream error:", err);
    res.status(500).json({ error: "Failed to stream video" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});
