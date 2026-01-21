import express from "express";
import cors from "cors";
import https from "https";
import pkg from "@tobyg74/tiktok-api-dl";

const { TiktokDL } = pkg;
const app = express();

/**
 * Railway PORT
 */
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

/**
 * Health check
 */
app.get("/", (req, res) => {
  res.json({
    status: "OK",
    service: "CU-Dev TikTok Backend is running 🚀"
  });
});

/**
 * Download TikTok (no watermark)
 * /download?url=https://www.tiktok.com/...
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
      return res.status(500).json({ error: "Failed to extract video" });
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    res.json({
      success: true,
      streamUrl: `${baseUrl}/stream?video=${encodeURIComponent(videoUrl)}`
    });

  } catch (err) {
    console.error("TikTok error:", err.message);
    res.status(500).json({ error: "Failed to fetch TikTok video" });
  }
});

/**
 * Stream MP4 (NO fetch, NO undici)
 */
app.get("/stream", (req, res) => {
  const { video } = req.query;

  if (!video) {
    return res.status(400).json({ error: "Video URL is required" });
  }

  res.setHeader(
    "Content-Disposition",
    "attachment; filename=cu-dev-tiktok.mp4"
  );
  res.setHeader("Content-Type", "video/mp4");

  https
    .get(video, (videoRes) => {
      videoRes.pipe(res);
    })
    .on("error", (err) => {
      console.error("Stream error:", err.message);
      res.status(500).end("Failed to stream video");
    });
});

/**
 * MUST bind 0.0.0.0 for Railway
 */
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});
