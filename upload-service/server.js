import express from "express";
import multer from "multer";
import cors from "cors";
import fetch from "node-fetch";

const app = express();

app.use(cors());

const upload = multer({
  limits: {
    fileSize: 5 * 1024 * 1024 * 1024, // 5GB
  },
});

const PORT = process.env.PORT || 8080;

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "NiaTube Upload Service Running",
  });
});

app.post("/upload", upload.single("file"), async (req, res) => {
    console.log("Upload request received");
console.log("Title:", req.body?.title);
console.log("File received:", req.file?.originalname);
console.log("File size:", req.file?.size);
  try {
    const libraryId = process.env.BUNNY_STREAM_LIBRARY_ID;
    const apiKey = process.env.BUNNY_STREAM_API_KEY;

    if (!libraryId || !apiKey) {
      return res.status(500).json({
        error: "Missing Bunny environment variables.",
      });
    }

    const title = req.body.title;
    const file = req.file;

    if (!title || !file) {
      return res.status(400).json({
        error: "Title and video file are required.",
      });
    }

    // Step 1 — Create Bunny video
    const createRes = await fetch(
      `https://video.bunnycdn.com/library/${libraryId}/videos`,
      {
        method: "POST",
        headers: {
          AccessKey: apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title }),
      }
    );

    const createText = await createRes.text();

    if (!createRes.ok) {
      return res.status(500).json({
        error: "Bunny create video failed.",
        details: createText,
      });
    }

    const createdVideo = JSON.parse(createText);

    const videoId = createdVideo.guid;

    if (!videoId) {
      return res.status(500).json({
        error: "Bunny did not return video ID.",
      });
    }

    // Step 2 — Upload actual file to Bunny
    const uploadRes = await fetch(
      `https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`,
      {
        method: "PUT",
        headers: {
          AccessKey: apiKey,
          "Content-Type": "application/octet-stream",
        },
        body: file.buffer,
      }
    );

    const uploadText = await uploadRes.text();

    if (!uploadRes.ok) {
      return res.status(500).json({
        error: "Bunny upload failed.",
        details: uploadText,
      });
    }

    return res.json({
      success: true,
      videoId,
      playbackUrl: `https://iframe.mediadelivery.net/play/${libraryId}/${videoId}`,
      embedUrl: `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}`,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Upload service failed.",
      details: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Upload service running on port ${PORT}`);
});