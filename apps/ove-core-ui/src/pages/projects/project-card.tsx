import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@ove/ui-base-components";
import type { Project, User } from "@prisma/client";

type ProjectCardProps = {
  user: User
  project: Project
  openDialog: () => void
}

const limitText = (text: string, limit: number) => text.length > limit ? `${text.slice(0, limit)}…` : text;

const ProjectCard = ({
  user,
  project,
  openDialog
}: ProjectCardProps) => {
  const navigate = useNavigate();
  const canEdit = user.role === "admin" ||
    ((user.id === project.creatorId ||
      project.collaboratorIds.includes(user.id)) && user.role !== "client");

  return <li key={project.title} className="p-3 max-w-[calc(1.5rem + 256px)] rounded-xl border-[1px] border-gray-200">
    <img className="w-full aspect-square rounded-xl" src={project.thumbnail ?? "/missing-thumbnail.jpg"}
         alt={`Thumbnail for ${project.title}`} />
    <h4 className="text-black mt-2 font-bold">{project.title}</h4>
    <p className="text-black mt-1">{limitText(project.description, 140)}</p>
    <div className="flex justify-between mt-2">
      {canEdit ? <Button
        className="rounded-r-none w-full"
        variant="outline"
        onClick={() => navigate(`/project-editor?project=${project.id}`)}>
        EDIT
      </Button> : null}
      <Button onClick={openDialog} className="rounded-l-none w-full">
        LAUNCH
      </Button>
    </div>
  </li>;
};

export default ProjectCard;
