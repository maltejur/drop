import { NextApiRequest, NextApiResponse } from "next";
import generateThumbnail from "lib/thumbnail";
import { getFileType } from "lib/files";
import { getFile } from "lib/db/file";
import fs from "fs";
import path from "path";

export default async function createDrop(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { dropSlug, fileName } = req.query as Record<string, string>;
  const file = await getFile(dropSlug, fileName);

  if (!file) {
    res.status(404).send("404 Not Found: File was not found");
    return;
  }

  const { mime } = await getFileType(file.dropSlug, file.name);
  const thumbnail = await generateThumbnail(file);

  res.setHeader("Cache-Control", "max-age=604800");
  if (thumbnail) {
    res.setHeader("Content-Type", "image/jpeg");
    res.send(thumbnail);
  } else {
    res.setHeader("Content-Type", "image/x-icon");
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
}
