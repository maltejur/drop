import { getDrop } from "lib/db/drop";
import { uploadDir } from "lib/files";
import { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import exists from "lib/exists";
import { DOWNLOAD_URL } from "lib/downloadUrl";
import { exec } from "child_process";

export default async function Archive(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const drop = await getDrop(req.query.dropSlug.toString());

  const archiveLocation = path.join(uploadDir, drop.slug, drop.slug + ".zip");

  if (await exists(archiveLocation)) {
    res.send(`${DOWNLOAD_URL}/${drop.slug}/${drop.slug}.zip`);
    return;
  }

  return new Promise<void>((resolve) => {
    exec(
      `zip -r ${drop.slug}.zip .`,
      { cwd: path.join(uploadDir, drop.slug) },
      (err) => {
        if (err) {
          console.error(err);
          res
            .status(500)
            .send("500 Internal Server Error: Could not create archive");
          return;
        }

        res.send(`${DOWNLOAD_URL}/${drop.slug}/${drop.slug}.zip`);
        resolve();
      }
    );
  });
}
