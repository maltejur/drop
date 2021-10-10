import fs from "fs";
import dotenv from "dotenv";
import path from "path";
import express from "express";
import { getFile } from "../lib/db/file";
import generateThumbnail from "../lib/thumbnail";
import { getFileDir, getFileType } from "../lib/files";

dotenv.config();
const bindPort = process.env.FILES_PORT || 3051;
const uploadDir = process.env.UPLOAD_LOCATION;
const app = express();

app.get("/file/:dropSlug/:fileName", async (req, res) => {
  const { dropSlug, fileName } = req.params as Record<string, string>;
  const file = await getFile(dropSlug, fileName);
  if (!file) {
    return res
      .type("text/plain")
      .status(404)
      .send("404 Not Found: The file could not be found");
  }
  const stream = fs.createReadStream(path.join(uploadDir, file.id), {
    highWaterMark: 64 * 1024,
  });
  if (!req.query.view) res.attachment(file.name);
  stream.pipe(res);
});

app.get("/thumbnail/:dropSlug/:fileName", async (req, res) => {
  const { dropSlug, fileName } = req.params as Record<string, string>;
  const file = await getFile(dropSlug, fileName);

  if (!file) {
    res.status(404).send("404 Not Found: File was not found");
    return;
  }

  const { mime } = await getFileType(file.id);
  const thumbnail = await generateThumbnail(file.id);

  if (thumbnail) {
    res.send(thumbnail);
  } else {
    res.type("image/x-icon");
    if (mime.startsWith("text") && file.size < 10000)
      res.send(
        await fs.promises.readFile(path.join("public", "imageres_19.ico"))
      );
    else if (
      ["zip", "7z", "xz", "gz", "tar", "rar"].includes(
        fileName.split(".").pop()
      )
    )
      res.send(
        await fs.promises.readFile(path.join("public", "imageres_174.ico"))
      );
    else if (fileName.endsWith(".exe"))
      res.send(
        await fs.promises.readFile(path.join("public", "imageres_15.ico"))
      );
    else
      res.send(
        await fs.promises.readFile(path.join("public", "shell32_1.ico"))
      );
  }
});

app.listen(bindPort, () => {
  console.log(`File server listening on http://localhost:${bindPort}`);
});

export {};
