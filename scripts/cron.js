const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config();
const uploadDir = process.env.UPLOAD_LOCATION;

const prisma = new PrismaClient();

prisma.drop
  .findMany({ where: { expires: { lt: new Date() } } })
  .then((drops) => {
    drops.forEach(async (drop) => {
      console.log(
        `Deleting drop ${drop.slug} (expired ${(
          (Date.now() - drop.expires.getTime()) /
          1000
        ).toFixed(0)}s ago)`,
      );
      const files = await prisma.file.findMany({
        where: { dropSlug: drop.slug },
      });
      await fs.promises.rm(path.join(uploadDir, drop.slug), {
        force: true,
        recursive: true,
      });
      await Promise.all(
        files.map(async (file) => {
          await prisma.file.delete({ where: { id: file.id } });
        }),
      );
      await prisma.drop.delete({ where: { slug: drop.slug } });
    });
  });
