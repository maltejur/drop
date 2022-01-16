import { uploadDir } from "lib/files";
import { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import exists from "lib/exists";
import DOWNLOAD_URL from "lib/downloadUrl";

export default async function CheckArchive(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const slug = req.query.dropSlug.toString();

  const archiveLocation = path.join(uploadDir, slug, slug + ".zip");

  if (await exists(archiveLocation)) {
    res.send(`${DOWNLOAD_URL}/${slug}/${slug}.zip`);
    return;
  } else {
    res.status(404).send("404 Not Found: Archive not found");
  }
}
