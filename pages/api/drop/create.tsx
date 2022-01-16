import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import { validateSlug } from "lib/validate";
import { Drop, PrismaClient } from "@prisma/client";

const uploadDir = process.env.UPLOAD_LOCATION;
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

export default async function createDrop(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { slug, name, type, url, expires } = (() => {
    const { slug, name, type, url, expires } = req.query;
    if (!slug || !type) {
      res.status(400).send("400 Bad Request");
      return;
    }
    console.log(expires);
    return {
      slug: slug.toString(),
      name: name?.toString(),
      type: type.toString(),
      url: url?.toString(),
      expires: expires && new Date(Number(expires?.toString())),
    };
  })();

  if (!validateSlug(slug)) {
    res.status(400).send("400 Bad Request: Ivalid slug");
    return;
  }

  const prisma = new PrismaClient();

  const existingDrop = await prisma.drop.findUnique({ where: { slug } });

  if (existingDrop) {
    res.send(existingDrop.slug);
    return;
  }

  console.log(expires);

  let drop: Drop;
  switch (type) {
    case "redirect":
      if (!url) {
        res.status(400).send("400 Bad Request");
        return;
      }
      drop = await prisma.drop.create({
        data: { slug, name, type, url, expires },
      });
      res.send(drop.slug);
      return;

    case "paste":
      drop = await prisma.drop.create({ data: { slug, name, type, expires } });
      res.send(drop.slug);
      return;

    case "files":
      drop = await prisma.drop.create({ data: { slug, name, type, expires } });
      res.send(drop.slug);
      return;

    default:
      res.status(400).send("400 Bad Request: Invalid type");
      return;
  }
}
