import {PrismaClient} from "@prisma/client";

export const getProjectsForUser = async (prisma: PrismaClient, username: string) => {
  const user = await prisma.user.findUnique({
    where: {
      username
    }
  });

  const projects = await prisma.project.findMany({
    where: {
      collaboratorIds: {
        hasSome: [user!.id]
      }
    },
    include: {
      layout: true
    }
  });

  console.log(JSON.stringify(projects));

  return projects;
};
