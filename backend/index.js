import express from "express";
import cors from "cors";
import { exec } from "child_process";
import fs from "fs";
import path from "path";

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());

/**
 * Health check
 */
app.get("/", (req, res) => {
  res.json({
    status: "OK",
    service: "CU-Dev TikTok Backend (yt-dlp final) 🚀"
  });
});

/**
 * Download TikTok → REAL MP4 (video + audio merged)
 * Example:
 * /download?url=https://www.tiktok.com/@user/video/123...
 */
app.get("/download", (req, res) => {
  const { url } = req.query;
  if (!url) {
    return res.status(400).send("TikTok URL required");
  }

  const fileName = `tiktok-${Date.now()}.mp4`;
  const filePath = path.join("/tmp", fileName);

  /**
   * yt-dlp:
   * - bv*+ba/b  → best video + audio
   * - merge-output-format mp4 → playable file
   */
  const cmd = `yt-dlp \
    -f "bv*+ba/b" \
    --merge-output-format mp4 \
    -o "${filePath}" \
    "${url}"`;

  exec(cmd, { maxBuffer: 1024 * 1024 * 50 }, (err) => {
    if (err) {
      console.error("yt-dlp error:", err);
      return res.status(500).send("Failed to download TikTok video");
    }

    // Send real mp4 file to browser
    res.download(filePath, "tiktok.mp4", (downloadErr) => {
      if (downloadErr) {
        console.error("Download error:", downloadErr);
      }

      // Cleanup temp file
      fs.unlink(filePath, () => {});
    });
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});
