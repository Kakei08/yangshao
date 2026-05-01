import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import crypto from "crypto";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// In-memory cache for shared images (fallback)
const imageCache = new Map<string, Buffer>();

const s3Configured = Boolean(
  process.env.S3_ENDPOINT && 
  process.env.S3_REGION && 
  process.env.S3_BUCKET && 
  process.env.S3_ACCESS_KEY_ID && 
  process.env.S3_SECRET_ACCESS_KEY
);

const s3 = s3Configured ? new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.S3_REGION,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!
  }
}) : null;

const app = express();

async function startServer() {
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));

  // API to upload image and return an ID
  app.post("/api/share-image", async (req, res) => {
    try {
      const { image } = req.body;
      if (!image) {
        res.status(400).json({ error: "No image provided" });
        return;
      }

      const base64Data = image.replace(/^data:image\/png;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");
      const id = crypto.randomUUID();
      
      if (s3Configured && s3) {
        const command = new PutObjectCommand({
          Bucket: process.env.S3_BUCKET,
          Key: `shares/${id}.png`,
          Body: buffer,
          ContentType: "image/png"
        });
        await s3.send(command);
      } else {
        imageCache.set(id, buffer);
        console.warn('S3 not configured, storing image in memory (will be lost on restart)');
        setTimeout(() => {
          imageCache.delete(id);
        }, 1000 * 60 * 60 * 24); // Keep for 24 hours
      }

      res.json({ id });
    } catch (err) {
      console.error("Error sharing image:", err);
      res.status(500).json({ error: "Failed to share image" });
    }
  });

  // HTML page to view/download the image
  app.get("/share/:id", (req, res) => {
    const imgStr = req.params.id;
    // Serve a simple HTML page that displays the image so mobile devices can long-press or save
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <title>下载图片</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            font-family: sans-serif;
          }
          img {
            max-width: 90%;
            max-height: 80vh;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
          }
          p {
            margin-top: 20px;
            color: #666;
            font-size: 14px;
          }
          .download-btn {
            margin-top: 20px;
            padding: 12px 24px;
            background: #9F2B24;
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <img src="/api/image/${imgStr}" alt="Generated Image" />
        <p>长按图片保存，或点击下方按钮下载</p>
        <a class="download-btn" href="/api/image/${imgStr}" download="pattern.png">直接下载图片</a>
      </body>
      </html>
    `);
  });

  // API to fetch the raw image
  app.get("/api/image/:id", async (req, res) => {
    try {
      const id = req.params.id;
      
      if (s3Configured && s3) {
        const command = new GetObjectCommand({
          Bucket: process.env.S3_BUCKET,
          Key: `shares/${id}.png`
        });
        const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
        res.redirect(url);
      } else {
        const img = imageCache.get(id);
        if (img) {
          res.setHeader("Content-Type", "image/png");
          res.send(img);
        } else {
          res.status(404).send("Image not found (Memory cache missing or S3 not configured)");
        }
      }
    } catch (err) {
      console.error("Error fetching image:", err);
      res.status(404).send("Image not found");
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production setup (if any)
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}

startServer();

export default app;
