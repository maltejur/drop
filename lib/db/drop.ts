import { PrismaClient } from "@prisma/client";

export async function getDrop(slug: string) {
  const prisma = new PrismaClient();
  const drop = await prisma.drop.findUnique({ where: { slug } });
  prisma.$disconnect();
  return drop;
}
