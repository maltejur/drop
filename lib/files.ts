import fs from "fs";
import path from "path";
import { fileTypeFromFile } from "file-type";

const uploadDir = process.env.UPLOAD_LOCATION;

export function getFileDir(dropSlug: string, fileId: string) {
  return path.join(uploadDir, dropSlug, fileId);
}

export async function getFileType(dropSlug: string, fileId: string) {
  const type = await fileTypeFromFile(getFileDir(dropSlug, fileId));
  return (
    type || {
      mime: "text/plain",
    }
  );
}

export function getFile(dropSlug: string, fileId: string) {
  return fs.promises.readFile(getFileDir(dropSlug, fileId));
}
