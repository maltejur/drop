import fs from "fs";

export default function exists(path: fs.PathLike) {
  return new Promise<boolean>((resolve) => {
    fs.stat(path, (err) => {
      resolve(!err);
    });
  });
}
