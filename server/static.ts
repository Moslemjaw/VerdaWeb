import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  // Try multiple possible paths for the build directory
  const possiblePaths = [
    path.resolve(__dirname, "public"),
    path.resolve(process.cwd(), "dist", "public"),
    path.resolve(process.cwd(), "public"),
  ];

  let distPath: string | null = null;
  for (const possiblePath of possiblePaths) {
    if (fs.existsSync(possiblePath)) {
      distPath = possiblePath;
      console.log(`✅ Found build directory at: ${distPath}`);
      break;
    }
  }

  if (!distPath) {
    console.error(`❌ Could not find build directory. Tried:`, possiblePaths);
    throw new Error(
      `Could not find the build directory. Make sure to build the client first with 'npm run build'`,
    );
  }

  app.use(express.static(distPath, {
    maxAge: '1y', // Cache static assets for 1 year
    etag: true,
  }));

  // fall through to index.html if the file doesn't exist (SPA routing)
  app.use("*", (req, res) => {
    const indexPath = path.resolve(distPath, "index.html");
    if (!fs.existsSync(indexPath)) {
      return res.status(404).send('Index.html not found. Make sure the client is built.');
    }
    res.sendFile(indexPath);
  });
}
