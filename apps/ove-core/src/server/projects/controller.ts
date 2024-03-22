import { env } from "../../env";
import { type Controller } from "./router";
import { PrismaClient, type Project, type Section } from "@prisma/client";

const getProjectsForUser = async (prisma: PrismaClient, username: string) => {
  const user = await prisma.user.findUnique({
    where: {
      username
    }
  });

  return prisma.project.findMany({
    where: {
      OR: [
        {
          collaboratorIds: {
            hasSome: [user!.id]
          }
        },
        {
          creatorId: user!.id
        },
        {
          isPublic: true
        }
      ]
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
      id,
      OR: [{
        collaboratorIds: {
          hasSome: [user!.id]
        }
      }, {
        creatorId: user!.id
      }]
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

const saveNewProject = async (prisma: PrismaClient, project: Omit<Project, "id">) => {
  await prisma.project.create({ data: project });
};

const saveNewSection = async (prisma: PrismaClient, section: Omit<Section, "id">) => {
  await prisma.section.create({ data: section });
};

const saveExistingSection = async (prisma: PrismaClient, section: Section) => {
  const { id, ...data } = section;
  await prisma.section.update({ data, where: { id } });
};

const saveExistingProject = async (prisma: PrismaClient, project: Project) => {
  const { id, ...data } = project;
  await prisma.project.update({ data, where: { id } });
};

type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

const saveProject = async (prisma: PrismaClient, project: PartialBy<Project, "id"> & {
  layout: PartialBy<Section, "id">[]
}) => {
  await Promise.all(project.layout.map(async section => {
    if (section.id === undefined) {
      return saveNewSection(prisma, section);
    } else {
      return saveExistingSection(prisma, section as Section);
    }
  }));

  if (project.id === undefined) {
    await saveNewProject(prisma, project);
  } else {
    const { layout, ...project_ } = project;
    await saveExistingProject(prisma, project_ as Project);
  }
}

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
  saveProject,
  getFiles
};

export default controller;
