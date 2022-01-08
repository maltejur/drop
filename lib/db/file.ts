import { PrismaClient } from "@prisma/client";

export async function getPaste(dropSlug: string) {
  const prisma = new PrismaClient();
  const file = await prisma.file.findFirst({ where: { dropSlug } });
  prisma.$disconnect();
  return file;
}

export async function getFiles(dropSlug: string) {
  const prisma = new PrismaClient();
  const files = await prisma.file.findMany({ where: { dropSlug } });
  prisma.$disconnect();
  return files;
}

export async function getFileId(dropSlug: string, fileName: string) {
  const file = await getFile(dropSlug, fileName);
  return file.id;
}

export async function getFile(dropSlug: string, fileName: string) {
  const prisma = new PrismaClient();
  const file = await prisma.file.findFirst({
    where: { dropSlug, name: fileName },
  });
  prisma.$disconnect();
  return file;
}
export async function getFileById(id: string) {
  const prisma = new PrismaClient();
  const file = await prisma.file.findFirst({
    where: { id },
  });
  prisma.$disconnect();
  return file;
}
