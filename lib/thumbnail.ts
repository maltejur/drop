import sharp from "sharp";
import { getFileDir, getFileType } from "./files";
import pdfThumb from "pdf-thumbnail";
import fs from "fs";
import { File } from "@prisma/client";
import { exec } from "child_process";

export default async function generateThumbnail(file: File) {
  const { mime } = await getFileType(file.dropSlug, file.name);

  if (mime.split("/")[0] === "image") {
    return await sharp(getFileDir(file.dropSlug, file.name))
      .resize({
        width: 200,
        height: 200,
        fit: "contain",
        background: "#ffffff",
      })
      .toFormat("jpg")
      .toBuffer();
    // .then((data) => data.toString("base64url"));
  } else if (mime === "application/pdf") {
    return await pdfThumb(
      await fs.promises.readFile(getFileDir(file.dropSlug, file.name)),
      {
        crop: { width: 200, height: 200, x: 0, y: 0, ratio: true },
      }
    ).then(async (data) => {
      const chunks = [];
      for await (let chunk of data) {
        chunks.push(chunk);
      }
      return Buffer.concat(chunks);
    });
  } else if (mime.split("/")[0] === "video") {
    const tmpfile =
      "/tmp/" + Math.random().toString(36).substring(2, 15) + ".jpg";
    return new Promise((resolve, reject) => {
      exec(
        `ffmpeg -i '${getFileDir(
          file.dropSlug,
          file.name
        )}' -ss 00:00:01.000 -vf 'scale=200:200:force_original_aspect_ratio=decrease' -vframes 1 ${tmpfile}`,

        async (error) => {
          if (error) reject(error);
          else resolve(await fs.promises.readFile(tmpfile));
        }
      );
    });
  } else {
    return undefined;
  }
}
