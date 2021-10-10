import fs from "fs";
import path from "path";
import FileType from "file-type";

const uploadDir = process.env.UPLOAD_LOCATION;

export function getFileDir(id: string) {
  return path.join(uploadDir, id);
}

export async function getFileType(id: string) {
  const type = await FileType.fromFile(getFileDir(id));
  return (
    type || {
      mime: "text/plain",
    }
  );
}

export function getFile(id: string) {
  return fs.promises.readFile(getFileDir(id));
}
