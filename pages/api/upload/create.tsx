import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import { PrismaClient } from "@prisma/client";

const uploadDir = process.env.UPLOAD_LOCATION;
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

export default async function createDrop(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { dropSlug, name, fileSize } = (() => {
    const { dropSlug, name, fileSize } = req.query;
    if (!dropSlug || !name || !fileSize) {
      res.status(400).send("400 Bad Request");
      return;
    }
    return {
      dropSlug: dropSlug.toString(),
      name: name.toString(),
      fileSize: Number.parseInt(fileSize.toString()),
    };
  })();

  const prisma = new PrismaClient();

  const drop = await prisma.drop.findUnique({ where: { slug: dropSlug } });
  if (!drop) {
    res.status(400).send("400 Bad Request: Drop does not exist");
    return;
  }
  const file = await prisma.file.create({
    data: { dropSlug, name, size: fileSize },
  });
  res.send(file.id);
}
