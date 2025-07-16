import type { PrismaClient } from ".prisma/client";

export const getUser = async (username: string, prisma: PrismaClient) =>
  await prisma.user.findUnique({
    where: {
      username,
    },
    select: {
      username: true,
      email: true,
      name: true,
      icon: true,
      role: true
    }
  });