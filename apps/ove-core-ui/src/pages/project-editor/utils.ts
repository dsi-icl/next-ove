import { type Project, type Section } from "@prisma/client";

export const toProject = (project: Project, sections: Section[]) => {
  console.log(JSON.stringify({
    ...project,
    layout: sections
  }, undefined, 2));
};