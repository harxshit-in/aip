import express from "express";
import { createServer as createViteServer } from "vite";
import multer from "multer";
// @ts-ignore
import pdfParse from "pdf-parse";
import cors from "cors";

const upload = multer({ storage: multer.memoryStorage() });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // API routes
  app.post("/api/extract-pdf", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const data = await pdfParse(req.file.buffer);
      res.json({ text: data.text });
    } catch (error) {
      console.error("PDF extraction error:", error);
      res.status(500).json({ error: "Failed to extract text from PDF" });
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
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
