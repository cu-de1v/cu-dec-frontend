import express from "express";
import cors from "cors";
import pkg from "@tobyg74/tiktok-api-dl";

const { TiktokDL } = pkg;

const app = express();

/**
 * ✅ Railway / Docker PORT
 */
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

/**
 * ✅ Health check (VERY IMPORTANT for Railway)
 */
app.get("/", (req, res) => {
  res.json({
    status: "OK",
    service: "CU-Dev TikTok Backend is running 🚀"
  });
});

/**
 * ✅ Download TikTok (no watermark)
 * Example:
 * /download?url=https://www.tiktok.com/...
 */
app.get("/download", async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({
      error: "TikTok URL is required"
    });
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

    /**
     * ✅ Dynamic base URL (local / railway)
     */
    const baseUrl = `${req.protocol}://${req.get("host")}`;

    res.json({
      success: true,
      streamUrl: `${baseUrl}/stream?video=${encodeURIComponent(videoUrl)}`
    });

  } catch (err) {
    console.error("❌ TikTok download error:", err.message);
    res.status(500).json({
      error: "Failed to fetch TikTok video"
    });
  }
});

/**
 * ✅ Stream MP4 to browser
 */
app.get("/stream", async (req, res) => {
  const { video } = req.query;

  if (!video) {
    return res.status(400).json({
      error: "Video URL is required"
    });
  }

  try {
    const response = await fetch(video);

    if (!response.ok || !response.body) {
      throw new Error("Video stream blocked or unavailable");
    }

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=cu-dev-tiktok.mp4"
    );
    res.setHeader("Content-Type", "video/mp4");

    response.body.pipe(res);

  } catch (err) {
    console.error("❌ Stream error:", err.message);
    res.status(500).json({
      error: "Failed to stream video"
    });
  }
});

/**
 * ✅ MUST bind 0.0.0.0 (Railway requirement)
 */
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});
