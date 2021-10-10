import fs from "fs";

export default function exists(path: fs.PathLike) {
  return new Promise<boolean>((resolve) => {
    fs.promises
      .access(path)
      .then(() => resolve(true))
      .catch(() => resolve(false));
  });
}
