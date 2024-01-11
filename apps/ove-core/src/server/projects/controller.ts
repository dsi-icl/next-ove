import { env } from "../../env";
import { type Controller } from "./router";
import { PrismaClient } from "@prisma/client";

const getProjectsForUser = async (prisma: PrismaClient, username: string) => {
  const user = await prisma.user.findUnique({
    where: {
      username
    }
  });

  return prisma.project.findMany({
    where: {
      collaboratorIds: {
        hasSome: [user!.id]
      }
    },
    include: {
      layout: true
    }
  });
};

const getProject = async (
  prisma: PrismaClient,
  username: string,
  id: string
) => {
  const user = await prisma.user.findUnique({ where: { username } });

  return prisma.project.findUnique({
    where: {
      collaboratorIds: {
        hasSome: [user!.id]
      },
      id
    },
    include: {
      layout: true
    }
  });
};

const getTagsForUser = async (prisma: PrismaClient, username: string) => {
  const projects = await getProjectsForUser(prisma, username);
  return projects.flatMap(({ tags }) => tags);
};

const getUsers = async (prisma: PrismaClient) => prisma.user.findMany();

const getInvitesForProject = async (prisma: PrismaClient, projectId: string) =>
  prisma.invite.findMany({
    where: {
      projectId
    }
  });

const getGlobalFiles = async (): ReturnType<Controller["getFiles"]> => {
  // TODO: implement
  if (env.NODE_ENV === "production") throw new Error("NOT IMPLEMENTED");
  return [];
};

const getFiles = async () => {
  // TODO: implement
  if (env.NODE_ENV === "production") throw new Error("NOT IMPLEMENTED");
  return (await getGlobalFiles()).map(x => ({
    ...x,
    isGlobal: true,
    useLatest: false
  })).concat([]);
};

const controller: Controller = {
  getProjectsForUser,
  getProject,
  getTagsForUser,
  getUsers,
  getInvitesForProject,
  getFiles
};

export default controller;
