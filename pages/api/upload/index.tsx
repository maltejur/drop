import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import os from "os";
import crypto from "crypto";
import parseDataUrl from "lib/parseDataUrl";
import exists from "lib/exists";
import { getFile, getFileById } from "lib/db/file";

const lock = new Set<string>();

const uploadDir = process.env.UPLOAD_LOCATION;
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

export default async function Upload(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { fileId, fileMd5, currentChunk, chunkSize, totalSize, totalChunks } =
    (() => {
      const { fileId, fileMd5, currentChunk, chunkSize, totalSize } = req.query;
      if (!fileId || !fileMd5 || !currentChunk || !chunkSize || !totalSize) {
        res.status(400).send("400 Bad Request");
        return;
      }
      return {
        fileId: fileId.toString(),
        fileMd5: fileMd5.toString(),
        currentChunk: Number.parseInt(currentChunk.toString()),
        chunkSize: Number.parseInt(chunkSize.toString()),
        totalSize: Number.parseInt(totalSize.toString()),
        totalChunks: Math.ceil(
          Number.parseInt(totalSize.toString()) /
            Number.parseInt(chunkSize.toString())
        ),
      };
    })();

  console.log(`${fileId}: receiving chunk ${currentChunk}/${totalChunks - 1}`);

  const tmpDir = path.join(os.tmpdir(), fileId);
  if (!(await exists(tmpDir)))
    await fs.promises.mkdir(tmpDir).catch((err) => {});

  // TODO:_ STONKS funktioniert, das ausprobieren
  await fs.promises.writeFile(
    path.join(tmpDir, currentChunk.toString().padStart(16, "0")),
    parseDataUrl(req.body).toBuffer()
  );

  let uploadedChunks: string[] = [];
  (await fs.promises.readdir(tmpDir)).forEach((file) => {
    uploadedChunks.push(path.join(tmpDir, file));
  });

  if (uploadedChunks.length >= totalChunks) {
    if (lock.has(tmpDir)) {
      res.status(202).end();
      return;
    }
    lock.add(tmpDir);

    console.log(`${fileId}: all chunks uploaded, merging chunks`);

    const { dropSlug, name } = await getFileById(fileId);
    const directory = path.join(uploadDir, dropSlug);
    const filename = path.join(directory, name);
    await fs.promises.mkdir(directory, { recursive: true });

    uploadedChunks.sort();
    let md5 = crypto.createHash("md5");
    for (const file of uploadedChunks) {
      const chunkContent = await fs.promises.readFile(file);
      await fs.promises.appendFile(filename, chunkContent);
      md5.update(chunkContent);
    }

    const md5Digest = md5.digest("hex");
    if (md5Digest !== fileMd5) {
      res
        .status(500)
        .send("500 Internal Server Error: checksums did not match");
      console.error(
        `${fileId}: checksums did not match, client: ${fileMd5}, server: ${md5Digest}`
      );
      return;
    }

    console.log(`${fileId}: merged chunks`);

    res.status(200).end();
  } else {
    res.status(202).end();
  }
}
