import sharp from "sharp";
import { getFileDir, getFileType } from "./files";
import pdfThumb from "pdf-thumbnail";
import fs from "fs";

export default async function generateThumbnail(fileId: string) {
  const { mime } = await getFileType(fileId);

  if (mime.split("/")[0] === "image") {
    return await sharp(getFileDir(fileId))
      .resize({ width: 200, height: 200, fit: "contain" })
      .toFormat("jpg")
      .toBuffer();
    // .then((data) => data.toString("base64url"));
  } else if (mime === "application/pdf") {
    return await pdfThumb(await fs.promises.readFile(getFileDir(fileId)), {
      crop: { width: 200, height: 200, x: 0, y: 0, ratio: true },
    }).then(async (data) => {
      const chunks = [];
      for await (let chunk of data) {
        chunks.push(chunk);
      }
      return Buffer.concat(chunks);
    });
  } else {
    return undefined;
  }
}
